import React from 'react';
import { ArrowRight, Crown, Sparkles, Lock, Upload, Image as ImageIcon } from 'lucide-react';
import { UserSubscription, FrontEditableTexts, SiteSettings } from '../types';
import { ISABELLA_AVATAR_IMG, ISABELLA_HERO_IMG, resolveAssetUrl } from '../defaultStore';
import { compressImageFileToDataUrl } from '../utils/imageUpload';

interface HeroProps {
  subscription: UserSubscription;
  frontTexts: FrontEditableTexts;
  settings: SiteSettings;
  isLiveEditorActive: boolean;
  onUpdateFrontText: (field: keyof FrontEditableTexts, value: string) => void;
  onUpdateSettingsImage?: (field: keyof SiteSettings, url: string) => void;
  onOpenVIPModal: () => void;
  onScrollToBlog: () => void;
  onScrollToVault: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  subscription,
  frontTexts,
  settings,
  isLiveEditorActive,
  onUpdateFrontText,
  onUpdateSettingsImage,
  onOpenVIPModal,
  onScrollToBlog,
  onScrollToVault
}) => {
  const formattedMonthlyPrice =
    settings.vipMonthlyPrice < 10
      ? `0${settings.vipMonthlyPrice.toFixed(2)}`
      : settings.vipMonthlyPrice.toFixed(2);

  const handleFileUpload = (field: keyof SiteSettings, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateSettingsImage) return;
    compressImageFileToDataUrl(file, (dataUrl) => {
      onUpdateSettingsImage(field, dataUrl);
    });
  };

  return (
    <section className="relative min-h-[92vh] flex items-center pt-24 pb-16 bg-gradient-to-br from-[#0b0712] via-[#170c22] to-[#0b070f] overflow-hidden">
      {/* Gorgeous vibrant ambient lighting */}
      <div className="absolute -top-20 right-1/4 w-[520px] h-[520px] bg-[#b84b6e]/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[560px] h-[560px] bg-[#e5b36b]/14 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[380px] h-[380px] bg-[#6d28d9]/12 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Kicker */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e1229]/90 border border-[#e5b36b]/35 text-xs text-[#f6e2bb] shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-[#e5b36b]" />
              {isLiveEditorActive ? (
                <input
                  type="text"
                  value={frontTexts.heroKicker}
                  onChange={(e) => onUpdateFrontText('heroKicker', e.target.value)}
                  className="bg-black/60 border border-amber-400 rounded px-2 py-0.5 text-xs text-amber-200 focus:outline-none"
                />
              ) : (
                <span className="font-medium tracking-wide">{frontTexts.heroKicker}</span>
              )}
            </div>

            {/* Headline */}
            {isLiveEditorActive ? (
              <textarea
                rows={2}
                value={frontTexts.heroHeadline}
                onChange={(e) => onUpdateFrontText('heroHeadline', e.target.value)}
                className="w-full text-3xl sm:text-5xl font-serif-display font-bold text-white bg-black/60 border border-amber-400 rounded-lg p-2 focus:outline-none"
              />
            ) : (
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif-display font-bold text-white tracking-tight leading-[1.08] text-balance">
                {frontTexts.heroHeadline.includes('&') ? (
                  <>
                    {frontTexts.heroHeadline.split('&')[0]} &{' '}
                    <span className="rose-gold-gradient">
                      {frontTexts.heroHeadline.split('&').slice(1).join('&')}
                    </span>
                  </>
                ) : (
                  <span className="gold-gradient-text">{frontTexts.heroHeadline}</span>
                )}
              </h1>
            )}

            {/* Paragraph */}
            {isLiveEditorActive ? (
              <textarea
                rows={3}
                value={frontTexts.heroParagraph}
                onChange={(e) => onUpdateFrontText('heroParagraph', e.target.value)}
                className="w-full text-sm text-stone-200 bg-black/60 border border-amber-400 rounded-lg p-2 focus:outline-none"
              />
            ) : (
              <p className="text-base sm:text-lg text-stone-200/90 max-w-xl font-normal leading-relaxed">
                {frontTexts.heroParagraph}
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenVIPModal}
                className="px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider gorgeous-btn-gradient text-stone-950 flex items-center gap-2 hover:opacity-95 transition-all shadow-xl shadow-[#b84b6e]/25"
              >
                <Crown className="w-4 h-4" />
                {subscription.tier !== 'Free'
                  ? 'VIP Vault Unlocked'
                  : `Join VIP Inner Circle (${settings.currencySymbol}${formattedMonthlyPrice}/mo)`}
              </button>

              <button
                onClick={onScrollToBlog}
                className="px-6 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-stone-200 hover:text-white bg-[#1a1124]/90 hover:bg-[#241633] border border-[#e5b36b]/25 transition-colors flex items-center gap-2"
              >
                Explore Public Journal
                <ArrowRight className="w-4 h-4 text-[#e5b36b]" />
              </button>
            </div>

            {/* Trust points */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-8 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <span className="gold-gradient-text font-serif-display font-bold text-lg tabular-nums">1.2M+</span>
                <span>Global Followers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rose-gold-gradient font-serif-display font-bold text-lg tabular-nums">5+ Daily</span>
                <span>Auto SEO Stories</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#e5b36b] font-serif-display font-bold text-lg tabular-nums">4K UHD</span>
                <span>Private Boudoir Stills</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero High-Fidelity Portrait */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden border border-[#e5b36b]/40 shadow-2xl gorgeous-card-glow bg-[#160e21] group">
              <img
                src={resolveAssetUrl(settings.heroBgImage, ISABELLA_HERO_IMG)}
                alt="Isabella Rose in penthouse emerald evening gown"
                className="w-full h-auto object-cover transform group-hover:scale-102 transition-transform duration-700 aspect-4/5"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              {isLiveEditorActive && onUpdateSettingsImage && (
                <div className="absolute top-4 left-4 right-4 p-3 rounded-xl bg-black/85 border border-amber-400/60 space-y-2 z-20">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-amber-300">
                    <span className="flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> Hero Image</span>
                    <label className="px-2.5 py-1 rounded bg-amber-500 text-black font-bold cursor-pointer flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Upload
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload('heroBgImage', e)} className="hidden" />
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Paste Hero Image URL..."
                    value={settings.heroBgImage || ''}
                    onChange={(e) => onUpdateSettingsImage('heroBgImage', e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-[11px] text-white font-mono"
                  />
                </div>
              )}

              {/* Floating overlay badge */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl luxury-glass">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={resolveAssetUrl(settings.avatarImage, ISABELLA_AVATAR_IMG)}
                        alt="Isabella avatar"
                        className="w-10 h-10 rounded-full object-cover border border-[#e5b36b]"
                      />
                      {isLiveEditorActive && onUpdateSettingsImage && (
                        <label className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center cursor-pointer" title="Change Avatar">
                          <Upload className="w-2.5 h-2.5" />
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload('avatarImage', e)} className="hidden" />
                        </label>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {settings.siteNameEn.split('—')[0]}
                      </h4>
                      {isLiveEditorActive ? (
                        <input
                          type="text"
                          value={frontTexts.heroBadgeText}
                          onChange={(e) => onUpdateFrontText('heroBadgeText', e.target.value)}
                          className="bg-black/70 border border-amber-400 rounded px-1.5 py-0.5 text-[11px] text-amber-200 w-full"
                        />
                      ) : (
                        <p className="text-[11px] text-[#e5b36b] truncate">{frontTexts.heroBadgeText}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={onScrollToVault}
                    className="p-2.5 rounded-xl gorgeous-btn-gradient text-stone-950 hover:opacity-90 transition-opacity shrink-0"
                    title="View Exclusive Vault"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
