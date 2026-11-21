import React, { useState } from 'react';
import { Post, MediaItem } from '../types';
import { 
  PlusCircle, 
  Trash2, 
  Sparkles, 
  Layers, 
  Play, 
  Eye, 
  Lock, 
  Unlock, 
  Send,
  CheckCircle2, 
  BarChart3, 
  Globe, 
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { AUTO_POST_TEMPLATES } from '../data';

interface AdminPanelProps {
  posts: Post[];
  mediaList: MediaItem[];
  onAddPost: (newPost: Post) => void;
  onDeletePost: (id: string) => void;
  onBatchAutoPost: (count: number, category: string) => void;
  onAddMedia: (media: MediaItem) => void;
  onDeleteMedia: (id: string) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  posts,
  mediaList,
  onAddPost,
  onDeletePost,
  onBatchAutoPost,
  onAddMedia,
  onDeleteMedia,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'autopost' | 'media' | 'deploy'>('autopost');

  // Manual post state
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState<Post['category']>('Lifestyle');
  const [postExcerpt, setPostExcerpt] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postIsPrivate, setPostIsPrivate] = useState(false);
  const [postImage, setPostImage] = useState('/assets/aistudio/Woman_holding_champagne_in_apart__e76ad1b2_29aa52d1.jpg');

  // Auto-post generator state
  const [autoCount, setAutoCount] = useState<number>(10);
  const [autoCategory, setAutoCategory] = useState<string>('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLog, setGenerationLog] = useState<string[]>([]);

  // Manual media state
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('/assets/aistudio/Woman_attending_Paris_Fashion_Week_9aa7e528_7689710f.jpg');
  const [mediaIsPrivate, setMediaIsPrivate] = useState(false);
  const [mediaCategory, setMediaCategory] = useState('Fashion');

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      title: postTitle,
      category: postCategory,
      slug: postTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      excerpt: postExcerpt || postContent.substring(0, 120) + '...',
      content: postContent,
      coverImage: postImage,
      readTime: '4 min read',
      publishedAt: 'Just now',
      isPrivate: postIsPrivate,
      views: 0,
      likes: 0,
      commentsCount: 0,
      tags: [postCategory, 'Exclusive', 'Isabella']
    };

    onAddPost(newPost);
    setPostTitle('');
    setPostExcerpt('');
    setPostContent('');
    alert('Blog post published successfully!');
  };

  const handleRunBatchAutoPost = () => {
    setIsGenerating(true);
    setGenerationLog([]);

    setTimeout(() => {
      onBatchAutoPost(autoCount, autoCategory);
      setIsGenerating(false);
      setGenerationLog([
        `Success: Successfully generated & published ${autoCount} fresh blog posts!`,
        `Category: ${autoCategory === 'All' ? 'Balanced across all categories' : autoCategory}`,
        `VIP Filter: Handled adult private and public tiers appropriately.`,
        `Timestamp: ${new Date().toLocaleTimeString()}`
      ]);
    }, 600);
  };

  const handleCreateMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaTitle.trim() || !mediaUrl.trim()) return;

    const newItem: MediaItem = {
      id: `media-${Date.now()}`,
      title: mediaTitle,
      type: mediaType,
      mediaUrl: mediaUrl,
      thumbnailUrl: mediaUrl,
      isPrivate: mediaIsPrivate,
      category: mediaCategory,
      likes: 0,
      description: `Uploaded media for ${mediaCategory}`
    };

    onAddMedia(newItem);
    setMediaTitle('');
    alert('Media added to gallery successfully!');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 md:p-8 flex justify-center">
      <div className="relative w-full max-w-5xl bg-[#110f16] border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-[#15121b]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#c99757]/15 border border-[#c99757]/30 flex items-center justify-center text-[#c99757]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif-display font-semibold text-white">
                Isabella Rose Admin Command Hub
              </h2>
              <p className="text-xs text-stone-400">
                Manage Posts, Auto-Publishing Engine, VIP Vault Media & Free Netlify Deployment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-700/60 rounded-lg transition-colors"
          >
            Exit Admin
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-stone-800/80 bg-[#131018] text-xs">
          <button
            onClick={() => setActiveTab('autopost')}
            className={`px-3.5 py-1.5 font-medium rounded-md transition-colors flex items-center gap-2 ${activeTab === 'autopost' ? 'bg-[#c99757] text-stone-950 font-semibold' : 'text-stone-400 hover:text-white hover:bg-stone-800/50'}`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Auto-Post Engine (10-12/Day)
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-3.5 py-1.5 font-medium rounded-md transition-colors flex items-center gap-2 ${activeTab === 'posts' ? 'bg-[#c99757] text-stone-950 font-semibold' : 'text-stone-400 hover:text-white hover:bg-stone-800/50'}`}
          >
            <Layers className="w-3.5 h-3.5" />
            Blog Posts Manager ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`px-3.5 py-1.5 font-medium rounded-md transition-colors flex items-center gap-2 ${activeTab === 'media' ? 'bg-[#c99757] text-stone-950 font-semibold' : 'text-stone-400 hover:text-white hover:bg-stone-800/50'}`}
          >
            <Eye className="w-3.5 h-3.5" />
            VIP & Public Media ({mediaList.length})
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`px-3.5 py-1.5 font-medium rounded-md transition-colors flex items-center gap-2 ${activeTab === 'deploy' ? 'bg-[#c99757] text-stone-950 font-semibold' : 'text-stone-400 hover:text-white hover:bg-stone-800/50'}`}
          >
            <Globe className="w-3.5 h-3.5" />
            Free Netlify Deploy Guide
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-stone-300">
          {/* TAB 1: AUTO POST ENGINE */}
          {activeTab === 'autopost' && (
            <div className="space-y-6">
              <div className="bg-[#181520] border border-[#c99757]/30 p-5 rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-serif-display font-semibold text-white">
                      Daily Category-Based Auto-Post Generator
                    </h3>
                    <p className="text-xs text-stone-400 mt-1 max-w-2xl">
                      As requested, this automated system creates 10–12 unique high-quality lifestyle, fashion, food, adult private VIP, and beauty posts automatically with authentic photography, excerpts, reading times, and tags.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-[#c99757]/20 border border-[#c99757]/40 text-[#e7c792] text-xs font-medium">
                    Scheduled Daily Cron Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      Batch Count (10-12 Posts)
                    </label>
                    <select
                      value={autoCount}
                      onChange={(e) => setAutoCount(Number(e.target.value))}
                      className="w-full bg-[#110f16] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                    >
                      <option value={10}>Generate 10 Posts (Daily Regular)</option>
                      <option value={12}>Generate 12 Posts (High Output)</option>
                      <option value={5}>Generate 5 Posts (Quick Batch)</option>
                      <option value={15}>Generate 15 Posts (Mega Batch)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      Target Category Focus
                    </label>
                    <select
                      value={autoCategory}
                      onChange={(e) => setAutoCategory(e.target.value)}
                      className="w-full bg-[#110f16] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                    >
                      <option value="All">All Categories (Lifestyle, Fashion, Food, VIP)</option>
                      <option value="VIP Private">VIP Private & Boudoir Only</option>
                      <option value="Fashion">Fashion & Haute Couture Only</option>
                      <option value="Lifestyle">Lifestyle & Feminine Confidence Only</option>
                      <option value="Food">Gourmet Dining & Champagne Only</option>
                      <option value="Beauty Tips">Beauty & Skincare Tips Only</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleRunBatchAutoPost}
                      disabled={isGenerating}
                      className="w-full py-2.5 px-4 bg-[#c99757] hover:bg-[#d6a567] disabled:opacity-50 text-stone-950 font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Publishing {autoCount} Posts...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Trigger Auto-Post Run Now
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {generationLog.length > 0 && (
                  <div className="mt-4 p-3 bg-stone-900/80 border border-stone-800 rounded-lg text-xs space-y-1">
                    {generationLog.map((log, index) => (
                      <div key={index} className="text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-[#15121b] border border-stone-800 p-4 rounded-xl">
                  <div className="text-xs text-stone-400">Total Live Articles</div>
                  <div className="text-2xl font-bold text-white mt-1 font-serif-display">{posts.length}</div>
                  <div className="text-[11px] text-[#c99757] mt-1">Ready for Netlify & SEO</div>
                </div>
                <div className="bg-[#15121b] border border-stone-800 p-4 rounded-xl">
                  <div className="text-xs text-stone-400">VIP Private Vault Items</div>
                  <div className="text-2xl font-bold text-[#e7c792] mt-1 font-serif-display">
                    {posts.filter(p => p.isPrivate).length + mediaList.filter(m => m.isPrivate).length}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1">Locked behind membership</div>
                </div>
                <div className="bg-[#15121b] border border-stone-800 p-4 rounded-xl">
                  <div className="text-xs text-stone-400">Total Media Assets</div>
                  <div className="text-2xl font-bold text-white mt-1 font-serif-display">{mediaList.length}</div>
                  <div className="text-[11px] text-stone-400 mt-1">Videos & HD Photos</div>
                </div>
                <div className="bg-[#15121b] border border-stone-800 p-4 rounded-xl">
                  <div className="text-xs text-stone-400">Auto-Post Engine Status</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1 font-serif-display">ACTIVE</div>
                  <div className="text-[11px] text-stone-400 mt-1">10-12 daily rhythm</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POSTS MANAGER */}
          {activeTab === 'posts' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Create Post Form */}
              <div className="lg:col-span-5 bg-[#15121b] border border-stone-800 p-5 rounded-xl">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-[#c99757]" />
                  Write Custom Article
                </h3>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Post Title</label>
                    <input
                      type="text"
                      placeholder="e.g. My Secret Evening in Milan..."
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className="w-full bg-[#0d0b10] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1">Category</label>
                      <select
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value as Post['category'])}
                        className="w-full bg-[#0d0b10] border border-stone-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                      >
                        <option value="Lifestyle">Lifestyle</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Food">Food</option>
                        <option value="VIP Private">VIP Private (Adult)</option>
                        <option value="Beauty Tips">Beauty Tips</option>
                        <option value="Travel">Travel</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1">Access Privacy</label>
                      <button
                        type="button"
                        onClick={() => setPostIsPrivate(!postIsPrivate)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${postIsPrivate ? 'bg-amber-950/40 border-amber-600/50 text-amber-300' : 'bg-stone-900 border-stone-700 text-stone-300'}`}
                      >
                        {postIsPrivate ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        {postIsPrivate ? 'VIP Only' : 'Public Access'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Cover Image</label>
                    <select
                      value={postImage}
                      onChange={(e) => setPostImage(e.target.value)}
                      className="w-full bg-[#0d0b10] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                    >
                      <option value="/assets/aistudio/Woman_holding_champagne_in_apart__e76ad1b2_29aa52d1.jpg">Editorial Penthouse Emerald</option>
                      <option value="/assets/aistudio/Woman_attending_Paris_Fashion_Week_9aa7e528_7689710f.jpg">Paris Fashion Week Salon</option>
                      <option value="/assets/aistudio/Woman_dining_on_Paris_rooftop_ca52de81_2c162ebd.jpg">Eiffel Tower Rooftop & Champagne</option>
                      <option value="/assets/aistudio/Woman_posing_in_lingerie_penthouse_62bf7a05_59b86297.jpg">Penthouse Boudoir Suite</option>
                      <option value="/assets/aistudio/Photorealistic_close-up_portrait__8357bd9b_2bd7b609.jpg">Golden Hour Close-Up Portrait</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Summary / Excerpt</label>
                    <textarea
                      rows={2}
                      placeholder="Short preview hook for readers..."
                      value={postExcerpt}
                      onChange={(e) => setPostExcerpt(e.target.value)}
                      className="w-full bg-[#0d0b10] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Full Article Content</label>
                    <textarea
                      rows={5}
                      placeholder="Write your story, thoughts, and tips here..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="w-full bg-[#0d0b10] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#c99757] hover:bg-[#d6a567] text-stone-950 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Publish Post to Blog
                  </button>
                </form>
              </div>

              {/* Right Column: Existing Posts List */}
              <div className="lg:col-span-7 bg-[#15121b] border border-stone-800 p-5 rounded-xl flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white">Live Blog Library ({posts.length})</h3>
                  <span className="text-xs text-stone-400">Click trash to remove</span>
                </div>
                <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="p-3 bg-[#0d0b10] border border-stone-800 hover:border-stone-700 rounded-lg flex items-center gap-3 transition-colors"
                    >
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-16 h-14 object-cover rounded shrink-0 bg-stone-900"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[11px] text-stone-400">
                          <span className="text-[#c99757] font-medium">{post.category}</span>
                          <span>·</span>
                          <span>{post.publishedAt}</span>
                          {post.isPrivate && (
                            <>
                              <span>·</span>
                              <span className="text-amber-400 font-semibold flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" /> VIP
                              </span>
                            </>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-white truncate mt-0.5">{post.title}</h4>
                        <p className="text-[11px] text-stone-400 truncate mt-0.5">{post.excerpt}</p>
                      </div>
                      <button
                        onClick={() => onDeletePost(post.id)}
                        className="p-2 text-stone-400 hover:text-red-400 hover:bg-stone-800 rounded transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA VAULT */}
          {activeTab === 'media' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Upload Media */}
              <div className="lg:col-span-5 bg-[#15121b] border border-stone-800 p-5 rounded-xl">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-[#c99757]" />
                  Add Photo / Video Asset
                </h3>
                <form onSubmit={handleCreateMedia} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Title / Caption</label>
                    <input
                      type="text"
                      placeholder="e.g. VIP Penthouse Sensual Reel"
                      value={mediaTitle}
                      onChange={(e) => setMediaTitle(e.target.value)}
                      className="w-full bg-[#0d0b10] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1">Type</label>
                      <select
                        value={mediaType}
                        onChange={(e) => setMediaType(e.target.value as 'image' | 'video')}
                        className="w-full bg-[#0d0b10] border border-stone-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                      >
                        <option value="image">Image (High-Res)</option>
                        <option value="video">Video (4K / Reel)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1">Access Level</label>
                      <button
                        type="button"
                        onClick={() => setMediaIsPrivate(!mediaIsPrivate)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${mediaIsPrivate ? 'bg-amber-950/40 border-amber-600/50 text-amber-300' : 'bg-stone-900 border-stone-700 text-stone-300'}`}
                      >
                        {mediaIsPrivate ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        {mediaIsPrivate ? 'VIP Adult Vault' : 'Public Gallery'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Category</label>
                    <select
                      value={mediaCategory}
                      onChange={(e) => setMediaCategory(e.target.value)}
                      className="w-full bg-[#0d0b10] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                    >
                      <option value="Fashion">Fashion & Styling</option>
                      <option value="Lifestyle">Lifestyle & Travel</option>
                      <option value="VIP Private">VIP Private & Boudoir</option>
                      <option value="Food">Fine Dining & Wine</option>
                      <option value="Beauty Tips">Beauty Tips</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Media Source URL</label>
                    <select
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="w-full bg-[#0d0b10] border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c99757]"
                    >
                      <option value="/assets/aistudio/Woman_holding_champagne_in_apart__e76ad1b2_29aa52d1.jpg">Editorial Penthouse Emerald</option>
                      <option value="/assets/aistudio/Woman_attending_Paris_Fashion_Week_9aa7e528_7689710f.jpg">Paris Fashion Week Salon</option>
                      <option value="/assets/aistudio/Woman_dining_on_Paris_rooftop_ca52de81_2c162ebd.jpg">Eiffel Tower Rooftop & Champagne</option>
                      <option value="/assets/aistudio/Woman_posing_in_velvet_lounge_8f6f75d5_4e275e73.jpg">Velvet VIP Lounge</option>
                      <option value="/assets/aistudio/Photorealistic_close-up_portrait__8357bd9b_2bd7b609.jpg">Golden Hour Close-Up Portrait</option>
                      <option value="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4">Sample 4K Video Reel</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#c99757] hover:bg-[#d6a567] text-stone-950 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Save Asset to Media Gallery
                  </button>
                </form>
              </div>

              {/* Media Gallery List */}
              <div className="lg:col-span-7 bg-[#15121b] border border-stone-800 p-5 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white">Media Assets ({mediaList.length})</h3>
                  <span className="text-xs text-stone-400">Public & VIP Exclusive</span>
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                  {mediaList.map((m) => (
                    <div
                      key={m.id}
                      className="relative rounded-lg overflow-hidden border border-stone-800 group bg-stone-900"
                    >
                      <img
                        src={m.thumbnailUrl}
                        alt={m.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-2.5 bg-[#0d0b10]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-[#c99757] font-medium">{m.category}</span>
                          {m.isPrivate && (
                            <span className="text-amber-400 text-[10px] font-bold uppercase flex items-center gap-0.5">
                              <Lock className="w-3 h-3" /> VIP
                            </span>
                          )}
                        </div>
                        <h5 className="text-xs text-white font-medium truncate">{m.title}</h5>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] text-stone-400 capitalize">{m.type}</span>
                          <button
                            onClick={() => onDeleteMedia(m.id)}
                            className="text-stone-400 hover:text-red-400 text-xs transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEPLOY TO NETLIFY */}
          {activeTab === 'deploy' && (
            <div className="space-y-6">
              <div className="bg-[#181520] border border-[#c99757]/30 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#c99757]/15 rounded-lg text-[#c99757]">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif-display font-semibold text-white">
                      How to Deploy to Netlify 100% Free with Custom Domain
                    </h3>
                    <p className="text-xs text-stone-400">
                      Step-by-step workflow for hosting Isabella Rose's VIP blog & membership site completely free forever.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-stone-300 leading-relaxed">
                  <div className="p-4 bg-[#110f16] border border-stone-800 rounded-lg">
                    <span className="font-semibold text-[#e7c792] block text-sm mb-1">
                      Step 1: Download or Push Code to GitHub
                    </span>
                    <p className="text-stone-400">
                      Download this repository or push it to a private GitHub repository under your account (e.g., <code className="text-[#c99757]">isabella-vip-blog</code>).
                    </p>
                  </div>

                  <div className="p-4 bg-[#110f16] border border-stone-800 rounded-lg">
                    <span className="font-semibold text-[#e7c792] block text-sm mb-1">
                      Step 2: Sign Up & Import into Netlify (Free Plan)
                    </span>
                    <p className="text-stone-400">
                      1. Go to <span className="text-white font-medium">app.netlify.com</span> and sign up with GitHub.<br />
                      2. Click <span className="text-white font-medium">"Add new site" &gt; "Import an existing project"</span>.<br />
                      3. Select your repository. Netlify automatically detects Vite!
                    </p>
                    <div className="mt-2.5 p-2.5 bg-black/50 rounded font-mono text-[11px] text-stone-300">
                      Build command: <span className="text-[#c99757]">npm run build</span><br />
                      Publish directory: <span className="text-[#c99757]">dist</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#110f16] border border-stone-800 rounded-lg">
                    <span className="font-semibold text-[#e7c792] block text-sm mb-1">
                      Step 3: Connect Free Subdomain or Custom Domain
                    </span>
                    <p className="text-stone-400">
                      Netlify gives you an instant free subdomain: <code className="text-emerald-400">isabella-rose.netlify.app</code> with free automatic HTTPS SSL certificates. You can also connect any custom domain (<code className="text-[#c99757]">isabellarose.com</code>) at zero hosting cost.
                    </p>
                  </div>

                  <div className="p-4 bg-[#110f16] border border-stone-800 rounded-lg">
                    <span className="font-semibold text-[#e7c792] block text-sm mb-1">
                      Step 4: SPA Redirects Rule (Included in this project)
                    </span>
                    <p className="text-stone-400">
                      A <code className="text-stone-200">_redirects</code> file with <code className="text-[#c99757]">/* /index.html 200</code> is provided so page reloads on all blog posts and admin routes never return 404 errors.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
