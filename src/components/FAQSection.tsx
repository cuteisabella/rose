import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  Crown,
  HelpCircle,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { UserSubscription } from '../types';

export type FAQCategory = 'all' | 'vip' | 'blog' | 'concierge';

interface FAQItem {
  id: string;
  category: Exclude<FAQCategory, 'all'>;
  categoryLabel: string;
  question: string;
  answer: string;
  ctaLabel?: string;
  ctaTarget?: 'vip-modal' | 'blog' | 'contact' | 'profile';
}

interface FAQSectionProps {
  subscription: UserSubscription;
  vipMonthlyPrice?: number;
  blackDiamondPrice?: number;
  defaultCategory?: FAQCategory;
  onOpenVIPModal?: () => void;
  onNavigate?: (target: string) => void;
}

const CATEGORY_META: Array<{
  id: FAQCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'all', label: 'All Topics', icon: Sparkles },
  { id: 'vip', label: 'VIP Membership', icon: Crown },
  { id: 'blog', label: 'Blog Content', icon: BookOpen },
  { id: 'concierge', label: 'Concierge Services', icon: MessageSquare }
];

export const FAQSection: React.FC<FAQSectionProps> = ({
  subscription,
  vipMonthlyPrice = 5.99,
  blackDiamondPrice = 14.99,
  defaultCategory = 'all',
  onOpenVIPModal,
  onNavigate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory>(defaultCategory);
  const [openIds, setOpenIds] = useState<string[]>(['tiers']);

  useEffect(() => {
    setSelectedCategory(defaultCategory);
    if (defaultCategory === 'blog') {
      setOpenIds(['blog-access']);
    } else if (defaultCategory === 'concierge') {
      setOpenIds(['concierge-sla']);
    } else {
      setOpenIds(['tiers']);
    }
  }, [defaultCategory]);

  const formattedMonthly = vipMonthlyPrice < 10 ? `0${vipMonthlyPrice.toFixed(2)}` : vipMonthlyPrice.toFixed(2);
  const formattedQuarterly = blackDiamondPrice.toFixed(2);
  const isVip = subscription.tier !== 'Free';

  const faqs: FAQItem[] = useMemo(
    () => [
      // VIP MEMBERSHIP
      {
        id: 'tiers',
        category: 'vip',
        categoryLabel: 'VIP Membership',
        question: 'What is the difference between VIP Inner Circle and Black Diamond VIP?',
        answer: `VIP Inner Circle ($${formattedMonthly}/mo) unlocks all 18+ private journal stories, complete boudoir photo galleries, weekly video updates, and article commenting. Black Diamond VIP ($${formattedQuarterly}/3mo) includes everything in VIP Inner Circle plus uncompressed 4K master video reels, private audio diary drops, priority concierge routing, and custom shoot polls.`,
        ctaLabel: isVip ? 'Manage Membership' : 'Compare VIP Tiers',
        ctaTarget: 'vip-modal'
      },
      {
        id: 'billing',
        category: 'vip',
        categoryLabel: 'VIP Membership',
        question: 'How do membership charges appear on my billing statement?',
        answer:
          'All PayPal, credit/debit card, Stripe, and USDT Crypto transactions are processed through encrypted SSL checkout and appear discreetly under "IR-Studio Digital" with no explicit titles or imagery referenced on bank statements.'
      },
      {
        id: 'cancellation',
        category: 'vip',
        categoryLabel: 'VIP Membership',
        question: 'Can I switch tiers, pause, or cancel my VIP membership at any time?',
        answer:
          'Yes. You can upgrade from VIP Inner Circle to Black Diamond VIP at any moment from Manage Tier in My Profile or the VIP Access modal, and you may sign out or cancel future renewals without lock-in fees.'
      },
      {
        id: 'share-vs-vip',
        category: 'vip',
        categoryLabel: 'VIP Membership',
        question: 'How does Share-to-Unlock compare with an active VIP membership?',
        answer:
          'Share-to-Unlock lets free visitors unlock selected individual previews by sharing a link on social media. Active VIP members bypass every share gate and lock screen automatically across all stories, galleries, and video drops.'
      },

      // BLOG CONTENT
      {
        id: 'blog-access',
        category: 'blog',
        categoryLabel: 'Blog Content',
        question: 'Which Journal stories and Masterclass guides are public versus VIP-only?',
        answer:
          'Public readers can browse Isabella’s fashion lookbooks, culinary diaries, travel photography, and skincare rituals at no cost. Intimate late-night confessions, 18+ boudoir essays, and full multi-photo studio series are reserved for VIP Inner Circle and Black Diamond patrons (with select previews accessible via Share-to-Unlock).',
        ctaLabel: 'Browse Journal',
        ctaTarget: 'blog'
      },
      {
        id: 'blog-comments',
        category: 'blog',
        categoryLabel: 'Blog Content',
        question: 'How do reader comments and editorial moderation work on blog posts?',
        answer:
          'Visitors and members can submit thoughtful comments directly beneath any published story. New submissions enter Isabella’s private moderation queue and appear publicly once approved by the studio team to keep discussions warm, respectful, and spam-free.'
      },
      {
        id: 'blog-history',
        category: 'blog',
        categoryLabel: 'Blog Content',
        question: 'Can I revisit stories I previously read or liked across sessions?',
        answer:
          'Yes. Your reading history, recently viewed essays, and liked stories or tips are saved automatically and organized inside My Profile, where you can jump straight back into any favorite post with one click.',
        ctaLabel: 'Open My Profile',
        ctaTarget: 'profile'
      },
      {
        id: 'blog-devices',
        category: 'blog',
        categoryLabel: 'Blog Content',
        question: 'Are multi-photo galleries and video embeds inside articles mobile-friendly?',
        answer:
          'Every journal post, portrait series, and embedded studio reel adapts responsively across desktop, tablet, and mobile browsers with fast image loading and full-screen gallery inspection.'
      },

      // CONCIERGE SERVICES
      {
        id: 'concierge-sla',
        category: 'concierge',
        categoryLabel: 'Concierge Services',
        question: 'What happens after I submit an inquiry through Private Concierge?',
        answer:
          'All confidential messages sent through the Private Concierge desk are encrypted and reviewed personally by Isabella’s Milan and Paris management team within 12 hours.',
        ctaLabel: 'Open Private Concierge',
        ctaTarget: 'contact'
      },
      {
        id: 'concierge-brands',
        category: 'concierge',
        categoryLabel: 'Concierge Services',
        question: 'Does Private Concierge handle brand collaborations and press invitations?',
        answer:
          'Yes. Luxury fashion houses, beauty ateliers, hospitality venues, and editorial press teams can select "Brand Collaboration / Haute Couture" or "Private Event Invitation" on the concierge form for direct creative direction review.'
      },
      {
        id: 'concierge-priority',
        category: 'concierge',
        categoryLabel: 'Concierge Services',
        question: 'What custom privileges do Black Diamond VIP patrons receive from Concierge?',
        answer:
          'Black Diamond members receive priority concierge desk routing, eligibility to submit custom studio shoot theme requests, early previews of seasonal lookbooks, and dedicated billing or vault access assistance.'
      },
      {
        id: 'concierge-privacy',
        category: 'concierge',
        categoryLabel: 'Concierge Services',
        question: 'How are patron identity and private inquiry details protected?',
        answer:
          'Patron names, email addresses, and message contents submitted via Private Concierge remain strictly confidential between you and Isabella’s studio management desk and are never shared with third-party marketers or displayed publicly.'
      }
    ],
    [formattedMonthly, formattedQuarterly, isVip]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<FAQCategory, number> = {
      all: faqs.length,
      vip: 0,
      blog: 0,
      concierge: 0
    };
    faqs.forEach((item) => {
      counts[item.category] += 1;
    });
    return counts;
  }, [faqs]);

  const visibleFaqs = useMemo(
    () => (selectedCategory === 'all' ? faqs : faqs.filter((item) => item.category === selectedCategory)),
    [faqs, selectedCategory]
  );

  const allVisibleExpanded =
    visibleFaqs.length > 0 && visibleFaqs.every((item) => openIds.includes(item.id));

  const toggleItem = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleToggleAllVisible = () => {
    if (allVisibleExpanded) {
      const visibleSet = new Set(visibleFaqs.map((item) => item.id));
      setOpenIds((prev) => prev.filter((id) => !visibleSet.has(id)));
    } else {
      const merged = new Set(openIds);
      visibleFaqs.forEach((item) => merged.add(item.id));
      setOpenIds(Array.from(merged));
    }
  };

  const handleCtaAction = (target?: FAQItem['ctaTarget']) => {
    if (!target) return;
    if (target === 'vip-modal') {
      onOpenVIPModal?.();
      return;
    }
    onNavigate?.(target);
  };

  return (
    <section aria-labelledby="vip-faq-heading" className="pt-2">
      <div className="rounded-3xl border border-white/10 bg-[#130e1c]/95 p-6 sm:p-8 md:p-10 space-y-6">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#e5b36b] font-medium">
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Patron Knowledge Desk</span>
              {isVip && (
                <>
                  <span aria-hidden="true" className="text-stone-500">·</span>
                  <span className="text-stone-300">Active {subscription.tier}</span>
                </>
              )}
            </div>
            <h2 id="vip-faq-heading" className="text-2xl md:text-3xl font-serif-display font-bold text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl leading-relaxed">
              Toggle answers below for VIP membership tiers, journal &amp; blog content access, and private concierge services.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <button
              type="button"
              onClick={handleToggleAllVisible}
              className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0"
            >
              {allVisibleExpanded ? 'Collapse All' : 'Expand All'}
            </button>
            {onOpenVIPModal && (
              <button
                type="button"
                onClick={onOpenVIPModal}
                className="px-4 py-2 rounded-xl border border-[#e5b36b]/40 bg-[#e5b36b]/10 hover:bg-[#e5b36b]/20 text-[#f3d6a2] text-xs font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <Crown className="w-3.5 h-3.5 text-[#e5b36b]" />
                <span>{isVip ? 'Manage Membership' : 'View VIP Passes'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter FAQ by topic"
          className="flex flex-wrap items-center gap-2"
        >
          {CATEGORY_META.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  const firstMatch =
                    cat.id === 'all' ? faqs[0] : faqs.find((item) => item.category === cat.id);
                  if (firstMatch && !openIds.includes(firstMatch.id)) {
                    setOpenIds((prev) => [...prev, firstMatch.id]);
                  }
                }}
                className={`px-3.5 py-2 rounded-xl border text-xs font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-[#e5b36b]/60 bg-[#e5b36b]/15 text-[#f3d6a2]'
                    : 'border-white/10 bg-[#0d0914]/70 text-stone-300 hover:text-white hover:border-white/20'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#e5b36b]' : 'text-stone-400'}`} />
                <span>{cat.label}</span>
                <span className="text-[11px] text-stone-400 tabular-nums">({categoryCounts[cat.id]})</span>
              </button>
            );
          })}
        </div>

        {/* Accordion Questions */}
        <div className="divide-y divide-white/10">
          {visibleFaqs.map((item) => {
            const isExpanded = openIds.includes(item.id);
            const hasCta =
              item.ctaLabel &&
              ((item.ctaTarget === 'vip-modal' && Boolean(onOpenVIPModal)) ||
                (item.ctaTarget !== 'vip-modal' && Boolean(onNavigate)));

            return (
              <div key={item.id} className="py-4 first:pt-1 last:pb-1">
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`faq-panel-${item.id}`}
                  className="w-full flex items-start justify-between gap-4 text-left py-1 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5b36b]/60 rounded-lg"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                      {item.categoryLabel}
                    </div>
                    <div
                      className={`text-sm sm:text-base font-medium transition-colors ${
                        isExpanded ? 'text-[#f3d6a2]' : 'text-white group-hover:text-[#e5b36b]'
                      }`}
                    >
                      {item.question}
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 mt-1 text-stone-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-[#e5b36b]' : 'group-hover:text-stone-200'
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div
                    id={`faq-panel-${item.id}`}
                    className="pt-2.5 pr-4 sm:pr-8 space-y-3 text-xs sm:text-sm text-stone-300 leading-relaxed"
                  >
                    <p>{item.answer}</p>
                    {hasCta && (
                      <div>
                        <button
                          type="button"
                          onClick={() => handleCtaAction(item.ctaTarget)}
                          className="text-xs font-medium text-[#e5b36b] hover:text-[#f3d6a2] underline underline-offset-4 transition-colors whitespace-nowrap"
                        >
                          {item.ctaLabel} →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Concierge / Journal Quick Action Strip */}
        {(onNavigate || onOpenVIPModal) && (
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-stone-400">
              Need direct personal assistance or editorial help?
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('blog')}
                  className="px-3.5 py-2 rounded-xl border border-white/10 bg-[#0d0914]/80 hover:border-white/25 text-stone-200 hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  Explore Journal
                </button>
              )}
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="px-3.5 py-2 rounded-xl border border-[#e5b36b]/40 bg-[#e5b36b]/10 hover:bg-[#e5b36b]/20 text-[#f3d6a2] font-medium transition-colors whitespace-nowrap shrink-0"
                >
                  Ask Private Concierge
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
