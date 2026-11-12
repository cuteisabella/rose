import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Sparkles, 
  Lock, 
  Menu, 
  X, 
  Share2, 
  ShieldCheck, 
  Save, 
  Check, 
  Globe 
} from 'lucide-react';
import { DEFAULT_STORE_DATA, resolveAssetUrl } from './defaultStore';
import { 
  AppStoreData, 
  BlogPost, 
  ExtraPageItem,
  UserSubscription, 
  MemberItem,
  FrontEditableTexts,
  SiteSettings
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

const BENGALI_CHAR_REGEX = /[\u0980-\u09FF]/;

function sanitizeEnglishText(value: string | undefined, fallback: string = ''): string {
  if (!value || BENGALI_CHAR_REGEX.test(value)) return fallback;
  return value;
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

  return {
    settings: {
      ...DEFAULT_STORE_DATA.settings,
      ...(data.settings || {}),
      siteNameEn: sanitizeEnglishText(data.settings?.siteNameEn, DEFAULT_STORE_DATA.settings.siteNameEn),
      taglineEn: sanitizeEnglishText(data.settings?.taglineEn, DEFAULT_STORE_DATA.settings.taglineEn),
      heroBgImage: resolveAssetUrl(data.settings?.heroBgImage, DEFAULT_STORE_DATA.settings.heroBgImage),
      avatarImage: resolveAssetUrl(data.settings?.avatarImage, DEFAULT_STORE_DATA.settings.avatarImage),
      aboutImage: resolveAssetUrl(data.settings?.aboutImage, DEFAULT_STORE_DATA.settings.aboutImage),
      tipsFeatureImage1: resolveAssetUrl(data.settings?.tipsFeatureImage1, DEFAULT_STORE_DATA.settings.tipsFeatureImage1),
      tipsFeatureImage2: resolveAssetUrl(data.settings?.tipsFeatureImage2, DEFAULT_STORE_DATA.settings.tipsFeatureImage2),
      tipsFeatureImage3: resolveAssetUrl(data.settings?.tipsFeatureImage3, DEFAULT_STORE_DATA.settings.tipsFeatureImage3),
      conciergeImage: resolveAssetUrl(data.settings?.conciergeImage, DEFAULT_STORE_DATA.settings.conciergeImage),
      showreelThumbnail: resolveAssetUrl(data.settings?.showreelThumbnail, DEFAULT_STORE_DATA.settings.showreelThumbnail),
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
            image: resolveAssetUrl(t.image),
          };
        })
      : DEFAULT_STORE_DATA.tips,
    pages: Array.isArray(data.pages)
      ? data.pages
          .filter((p) => p.id !== 'page-1' && p.slug !== 'about-isabella')
          .map((p) => ({ ...p, titleBn: '' }))
      : DEFAULT_STORE_DATA.pages,
    comments: Array.isArray(data.comments) ? data.comments : DEFAULT_STORE_DATA.comments,
    members: Array.isArray(data.members) ? data.members : DEFAULT_STORE_DATA.members,
  };
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
  // Navigation & Page State
  const [activeTab, setActiveTab] = useState<'home' | 'blog' | 'vault' | 'about' | 'tips' | 'membership' | 'contact' | 'custom'>('home');
  const [selectedExtraPage, setSelectedExtraPage] = useState<ExtraPageItem | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Persistent Store (safely hydrated against older cached schemas)
  const [store, setStore] = useState<AppStoreData>(() => {
    const saved = localStorage.getItem('isabella_store_data');
    if (saved) {
      try {
        return hydrateStore(JSON.parse(saved));
      } catch (e) { /* ignore */ }
    }
    return DEFAULT_STORE_DATA;
  });

  // User Membership State
  const [subscription, setSubscription] = useState<UserSubscription>(() => {
    const saved = localStorage.getItem('isabella_sub');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return { tier: 'Free', status: 'active' };
  });

  // Admin Security & Secret Access
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isLiveEditorActive, setIsLiveEditorActive] = useState(false);
  const [hasUnsavedFrontEdits, setHasUnsavedFrontEdits] = useState(false);

  // Modals
  const [isVIPModalOpen, setIsVIPModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutTier, setCheckoutTier] = useState<'VIP Member' | 'Black Diamond VIP'>('VIP Member');
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Social Share to Unlock State (Stored in localStorage)
  const [unlockedShareIds, setUnlockedShareIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('isabella_unlocked_shares');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  // Save unlocked shares
  useEffect(() => {
    localStorage.setItem('isabella_unlocked_shares', JSON.stringify(unlockedShareIds));
  }, [unlockedShareIds]);

  const handleShareToUnlock = (id: string) => {
    const shareUrl = window.location.href;
    const shareText = `Check out exclusive content from Isabella Rose: ${shareUrl}`;

    if (navigator.share) {
      navigator.share({
        title: 'Isabella Rose Official VIP',
        text: 'Exclusive lifestyle, fashion, and private sanctuary.',
        url: shareUrl
      }).then(() => {
        setUnlockedShareIds(prev => [...new Set([...prev, id])]);
        showToast('🎉 Thank you for sharing! Content is now unlocked for you.');
      }).catch(() => {
        navigator.clipboard?.writeText(shareText).catch(() => {});
        setUnlockedShareIds(prev => [...new Set([...prev, id])]);
        showToast('🎉 Share link copied! Content is now unlocked.');
      });
    } else {
      navigator.clipboard?.writeText(shareText).catch(() => {});
      setUnlockedShareIds(prev => [...new Set([...prev, id])]);
      showToast('🎉 Share link copied to clipboard! Content is now unlocked for you.');
    }
  };

  // Save Store to localStorage
  useEffect(() => {
    localStorage.setItem('isabella_store_data', JSON.stringify(store));
  }, [store]);

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

  // Save Subscription to localStorage
  useEffect(() => {
    localStorage.setItem('isabella_sub', JSON.stringify(subscription));
  }, [subscription]);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

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
    // Add to members list
    setStore(prev => ({
      ...prev,
      members: [newMember, ...prev.members]
    }));
    setIsCheckoutOpen(false);
    showToast(`🎉 Payment Verified! Welcome to ${newMember.tier}. All private content is unlocked.`);
  };

  const handleSignOut = () => {
    setSubscription({ tier: 'Free', status: 'active' });
    setIsVIPModalOpen(false);
    showToast('Signed out of VIP account.');
  };

  // Comments
  const handleAddComment = (postId: string, postTitle: string, authorName: string, authorEmail: string, commentText: string) => {
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
    setStore(prev => ({
      ...prev,
      comments: [newComment, ...prev.comments]
    }));
    showToast('Comment submitted for admin review!');
  };

  // Live Front Text & Image Editing
  const handleUpdateFrontText = (field: keyof FrontEditableTexts, value: string) => {
    setStore(prev => ({
      ...prev,
      frontTexts: {
        ...prev.frontTexts,
        [field]: value
      }
    }));
    setHasUnsavedFrontEdits(true);
  };

  const handleUpdateSettingsImage = (field: keyof SiteSettings, url: string) => {
    setStore(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: url
      }
    }));
    setHasUnsavedFrontEdits(true);
    showToast('✨ Photo updated on page! Click "Save Changes" to confirm.');
  };

  const handleSaveFrontEdits = () => {
    localStorage.setItem('isabella_store_data', JSON.stringify(store));
    setHasUnsavedFrontEdits(false);
    showToast('✨ All page text & photo edits saved successfully!');
  };

  return (
    <div className="min-h-screen bg-[#09080b] text-[#f4efe8] flex flex-col selection:bg-[#c99757] selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#171420] border border-[#c99757] text-[#e7c792] rounded-xl shadow-2xl text-xs font-medium animate-bounce">
          <Sparkles className="w-4 h-4 text-[#c99757]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Toolbar when Live Front Editor is Active */}
      {isLiveEditorActive && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-[#131019]/95 border-2 border-amber-500 rounded-2xl shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Live Page & Photo Editor Active</span>
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

      {/* TOP BAR CONTRACT: Brand — Nav Links — 1 Primary Action (NO ADMIN ICON VISIBLE IN TOP BAR) */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#09080b]/90 backdrop-blur-md border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
          {/* Zone 1: Brand title, one line wordmark */}
          <button
            onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="text-xl md:text-2xl font-serif-display font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            {store.settings.logoUrl && (
              <img src={store.settings.logoUrl} alt="Logo" className="w-7 h-7 rounded-lg object-cover border border-[#e5b36b]/50" />
            )}
            <span>{store.settings.siteNameEn.split('—')[0].trim() || 'Isabella Rose'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#e5b36b]" />
          </button>

          {/* Zone 2: Nav links, exact order: Home, Tips, Journal, VIP Vault, Membership, About */}
          <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-wider font-medium text-stone-300">
            <button
              onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${activeTab === 'home' ? 'text-[#c99757]' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => { setActiveTab('tips'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${activeTab === 'tips' ? 'text-[#c99757]' : ''}`}
            >
              Tips
            </button>
            <button
              onClick={() => { setActiveTab('blog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${activeTab === 'blog' ? 'text-[#c99757]' : ''}`}
            >
              Journal
            </button>
            <button
              onClick={() => { setActiveTab('vault'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${activeTab === 'vault' ? 'text-[#c99757]' : ''}`}
            >
              <Lock className="w-3 h-3 text-[#c99757]" />
              VIP Vault
            </button>
            <button
              onClick={() => { setActiveTab('membership'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${activeTab === 'membership' ? 'text-[#c99757]' : ''}`}
            >
              Membership
            </button>
            <button
              onClick={() => { setActiveTab('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${activeTab === 'about' ? 'text-[#c99757]' : ''}`}
            >
              About
            </button>
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

            {/* Mobile burger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-400 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown (same sequence: Home, Tips, Journal, VIP Vault, Membership, About) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-800 bg-[#0d0b10] px-4 py-4 space-y-3 text-xs uppercase tracking-wider">
            <button
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="block w-full text-left py-2 text-stone-300 hover:text-white"
            >
              Home
            </button>
            <button
              onClick={() => { setActiveTab('tips'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="block w-full text-left py-2 text-stone-300 hover:text-white"
            >
              Tips
            </button>
            <button
              onClick={() => { setActiveTab('blog'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="block w-full text-left py-2 text-stone-300 hover:text-white"
            >
              Journal
            </button>
            <button
              onClick={() => { setActiveTab('vault'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="block w-full text-left py-2 text-[#e7c792] font-semibold flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-[#c99757]" /> VIP Vault
            </button>
            <button
              onClick={() => { setActiveTab('membership'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="block w-full text-left py-2 text-stone-300 hover:text-white"
            >
              Membership
            </button>
            <button
              onClick={() => { setActiveTab('about'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="block w-full text-left py-2 text-stone-300 hover:text-white"
            >
              About
            </button>
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

            {/* Media Vault Section (Home Featured Items) */}
            <MediaVault
              videos={store.videos.filter(v => v.featuredOnHome)}
              categories={store.settings.categories}
              subscription={subscription}
              onOpenVIPModal={() => setIsVIPModalOpen(true)}
              onShareToUnlock={handleShareToUnlock}
              unlockedShareIds={unlockedShareIds}
            />

            {/* Curated Tips Panel on Homepage (Selective Tips Chosen in Admin) */}
            <TipsSection
              tips={store.tips.filter(t => t.featuredOnHome)}
              subscription={subscription}
              settings={store.settings}
              frontTexts={store.frontTexts}
              showFullFeaturePage={false}
              isLiveEditorActive={isLiveEditorActive}
              onUpdateFrontText={handleUpdateFrontText}
              onUpdateSettingsImage={handleUpdateSettingsImage}
              onOpenVIPModal={() => setIsVIPModalOpen(true)}
              onShareToUnlock={handleShareToUnlock}
              onLikeTip={(id) => {
                setStore(prev => ({
                  ...prev,
                  tips: prev.tips.map(t => t.id === id ? { ...t, likes: t.likes + 1 } : t)
                }));
              }}
              unlockedShareIds={unlockedShareIds}
            />

            {/* Journal / Blog Section (Home Featured Articles) */}
            <BlogSection
              blogs={store.blogs.filter(b => b.featuredOnHome !== false)}
              categories={store.settings.categories}
              comments={store.comments}
              subscription={subscription}
              frontTexts={store.frontTexts}
              onSelectBlog={(b) => setSelectedBlog(b)}
              onOpenVIPModal={() => setIsVIPModalOpen(true)}
              onShareToUnlock={handleShareToUnlock}
              unlockedShareIds={unlockedShareIds}
              onLikeBlog={(id) => {
                setStore(prev => ({
                  ...prev,
                  blogs: prev.blogs.map(b => b.id === id ? { ...b, likes: b.likes + 1 } : b)
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
              blogs={store.blogs}
              categories={store.settings.categories}
              comments={store.comments}
              subscription={subscription}
              frontTexts={store.frontTexts}
              onSelectBlog={(b) => setSelectedBlog(b)}
              onOpenVIPModal={() => setIsVIPModalOpen(true)}
              onShareToUnlock={handleShareToUnlock}
              unlockedShareIds={unlockedShareIds}
              onLikeBlog={(id) => {
                setStore(prev => ({
                  ...prev,
                  blogs: prev.blogs.map(b => b.id === id ? { ...b, likes: b.likes + 1 } : b)
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
              videos={store.videos}
              categories={store.settings.categories}
              subscription={subscription}
              onOpenVIPModal={() => setIsVIPModalOpen(true)}
              onShareToUnlock={handleShareToUnlock}
              unlockedShareIds={unlockedShareIds}
            />
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="pt-20">
            <TipsSection
              tips={store.tips}
              subscription={subscription}
              settings={store.settings}
              frontTexts={store.frontTexts}
              showFullFeaturePage={true}
              isLiveEditorActive={isLiveEditorActive}
              onUpdateFrontText={handleUpdateFrontText}
              onUpdateSettingsImage={handleUpdateSettingsImage}
              onOpenVIPModal={() => setIsVIPModalOpen(true)}
              onShareToUnlock={handleShareToUnlock}
              onLikeTip={(id) => {
                setStore(prev => ({
                  ...prev,
                  tips: prev.tips.map(t => t.id === id ? { ...t, likes: t.likes + 1 } : t)
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

      {/* FOOTER (NO NETLIFY PANEL ON RIGHT; DISCREET SECRET ADMIN ACCESS) */}
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
              <li><button onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white">Home</button></li>
              <li><button onClick={() => { setActiveTab('tips'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white">Tips</button></li>
              <li><button onClick={() => { setActiveTab('blog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white">Journal</button></li>
              <li><button onClick={() => { setActiveTab('vault'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white">VIP Vault</button></li>
              <li><button onClick={() => { setActiveTab('membership'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white">Membership</button></li>
              <li><button onClick={() => { setActiveTab('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white">About</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium uppercase tracking-wider text-[11px] mb-3">Curated Pages</h4>
            <ul className="space-y-2 text-stone-400">
              <li><button onClick={() => { setActiveTab('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white">About Isabella</button></li>
              <li><button onClick={() => { setActiveTab('tips'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white">Feminine & Style Tips</button></li>
              <li><button onClick={() => { setActiveTab('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white">Private Concierge</button></li>
              {store.pages.filter(p => p.showInFooter && p.status === 'published').map((page) => (
                <li key={page.id}>
                  <button
                    onClick={() => {
                      setSelectedExtraPage(page);
                      setActiveTab('custom');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white text-left"
                  >
                    {page.titleEn}
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
            {/* Secret discreet key lock for admin login */}
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
            showToast(isLiveEditorActive ? 'Live Editor Deactivated' : 'Live Page & Photo Editor Active! Edit any text or swap photos right on the page.');
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
          onClose={() => setSelectedBlog(null)}
          onOpenVIPModal={() => setIsVIPModalOpen(true)}
          onShareToUnlock={handleShareToUnlock}
          onLikePost={(id) => {
            setStore(prev => ({
              ...prev,
              blogs: prev.blogs.map(b => b.id === id ? { ...b, likes: b.likes + 1 } : b)
            }));
            setSelectedBlog(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
          }}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
}
