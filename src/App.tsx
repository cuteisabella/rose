import React, { useState, useEffect, useCallback } from 'react';
import {
  Crown,
  Sparkles,
  Lock,
  Menu,
  X,
  Save,
  ArrowUp
} from 'lucide-react';
import {
  DEFAULT_STORE_DATA,
  DEFAULT_HEADER_MENU,
  DEFAULT_FOOTER_MENU,
  formatTodayDate,
  resolveAssetUrl
} from './defaultStore';
import {
  AppStoreData,
  BlogPost,
  ExtraPageItem,
  UserSubscription,
  MemberItem,
  FrontEditableTexts,
  SiteSettings,
  NavMenuItem
} from './types';
import { Hero } from './components/Hero';
import { BlogSection } from './components/BlogSection';
import { MediaVault } from './components/MediaVault';
import { TipsSection } from './components/TipsSection';
import { ExtraPages } from './components/ExtraPages';
import { AuthModal } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { KinetivoAdmin } from './components/KinetivoAdmin';
import { PostDetailModal } from './components/PostDetailModal';
import { ShareUnlockModal, ShareGateTarget } from './components/ShareUnlockModal';
import { stripMarkdownPreview } from './utils/markdown';

type ActiveTab = 'home' | 'blog' | 'vault' | 'about' | 'tips' | 'membership' | 'contact' | 'custom';

const BENGALI_CHAR_REGEX = /[\u0980-\u09FF]/;

const TAB_TO_PATH: Record<Exclude<ActiveTab, 'custom'>, string> = {
  home: '/',
  tips: '/tips',
  blog: '/journal',
  vault: '/vault',
  membership: '/membership',
  about: '/about',
  contact: '/concierge'
};

function sanitizeEnglishText(value: string | undefined, fallback: string = ''): string {
  if (!value || BENGALI_CHAR_REGEX.test(value)) return fallback;
  return value;
}

function sanitizeNaturalDate(dateValue: string | undefined, fallback: string): string {
  if (!dateValue || /auto-published/i.test(dateValue) || BENGALI_CHAR_REGEX.test(dateValue)) {
    return fallback;
  }
  return dateValue;
}

function normalizeFooterTargetKey(rawTarget: string): string {
  const cleaned = rawTarget
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/^page\//, '');
  if (cleaned === '' || cleaned === 'home') return 'home';
  if (cleaned === 'blog' || cleaned === 'journal') return 'blog';
  if (cleaned === 'contact' || cleaned === 'concierge') return 'concierge';
  return cleaned;
}

function deduplicateFooterMenu(items: NavMenuItem[]): NavMenuItem[] {
  const seenTargets = new Set<string>();
  const seenLabels = new Set<string>();
  return items.filter((item) => {
    const targetKey = normalizeFooterTargetKey(item.target);
    const labelKey = item.label.trim().toLowerCase();
    if (seenTargets.has(targetKey) || (labelKey && seenLabels.has(labelKey))) {
      return false;
    }
    seenTargets.add(targetKey);
    if (labelKey) seenLabels.add(labelKey);
    return true;
  });
}

function hydrateStore(raw: unknown): AppStoreData {
  if (!raw || typeof raw !== 'object') return DEFAULT_STORE_DATA;
  const data = raw as Partial<AppStoreData>;

  const hydratedFrontTexts: FrontEditableTexts = {
    heroKicker: sanitizeEnglishText(data.frontTexts?.heroKicker, DEFAULT_STORE_DATA.frontTexts.heroKicker),
    heroHeadline: sanitizeEnglishText(data.frontTexts?.heroHeadline, DEFAULT_STORE_DATA.frontTexts.heroHeadline),
    heroParagraph: sanitizeEnglishText(data.frontTexts?.heroParagraph, DEFAULT_STORE_DATA.frontTexts.heroParagraph),
    heroBadgeText: sanitizeEnglishText(data.frontTexts?.heroBadgeText, DEFAULT_STORE_DATA.frontTexts.heroBadgeText),
    blogSectionTitle: sanitizeEnglishText(data.frontTexts?.blogSectionTitle, DEFAULT_STORE_DATA.frontTexts.blogSectionTitle),
    blogSectionSubtitle: sanitizeEnglishText(data.frontTexts?.blogSectionSubtitle, DEFAULT_STORE_DATA.frontTexts.blogSectionSubtitle),
    vaultSectionTitle: sanitizeEnglishText(data.frontTexts?.vaultSectionTitle, DEFAULT_STORE_DATA.frontTexts.vaultSectionTitle),
    vaultSectionSubtitle: sanitizeEnglishText(data.frontTexts?.vaultSectionSubtitle, DEFAULT_STORE_DATA.frontTexts.vaultSectionSubtitle),
    tipsSectionTitle: sanitizeEnglishText(data.frontTexts?.tipsSectionTitle, DEFAULT_STORE_DATA.frontTexts.tipsSectionTitle),
    tipsSectionSubtitle: sanitizeEnglishText(data.frontTexts?.tipsSectionSubtitle, DEFAULT_STORE_DATA.frontTexts.tipsSectionSubtitle),
    tipsFeatureHeadline: sanitizeEnglishText(data.frontTexts?.tipsFeatureHeadline, DEFAULT_STORE_DATA.frontTexts.tipsFeatureHeadline),
    tipsFeatureArticle:
      !data.frontTexts?.tipsFeatureArticle || data.frontTexts.tipsFeatureArticle.length < 3000 || BENGALI_CHAR_REGEX.test(data.frontTexts.tipsFeatureArticle)
        ? DEFAULT_STORE_DATA.frontTexts.tipsFeatureArticle
        : data.frontTexts.tipsFeatureArticle,
    aboutHeadline: sanitizeEnglishText(data.frontTexts?.aboutHeadline, DEFAULT_STORE_DATA.frontTexts.aboutHeadline),
    aboutBio: sanitizeEnglishText(data.frontTexts?.aboutBio, DEFAULT_STORE_DATA.frontTexts.aboutBio),
    conciergeHeadline: sanitizeEnglishText(data.frontTexts?.conciergeHeadline, DEFAULT_STORE_DATA.frontTexts.conciergeHeadline),
    conciergeDescription: sanitizeEnglishText(data.frontTexts?.conciergeDescription, DEFAULT_STORE_DATA.frontTexts.conciergeDescription),
    showreelHeadline: sanitizeEnglishText(data.frontTexts?.showreelHeadline, DEFAULT_STORE_DATA.frontTexts.showreelHeadline),
    showreelSubtitle: sanitizeEnglishText(data.frontTexts?.showreelSubtitle, DEFAULT_STORE_DATA.frontTexts.showreelSubtitle),
    footerBio: sanitizeEnglishText(data.frontTexts?.footerBio, DEFAULT_STORE_DATA.frontTexts.footerBio),
  };

  const defaultBlogsById = new Map(DEFAULT_STORE_DATA.blogs.map((b) => [b.id, b]));
  const defaultTipsById = new Map(DEFAULT_STORE_DATA.tips.map((t) => [t.id, t]));
  const defaultPagesById = new Map(DEFAULT_STORE_DATA.pages.map((p) => [p.id, p]));

  const cachedPagesRaw: ExtraPageItem[] = Array.isArray(data.pages)
    ? data.pages
        .filter((p) => p.id !== 'page-1' && p.slug !== 'about-isabella')
        .map((p) => {
          const defaultSeed = defaultPagesById.get(p.id);
          if (p.id === 'page-2' && defaultSeed && (!p.content || p.content.length < 400 || !p.content.includes('##'))) {
            return { ...defaultSeed };
          }
          return {
            ...p,
            titleBn: '',
            status: p.status === 'draft' ? 'draft' : 'published',
            bannerImage: p.bannerImage ? resolveAssetUrl(p.bannerImage) : defaultSeed?.bannerImage
          };
        })
    : [];

  const seenPageIds = new Set<string>();
  const seenPageSlugs = new Set<string>();
  const seenPageTitles = new Set<string>();
  const mergedPages: ExtraPageItem[] = [];

  const pushUniquePage = (page: ExtraPageItem) => {
    const slugKey = page.slug.trim().toLowerCase();
    const titleKey = page.titleEn.trim().toLowerCase();
    if (seenPageIds.has(page.id) || (slugKey && seenPageSlugs.has(slugKey)) || (titleKey && seenPageTitles.has(titleKey))) {
      return;
    }
    seenPageIds.add(page.id);
    if (slugKey) seenPageSlugs.add(slugKey);
    if (titleKey) seenPageTitles.add(titleKey);
    mergedPages.push(page);
  };

  cachedPagesRaw.forEach(pushUniquePage);
  DEFAULT_STORE_DATA.pages.forEach(pushUniquePage);

  const rawHeaderMenu = Array.isArray(data.settings?.headerMenuItems) && data.settings!.headerMenuItems.length > 0
    ? data.settings!.headerMenuItems
    : DEFAULT_HEADER_MENU;

  const rawFooterMenu = Array.isArray(data.settings?.footerMenuItems) && data.settings!.footerMenuItems.length > 0
    ? deduplicateFooterMenu(data.settings!.footerMenuItems)
    : DEFAULT_FOOTER_MENU;

  return {
    settings: {
      ...DEFAULT_STORE_DATA.settings,
      ...(data.settings || {}),
      siteNameEn: sanitizeEnglishText(data.settings?.siteNameEn, DEFAULT_STORE_DATA.settings.siteNameEn),
      taglineEn: sanitizeEnglishText(data.settings?.taglineEn, DEFAULT_STORE_DATA.settings.taglineEn),
      seoMetaDescription: sanitizeEnglishText(data.settings?.seoMetaDescription, DEFAULT_STORE_DATA.settings.seoMetaDescription),
      canonicalUrl: data.settings?.canonicalUrl || DEFAULT_STORE_DATA.settings.canonicalUrl,
      heroBgImage: resolveAssetUrl(data.settings?.heroBgImage, DEFAULT_STORE_DATA.settings.heroBgImage),
      avatarImage: resolveAssetUrl(data.settings?.avatarImage, DEFAULT_STORE_DATA.settings.avatarImage),
      aboutImage: resolveAssetUrl(data.settings?.aboutImage, DEFAULT_STORE_DATA.settings.aboutImage),
      tipsFeatureImage1: resolveAssetUrl(data.settings?.tipsFeatureImage1, DEFAULT_STORE_DATA.settings.tipsFeatureImage1),
      tipsFeatureImage2: resolveAssetUrl(data.settings?.tipsFeatureImage2, DEFAULT_STORE_DATA.settings.tipsFeatureImage2),
      tipsFeatureImage3: resolveAssetUrl(data.settings?.tipsFeatureImage3, DEFAULT_STORE_DATA.settings.tipsFeatureImage3),
      conciergeImage: resolveAssetUrl(data.settings?.conciergeImage, DEFAULT_STORE_DATA.settings.conciergeImage),
      showreelThumbnail: resolveAssetUrl(data.settings?.showreelThumbnail, DEFAULT_STORE_DATA.settings.showreelThumbnail),
      headerMenuItems: rawHeaderMenu,
      footerMenuItems: rawFooterMenu,
      categories: Array.isArray(data.settings?.categories) && data.settings!.categories.length > 0
        ? data.settings!.categories
        : DEFAULT_STORE_DATA.settings.categories,
      vipMonthlyPrice: data.settings?.vipMonthlyPrice === 19.99 || !data.settings?.vipMonthlyPrice
        ? DEFAULT_STORE_DATA.settings.vipMonthlyPrice
        : data.settings.vipMonthlyPrice,
      blackDiamondPrice: data.settings?.blackDiamondPrice === 49.99 || !data.settings?.blackDiamondPrice
        ? DEFAULT_STORE_DATA.settings.blackDiamondPrice
        : data.settings.blackDiamondPrice,
    },
    frontTexts: hydratedFrontTexts,
    videos: Array.isArray(data.videos) && data.videos.length > 0
      ? data.videos.map((v) => ({
          ...v,
          type: v.type || 'video',
          status: v.status === 'Draft' ? 'Draft' : 'Published',
          titleBn: '',
          thumbnailUrl: resolveAssetUrl(v.thumbnailUrl),
          galleryImages: Array.isArray(v.galleryImages)
            ? v.galleryImages.map((img) => resolveAssetUrl(img))
            : undefined,
          featuredOnHome: v.featuredOnHome ?? true,
        }))
      : DEFAULT_STORE_DATA.videos,
    blogs: Array.isArray(data.blogs) && data.blogs.length > 0
      ? data.blogs.map((b) => {
          const freshSeed = defaultBlogsById.get(b.id);
          if (freshSeed && (!b.content || b.content.length < 1800)) {
            return { ...freshSeed, likes: b.likes || freshSeed.likes };
          }
          return {
            ...b,
            titleBn: '',
            status: b.status === 'draft' ? 'draft' : 'published',
            date: sanitizeNaturalDate(b.date, freshSeed?.date || formatTodayDate()),
            bannerImage: resolveAssetUrl(b.bannerImage),
            featuredOnHome: b.featuredOnHome ?? true,
          };
        })
      : DEFAULT_STORE_DATA.blogs,
    tips: Array.isArray(data.tips) && data.tips.length > 0
      ? data.tips.map((t) => {
          const freshSeed = defaultTipsById.get(t.id);
          if (freshSeed && (!t.content || t.content.length < 1200)) {
            return { ...freshSeed, likes: t.likes || freshSeed.likes };
          }
          return {
            ...t,
            status: t.status === 'draft' ? 'draft' : 'published',
            date: sanitizeNaturalDate(t.date, freshSeed?.date || formatTodayDate()),
            image: resolveAssetUrl(t.image),
          };
        })
      : DEFAULT_STORE_DATA.tips,
    pages: mergedPages,
    comments: Array.isArray(data.comments) ? data.comments : DEFAULT_STORE_DATA.comments,
    members: Array.isArray(data.members) ? data.members : DEFAULT_STORE_DATA.members,
  };
}

function resolveRouteFromPathname(
  pathname: string,
  storeData: AppStoreData
): { tab: ActiveTab; extraPage: ExtraPageItem | null; blogPost: BlogPost | null } {
  const cleanPath = (pathname || '/').replace(/\/+$/, '') || '/';

  if (cleanPath === '/') {
    return { tab: 'home', extraPage: null, blogPost: null };
  }
  if (cleanPath === '/tips') {
    return { tab: 'tips', extraPage: null, blogPost: null };
  }
  if (cleanPath === '/journal' || cleanPath === '/blog') {
    return { tab: 'blog', extraPage: null, blogPost: null };
  }
  if (cleanPath === '/vault') {
    return { tab: 'vault', extraPage: null, blogPost: null };
  }
  if (cleanPath === '/membership' || cleanPath === '/page/membership') {
    return { tab: 'membership', extraPage: null, blogPost: null };
  }
  if (cleanPath === '/about' || cleanPath === '/page/about') {
    return { tab: 'about', extraPage: null, blogPost: null };
  }
  if (cleanPath === '/concierge' || cleanPath === '/contact' || cleanPath === '/page/concierge') {
    return { tab: 'contact', extraPage: null, blogPost: null };
  }

  if (cleanPath.startsWith('/blog/')) {
    const slug = decodeURIComponent(cleanPath.slice('/blog/'.length));
    const foundBlog = storeData.blogs.find((b) => b.status === 'published' && b.slug === slug);
    return { tab: 'blog', extraPage: null, blogPost: foundBlog || null };
  }

  if (cleanPath.startsWith('/page/')) {
    const slug = decodeURIComponent(cleanPath.slice('/page/'.length));
    const foundPage = storeData.pages.find((p) => p.status === 'published' && p.slug === slug);
    if (foundPage) {
      return { tab: 'custom', extraPage: foundPage, blogPost: null };
    }
    return { tab: 'home', extraPage: null, blogPost: null };
  }

  const directSlug = decodeURIComponent(cleanPath.slice(1));
  const directPage = storeData.pages.find((p) => p.status === 'published' && p.slug === directSlug);
  if (directPage) {
    return { tab: 'custom', extraPage: directPage, blogPost: null };
  }

  return { tab: 'home', extraPage: null, blogPost: null };
}

function upsertMetaTag(attr: 'name' | 'property', key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonicalTag(href: string) {
  if (!href) return;
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || 'Unexpected render error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b070f] text-stone-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#161021] border border-[#e5b36b]/40 rounded-2xl p-6 text-center space-y-4">
            <h2 className="text-2xl font-serif-display font-bold text-white">Restoring Site Layout</h2>
            <p className="text-xs text-stone-300 leading-relaxed">
              A cached browser state conflicted with the latest site update ({this.state.message}). Click below to refresh with clean default data.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('isabella_store_data');
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e5b36b] to-[#b84b6e] text-stone-950 font-bold text-xs"
            >
              Reset Cache & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function HtmlAdSlot({ html }: { html: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = '';
    const trimmed = html.trim();
    if (!trimmed) return;

    const tpl = document.createElement('template');
    tpl.innerHTML = trimmed;
    Array.from(tpl.content.childNodes).forEach((node) => {
      if (node.nodeName === 'SCRIPT') {
        const orig = node as HTMLScriptElement;
        const script = document.createElement('script');
        Array.from(orig.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
        script.textContent = orig.textContent;
        el.appendChild(script);
      } else {
        el.appendChild(node.cloneNode(true));
      }
    });
  }, [html]);

  if (!html.trim()) return null;
  return (
    <div className="border-t border-stone-800/70 bg-[#0b0810] py-4">
      <div
        ref={containerRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-4 text-xs text-stone-300"
      />
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppContent />
    </AppErrorBoundary>
  );
}

function AppContent() {
  // Persistent Store (safely hydrated against older cached schemas)
  const [store, setStore] = useState<AppStoreData>(() => {
    const saved = localStorage.getItem('isabella_store_data');
    if (saved) {
      try {
        return hydrateStore(JSON.parse(saved));
      } catch {
        /* ignore corrupted cache */
      }
    }
    return DEFAULT_STORE_DATA;
  });

  // Initialize Route Directly from URL Pathname (Fixes Direct Slug Links!)
  const initialRoute = resolveRouteFromPathname(
    typeof window !== 'undefined' ? window.location.pathname : '/',
    store
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>(initialRoute.tab);
  const [selectedExtraPage, setSelectedExtraPage] = useState<ExtraPageItem | null>(initialRoute.extraPage);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(initialRoute.blogPost);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // User Membership State
  const [subscription, setSubscription] = useState<UserSubscription>(() => {
    const saved = localStorage.getItem('isabella_sub');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* ignore */
      }
    }
    return { tier: 'Free', status: 'active' };
  });

  // Admin Security & Secret Access
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isLiveEditorActive, setIsLiveEditorActive] = useState(false);
  const [hasUnsavedFrontEdits, setHasUnsavedFrontEdits] = useState(false);

  // Modals & Social Share Gate
  const [isVIPModalOpen, setIsVIPModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutTier, setCheckoutTier] = useState<'VIP Member' | 'Black Diamond VIP'>('VIP Member');
  const [shareGateTarget, setShareGateTarget] = useState<ShareGateTarget | null>(null);

  // Toast & Back-To-Top Visibility
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 360);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Social Share to Unlock State (Stored in localStorage)
  const [unlockedShareIds, setUnlockedShareIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('isabella_unlocked_shares');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* ignore */
      }
    }
    return [];
  });

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  const pushPath = useCallback((path: string) => {
    if (typeof window === 'undefined') return;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (window.location.pathname !== normalized) {
      window.history.pushState({}, '', normalized);
    }
  }, []);

  const navigateByTarget = useCallback(
    (rawTarget: string, shouldPushUrl = true) => {
      const target = rawTarget.trim();
      setMobileMenuOpen(false);
      setSelectedBlog(null);

      if (target === 'home' || target === '/') {
        setActiveTab('home');
        setSelectedExtraPage(null);
        if (shouldPushUrl) pushPath('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (target === 'tips' || target === '/tips') {
        setActiveTab('tips');
        setSelectedExtraPage(null);
        if (shouldPushUrl) pushPath('/tips');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (target === 'blog' || target === '/journal' || target === '/blog') {
        setActiveTab('blog');
        setSelectedExtraPage(null);
        if (shouldPushUrl) pushPath('/journal');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (target === 'vault' || target === '/vault') {
        setActiveTab('vault');
        setSelectedExtraPage(null);
        if (shouldPushUrl) pushPath('/vault');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (target === 'membership' || target === '/membership' || target === '/page/membership') {
        setActiveTab('membership');
        setSelectedExtraPage(null);
        if (shouldPushUrl) pushPath('/membership');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (target === 'about' || target === '/about' || target === '/page/about') {
        setActiveTab('about');
        setSelectedExtraPage(null);
        if (shouldPushUrl) pushPath('/about');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (target === 'contact' || target === '/concierge' || target === '/contact' || target === '/page/concierge') {
        setActiveTab('contact');
        setSelectedExtraPage(null);
        if (shouldPushUrl) pushPath('/concierge');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (target.startsWith('/blog/')) {
        const slug = decodeURIComponent(target.slice('/blog/'.length));
        const blog = store.blogs.find((b) => b.status === 'published' && b.slug === slug);
        setActiveTab('blog');
        setSelectedExtraPage(null);
        setSelectedBlog(blog || null);
        if (shouldPushUrl) pushPath(`/blog/${slug}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (target.startsWith('/page/')) {
        const slug = decodeURIComponent(target.slice('/page/'.length));
        const page = store.pages.find((p) => p.status === 'published' && p.slug === slug);
        if (page) {
          setSelectedExtraPage(page);
          setActiveTab('custom');
          if (shouldPushUrl) pushPath(`/page/${page.slug}`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

      // Check matching custom page slug directly
      const fallbackPage = store.pages.find((p) => p.status === 'published' && p.slug === target.replace(/^\//, ''));
      if (fallbackPage) {
        setSelectedExtraPage(fallbackPage);
        setActiveTab('custom');
        if (shouldPushUrl) pushPath(`/page/${fallbackPage.slug}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      setActiveTab('home');
      setSelectedExtraPage(null);
      if (shouldPushUrl) pushPath('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [pushPath, store.blogs, store.pages]
  );

  const handleOpenBlogPost = useCallback(
    (blog: BlogPost) => {
      if (blog.status !== 'published') return;
      setSelectedBlog(blog);
      pushPath(`/blog/${blog.slug}`);
    },
    [pushPath]
  );

  const handleCloseBlogPost = useCallback(() => {
    setSelectedBlog(null);
    const backPath =
      activeTab === 'custom' && selectedExtraPage
        ? `/page/${selectedExtraPage.slug}`
        : activeTab !== 'custom'
          ? TAB_TO_PATH[activeTab]
          : '/';
    pushPath(backPath);
  }, [activeTab, pushPath, selectedExtraPage]);

  // Listen to browser Back / Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const resolved = resolveRouteFromPathname(window.location.pathname, store);
      setActiveTab(resolved.tab);
      setSelectedExtraPage(resolved.extraPage);
      setSelectedBlog(resolved.blogPost);
      setMobileMenuOpen(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [store]);

  // Keep active ExtraPage / Blog synchronized with live admin edits or Draft toggling
  useEffect(() => {
    if (selectedExtraPage) {
      const updated = store.pages.find((p) => p.id === selectedExtraPage.id);
      if (!updated || updated.status !== 'published') {
        setSelectedExtraPage(null);
        if (activeTab === 'custom') {
          setActiveTab('home');
          pushPath('/');
        }
      } else if (updated !== selectedExtraPage) {
        setSelectedExtraPage(updated);
      }
    }
    if (selectedBlog) {
      const updatedBlog = store.blogs.find((b) => b.id === selectedBlog.id);
      if (!updatedBlog || updatedBlog.status !== 'published') {
        setSelectedBlog(null);
      } else if (updatedBlog !== selectedBlog) {
        setSelectedBlog(updatedBlog);
      }
    }
  }, [store.pages, store.blogs, selectedExtraPage, selectedBlog, activeTab, pushPath]);

  // Save unlocked shares
  useEffect(() => {
    localStorage.setItem('isabella_unlocked_shares', JSON.stringify(unlockedShareIds));
  }, [unlockedShareIds]);

  // Save Store to localStorage
  useEffect(() => {
    localStorage.setItem('isabella_store_data', JSON.stringify(store));
  }, [store]);

  // Save Subscription to localStorage
  useEffect(() => {
    localStorage.setItem('isabella_sub', JSON.stringify(subscription));
  }, [subscription]);

  // Verified Social Share Unlock Handlers
  const handleVerifiedShareUnlock = useCallback(
    (id: string) => {
      setUnlockedShareIds((prev) => [...new Set([...prev, id])]);
      showToast('Share verified! Exclusive content is now unlocked for you.');
    },
    [showToast]
  );

  const handleOpenShareGate = useCallback(
    (id: string) => {
      const matchedBlog = store.blogs.find((b) => b.id === id);
      if (matchedBlog) {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        setShareGateTarget({
          id: matchedBlog.id,
          title: matchedBlog.titleEn,
          shareUrl: `${origin}/blog/${matchedBlog.slug}`
        });
        return;
      }

      const matchedVideo = store.videos.find((v) => v.id === id);
      if (matchedVideo) {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        setShareGateTarget({
          id: matchedVideo.id,
          title: matchedVideo.titleEn,
          shareUrl: `${origin}/vault`
        });
        return;
      }

      const matchedTip = store.tips.find((t) => t.id === id);
      if (matchedTip) {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        setShareGateTarget({
          id: matchedTip.id,
          title: matchedTip.title,
          shareUrl: `${origin}/tips`
        });
      }
    },
    [store.blogs, store.tips, store.videos]
  );

  // Dynamic Site-Wide & Per-Content SEO Metadata + Canonical URL Updater
  useEffect(() => {
    const siteName = store.settings.siteNameEn.split('—')[0].trim() || 'Isabella Rose';
    const baseCanonical = (
      store.settings.canonicalUrl ||
      (typeof window !== 'undefined' ? window.location.origin : 'https://isabellamyth.netlify.app')
    ).replace(/\/+$/, '');
    const defaultMetaDesc =
      store.settings.seoMetaDescription ||
      'Exclusive lifestyle, haute couture fashion, luxury dining guides, feminine tips, and VIP private 4K media vault by Isabella Rose.';

    let title = `${siteName} | ${store.settings.taglineEn || 'Official VIP Blog & Members Lounge'}`;
    let description = defaultMetaDesc;
    let keywords = 'Isabella Rose, luxury lifestyle, haute couture, feminine elegance, VIP vault';
    let canonicalPath = activeTab !== 'custom' ? TAB_TO_PATH[activeTab] : '/';

    if (selectedBlog) {
      title = selectedBlog.seoTitle?.trim() || `${selectedBlog.titleEn} | ${siteName}`;
      description = selectedBlog.seoDescription?.trim() || selectedBlog.subtitle || defaultMetaDesc;
      keywords = selectedBlog.seoKeywords?.trim() || `${selectedBlog.category}, ${siteName}, luxury journal`;
      canonicalPath = `/blog/${selectedBlog.slug}`;
    } else if (activeTab === 'custom' && selectedExtraPage) {
      title = selectedExtraPage.seoTitle?.trim() || `${selectedExtraPage.titleEn} | ${siteName}`;
      description =
        selectedExtraPage.seoDescription?.trim() ||
        stripMarkdownPreview(selectedExtraPage.content).slice(0, 155) ||
        defaultMetaDesc;
      keywords = selectedExtraPage.seoKeywords?.trim() || `${selectedExtraPage.titleEn}, ${siteName}`;
      canonicalPath = `/page/${selectedExtraPage.slug}`;
    } else if (activeTab === 'about' || activeTab === 'membership' || activeTab === 'contact') {
      const slugMap = { about: 'about', membership: 'membership', contact: 'concierge' };
      const matchedPage = store.pages.find((p) => p.slug === slugMap[activeTab] && p.status === 'published');
      if (matchedPage) {
        title = matchedPage.seoTitle?.trim() || `${matchedPage.titleEn} | ${siteName}`;
        description =
          matchedPage.seoDescription?.trim() ||
          stripMarkdownPreview(matchedPage.content).slice(0, 155) ||
          defaultMetaDesc;
        keywords = matchedPage.seoKeywords?.trim() || keywords;
      } else {
        const labels = { about: 'About Isabella', membership: 'VIP Membership', contact: 'Private Concierge' };
        title = `${labels[activeTab]} | ${siteName}`;
      }
      canonicalPath = TAB_TO_PATH[activeTab];
    } else if (activeTab === 'tips') {
      title = `${store.frontTexts.tipsSectionTitle || 'Feminine & Style Tips'} | ${siteName}`;
      description = store.frontTexts.tipsSectionSubtitle || defaultMetaDesc;
      canonicalPath = '/tips';
    } else if (activeTab === 'blog') {
      title = `${store.frontTexts.blogSectionTitle || 'Personal Journal'} | ${siteName}`;
      description = store.frontTexts.blogSectionSubtitle || defaultMetaDesc;
      canonicalPath = '/journal';
    } else if (activeTab === 'vault') {
      title = `${store.frontTexts.vaultSectionTitle || '4K VIP Vault'} | ${siteName}`;
      description = store.frontTexts.vaultSectionSubtitle || defaultMetaDesc;
      canonicalPath = '/vault';
    }

    const fullCanonicalUrl = canonicalPath === '/' ? `${baseCanonical}/` : `${baseCanonical}${canonicalPath}`;

    document.title = title;
    upsertMetaTag('name', 'description', description);
    upsertMetaTag('name', 'keywords', keywords);
    upsertMetaTag('property', 'og:title', title);
    upsertMetaTag('property', 'og:description', description);
    upsertMetaTag('property', 'og:url', fullCanonicalUrl);
    upsertCanonicalTag(fullCanonicalUrl);
  }, [activeTab, selectedBlog, selectedExtraPage, store.pages, store.settings, store.frontTexts]);

  // Inject Custom <head> HTML (Google Analytics, Google AdSense, Verification Meta, Link Ads)
  useEffect(() => {
    const marker = 'data-isabella-head-inject';
    document.head.querySelectorAll(`[${marker}="true"]`).forEach((el) => el.remove());

    const rawHtml = (store.settings.customHeadHtml || '').trim();
    if (!rawHtml) return;

    const tpl = document.createElement('template');
    tpl.innerHTML = rawHtml;
    Array.from(tpl.content.childNodes).forEach((node) => {
      if (node.nodeName === 'SCRIPT') {
        const orig = node as HTMLScriptElement;
        const script = document.createElement('script');
        Array.from(orig.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
        script.textContent = orig.textContent;
        script.setAttribute(marker, 'true');
        document.head.appendChild(script);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const cloned = (node as Element).cloneNode(true) as Element;
        cloned.setAttribute(marker, 'true');
        document.head.appendChild(cloned);
      }
    });

    return () => {
      document.head.querySelectorAll(`[${marker}="true"]`).forEach((el) => el.remove());
    };
  }, [store.settings.customHeadHtml]);

  // Listen for #admin in URL for secret direct access
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminLoginOpen(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Upgrades & Checkout
  const handleInitiateUpgrade = (tier: 'VIP Member' | 'Black Diamond VIP') => {
    setCheckoutTier(tier);
    setIsVIPModalOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleSuccessPayment = (newMember: MemberItem) => {
    setSubscription({
      tier: newMember.tier,
      status: 'active',
      memberSince: newMember.joinedDate,
      expiresAt: '2027-11-12'
    });
    setStore((prev) => ({
      ...prev,
      members: [newMember, ...prev.members]
    }));
    setIsCheckoutOpen(false);
    showToast(`Payment Verified! Welcome to ${newMember.tier}. All private content is unlocked.`);
  };

  const handleSignOut = () => {
    setSubscription({ tier: 'Free', status: 'active' });
    setIsVIPModalOpen(false);
    showToast('Signed out of VIP account.');
  };

  // Comments
  const handleAddComment = (
    postId: string,
    postTitle: string,
    authorName: string,
    authorEmail: string,
    commentText: string
  ) => {
    const newComment = {
      id: `com-${Date.now()}`,
      postId,
      postTitle,
      authorName,
      authorEmail: authorEmail || 'patron@example.com',
      commentText,
      createdAt: 'Just now',
      status: 'pending' as const
    };
    setStore((prev) => ({
      ...prev,
      comments: [newComment, ...prev.comments]
    }));
    showToast('Comment submitted for admin review!');
  };

  // Live Front Text & Image Editing
  const handleUpdateFrontText = (field: keyof FrontEditableTexts, value: string) => {
    setStore((prev) => ({
      ...prev,
      frontTexts: {
        ...prev.frontTexts,
        [field]: value
      }
    }));
    setHasUnsavedFrontEdits(true);
  };

  const handleUpdateSettingsImage = (field: keyof SiteSettings, url: string) => {
    setStore((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: url
      }
    }));
    setHasUnsavedFrontEdits(true);
    showToast('Photo updated on page! Click "Save Changes" to confirm.');
  };

  const handleSaveFrontEdits = () => {
    localStorage.setItem('isabella_store_data', JSON.stringify(store));
    setHasUnsavedFrontEdits(false);
    showToast('All page text & photo edits saved successfully!');
  };

  // Compute Active Header & Footer Navigation Menus
  const baseHeaderItems = (
    store.settings.headerMenuItems && store.settings.headerMenuItems.length > 0
      ? store.settings.headerMenuItems
      : DEFAULT_HEADER_MENU
  ).filter((item) => item.visible);

  const coveredHeaderTargets = new Set(
    baseHeaderItems.map((m) => m.target.replace(/^\/page\//, '').replace(/^\//, ''))
  );

  const extraHeaderPages: NavMenuItem[] = store.pages
    .filter(
      (p) =>
        p.status === 'published' &&
        p.showInHeader &&
        !coveredHeaderTargets.has(p.slug) &&
        !(p.slug === 'about' && coveredHeaderTargets.has('about')) &&
        !(p.slug === 'membership' && coveredHeaderTargets.has('membership')) &&
        !(p.slug === 'concierge' && coveredHeaderTargets.has('contact'))
    )
    .map((p) => ({
      id: `hpage-${p.id}`,
      label: p.titleEn,
      target: `/page/${p.slug}`,
      visible: true
    }));

  const headerNavItems = [...baseHeaderItems, ...extraHeaderPages];

  const baseFooterItems = (
    store.settings.footerMenuItems && store.settings.footerMenuItems.length > 0
      ? deduplicateFooterMenu(store.settings.footerMenuItems)
      : DEFAULT_FOOTER_MENU
  ).filter((item) => item.visible);

  const coveredFooterSlugs = new Set<string>();
  const coveredFooterTitles = new Set<string>();
  baseFooterItems.forEach((m) => {
    const clean = normalizeFooterTargetKey(m.target);
    coveredFooterSlugs.add(clean);
    coveredFooterTitles.add(m.label.trim().toLowerCase());
  });

  const seenCuratedPageSlugs = new Set<string>();
  const seenCuratedPageTitles = new Set<string>();
  const curatedFooterPages = store.pages.filter((p) => {
    if (p.status !== 'published' || !p.showInFooter) return false;
    const slugKey = p.slug.trim().toLowerCase();
    const titleKey = p.titleEn.trim().toLowerCase();
    if (coveredFooterSlugs.has(slugKey) || coveredFooterTitles.has(titleKey)) return false;
    if (seenCuratedPageSlugs.has(slugKey) || seenCuratedPageTitles.has(titleKey)) return false;
    seenCuratedPageSlugs.add(slugKey);
    seenCuratedPageTitles.add(titleKey);
    return true;
  });

  const seenCuratedBlogSlugs = new Set<string>();
  const curatedFooterBlogs = store.blogs
    .filter((b) => {
      if (b.status !== 'published' || !b.showInFooter) return false;
      const slugKey = b.slug.trim().toLowerCase();
      const titleKey = b.titleEn.trim().toLowerCase();
      if (coveredFooterSlugs.has(slugKey) || coveredFooterTitles.has(titleKey)) return false;
      if (seenCuratedPageSlugs.has(slugKey) || seenCuratedPageTitles.has(titleKey)) return false;
      if (seenCuratedBlogSlugs.has(slugKey)) return false;
      seenCuratedBlogSlugs.add(slugKey);
      return true;
    })
    .slice(0, 4);

  const isTargetActive = (target: string) => {
    const t = target.trim();
    if (t === 'home' || t === '/') return activeTab === 'home';
    if (t === 'tips' || t === '/tips') return activeTab === 'tips';
    if (t === 'blog' || t === '/journal' || t === '/blog') return activeTab === 'blog' && !selectedBlog;
    if (t === 'vault' || t === '/vault') return activeTab === 'vault';
    if (t === 'membership' || t === '/membership' || t === '/page/membership') return activeTab === 'membership';
    if (t === 'about' || t === '/about' || t === '/page/about') return activeTab === 'about';
    if (t === 'contact' || t === '/concierge' || t === '/contact' || t === '/page/concierge') return activeTab === 'contact';
    if (t.startsWith('/page/') && activeTab === 'custom' && selectedExtraPage) {
      return t === `/page/${selectedExtraPage.slug}`;
    }
    if (t.startsWith('/blog/') && selectedBlog) {
      return t === `/blog/${selectedBlog.slug}`;
    }
    return false;
  };

  // Filtered Published Collections
  const publishedVideos = store.videos.filter((v) => v.status === 'Published');
  const publishedTips = store.tips.filter((t) => t.status === 'published');
  const publishedBlogs = store.blogs.filter((b) => b.status === 'published');

  return (
    <div className="min-h-screen bg-[#09080b] text-[#f4efe8] flex flex-col selection:bg-[#c99757] selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#171420] border border-[#c99757] text-[#e7c792] rounded-xl shadow-2xl text-xs font-medium">
          <Sparkles className="w-4 h-4 text-[#c99757]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Toolbar when Live Front Editor is Active */}
      {isLiveEditorActive && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-[#131019]/95 border-2 border-amber-500 rounded-2xl shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>
              Live Page & Photo Editor Active
              {hasUnsavedFrontEdits ? ' (Unsaved Changes)' : ''}
            </span>
          </div>
          <button
            onClick={handleSaveFrontEdits}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </button>
          <button
            onClick={() => setIsLiveEditorActive(false)}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors"
          >
            Exit Live Editor
          </button>
        </div>
      )}

      {/* TOP BAR CONTRACT: Brand — Nav Links — 1 Primary Action */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#09080b]/90 backdrop-blur-md border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
          {/* Zone 1: Brand title, one line wordmark */}
          <button
            onClick={() => navigateByTarget('home')}
            className="text-xl md:text-2xl font-serif-display font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            {store.settings.logoUrl && (
              <img
                src={resolveAssetUrl(store.settings.logoUrl)}
                alt="Logo"
                className="w-7 h-7 rounded-lg object-cover border border-[#e5b36b]/50"
              />
            )}
            <span>{store.settings.siteNameEn.split('—')[0].trim() || 'Isabella Rose'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#e5b36b]" />
          </button>

          {/* Zone 2: Editable Header Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-wider font-medium text-stone-300 overflow-x-auto">
            {headerNavItems.map((item) => {
              const isExternal = /^https?:\/\//i.test(item.target);
              const active = isTargetActive(item.target);
              const showVaultLock = item.target === 'vault' || item.target === '/vault';

              if (isExternal) {
                return (
                  <a
                    key={item.id}
                    href={item.target}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors whitespace-nowrap shrink-0"
                  >
                    {item.label}
                  </a>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => navigateByTarget(item.target)}
                  className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${
                    active ? 'text-[#c99757]' : ''
                  }`}
                >
                  {showVaultLock && <Lock className="w-3 h-3 text-[#c99757]" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action (VIP Access CTA) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsVIPModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-[#e7c792] via-[#c99757] to-[#b07f43] rounded-lg hover:opacity-95 transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>{subscription.tier !== 'Free' ? 'VIP Active' : 'VIP Access'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-400 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-800 bg-[#0d0b10] px-4 py-4 space-y-3 text-xs uppercase tracking-wider">
            {headerNavItems.map((item) => {
              const isExternal = /^https?:\/\//i.test(item.target);
              const showVaultLock = item.target === 'vault' || item.target === '/vault';
              const active = isTargetActive(item.target);

              if (isExternal) {
                return (
                  <a
                    key={item.id}
                    href={item.target}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left py-2 text-stone-300 hover:text-white"
                  >
                    {item.label}
                  </a>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => navigateByTarget(item.target)}
                  className={`block w-full text-left py-2 flex items-center gap-1.5 ${
                    active ? 'text-[#e7c792] font-semibold' : 'text-stone-300 hover:text-white'
                  }`}
                >
                  {showVaultLock && <Lock className="w-3.5 h-3.5 text-[#c99757]" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* MAIN VIEWPORT */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <Hero
              subscription={subscription}
              frontTexts={store.frontTexts}
              settings={store.settings}
              isLiveEditorActive={isLiveEditorActive}
              onUpdateFrontText={handleUpdateFrontText}
              onUpdateSettingsImage={handleUpdateSettingsImage}
              onOpenVIPModal={() => setIsVIPModalOpen(true)}
              onScrollToBlog={() => {
                const el = document.getElementById('blog');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onScrollToVault={() => {
                const el = document.getElementById('vault');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Media Vault Section (Published & Home Featured Items) */}
            <MediaVault
              videos={publishedVideos.filter((v) => v.featuredOnHome)}
              categories={store.settings.categories}
              subscription={subscription}
              onOpenVIPModal={() => setIsVIPModalOpen(true)}
              onShareToUnlock={handleOpenShareGate}
              onVerifiedShareUnlock={handleVerifiedShareUnlock}
              unlockedShareIds={unlockedShareIds}
            />

            {/* Curated Tips Panel on Homepage */}
            <TipsSection
              tips={publishedTips.filter((t) => t.featuredOnHome)}
              subscription={subscription}
              settings={store.settings}
              frontTexts={store.frontTexts}
              showFullFeaturePage={false}
              isLiveEditorActive={isLiveEditorActive}
              onUpdateFrontText={handleUpdateFrontText}
              onUpdateSettingsImage={handleUpdateSettingsImage}
              onOpenVIPModal={() => setIsVIPModalOpen(true)}
              onVerifiedShareUnlock={handleVerifiedShareUnlock}
              onLikeTip={(id) => {
                setStore((prev) => ({
                  ...prev,
                  tips: prev.tips.map((t) => (t.id === id ? { ...t, likes: t.likes + 1 } : t))
                }));
              }}
              unlockedShareIds={unlockedShareIds}
            />

            {/* Journal / Blog Section (Published & Home Featured Articles) */}
            <BlogSection
              blogs={publishedBlogs.filter((b) => b.featuredOnHome !== false)}
              categories={store.settings.categories}
              comments={store.comments}
              subscription={subscription}
              frontTexts={store.frontTexts}
              onSelectBlog={handleOpenBlogPost}
              onOpenVIPModal={() => setIsVIPModalOpen(true)}
              onShareToUnlock={handleOpenShareGate}
              unlockedShareIds={unlockedShareIds}
              onLikeBlog={(id) => {
                setStore((prev) => ({
                  ...prev,
                  blogs: prev.blogs.map((b) => (b.id === id ? { ...b, likes: b.likes + 1 } : b))
                }));
              }}
              onAddComment={handleAddComment}
              isLiveEditorActive={isLiveEditorActive}
              onUpdateFrontText={handleUpdateFrontText}
            />
          </>
        )}

        {activeTab === 'blog' && (
          <div className="pt-20">
            <BlogSection
              blogs={publishedBlogs}
              categories={store.settings.categories}
              comments={store.comments}
              subscription={subscription}
              frontTexts={store.frontTexts}
              onSelectBlog={handleOpenBlogPost}
              onOpenVIPModal={() => setIsVIPModalOpen(true)}
              onShareToUnlock={handleOpenShareGate}
              unlockedShareIds={unlockedShareIds}
              onLikeBlog={(id) => {
                setStore((prev) => ({
                  ...prev,
                  blogs: prev.blogs.map((b) => (b.id === id ? { ...b, likes: b.likes + 1 } : b))
                }));
              }}
              onAddComment={handleAddComment}
              isLiveEditorActive={isLiveEditorActive}
              onUpdateFrontText={handleUpdateFrontText}
            />
          </div>
        )}

        {activeTab === 'vault' && (
          <div className="pt-20">
            <MediaVault
              videos={publishedVideos}
              categories={store.settings.categories}
              subscription={subscription}
              onOpenVIPModal={() => setIsVIPModalOpen(true)}
              onShareToUnlock={handleOpenShareGate}
              onVerifiedShareUnlock={handleVerifiedShareUnlock}
              unlockedShareIds={unlockedShareIds}
            />
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="pt-20">
            <TipsSection
              tips={publishedTips}
              subscription={subscription}
              settings={store.settings}
              frontTexts={store.frontTexts}
              showFullFeaturePage={true}
              isLiveEditorActive={isLiveEditorActive}
              onUpdateFrontText={handleUpdateFrontText}
              onUpdateSettingsImage={handleUpdateSettingsImage}
              onOpenVIPModal={() => setIsVIPModalOpen(true)}
              onVerifiedShareUnlock={handleVerifiedShareUnlock}
              onLikeTip={(id) => {
                setStore((prev) => ({
                  ...prev,
                  tips: prev.tips.map((t) => (t.id === id ? { ...t, likes: t.likes + 1 } : t))
                }));
              }}
              unlockedShareIds={unlockedShareIds}
            />
          </div>
        )}

        {(activeTab === 'about' || activeTab === 'membership' || activeTab === 'contact' || activeTab === 'custom') && (
          <div className="pt-20">
            <ExtraPages
              activePage={activeTab}
              customPage={selectedExtraPage}
              pages={store.pages}
              subscription={subscription}
              settings={store.settings}
              frontTexts={store.frontTexts}
              isLiveEditorActive={isLiveEditorActive}
              onUpdateFrontText={handleUpdateFrontText}
              onUpdateSettingsImage={handleUpdateSettingsImage}
              vipMonthlyPrice={store.settings.vipMonthlyPrice}
              blackDiamondPrice={store.settings.blackDiamondPrice}
              onOpenVIPModal={() => setIsVIPModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* OPTIONAL LINKS AD / BANNER HTML SLOT */}
      <HtmlAdSlot html={store.settings.customAdSlotHtml || ''} />

      {/* FOOTER (Editable Navigation + Non-Duplicated Curated Pages + Secret Admin Lock) */}
      <footer className="border-t border-stone-800 bg-[#08070a] py-14 text-stone-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="text-lg font-serif-display font-bold text-white">
              {store.settings.siteNameEn.split('—')[0]}
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              {store.frontTexts.footerBio}
            </p>
            <p className="text-[11px] text-stone-500">
              © {new Date().getFullYear()} Isabella Rose. All rights reserved. 18+ VIP Lounge.
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium uppercase tracking-wider text-[11px] mb-3">Navigation</h4>
            <ul className="space-y-2 text-stone-400">
              {baseFooterItems.map((item) => {
                const isExternal = /^https?:\/\//i.test(item.target);
                if (isExternal) {
                  return (
                    <li key={item.id}>
                      <a
                        href={item.target}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white text-left"
                      >
                        {item.label}
                      </a>
                    </li>
                  );
                }
                return (
                  <li key={item.id}>
                    <button onClick={() => navigateByTarget(item.target)} className="hover:text-white text-left">
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium uppercase tracking-wider text-[11px] mb-3">Curated Pages</h4>
            <ul className="space-y-2 text-stone-400">
              {curatedFooterPages.map((page) => (
                <li key={page.id}>
                  <button
                    onClick={() => navigateByTarget(`/page/${page.slug}`)}
                    className="hover:text-white text-left"
                  >
                    {page.titleEn}
                  </button>
                </li>
              ))}
              {curatedFooterBlogs.map((blog) => (
                <li key={blog.id}>
                  <button
                    onClick={() => handleOpenBlogPost(blog)}
                    className="hover:text-white text-left line-clamp-1"
                  >
                    {blog.titleEn}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-medium uppercase tracking-wider text-[11px] mb-3">Discreet Security</h4>
            <p className="text-stone-400 text-xs leading-relaxed">
              End-to-end encrypted VIP member verification and private media rights preservation.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="opacity-20 hover:opacity-100 transition-opacity p-1 text-stone-600 hover:text-[#c99757]"
                title="Secret System Access"
                aria-label="Admin Access"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* FLOATING SCROLL BACK TO TOP BUTTON */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          title="Back to Top"
          className={`fixed right-6 z-40 group flex items-center gap-2 px-3.5 py-3 rounded-full bg-[#161021]/95 hover:bg-gradient-to-r hover:from-[#e7c792] hover:to-[#c99757] text-[#e7c792] hover:text-stone-950 border border-[#e5b36b]/45 shadow-2xl backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 ${
            toastMessage ? 'bottom-20' : 'bottom-6'
          }`}
        >
          <ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
          <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-wider">Top</span>
        </button>
      )}

      {/* MODALS */}
      <AuthModal
        isOpen={isVIPModalOpen}
        onClose={() => setIsVIPModalOpen(false)}
        subscription={subscription}
        vipMonthlyPrice={store.settings.vipMonthlyPrice}
        blackDiamondPrice={store.settings.blackDiamondPrice}
        onUpgrade={handleInitiateUpgrade}
        onSignOut={handleSignOut}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedTier={checkoutTier}
        price={checkoutTier === 'VIP Member' ? store.settings.vipMonthlyPrice : store.settings.blackDiamondPrice}
        settings={store.settings}
        onSuccessPayment={handleSuccessPayment}
      />

      <ShareUnlockModal
        target={shareGateTarget}
        onClose={() => setShareGateTarget(null)}
        onVerifiedUnlock={handleVerifiedShareUnlock}
        onOpenVIPModal={() => setIsVIPModalOpen(true)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        correctPasscode={store.settings.adminPasscode}
        onSuccessLogin={() => {
          setIsAdminLoginOpen(false);
          setIsAdminPanelOpen(true);
        }}
      />

      {isAdminPanelOpen && (
        <KinetivoAdmin
          store={store}
          onUpdateStore={(updater) => setStore(updater)}
          onClose={() => setIsAdminPanelOpen(false)}
          onToggleLiveEditor={() => {
            setIsLiveEditorActive(!isLiveEditorActive);
            setIsAdminPanelOpen(false);
            showToast(
              isLiveEditorActive
                ? 'Live Editor Deactivated'
                : 'Live Page & Photo Editor Active! Edit any text or swap photos right on the page.'
            );
          }}
          isLiveEditorActive={isLiveEditorActive}
        />
      )}

      {selectedBlog && (
        <PostDetailModal
          post={selectedBlog}
          comments={store.comments}
          subscription={subscription}
          unlockedShareIds={unlockedShareIds}
          onClose={handleCloseBlogPost}
          onOpenVIPModal={() => setIsVIPModalOpen(true)}
          onVerifiedShareUnlock={handleVerifiedShareUnlock}
          onLikePost={(id) => {
            setStore((prev) => ({
              ...prev,
              blogs: prev.blogs.map((b) => (b.id === id ? { ...b, likes: b.likes + 1 } : b))
            }));
            setSelectedBlog((prev) => (prev ? { ...prev, likes: prev.likes + 1 } : null));
          }}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
}
