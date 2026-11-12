import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
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
  Key, 
  Lock, 
  Unlock, 
  Download, 
  RotateCcw, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  Globe,
  Code,
  GitBranch
} from 'lucide-react';
import { 
  AppStoreData, 
  VideoItem, 
  BlogPost, 
  TipItem,
  ExtraPageItem, 
  CommentItem, 
  MemberItem, 
  SiteSettings,
  FrontEditableTexts
} from '../types';
import {
  PRESET_THUMBNAILS,
  resolveAssetUrl,
  generateAutoSeoTips,
  generateAutoSeoBlogs
} from '../defaultStore';

interface KinetivoAdminProps {
  store: AppStoreData;
  onUpdateStore: (updater: (prev: AppStoreData) => AppStoreData) => void;
  onClose: () => void;
  onToggleLiveEditor: () => void;
  isLiveEditorActive: boolean;
}

export const KinetivoAdmin: React.FC<KinetivoAdminProps> = ({
  store,
  onUpdateStore,
  onClose,
  onToggleLiveEditor,
  isLiveEditorActive
}) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'blogs' | 'tips' | 'pages' | 'showreel' | 'comments' | 'members' | 'settings'>('videos');

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

  // Inline Admin Notice (replaces blocked window.alert)
  const [adminNotice, setAdminNotice] = useState<string | null>(null);
  const notifyAdmin = (msg: string) => {
    setAdminNotice(msg);
    setTimeout(() => setAdminNotice(null), 4000);
  };

  // Save Video
  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    onUpdateStore(prev => {
      const exists = prev.videos.some(v => v.id === editingVideo.id);
      const updatedVideos = exists
        ? prev.videos.map(v => v.id === editingVideo.id ? editingVideo : v)
        : [editingVideo, ...prev.videos];
      return { ...prev, videos: updatedVideos };
    });

    setIsVideoModalOpen(false);
    setEditingVideo(null);
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
  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;

    onUpdateStore(prev => {
      const exists = prev.blogs.some(b => b.id === editingBlog.id);
      const updatedBlogs = exists
        ? prev.blogs.map(b => b.id === editingBlog.id ? editingBlog : b)
        : [editingBlog, ...prev.blogs];
      return { ...prev, blogs: updatedBlogs };
    });

    setIsBlogModalOpen(false);
    setEditingBlog(null);
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
  const handleSaveTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTip) return;

    onUpdateStore(prev => {
      const exists = prev.tips.some(t => t.id === editingTip.id);
      const updatedTips = exists
        ? prev.tips.map(t => t.id === editingTip.id ? editingTip : t)
        : [editingTip, ...prev.tips];
      return { ...prev, tips: updatedTips };
    });

    setIsTipModalOpen(false);
    setEditingTip(null);
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

  // Helper: Read local file as Data URL for easy image replacement
  const readLocalImageFile = (file: File, onLoaded: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onLoaded(reader.result);
        notifyAdmin('Image uploaded from device successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper: Word counter
  const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

  // Auto-Publish 5 SEO-Complete Daily Tips (450-550 words each)
  const handleAutoPublishDailyTips = () => {
    const newTips = generateAutoSeoTips();
    onUpdateStore(prev => ({
      ...prev,
      tips: [...newTips, ...prev.tips]
    }));
    notifyAdmin('✨ Auto-Published 5 Daily SEO Tips (450–550 words each, Non-Adult & Adult 18+)!');
  };

  // Auto-Publish 10 SEO-Complete Daily Blog Posts (850-980 words each)
  const handleAutoPublishDailyBlogs = () => {
    const newBlogs = generateAutoSeoBlogs(store.settings.categories);
    onUpdateStore(prev => ({
      ...prev,
      blogs: [...newBlogs, ...prev.blogs]
    }));
    notifyAdmin('✨ Auto-Published 10 Daily SEO Blog Articles (~900 words each across categories)!');
  };

  // Save Page
  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    onUpdateStore(prev => {
      const exists = prev.pages.some(p => p.id === editingPage.id);
      const updatedPages = exists
        ? prev.pages.map(p => p.id === editingPage.id ? editingPage : p)
        : [editingPage, ...prev.pages];
      return { ...prev, pages: updatedPages };
    });

    setIsPageModalOpen(false);
    setEditingPage(null);
  };

  // Delete Page
  const handleDeletePage = (id: string) => {
    onUpdateStore(prev => ({
      ...prev,
      pages: prev.pages.filter(p => p.id !== id)
    }));
    notifyAdmin('Standalone page deleted.');
  };

  // Approve / Reject Comment
  const handleCommentStatus = (id: string, status: 'approved' | 'rejected') => {
    onUpdateStore(prev => ({
      ...prev,
      comments: prev.comments.map(c => c.id === id ? { ...c, status } : c)
    }));
  };

  // Delete Comment
  const handleDeleteComment = (id: string) => {
    onUpdateStore(prev => ({
      ...prev,
      comments: prev.comments.filter(c => c.id !== id)
    }));
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

        <div className="flex items-center gap-3">
          {/* Live Front Text Editor Toggle */}
          <button
            onClick={onToggleLiveEditor}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${isLiveEditorActive ? 'bg-amber-500 text-black font-bold shadow-lg' : 'bg-[#181520] hover:bg-[#201c2c] text-amber-300 border border-amber-500/30'}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLiveEditorActive ? 'Live Editor Active (Click Texts & Photos)' : 'Live Page & Photo Editor'}</span>
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
                <span>Comments Review</span>
              </div>
              {store.comments.filter(c => c.status === 'pending').length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-bold">
                  {store.comments.filter(c => c.status === 'pending').length}
                </span>
              )}
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
              <div className="bg-[#110f17] border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-[#16131e] text-[11px] uppercase tracking-wider text-stone-400 border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Preview</th>
                      <th className="py-3 px-4">Brand & Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Metrics</th>
                      <th className="py-3 px-4">Privacy / Tier</th>
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
                    Create & publish 850–1,000 word SEO articles across categories, or auto-post 10 full category stories daily.
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
                        showInHeader: true,
                        showInFooter: true,
                        featuredOnHome: true,
                        status: 'published',
                        date: 'Just now',
                        readTime: '6 min read',
                        isPrivateVIP: false,
                        isShareToUnlock: false,
                        likes: 0
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

              {/* BLOG CATEGORIES MANAGER (Add, Remove & Select directly in Blog Panel) */}
              <div className="p-5 rounded-2xl bg-[#110f17] border border-stone-800 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Blog Categories Manager (ক্যাটাগরি যোগ / রিমুভ ও সিলেক্ট করুন)
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      Click a category to filter & pre-select for new posts, add new categories, or click × to remove.
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
              <div className="bg-[#110f17] border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-[#16131e] text-[11px] uppercase tracking-wider text-stone-400 border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Title & Subtitle</th>
                      <th className="py-3 px-4">Slug URL</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Nav & Footer</th>
                      <th className="py-3 px-4">Access Tier</th>
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
                        <td className="py-3 px-4 text-[11px] text-stone-400">
                          {b.showInHeader && <span className="text-emerald-400 mr-2">● Header</span>}
                          {b.showInFooter && <span className="text-sky-400">● Footer</span>}
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
                    Tips & Masterclasses Management ({store.tips.length})
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    Manage Non-Adult and Adult 18+ lifestyle, styling, dining, and intimacy tips. Auto-publish 5 category tips daily.
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
                      setEditingTip({
                        id: `tip-${Date.now()}`,
                        title: '',
                        category: 'Feminine Confidence',
                        isAdult18: false,
                        image: PRESET_THUMBNAILS[0],
                        content: '',
                        readTime: '3 min read',
                        date: 'Today',
                        featuredOnHome: true,
                        isPrivateVIP: false,
                        isShareToUnlock: false,
                        likes: 0
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
              <div className="bg-[#110f17] border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-[#16131e] text-[11px] uppercase tracking-wider text-stone-400 border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Preview</th>
                      <th className="py-3 px-4">Title & Excerpt</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">18+ / Adult</th>
                      <th className="py-3 px-4">Access Tier</th>
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
                            onClick={() => handleToggleTipHome(tip.id)}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${tip.featuredOnHome ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-stone-900 text-stone-500 border border-stone-800'}`}
                          >
                            {tip.featuredOnHome ? '★ On Home' : 'Add to Home'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
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
                    Create standalone pages like About Isabella, Case Studies, Terms, Concierge & Masterclasses.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingPage({
                      id: `page-${Date.now()}`,
                      titleEn: '',
                      titleBn: '',
                      slug: '',
                      content: '',
                      showInHeader: true,
                      showInFooter: true,
                      status: 'published',
                      lastUpdated: 'Just now'
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
              <div className="bg-[#110f17] border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-[#16131e] text-[11px] uppercase tracking-wider text-stone-400 border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Title (English / Bengali)</th>
                      <th className="py-3 px-4">Slug URL</th>
                      <th className="py-3 px-4">Nav Visibility</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80">
                    {store.pages.map((p) => (
                      <tr key={p.id} className="hover:bg-[#16131e]/50 transition-colors">
                        <td className="py-3 px-4 max-w-sm">
                          <span className="font-semibold text-white block">{p.titleEn}</span>
                          <span className="text-[11px] text-stone-400 block">{p.titleBn}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#e7c792]">
                          /page/{p.slug}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-stone-400">
                          {p.showInHeader && <span className="text-emerald-400 mr-2">● Header</span>}
                          {p.showInFooter && <span className="text-sky-400">● Footer</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
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

          {/* TAB 4: SITE-WIDE IMAGES, PAGE COPY & SHOWREEL STUDIO */}
          {activeTab === 'showreel' && (
            <div className="max-w-4xl space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Site-Wide Images, Page Copy & Showreel Studio
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Upload custom images directly from your device or paste URLs for every page section, plus edit full page copy in one place.
                </p>
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
                                    settings: { ...prev.settings, [key]: dataUrl }
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
                            onChange={(e) => onUpdateStore(prev => ({
                              ...prev,
                              settings: { ...prev.settings, [key]: e.target.value }
                            }))}
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

          {/* TAB 5: COMMENTS REVIEW */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Comments Moderation & Approval Panel ({store.comments.length})
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Review, approve, or reject comments submitted by readers and VIP members.
                </p>
              </div>

              <div className="space-y-3">
                {store.comments.map((com) => (
                  <div
                    key={com.id}
                    className="p-4 bg-[#110f17] border border-stone-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <strong className="text-white">{com.authorName}</strong>
                        <span className="text-stone-500">({com.authorEmail})</span>
                        <span>·</span>
                        <span className="text-[#c99757] font-medium">{com.postTitle}</span>
                        <span>·</span>
                        <span className="text-stone-500 text-[11px]">{com.createdAt}</span>
                      </div>
                      <p className="text-xs text-stone-300 bg-[#09080d] p-3 rounded-lg border border-stone-800">
                        "{com.commentText}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${com.status === 'approved' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' : com.status === 'pending' ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30' : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'}`}>
                        {com.status}
                      </span>

                      {com.status !== 'approved' && (
                        <button
                          onClick={() => handleCommentStatus(com.id, 'approved')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs transition-colors"
                        >
                          Approve
                        </button>
                      )}

                      {com.status !== 'rejected' && (
                        <button
                          onClick={() => handleCommentStatus(com.id, 'rejected')}
                          className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors"
                        >
                          Reject
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteComment(com.id)}
                        className="p-1.5 text-stone-500 hover:text-red-400 rounded hover:bg-stone-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Settings & Security Hub
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Manage branding, contact info, security passcode, categories, and data backups.
                </p>
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

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Hero Section Background Image URL
                  </label>
                  <input
                    type="text"
                    value={store.settings.heroBgImage}
                    onChange={(e) => onUpdateStore(prev => ({
                      ...prev,
                      settings: { ...prev.settings, heroBgImage: e.target.value }
                    }))}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#c99757]"
                  />
                </div>
              </div>

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
                  onChange={(e) => setEditingVideo({ ...editingVideo, thumbnailUrl: e.target.value })}
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

              <div className="grid grid-cols-2 gap-3">
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

      {/* BLOG MODAL (Add/Edit) */}
      {isBlogModalOpen && editingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#110f17] border border-stone-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-4">
              <h3 className="text-base font-semibold text-white">Edit Blog Article (Target 800–1,000 Words SEO)</h3>
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
                      slug: editingBlog.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    });
                  }}
                  className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
              </div>

              <div>
                <label className="block text-stone-300 mb-1 font-medium">Subtitle / SEO Meta Excerpt</label>
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
                  onChange={(e) => setEditingBlog({ ...editingBlog, bannerImage: e.target.value })}
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-300 font-medium">Rich SEO Article Content (use ## for headings)</label>
                  <span className="text-[11px] font-mono text-[#e7c792]">
                    Words: {countWords(editingBlog.content)} / 1000
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={editingBlog.content}
                  onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                  className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2.5 text-white leading-relaxed"
                  placeholder="Write the full SEO story, ## headings, tips, and insights here..."
                  required
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

      {/* TIPS MODAL (Add/Edit) */}
      {isTipModalOpen && editingTip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#110f17] border border-stone-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-4">
              <h3 className="text-base font-semibold text-white">Edit Masterclass Tip (400–600 Words SEO)</h3>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Category</label>
                  <select
                    value={editingTip.category}
                    onChange={(e) => setEditingTip({ ...editingTip, category: e.target.value as TipItem['category'] })}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white"
                  >
                    <option value="Feminine Confidence">Feminine Confidence</option>
                    <option value="Fashion & Styling">Fashion & Styling</option>
                    <option value="Dining & Wine">Dining & Wine</option>
                    <option value="Adult 18+ Intimacy">Adult 18+ Intimacy</option>
                    <option value="Skincare & Glow">Skincare & Glow</option>
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
                  onChange={(e) => setEditingTip({ ...editingTip, image: e.target.value })}
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-300 font-medium">Detailed SEO Tip Advice (use ## for section headings)</label>
                  <span className="text-[11px] font-mono text-[#e7c792]">
                    Words: {countWords(editingTip.content)} (Target 400–600)
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={editingTip.content}
                  onChange={(e) => setEditingTip({ ...editingTip, content: e.target.value })}
                  className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2.5 text-white leading-relaxed"
                  required
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

      {/* PAGE MODAL (Add/Edit) */}
      {isPageModalOpen && editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-[#110f17] border border-stone-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-4">
              <h3 className="text-base font-semibold text-white">Edit Standalone Page</h3>
              <button onClick={() => setIsPageModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePage} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Page Title (English)</label>
                  <input
                    type="text"
                    value={editingPage.titleEn}
                    onChange={(e) => {
                      const t = e.target.value;
                      setEditingPage({
                        ...editingPage,
                        titleEn: t,
                        slug: editingPage.slug || t.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                      });
                    }}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Page Title (Bengali)</label>
                  <input
                    type="text"
                    value={editingPage.titleBn}
                    onChange={(e) => setEditingPage({ ...editingPage, titleBn: e.target.value })}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2 text-white"
                  />
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

              <div>
                <label className="block text-stone-300 mb-1 font-medium">Page Body Content</label>
                <textarea
                  rows={5}
                  value={editingPage.content}
                  onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                  className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2.5 text-white leading-relaxed"
                  required
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
                  className="px-5 py-2 rounded-lg bg-[#c99757] hover:bg-[#d6a567] text-stone-950 font-semibold"
                >
                  Save Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
