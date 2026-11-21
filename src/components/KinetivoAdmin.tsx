import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Video, 
  FileText, 
  Layers, 
  Settings as SettingsIcon, 
  Film, 
  Users, 
  MessageSquare, 
  Check, 
  X, 
  Upload, 
  Lock, 
  Download, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Globe,
  Code,
  GitBranch,
  Save,
  Search,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Mail,
  RefreshCw,
  Camera,
  Flame,
  Copy,
  BarChart3,
  CheckCheck,
  Clock,
  RotateCcw
} from 'lucide-react';
import { 
  AppStoreData, 
  VideoItem, 
  BlogPost, 
  TipItem,
  ExtraPageItem, 
  NavMenuItem,
  SiteSettings,
  FrontEditableTexts,
  CustomGalleryPhotoItem,
  LikedContentEntry,
  ViewedContentEntry
} from '../types';
import { AdminAnalyticsTab } from './AdminAnalyticsTab';
import {
  PRESET_THUMBNAILS,
  resolveAssetUrl,
  generateAutoSeoTips,
  generateAutoSeoBlogs,
  DEFAULT_HEADER_MENU,
  DEFAULT_FOOTER_MENU,
  formatTodayDate
} from '../defaultStore';
import {
  GALLERY_CATEGORIES,
  GALLERY_ASSIGNABLE_CATEGORIES,
  getResolvedGalleryPhotos,
  GalleryCategory,
  GalleryPhotoItem,
  isApprovedAssetUrl,
  normalizeGalleryCategory
} from '../galleryData';
import { renderRichMarkdown } from '../utils/markdown';
import {
  compressImageFileToDataUrl,
  compressImageSource,
  optimizeLinkedAssetUrl
} from '../utils/imageUpload';
import {
  fetchNewsletterSubscribersSummary,
  subscribeNewsletterSubscribersCount
} from '../firebase';

interface KinetivoAdminProps {
  store: AppStoreData;
  onUpdateStore: (updater: (prev: AppStoreData) => AppStoreData) => void;
  onClose: () => void;
  onToggleLiveEditor: () => void;
  isLiveEditorActive: boolean;
  viewedItems?: ViewedContentEntry[];
  likedItems?: LikedContentEntry[];
  viewCounts?: Record<string, number>;
  cloudUserEmail?: string | null;
  cloudSyncStatus?: 'idle' | 'syncing' | 'synced' | 'local-only' | 'error';
  cloudSyncError?: string | null;
  onConnectCloudSync?: () => Promise<void>;
  onDisconnectCloudSync?: () => Promise<void>;
  onSaveToCloud?: (overrideStore?: AppStoreData) => Promise<boolean>;
}

export const KinetivoAdmin: React.FC<KinetivoAdminProps> = ({
  store,
  onUpdateStore,
  onClose,
  onToggleLiveEditor,
  isLiveEditorActive,
  viewedItems = [],
  likedItems = [],
  viewCounts = {},
  cloudUserEmail,
  cloudSyncStatus = 'local-only',
  cloudSyncError,
  onConnectCloudSync,
  onDisconnectCloudSync,
  onSaveToCloud
}) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'blogs' | 'tips' | 'pages' | 'gallery' | 'showreel' | 'comments' | 'analytics' | 'members' | 'settings'>('videos');
  const [commentStatusFilter, setCommentStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [commentSearch, setCommentSearch] = useState('');
  const [commentPostFilter, setCommentPostFilter] = useState<string>('all');
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<'All' | GalleryCategory>('All');
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryCategory, setNewGalleryCategory] = useState<Exclude<GalleryCategory, 'Featured Hot'>>('Personal Bedroom');
  const [newGalleryFeatured, setNewGalleryFeatured] = useState(false);
  const [isAddingGalleryImage, setIsAddingGalleryImage] = useState(false);
  const [settingsGallerySearch, setSettingsGallerySearch] = useState('');
  const [settingsGalleryFilter, setSettingsGalleryFilter] = useState<'All' | 'Custom' | Exclude<GalleryCategory, 'Featured Hot'>>('All');

  // Video Form Modal
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Blog Form Modal
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);

  // Tips Form Modal
  const [editingTip, setEditingTip] = useState<TipItem | null>(null);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);

  // Extra Page Form Modal
  const [editingPage, setEditingPage] = useState<ExtraPageItem | null>(null);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);

  // Passcode Settings
  const [newPasscode, setNewPasscode] = useState('');
  const [passcodeSuccessMsg, setPasscodeSuccessMsg] = useState('');

  // Category Manager (inside Blog Posts tab)
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedBlogCategoryFilter, setSelectedBlogCategoryFilter] = useState<string>('All');

  // Rich Editor Preview states
  const [pagePreviewMode, setPagePreviewMode] = useState(false);
  const [blogPreviewMode, setBlogPreviewMode] = useState(false);
  const [tipPreviewMode, setTipPreviewMode] = useState(false);

  // Explicit Save Settings state
  const [lastSavedLabel, setLastSavedLabel] = useState<string | null>(null);
  const [isOptimizingBanner, setIsOptimizingBanner] = useState(false);

  // Email Subscribers Count (Firestore newsletter_subscribers)
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [latestSubscriberAt, setLatestSubscriberAt] = useState<string | null>(null);
  const [subscriberLoading, setSubscriberLoading] = useState(false);
  const [subscriberError, setSubscriberError] = useState<string | null>(null);

  useEffect(() => {
    if (!cloudUserEmail) {
      setSubscriberCount(null);
      setLatestSubscriberAt(null);
      setSubscriberError(null);
      setSubscriberLoading(false);
      return;
    }

    let isActive = true;
    setSubscriberLoading(true);
    setSubscriberError(null);

    const unsubscribe = subscribeNewsletterSubscribersCount(
      (summary) => {
        if (!isActive) return;
        setSubscriberCount(summary.count);
        setLatestSubscriberAt(summary.latestSubscribedAt || null);
        setSubscriberError(null);
        setSubscriberLoading(false);
      },
      () => {
        if (!isActive) return;
        setSubscriberError('Unable to load subscriber count right now.');
        setSubscriberLoading(false);
      }
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [cloudUserEmail]);

  const handleRefreshSubscribers = async () => {
    if (!cloudUserEmail) return;
    setSubscriberLoading(true);
    setSubscriberError(null);
    try {
      const summary = await fetchNewsletterSubscribersSummary();
      setSubscriberCount(summary.count);
      setLatestSubscriberAt(summary.latestSubscribedAt || null);
    } catch {
      setSubscriberError('Unable to refresh subscriber count.');
    } finally {
      setSubscriberLoading(false);
    }
  };

  // Inline Admin Notice (replaces blocked window.alert)
  const [adminNotice, setAdminNotice] = useState<string | null>(null);
  const notifyAdmin = (msg: string) => {
    setAdminNotice(msg);
    setTimeout(() => setAdminNotice(null), 4000);
  };

  const handleExplicitSaveSettings = async () => {
    try {
      localStorage.setItem('isabella_store_data', JSON.stringify(store));
    } catch {
      notifyAdmin('⚠️ Browser local cache full — compressing images or using Cloud Sync is recommended.');
    }
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (onSaveToCloud && cloudUserEmail) {
      const ok = await onSaveToCloud(store);
      if (ok) {
        setLastSavedLabel(`Synced to Cloud at ${timeStr}`);
        notifyAdmin('✨ Saved & Synced to Cloud! All browsers & devices now show these updates.');
      } else {
        setLastSavedLabel(`Local save at ${timeStr} (Cloud retry needed)`);
        notifyAdmin('⚠️ Saved locally, but Cloud Sync failed. Check your authorized admin email.');
      }
    } else {
      setLastSavedLabel(`Saved on this browser (${timeStr})`);
      notifyAdmin('Saved locally! Connect Google Cloud Sync in the top bar to persist across other browsers.');
    }
  };

  // Menu Management Helpers (Header / Footer)
  const updateMenuList = (
    field: 'headerMenuItems' | 'footerMenuItems',
    updater: (items: NavMenuItem[]) => NavMenuItem[]
  ) => {
    onUpdateStore((prev) => {
      const fallback = field === 'headerMenuItems' ? DEFAULT_HEADER_MENU : DEFAULT_FOOTER_MENU;
      const current = prev.settings[field] && prev.settings[field]!.length > 0 ? prev.settings[field]! : fallback;
      return {
        ...prev,
        settings: {
          ...prev.settings,
          [field]: updater(current)
        }
      };
    });
  };

  const handleMoveMenuItem = (field: 'headerMenuItems' | 'footerMenuItems', index: number, dir: -1 | 1) => {
    updateMenuList(field, (items) => {
      const nextIdx = index + dir;
      if (nextIdx < 0 || nextIdx >= items.length) return items;
      const copy = [...items];
      const [moved] = copy.splice(index, 1);
      copy.splice(nextIdx, 0, moved);
      return copy;
    });
  };

  // Save Video
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo || isOptimizingBanner) return;

    setIsOptimizingBanner(true);
    try {
      const optimizedThumb = await compressImageSource(editingVideo.thumbnailUrl, {
        maxDimension: 1120,
        quality: 0.78,
        maxChars: 95_000
      });
      const optimizedGallery = Array.isArray(editingVideo.galleryImages)
        ? await Promise.all(
            editingVideo.galleryImages.map((img) =>
              compressImageSource(img, {
                maxDimension: 1120,
                quality: 0.76,
                maxChars: 85_000
              })
            )
          )
        : editingVideo.galleryImages;

      const finalVideo: VideoItem = {
        ...editingVideo,
        thumbnailUrl: optimizedThumb,
        galleryImages: optimizedGallery
      };

      onUpdateStore(prev => {
        const exists = prev.videos.some(v => v.id === finalVideo.id);
        const updatedVideos = exists
          ? prev.videos.map(v => v.id === finalVideo.id ? finalVideo : v)
          : [finalVideo, ...prev.videos];
        return { ...prev, videos: updatedVideos };
      });

      setIsVideoModalOpen(false);
      setEditingVideo(null);
      notifyAdmin('Media item optimized & saved!');
    } finally {
      setIsOptimizingBanner(false);
    }
  };

  const handleToggleVideoStatus = (id: string) => {
    onUpdateStore(prev => ({
      ...prev,
      videos: prev.videos.map(v =>
        v.id === id ? { ...v, status: v.status === 'Published' ? 'Draft' : 'Published' } : v
      )
    }));
  };

  // Delete Video
  const handleDeleteVideo = (id: string) => {
    onUpdateStore(prev => ({
      ...prev,
      videos: prev.videos.filter(v => v.id !== id)
    }));
    notifyAdmin('Media item removed from library.');
  };

  // Toggle Featured on Home
  const handleToggleFeatured = (id: string) => {
    onUpdateStore(prev => ({
      ...prev,
      videos: prev.videos.map(v => v.id === id ? { ...v, featuredOnHome: !v.featuredOnHome } : v)
    }));
  };

  // Save Blog
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog || isOptimizingBanner) return;

    setIsOptimizingBanner(true);
    try {
      const optimizedBanner = await compressImageSource(editingBlog.bannerImage, {
        maxDimension: 1280,
        quality: 0.78,
        maxChars: 105_000
      });
      const finalBlog: BlogPost = {
        ...editingBlog,
        bannerImage: optimizedBanner
      };

      onUpdateStore(prev => {
        const exists = prev.blogs.some(b => b.id === finalBlog.id);
        const updatedBlogs = exists
          ? prev.blogs.map(b => b.id === finalBlog.id ? finalBlog : b)
          : [finalBlog, ...prev.blogs];
        return { ...prev, blogs: updatedBlogs };
      });

      setIsBlogModalOpen(false);
      setEditingBlog(null);
      notifyAdmin('Blog post & banner optimized and saved!');
    } finally {
      setIsOptimizingBanner(false);
    }
  };

  const handleToggleBlogStatus = (id: string) => {
    onUpdateStore(prev => ({
      ...prev,
      blogs: prev.blogs.map(b =>
        b.id === id ? { ...b, status: b.status === 'published' ? 'draft' : 'published' } : b
      )
    }));
  };

  // Toggle Featured Blog on Home
  const handleToggleBlogHome = (id: string) => {
    onUpdateStore(prev => ({
      ...prev,
      blogs: prev.blogs.map(b => b.id === id ? { ...b, featuredOnHome: !b.featuredOnHome } : b)
    }));
  };

  // Delete Blog
  const handleDeleteBlog = (id: string) => {
    onUpdateStore(prev => ({
      ...prev,
      blogs: prev.blogs.filter(b => b.id !== id)
    }));
    notifyAdmin('Blog post deleted.');
  };

  // Save Tip
  const handleSaveTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTip || isOptimizingBanner) return;

    setIsOptimizingBanner(true);
    try {
      const optimizedImage = await compressImageSource(editingTip.image, {
        maxDimension: 1120,
        quality: 0.78,
        maxChars: 95_000
      });
      const finalTip: TipItem = {
        ...editingTip,
        image: optimizedImage
      };

      onUpdateStore(prev => {
        const exists = prev.tips.some(t => t.id === finalTip.id);
        const updatedTips = exists
          ? prev.tips.map(t => t.id === finalTip.id ? finalTip : t)
          : [finalTip, ...prev.tips];
        return { ...prev, tips: updatedTips };
      });

      setIsTipModalOpen(false);
      setEditingTip(null);
      notifyAdmin('Masterclass tip & photo optimized and saved!');
    } finally {
      setIsOptimizingBanner(false);
    }
  };

  const handleToggleTipStatus = (id: string) => {
    onUpdateStore(prev => ({
      ...prev,
      tips: prev.tips.map(t =>
        t.id === id ? { ...t, status: t.status === 'published' ? 'draft' : 'published' } : t
      )
    }));
  };

  // Toggle Featured Tip on Home
  const handleToggleTipHome = (id: string) => {
    onUpdateStore(prev => ({
      ...prev,
      tips: prev.tips.map(t => t.id === id ? { ...t, featuredOnHome: !t.featuredOnHome } : t)
    }));
  };

  // Delete Tip
  const handleDeleteTip = (id: string) => {
    onUpdateStore(prev => ({
      ...prev,
      tips: prev.tips.filter(t => t.id !== id)
    }));
    notifyAdmin('Tip removed.');
  };

  // Helper: Compress and read local image file as Data URL for reliable persistence
  const readLocalImageFile = (file: File, onLoaded: (dataUrl: string) => void) => {
    compressImageFileToDataUrl(file, (dataUrl) => {
      onLoaded(dataUrl);
      notifyAdmin('Image compressed & uploaded successfully!');
    });
  };

  // Gallery Management Helpers (Add & Permanent Delete)
  const resolvedGalleryPhotos = getResolvedGalleryPhotos(store.settings);

  const handleToggleGalleryFeatured = (photo: GalleryPhotoItem) => {
    const nextFeatured = !photo.featured;
    if (photo.isCustom) {
      onUpdateStore((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          customGalleryImages: (prev.settings.customGalleryImages || []).map((item) =>
            item.id === photo.id ? { ...item, featured: nextFeatured } : item
          )
        }
      }));
    } else {
      onUpdateStore((prev) => {
        const currentOverrides = prev.settings.galleryOverrides || {};
        return {
          ...prev,
          settings: {
            ...prev.settings,
            galleryOverrides: {
              ...currentOverrides,
              [photo.filename]: { featured: nextFeatured }
            }
          }
        };
      });
    }
  };

  const handleDeleteGalleryPhoto = (photo: GalleryPhotoItem) => {
    if (photo.isCustom) {
      onUpdateStore((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          customGalleryImages: (prev.settings.customGalleryImages || []).filter((item) => item.id !== photo.id)
        }
      }));
    } else {
      onUpdateStore((prev) => {
        const currentDeleted = prev.settings.deletedGalleryFilenames || [];
        const nextDeleted = currentDeleted.includes(photo.filename)
          ? currentDeleted
          : [...currentDeleted, photo.filename];
        const nextOverrides = { ...(prev.settings.galleryOverrides || {}) };
        delete nextOverrides[photo.filename];
        return {
          ...prev,
          settings: {
            ...prev.settings,
            deletedGalleryFilenames: nextDeleted,
            galleryOverrides: nextOverrides
          }
        };
      });
    }
    notifyAdmin(
      cloudUserEmail
        ? `Removed "${photo.title}" from front-end & synced to Cloud storage.`
        : `Removed "${photo.title}" from front-end & local storage.`
    );
  };

  const handleAddGalleryImageFromUrl = async () => {
    const rawUrl = optimizeLinkedAssetUrl(newGalleryUrl);
    if (!rawUrl) {
      notifyAdmin('Paste an image URL or upload an image file.');
      return;
    }
    if (!isApprovedAssetUrl(rawUrl)) {
      notifyAdmin('Please enter a valid HTTPS or image URL.');
      return;
    }
    if ((store.settings.customGalleryImages || []).length >= 60) {
      notifyAdmin('Custom gallery limit (60 uploads) reached. Remove an older custom photo first.');
      return;
    }

    setIsAddingGalleryImage(true);
    try {
      const finalSrc = rawUrl.startsWith('data:image/')
        ? (await compressImageSource(rawUrl, { maxDimension: 900, quality: 0.72, maxChars: 65_000 })) || rawUrl
        : rawUrl;
      const item: CustomGalleryPhotoItem = {
        id: `gal-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        src: finalSrc,
        title: newGalleryTitle.trim() || `Isabella ${newGalleryCategory} Portrait`,
        category: normalizeGalleryCategory(newGalleryCategory),
        featured: newGalleryFeatured,
        addedAt: new Date().toISOString()
      };
      onUpdateStore((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          customGalleryImages: [item, ...(prev.settings.customGalleryImages || [])]
        }
      }));
      setNewGalleryUrl('');
      setNewGalleryTitle('');
      notifyAdmin(
        cloudUserEmail
          ? `Added "${item.title}" to ${item.category} & synced to Cloud storage!`
          : `Added "${item.title}" to ${item.category} & local storage!`
      );
    } finally {
      setIsAddingGalleryImage(false);
    }
  };

  const handleUploadGalleryFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const existingCount = (store.settings.customGalleryImages || []).length;
    const remainingSlots = Math.max(0, 60 - existingCount);
    if (remainingSlots === 0) {
      notifyAdmin('Custom gallery limit (60 uploads) reached. Delete a custom photo first.');
      return;
    }

    const selected = Array.from(files).slice(0, remainingSlots);
    setIsAddingGalleryImage(true);
    try {
      const createdItems: CustomGalleryPhotoItem[] = [];
      for (let i = 0; i < selected.length; i += 1) {
        const file = selected[i];
        const rawDataUrl = await new Promise<string>((resolve) => {
          compressImageFileToDataUrl(file, (url) => resolve(url), 900, 0.72);
        });
        const compactSrc = await compressImageSource(rawDataUrl, {
          maxDimension: 900,
          quality: 0.72,
          maxChars: 65_000
        });
        const fallbackTitle = file.name
          .replace(/\.[^.]+$/, '')
          .replace(/[_-]+/g, ' ')
          .trim();
        createdItems.push({
          id: `gal-custom-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          src: compactSrc || rawDataUrl,
          title:
            selected.length === 1 && newGalleryTitle.trim()
              ? newGalleryTitle.trim()
              : fallbackTitle || `Isabella ${newGalleryCategory}`,
          category: normalizeGalleryCategory(newGalleryCategory),
          featured: newGalleryFeatured,
          addedAt: new Date().toISOString()
        });
      }

      if (createdItems.length > 0) {
        onUpdateStore((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            customGalleryImages: [...createdItems, ...(prev.settings.customGalleryImages || [])]
          }
        }));
        setNewGalleryTitle('');
        notifyAdmin(`Added ${createdItems.length} photo${createdItems.length > 1 ? 's' : ''} to ${newGalleryCategory}!`);
      }
    } finally {
      setIsAddingGalleryImage(false);
    }
  };

  // Helper: Word counter
  const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

  // Auto-Publish 5 SEO-Complete Daily Tips (450+ words each)
  const handleAutoPublishDailyTips = () => {
    const newTips = generateAutoSeoTips();
    onUpdateStore(prev => ({
      ...prev,
      tips: [...newTips, ...prev.tips]
    }));
    notifyAdmin('✨ Auto-Published 5 Daily SEO Tips (450+ words each, Non-Adult & Adult 18+)!');
  };

  // Auto-Publish 10 SEO-Complete Daily Blog Posts (850+ words each)
  const handleAutoPublishDailyBlogs = () => {
    const newBlogs = generateAutoSeoBlogs(store.settings.categories);
    onUpdateStore(prev => ({
      ...prev,
      blogs: [...newBlogs, ...prev.blogs]
    }));
    notifyAdmin('✨ Auto-Published 10 Daily SEO Blog Articles (850+ words each across categories)!');
  };

  // Save Page (with automatic banner image optimization)
  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage || isOptimizingBanner) return;

    setIsOptimizingBanner(true);
    try {
      const optimizedBanner = editingPage.bannerImage
        ? await compressImageSource(editingPage.bannerImage, {
            maxDimension: 1280,
            quality: 0.78,
            maxChars: 105_000
          })
        : '';

      const finalPage: ExtraPageItem = {
        ...editingPage,
        bannerImage: optimizedBanner
      };

      onUpdateStore(prev => {
        const exists = prev.pages.some(p => p.id === finalPage.id);
        const updatedPages = exists
          ? prev.pages.map(p => p.id === finalPage.id ? finalPage : p)
          : [finalPage, ...prev.pages];
        const nextSettings = { ...prev.settings };
        if ((finalPage.id === 'page-about' || finalPage.slug === 'about') && finalPage.bannerImage) {
          nextSettings.aboutImage = finalPage.bannerImage;
        }
        if ((finalPage.id === 'page-concierge' || finalPage.slug === 'concierge') && finalPage.bannerImage) {
          nextSettings.conciergeImage = finalPage.bannerImage;
        }
        return { ...prev, settings: nextSettings, pages: updatedPages };
      });

      setIsPageModalOpen(false);
      setEditingPage(null);
      notifyAdmin('Page & banner optimized and saved cleanly!');
    } finally {
      setIsOptimizingBanner(false);
    }
  };

  const handleTogglePageStatus = (id: string) => {
    onUpdateStore(prev => ({
      ...prev,
      pages: prev.pages.map(p =>
        p.id === id ? { ...p, status: p.status === 'published' ? 'draft' : 'published' } : p
      )
    }));
  };

  // Delete Page
  const handleDeletePage = (id: string) => {
    onUpdateStore(prev => ({
      ...prev,
      pages: prev.pages.filter(p => p.id !== id)
    }));
    notifyAdmin('Standalone page deleted.');
  };

  // Approve / Reject / Reset Comment
  const handleCommentStatus = (id: string, status: 'pending' | 'approved' | 'rejected') => {
    onUpdateStore(prev => ({
      ...prev,
      comments: prev.comments.map(c => c.id === id ? { ...c, status } : c)
    }));
    if (status === 'approved') {
      notifyAdmin('Comment approved and published to post.');
    } else if (status === 'rejected') {
      notifyAdmin('Comment rejected and hidden from public view.');
    } else {
      notifyAdmin('Comment moved back to pending queue.');
    }
  };

  const handleBulkApprovePendingComments = () => {
    const pendingTotal = store.comments.filter(c => c.status === 'pending').length;
    if (pendingTotal === 0) return;
    onUpdateStore(prev => ({
      ...prev,
      comments: prev.comments.map(c => c.status === 'pending' ? { ...c, status: 'approved' } : c)
    }));
    notifyAdmin(`Approved ${pendingTotal} pending ${pendingTotal === 1 ? 'comment' : 'comments'}.`);
  };

  // Delete Comment
  const handleDeleteComment = (id: string) => {
    onUpdateStore(prev => ({
      ...prev,
      comments: prev.comments.filter(c => c.id !== id)
    }));
    notifyAdmin('Comment removed.');
  };

  // Update Passcode
  const handleUpdatePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasscode.trim().length < 4) {
      notifyAdmin('Passcode must be at least 4 characters.');
      return;
    }

    onUpdateStore(prev => ({
      ...prev,
      settings: { ...prev.settings, adminPasscode: newPasscode.trim() }
    }));
    setPasscodeSuccessMsg('Passcode updated successfully and persisted to store!');
    setNewPasscode('');
    setTimeout(() => setPasscodeSuccessMsg(''), 4000);
  };

  // Add Category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    if (store.settings.categories.includes(newCategoryName.trim())) {
      notifyAdmin('Category already exists.');
      return;
    }

    onUpdateStore(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        categories: [...prev.settings.categories, newCategoryName.trim()]
      }
    }));
    setNewCategoryName('');
    notifyAdmin('Category added!');
  };

  // Delete Category
  const handleDeleteCategory = (cat: string) => {
    onUpdateStore(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        categories: prev.settings.categories.filter(c => c !== cat)
      }
    }));
    notifyAdmin(`Category "${cat}" removed.`);
  };

  // Generic File Downloader
  const downloadTextFile = (filename: string, content: string, mime = 'text/plain;charset=utf-8') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notifyAdmin(`Downloaded ${filename}!`);
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    downloadTextFile(`isabella_backup_${Date.now()}.json`, JSON.stringify(store, null, 2), 'application/json;charset=utf-8');
  };

  // Download Netlify Config (netlify.toml)
  const handleDownloadNetlifyToml = () => {
    const toml = `[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
`;
    downloadTextFile('netlify.toml', toml);
  };

  // Download _redirects
  const handleDownloadRedirects = () => {
    downloadTextFile('_redirects', '/*    /index.html   200\n');
  };

  // Download Production index.html with <head> Analytics & Ad Codes baked in
  const handleDownloadIndexHtml = () => {
    const customHead = (store.settings.customHeadHtml || '').trim();
    const html = `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${store.settings.siteNameEn || 'Isabella Rose | Official VIP Blog & Members Lounge'}</title>
    <meta name="description" content="${store.settings.taglineEn || 'Exclusive lifestyle, fashion, food guides, and VIP member sanctuary.'}" />
    <meta property="og:title" content="${store.settings.siteNameEn || 'Isabella Rose | Official VIP Blog'}" />
    <meta property="og:description" content="${store.settings.taglineEn || 'Luxury lifestyle, fashion, and private VIP sanctuary.'}" />
    <meta property="og:type" content="website" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
${customHead ? `    <!-- Custom Analytics / AdSense / Verification Header Code -->\n${customHead}` : ''}
  </head>
  <body class="bg-[#09080b] text-[#f4efe8] antialiased selection:bg-[#c99757] selection:text-black">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
    downloadTextFile('index.html', html, 'text/html;charset=utf-8');
  };

  // Download GitHub Actions Auto-Deploy Workflow
  const handleDownloadGitHubWorkflow = () => {
    const yml = `name: Auto-Deploy to Netlify on GitHub Push

on:
  push:
    branches:
      - main
      - master

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run build
      - uses: nwtgck/actions-netlify@v3
        with:
          publish-dir: "./dist"
          production-branch: main
          github-token: \${{ secrets.GITHUB_TOKEN }}
        env:
          NETLIFY_AUTH_TOKEN: \${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: \${{ secrets.NETLIFY_SITE_ID }}
`;
    downloadTextFile('netlify-deploy.yml', yml, 'text/yaml;charset=utf-8');
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.settings && parsed.videos && parsed.blogs) {
          onUpdateStore(() => parsed);
          notifyAdmin('Backup restored successfully!');
        } else {
          notifyAdmin('Invalid backup file format.');
        }
      } catch (err) {
        notifyAdmin('Failed to parse backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#09080c] text-stone-200 flex flex-col font-sans">
      {/* Top Bar - Kinetivo Style */}
      <header className="h-16 bg-[#110f17] border-b border-stone-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c99757] to-[#e7c792] flex items-center justify-center font-bold text-black text-xs">
            IR
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm">ISABELLA VIP Admin</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
              SECURE
            </span>
          </div>
          <span className="text-xs text-stone-500 hidden sm:inline ml-2">
            Passcode: <strong className="text-[#e7c792] font-mono">{store.settings.adminPasscode}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          {/* Cloud Sync Status & 1-Click Connect */}
          {cloudUserEmail ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[11px] font-medium">
              <span className={`w-2 h-2 rounded-full ${cloudSyncStatus === 'syncing' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              <span>
                {cloudSyncStatus === 'syncing'
                  ? 'Syncing to Cloud...'
                  : `Cloud Synced (${cloudUserEmail.split('@')[0]})`}
              </span>
              {onDisconnectCloudSync && (
                <button
                  type="button"
                  onClick={onDisconnectCloudSync}
                  className="ml-1 text-[10px] text-stone-400 hover:text-white underline"
                  title="Sign out Google Cloud Sync"
                >
                  Disconnect
                </button>
              )}
            </div>
          ) : (
            onConnectCloudSync && (
              <button
                type="button"
                onClick={onConnectCloudSync}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center gap-1.5 transition-all shadow-md"
                title={cloudSyncError || 'Connect Google Account to sync edits across all browsers and devices'}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Connect Cloud Sync (Cross-Browser)</span>
              </button>
            )
          )}

          {/* Live Front Text Editor Toggle */}
          <button
            onClick={onToggleLiveEditor}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${isLiveEditorActive ? 'bg-amber-500 text-black font-bold shadow-lg' : 'bg-[#181520] hover:bg-[#201c2c] text-amber-300 border border-amber-500/30'}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLiveEditorActive ? 'Live Editor Active' : 'Live Page & Photo Editor'}</span>
          </button>

          {/* View Site */}
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Site</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      {/* Inline Admin Notification Toast */}
      {adminNotice && (
        <div className="fixed bottom-6 right-6 z-[60] px-4 py-2.5 rounded-xl bg-[#181224] border border-[#e5b36b] text-[#f6e2bb] text-xs font-medium shadow-2xl flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#e5b36b]" />
          <span>{adminNotice}</span>
        </div>
      )}
    </header>

      {/* Main Layout: Left Sidebar + Center Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-[#110f17] border-r border-stone-800 flex flex-col justify-between p-4 shrink-0 overflow-y-auto">
          <nav className="space-y-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('videos')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'videos' ? 'bg-[#c99757] text-stone-950 font-semibold shadow-md' : 'text-stone-400 hover:text-white hover:bg-stone-800/60'}`}
            >
              <Video className="w-4 h-4" />
              <span>Video & Media ({store.videos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('blogs')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'blogs' ? 'bg-[#c99757] text-stone-950 font-semibold shadow-md' : 'text-stone-400 hover:text-white hover:bg-stone-800/60'}`}
            >
              <FileText className="w-4 h-4" />
              <span>Blog Posts ({store.blogs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('tips')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'tips' ? 'bg-[#c99757] text-stone-950 font-semibold shadow-md' : 'text-stone-400 hover:text-white hover:bg-stone-800/60'}`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4" />
                <span>Tips & Masterclass</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-stone-800 text-[#e7c792] text-[10px] font-bold">
                {store.tips.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pages')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'pages' ? 'bg-[#c99757] text-stone-950 font-semibold shadow-md' : 'text-stone-400 hover:text-white hover:bg-stone-800/60'}`}
            >
              <Layers className="w-4 h-4" />
              <span>Extra Pages ({store.pages.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'gallery' ? 'bg-[#c99757] text-stone-950 font-semibold shadow-md' : 'text-stone-400 hover:text-white hover:bg-stone-800/60'}`}
            >
              <div className="flex items-center gap-3">
                <Camera className="w-4 h-4" />
                <span>Gallery Archive</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-stone-800 text-[#e7c792] text-[10px] font-bold tabular-nums">
                {resolvedGalleryPhotos.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('showreel')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'showreel' ? 'bg-[#c99757] text-stone-950 font-semibold shadow-md' : 'text-stone-400 hover:text-white hover:bg-stone-800/60'}`}
            >
              <Film className="w-4 h-4" />
              <span>Images, Copy & Reel</span>
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'comments' ? 'bg-[#c99757] text-stone-950 font-semibold shadow-md' : 'text-stone-400 hover:text-white hover:bg-stone-800/60'}`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>Comment Moderation</span>
              </div>
              {store.comments.filter(c => c.status === 'pending').length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-bold tabular-nums">
                  {store.comments.filter(c => c.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'analytics' ? 'bg-[#c99757] text-stone-950 font-semibold shadow-md' : 'text-stone-400 hover:text-white hover:bg-stone-800/60'}`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'analytics' ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-800 text-[#e7c792]'}`}>
                D3
              </span>
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'members' ? 'bg-[#c99757] text-stone-950 font-semibold shadow-md' : 'text-stone-400 hover:text-white hover:bg-stone-800/60'}`}
            >
              <Users className="w-4 h-4" />
              <span>VIP Members ({store.members.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-[#c99757] text-stone-950 font-semibold shadow-md' : 'text-stone-400 hover:text-white hover:bg-stone-800/60'}`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Settings & Security</span>
            </button>
          </nav>

          {/* Backup Box */}
          <div className="p-3 bg-[#15121b] border border-stone-800 rounded-xl space-y-2 mt-4">
            <div className="text-[11px] font-semibold text-[#e7c792] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Data Persistence & Backup
            </div>
            <p className="text-[10px] text-stone-400 leading-tight">
              Export all videos, blogs, pages & settings to JSON, or restore anytime.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleExportJSON}
                className="flex-1 py-1 px-2 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-[10px] text-stone-300 font-medium transition-colors"
              >
                Export JSON
              </button>
              <label className="flex-1 py-1 px-2 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-[10px] text-stone-300 font-medium text-center cursor-pointer transition-colors">
                Import
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#09080c]">
          {/* Overview Metrics Strip — includes Email Subscribers Count widget */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 rounded-2xl bg-[#110f17] border border-stone-800 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#c99757]/12 border border-[#c99757]/30 flex items-center justify-center text-[#e7c792] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-stone-400">
                    Email Subscribers Count
                  </div>
                  <div className="flex items-baseline gap-2.5 mt-0.5">
                    <span className="text-2xl font-bold text-white tracking-tight tabular-nums">
                      {!cloudUserEmail
                        ? '—'
                        : subscriberLoading && subscriberCount === null
                          ? '...'
                          : (subscriberCount ?? 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-stone-400">
                      {cloudUserEmail
                        ? subscriberError
                          ? subscriberError
                          : latestSubscriberAt
                            ? `Footer dispatches · Latest ${new Date(latestSubscriberAt).toLocaleDateString()}`
                            : 'Collected from footer signup form'
                        : 'Connect Cloud Sync to view live footer signups'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {cloudUserEmail ? (
                  <button
                    type="button"
                    onClick={handleRefreshSubscribers}
                    disabled={subscriberLoading}
                    className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-medium text-stone-200 inline-flex items-center gap-1.5 transition-colors disabled:opacity-60 whitespace-nowrap shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${subscriberLoading ? 'animate-spin' : ''}`} />
                    <span>{subscriberLoading ? 'Refreshing' : 'Refresh'}</span>
                  </button>
                ) : (
                  onConnectCloudSync && (
                    <button
                      type="button"
                      onClick={onConnectCloudSync}
                      className="px-3.5 py-2 rounded-xl bg-[#c99757] hover:bg-[#d6a567] text-stone-950 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Connect Sync</span>
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-[#110f17] border border-stone-800 px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-medium text-stone-400">
                  VIP Members
                </div>
                <div className="text-2xl font-bold text-white tracking-tight tabular-nums mt-0.5">
                  {store.members.length.toLocaleString()}
                </div>
                <div className="text-xs text-stone-400 mt-0.5">
                  Active patron records
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('members')}
                className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-medium text-stone-300 transition-colors whitespace-nowrap shrink-0"
              >
                View List
              </button>
            </div>
          </div>

          {/* TAB 1: VIDEOS & ADS MANAGEMENT */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Video & Media Management ({store.videos.length})
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    Manage 4K video reels, boudoir stills, brand collaborations, and featured homepage items.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingVideo({
                      id: `vid-${Date.now()}`,
                      brandName: 'Isabella Studio',
                      category: 'Fashion',
                      type: 'video',
                      titleEn: '',
                      titleBn: '',
                      descriptionEn: '',
                      descriptionBn: '',
                      embedLink: '',
                      thumbnailUrl: PRESET_THUMBNAILS[0],
                      duration: '0:30',
                      viewsCount: '10K',
                      status: 'Published',
                      featuredOnHome: true,
                      isPrivateVIP: false,
                      isShareToUnlock: false
                    });
                    setIsVideoModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#c99757] hover:bg-[#d6a567] text-stone-950 font-semibold text-xs flex items-center gap-1.5 transition-colors self-start shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Add New Video
                </button>
              </div>

              {/* Video Table List */}
              <div className="bg-[#110f17] border border-stone-800 rounded-2xl overflow-x-auto shadow-xl">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-[#16131e] text-[11px] uppercase tracking-wider text-stone-400 border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Preview</th>
                      <th className="py-3 px-4">Brand & Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Metrics</th>
                      <th className="py-3 px-4">Privacy / Tier</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Featured</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80">
                    {store.videos.map((vid) => (
                      <tr key={vid.id} className="hover:bg-[#16131e]/50 transition-colors">
                        <td className="py-3 px-4">
                          <img
                            src={resolveAssetUrl(vid.thumbnailUrl)}
                            alt=""
                            className="w-14 h-10 object-cover rounded bg-stone-900 border border-stone-800"
                          />
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] uppercase font-bold text-[#c99757]">{vid.brandName}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 uppercase">
                              {vid.type === 'gallery' ? `Gallery (${vid.galleryImages?.length || 1})` : 'Video'}
                            </span>
                          </div>
                          <span className="font-semibold text-white block truncate">{vid.titleEn || vid.titleBn}</span>
                          <span className="text-[11px] text-stone-400 block truncate">{vid.descriptionEn}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-300 text-[11px]">
                            {vid.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-stone-400 font-mono">
                          <div>⏱ {vid.duration}</div>
                          <div>👁 {vid.viewsCount}</div>
                        </td>
                        <td className="py-3 px-4">
                          {vid.isPrivateVIP ? (
                            <div className="flex flex-col gap-1 items-start">
                              <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/40 text-[10px] font-bold uppercase inline-flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" /> VIP Vault
                              </span>
                              {vid.isShareToUnlock && (
                                <span className="text-[9px] text-sky-300">+ Share-to-Unlock</span>
                              )}
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-800 text-[10px]">
                              Public
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleVideoStatus(vid.id)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase border transition-colors ${vid.status === 'Published' ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/80' : 'bg-stone-900 text-amber-300 border-amber-500/30 hover:bg-stone-800'}`}
                            title="Click to toggle Published / Draft"
                          >
                            {vid.status}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleFeatured(vid.id)}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${vid.featuredOnHome ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-stone-900 text-stone-500 border border-stone-800'}`}
                          >
                            {vid.featuredOnHome ? '★ On Home' : 'Add to Home'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingVideo(vid);
                              setIsVideoModalOpen(true);
                            }}
                            className="p-1.5 text-stone-400 hover:text-white rounded hover:bg-stone-800 transition-colors"
                            title="Edit Video"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(vid.id)}
                            className="p-1.5 text-stone-400 hover:text-red-400 rounded hover:bg-stone-800 transition-colors"
                            title="Delete Video"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: BLOG POSTS MANAGEMENT */}
          {activeTab === 'blogs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Blog Posts Management ({store.blogs.length})
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    Create &amp; publish unlimited-length SEO articles with rich formatting and photos, or auto-post 10 full category stories daily (850+ words min).
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleAutoPublishDailyBlogs}
                    className="px-3.5 py-2 rounded-xl bg-[#c99757]/20 hover:bg-[#c99757]/30 border border-[#c99757]/40 text-[#f6e2bb] font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 text-[#e5b36b]" />
                    Auto-Post 10 Daily SEO Blogs
                  </button>
                  <button
                    onClick={() => {
                      setBlogPreviewMode(false);
                      setEditingBlog({
                        id: `blog-${Date.now()}`,
                        titleEn: '',
                        titleBn: '',
                        slug: '',
                        category:
                          selectedBlogCategoryFilter !== 'All'
                            ? selectedBlogCategoryFilter
                            : store.settings.categories[0] || 'Fashion',
                        subtitle: '',
                        bannerImage: PRESET_THUMBNAILS[0],
                        content: '',
                        showInHeader: false,
                        showInFooter: true,
                        featuredOnHome: true,
                        status: 'published',
                        date: formatTodayDate(),
                        readTime: '6 min read',
                        isPrivateVIP: false,
                        isShareToUnlock: false,
                        likes: 0,
                        seoTitle: '',
                        seoDescription: '',
                        seoKeywords: ''
                      });
                      setIsBlogModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#c99757] hover:bg-[#d6a567] text-stone-950 font-semibold text-xs flex items-center gap-1.5 transition-colors self-start shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Create Blog Post
                  </button>
                </div>
              </div>

              {/* BLOG CATEGORIES MANAGER */}
              <div className="p-5 rounded-2xl bg-[#110f17] border border-stone-800 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Blog Categories Manager (ক্যাটাগরি যোগ / রিমুভ ও সিলেক্ট করুন)
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      Click a category to filter &amp; pre-select for new posts, add new categories, or click × to remove.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="New category (e.g. Travel Diaries)"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-56 bg-[#09080d] border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c99757]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-3.5 py-1.5 rounded-lg bg-[#c99757] hover:bg-[#d6a567] text-stone-950 text-xs font-semibold transition-colors shrink-0"
                    >
                      + Add Category
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedBlogCategoryFilter('All')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selectedBlogCategoryFilter === 'All' ? 'bg-[#c99757] text-stone-950 border-[#c99757] font-semibold' : 'bg-[#181520] border-stone-700 text-stone-300 hover:text-white'}`}
                  >
                    All ({store.blogs.length})
                  </button>
                  {store.settings.categories.map((cat) => (
                    <div
                      key={cat}
                      className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 transition-colors ${selectedBlogCategoryFilter === cat ? 'bg-[#c99757]/20 border-[#c99757] text-[#f6e2bb] font-semibold' : 'bg-[#181520] border-stone-700 text-stone-300'}`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedBlogCategoryFilter(cat)}
                        className="hover:text-white"
                      >
                        {cat} ({store.blogs.filter(b => b.category === cat).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedBlogCategoryFilter === cat) setSelectedBlogCategoryFilter('All');
                          handleDeleteCategory(cat);
                        }}
                        className="text-stone-500 hover:text-red-400 transition-colors"
                        title={`Delete category "${cat}"`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blog Table */}
              <div className="bg-[#110f17] border border-stone-800 rounded-2xl overflow-x-auto shadow-xl">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-[#16131e] text-[11px] uppercase tracking-wider text-stone-400 border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Title &amp; Subtitle</th>
                      <th className="py-3 px-4">Slug URL</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Access Tier</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Home Feature</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80">
                    {store.blogs
                      .filter(b => selectedBlogCategoryFilter === 'All' || b.category === selectedBlogCategoryFilter)
                      .map((b) => (
                      <tr key={b.id} className="hover:bg-[#16131e]/50 transition-colors">
                        <td className="py-3 px-4 max-w-sm">
                          <span className="font-semibold text-white block">{b.titleEn || b.titleBn}</span>
                          <span className="text-[11px] text-stone-400 block truncate">{b.subtitle}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#e7c792]">
                          /blog/{b.slug}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-300 text-[11px]">
                            {b.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {b.isPrivateVIP ? (
                            <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/40 text-[10px] font-bold uppercase inline-flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> VIP Exclusive
                            </span>
                          ) : (
                            <span className="text-stone-400 text-[11px]">Public</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleBlogStatus(b.id)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase border transition-colors ${b.status === 'published' ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/80' : 'bg-stone-900 text-amber-300 border-amber-500/30 hover:bg-stone-800'}`}
                            title="Click to toggle Published / Draft"
                          >
                            {b.status === 'published' ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleBlogHome(b.id)}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${b.featuredOnHome ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-stone-900 text-stone-500 border border-stone-800'}`}
                          >
                            {b.featuredOnHome ? '★ On Home' : 'Add to Home'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-stone-400">{b.date}</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setBlogPreviewMode(false);
                              setEditingBlog(b);
                              setIsBlogModalOpen(true);
                            }}
                            className="p-1.5 text-stone-400 hover:text-white rounded hover:bg-stone-800 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(b.id)}
                            className="p-1.5 text-stone-400 hover:text-red-400 rounded hover:bg-stone-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TIPS & MASTERCLASS MANAGEMENT */}
          {activeTab === 'tips' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Tips &amp; Masterclasses Management ({store.tips.length})
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    Manage unlimited-length Non-Adult and Adult 18+ lifestyle, styling, dining, and intimacy tips. Auto-publish 5 category tips daily (450+ words min).
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleAutoPublishDailyTips}
                    className="px-3.5 py-2 rounded-xl bg-[#c99757]/20 hover:bg-[#c99757]/30 border border-[#c99757]/40 text-[#f6e2bb] font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 text-[#e5b36b]" />
                    Auto-Post 5 Daily Tips
                  </button>
                  <button
                    onClick={() => {
                      setTipPreviewMode(false);
                      setEditingTip({
                        id: `tip-${Date.now()}`,
                        title: '',
                        category: 'Feminine Confidence',
                        isAdult18: false,
                        image: PRESET_THUMBNAILS[0],
                        content: '',
                        readTime: '5 min read',
                        date: formatTodayDate(),
                        status: 'published',
                        featuredOnHome: true,
                        isPrivateVIP: false,
                        isShareToUnlock: false,
                        likes: 0,
                        seoTitle: '',
                        seoDescription: '',
                        seoKeywords: ''
                      });
                      setIsTipModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#c99757] hover:bg-[#d6a567] text-stone-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Tip
                  </button>
                </div>
              </div>

              {/* Tips Table */}
              <div className="bg-[#110f17] border border-stone-800 rounded-2xl overflow-x-auto shadow-xl">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-[#16131e] text-[11px] uppercase tracking-wider text-stone-400 border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Preview</th>
                      <th className="py-3 px-4">Title &amp; Excerpt</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">18+ / Adult</th>
                      <th className="py-3 px-4">Access Tier</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Home Feature</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80">
                    {store.tips.map((tip) => (
                      <tr key={tip.id} className="hover:bg-[#16131e]/50 transition-colors">
                        <td className="py-3 px-4">
                          <img
                            src={resolveAssetUrl(tip.image)}
                            alt=""
                            className="w-14 h-10 object-cover rounded bg-stone-900 border border-stone-800"
                          />
                        </td>
                        <td className="py-3 px-4 max-w-sm">
                          <span className="font-semibold text-white block">{tip.title}</span>
                          <span className="text-[11px] text-stone-400 block truncate">{tip.content}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-300 text-[11px]">
                            {tip.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {tip.isAdult18 ? (
                            <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40 text-[10px] font-bold uppercase">
                              🔞 Adult 18+
                            </span>
                          ) : (
                            <span className="text-stone-400 text-[11px]">Non-Adult</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {tip.isPrivateVIP || tip.isShareToUnlock ? (
                            <div className="flex flex-col gap-1 items-start">
                              {tip.isPrivateVIP && (
                                <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/40 text-[10px] font-bold uppercase inline-flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" /> VIP Vault
                                </span>
                              )}
                              {tip.isShareToUnlock && (
                                <span className="px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-500/30 text-[10px] font-semibold">
                                  Share-to-Unlock
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-stone-400 text-[11px]">Free</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleTipStatus(tip.id)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase border transition-colors ${tip.status === 'published' ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/80' : 'bg-stone-900 text-amber-300 border-amber-500/30 hover:bg-stone-800'}`}
                            title="Click to toggle Published / Draft"
                          >
                            {tip.status === 'published' ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleTipHome(tip.id)}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${tip.featuredOnHome ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-stone-900 text-stone-500 border border-stone-800'}`}
                          >
                            {tip.featuredOnHome ? '★ On Home' : 'Add to Home'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setTipPreviewMode(false);
                              setEditingTip(tip);
                              setIsTipModalOpen(true);
                            }}
                            className="p-1.5 text-stone-400 hover:text-white rounded hover:bg-stone-800 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTip(tip.id)}
                            className="p-1.5 text-stone-400 hover:text-red-400 rounded hover:bg-stone-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: EXTRA PAGES MANAGEMENT */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Extra Pages Management ({store.pages.length})
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    Edit About Isabella, Membership Tiers, Private Concierge, VIP Terms, or create custom rich-text pages with photos &amp; SEO meta.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPagePreviewMode(false);
                    setEditingPage({
                      id: `page-${Date.now()}`,
                      titleEn: '',
                      titleBn: '',
                      slug: '',
                      bannerImage: PRESET_THUMBNAILS[0],
                      content: '',
                      showInHeader: false,
                      showInFooter: true,
                      status: 'published',
                      lastUpdated: formatTodayDate(),
                      seoTitle: '',
                      seoDescription: '',
                      seoKeywords: ''
                    });
                    setIsPageModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#c99757] hover:bg-[#d6a567] text-stone-950 font-semibold text-xs flex items-center gap-1.5 transition-colors self-start shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Create New Page
                </button>
              </div>

              {/* Pages Table */}
              <div className="bg-[#110f17] border border-stone-800 rounded-2xl overflow-x-auto shadow-xl">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-[#16131e] text-[11px] uppercase tracking-wider text-stone-400 border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Banner</th>
                      <th className="py-3 px-4">Page Title</th>
                      <th className="py-3 px-4">Direct Route URL</th>
                      <th className="py-3 px-4">Visibility</th>
                      <th className="py-3 px-4">Status (1-Click)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80">
                    {store.pages.map((p) => (
                      <tr key={p.id} className="hover:bg-[#16131e]/50 transition-colors">
                        <td className="py-3 px-4">
                          {p.bannerImage ? (
                            <img
                              src={resolveAssetUrl(p.bannerImage)}
                              alt=""
                              className="w-14 h-10 object-cover rounded bg-stone-900 border border-stone-800"
                            />
                          ) : (
                            <div className="w-14 h-10 rounded bg-stone-900 border border-stone-800 flex items-center justify-center text-[10px] text-stone-500">
                              Text
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 max-w-sm">
                          <span className="font-semibold text-white block">{p.titleEn}</span>
                          <span className="text-[11px] text-stone-400 block truncate">{p.seoDescription || `Updated ${p.lastUpdated}`}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#e7c792]">
                          /page/{p.slug}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-stone-400">
                          {p.showInHeader && <span className="text-emerald-400 mr-2">● Header</span>}
                          {p.showInFooter && <span className="text-sky-400">● Footer</span>}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleTogglePageStatus(p.id)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase border transition-colors ${p.status === 'published' ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/80' : 'bg-stone-900 text-amber-300 border-amber-500/30 hover:bg-stone-800'}`}
                            title="Click to toggle Published / Draft"
                          >
                            {p.status === 'published' ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setPagePreviewMode(false);
                              setEditingPage(p);
                              setIsPageModalOpen(true);
                            }}
                            className="p-1.5 text-stone-400 hover:text-white rounded hover:bg-stone-800 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePage(p.id)}
                            className="p-1.5 text-stone-400 hover:text-red-400 rounded hover:bg-stone-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PHOTOGRAPHY GALLERY ARCHIVE */}
          {activeTab === 'gallery' && (() => {
            const featuredCount = resolvedGalleryPhotos.filter((p) => p.featured).length;
            const customCount = resolvedGalleryPhotos.filter((p) => p.isCustom).length;
            const query = gallerySearch.trim().toLowerCase();
            const filteredAdminGallery = resolvedGalleryPhotos.filter((p) => {
              const matchesCategory =
                galleryCategoryFilter === 'All'
                  ? true
                  : galleryCategoryFilter === 'Featured Hot'
                    ? p.featured
                    : p.category === galleryCategoryFilter;
              const matchesSearch =
                !query ||
                p.title.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query) ||
                p.filename.toLowerCase().includes(query);
              return matchesCategory && matchesSearch;
            });

            const assignPhotoToSlot = (slot: 'heroBgImage' | 'aboutImage' | 'conciergeImage' | 'showreelThumbnail', src: string, label: string) => {
              onUpdateStore((prev) => ({
                ...prev,
                settings: {
                  ...prev.settings,
                  [slot]: src
                },
                pages: prev.pages.map((pg) =>
                  (slot === 'aboutImage' && (pg.id === 'page-about' || pg.slug === 'about')) ||
                  (slot === 'conciergeImage' && (pg.id === 'page-concierge' || pg.slug === 'concierge'))
                    ? { ...pg, bannerImage: src }
                    : pg
                )
              }));
              notifyAdmin(`Updated ${label} image.`);
            };

            const galleryPageObj = store.pages.find((p) => p.id === 'page-gallery' || p.slug === 'gallery');

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      Isabella Photography Gallery ({resolvedGalleryPhotos.length} Photos)
                    </h2>
                    <p className="text-xs text-stone-400 mt-1">
                      Manage the public /gallery page ({featuredCount} Featured Hot · {customCount} Custom Added). Toggle Featured status, add or remove photos, copy URLs, or assign to Hero/About/Showreel.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab('settings')}
                      className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-[#c99757]/40 text-xs font-medium text-[#f6e2bb] flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#c99757]" />
                      <span>Add / Manage in Settings</span>
                    </button>
                    {galleryPageObj && (
                      <button
                        type="button"
                        onClick={() => {
                          setPagePreviewMode(false);
                          setEditingPage(galleryPageObj);
                          setIsPageModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-medium text-stone-200 flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#c99757]" />
                        <span>Edit Gallery Page SEO</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleExplicitSaveSettings}
                      className="px-4 py-2 rounded-xl bg-[#c99757] hover:bg-[#d6a567] text-stone-950 font-semibold text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Gallery Settings</span>
                    </button>
                  </div>
                </div>

                {/* Search & Category Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#110f17] border border-stone-800 rounded-2xl p-4">
                  <div className="relative w-full lg:w-72">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="search"
                      value={gallerySearch}
                      onChange={(e) => setGallerySearch(e.target.value)}
                      placeholder="Filter by title or filename..."
                      className="w-full bg-[#09080d] border border-stone-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['All', ...GALLERY_CATEGORIES] as Array<'All' | GalleryCategory>).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setGalleryCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                          galleryCategoryFilter === cat
                            ? 'bg-[#c99757] text-stone-950 font-semibold'
                            : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin Photo Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredAdminGallery.map((photo) => (
                    <div
                      key={photo.id}
                      className={`rounded-2xl border bg-[#110f17] overflow-hidden flex flex-col ${
                        photo.featured ? 'border-[#c99757]/60' : 'border-stone-800'
                      }`}
                    >
                      <div className="relative aspect-[4/3] bg-black overflow-hidden">
                        <img
                          src={photo.src}
                          alt={photo.title}
                          loading="lazy"
                          className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          {photo.featured && (
                            <span className="px-2 py-0.5 rounded bg-[#c99757] text-stone-950 text-[10px] font-bold inline-flex items-center gap-1">
                              <Flame className="w-3 h-3" />
                              Featured
                            </span>
                          )}
                          {photo.isCustom && (
                            <span className="px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold">
                              Custom
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between text-xs">
                        <div>
                          <div className="text-[10px] text-[#e7c792] font-medium truncate">
                            {photo.category}
                          </div>
                          <div className="font-semibold text-white truncate" title={photo.title}>
                            {photo.title}
                          </div>
                          <div className="text-[10px] font-mono text-stone-500 truncate mt-0.5">
                            {photo.filename}
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1 border-t border-stone-800/80">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleGalleryFeatured(photo)}
                              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium border transition-colors inline-flex items-center justify-center gap-1 ${
                                photo.featured
                                  ? 'bg-[#c99757]/20 text-[#f6e2bb] border-[#c99757]/50'
                                  : 'bg-stone-900 text-stone-300 border-stone-700 hover:bg-stone-800'
                              }`}
                            >
                              <Flame className="w-3 h-3" />
                              <span>{photo.featured ? 'Featured' : 'Feature'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteGalleryPhoto(photo)}
                              className="py-1.5 px-2.5 rounded-lg bg-stone-900 hover:bg-red-950/80 border border-stone-700 hover:border-red-500/50 text-stone-300 hover:text-red-300 text-[11px] inline-flex items-center gap-1 transition-colors"
                              title="Delete image from gallery & storage"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(photo.src).catch(() => {});
                                notifyAdmin(`Copied ${photo.src.slice(0, 60)}`);
                              }}
                              className="py-1.5 px-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300"
                              title="Copy image URL path"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1 text-[10px]">
                            <button
                              type="button"
                              onClick={() => assignPhotoToSlot('heroBgImage', photo.src, 'Hero Showcase')}
                              className="flex-1 py-1 px-1.5 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 truncate"
                            >
                              Set Hero
                            </button>
                            <button
                              type="button"
                              onClick={() => assignPhotoToSlot('aboutImage', photo.src, 'About Portrait')}
                              className="flex-1 py-1 px-1.5 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 truncate"
                            >
                              Set About
                            </button>
                            <button
                              type="button"
                              onClick={() => assignPhotoToSlot('showreelThumbnail', photo.src, 'Showreel Cover')}
                              className="flex-1 py-1 px-1.5 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 truncate"
                            >
                              Set Reel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* TAB 6: SITE-WIDE IMAGES, PAGE COPY & SHOWREEL STUDIO */}
          {activeTab === 'showreel' && (
            <div className="max-w-4xl space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Site-Wide Images, Page Copy &amp; Showreel Studio
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    Upload custom images directly from your device or paste URLs for every page section, plus edit full page copy in one place.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExplicitSaveSettings}
                  className="px-5 py-2.5 rounded-xl bg-[#c99757] hover:bg-[#d6a567] text-stone-950 font-bold text-xs inline-flex items-center gap-2 shadow-lg shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Images &amp; Copy</span>
                </button>
              </div>

              {/* Site-Wide Visual Assets Matrix */}
              <div className="bg-[#110f17] border border-stone-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Every Site Image (1-Click Device Upload or Paste URL)</h3>
                    <p className="text-[11px] text-stone-400">Replace demo editorial photos anytime from your computer or direct image links.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {(
                    [
                      { key: 'heroBgImage', label: 'Hero Showcase Portrait' },
                      { key: 'avatarImage', label: 'Creator Avatar Badge' },
                      { key: 'aboutImage', label: 'About Isabella Portrait' },
                      { key: 'tipsFeatureImage1', label: 'Tips Page Photo #1 (Couture)' },
                      { key: 'tipsFeatureImage2', label: 'Tips Page Photo #2 (Radiance)' },
                      { key: 'tipsFeatureImage3', label: 'Tips Page Photo #3 (Boudoir)' },
                      { key: 'conciergeImage', label: 'Private Concierge Banner' },
                      { key: 'logoUrl', label: 'Top Navbar Custom Logo (Optional)' }
                    ] as Array<{ key: keyof SiteSettings; label: string }>
                  ).map(({ key, label }) => {
                    const currentVal = String(store.settings[key] || '');
                    return (
                      <div key={key} className="p-3.5 rounded-xl bg-[#09080d] border border-stone-800 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-stone-200">{label}</span>
                          <label className="px-2.5 py-1 rounded-lg bg-[#c99757]/20 hover:bg-[#c99757]/30 border border-[#c99757]/40 text-[#f6e2bb] text-[10px] font-semibold cursor-pointer inline-flex items-center gap-1 transition-colors">
                            <Upload className="w-3 h-3" />
                            <span>Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                                onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                readLocalImageFile(file, (dataUrl) => {
                                  onUpdateStore(prev => ({
                                    ...prev,
                                    settings: { ...prev.settings, [key]: dataUrl },
                                    pages: prev.pages.map(p =>
                                      (key === 'aboutImage' && p.slug === 'about') ||
                                      (key === 'conciergeImage' && p.slug === 'concierge')
                                        ? { ...p, bannerImage: dataUrl }
                                        : p
                                    )
                                  }));
                                });
                              }}
                            />
                          </label>
                        </div>
                        <div className="flex items-center gap-3">
                          {currentVal ? (
                            <img
                              src={resolveAssetUrl(currentVal)}
                              alt={label}
                              className="w-16 h-12 rounded-lg object-cover border border-stone-700 shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-12 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-[10px] text-stone-500 shrink-0">
                              None
                            </div>
                          )}
                          <input
                            type="text"
                            value={currentVal}
                            placeholder="Paste image URL or upload file..."
                            onChange={(e) => {
                              const nextVal = optimizeLinkedAssetUrl(e.target.value);
                              onUpdateStore(prev => ({
                                ...prev,
                                settings: { ...prev.settings, [key]: nextVal },
                                pages: prev.pages.map(p =>
                                  (key === 'aboutImage' && (p.id === 'page-about' || p.slug === 'about')) ||
                                  (key === 'conciergeImage' && (p.id === 'page-concierge' || p.slug === 'concierge'))
                                    ? { ...p, bannerImage: nextVal }
                                    : p
                                )
                              }));
                            }}
                            onBlur={(e) => {
                              const rawVal = e.target.value.trim();
                              if (!rawVal) return;
                              compressImageSource(rawVal, {
                                maxDimension: 1120,
                                quality: 0.78,
                                maxChars: 95_000
                              }).then((optimized) => {
                                if (!optimized || optimized === rawVal) return;
                                onUpdateStore(prev => ({
                                  ...prev,
                                  settings: { ...prev.settings, [key]: optimized },
                                  pages: prev.pages.map(p =>
                                    (key === 'aboutImage' && (p.id === 'page-about' || p.slug === 'about')) ||
                                    (key === 'conciergeImage' && (p.id === 'page-concierge' || p.slug === 'concierge'))
                                      ? { ...p, bannerImage: optimized }
                                      : p
                                  )
                                }));
                                notifyAdmin(`${label} compressed & optimized!`);
                              });
                            }}
                            className="flex-1 bg-[#120f1a] border border-stone-700 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono focus:outline-none focus:border-[#c99757]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Site-Wide Page Copy Editor */}
              <div className="bg-[#110f17] border border-stone-800 rounded-2xl p-6 space-y-4 text-xs">
                <h3 className="text-sm font-semibold text-white border-b border-stone-800 pb-3">
                  Page Copy & 1,000-Word Tips Feature Editor
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(
                    [
                      { key: 'heroHeadline', label: 'Homepage Hero Headline' },
                      { key: 'aboutHeadline', label: 'About Isabella Headline' },
                      { key: 'tipsFeatureHeadline', label: 'Tips Feature Page Headline' },
                      { key: 'conciergeHeadline', label: 'Private Concierge Headline' }
                    ] as Array<{ key: keyof FrontEditableTexts; label: string }>
                  ).map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-stone-300 font-medium mb-1">{label}</label>
                      <input
                        type="text"
                        value={store.frontTexts[key] || ''}
                        onChange={(e) => onUpdateStore(prev => ({
                          ...prev,
                          frontTexts: { ...prev.frontTexts, [key]: e.target.value }
                        }))}
                        className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c99757]"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">Homepage Hero Bio Paragraph</label>
                  <textarea
                    rows={2}
                    value={store.frontTexts.heroParagraph}
                    onChange={(e) => onUpdateStore(prev => ({
                      ...prev,
                      frontTexts: { ...prev.frontTexts, heroParagraph: e.target.value }
                    }))}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2.5 text-white leading-relaxed focus:outline-none focus:border-[#c99757]"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">About Isabella Full Biography</label>
                  <textarea
                    rows={3}
                    value={store.frontTexts.aboutBio}
                    onChange={(e) => onUpdateStore(prev => ({
                      ...prev,
                      frontTexts: { ...prev.frontTexts, aboutBio: e.target.value }
                    }))}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2.5 text-white leading-relaxed focus:outline-none focus:border-[#c99757]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-stone-300 font-medium">
                      Exclusive Feminine & Style Tips — Full Feature Monograph (use ## for section headings)
                    </label>
                    <span className="text-[11px] font-mono text-[#e7c792]">
                      Words: {countWords(store.frontTexts.tipsFeatureArticle || '')}
                    </span>
                  </div>
                  <textarea
                    rows={10}
                    value={store.frontTexts.tipsFeatureArticle}
                    onChange={(e) => onUpdateStore(prev => ({
                      ...prev,
                      frontTexts: { ...prev.frontTexts, tipsFeatureArticle: e.target.value }
                    }))}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-3 text-white leading-relaxed focus:outline-none focus:border-[#c99757]"
                  />
                </div>
              </div>

              {/* Showreel Video Settings */}
              <div className="bg-[#110f17] border border-stone-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white">Featured Showreel Cinema Settings</h3>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Showreel Title
                  </label>
                  <input
                    type="text"
                    value={store.settings.showreelTitle}
                    onChange={(e) => onUpdateStore(prev => ({
                      ...prev,
                      settings: { ...prev.settings, showreelTitle: e.target.value }
                    }))}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Video Embed Link (MP4, YouTube, Vimeo, or Wistia)
                  </label>
                  <input
                    type="text"
                    value={store.settings.showreelEmbedLink}
                    onChange={(e) => onUpdateStore(prev => ({
                      ...prev,
                      settings: { ...prev.settings, showreelEmbedLink: e.target.value }
                    }))}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#c99757]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Showreel Thumbnail Image URL
                  </label>
                  <input
                    type="text"
                    value={store.settings.showreelThumbnail}
                    onChange={(e) => onUpdateStore(prev => ({
                      ...prev,
                      settings: { ...prev.settings, showreelThumbnail: e.target.value }
                    }))}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#c99757]"
                  />
                </div>

                <div className="pt-2">
                  <div className="text-xs font-medium text-stone-400 mb-2">Live Preview</div>
                  <div className="aspect-video rounded-xl overflow-hidden border border-stone-800 bg-black">
                    <video
                      src={store.settings.showreelEmbedLink}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COMMENT MODERATION DASHBOARD */}
          {activeTab === 'comments' && (() => {
            const pendingCount = store.comments.filter(c => c.status === 'pending').length;
            const approvedCount = store.comments.filter(c => c.status === 'approved').length;
            const rejectedCount = store.comments.filter(c => c.status === 'rejected').length;

            const uniquePostTitles = Array.from(
              new Set(store.comments.map(c => c.postTitle).filter(Boolean))
            );

            const searchLower = commentSearch.trim().toLowerCase();
            const statusOrder: Record<string, number> = { pending: 0, approved: 1, rejected: 2 };

            const filteredComments = store.comments
              .filter(c => (commentStatusFilter === 'all' ? true : c.status === commentStatusFilter))
              .filter(c => (commentPostFilter === 'all' ? true : c.postTitle === commentPostFilter))
              .filter(c => {
                if (!searchLower) return true;
                return (
                  (c.authorName || '').toLowerCase().includes(searchLower) ||
                  (c.authorEmail || '').toLowerCase().includes(searchLower) ||
                  (c.postTitle || '').toLowerCase().includes(searchLower) ||
                  (c.commentText || '').toLowerCase().includes(searchLower)
                );
              })
              .sort((a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9));

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#e5b36b] font-medium">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Moderation Queue</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                      Comment Moderation
                    </h2>
                    <p className="text-xs text-stone-400 mt-1">
                      Inspect, approve, or reject user-submitted comments before they publish on Journal articles.
                    </p>
                  </div>

                  {pendingCount > 0 && (
                    <button
                      type="button"
                      onClick={handleBulkApprovePendingComments}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto shadow-md"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Approve All Pending ({pendingCount})</span>
                    </button>
                  )}
                </div>

                {/* Single-Elevation Moderation Metrics Strip */}
                <div className="rounded-2xl bg-[#110f17] border border-stone-800 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-stone-800">
                  <div className="p-4 space-y-1">
                    <span className="text-[11px] font-medium text-stone-400 block">Total Comments</span>
                    <span className="text-2xl font-bold text-white tabular-nums block">
                      {store.comments.length.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-4 space-y-1">
                    <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Review</span>
                    </span>
                    <span className="text-2xl font-bold text-white tabular-nums block">
                      {pendingCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-4 space-y-1">
                    <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Approved (Public)</span>
                    </span>
                    <span className="text-2xl font-bold text-white tabular-nums block">
                      {approvedCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-4 space-y-1">
                    <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5" />
                      <span>Rejected (Hidden)</span>
                    </span>
                    <span className="text-2xl font-bold text-white tabular-nums block">
                      {rejectedCount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="p-4 rounded-2xl bg-[#110f17] border border-stone-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { id: 'all', label: 'All', count: store.comments.length },
                        { id: 'pending', label: 'Pending', count: pendingCount },
                        { id: 'approved', label: 'Approved', count: approvedCount },
                        { id: 'rejected', label: 'Rejected', count: rejectedCount }
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setCommentStatusFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                          commentStatusFilter === tab.id
                            ? 'bg-[#c99757] text-stone-950 font-semibold'
                            : 'bg-[#09080d] text-stone-400 hover:text-white border border-stone-800'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums ${
                            commentStatusFilter === tab.id
                              ? 'bg-stone-950/20 text-stone-950'
                              : tab.id === 'pending' && tab.count > 0
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-stone-800 text-stone-300'
                          }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 lg:max-w-xl justify-end">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={commentSearch}
                        onChange={(e) => setCommentSearch(e.target.value)}
                        placeholder="Search author, post, or comment text..."
                        aria-label="Search comments"
                        className="w-full bg-[#09080d] border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#c99757]"
                      />
                    </div>

                    <select
                      value={commentPostFilter}
                      onChange={(e) => setCommentPostFilter(e.target.value)}
                      aria-label="Filter comments by post"
                      className="bg-[#09080d] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#c99757] max-w-[220px]"
                    >
                      <option value="all">All Posts ({uniquePostTitles.length})</option>
                      {uniquePostTitles.map((title) => (
                        <option key={title} value={title}>
                          {title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Comment Moderation List or Empty State */}
                {filteredComments.length === 0 ? (
                  <div className="p-10 rounded-2xl bg-[#110f17] border border-stone-800 text-center space-y-3">
                    <MessageSquare className="w-8 h-8 text-stone-500 mx-auto" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-white">
                        {commentStatusFilter === 'pending' && !commentSearch && commentPostFilter === 'all'
                          ? 'No pending comments awaiting moderation'
                          : 'No comments match the active filter'}
                      </h3>
                      <p className="text-xs text-stone-400 max-w-md mx-auto">
                        {commentStatusFilter === 'pending' && !commentSearch && commentPostFilter === 'all'
                          ? 'All user-submitted comments have been reviewed. New comments submitted on Journal posts will land here with Pending status.'
                          : 'Try clearing your search term or switching back to view all comment statuses.'}
                      </p>
                    </div>
                    {(commentStatusFilter !== 'all' || commentSearch || commentPostFilter !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setCommentStatusFilter('all');
                          setCommentSearch('');
                          setCommentPostFilter('all');
                        }}
                        className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-medium text-stone-200 transition-colors"
                      >
                        Show All Comments
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredComments.map((com) => {
                      const hasEmail = Boolean(com.authorEmail && com.authorEmail.trim());
                      return (
                        <div
                          key={com.id}
                          className={`p-4 bg-[#110f17] border rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                            com.status === 'pending'
                              ? 'border-amber-500/35 hover:border-amber-500/55'
                              : 'border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          <div className="space-y-2 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                              <strong className="text-white">{com.authorName}</strong>
                              {hasEmail && (
                                <span className="text-stone-400 font-mono text-[11px]">
                                  ({com.authorEmail})
                                </span>
                              )}
                              <span className="text-stone-600" aria-hidden="true">·</span>
                              <span className="text-[#c99757] font-medium truncate max-w-[320px]">
                                {com.postTitle}
                              </span>
                              <span className="text-stone-600" aria-hidden="true">·</span>
                              <span className="text-stone-400 text-[11px] tabular-nums">
                                {com.createdAt}
                              </span>
                            </div>

                            <p className="text-xs text-stone-200 bg-[#09080d] px-3.5 py-3 rounded-lg border border-stone-800/90 leading-relaxed">
                              “{com.commentText}”
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-center">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                                com.status === 'approved'
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                                  : com.status === 'pending'
                                    ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                                    : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {com.status}
                            </span>

                            {com.status !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleCommentStatus(com.id, 'approved')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-semibold text-xs inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            )}

                            {com.status !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => handleCommentStatus(com.id, 'rejected')}
                                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-rose-950/80 hover:text-rose-300 border border-stone-700 hover:border-rose-500/40 text-stone-300 text-xs inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            )}

                            {com.status !== 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleCommentStatus(com.id, 'pending')}
                                title="Move back to pending queue"
                                aria-label={`Move comment by ${com.authorName} to pending`}
                                className="p-1.5 text-stone-400 hover:text-amber-300 rounded-lg hover:bg-stone-800 transition-colors shrink-0"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteComment(com.id)}
                              title="Delete comment"
                              aria-label={`Delete comment by ${com.authorName}`}
                              className="p-1.5 text-stone-500 hover:text-red-400 rounded-lg hover:bg-stone-800 transition-colors shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 5B: D3.JS ANALYTICS DASHBOARD */}
          {activeTab === 'analytics' && (
            <AdminAnalyticsTab
              store={store}
              viewedItems={viewedItems}
              likedItems={likedItems}
              viewCounts={viewCounts}
              onOpenTab={(tab) => setActiveTab(tab)}
            />
          )}

          {/* TAB 6: VIP MEMBERS MANAGEMENT */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    VIP Members & Patron Subscriptions ({store.members.length})
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    Real-time list of verified paid patrons, active subscription tiers, and payment gateways.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="px-4 py-2 rounded-xl bg-[#181520] hover:bg-[#221d2d] border border-[#c99757]/40 text-[#e7c792] text-xs font-semibold transition-colors self-start"
                >
                  Configure PayPal / Stripe / Crypto Payouts →
                </button>
              </div>

              {/* Active Payout Destination Summary */}
              <div className="p-4 rounded-2xl bg-[#14111c] border border-emerald-500/30 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block">PayPal Payout Account</span>
                  <span className="font-mono font-semibold text-white mt-0.5 block">
                    {store.settings.paypalEmail || store.settings.contactEmail}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block">Stripe / Card Merchant</span>
                  <span className="font-mono font-semibold text-white mt-0.5 block">
                    {store.settings.stripeMonthlyLink ? 'Live Stripe Payment Links Active' : store.settings.stripeAccountLabel || 'Configure in Settings'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block">Crypto ({store.settings.cryptoNetwork || 'USDT TRC20'})</span>
                  <span className="font-mono font-semibold text-white mt-0.5 block truncate">
                    {store.settings.cryptoWalletAddress || 'Not configured yet'}
                  </span>
                </div>
              </div>

              <div className="bg-[#110f17] border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-[#16131e] text-[11px] uppercase tracking-wider text-stone-400 border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Member Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Subscription Tier</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80">
                    {store.members.map((mem) => (
                      <tr key={mem.id} className="hover:bg-[#16131e]/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">{mem.name}</td>
                        <td className="py-3 px-4 text-stone-400 font-mono text-[11px]">{mem.email}</td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded bg-[#c99757]/15 border border-[#c99757]/30 text-[#e7c792] font-semibold text-[11px]">
                            {mem.tier}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-300">{mem.paymentMethod}</td>
                        <td className="py-3 px-4 font-bold text-white">{mem.amountPaid}</td>
                        <td className="py-3 px-4 text-stone-400">{mem.joinedDate}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                            {mem.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS & SECURITY */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl space-y-6 pb-8">
              <div className="sticky top-0 z-20 -mx-2 px-4 py-3 rounded-2xl bg-[#110f17]/95 backdrop-blur-md border border-[#c99757]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Settings, Menus, SEO &amp; Security Hub
                  </h2>
                  <p className="text-[11px] text-stone-400">
                    Configure SEO tags, edit Front &amp; Footer menus, payouts, &lt;head&gt; analytics, and save changes.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {lastSavedLabel && (
                    <span className="text-[11px] text-emerald-400 font-medium hidden md:inline">
                      ✓ {lastSavedLabel}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleExplicitSaveSettings}
                    className="px-5 py-2.5 rounded-xl bg-[#c99757] hover:bg-[#d6a567] text-stone-950 font-bold text-xs inline-flex items-center gap-2 shadow-lg transition-transform hover:scale-[1.02]"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Settings</span>
                  </button>
                </div>
              </div>

              {/* SECURITY & PASSCODE BOX - Matches Kinetivo Screenshot */}
              <div className="p-6 rounded-2xl bg-[#14111c] border border-emerald-500/30 shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Admin Security & Passcode (অ্যাডমিন পাসকোড পরিবর্তন)
                    </h3>
                    <div className="text-xs text-stone-400 mt-0.5">
                      Current Active Passcode: <span className="font-mono font-bold text-[#e7c792] px-2 py-0.5 bg-black/60 rounded border border-stone-700">{store.settings.adminPasscode}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed">
                  You can change this passcode at any time. When set, entering the new passcode will grant instant access.
                </p>

                <form onSubmit={handleUpdatePasscode} className="flex flex-col sm:flex-row gap-3 pt-1">
                  <input
                    type="text"
                    placeholder="Enter new passcode (min 4 chars)"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    className="flex-1 bg-[#09080d] border border-stone-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#c99757] hover:bg-[#d6a567] text-stone-950 font-semibold text-xs transition-colors shrink-0"
                  >
                    Update Passcode
                  </button>
                </form>

                {passcodeSuccessMsg && (
                  <p className="text-emerald-400 text-xs flex items-center gap-1.5 pt-1">
                    <Check className="w-4 h-4" />
                    {passcodeSuccessMsg}
                  </p>
                )}
              </div>

              {/* PAYMENT GATEWAYS & PAYOUT ACCOUNTS */}
              <div className="p-6 rounded-2xl bg-[#14111c] border border-[#c99757]/40 shadow-xl space-y-5">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Payment Gateways & Payout Accounts (পেমেন্ট গ্রহণকারী অ্যাকাউন্ট সেটিংস)
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Set the exact PayPal email/link, Stripe Payment Links (for Credit/Debit cards), and Crypto wallet where membership payments are deposited directly.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      PayPal Business / Payout Email
                    </label>
                    <input
                      type="email"
                      value={store.settings.paypalEmail}
                      onChange={(e) => onUpdateStore(prev => ({
                        ...prev,
                        settings: { ...prev.settings, paypalEmail: e.target.value }
                      }))}
                      placeholder="your-paypal@domain.com"
                      className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#c99757]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      PayPal.me Direct Link (Optional)
                    </label>
                    <input
                      type="text"
                      value={store.settings.paypalMeUrl}
                      onChange={(e) => onUpdateStore(prev => ({
                        ...prev,
                        settings: { ...prev.settings, paypalMeUrl: e.target.value }
                      }))}
                      placeholder="https://paypal.me/yourusername"
                      className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#c99757]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Stripe / Card Merchant Account Email or Label
                    </label>
                    <input
                      type="text"
                      value={store.settings.stripeAccountLabel}
                      onChange={(e) => onUpdateStore(prev => ({
                        ...prev,
                        settings: { ...prev.settings, stripeAccountLabel: e.target.value }
                      }))}
                      placeholder="merchant@domain.com"
                      className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#c99757]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Stripe Payment Link — VIP Monthly ($05.99/mo)
                    </label>
                    <input
                      type="text"
                      value={store.settings.stripeMonthlyLink}
                      onChange={(e) => onUpdateStore(prev => ({
                        ...prev,
                        settings: { ...prev.settings, stripeMonthlyLink: e.target.value }
                      }))}
                      placeholder="https://buy.stripe.com/..."
                      className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#c99757]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Stripe Payment Link — Black Diamond ($14.99/3mo)
                    </label>
                    <input
                      type="text"
                      value={store.settings.stripeQuarterlyLink}
                      onChange={(e) => onUpdateStore(prev => ({
                        ...prev,
                        settings: { ...prev.settings, stripeQuarterlyLink: e.target.value }
                      }))}
                      placeholder="https://buy.stripe.com/..."
                      className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#c99757]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Crypto Network (e.g. USDT TRC20 / ERC20)
                    </label>
                    <input
                      type="text"
                      value={store.settings.cryptoNetwork}
                      onChange={(e) => onUpdateStore(prev => ({
                        ...prev,
                        settings: { ...prev.settings, cryptoNetwork: e.target.value }
                      }))}
                      className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Crypto Payout Wallet Address
                  </label>
                  <input
                    type="text"
                    value={store.settings.cryptoWalletAddress}
                    onChange={(e) => onUpdateStore(prev => ({
                      ...prev,
                      settings: { ...prev.settings, cryptoWalletAddress: e.target.value }
                    }))}
                    placeholder="Paste your USDT TRC20 / ERC20 / BTC wallet address"
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#c99757]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-stone-800">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">VIP Inner Circle Price ($/mo)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={store.settings.vipMonthlyPrice}
                      onChange={(e) => onUpdateStore(prev => ({
                        ...prev,
                        settings: { ...prev.settings, vipMonthlyPrice: parseFloat(e.target.value) || 5.99 }
                      }))}
                      className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#c99757]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Black Diamond Price ($/3mo)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={store.settings.blackDiamondPrice}
                      onChange={(e) => onUpdateStore(prev => ({
                        ...prev,
                        settings: { ...prev.settings, blackDiamondPrice: parseFloat(e.target.value) || 14.99 }
                      }))}
                      className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#c99757]"
                    />
                  </div>
                </div>
              </div>

              {/* BRAND IDENTITY & TAGLINE CONTROLS */}
              <div className="p-6 rounded-2xl bg-[#110f17] border border-stone-800 space-y-4">
                <h3 className="text-base font-semibold text-white">
                  Studio Identity & Taglines
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Site Name (English)</label>
                    <input
                      type="text"
                      value={store.settings.siteNameEn}
                      onChange={(e) => onUpdateStore(prev => ({
                        ...prev,
                        settings: { ...prev.settings, siteNameEn: e.target.value }
                      }))}
                      className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Site Name (Bengali)</label>
                    <input
                      type="text"
                      value={store.settings.siteNameBn}
                      onChange={(e) => onUpdateStore(prev => ({
                        ...prev,
                        settings: { ...prev.settings, siteNameBn: e.target.value }
                      }))}
                      className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Tagline (English)</label>
                    <input
                      type="text"
                      value={store.settings.taglineEn}
                      onChange={(e) => onUpdateStore(prev => ({
                        ...prev,
                        settings: { ...prev.settings, taglineEn: e.target.value }
                      }))}
                      className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Tagline (Bengali)</label>
                    <input
                      type="text"
                      value={store.settings.taglineBn}
                      onChange={(e) => onUpdateStore(prev => ({
                        ...prev,
                        settings: { ...prev.settings, taglineBn: e.target.value }
                      }))}
                      className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Concierge Contact Email</label>
                    <input
                      type="email"
                      value={store.settings.contactEmail}
                      onChange={(e) => onUpdateStore(prev => ({
                        ...prev,
                        settings: { ...prev.settings, contactEmail: e.target.value }
                      }))}
                      className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Concierge Phone / WhatsApp</label>
                    <input
                      type="text"
                      value={store.settings.contactPhone}
                      onChange={(e) => onUpdateStore(prev => ({
                        ...prev,
                        settings: { ...prev.settings, contactPhone: e.target.value }
                      }))}
                      className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-stone-300">
                      Hero Section Showcase / Background Image URL
                    </label>
                    <label className="px-2.5 py-1 rounded-lg bg-[#c99757]/20 hover:bg-[#c99757]/30 border border-[#c99757]/40 text-[#f6e2bb] text-[10px] font-semibold cursor-pointer inline-flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          readLocalImageFile(file, (dataUrl) => {
                            onUpdateStore(prev => ({
                              ...prev,
                              settings: { ...prev.settings, heroBgImage: dataUrl }
                            }));
                          });
                        }}
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    {store.settings.heroBgImage && (
                      <img
                        src={resolveAssetUrl(store.settings.heroBgImage)}
                        alt="Hero Preview"
                        className="w-14 h-12 rounded-lg object-cover border border-stone-700 shrink-0"
                      />
                    )}
                    <input
                      type="text"
                      value={store.settings.heroBgImage}
                      onChange={(e) => {
                        const nextVal = optimizeLinkedAssetUrl(e.target.value);
                        onUpdateStore(prev => ({
                          ...prev,
                          settings: { ...prev.settings, heroBgImage: nextVal }
                        }));
                      }}
                      onBlur={(e) => {
                        const rawVal = e.target.value.trim();
                        if (!rawVal) return;
                        compressImageSource(rawVal, {
                          maxDimension: 1120,
                          quality: 0.78,
                          maxChars: 95_000
                        }).then((optimized) => {
                          if (!optimized || optimized === rawVal) return;
                          onUpdateStore(prev => ({
                            ...prev,
                            settings: { ...prev.settings, heroBgImage: optimized }
                          }));
                          notifyAdmin('Hero Showcase Image compressed & optimized!');
                        });
                      }}
                      placeholder="Paste direct image URL (or GitHub / Drive link)..."
                      className="flex-1 bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#c99757]"
                    />
                  </div>
                </div>
              </div>

              {/* GALLERY IMAGES MANAGER (ADD & REMOVE) */}
              {(() => {
                const customCount = resolvedGalleryPhotos.filter((p) => p.isCustom).length;
                const removedCount = (store.settings.deletedGalleryFilenames || []).length;
                const settingsQuery = settingsGallerySearch.trim().toLowerCase();
                const filteredSettingsPhotos = resolvedGalleryPhotos.filter((photo) => {
                  const matchesFilter =
                    settingsGalleryFilter === 'All'
                      ? true
                      : settingsGalleryFilter === 'Custom'
                        ? Boolean(photo.isCustom)
                        : photo.category === settingsGalleryFilter;
                  const matchesSearch =
                    !settingsQuery ||
                    photo.title.toLowerCase().includes(settingsQuery) ||
                    photo.category.toLowerCase().includes(settingsQuery) ||
                    photo.filename.toLowerCase().includes(settingsQuery);
                  return matchesFilter && matchesSearch;
                });

                return (
                  <div className="p-6 rounded-2xl bg-[#14111c] border border-[#c99757]/40 shadow-xl space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#c99757]/15 border border-[#c99757]/30 flex items-center justify-center text-[#e7c792]">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white">
                            Photography Gallery Manager — Add &amp; Remove Images
                          </h3>
                          <p className="text-xs text-stone-400 mt-0.5">
                            {resolvedGalleryPhotos.length} Active Photos · {customCount}/60 Custom Added · {removedCount} Permanently Removed (Previously hidden images purged)
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('gallery')}
                        className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-medium text-stone-200 self-start sm:self-auto"
                      >
                        Open Full Gallery View →
                      </button>
                    </div>

                    {/* Add New Gallery Image Form */}
                    <div className="p-4 rounded-xl bg-[#09080d] border border-stone-800 space-y-3">
                      <div className="text-xs font-semibold text-[#e7c792] flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Image to Gallery</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block text-stone-400 mb-1">Photo Title</label>
                          <input
                            type="text"
                            value={newGalleryTitle}
                            onChange={(e) => setNewGalleryTitle(e.target.value)}
                            placeholder="e.g. Evening Bedroom Portrait"
                            className="w-full bg-[#110f17] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-400 mb-1">Gallery Category</label>
                          <select
                            value={newGalleryCategory}
                            onChange={(e) =>
                              setNewGalleryCategory(e.target.value as Exclude<GalleryCategory, 'Featured Hot'>)
                            }
                            className="w-full bg-[#110f17] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                          >
                            {GALLERY_ASSIGNABLE_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end pb-1.5">
                          <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-stone-200">
                            <input
                              type="checkbox"
                              checked={newGalleryFeatured}
                              onChange={(e) => setNewGalleryFeatured(e.target.checked)}
                              className="rounded bg-stone-900 border-stone-700 text-[#c99757]"
                            />
                            <Flame className="w-3.5 h-3.5 text-[#c99757]" />
                            <span>Mark as Featured Hot</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5 text-xs">
                        <input
                          type="url"
                          value={newGalleryUrl}
                          onChange={(e) => setNewGalleryUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              void handleAddGalleryImageFromUrl();
                            }
                          }}
                          placeholder="Paste direct image URL (HTTPS / GitHub / Google Drive)..."
                          aria-label="Gallery image URL"
                          className="flex-1 bg-[#110f17] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#c99757]"
                        />
                        <button
                          type="button"
                          disabled={isAddingGalleryImage}
                          onClick={handleAddGalleryImageFromUrl}
                          className="px-4 py-2 rounded-lg bg-[#c99757] hover:bg-[#d6a567] text-stone-950 font-semibold text-xs inline-flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-60"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isAddingGalleryImage ? 'Adding...' : 'Add Image'}</span>
                        </button>
                        <label className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-[#c99757]/50 text-[#f6e2bb] font-semibold text-xs cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isAddingGalleryImage ? 'Processing...' : 'Upload Photo(s)'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            disabled={isAddingGalleryImage}
                            className="hidden"
                            onChange={(e) => {
                              void handleUploadGalleryFiles(e.target.files);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Search & Remove Existing / Custom Gallery Images */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="search"
                            value={settingsGallerySearch}
                            onChange={(e) => setSettingsGallerySearch(e.target.value)}
                            placeholder="Search gallery images to inspect or delete..."
                            className="w-full bg-[#09080d] border border-stone-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                          />
                        </div>
                        <select
                          value={settingsGalleryFilter}
                          onChange={(e) =>
                            setSettingsGalleryFilter(
                              e.target.value as 'All' | 'Custom' | Exclude<GalleryCategory, 'Featured Hot'>
                            )
                          }
                          className="bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                        >
                          <option value="All">All Active ({resolvedGalleryPhotos.length})</option>
                          <option value="Custom">Custom Added ({customCount})</option>
                          {GALLERY_ASSIGNABLE_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="max-h-[420px] overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredSettingsPhotos.map((photo) => (
                          <div
                            key={photo.id}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-[#09080d] border border-stone-800 hover:border-stone-700 transition-colors"
                          >
                            <img
                              src={photo.src}
                              alt={photo.title}
                              loading="lazy"
                              className="w-14 h-14 rounded-lg object-cover object-top border border-stone-800 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-white truncate" title={photo.title}>
                                {photo.title}
                              </div>
                              <div className="text-[10px] text-[#e7c792] truncate">
                                {photo.category}
                                {photo.isCustom ? ' · Custom' : ''}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleGalleryFeatured(photo)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                                    photo.featured
                                      ? 'bg-[#c99757]/20 text-[#f6e2bb] border-[#c99757]/50'
                                      : 'bg-stone-900 text-stone-400 border-stone-700 hover:text-white'
                                  }`}
                                >
                                  {photo.featured ? 'Featured' : 'Feature'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteGalleryPhoto(photo)}
                                  className="px-2 py-0.5 rounded bg-stone-900 hover:bg-red-950/80 border border-stone-700 hover:border-red-500/50 text-stone-300 hover:text-red-300 text-[10px] font-medium inline-flex items-center gap-1 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* HEADER HTML CODE / ANALYTICS & AD CODE BOX */}
              <div className="p-6 rounded-2xl bg-[#14111c] border border-sky-500/35 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                      <Code className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-white">
                          Header HTML Code, Analytics & Ad Injection (&lt;head&gt;)
                        </h3>
                        {(store.settings.customHeadHtml || '').trim() && (
                          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Paste Google Analytics (GA4), Google AdSense, Meta Pixel, Search Console meta tags, or Links Ad scripts directly into site &lt;head&gt;.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateStore(prev => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            customHeadHtml: `<!-- Google Analytics (GA4) & AdSense Example -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'G-XXXXXXXXXX');\n</script>`
                          }
                        }));
                        notifyAdmin('Inserted sample GA4 template—replace G-XXXXXXXXXX with your ID!');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-[11px] font-semibold transition-colors"
                    >
                      + Sample GA4 Code
                    </button>
                    {(store.settings.customHeadHtml || '').trim() && (
                      <button
                        type="button"
                        onClick={() => onUpdateStore(prev => ({
                          ...prev,
                          settings: { ...prev.settings, customHeadHtml: '' }
                        }))}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1.5">
                    &lt;head&gt; HTML Code Box (Analytics, AdSense, Verification Meta, Custom Scripts)
                  </label>
                  <textarea
                    rows={7}
                    value={store.settings.customHeadHtml || ''}
                    onChange={(e) => onUpdateStore(prev => ({
                      ...prev,
                      settings: { ...prev.settings, customHeadHtml: e.target.value }
                    }))}
                    placeholder={'<!-- Paste <script>, <meta>, <link> tags here -->\n<meta name="google-site-verification" content="..." />\n<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX" crossorigin="anonymous"></script>'}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-xl p-3 text-xs text-sky-200 font-mono leading-relaxed focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1.5">
                    Links Ad / Display Banner HTML Slot (Renders Above Footer)
                  </label>
                  <textarea
                    rows={4}
                    value={store.settings.customAdSlotHtml || ''}
                    onChange={(e) => onUpdateStore(prev => ({
                      ...prev,
                      settings: { ...prev.settings, customAdSlotHtml: e.target.value }
                    }))}
                    placeholder={'<!-- Optional: Paste Links Ad HTML, Banner <a><img></a>, or Ad Unit snippet here -->'}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-xl p-3 text-xs text-amber-200 font-mono leading-relaxed focus:outline-none focus:border-[#c99757]"
                  />
                </div>
              </div>

              {/* GITHUB AUTO-PUSH & NETLIFY DEPLOYMENT DOWNLOAD CENTER */}
              <div className="p-6 rounded-2xl bg-[#14111c] border border-[#c99757]/40 shadow-xl space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#c99757]/15 border border-[#c99757]/30 flex items-center justify-center text-[#e7c792]">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      GitHub Auto-Push & Netlify Ready Download Center
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Download your full site backup, Netlify config files, and GitHub Actions auto-deploy workflow for zero-downtime publishing.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="p-3 rounded-xl bg-[#09080d] hover:bg-[#191423] border border-stone-700 hover:border-[#c99757] text-left space-y-1 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#e7c792]">
                      <Download className="w-3.5 h-3.5" />
                      <span>Site Backup (.json)</span>
                    </div>
                    <p className="text-[11px] text-stone-400">All posts, tips, vault media, members & settings.</p>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadIndexHtml}
                    className="p-3 rounded-xl bg-[#09080d] hover:bg-[#191423] border border-stone-700 hover:border-[#c99757] text-left space-y-1 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
                      <Download className="w-3.5 h-3.5" />
                      <span>index.html (&lt;head&gt;)</span>
                    </div>
                    <p className="text-[11px] text-stone-400">Includes your custom Analytics & Ad codes.</p>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadNetlifyToml}
                    className="p-3 rounded-xl bg-[#09080d] hover:bg-[#191423] border border-stone-700 hover:border-[#c99757] text-left space-y-1 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                      <Download className="w-3.5 h-3.5" />
                      <span>netlify.toml</span>
                    </div>
                    <p className="text-[11px] text-stone-400">Build command, dist publish & SPA redirects.</p>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadGitHubWorkflow}
                    className="p-3 rounded-xl bg-[#09080d] hover:bg-[#191423] border border-stone-700 hover:border-[#c99757] text-left space-y-1 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                      <Download className="w-3.5 h-3.5" />
                      <span>netlify-deploy.yml</span>
                    </div>
                    <p className="text-[11px] text-stone-400">GitHub Actions auto-build & Netlify push.</p>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-black/50 border border-stone-800 space-y-2 text-xs text-stone-300 leading-relaxed">
                  <div className="font-semibold text-white">Git Push → Auto-Publish on Netlify Setup:</div>
                  <p>1. Push this project to your GitHub repository (<span className="font-mono text-[#e7c792]">main</span> branch). Both <span className="font-mono text-[#e7c792]">netlify.toml</span> and <span className="font-mono text-[#e7c792]">.github/workflows/netlify-deploy.yml</span> are already configured inside the codebase.</p>
                  <p>2. Open Netlify → <strong>Add new site → Import an existing project → GitHub</strong> and select your repo. Set Build Command: <span className="font-mono text-emerald-300">npm run build</span> and Publish Directory: <span className="font-mono text-emerald-300">dist</span>.</p>
                  <p>3. Every time you run <span className="font-mono text-sky-300">git push origin main</span>, Netlify automatically builds and publishes your live website in ~30 seconds.</p>
                </div>
              </div>

              {/* BOTTOM EXPLICIT SAVE SETTINGS BAR */}
              <div className="p-5 rounded-2xl bg-[#14111c] border border-[#c99757]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                <div>
                  <h4 className="text-sm font-bold text-white">Ready to apply all settings?</h4>
                  <p className="text-xs text-stone-400">
                    Click Save Settings to commit SEO meta tags, menus, payout gateways, and &lt;head&gt; analytics immediately.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExplicitSaveSettings}
                  className="px-6 py-3 rounded-xl bg-[#c99757] hover:bg-[#d6a567] text-stone-950 font-bold text-xs inline-flex items-center gap-2 shadow-xl shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Settings</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* VIDEO MODAL (Add/Edit) */}
      {isVideoModalOpen && editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#110f17] border border-stone-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-4">
              <h3 className="text-base font-semibold text-white">Edit Video Asset</h3>
              <button onClick={() => setIsVideoModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Brand / Album Label</label>
                  <input
                    type="text"
                    value={editingVideo.brandName}
                    onChange={(e) => setEditingVideo({ ...editingVideo, brandName: e.target.value })}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Media Type</label>
                  <select
                    value={editingVideo.type}
                    onChange={(e) => setEditingVideo({ ...editingVideo, type: e.target.value as 'video' | 'gallery' })}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white"
                  >
                    <option value="video">Video Reel (MP4 / Embed)</option>
                    <option value="gallery">Photo Gallery Album</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Category</label>
                  <select
                    value={editingVideo.category}
                    onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white"
                  >
                    {store.settings.categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Title (English)</label>
                  <input
                    type="text"
                    value={editingVideo.titleEn}
                    onChange={(e) => setEditingVideo({ ...editingVideo, titleEn: e.target.value })}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Title (Bengali)</label>
                  <input
                    type="text"
                    value={editingVideo.titleBn}
                    onChange={(e) => setEditingVideo({ ...editingVideo, titleBn: e.target.value })}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              {editingVideo.type === 'video' ? (
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Video Embed Link (MP4, YouTube, Vimeo, iframe)</label>
                  <input
                    type="text"
                    value={editingVideo.embedLink}
                    onChange={(e) => setEditingVideo({ ...editingVideo, embedLink: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white font-mono"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">
                    Gallery Photo URLs (1 URL per line — opens interactive multi-photo slider)
                  </label>
                  <textarea
                    rows={4}
                    value={(editingVideo.galleryImages || [editingVideo.thumbnailUrl]).join('\n')}
                    onChange={(e) => {
                      const urls = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean);
                      setEditingVideo({
                        ...editingVideo,
                        galleryImages: urls,
                        duration: `${urls.length || 1} Photos`
                      });
                    }}
                    placeholder="Paste image URLs, one per line..."
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white font-mono"
                  />
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-stone-400">
                    <span>Quick-append preset:</span>
                    {PRESET_THUMBNAILS.map((img, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => {
                          const current = editingVideo.galleryImages || [];
                          const next = [...current, img];
                          setEditingVideo({
                            ...editingVideo,
                            galleryImages: next,
                            duration: `${next.length} Photos`
                          });
                        }}
                        className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200"
                      >
                        + Photo {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-stone-300 mb-1 font-medium">Thumbnail Image URL or Preset</label>
                <input
                  type="text"
                  value={editingVideo.thumbnailUrl}
                  onChange={(e) => setEditingVideo({ ...editingVideo, thumbnailUrl: optimizeLinkedAssetUrl(e.target.value) })}
                  onBlur={(e) => {
                    const rawVal = e.target.value.trim();
                    if (!rawVal) return;
                    compressImageSource(rawVal, { maxDimension: 1120, quality: 0.78, maxChars: 95_000 }).then((optimized) => {
                      if (optimized && optimized !== rawVal) {
                        setEditingVideo((prev) =>
                          prev && prev.thumbnailUrl.trim() === rawVal ? { ...prev, thumbnailUrl: optimized } : prev
                        );
                      }
                    });
                  }}
                  className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white font-mono mb-2"
                />
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {PRESET_THUMBNAILS.map((img, i) => (
                    <img
                      key={i}
                      src={resolveAssetUrl(img)}
                      alt=""
                      onClick={() => setEditingVideo({ ...editingVideo, thumbnailUrl: img })}
                      className={`w-14 h-10 object-cover rounded cursor-pointer border-2 ${editingVideo.thumbnailUrl === img ? 'border-[#c99757]' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Duration / Count (e.g. 0:45 or 6 Photos)</label>
                  <input
                    type="text"
                    value={editingVideo.duration}
                    onChange={(e) => setEditingVideo({ ...editingVideo, duration: e.target.value })}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Views Count (e.g. 24K)</label>
                  <input
                    type="text"
                    value={editingVideo.viewsCount}
                    onChange={(e) => setEditingVideo({ ...editingVideo, viewsCount: e.target.value })}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Publication Status</label>
                  <select
                    value={editingVideo.status}
                    onChange={(e) => setEditingVideo({ ...editingVideo, status: e.target.value as 'Published' | 'Draft' })}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white font-semibold"
                  >
                    <option value="Published">Published (Live)</option>
                    <option value="Draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 mb-1 font-medium">Media Description</label>
                <textarea
                  rows={2}
                  value={editingVideo.descriptionEn}
                  onChange={(e) => setEditingVideo({ ...editingVideo, descriptionEn: e.target.value })}
                  placeholder="Describe this video reel or photo gallery..."
                  className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white"
                />
              </div>

              {/* Per-Video SEO Metadata */}
              <div className="p-3.5 rounded-xl bg-[#09080d] border border-emerald-500/30 space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" />
                  <span>SEO Optimization (Video / Gallery Meta Tags)</span>
                </div>
                <input
                  type="text"
                  placeholder="SEO Title (defaults to Media Title)"
                  value={editingVideo.seoTitle || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, seoTitle: e.target.value })}
                  className="w-full bg-[#14111c] border border-stone-700 rounded-lg px-2.5 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="SEO Meta Description (120–160 chars)"
                  value={editingVideo.seoDescription || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, seoDescription: e.target.value })}
                  className="w-full bg-[#14111c] border border-stone-700 rounded-lg px-2.5 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="SEO Keywords (comma separated)"
                  value={editingVideo.seoKeywords || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, seoKeywords: e.target.value })}
                  className="w-full bg-[#14111c] border border-stone-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingVideo.featuredOnHome}
                    onChange={(e) => setEditingVideo({ ...editingVideo, featuredOnHome: e.target.checked })}
                    className="rounded bg-stone-900 border-stone-700 text-[#c99757]"
                  />
                  <span className="text-stone-300">Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingVideo.isPrivateVIP}
                    onChange={(e) => setEditingVideo({ ...editingVideo, isPrivateVIP: e.target.checked })}
                    className="rounded bg-stone-900 border-stone-700 text-amber-500"
                  />
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> VIP Vault Locked (Private)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingVideo.isShareToUnlock || false}
                    onChange={(e) => setEditingVideo({ ...editingVideo, isShareToUnlock: e.target.checked })}
                    className="rounded bg-stone-900 border-stone-700 text-sky-400"
                  />
                  <span className="text-sky-300">Social Share to Unlock Free</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#c99757] hover:bg-[#d6a567] text-stone-950 font-semibold"
                >
                  Save Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BLOG MODAL (Add/Edit — Unlimited Length + Rich Toolbar + SEO + Published/Draft) */}
      {isBlogModalOpen && editingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-[#110f17] border border-stone-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-4">
              <h3 className="text-base font-semibold text-white">Edit Blog Article (Rich Text, Images &amp; SEO)</h3>
              <button onClick={() => setIsBlogModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-300 mb-1 font-medium">Article Title (English)</label>
                <input
                  type="text"
                  value={editingBlog.titleEn}
                  onChange={(e) => {
                    const title = e.target.value;
                    setEditingBlog({
                      ...editingBlog,
                      titleEn: title,
                      slug: editingBlog.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                    });
                  }}
                  className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Custom Slug (/blog/[slug])</label>
                  <input
                    type="text"
                    value={editingBlog.slug}
                    onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Category</label>
                  <select
                    value={editingBlog.category}
                    onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white"
                  >
                    {store.settings.categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Publication Status</label>
                  <select
                    value={editingBlog.status}
                    onChange={(e) => setEditingBlog({ ...editingBlog, status: e.target.value as 'published' | 'draft' })}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white font-semibold"
                  >
                    <option value="published">Published (Live)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 mb-1 font-medium">Subtitle / Excerpt</label>
                <input
                  type="text"
                  value={editingBlog.subtitle}
                  onChange={(e) => setEditingBlog({ ...editingBlog, subtitle: e.target.value })}
                  className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-300 font-medium">Banner Image (Upload from Device, URL, or Preset)</label>
                  <label className="px-2.5 py-1 rounded bg-[#c99757]/20 hover:bg-[#c99757]/30 border border-[#c99757]/40 text-[#f6e2bb] text-[10px] font-semibold cursor-pointer inline-flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        readLocalImageFile(file, (url) => setEditingBlog({ ...editingBlog, bannerImage: url }));
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={editingBlog.bannerImage}
                  onChange={(e) => setEditingBlog({ ...editingBlog, bannerImage: optimizeLinkedAssetUrl(e.target.value) })}
                  onBlur={(e) => {
                    const rawVal = e.target.value.trim();
                    if (!rawVal) return;
                    compressImageSource(rawVal, { maxDimension: 1280, quality: 0.78, maxChars: 105_000 }).then((optimized) => {
                      if (optimized && optimized !== rawVal) {
                        setEditingBlog((prev) =>
                          prev && prev.bannerImage.trim() === rawVal ? { ...prev, bannerImage: optimized } : prev
                        );
                      }
                    });
                  }}
                  className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white font-mono mb-2"
                />
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {PRESET_THUMBNAILS.map((img, i) => (
                    <img
                      key={i}
                      src={resolveAssetUrl(img)}
                      alt=""
                      onClick={() => setEditingBlog({ ...editingBlog, bannerImage: img })}
                      className={`w-14 h-10 object-cover rounded cursor-pointer border-2 ${editingBlog.bannerImage === img ? 'border-[#c99757]' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="text-stone-300 font-medium">Rich Article Body (Unlimited Words)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#e7c792]">
                      Words: {countWords(editingBlog.content)} (Unlimited)
                    </span>
                    <button
                      type="button"
                      onClick={() => setBlogPreviewMode(!blogPreviewMode)}
                      className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-semibold"
                    >
                      {blogPreviewMode ? 'Edit Source' : 'Rich Preview'}
                    </button>
                  </div>
                </div>

                {/* Rich Formatting & Image Insertion Toolbar */}
                {!blogPreviewMode && (
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-t-lg bg-[#181422] border border-b-0 border-stone-700">
                    {[
                      { label: 'H2', snippet: '\n\n## Section Heading\n\n' },
                      { label: 'H3', snippet: '\n\n### Subheading\n\n' },
                      { label: 'Bold', snippet: '**Bold Text**' },
                      { label: 'Italic', snippet: '*Italic Text*' },
                      { label: 'Bullet List', snippet: '\n\n- Key Highlight One\n- Key Highlight Two\n\n' },
                      { label: 'Quote', snippet: '\n\n> Timeless luxury quote...\n\n' }
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() => setEditingBlog({ ...editingBlog, content: (editingBlog.content || '') + btn.snippet })}
                        className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-[10px] font-semibold text-stone-200"
                      >
                        + {btn.label}
                      </button>
                    ))}
                    <label className="px-2 py-1 rounded bg-[#c99757]/20 hover:bg-[#c99757]/30 border border-[#c99757]/40 text-[#f6e2bb] text-[10px] font-semibold cursor-pointer inline-flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      <span>+ Insert Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          readLocalImageFile(file, (url) =>
                            setEditingBlog({
                              ...editingBlog,
                              content: `${editingBlog.content || ''}\n\n![Editorial Photo](${url})\n\n`
                            })
                          );
                        }}
                      />
                    </label>
                  </div>
                )}

                {blogPreviewMode ? (
                  <div className="min-h-[220px] max-h-[340px] overflow-y-auto p-4 rounded-lg bg-[#09080d] border border-stone-700 space-y-3 text-sm">
                    {renderRichMarkdown(editingBlog.content)}
                  </div>
                ) : (
                  <textarea
                    rows={9}
                    value={editingBlog.content}
                    onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-b-lg p-2.5 text-white leading-relaxed"
                    placeholder="Write any length article here using ## Headings, **bold**, - lists, and inserted images..."
                    required
                  />
                )}
              </div>

              {/* Per-Blog SEO Metadata */}
              <div className="p-3.5 rounded-xl bg-[#09080d] border border-emerald-500/30 space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" />
                  <span>SEO Meta Settings (Title, Description &amp; Keywords)</span>
                </div>
                <input
                  type="text"
                  placeholder="Custom SEO Title (defaults to Article Title)"
                  value={editingBlog.seoTitle || ''}
                  onChange={(e) => setEditingBlog({ ...editingBlog, seoTitle: e.target.value })}
                  className="w-full bg-[#14111c] border border-stone-700 rounded-lg px-2.5 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="SEO Meta Description (120–160 characters)"
                  value={editingBlog.seoDescription || ''}
                  onChange={(e) => setEditingBlog({ ...editingBlog, seoDescription: e.target.value })}
                  className="w-full bg-[#14111c] border border-stone-700 rounded-lg px-2.5 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="SEO Keywords (comma separated)"
                  value={editingBlog.seoKeywords || ''}
                  onChange={(e) => setEditingBlog({ ...editingBlog, seoKeywords: e.target.value })}
                  className="w-full bg-[#14111c] border border-stone-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingBlog.featuredOnHome}
                    onChange={(e) => setEditingBlog({ ...editingBlog, featuredOnHome: e.target.checked })}
                    className="rounded bg-stone-900 border-stone-700 text-[#c99757]"
                  />
                  <span className="text-stone-300">Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingBlog.showInHeader}
                    onChange={(e) => setEditingBlog({ ...editingBlog, showInHeader: e.target.checked })}
                    className="rounded bg-stone-900 border-stone-700 text-[#c99757]"
                  />
                  <span className="text-stone-300">Show in Header</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingBlog.showInFooter}
                    onChange={(e) => setEditingBlog({ ...editingBlog, showInFooter: e.target.checked })}
                    className="rounded bg-stone-900 border-stone-700 text-[#c99757]"
                  />
                  <span className="text-stone-300">Show in Footer</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingBlog.isPrivateVIP}
                    onChange={(e) => setEditingBlog({ ...editingBlog, isPrivateVIP: e.target.checked })}
                    className="rounded bg-stone-900 border-stone-700 text-amber-500"
                  />
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> VIP Locked Article
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingBlog.isShareToUnlock || false}
                    onChange={(e) => setEditingBlog({ ...editingBlog, isShareToUnlock: e.target.checked })}
                    className="rounded bg-stone-900 border-stone-700 text-sky-400"
                  />
                  <span className="text-sky-300">Social Share to Unlock</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#c99757] hover:bg-[#d6a567] text-stone-950 font-semibold"
                >
                  Save Blog Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TIPS MODAL (Add/Edit — Unlimited Length + Rich Toolbar + SEO + Published/Draft) */}
      {isTipModalOpen && editingTip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-[#110f17] border border-stone-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-4">
              <h3 className="text-base font-semibold text-white">Edit Masterclass Tip (Rich Text, Images &amp; SEO)</h3>
              <button onClick={() => setIsTipModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTip} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-300 mb-1 font-medium">Tip Headline</label>
                <input
                  type="text"
                  value={editingTip.title}
                  onChange={(e) => setEditingTip({ ...editingTip, title: e.target.value })}
                  placeholder="e.g. Fragrance Layering Secrets..."
                  className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Category</label>
                  <select
                    value={editingTip.category}
                    onChange={(e) => setEditingTip({ ...editingTip, category: e.target.value as TipItem['category'] })}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white"
                  >
                    <option value="Feminine Confidence">Feminine Confidence</option>
                    <option value="Fashion & Styling">Fashion &amp; Styling</option>
                    <option value="Dining & Wine">Dining &amp; Wine</option>
                    <option value="Adult 18+ Intimacy">Adult 18+ Intimacy</option>
                    <option value="Skincare & Glow">Skincare &amp; Glow</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Reading Time</label>
                  <input
                    type="text"
                    value={editingTip.readTime}
                    onChange={(e) => setEditingTip({ ...editingTip, readTime: e.target.value })}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Publication Status</label>
                  <select
                    value={editingTip.status}
                    onChange={(e) => setEditingTip({ ...editingTip, status: e.target.value as 'published' | 'draft' })}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white font-semibold"
                  >
                    <option value="published">Published (Live)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-300 font-medium">Tip Image (Upload from Device, URL, or Preset)</label>
                  <label className="px-2.5 py-1 rounded bg-[#c99757]/20 hover:bg-[#c99757]/30 border border-[#c99757]/40 text-[#f6e2bb] text-[10px] font-semibold cursor-pointer inline-flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        readLocalImageFile(file, (url) => setEditingTip({ ...editingTip, image: url }));
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={editingTip.image}
                  onChange={(e) => setEditingTip({ ...editingTip, image: optimizeLinkedAssetUrl(e.target.value) })}
                  onBlur={(e) => {
                    const rawVal = e.target.value.trim();
                    if (!rawVal) return;
                    compressImageSource(rawVal, { maxDimension: 1120, quality: 0.78, maxChars: 95_000 }).then((optimized) => {
                      if (optimized && optimized !== rawVal) {
                        setEditingTip((prev) =>
                          prev && prev.image.trim() === rawVal ? { ...prev, image: optimized } : prev
                        );
                      }
                    });
                  }}
                  className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white font-mono mb-2"
                />
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {PRESET_THUMBNAILS.map((img, i) => (
                    <img
                      key={i}
                      src={resolveAssetUrl(img)}
                      alt=""
                      onClick={() => setEditingTip({ ...editingTip, image: img })}
                      className={`w-14 h-10 object-cover rounded cursor-pointer border-2 ${editingTip.image === img ? 'border-[#c99757]' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="text-stone-300 font-medium">Detailed Masterclass Tip Advice (Unlimited Words)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#e7c792]">
                      Words: {countWords(editingTip.content)} (Unlimited)
                    </span>
                    <button
                      type="button"
                      onClick={() => setTipPreviewMode(!tipPreviewMode)}
                      className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-semibold"
                    >
                      {tipPreviewMode ? 'Edit Source' : 'Rich Preview'}
                    </button>
                  </div>
                </div>

                {!tipPreviewMode && (
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-t-lg bg-[#181422] border border-b-0 border-stone-700">
                    {[
                      { label: 'H2', snippet: '\n\n## Section Heading\n\n' },
                      { label: 'H3', snippet: '\n\n### Subheading\n\n' },
                      { label: 'Bold', snippet: '**Bold Text**' },
                      { label: 'Bullet List', snippet: '\n\n- Step One\n- Step Two\n\n' },
                      { label: 'Quote', snippet: '\n\n> Signature advice...\n\n' }
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() => setEditingTip({ ...editingTip, content: (editingTip.content || '') + btn.snippet })}
                        className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-[10px] font-semibold text-stone-200"
                      >
                        + {btn.label}
                      </button>
                    ))}
                    <label className="px-2 py-1 rounded bg-[#c99757]/20 hover:bg-[#c99757]/30 border border-[#c99757]/40 text-[#f6e2bb] text-[10px] font-semibold cursor-pointer inline-flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      <span>+ Insert Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          readLocalImageFile(file, (url) =>
                            setEditingTip({
                              ...editingTip,
                              content: `${editingTip.content || ''}\n\n![Tip Visual Guide](${url})\n\n`
                            })
                          );
                        }}
                      />
                    </label>
                  </div>
                )}

                {tipPreviewMode ? (
                  <div className="min-h-[200px] max-h-[320px] overflow-y-auto p-4 rounded-lg bg-[#09080d] border border-stone-700 space-y-3 text-sm">
                    {renderRichMarkdown(editingTip.content)}
                  </div>
                ) : (
                  <textarea
                    rows={8}
                    value={editingTip.content}
                    onChange={(e) => setEditingTip({ ...editingTip, content: e.target.value })}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-b-lg p-2.5 text-white leading-relaxed"
                    required
                  />
                )}
              </div>

              {/* Per-Tip SEO Metadata */}
              <div className="p-3.5 rounded-xl bg-[#09080d] border border-emerald-500/30 space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" />
                  <span>SEO Meta Settings (Tip Title, Description &amp; Keywords)</span>
                </div>
                <input
                  type="text"
                  placeholder="SEO Title"
                  value={editingTip.seoTitle || ''}
                  onChange={(e) => setEditingTip({ ...editingTip, seoTitle: e.target.value })}
                  className="w-full bg-[#14111c] border border-stone-700 rounded-lg px-2.5 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="SEO Meta Description"
                  value={editingTip.seoDescription || ''}
                  onChange={(e) => setEditingTip({ ...editingTip, seoDescription: e.target.value })}
                  className="w-full bg-[#14111c] border border-stone-700 rounded-lg px-2.5 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="SEO Keywords (comma separated)"
                  value={editingTip.seoKeywords || ''}
                  onChange={(e) => setEditingTip({ ...editingTip, seoKeywords: e.target.value })}
                  className="w-full bg-[#14111c] border border-stone-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTip.isAdult18}
                    onChange={(e) => setEditingTip({ ...editingTip, isAdult18: e.target.checked, isPrivateVIP: e.target.checked ? true : editingTip.isPrivateVIP })}
                    className="rounded bg-stone-900 border-stone-700 text-rose-500"
                  />
                  <span className="text-rose-300 font-semibold">🔞 Adult 18+ Content</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTip.featuredOnHome}
                    onChange={(e) => setEditingTip({ ...editingTip, featuredOnHome: e.target.checked })}
                    className="rounded bg-stone-900 border-stone-700 text-[#c99757]"
                  />
                  <span className="text-stone-300">Show on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTip.isPrivateVIP}
                    onChange={(e) => setEditingTip({ ...editingTip, isPrivateVIP: e.target.checked })}
                    className="rounded bg-stone-900 border-stone-700 text-amber-500"
                  />
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> VIP Lock (Paid Only)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTip.isShareToUnlock || false}
                    onChange={(e) => setEditingTip({ ...editingTip, isShareToUnlock: e.target.checked })}
                    className="rounded bg-stone-900 border-stone-700 text-sky-400"
                  />
                  <span className="text-sky-300">Social Share to Unlock</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsTipModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#c99757] hover:bg-[#d6a567] text-stone-950 font-semibold"
                >
                  Save Tip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXTRA PAGE MODAL (Rich Text & Photo Editor + Banner + SEO + Published/Draft) */}
      {isPageModalOpen && editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-[#110f17] border border-stone-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-4">
              <h3 className="text-base font-semibold text-white">Edit Extra Page (Rich Text, Photos &amp; SEO)</h3>
              <button onClick={() => setIsPageModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePage} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-stone-300 mb-1 font-medium">Page Title (English)</label>
                  <input
                    type="text"
                    value={editingPage.titleEn}
                    onChange={(e) => {
                      const t = e.target.value;
                      setEditingPage({
                        ...editingPage,
                        titleEn: t,
                        slug: editingPage.slug || t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                      });
                    }}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Publication Status</label>
                  <select
                    value={editingPage.status}
                    onChange={(e) => setEditingPage({ ...editingPage, status: e.target.value as 'published' | 'draft' })}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white font-semibold"
                  >
                    <option value="published">Published (Live)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 mb-1 font-medium">Page Slug (/page/[slug])</label>
                <input
                  type="text"
                  value={editingPage.slug}
                  onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                  className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white font-mono"
                  required
                />
              </div>

              {/* Banner Photo */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-300 font-medium">Page Banner / Feature Image (Upload or URL)</label>
                  <label className="px-2.5 py-1 rounded bg-[#c99757]/20 hover:bg-[#c99757]/30 border border-[#c99757]/40 text-[#f6e2bb] text-[10px] font-semibold cursor-pointer inline-flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload Banner</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        readLocalImageFile(file, (url) => setEditingPage({ ...editingPage, bannerImage: url }));
                      }}
                    />
                  </label>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  {editingPage.bannerImage && (
                    <img
                      src={resolveAssetUrl(editingPage.bannerImage)}
                      alt="Banner preview"
                      className="w-16 h-11 rounded-lg object-cover border border-stone-700 shrink-0"
                    />
                  )}
                  <input
                    type="text"
                    value={editingPage.bannerImage || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, bannerImage: optimizeLinkedAssetUrl(e.target.value) })}
                    onBlur={(e) => {
                      const rawVal = e.target.value.trim();
                      if (!rawVal) return;
                      compressImageSource(rawVal, {
                        maxDimension: 1280,
                        quality: 0.78,
                        maxChars: 105_000
                      }).then((optimized) => {
                        if (optimized && optimized !== rawVal) {
                          setEditingPage((prev) =>
                            prev && (prev.bannerImage || '').trim() === rawVal
                              ? { ...prev, bannerImage: optimized }
                              : prev
                          );
                          notifyAdmin('Page banner asset compressed & optimized!');
                        }
                      });
                    }}
                    placeholder="Optional banner image URL..."
                    className="flex-1 bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {PRESET_THUMBNAILS.map((img, i) => (
                    <img
                      key={i}
                      src={resolveAssetUrl(img)}
                      alt=""
                      onClick={() => setEditingPage({ ...editingPage, bannerImage: img })}
                      className={`w-14 h-10 object-cover rounded cursor-pointer border-2 ${editingPage.bannerImage === img ? 'border-[#c99757]' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Rich Content Editor + Live Preview */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="text-stone-300 font-medium">Rich Page Body Content (Headings, Bold, Lists &amp; Photos)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#e7c792]">
                      Words: {countWords(editingPage.content)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPagePreviewMode(!pagePreviewMode)}
                      className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-semibold"
                    >
                      {pagePreviewMode ? 'Edit Source' : 'Rich Preview'}
                    </button>
                  </div>
                </div>

                {!pagePreviewMode && (
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-t-lg bg-[#181422] border border-b-0 border-stone-700">
                    {[
                      { label: 'H2', snippet: '\n\n## Section Heading\n\n' },
                      { label: 'H3', snippet: '\n\n### Subheading\n\n' },
                      { label: 'Bold', snippet: '**Important Text**' },
                      { label: 'Italic', snippet: '*Emphasis*' },
                      { label: 'Bullet List', snippet: '\n\n- Benefit Point One\n- Benefit Point Two\n\n' },
                      { label: 'Quote', snippet: '\n\n> Quoted Highlight...\n\n' },
                      { label: 'Divider', snippet: '\n\n---\n\n' }
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() => setEditingPage({ ...editingPage, content: (editingPage.content || '') + btn.snippet })}
                        className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-[10px] font-semibold text-stone-200"
                      >
                        + {btn.label}
                      </button>
                    ))}
                    <label className="px-2 py-1 rounded bg-[#c99757]/20 hover:bg-[#c99757]/30 border border-[#c99757]/40 text-[#f6e2bb] text-[10px] font-semibold cursor-pointer inline-flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      <span>+ Insert Photo into Body</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          readLocalImageFile(file, (url) =>
                            setEditingPage({
                              ...editingPage,
                              content: `${editingPage.content || ''}\n\n![Page Photo](${url})\n\n`
                            })
                          );
                        }}
                      />
                    </label>
                  </div>
                )}

                {pagePreviewMode ? (
                  <div className="min-h-[200px] max-h-[320px] overflow-y-auto p-4 rounded-lg bg-[#09080d] border border-stone-700 space-y-3 text-sm">
                    {renderRichMarkdown(editingPage.content)}
                  </div>
                ) : (
                  <textarea
                    rows={8}
                    value={editingPage.content}
                    onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-b-lg p-2.5 text-white leading-relaxed"
                    placeholder="Write rich page content using ## Headings, **bold**, - bullet lists, or click + Insert Photo above..."
                    required
                  />
                )}
              </div>

              {/* Per-Page SEO Metadata */}
              <div className="p-3.5 rounded-xl bg-[#09080d] border border-emerald-500/30 space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" />
                  <span>SEO Meta Settings (Page Title, Description &amp; Keywords)</span>
                </div>
                <input
                  type="text"
                  placeholder="SEO Title (defaults to Page Title)"
                  value={editingPage.seoTitle || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, seoTitle: e.target.value })}
                  className="w-full bg-[#14111c] border border-stone-700 rounded-lg px-2.5 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="SEO Meta Description (120–160 characters)"
                  value={editingPage.seoDescription || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, seoDescription: e.target.value })}
                  className="w-full bg-[#14111c] border border-stone-700 rounded-lg px-2.5 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="SEO Keywords (comma separated)"
                  value={editingPage.seoKeywords || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, seoKeywords: e.target.value })}
                  className="w-full bg-[#14111c] border border-stone-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPage.showInHeader}
                    onChange={(e) => setEditingPage({ ...editingPage, showInHeader: e.target.checked })}
                    className="rounded bg-stone-900 border-stone-700 text-[#c99757]"
                  />
                  <span className="text-stone-300">Show in Header Menu</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPage.showInFooter}
                    onChange={(e) => setEditingPage({ ...editingPage, showInFooter: e.target.checked })}
                    className="rounded bg-stone-900 border-stone-700 text-[#c99757]"
                  />
                  <span className="text-stone-300">Show in Footer Links</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsPageModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOptimizingBanner}
                  className="px-5 py-2 rounded-lg bg-[#c99757] hover:bg-[#d6a567] disabled:opacity-60 text-stone-950 font-semibold"
                >
                  {isOptimizingBanner ? 'Optimizing Banner...' : 'Save Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
