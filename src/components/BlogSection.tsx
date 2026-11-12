import React, { useState } from 'react';
import { 
  Lock, 
  Heart, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Crown, 
  MessageSquare,
  Share2
} from 'lucide-react';
import { BlogPost, CommentItem, FrontEditableTexts, UserSubscription } from '../types';
import { resolveAssetUrl } from '../defaultStore';

interface BlogSectionProps {
  blogs: BlogPost[];
  categories: string[];
  comments: CommentItem[];
  subscription: UserSubscription;
  frontTexts?: FrontEditableTexts;
  onSelectBlog: (blog: BlogPost) => void;
  onOpenVIPModal: () => void;
  onLikeBlog: (id: string) => void;
  onShareToUnlock: (id: string) => void;
  unlockedShareIds: string[];
  onAddComment: (postId: string, postTitle: string, name: string, email: string, text: string) => void;
  isLiveEditorActive: boolean;
  onUpdateFrontText?: (field: keyof FrontEditableTexts, val: string) => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({
  blogs,
  categories,
  comments,
  subscription,
  frontTexts,
  onSelectBlog,
  onOpenVIPModal,
  onLikeBlog,
  onShareToUnlock,
  unlockedShareIds,
  isLiveEditorActive,
  onUpdateFrontText
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allCategories = ['All', ...categories];

  const filteredBlogs = blogs.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      post.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.titleBn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sectionTitle = frontTexts?.blogSectionTitle || 'Isabella’s Personal Chronicles';
  const sectionSubtitle =
    frontTexts?.blogSectionSubtitle ||
    'Daily authentic writings covering Parisian high-couture, secret fine dining retreats, intimate feminine insights, and VIP private diaries.';

  return (
    <section id="blog" className="py-20 border-t border-stone-800/80 bg-gradient-to-b from-[#09080b] via-[#140a1d] to-[#0a0710]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs text-[#e5b36b] uppercase tracking-widest font-semibold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>The Journal & Stories</span>
            </div>
            {isLiveEditorActive && onUpdateFrontText ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={sectionTitle}
                  onChange={(e) => onUpdateFrontText('blogSectionTitle', e.target.value)}
                  className="w-full text-2xl md:text-3xl font-serif-display font-bold text-white bg-black/60 border border-amber-400 rounded-lg px-2 py-1"
                />
                <textarea
                  rows={2}
                  value={sectionSubtitle}
                  onChange={(e) => onUpdateFrontText('blogSectionSubtitle', e.target.value)}
                  className="w-full text-xs text-stone-200 bg-black/60 border border-amber-400 rounded-lg p-2"
                />
              </div>
            ) : (
              <>
                <h2 className="text-3xl md:text-5xl font-serif-display font-bold text-white tracking-tight">
                  {sectionTitle}
                </h2>
                <p className="text-sm text-stone-300 mt-2 leading-relaxed">
                  {sectionSubtitle}
                </p>
              </>
            )}
          </div>

          {/* Search bar & filter controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="Search articles & tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-60 bg-[#171022] border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#e5b36b]"
            />

            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-900/80 border border-stone-800 rounded-xl w-full sm:w-auto">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${selectedCategory === cat ? 'gorgeous-btn-gradient text-stone-950 font-bold shadow-md' : 'text-stone-400 hover:text-white'}`}
                >
                  {cat === 'VIP Private' ? '🔒 VIP Private' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-16 bg-[#14111a] rounded-2xl border border-stone-800">
            <p className="text-stone-400 text-sm">No articles found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((post) => {
              const isShareUnlocked = unlockedShareIds.includes(post.id);
              const isVipUnlocked = subscription.tier !== 'Free';
              const isLocked =
                (post.isPrivateVIP || Boolean(post.isShareToUnlock)) && !isVipUnlocked && !isShareUnlocked;
              const postComments = comments.filter(c => c.postId === post.id && c.status === 'approved');

              return (
                <article
                  key={post.id}
                  className="group rounded-2xl overflow-hidden border border-stone-800/80 bg-[#161021]/85 hover:border-[#e5b36b]/50 transition-all duration-300 flex flex-col gorgeous-card-glow"
                >
                  {/* Article Thumbnail */}
                  <div
                    onClick={() => onSelectBlog(post)}
                    className="relative aspect-16/10 overflow-hidden bg-stone-900 cursor-pointer"
                  >
                    <img
                      src={resolveAssetUrl(post.bannerImage)}
                      alt={post.titleEn}
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'blur-lg scale-110' : ''}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    {/* Metadata Header */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-stone-200 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 uppercase tracking-wider">
                        {post.category}
                      </span>

                      {post.isPrivateVIP && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 px-2.5 py-1 rounded-md bg-amber-950/80 border border-amber-600/40 backdrop-blur-md uppercase tracking-wider">
                          <Lock className="w-3 h-3" /> {isLocked ? 'VIP Locked' : 'VIP Unlocked'}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 text-xs text-stone-300 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{post.readTime}</span>
                      <span>·</span>
                      <span>{post.date}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        onClick={() => onSelectBlog(post)}
                        className="text-lg font-serif-display font-semibold text-white group-hover:text-[#f6e2bb] transition-colors leading-snug cursor-pointer line-clamp-2"
                      >
                        {post.titleEn}
                      </h3>
                      <p className="text-xs text-stone-300/80 mt-2 line-clamp-3 leading-relaxed">
                        {post.subtitle || post.content.replace(/##\s+/g, '').substring(0, 140) + '...'}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-5 pt-4 border-t border-stone-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onLikeBlog(post.id)}
                          className="flex items-center gap-1 text-xs text-stone-400 hover:text-rose-400 transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5" />
                          <span>{post.likes}</span>
                        </button>
                        <span className="flex items-center gap-1 text-xs text-stone-400">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{postComments.length}</span>
                        </span>
                      </div>

                      {isLocked ? (
                        <div className="flex items-center gap-2">
                          {post.isShareToUnlock && (
                            <button
                              onClick={() => onShareToUnlock(post.id)}
                              className="px-2 py-1 rounded-md bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 font-medium text-[10px] flex items-center gap-1"
                            >
                              <Share2 className="w-3 h-3" />
                              Share to Unlock
                            </button>
                          )}
                          <button
                            onClick={onOpenVIPModal}
                            className="text-xs font-semibold text-[#e5b36b] hover:text-[#f6e2bb] flex items-center gap-1"
                          >
                            <Crown className="w-3.5 h-3.5" />
                            Unlock
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onSelectBlog(post)}
                          className="text-xs font-medium text-stone-200 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          Read Article
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
