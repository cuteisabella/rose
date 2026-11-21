import React from 'react';
import { resolveAssetUrl } from '../defaultStore';

function renderInlineFormatting(text: string): React.ReactNode[] {
  // Supports **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} className="italic text-[#f6e2bb]">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export function renderRichMarkdown(content: string): React.ReactNode {
  if (!content) return null;
  const blocks = content.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  return blocks.map((block, idx) => {
    // Embedded Image: ![alt](url)
    const imageMatch = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      const alt = imageMatch[1] || 'Editorial Visual';
      const src = resolveAssetUrl(imageMatch[2].trim());
      return (
        <figure key={idx} className="my-6 rounded-2xl overflow-hidden border border-[#e5b36b]/25 bg-black/60 shadow-xl">
          <img src={src} alt={alt} referrerPolicy="no-referrer" className="w-full max-h-[480px] object-cover" />
          {alt && alt !== 'Editorial Image' && (
            <figcaption className="px-4 py-2 text-[11px] text-stone-400 italic border-t border-white/10">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    }

    // Divider
    if (block === '---' || block === '***') {
      return <hr key={idx} className="border-white/10 my-6" />;
    }

    // Blockquote
    if (block.startsWith('> ')) {
      return (
        <blockquote
          key={idx}
          className="border-l-2 border-[#e5b36b] pl-4 py-1 text-stone-200 italic bg-white/5 rounded-r-xl pr-4"
        >
          {renderInlineFormatting(block.replace(/^>\s+/gm, ''))}
        </blockquote>
      );
    }

    // Headings
    if (block.startsWith('## ')) {
      return (
        <h3
          key={idx}
          className="text-xl md:text-2xl font-serif-display font-bold text-[#f6e2bb] pt-3 pb-1"
        >
          {renderInlineFormatting(block.replace(/^##\s+/, ''))}
        </h3>
      );
    }
    if (block.startsWith('### ')) {
      return (
        <h4
          key={idx}
          className="text-lg font-serif-display font-semibold text-white pt-2"
        >
          {renderInlineFormatting(block.replace(/^###\s+/, ''))}
        </h4>
      );
    }

    // Bullet / Numbered Lists
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const isBulletList = lines.length > 0 && lines.every((l) => /^[-•*]\s+/.test(l));
    if (isBulletList) {
      return (
        <ul key={idx} className="space-y-2 pl-5 list-disc text-stone-200 marker:text-[#e5b36b]">
          {lines.map((line, lIdx) => (
            <li key={lIdx} className="leading-relaxed">
              {renderInlineFormatting(line.replace(/^[-•*]\s+/, ''))}
            </li>
          ))}
        </ul>
      );
    }

    const isOrderedList = lines.length > 0 && lines.every((l) => /^\d+\.\s+/.test(l));
    if (isOrderedList) {
      return (
        <ol key={idx} className="space-y-2 pl-5 list-decimal text-stone-200 marker:text-[#e5b36b] marker:font-semibold">
          {lines.map((line, lIdx) => (
            <li key={lIdx} className="leading-relaxed">
              {renderInlineFormatting(line.replace(/^\d+\.\s+/, ''))}
            </li>
          ))}
        </ol>
      );
    }

    return (
      <p key={idx} className="leading-relaxed text-stone-200">
        {renderInlineFormatting(block)}
      </p>
    );
  });
}

export function stripMarkdownPreview(content: string): string {
  return content
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^[-•*>\d.]+\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}
