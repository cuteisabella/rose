import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, FileText, Search, Sparkles, X } from 'lucide-react';
import { BlogPost, ExtraPageItem, TipItem } from '../types';
import { stripMarkdownPreview } from '../utils/markdown';

interface SiteSearchProps {
  blogs: BlogPost[];
  tips: TipItem[];
  pages: ExtraPageItem[];
  onSelectBlog: (blog: BlogPost) => void;
  onSelectTip: (tip: TipItem) => void;
  onSelectTarget: (target: string) => void;
  variant?: 'desktop' | 'mobile';
}

type SearchResultItem =
  | {
      key: string;
      kind: 'blog';
      typeLabel: string;
      title: string;
      meta: string;
      snippet: string;
      blog: BlogPost;
    }
  | {
      key: string;
      kind: 'tip';
      typeLabel: string;
      title: string;
      meta: string;
      snippet: string;
      tip: TipItem;
    }
  | {
      key: string;
      kind: 'page';
      typeLabel: string;
      title: string;
      meta: string;
      snippet: string;
      target: string;
    };

const CORE_PAGE_ENTRIES: Array<{
  slug: string;
  title: string;
  target: string;
  description: string;
}> = [
  {
    slug: 'home',
    title: 'Home',
    target: 'home',
    description: 'Featured showcase, curated stories, and VIP inner circle access.'
  },
  {
    slug: 'tips',
    title: 'Feminine & Style Tips',
    target: 'tips',
    description: 'Masterclass guides covering poise, couture styling, wine etiquette, and glow rituals.'
  },
  {
    slug: 'journal',
    title: 'Personal Journal',
    target: 'blog',
    description: 'Long-form luxury lifestyle essays, travel notes, and private reflections.'
  },
  {
    slug: 'vault',
    title: '4K VIP Vault',
    target: 'vault',
    description: 'Private boudoir film reels and high-resolution editorial photography sets.'
  },
  {
    slug: 'membership',
    title: 'VIP Membership & Access Terms',
    target: 'membership',
    description: 'Inner Circle monthly and Black Diamond quarterly pass benefits.'
  },
  {
    slug: 'about',
    title: 'About Isabella',
    target: 'about',
    description: 'Editorial biography, creative philosophy, and atelier background.'
  },
  {
    slug: 'concierge',
    title: 'Private Concierge',
    target: 'contact',
    description: 'Direct inquiries, brand partnerships, and private booking requests.'
  }
];

export const SiteSearch: React.FC<SiteSearchProps> = ({
  blogs,
  tips,
  pages,
  onSelectBlog,
  onSelectTip,
  onSelectTarget,
  variant = 'desktop'
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl/Cmd + K to focus desktop search
  useEffect(() => {
    if (variant !== 'desktop') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [variant]);

  // Close dropdown on outside click
  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const results = useMemo<SearchResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    const publishedBlogs = blogs.filter((b) => b.status === 'published');
    const publishedTips = tips.filter((t) => t.status === 'published');
    const publishedPages = pages.filter((p) => p.status === 'published');

    // Merge custom pages with core route pages without duplicates
    const seenPageSlugs = new Set<string>();
    const pageItems: Array<{ id: string; title: string; slug: string; snippet: string; target: string }> = [];

    for (const p of publishedPages) {
      const slugKey = p.slug.trim().toLowerCase();
      seenPageSlugs.add(slugKey);
      const target =
        slugKey === 'about'
          ? 'about'
          : slugKey === 'membership'
            ? 'membership'
            : slugKey === 'concierge' || slugKey === 'contact'
              ? 'contact'
              : `/page/${p.slug}`;
      pageItems.push({
        id: p.id,
        title: p.titleEn,
        slug: p.slug,
        snippet: stripMarkdownPreview(p.content).slice(0, 120) || 'Editorial page',
        target
      });
    }

    for (const core of CORE_PAGE_ENTRIES) {
      if (!seenPageSlugs.has(core.slug)) {
        seenPageSlugs.add(core.slug);
        pageItems.push({
          id: `core-${core.slug}`,
          title: core.title,
          slug: core.slug,
          snippet: core.description,
          target: core.target
        });
      }
    }

    if (!q) {
      const defaults: SearchResultItem[] = [
        ...publishedBlogs.slice(0, 3).map((blog) => ({
          key: `blog-${blog.id}`,
          kind: 'blog' as const,
          typeLabel: 'Journal',
          title: blog.titleEn,
          meta: blog.category,
          snippet: blog.subtitle || stripMarkdownPreview(blog.content).slice(0, 110),
          blog
        })),
        ...publishedTips.slice(0, 2).map((tip) => ({
          key: `tip-${tip.id}`,
          kind: 'tip' as const,
          typeLabel: 'Tip',
          title: tip.title,
          meta: tip.category,
          snippet: stripMarkdownPreview(tip.content).slice(0, 110),
          tip
        })),
        ...pageItems.slice(0, 2).map((page) => ({
          key: `page-${page.id}`,
          kind: 'page' as const,
          typeLabel: 'Page',
          title: page.title,
          meta: `/${page.slug}`,
          snippet: page.snippet,
          target: page.target
        }))
      ];
      return defaults;
    }

    const blogMatches: SearchResultItem[] = publishedBlogs
      .filter((b) =>
        `${b.titleEn} ${b.subtitle} ${b.category} ${b.slug} ${b.content}`.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((blog) => ({
        key: `blog-${blog.id}`,
        kind: 'blog',
        typeLabel: 'Journal',
        title: blog.titleEn,
        meta: `${blog.category} · ${blog.readTime}`,
        snippet: blog.subtitle || stripMarkdownPreview(blog.content).slice(0, 110),
        blog
      }));

    const tipMatches: SearchResultItem[] = publishedTips
      .filter((t) => `${t.title} ${t.category} ${t.content}`.toLowerCase().includes(q))
      .slice(0, 4)
      .map((tip) => ({
        key: `tip-${tip.id}`,
        kind: 'tip',
        typeLabel: 'Tip',
        title: tip.title,
        meta: `${tip.category} · ${tip.readTime}`,
        snippet: stripMarkdownPreview(tip.content).slice(0, 110),
        tip
      }));

    const pageMatches: SearchResultItem[] = pageItems
      .filter((p) => `${p.title} ${p.slug} ${p.snippet}`.toLowerCase().includes(q))
      .slice(0, 4)
      .map((page) => ({
        key: `page-${page.id}`,
        kind: 'page',
        typeLabel: 'Page',
        title: page.title,
        meta: `/${page.slug}`,
        snippet: page.snippet,
        target: page.target
      }));

    return [...blogMatches, ...tipMatches, ...pageMatches];
  }, [blogs, pages, query, tips]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, isOpen]);

  const handleSelectItem = (item: SearchResultItem) => {
    setIsOpen(false);
    setQuery('');
    if (item.kind === 'blog') {
      onSelectBlog(item.blog);
    } else if (item.kind === 'tip') {
      onSelectTip(item.tip);
    } else {
      onSelectTarget(item.target);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!isOpen) setIsOpen(true);
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const targetItem = results[activeIndex] || results[0];
      if (targetItem) handleSelectItem(targetItem);
    }
  };

  const renderIcon = (kind: SearchResultItem['kind']) => {
    if (kind === 'blog') return <BookOpen className="w-4 h-4 text-[#e5b36b] shrink-0" />;
    if (kind === 'tip') return <Sparkles className="w-4 h-4 text-[#e5b36b] shrink-0" />;
    return <FileText className="w-4 h-4 text-stone-400 shrink-0" />;
  };

  return (
    <div ref={containerRef} className={`relative ${variant === 'mobile' ? 'w-full' : 'w-44 lg:w-56 xl:w-64 shrink-0'}`}>
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleInputKeyDown}
          placeholder="Search journal, tips, pages..."
          aria-label="Search blogs, tips, and pages"
          aria-expanded={isOpen}
          aria-controls={`site-search-results-${variant}`}
          className="w-full bg-[#15111d] border border-white/10 focus:border-[#e5b36b]/60 rounded-lg pl-8 pr-7 py-2 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Clear search query"
            className="absolute right-2 p-0.5 text-stone-400 hover:text-white rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          id={`site-search-results-${variant}`}
          role="listbox"
          className={`mt-2 bg-[#130e1c]/98 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl overflow-hidden z-50 ${
            variant === 'desktop'
              ? 'absolute right-0 w-[340px] sm:w-[400px] max-h-[70vh] overflow-y-auto'
              : 'w-full max-h-[60vh] overflow-y-auto'
          }`}
        >
          <div className="px-3.5 py-2.5 border-b border-white/10 flex items-center justify-between text-[11px] text-stone-400">
            <span>{query.trim() ? `Matches for "${query.trim()}"` : 'Quick Highlights'}</span>
            <span className="tabular-nums">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </span>
          </div>

          {results.length === 0 ? (
            <div className="px-4 py-6 text-center space-y-1">
              <p className="text-xs font-medium text-stone-200">No matching results found</p>
              <p className="text-[11px] text-stone-400">
                Try another keyword across stories, tips, or site pages.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {results.map((item, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => handleSelectItem(item)}
                    className={`w-full px-3.5 py-3 text-left flex items-start gap-3 transition-colors ${
                      isSelected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="mt-0.5">{renderIcon(item.kind)}</div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                        <span className="text-[#e5b36b] font-medium">{item.typeLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{item.meta}</span>
                      </div>
                      <div className="text-xs font-semibold text-white truncate">
                        {item.title}
                      </div>
                      {item.snippet && (
                        <p className="text-[11px] text-stone-400 line-clamp-1">
                          {item.snippet}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
