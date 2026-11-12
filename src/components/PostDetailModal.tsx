import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Lock, 
  Calendar, 
  Clock, 
  Heart, 
  Share2, 
  Crown, 
  Sparkles,
  MessageSquare,
  Send,
  CheckCircle2,
  Check
} from 'lucide-react';
import { BlogPost, CommentItem, UserSubscription } from '../types';
import { resolveAssetUrl } from '../defaultStore';

interface PostDetailModalProps {
  post: BlogPost | null;
  comments: CommentItem[];
  subscription: UserSubscription;
  unlockedShareIds: string[];
  onClose: () => void;
  onOpenVIPModal: () => void;
  onShareToUnlock: (id: string) => void;
  onLikePost: (id: string) => void;
  onAddComment: (postId: string, postTitle: string, name: string, email: string, text: string) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  comments,
  subscription,
  unlockedShareIds,
  onClose,
  onOpenVIPModal,
  onShareToUnlock,
  onLikePost,
  onAddComment
}) => {
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!post) return null;

  const isShareUnlocked = unlockedShareIds.includes(post.id);
  const isVipUnlocked = subscription.tier !== 'Free';
  const isLocked =
    (post.isPrivateVIP || Boolean(post.isShareToUnlock)) && !isVipUnlocked && !isShareUnlocked;
  const postComments = comments.filter(c => c.postId === post.id && c.status === 'approved');
  const wordCount = post.content.trim().split(/\s+/).length;

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    onAddComment(post.id, post.titleEn, commentName, commentEmail, commentText);
    setCommentSubmitted(true);
    setCommentName('');
    setCommentEmail('');
    setCommentText('');
    setTimeout(() => setCommentSubmitted(false), 5000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center text-left"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#110c19] border border-[#e5b36b]/35 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Top bar */}
        <div className="p-4 border-b border-stone-800/80 flex items-center justify-between bg-[#161021] shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-medium text-stone-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-stone-800/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Articles
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => onLikePost(post.id)}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>{post.likes}</span>
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-2.5 py-1.5 text-xs text-stone-300 hover:text-white rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1"
              title="Share Article"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              {copied && <span className="text-[11px] text-emerald-400">Copied</span>}
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-10 overflow-y-auto flex-1">
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 mb-3">
            <span className="text-[#e5b36b] font-semibold tracking-wider uppercase">{post.category}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {post.date}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime} ({wordCount} words)
            </span>
            {post.isPrivateVIP && (
              <>
                <span>·</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  VIP Private Content
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl md:text-4xl font-serif-display font-semibold text-white tracking-tight leading-tight mb-6">
            {post.titleEn}
          </h1>

          {/* Banner image */}
          <div className="relative rounded-xl overflow-hidden mb-8 border border-stone-800 bg-stone-900">
            {isLocked ? (
              <div className="w-full py-12 px-6 bg-gradient-to-br from-[#23112d] via-[#150d20] to-[#0a070f] flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#e5b36b]/20 border border-[#e5b36b]/40 flex items-center justify-center text-[#e5b36b] mb-3">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif-display font-bold text-white mb-2">
                  {post.isShareToUnlock ? 'Share to Unlock Complete Article' : 'VIP Exclusive Private Vault'}
                </h3>
                <p className="text-xs text-stone-300 max-w-md mb-5 leading-relaxed">
                  This complete article is sealed. {post.isShareToUnlock ? 'Share on social media below to unlock free reading access immediately, or join VIP for total vault access.' : 'Upgrade to VIP Inner Circle ($05.99/mo) to read immediately.'}
                </p>
                {post.isShareToUnlock && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                    {['Facebook', 'Twitter / X', 'WhatsApp'].map((net) => (
                      <button
                        key={net}
                        onClick={() => onShareToUnlock(post.id)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Share on {net}
                      </button>
                    ))}
                  </div>
                )}
                {post.isPrivateVIP && (
                  <button
                    onClick={onOpenVIPModal}
                    className="px-6 py-2.5 rounded-lg text-xs font-bold gorgeous-btn-gradient text-stone-950 flex items-center gap-2 hover:opacity-95 transition-opacity shadow-lg"
                  >
                    <Crown className="w-4 h-4" />
                    Unlock VIP Vault Now ($05.99/mo)
                  </button>
                )}
              </div>
            ) : (
              <img
                src={resolveAssetUrl(post.bannerImage)}
                alt={post.titleEn}
                className="w-full h-56 sm:h-80 object-cover"
              />
            )}
          </div>

          {/* Subtitle / Excerpt */}
          {post.subtitle && (
            <p className="text-base text-stone-300 font-medium italic border-l-2 border-[#e5b36b] pl-4 py-1 mb-8">
              "{post.subtitle}"
            </p>
          )}

          {/* Content */}
          {isLocked ? (
            <div className="p-8 rounded-xl bg-[#181224] border border-amber-600/30 text-center space-y-4">
              <Sparkles className="w-8 h-8 text-[#e5b36b] mx-auto" />
              <h4 className="text-lg font-serif-display font-bold text-white">
                Full Story Locked
              </h4>
              <p className="text-xs text-stone-300 max-w-lg mx-auto leading-relaxed">
                Unlock immediate access to read the complete {wordCount}-word editorial story, view high-resolution imagery, and participate in reader discussion.
              </p>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none text-stone-200 space-y-4 leading-relaxed text-sm md:text-base">
              {post.content.split('\n\n').map((block, idx) => {
                const trimmed = block.trim();
                if (trimmed.startsWith('## ')) {
                  return (
                    <h3
                      key={idx}
                      className="text-xl md:text-2xl font-serif-display font-bold text-[#f6e2bb] pt-3"
                    >
                      {trimmed.replace(/^##\s+/, '')}
                    </h3>
                  );
                }
                if (trimmed.startsWith('### ')) {
                  return (
                    <h4 key={idx} className="text-lg font-serif-display font-semibold text-white pt-2">
                      {trimmed.replace(/^###\s+/, '')}
                    </h4>
                  );
                }
                return (
                  <p key={idx} className="leading-relaxed">
                    {trimmed}
                  </p>
                );
              })}

              {post.optionalVideoLink && (
                <div className="mt-6 aspect-video rounded-xl overflow-hidden border border-stone-800 bg-black">
                  <video src={post.optionalVideoLink} controls className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}

          {/* COMMENTS SYSTEM SECTION */}
          <div className="mt-12 pt-8 border-t border-stone-800 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif-display font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#e5b36b]" />
                Comments & Reader Thoughts ({postComments.length})
              </h3>
            </div>

            {/* Approved Comments List */}
            <div className="space-y-3">
              {postComments.length === 0 ? (
                <p className="text-xs text-stone-500 italic">No approved comments yet. Be the first to share your thoughts!</p>
              ) : (
                postComments.map((com) => (
                  <div key={com.id} className="p-4 rounded-xl bg-[#161021] border border-stone-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{com.authorName}</span>
                      <span className="text-[11px] text-stone-500">{com.createdAt}</span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      {com.commentText}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Submit Comment Form */}
            <div className="p-5 rounded-2xl bg-[#161021] border border-stone-800/80 space-y-4">
              <h4 className="text-sm font-semibold text-white">Leave a Thought or Inquire</h4>

              {commentSubmitted ? (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Thank you! Your comment has been submitted and is awaiting admin approval.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitComment} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Your Name *"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      className="bg-[#09080d] border border-stone-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#e5b36b]"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address (kept private)"
                      value={commentEmail}
                      onChange={(e) => setCommentEmail(e.target.value)}
                      className="bg-[#09080d] border border-stone-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#e5b36b]"
                    />
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Write your comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#e5b36b]"
                    required
                  />

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg gorgeous-btn-gradient text-stone-950 font-bold flex items-center gap-1.5 transition-opacity hover:opacity-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Comment for Review
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
