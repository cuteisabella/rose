import React, { useCallback, useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft,
  ArrowRight,
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
  Check,
  Link2
} from 'lucide-react';
import { BlogPost, CommentItem, UserSubscription } from '../types';
import { resolveAssetUrl } from '../defaultStore';
import { renderRichMarkdown } from '../utils/markdown';
import { ShareUnlockGatePanel } from './ShareUnlockModal';

interface PostDetailModalProps {
  post: BlogPost | null;
  allPosts?: BlogPost[];
  comments: CommentItem[];
  subscription: UserSubscription;
  unlockedShareIds: string[];
  onClose: () => void;
  onSelectPost?: (post: BlogPost) => void;
  onOpenVIPModal: () => void;
  onVerifiedShareUnlock: (id: string) => void;
  onLikePost: (id: string) => void;
  onAddComment: (postId: string, postTitle: string, name: string, email: string, text: string) => void;
}

function getWordAndReadMetrics(content: string) {
  const plainContent = content
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, ' ')
    .trim();
  const wordCount = plainContent ? plainContent.split(/\s+/).length : 0;
  const estimatedMinutes = Math.max(1, Math.ceil(wordCount / 200));
  return {
    wordCount,
    estimatedReadTime: `${estimatedMinutes} min read`
  };
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  allPosts = [],
  comments,
  subscription,
  unlockedShareIds,
  onClose,
  onSelectPost,
  onOpenVIPModal,
  onVerifiedShareUnlock,
  onLikePost,
  onAddComment
}) => {
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const updateScrollProgress = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 0) {
      setScrollProgress(0);
      return;
    }
    const nextProgress = Math.min(100, Math.max(0, (el.scrollTop / maxScroll) * 100));
    setScrollProgress(nextProgress);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTop = 0;
    }
    setScrollProgress(0);
    const frame = requestAnimationFrame(() => updateScrollProgress());
    window.addEventListener('resize', updateScrollProgress, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, [post?.id, updateScrollProgress]);

  if (!post) return null;

  const isShareUnlocked = unlockedShareIds.includes(post.id);
  const isVipUnlocked = subscription.tier !== 'Free';
  const isLocked =
    (post.isPrivateVIP || Boolean(post.isShareToUnlock)) && !isVipUnlocked && !isShareUnlocked;
  const postComments = comments.filter(c => c.postId === post.id && c.status === 'approved');
  const { wordCount, estimatedReadTime } = getWordAndReadMetrics(post.content);

  const normalizedCategory = (post.category || '').trim().toLowerCase();
  const candidatePosts = allPosts.filter((p) => p.id !== post.id && p.status === 'published');
  const sameCategoryPosts = candidatePosts.filter(
    (p) => (p.category || '').trim().toLowerCase() === normalizedCategory
  );
  const fallbackCategoryPosts = candidatePosts.filter(
    (p) => (p.category || '').trim().toLowerCase() !== normalizedCategory
  );
  const recommendedPosts = [...sameCategoryPosts, ...fallbackCategoryPosts].slice(0, 2);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://isabellamyth.netlify.app';
  const articleUrl = `${origin}/blog/${post.slug}`;
  const encodedArticleUrl = encodeURIComponent(articleUrl);
  const encodedArticleTitle = encodeURIComponent(post.titleEn);
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodedArticleUrl}&text=${encodedArticleTitle}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedArticleUrl}`;

  const copyTextToClipboard = async (value: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const tempInput = document.createElement('input');
      tempInput.value = value;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
    }
  };

  const handleCopyArticleLink = async () => {
    try {
      await copyTextToClipboard(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* ignore clipboard permission failure */
    }
  };

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
        {/* Subtle reading progress bar pinned at top edge of modal */}
        <div
          className="h-[3px] w-full bg-white/5 shrink-0 overflow-hidden"
          role="progressbar"
          aria-label="Article reading progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(scrollProgress)}
        >
          <div
            className="h-full w-full bg-gradient-to-r from-[#b07f43] via-[#e7c792] to-[#f4dfb6] origin-left transition-transform duration-100 ease-out"
            style={{ transform: `scaleX(${scrollProgress / 100})` }}
          />
        </div>

        {/* Top bar */}
        <div className="p-4 border-b border-stone-800/80 flex items-center justify-between bg-[#161021] shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-medium text-stone-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-stone-800/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Articles
          </button>
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onLikePost(post.id)}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors whitespace-nowrap shrink-0"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span className="tabular-nums">{post.likes}</span>
            </button>

            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Twitter"
              title="Share on Twitter"
              className="p-2 sm:px-2.5 sm:py-1.5 text-xs text-stone-300 hover:text-white rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/10 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="hidden md:inline">Twitter</span>
            </a>

            <a
              href={facebookShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Facebook"
              title="Share on Facebook"
              className="p-2 sm:px-2.5 sm:py-1.5 text-xs text-stone-300 hover:text-white rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/10 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M13.5 21v-7.5h2.5l.5-3h-3v-2c0-.9.3-1.5 1.6-1.5h1.5V4.2c-.3 0-1.2-.2-2.3-.2-2.3 0-3.8 1.4-3.8 3.9v2.6H8v3h2.5V21z" />
              </svg>
              <span className="hidden md:inline">Facebook</span>
            </a>

            <button
              type="button"
              onClick={handleCopyArticleLink}
              aria-label="Copy article link"
              title="Copy Link"
              className="px-2.5 py-1.5 text-xs text-stone-300 hover:text-white rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/10 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div
          ref={scrollContainerRef}
          onScroll={updateScrollProgress}
          className="p-5 sm:p-10 overflow-y-auto flex-1"
        >
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 mb-3">
            <span className="text-[#e5b36b] font-semibold tracking-wider uppercase">{post.category}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {post.date}
            </span>
            <span>·</span>
            <span
              className="flex items-center gap-1"
              title={`Estimated reading time based on ${wordCount.toLocaleString()} words`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{estimatedReadTime} ({wordCount.toLocaleString()} words)</span>
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
                  This complete article is sealed. {post.isShareToUnlock ? 'Share on a social network below and confirm completion to unlock free reading access, or join VIP for total vault access.' : 'Upgrade to VIP Inner Circle ($05.99/mo) to read immediately.'}
                </p>
                {post.isShareToUnlock && (
                  <div className="w-full max-w-lg mb-4">
                    <ShareUnlockGatePanel
                      itemId={post.id}
                      itemTitle={post.titleEn}
                      onVerifiedUnlock={onVerifiedShareUnlock}
                    />
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
              {renderRichMarkdown(post.content)}

              {post.optionalVideoLink && (
                <div className="mt-6 aspect-video rounded-xl overflow-hidden border border-stone-800 bg-black">
                  <video src={post.optionalVideoLink} controls className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}

          {/* SHARE BAR */}
          <div className="mt-10 pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-stone-300">
              <Share2 className="w-4 h-4 text-[#e5b36b] shrink-0" />
              <span className="font-medium text-white">Share this article</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={twitterShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg border border-white/15 bg-white/[0.04] hover:bg-white/10 text-stone-100 text-xs font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Twitter</span>
              </a>

              <a
                href={facebookShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg border border-white/15 bg-white/[0.04] hover:bg-white/10 text-stone-100 text-xs font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M13.5 21v-7.5h2.5l.5-3h-3v-2c0-.9.3-1.5 1.6-1.5h1.5V4.2c-.3 0-1.2-.2-2.3-.2-2.3 0-3.8 1.4-3.8 3.9v2.6H8v3h2.5V21z" />
                </svg>
                <span>Facebook</span>
              </a>

              <button
                type="button"
                onClick={handleCopyArticleLink}
                className="px-3.5 py-2 rounded-lg border border-[#e5b36b]/40 bg-[#e5b36b]/10 hover:bg-[#e5b36b]/20 text-[#f3d6a2] text-xs font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-emerald-300">Link Copied</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* COMMENTS SYSTEM SECTION */}
          <div className="mt-8 pt-8 border-t border-stone-800 space-y-6">
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

          {/* RECOMMENDED CONTENT SECTION */}
          {recommendedPosts.length > 0 && onSelectPost && (
            <section className="mt-10 pt-8 border-t border-stone-800/80 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <h3 className="text-xl font-serif-display font-bold text-white">
                    Recommended Content
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Selected stories curated from {sameCategoryPosts.length > 0 ? post.category : 'the editorial archive'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendedPosts.map((rec) => {
                  const recMetrics = getWordAndReadMetrics(rec.content);
                  const recImage = resolveAssetUrl(rec.bannerImage);
                  return (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => onSelectPost(rec)}
                      className="group text-left rounded-xl bg-[#161021] border border-stone-800 hover:border-[#e5b36b]/45 overflow-hidden transition-colors flex flex-col"
                    >
                      <div className="relative h-36 w-full bg-gradient-to-br from-[#231530] via-[#170f22] to-[#0d0914] overflow-hidden shrink-0">
                        {recImage && (
                          <img
                            src={recImage}
                            alt={rec.titleEn}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-400">
                            <span className="text-[#e5b36b] font-medium">{rec.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{rec.date}</span>
                            <span aria-hidden="true">·</span>
                            <span>{recMetrics.estimatedReadTime}</span>
                          </div>
                          <h4 className="text-base font-serif-display font-semibold text-white group-hover:text-[#f6e2bb] transition-colors line-clamp-2 leading-snug">
                            {rec.titleEn}
                          </h4>
                          {rec.subtitle && (
                            <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                              {rec.subtitle}
                            </p>
                          )}
                        </div>

                        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#e5b36b] group-hover:text-[#f6e2bb] transition-colors">
                          <span>Read Story</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
