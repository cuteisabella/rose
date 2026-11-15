import React from 'react';
import { Crown, Sparkles, LogOut, ArrowRight, X, User } from 'lucide-react';
import { UserSubscription } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  vipMonthlyPrice?: number;
  blackDiamondPrice?: number;
  onUpgrade: (tier: 'VIP Member' | 'Black Diamond VIP') => void;
  onSignOut: () => void;
  onOpenProfile?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  subscription,
  vipMonthlyPrice = 5.99,
  blackDiamondPrice = 14.99,
  onUpgrade,
  onSignOut,
  onOpenProfile
}) => {
  if (!isOpen) return null;

  const formattedMonthly = vipMonthlyPrice < 10 ? `0${vipMonthlyPrice.toFixed(2)}` : vipMonthlyPrice.toFixed(2);
  const formattedQuarterly = blackDiamondPrice.toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#121017] border border-[#c99757]/30 rounded-2xl p-6 md:p-8 shadow-2xl text-left">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-white p-2 rounded-full hover:bg-stone-800/60 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[#c99757]/10 rounded-lg border border-[#c99757]/20">
            <Crown className="w-6 h-6 text-[#c99757]" />
          </div>
          <div>
            <h3 className="text-2xl font-serif-display font-semibold text-white">
              Isabella’s VIP Inner Circle
            </h3>
            <p className="text-xs text-stone-400">
              Current Membership: <span className="font-semibold text-[#e7c792]">{subscription.tier}</span> ({subscription.status.toUpperCase()})
            </p>
          </div>
        </div>

        <p className="text-sm text-stone-300 mt-3 mb-6 leading-relaxed">
          Unlock uncompressed 4K boudoir galleries, private behind-the-scenes clips, uncensored late-night audio logs, and direct VIP direct messaging access.
        </p>

        {subscription.tier !== 'Free' ? (
          <div className="bg-[#1b1722] border border-[#c99757]/30 rounded-xl p-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs tracking-wider text-[#c99757] font-medium">Active VIP Privilege</span>
                <h4 className="text-lg font-semibold text-white mt-1">Full Vault Unlocked</h4>
                <p className="text-xs text-stone-400 mt-1">
                  You have full unlimited access to all adult private posts, 4K video reels, and confidential diaries.
                  {subscription.memberSince ? ` Member since ${subscription.memberSince}.` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {onOpenProfile && (
                  <button
                    type="button"
                    onClick={onOpenProfile}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-950 bg-[#e7c792] hover:bg-[#f0d6a8] rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <User className="w-3.5 h-3.5" />
                    My Profile
                  </button>
                )}
                <button
                  type="button"
                  onClick={onSignOut}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-400 hover:text-red-400 bg-stone-900/60 hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Plan 1 */}
          <div className={`p-5 rounded-xl border transition-all ${subscription.tier === 'VIP Member' ? 'bg-[#c99757]/10 border-[#c99757]' : 'bg-[#181520] border-stone-800 hover:border-stone-700'}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Monthly Pass</span>
              <span className="text-xl font-bold text-white">${formattedMonthly}<span className="text-xs font-normal text-stone-400">/mo</span></span>
            </div>
            <h4 className="text-base font-semibold text-white mb-2">VIP Member Access</h4>
            <ul className="text-xs text-stone-300 space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#c99757] shrink-0" />
                <span>Full access to adult VIP private blog posts & tips</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#c99757] shrink-0" />
                <span>Private high-res boudoir image archive & galleries</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#c99757] shrink-0" />
                <span>Weekly streaming video updates</span>
              </li>
            </ul>
            <button
              onClick={() => onUpgrade('VIP Member')}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-[#c99757] hover:bg-[#d6a567] text-stone-950 transition-colors flex items-center justify-center gap-1.5"
            >
              {subscription.tier === 'VIP Member' ? 'Current Active Tier' : `Upgrade to VIP ($${formattedMonthly})`}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Plan 2 */}
          <div className={`p-5 rounded-xl border relative overflow-hidden transition-all ${subscription.tier === 'Black Diamond VIP' ? 'bg-[#c99757]/15 border-[#c99757]' : 'bg-gradient-to-b from-[#221b2a] to-[#16131c] border-[#c99757]/40 hover:border-[#c99757]'}`}>
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#c99757] text-[#0d0b10] text-[10px] font-bold rounded uppercase tracking-wider">
              Best Value
            </div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-[#c99757] uppercase tracking-wider">All-Inclusive Pass</span>
              <span className="text-xl font-bold text-white">${formattedQuarterly}<span className="text-xs font-normal text-stone-400">/3mo</span></span>
            </div>
            <h4 className="text-base font-semibold text-white mb-2">Black Diamond VIP</h4>
            <ul className="text-xs text-stone-300 space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#c99757] shrink-0" />
                <span>Everything in VIP + Uncensored 4K Video Vault</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#c99757] shrink-0" />
                <span>Private 1-on-1 direct message audio drops</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#c99757] shrink-0" />
                <span>Custom requested personal shoots access</span>
              </li>
            </ul>
            <button
              onClick={() => onUpgrade('Black Diamond VIP')}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#e7c792] via-[#c99757] to-[#b07f43] hover:opacity-95 text-stone-950 transition-opacity flex items-center justify-center gap-1.5 shadow-md"
            >
              {subscription.tier === 'Black Diamond VIP' ? 'Current Active Tier' : `Get Black Diamond Access ($${formattedQuarterly})`}
              <Crown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-800/80 pt-4">
          <span>Discreet 256-bit SSL billing · Billed securely</span>
          <button onClick={onClose} className="hover:text-stone-200 underline">
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};
