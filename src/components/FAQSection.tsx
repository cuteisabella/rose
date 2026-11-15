import React, { useState } from 'react';
import { ChevronDown, Crown, HelpCircle } from 'lucide-react';
import { UserSubscription } from '../types';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQSectionProps {
  subscription: UserSubscription;
  vipMonthlyPrice?: number;
  blackDiamondPrice?: number;
  onOpenVIPModal?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  subscription,
  vipMonthlyPrice = 5.99,
  blackDiamondPrice = 14.99,
  onOpenVIPModal
}) => {
  const [openId, setOpenId] = useState<string>('tiers');

  const formattedMonthly = vipMonthlyPrice < 10 ? `0${vipMonthlyPrice.toFixed(2)}` : vipMonthlyPrice.toFixed(2);
  const formattedQuarterly = blackDiamondPrice.toFixed(2);
  const isVip = subscription.tier !== 'Free';

  const faqs: FAQItem[] = [
    {
      id: 'tiers',
      question: 'What is the difference between VIP Inner Circle and Black Diamond VIP?',
      answer: `VIP Inner Circle ($${formattedMonthly}/mo) unlocks all 18+ private journal stories, complete boudoir photo galleries, weekly video updates, and article commenting. Black Diamond VIP ($${formattedQuarterly}/3mo) includes everything in VIP Inner Circle plus uncompressed 4K master video reels, private audio diary drops, priority concierge routing, and custom shoot polls.`
    },
    {
      id: 'billing',
      question: 'How do membership charges appear on my billing statement?',
      answer:
        'All PayPal, card, and Stripe transactions are processed through encrypted SSL checkout and appear discreetly under "IR-Studio Digital" with no explicit titles or imagery referenced on bank statements.'
    },
    {
      id: 'cancellation',
      question: 'Can I switch tiers, pause, or cancel my VIP membership at any time?',
      answer:
        'Yes. You can upgrade from VIP Inner Circle to Black Diamond VIP at any moment from the Manage Tier button in My Profile or the VIP Access modal, and you can sign out or cancel future renewals without lock-in fees.'
    },
    {
      id: 'devices',
      question: 'Can I view 4K vault galleries and long-form guides across multiple devices?',
      answer:
        'Yes. Your membership unlocks all private stories, HD/4K reels, and multi-photo galleries across desktop, tablet, and mobile browsers cleanly with responsive layouts.'
    },
    {
      id: 'share-vs-vip',
      question: 'How does Share-to-Unlock compare with an active VIP membership?',
      answer:
        'Share-to-Unlock lets free visitors unlock selected individual previews by sharing a link on social media. Active VIP members bypass every share gate and lock screen automatically across the entire site.'
    },
    {
      id: 'profile',
      question: 'Where can I check my subscription status, join date, and liked articles?',
      answer:
        'Logged-in VIP members can open My Profile from the VIP Active modal, the mobile drawer, or the footer navigation to inspect their tier crest, join date, reading activity summary, and recently liked content.'
    }
  ];

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? '' : id));
  };

  return (
    <section aria-labelledby="vip-faq-heading" className="pt-4">
      <div className="rounded-2xl border border-white/10 bg-[#130e1c] p-6 sm:p-8 md:p-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#e5b36b] font-medium">
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Membership FAQ</span>
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
              Clear answers regarding tier privileges, discreet billing, device access, and managing your Inner Circle membership.
            </p>
          </div>

          {onOpenVIPModal && (
            <button
              type="button"
              onClick={onOpenVIPModal}
              className="px-4 py-2.5 rounded-xl border border-[#e5b36b]/40 bg-[#e5b36b]/10 hover:bg-[#e5b36b]/20 text-[#f3d6a2] text-xs font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 self-start md:self-auto"
            >
              <Crown className="w-3.5 h-3.5 text-[#e5b36b]" />
              <span>{isVip ? 'Manage Membership' : 'View VIP Passes'}</span>
            </button>
          )}
        </div>

        <div className="divide-y divide-white/10">
          {faqs.map((item) => {
            const isExpanded = openId === item.id;
            return (
              <div key={item.id} className="py-4 first:pt-1 last:pb-1">
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`faq-panel-${item.id}`}
                  className="w-full flex items-center justify-between gap-4 text-left py-1 group"
                >
                  <span
                    className={`text-sm sm:text-base font-medium transition-colors ${
                      isExpanded ? 'text-[#f3d6a2]' : 'text-white group-hover:text-[#e5b36b]'
                    }`}
                  >
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-stone-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-[#e5b36b]' : 'group-hover:text-stone-200'
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div id={`faq-panel-${item.id}`} className="pt-2.5 pr-8 text-xs sm:text-sm text-stone-300 leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
