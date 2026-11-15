import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Crown,
  Eye,
  Gem,
  Heart,
  LogOut,
  Sparkles,
  Trash2,
  User
} from 'lucide-react';
import { BlogPost, LikedContentEntry, TipItem, UserSubscription, ViewedContentEntry } from '../types';
import { resolveAssetUrl } from '../defaultStore';
import { stripMarkdownPreview } from '../utils/markdown';

interface MyProfileProps {
  subscription: UserSubscription;
  likedItems: LikedContentEntry[];
  viewedItems: ViewedContentEntry[];
  blogs: BlogPost[];
  tips: TipItem[];
  onOpenBlog: (blog: BlogPost) => void;
  onOpenTip: (tip: TipItem) => void;
  onRemoveLikedItem: (id: string) => void;
  onClearLikedItems: () => void;
  onOpenVIPModal: () => void;
  onSignOut: () => void;
  onNavigate: (target: string) => void;
}

type ResolvedLikedItem =
  | {
      kind: 'blog';
      id: string;
      title: string;
      category: string;
      preview: string;
      image: string;
      metaDate: string;
      likedAt: string;
      likesCount: number;
      blog: BlogPost;
    }
  | {
      kind: 'tip';
      id: string;
      title: string;
      category: string;
      preview: string;
      image: string;
      metaDate: string;
      likedAt: string;
      likesCount: number;
      tip: TipItem;
    };

export const MyProfile: React.FC<MyProfileProps> = ({
  subscription,
  likedItems,
  viewedItems,
  blogs,
  tips,
  onOpenBlog,
  onOpenTip,
  onRemoveLikedItem,
  onClearLikedItems,
  onOpenVIPModal,
  onSignOut,
  onNavigate
}) => {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const isVipMember = subscription.tier !== 'Free';
  const isBlackDiamond = subscription.tier === 'Black Diamond VIP';
  const isStatusActive = isVipMember && subscription.status === 'active';

  const resolvedLikedContent = useMemo<ResolvedLikedItem[]>(() => {
    const blogMap = new Map(blogs.filter((b) => b.status === 'published').map((b) => [b.id, b]));
    const tipMap = new Map(tips.filter((t) => t.status === 'published').map((t) => [t.id, t]));

    const items: ResolvedLikedItem[] = [];
    for (const entry of likedItems) {
      if (entry.type === 'blog') {
        const blog = blogMap.get(entry.id);
        if (!blog) continue;
        items.push({
          kind: 'blog',
          id: blog.id,
          title: blog.titleEn,
          category: blog.category,
          preview: blog.subtitle || stripMarkdownPreview(blog.content),
          image: resolveAssetUrl(blog.bannerImage),
          metaDate: blog.date,
          likedAt: entry.likedAt,
          likesCount: blog.likes,
          blog
        });
      } else {
        const tip = tipMap.get(entry.id);
        if (!tip) continue;
        items.push({
          kind: 'tip',
          id: tip.id,
          title: tip.title,
          category: tip.category,
          preview: stripMarkdownPreview(tip.content),
          image: resolveAssetUrl(tip.image),
          metaDate: tip.date,
          likedAt: entry.likedAt,
          likesCount: tip.likes,
          tip
        });
      }
    }
    return items;
  }, [blogs, likedItems, tips]);

  const readingActivity = useMemo(() => {
    const publishedBlogIds = new Set(blogs.filter((b) => b.status === 'published').map((b) => b.id));
    const publishedTipIds = new Set(tips.filter((t) => t.status === 'published').map((t) => t.id));

    const blogsViewedSet = new Set<string>();
    const tipsViewedSet = new Set<string>();
    for (const entry of viewedItems) {
      if (entry.type === 'blog' && publishedBlogIds.has(entry.id)) {
        blogsViewedSet.add(entry.id);
      } else if (entry.type === 'tip' && publishedTipIds.has(entry.id)) {
        tipsViewedSet.add(entry.id);
      }
    }

    const blogsLikedSet = new Set<string>();
    const tipsLikedSet = new Set<string>();
    for (const entry of likedItems) {
      if (entry.type === 'blog' && publishedBlogIds.has(entry.id)) {
        blogsLikedSet.add(entry.id);
      } else if (entry.type === 'tip' && publishedTipIds.has(entry.id)) {
        tipsLikedSet.add(entry.id);
      }
    }

    const blogsEngagedSet = new Set([...blogsViewedSet, ...blogsLikedSet]);
    const tipsEngagedSet = new Set([...tipsViewedSet, ...tipsLikedSet]);

    return {
      totalPublishedBlogs: publishedBlogIds.size,
      totalPublishedTips: publishedTipIds.size,
      blogsViewed: blogsViewedSet.size,
      blogsLiked: blogsLikedSet.size,
      blogsEngaged: blogsEngagedSet.size,
      tipsViewed: tipsViewedSet.size,
      tipsLiked: tipsLikedSet.size,
      tipsEngaged: tipsEngagedSet.size,
      totalViewedOrLiked: blogsEngagedSet.size + tipsEngagedSet.size
    };
  }, [blogs, likedItems, tips, viewedItems]);

  const memberDisplayName = subscription.memberName?.trim() || 'VIP Patron';
  const joinDateDisplay = subscription.memberSince?.trim() || 'Active Session';
  const expiresDisplay = subscription.expiresAt?.trim() || 'Auto-renewing';

  const renderTierCrest = (compact = false) => {
    if (isBlackDiamond) {
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg border border-[#e7c792]/55 bg-gradient-to-r from-[#1c1528] via-[#2b203d] to-[#161020] text-[#f5dfb3] font-semibold tracking-wide shadow-sm whitespace-nowrap shrink-0 ${
            compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
          }`}
          aria-label="Black Diamond VIP Tier"
        >
          <Gem className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-[#f2d08c] shrink-0`} />
          <span>Black Diamond</span>
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg border border-[#e5b36b]/45 bg-gradient-to-r from-[#e5b36b]/20 via-[#c99757]/12 to-transparent text-[#f3d6a2] font-semibold tracking-wide whitespace-nowrap shrink-0 ${
          compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
        }`}
        aria-label="VIP Member Tier"
      >
        <Crown className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-[#e5b36b] shrink-0`} />
        <span>VIP</span>
      </span>
    );
  };

  if (!isVipMember) {
    return (
      <section className="py-20 bg-[#09080b] text-[#f4efe8] min-h-[75vh]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-[#130e1c] p-8 md:p-12 space-y-6">
            <div className="flex items-center gap-3 text-xs text-[#e5b36b]">
              <User className="w-4 h-4 shrink-0" />
              <span>Member Account</span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-400">VIP Sign-In Required</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-serif-display font-bold text-white [text-wrap:balance]">
                Your Private Member Profile
              </h1>
              <p className="text-sm md:text-base text-stone-300 leading-relaxed max-w-2xl">
                This profile view is reserved for logged-in VIP Inner Circle and Black Diamond members. Join or activate your VIP pass to view your subscription status, membership join date, and saved recently liked stories.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onOpenVIPModal}
                className="px-6 py-3 rounded-xl gorgeous-btn-gradient text-stone-950 font-semibold text-xs inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <Crown className="w-4 h-4" />
                <span>Activate VIP Membership</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('blog')}
                className="px-5 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-stone-200 text-xs font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Browse Journal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-[#09080b] text-[#f4efe8] min-h-[75vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Profile Header & Membership Summary */}
        <div
          className={`rounded-2xl border bg-[#130e1c] p-6 sm:p-8 md:p-10 space-y-8 ${
            isBlackDiamond ? 'border-[#e7c792]/30' : 'border-white/10'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400">
                <span className="text-[#e5b36b] font-medium">My Profile</span>
                <span aria-hidden="true">·</span>
                <span>{isBlackDiamond ? 'All-Inclusive Patron' : 'Inner Circle Patron'}</span>
                {subscription.memberEmail && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-stone-300">{subscription.memberEmail}</span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3.5">
                <h1 className="text-3xl md:text-4xl font-serif-display font-bold text-white [text-wrap:balance]">
                  {memberDisplayName}
                </h1>
                {renderTierCrest(false)}
              </div>

              <p className="text-sm text-stone-300 max-w-2xl leading-relaxed">
                {isBlackDiamond
                  ? 'Full Black Diamond privileges active—including the uncensored 4K Vault, private audio drops, and your saved reading list.'
                  : 'Manage your active Inner Circle privileges, verify your join date, and revisit the journal stories and masterclass tips you recently liked.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onOpenVIPModal}
                className="px-4 py-2.5 rounded-xl border border-[#e5b36b]/40 bg-[#e5b36b]/10 hover:bg-[#e5b36b]/20 text-[#f3d6a2] text-xs font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                {isBlackDiamond ? (
                  <Gem className="w-3.5 h-3.5 text-[#f2d08c]" />
                ) : (
                  <Crown className="w-3.5 h-3.5 text-[#e5b36b]" />
                )}
                <span>Manage Tier</span>
              </button>
              <button
                type="button"
                onClick={onSignOut}
                className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/10 text-stone-300 hover:text-white text-xs font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Key Membership Details separated by hairline dividers */}
          <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="text-xs text-stone-400 block">Subscription Status</span>
              <div className="flex flex-wrap items-center gap-2.5 text-base font-semibold text-white">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${isStatusActive ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <span>{isStatusActive ? 'Active' : 'Inactive'}</span>
                </span>
                {renderTierCrest(true)}
              </div>
              <p className="text-xs text-stone-400 tabular-nums">
                Valid through {expiresDisplay}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs text-stone-400 block">Membership Join Date</span>
              <div className="flex items-center gap-2 text-base font-semibold text-white tabular-nums">
                <Calendar className="w-4 h-4 text-[#e5b36b] shrink-0" />
                <span>{joinDateDisplay}</span>
              </div>
              <p className="text-xs text-stone-400">
                {isBlackDiamond ? 'Verified Black Diamond Pass' : 'Verified Inner Circle Pass'}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs text-stone-400 block">Recently Liked Content</span>
              <div className="flex items-center gap-2 text-base font-semibold text-white tabular-nums">
                <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  {resolvedLikedContent.length} {resolvedLikedContent.length === 1 ? 'Saved Item' : 'Saved Items'}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Journal stories &amp; masterclass tips
              </p>
            </div>
          </div>
        </div>

        {/* Reading Activity Summary */}
        <section aria-labelledby="reading-activity-heading" className="rounded-2xl border border-white/10 bg-[#130e1c] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#e5b36b] font-medium">
                <Eye className="w-3.5 h-3.5 shrink-0" />
                <span>Reading Activity</span>
              </div>
              <h2 id="reading-activity-heading" className="text-2xl font-serif-display font-semibold text-white">
                Member Reading &amp; Engagement Summary
              </h2>
              <p className="text-xs sm:text-sm text-stone-400">
                Summary of Journal stories and Masterclass tips you have viewed or liked during your membership.
              </p>
            </div>

            <div className="text-xs text-stone-300 tabular-nums shrink-0">
              <span className="font-semibold text-white">{readingActivity.totalViewedOrLiked}</span> total items engaged
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Journal Posts Summary */}
            <div className="space-y-3 pb-4 md:pb-0 md:pr-6 border-b md:border-b-0 md:border-r border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <BookOpen className="w-4 h-4 text-[#e5b36b] shrink-0" />
                  <span>Journal Blog Posts</span>
                </div>
                <span className="text-xs text-stone-400 tabular-nums">
                  {readingActivity.blogsEngaged} / {readingActivity.totalPublishedBlogs} engaged
                </span>
              </div>

              <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#b07f43] to-[#e7c792] rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      readingActivity.totalPublishedBlogs > 0
                        ? Math.min(100, Math.round((readingActivity.blogsEngaged / readingActivity.totalPublishedBlogs) * 100))
                        : 0
                    }%`
                  }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400 tabular-nums">
                <span>
                  <strong className="text-stone-200 font-medium">{readingActivity.blogsViewed}</strong> viewed
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <strong className="text-stone-200 font-medium">{readingActivity.blogsLiked}</strong> liked
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('blog')}
                  className="text-[#e5b36b] hover:text-[#f3d6a2] font-medium inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <span>Browse Journal</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Masterclass Tips Summary */}
            <div className="space-y-3 md:pl-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Sparkles className="w-4 h-4 text-[#e5b36b] shrink-0" />
                  <span>Masterclass Tips</span>
                </div>
                <span className="text-xs text-stone-400 tabular-nums">
                  {readingActivity.tipsEngaged} / {readingActivity.totalPublishedTips} engaged
                </span>
              </div>

              <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#b07f43] to-[#e7c792] rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      readingActivity.totalPublishedTips > 0
                        ? Math.min(100, Math.round((readingActivity.tipsEngaged / readingActivity.totalPublishedTips) * 100))
                        : 0
                    }%`
                  }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400 tabular-nums">
                <span>
                  <strong className="text-stone-200 font-medium">{readingActivity.tipsViewed}</strong> viewed
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <strong className="text-stone-200 font-medium">{readingActivity.tipsLiked}</strong> liked
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('tips')}
                  className="text-[#e5b36b] hover:text-[#f3d6a2] font-medium inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <span>Browse Tips</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Recently Liked Content List */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-serif-display font-semibold text-white">
                Recently Liked Content
              </h2>
              <p className="text-xs sm:text-sm text-stone-400">
                Articles and tips you liked are listed below in reverse chronological order.
              </p>
            </div>

            {resolvedLikedContent.length > 0 && (
              <button
                type="button"
                onClick={onClearLikedItems}
                className="text-xs text-stone-400 hover:text-stone-200 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {resolvedLikedContent.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#130e1c] p-8 sm:p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mx-auto text-[#e5b36b]">
                <Heart className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-serif-display font-semibold text-white">
                  No Liked Content Yet
                </h3>
                <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                  Tap the heart icon on any Journal post or Masterclass tip to save it here for quick reading later.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('blog')}
                  className="px-4 py-2 rounded-xl bg-[#e5b36b] hover:bg-[#edd199] text-stone-950 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Explore Journal</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('tips')}
                  className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-stone-200 font-medium text-xs inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#e5b36b]" />
                  <span>Explore Tips</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#130e1c] divide-y divide-white/10 overflow-hidden">
              {resolvedLikedContent.map((item) => {
                const showFallback = !item.image || failedImages[item.id];
                const handleOpen = () => {
                  if (item.kind === 'blog') {
                    onOpenBlog(item.blog);
                  } else {
                    onOpenTip(item.tip);
                  }
                };

                return (
                  <article
                    key={`${item.kind}-${item.id}`}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <button
                      type="button"
                      onClick={handleOpen}
                      className="flex flex-1 items-start sm:items-center gap-4 text-left min-w-0 group"
                    >
                      <div className="w-20 h-16 sm:w-24 sm:h-16 rounded-xl overflow-hidden border border-white/10 bg-[#1b1426] shrink-0">
                        {showFallback ? (
                          <div className="w-full h-full bg-gradient-to-br from-[#231932] to-[#120d1a] flex items-center justify-center text-[#e5b36b]">
                            {item.kind === 'blog' ? (
                              <BookOpen className="w-5 h-5" />
                            ) : (
                              <Sparkles className="w-5 h-5" />
                            )}
                          </div>
                        ) : (
                          <img
                            src={item.image}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedImages((prev) => ({
                                ...prev,
                                [item.id]: true
                              }))
                            }
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400">
                          <span className="text-[#e5b36b] font-medium">
                            {item.kind === 'blog' ? 'Journal Story' : 'Masterclass Tip'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{item.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">Liked {item.likedAt}</span>
                        </div>

                        <h3 className="text-base sm:text-lg font-serif-display font-semibold text-white group-hover:text-[#f3d6a2] transition-colors truncate">
                          {item.title}
                        </h3>

                        <p className="text-xs text-stone-400 line-clamp-1">
                          {item.preview}
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0">
                      <span className="text-xs text-stone-400 inline-flex items-center gap-1 tabular-nums">
                        <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
                        <span>{item.likesCount}</span>
                      </span>

                      <button
                        type="button"
                        onClick={handleOpen}
                        className="px-3.5 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-stone-100 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveLikedItem(item.id)}
                        className="p-2 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-white/5 transition-colors shrink-0"
                        aria-label={`Remove ${item.title} from recently liked`}
                        title="Remove from history"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
