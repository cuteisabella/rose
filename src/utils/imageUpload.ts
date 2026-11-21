import { resolveAssetUrl } from '../defaultStore';

export interface ImageOptimizeOptions {
  maxDimension?: number;
  quality?: number;
  maxChars?: number;
}

const DEFAULT_MAX_DIMENSION = 1120;
const DEFAULT_QUALITY = 0.78;
const DEFAULT_MAX_CHARS = 95_000;

/**
 * Normalizes and optimizes supported direct cloud image links (Cloudinary, Google Drive)
 * so remote assets download at crisp display dimensions instead of multi-megabyte originals.
 */
export function optimizeLinkedAssetUrl(rawUrl?: string, fallback: string = ''): string {
  const resolved = resolveAssetUrl(rawUrl, fallback);
  if (!resolved || resolved.startsWith('data:') || resolved.startsWith('blob:')) {
    return resolved;
  }

  try {
    const parsed = new URL(resolved);
    const host = parsed.hostname.toLowerCase();

    if (host === 'res.cloudinary.com' && parsed.pathname.includes('/image/upload/')) {
      const marker = '/image/upload/';
      const idx = parsed.pathname.indexOf(marker);
      const after = parsed.pathname.slice(idx + marker.length);
      if (!after.startsWith('f_') && !after.startsWith('q_') && !after.startsWith('w_')) {
        parsed.pathname = `${parsed.pathname.slice(0, idx + marker.length)}f_auto,q_auto,w_1200/${after}`;
        return parsed.toString();
      }
    }

    if (host === 'lh3.googleusercontent.com' && parsed.pathname.startsWith('/d/') && !resolved.includes('=w')) {
      return `${resolved}=w1200`;
    }

    return resolved;
  } catch {
    return resolved;
  }
}

function renderCompressedCanvas(
  img: HTMLImageElement,
  fallbackUrl: string,
  options?: ImageOptimizeOptions
): string {
  const maxDimension = options?.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const quality = options?.quality ?? DEFAULT_QUALITY;
  const maxChars = options?.maxChars ?? DEFAULT_MAX_CHARS;

  const renderAt = (dimLimit: number, q: number): string => {
    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;

    if (!width || !height) return fallbackUrl;

    if (width > dimLimit || height > dimLimit) {
      const ratio = Math.min(dimLimit / width, dimLimit / height);
      width = Math.max(1, Math.round(width * ratio));
      height = Math.max(1, Math.round(height * ratio));
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return fallbackUrl;
    ctx.drawImage(img, 0, 0, width, height);

    const webpUrl = canvas.toDataURL('image/webp', q);
    return webpUrl.startsWith('data:image/webp')
      ? webpUrl
      : canvas.toDataURL('image/jpeg', q);
  };

  let compressed = renderAt(maxDimension, quality);
  if (compressed.length > maxChars) {
    compressed = renderAt(Math.min(maxDimension, 920), 0.68);
  }
  if (compressed.length > maxChars) {
    compressed = renderAt(760, 0.58);
  }
  if (compressed.length > 260_000) {
    compressed = renderAt(560, 0.48);
  }

  return compressed;
}

export function compressImageFileToDataUrl(
  file: File,
  onLoaded: (dataUrl: string) => void,
  maxDimension: number = DEFAULT_MAX_DIMENSION,
  quality: number = DEFAULT_QUALITY
): void {
  const reader = new FileReader();
  reader.onload = () => {
    const rawResult = reader.result;
    if (typeof rawResult !== 'string') return;

    // Keep tiny images or SVGs untouched
    if (file.type === 'image/svg+xml' || rawResult.length < 70_000) {
      onLoaded(rawResult);
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        onLoaded(
          renderCompressedCanvas(img, rawResult, {
            maxDimension,
            quality,
            maxChars: 110_000
          })
        );
      } catch {
        onLoaded(rawResult);
      }
    };
    img.onerror = () => onLoaded(rawResult);
    img.src = rawResult;
  };
  reader.readAsDataURL(file);
}

/**
 * Optimizes any user-uploaded data URL or linked external/relative image URL.
 * - Normalizes CDN URLs for optimal dimensions and format.
 * - Compresses oversized data URIs and CORS-accessible assets into compact WebP/JPEG data URIs.
 * - Gracefully falls back to the CDN-normalized URL if CORS restricts pixel extraction.
 */
export function compressImageSource(
  rawSource: string,
  options?: ImageOptimizeOptions
): Promise<string> {
  const normalized = optimizeLinkedAssetUrl(rawSource);
  if (!normalized) return Promise.resolve('');

  // Keep SVG assets and already-compact data URIs untouched
  if (normalized.startsWith('data:image/svg+xml')) {
    return Promise.resolve(normalized);
  }
  if (normalized.startsWith('data:image/') && normalized.length < 65_000) {
    return Promise.resolve(normalized);
  }

  // Only attempt client-side canvas re-compression for data URIs or likely complete URLs
  const isHttp = /^https?:\/\//i.test(normalized);
  const isRelative = normalized.startsWith('/');
  if (!normalized.startsWith('data:image/') && !isHttp && !isRelative) {
    return Promise.resolve(normalized);
  }

  // External HTTP(S) URLs that already point to an optimized CDN URL stay lightweight as URLs
  // unless we want to keep them compact; try canvas compression only for data URIs or unoptimized links,
  // preserving CDN URLs when CORS disallows canvas read.
  return new Promise((resolve) => {
    let settled = false;
    const finish = (val: string) => {
      if (settled) return;
      settled = true;
      resolve(val);
    };

    const timeout = setTimeout(() => finish(normalized), 4000);
    const img = new Image();
    if (!normalized.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      clearTimeout(timeout);
      try {
        // For external CDN links that are already tiny URLs (< 500 chars) and high-perf CDNs,
        // avoid bloating Firestore with base64 unless it's a huge raw asset or data URL
        const isOptimizedCdn =
          isHttp &&
          (normalized.includes('res.cloudinary.com') ||
            normalized.includes('lh3.googleusercontent.com'));

        if (isOptimizedCdn) {
          finish(normalized);
          return;
        }

        const compressed = renderCompressedCanvas(img, normalized, options);
        // Only swap an HTTP URL for a data URI if the compressed result fits cleanly (< maxChars)
        if (normalized.startsWith('data:')) {
          finish(compressed.length < normalized.length ? compressed : normalized);
        } else if (compressed.length <= (options?.maxChars ?? DEFAULT_MAX_CHARS)) {
          finish(compressed);
        } else {
          finish(normalized);
        }
      } catch {
        // CORS taint or canvas restriction -> fall back to CDN-optimized URL
        finish(normalized);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      finish(normalized);
    };

    img.src = normalized;
  });
}
