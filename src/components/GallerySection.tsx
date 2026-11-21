import React, { useEffect, useMemo, useState } from 'react';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Flame,
  Image as ImageIcon,
  Maximize2,
  X
} from 'lucide-react';
import {
  GALLERY_CATEGORIES,
  GalleryCategory,
  GalleryPhotoItem,
  getResolvedGalleryPhotos
} from '../galleryData';
import { SiteSettings } from '../types';

interface GallerySectionProps {
  settings: SiteSettings;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ settings }) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | GalleryCategory>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [failedSrcs, setFailedSrcs] = useState<Record<string, boolean>>({});

  const visiblePhotos = useMemo<GalleryPhotoItem[]>(() => {
    return getResolvedGalleryPhotos(settings);
  }, [settings]);

  const featuredHotPhotos = useMemo(
    () => visiblePhotos.filter((photo) => photo.featured),
    [visiblePhotos]
  );

  const filteredPhotos = useMemo(() => {
    if (selectedCategory === 'All') return visiblePhotos;
    if (selectedCategory === 'Featured Hot') return featuredHotPhotos;
    return visiblePhotos.filter((photo) => photo.category === selectedCategory);
  }, [featuredHotPhotos, selectedCategory, visiblePhotos]);

  const activePhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] || null : null;

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null || filteredPhotos.length === 0 ? null : (prev + 1) % filteredPhotos.length
        );
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null || filteredPhotos.length === 0
            ? null
            : (prev - 1 + filteredPhotos.length) % filteredPhotos.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [filteredPhotos.length, lightboxIndex]);

  const markFailed = (src: string) => {
    setFailedSrcs((prev) => (prev[src] ? prev : { ...prev, [src]: true }));
  };

  const openPhotoInAll = (photo: GalleryPhotoItem) => {
    const idxInFiltered = filteredPhotos.findIndex((p) => p.id === photo.id);
    if (idxInFiltered >= 0) {
      setLightboxIndex(idxInFiltered);
      return;
    }
    setSelectedCategory('All');
    const idxInAll = visiblePhotos.findIndex((p) => p.id === photo.id);
    setLightboxIndex(idxInAll >= 0 ? idxInAll : 0);
  };

  return (
    <section
      id="gallery"
      className="py-20 bg-gradient-to-b from-[#09080b] via-[#130b1c] to-[#09080b] min-h-[80vh]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header & Editorial Intro */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-stone-800/80 pb-8">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs text-[#e5b36b] uppercase tracking-widest font-semibold">
              <Camera className="w-4 h-4 text-[#e5b36b]" />
              <span>Private Photography Archive</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif-display font-bold text-white tracking-tight text-balance">
              Isabella Rose <span className="rose-gold-gradient">Photography Gallery</span>
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed">
              Every curated studio portrait, midnight penthouse editorial, Parisian street lookbook,
              and luminous close-up from Isabella’s personal archive in full high resolution.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-stone-400 shrink-0">
            <div>
              <span className="block text-xl font-serif-display font-bold text-white tabular-nums">
                {visiblePhotos.length}
              </span>
              <span>Curated Stills</span>
            </div>
            <div className="h-8 w-px bg-stone-800" aria-hidden="true" />
            <div>
              <span className="block text-xl font-serif-display font-bold text-[#e5b36b] tabular-nums">
                {featuredHotPhotos.length}
              </span>
              <span>Featured Selects</span>
            </div>
          </div>
        </div>

        {/* Featured Hot Collection Spotlight (Shown when viewing All or Featured Hot) */}
        {featuredHotPhotos.length > 0 && (selectedCategory === 'All' || selectedCategory === 'Featured Hot') && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#e5b36b]" />
                <h2 className="text-xl md:text-2xl font-serif-display font-bold text-white tracking-tight">
                  Featured Hot Collection
                </h2>
              </div>
              <span className="text-xs text-stone-400 tabular-nums">
                {featuredHotPhotos.length} signature highlights
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {featuredHotPhotos.slice(0, 5).map((photo, idx) => {
                const isLead = idx === 0;
                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => openPhotoInAll(photo)}
                    className={`group relative overflow-hidden rounded-2xl border border-stone-800/90 bg-[#150f1f] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5b36b] ${
                      isLead
                        ? 'md:col-span-6 md:row-span-2 aspect-[4/5] md:aspect-auto md:min-h-[460px]'
                        : 'md:col-span-3 aspect-[4/3]'
                    }`}
                  >
                    {failedSrcs[photo.src] ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1b1227] to-[#0f0b16] text-stone-400 p-4 text-center">
                        <ImageIcon className="w-6 h-6 text-[#e5b36b] mb-2" />
                        <span className="text-xs font-medium text-stone-200">{photo.title}</span>
                      </div>
                    ) : (
                      <img
                        src={photo.src}
                        alt={photo.title}
                        referrerPolicy="no-referrer"
                        loading={idx < 2 ? 'eager' : 'lazy'}
                        onError={() => markFailed(photo.src)}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[11px] text-[#e5b36b] font-medium truncate">
                          Featured · {photo.category}
                        </div>
                        <div className="text-sm font-semibold text-white truncate">
                          {photo.title}
                        </div>
                      </div>
                      <span className="w-8 h-8 rounded-lg bg-black/60 border border-white/15 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Interactive Category Filter Controls */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-stone-900/75 border border-stone-800 rounded-xl w-fit max-w-full">
          {(['All', ...GALLERY_CATEGORIES] as Array<'All' | GalleryCategory>).map((cat) => {
            const count =
              cat === 'All'
                ? visiblePhotos.length
                : cat === 'Featured Hot'
                  ? featuredHotPhotos.length
                  : visiblePhotos.filter((p) => p.category === cat).length;
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setLightboxIndex(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                  active
                    ? 'bg-gradient-to-r from-[#e5b36b] to-[#b84b6e] text-stone-950 font-semibold shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Full Gallery Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="rounded-2xl border border-stone-800 bg-[#140e1d] p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-white">No photos in this category</p>
            <p className="text-xs text-stone-400">
              Select another collection filter above to browse Isabella’s full photography archive.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredPhotos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightboxIndex(index)}
                className="group relative rounded-2xl overflow-hidden border border-stone-800/85 bg-[#150f1e] hover:border-[#e5b36b]/60 transition-all duration-300 text-left flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5b36b]"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-950">
                  {failedSrcs[photo.src] ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1b1227] to-[#0f0b16] text-stone-400 p-4 text-center">
                      <ImageIcon className="w-6 h-6 text-[#e5b36b] mb-2" />
                      <span className="text-xs font-medium text-stone-200">{photo.title}</span>
                    </div>
                  ) : (
                    <img
                      src={photo.src}
                      alt={photo.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={() => markFailed(photo.src)}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                </div>

                <div className="p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400 truncate">
                    {photo.featured && (
                      <>
                        <span className="text-[#e5b36b] font-semibold">Featured</span>
                        <span aria-hidden="true">·</span>
                      </>
                    )}
                    <span className="truncate">{photo.category}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#f6e2bb] transition-colors line-clamp-1">
                    {photo.title}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full flex flex-col items-center gap-4"
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between gap-4 text-xs text-stone-300">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[#e5b36b] font-semibold whitespace-nowrap">
                  {activePhoto.featured ? 'Featured' : activePhoto.category}
                </span>
                <span aria-hidden="true">·</span>
                <span className="truncate text-white font-medium">{activePhoto.title}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="tabular-nums text-stone-400">
                  {lightboxIndex + 1} / {filteredPhotos.length}
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  aria-label="Close lightbox"
                  className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image Viewport */}
            <div className="relative w-full max-h-[78vh] flex items-center justify-center bg-[#0d0a12] border border-stone-800 rounded-2xl overflow-hidden">
              <img
                src={activePhoto.src}
                alt={activePhoto.title}
                referrerPolicy="no-referrer"
                className="max-h-[78vh] w-auto max-w-full object-contain"
              />

              {filteredPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length
                      )
                    }
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-black/75 hover:bg-black border border-white/15 text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-black/75 hover:bg-black border border-white/15 text-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
