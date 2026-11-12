import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  Crown, 
  Share2, 
  Heart, 
  Clock, 
  ArrowRight,
  X,
  Check,
  BookOpen,
  Image as ImageIcon,
  Upload,
  ChevronDown,
  ChevronUp,
  Maximize2
} from 'lucide-react';
import { FrontEditableTexts, SiteSettings, TipItem, UserSubscription } from '../types';
import {
  ISABELLA_FASHION_IMG,
  ISABELLA_HERO_IMG,
  ISABELLA_VIP_IMG,
  resolveAssetUrl,
  TIPS_FEATURE_RICH_ARTICLE
} from '../defaultStore';

interface TipsSectionProps {
  tips: TipItem[];
  subscription: UserSubscription;
  settings?: SiteSettings;
  frontTexts?: FrontEditableTexts;
  showFullFeaturePage?: boolean;
  isLiveEditorActive?: boolean;
  onUpdateFrontText?: (field: keyof FrontEditableTexts, value: string) => void;
  onUpdateSettingsImage?: (field: keyof SiteSettings, url: string) => void;
  onOpenVIPModal: () => void;
  onShareToUnlock: (tipId: string) => void;
  onLikeTip?: (tipId: string) => void;
  unlockedShareIds: string[];
}

function renderFormattedArticle(text: string) {
  return text.split('\n\n').map((block, idx) => {
    const trimmed = block.trim();
    if (trimmed.startsWith('## ')) {
      return (
        <h3
          key={idx}
          className="text-xl md:text-2xl font-serif-display font-bold text-[#f6e2bb] pt-3 pb-1"
        >
          {trimmed.replace(/^##\s+/, '')}
        </h3>
      );
    }
    if (trimmed.startsWith('### ')) {
      return (
        <h4
          key={idx}
          className="text-lg font-serif-display font-semibold text-white pt-2"
        >
          {trimmed.replace(/^###\s+/, '')}
        </h4>
      );
    }
    return (
      <p key={idx} className="leading-relaxed text-stone-200">
        {trimmed}
      </p>
    );
  });
}

export const TipsSection: React.FC<TipsSectionProps> = ({
  tips,
  subscription,
  settings,
  frontTexts,
  showFullFeaturePage = false,
  isLiveEditorActive = false,
  onUpdateFrontText,
  onUpdateSettingsImage,
  onOpenVIPModal,
  onShareToUnlock,
  onLikeTip,
  unlockedShareIds
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [selectedTip, setSelectedTip] = useState<TipItem | null>(null);
  const [copiedTip, setCopiedTip] = useState(false);
  const [isMonographExpanded, setIsMonographExpanded] = useState(false);
  const [isMonographModalOpen, setIsMonographModalOpen] = useState(false);

  const categories = [
    'All',
    'Feminine Confidence',
    'Fashion & Styling',
    'Dining & Wine',
    'Adult 18+ Intimacy',
    'Skincare & Glow'
  ];

  const filteredTips = tips.filter(tip => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Adult 18+ Intimacy') return tip.isAdult18;
    return tip.category === selectedFilter;
  });

  const activeTip = selectedTip ? tips.find(t => t.id === selectedTip.id) || selectedTip : null;
  const activeTipShareUnlocked = activeTip ? unlockedShareIds.includes(activeTip.id) : false;
  const isVipUnlocked = subscription.tier !== 'Free';
  const activeTipLocked = activeTip
    ? (activeTip.isPrivateVIP || Boolean(activeTip.isShareToUnlock)) && !isVipUnlocked && !activeTipShareUnlocked
    : false;

  const handleImageFileUpload = (field: keyof SiteSettings, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateSettingsImage) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateSettingsImage(field, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const featureHeadline =
    frontTexts?.tipsFeatureHeadline || 'Exclusive Feminine & Style Tips: The Complete Luxury Monograph';
  const featureArticle = frontTexts?.tipsFeatureArticle || TIPS_FEATURE_RICH_ARTICLE;

  const featureBlocks = featureArticle
    .split('\n\n')
    .map((b) => b.trim())
    .filter(Boolean);
  const firstFeatureHeading = featureBlocks.find((b) => b.startsWith('## '))?.replace(/^##\s+/, '') || '';
  const firstFeatureParagraph = featureBlocks.find((b) => !b.startsWith('#')) || featureBlocks[0] || '';
  const featureWordCount = featureArticle.trim().split(/\s+/).filter(Boolean).length;

  const img1 = resolveAssetUrl(settings?.tipsFeatureImage1, ISABELLA_FASHION_IMG);
  const img2 = resolveAssetUrl(settings?.tipsFeatureImage2, ISABELLA_HERO_IMG);
  const img3 = resolveAssetUrl(settings?.tipsFeatureImage3, ISABELLA_VIP_IMG);

  return (
    <section id="tips-section" className="py-20 border-t border-stone-800/80 bg-gradient-to-b from-[#0e0915] via-[#120b1c] to-[#09080b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 1,000-WORD RICH EDITORIAL FEATURE (Shown on Full Tips / Feminine & Style Tips Page) */}
        {showFullFeaturePage && (
          <div className="rounded-3xl border border-[#e5b36b]/30 bg-[#150e20]/90 p-6 md:p-10 space-y-8 gorgeous-card-glow">
            <div className="max-w-3xl space-y-3">
              <div className="flex items-center gap-2 text-xs text-[#e5b36b] uppercase tracking-widest font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Editorial Feature · 1,000-Word Masterclass</span>
              </div>
              {isLiveEditorActive && onUpdateFrontText ? (
                <input
                  type="text"
                  value={featureHeadline}
                  onChange={(e) => onUpdateFrontText('tipsFeatureHeadline', e.target.value)}
                  className="w-full text-2xl md:text-4xl font-serif-display font-bold text-white bg-black/60 border border-amber-400 rounded-lg px-3 py-2"
                />
              ) : (
                <h1 className="text-3xl md:text-5xl font-serif-display font-bold text-white tracking-tight leading-tight">
                  {featureHeadline}
                </h1>
              )}
            </div>

            {/* 3 Easy-to-Replace Demo Editorial Images */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { key: 'tipsFeatureImage1' as const, src: img1, caption: 'Tailored Silhouette & Minimalist Contrast' },
                { key: 'tipsFeatureImage2' as const, src: img2, caption: 'Evening Poise & Luminous Glow' },
                { key: 'tipsFeatureImage3' as const, src: img3, caption: 'Candlelit Velvet Suite Atmosphere' },
              ].map((slot, index) => (
                <div key={slot.key} className="space-y-2">
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-[#e5b36b]/25 bg-black group">
                    <img src={slot.src} alt={slot.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 text-[11px] font-medium text-stone-200">
                      {slot.caption}
                    </span>

                    {isLiveEditorActive && onUpdateSettingsImage && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-3 gap-2">
                        <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" /> Change Demo Photo {index + 1}
                        </span>
                        <label className="px-3 py-1.5 rounded-lg bg-[#e5b36b] text-stone-950 font-bold text-[11px] cursor-pointer flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          Upload Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageFileUpload(slot.key, e)}
                            className="hidden"
                          />
                        </label>
                        <input
                          type="text"
                          placeholder="Or paste image URL..."
                          defaultValue={settings?.[slot.key] || ''}
                          onBlur={(e) => {
                            if (e.target.value.trim()) onUpdateSettingsImage(slot.key, e.target.value.trim());
                          }}
                          className="w-full bg-black/80 border border-stone-600 rounded px-2 py-1 text-[11px] text-white font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Compact First Paragraph Preview OR Expanded Full Monograph */}
            {isLiveEditorActive && onUpdateFrontText ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-amber-300 block">
                  Edit Full Feminine & Style Monograph (Supports ## Headings)
                </label>
                <textarea
                  rows={14}
                  value={featureArticle}
                  onChange={(e) => onUpdateFrontText('tipsFeatureArticle', e.target.value)}
                  className="w-full bg-black/70 border border-amber-400 rounded-xl p-4 text-sm text-stone-100 leading-relaxed"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2 border-t border-white/10">
                <div className="lg:col-span-8 space-y-4 text-sm md:text-base leading-relaxed">
                  {isMonographExpanded ? (
                    <>
                      {renderFormattedArticle(featureArticle)}
                      <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setIsMonographExpanded(false)}
                          className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
                        >
                          <ChevronUp className="w-4 h-4 text-[#e5b36b]" />
                          <span>Show Less</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsMonographModalOpen(true)}
                          className="px-4 py-2.5 rounded-xl bg-[#21142d] hover:bg-[#2c1b3d] border border-[#e5b36b]/40 text-[#f6e2bb] font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Open in Reader Popup</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {firstFeatureHeading && (
                        <h3 className="text-xl md:text-2xl font-serif-display font-bold text-[#f6e2bb] pt-1">
                          {firstFeatureHeading}
                        </h3>
                      )}
                      <p className="leading-relaxed text-stone-200">
                        {firstFeatureParagraph}
                      </p>
                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsMonographExpanded(true)}
                          className="px-5 py-2.5 rounded-xl gorgeous-btn-gradient text-stone-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-lg transition-transform hover:scale-[1.02]"
                        >
                          <span>Read More ({featureWordCount} Words)</span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsMonographModalOpen(true)}
                          className="px-4 py-2.5 rounded-xl bg-[#21142d] hover:bg-[#2c1b3d] border border-[#e5b36b]/40 text-[#f6e2bb] font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Read in Popup Modal</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <aside className="lg:col-span-4 space-y-4">
                  <div className="p-6 rounded-2xl bg-[#1d122b] border border-[#e5b36b]/30 space-y-3">
                    <Crown className="w-6 h-6 text-[#e5b36b]" />
                    <h3 className="text-xl font-serif-display font-bold text-white">
                      Private Masterclass Vault
                    </h3>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Unlock every intimate 18+ guide, boudoir camera tutorial, and unfiltered 4K lifestyle diary for $05.99/mo.
                    </p>
                    <button
                      onClick={onOpenVIPModal}
                      className="w-full py-2.5 rounded-xl gorgeous-btn-gradient text-stone-950 font-bold text-xs"
                    >
                      Join VIP Inner Circle
                    </button>
                  </div>
                </aside>
              </div>
            )}
          </div>
        )}

        {/* Section Header for Tips Cards */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#e5b36b] uppercase tracking-widest font-semibold mb-2">
                <Sparkles className="w-4 h-4 text-[#e5b36b]" />
                <span>Curated Masterclasses & Daily SEO Tips</span>
              </div>
              {isLiveEditorActive && onUpdateFrontText ? (
                <div className="space-y-2 max-w-xl">
                  <input
                    type="text"
                    value={frontTexts?.tipsSectionTitle || 'Masterclass Insights & Lifestyle Tips'}
                    onChange={(e) => onUpdateFrontText('tipsSectionTitle', e.target.value)}
                    className="w-full text-2xl font-serif-display font-bold text-white bg-black/60 border border-amber-400 rounded-lg px-2 py-1"
                  />
                  <textarea
                    rows={2}
                    value={frontTexts?.tipsSectionSubtitle || ''}
                    onChange={(e) => onUpdateFrontText('tipsSectionSubtitle', e.target.value)}
                    className="w-full text-xs text-stone-200 bg-black/60 border border-amber-400 rounded-lg p-2"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-3xl md:text-5xl font-serif-display font-bold text-white tracking-tight">
                    Isabella’s Exclusive Tips & <span className="rose-gold-gradient">Masterclasses</span>
                  </h2>
                  <p className="text-sm text-stone-300 mt-2 max-w-xl leading-relaxed">
                    {frontTexts?.tipsSectionSubtitle ||
                      'In-depth 450–600 word guides on feminine presence, red-carpet fashion curation, fine dining etiquette, and intimate confidence. Click any card to read the full article.'}
                  </p>
                </>
              )}
            </div>

            {/* Interactive filter tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-900/80 border border-stone-800 rounded-xl">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${selectedFilter === cat ? 'bg-gradient-to-r from-[#e5b36b] to-[#b84b6e] text-stone-950 font-bold shadow-md' : 'text-stone-400 hover:text-white'}`}
                >
                  {cat === 'Adult 18+ Intimacy' ? '🔞 Adult 18+ Tips' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tips Grid */}
          {filteredTips.length === 0 ? (
            <div className="text-center py-16 bg-[#14111a] rounded-2xl border border-stone-800">
              <p className="text-stone-400 text-sm">No tips found in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTips.map((tip) => {
                const isShareUnlocked = unlockedShareIds.includes(tip.id);
                const isLocked =
                  (tip.isPrivateVIP || Boolean(tip.isShareToUnlock)) && !isVipUnlocked && !isShareUnlocked;

                const cleanPreview = tip.content.replace(/##\s+/g, '').trim();

                return (
                  <article
                    key={tip.id}
                    onClick={() => setSelectedTip(tip)}
                    className="rounded-2xl overflow-hidden border border-stone-800/80 bg-[#161021]/85 hover:border-[#e5b36b]/60 transition-all duration-300 flex flex-col gorgeous-card-glow group cursor-pointer"
                  >
                    {/* Tip Image with measured scrim */}
                    <div className="relative aspect-16/10 overflow-hidden bg-stone-950">
                      <img
                        src={resolveAssetUrl(tip.image)}
                        alt={tip.title}
                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'blur-lg scale-110 select-none pointer-events-none' : ''}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold text-stone-200 px-2.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 uppercase tracking-wider">
                          {tip.category}
                        </span>

                        {tip.isAdult18 ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-300 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 backdrop-blur-md uppercase">
                            🔞 18+ Exclusive
                          </span>
                        ) : isLocked && tip.isShareToUnlock ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-sky-300 px-2 py-0.5 rounded bg-sky-950/80 border border-sky-500/40 backdrop-blur-md uppercase">
                            <Share2 className="w-2.5 h-2.5" /> Share Locked
                          </span>
                        ) : null}
                      </div>

                      <div className="absolute bottom-2.5 left-3 text-xs text-stone-300 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#e5b36b]" />
                        <span>{tip.readTime}</span>
                        <span>·</span>
                        <span>{tip.date}</span>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="text-lg font-serif-display font-semibold text-white group-hover:text-[#f6e2bb] transition-colors leading-snug">
                          {tip.title}
                        </h3>

                        {isLocked ? (
                          <div className="mt-3 p-3.5 rounded-xl bg-[#201229] border border-amber-600/40 text-center space-y-1.5">
                            <Lock className="w-4 h-4 text-[#e5b36b] mx-auto" />
                            <p className="text-xs text-stone-200 font-medium">
                              {tip.isShareToUnlock
                                ? 'Locked Article · Share on Social to Read Free'
                                : 'VIP Exclusive Masterclass Locked'}
                            </p>
                            <p className="text-[11px] text-stone-400 leading-tight">
                              Click to open unlock popup & read the complete 500-word SEO guide.
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-stone-300 mt-2.5 leading-relaxed line-clamp-3">
                            {cleanPreview}
                          </p>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div
                        className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onLikeTip?.(tip.id)}
                          className="flex items-center gap-1 text-stone-400 hover:text-rose-400 transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5 text-rose-400" />
                          <span>{tip.likes}</span>
                        </button>

                        {isLocked ? (
                          <div className="flex items-center gap-2">
                            {tip.isShareToUnlock && (
                              <button
                                onClick={() => setSelectedTip(tip)}
                                className="px-2.5 py-1.5 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 font-medium text-[11px] flex items-center gap-1 transition-colors"
                              >
                                <Share2 className="w-3 h-3" />
                                Share to Read
                              </button>
                            )}
                            {tip.isPrivateVIP && (
                              <button
                                onClick={onOpenVIPModal}
                                className="px-3 py-1.5 rounded-lg gorgeous-btn-gradient text-stone-950 font-bold text-[11px] flex items-center gap-1 transition-all"
                              >
                                <Crown className="w-3 h-3" />
                                VIP ($05.99)
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedTip(tip)}
                            className="text-xs font-semibold text-[#e5b36b] hover:text-[#f6e2bb] flex items-center gap-1"
                          >
                            <span>Read Full Tip</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
      </div>

      {/* FULL TIP ARTICLE READER & SHARE-TO-UNLOCK MODAL (Properly Scrollable) */}
      {activeTip && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center text-left"
          onClick={() => setSelectedTip(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] bg-[#110c19] border border-[#e5b36b]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Sticky Header */}
            <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-[#161021] shrink-0">
              <div className="flex items-center gap-2 text-xs text-[#e5b36b] font-semibold uppercase tracking-wider">
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>{activeTip.category}</span>
                {activeTip.isAdult18 && (
                  <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40 text-[10px]">
                    🔞 18+
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onLikeTip?.(activeTip.id)}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>{activeTip.likes}</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href).catch(() => {});
                    setCopiedTip(true);
                    setTimeout(() => setCopiedTip(false), 2000);
                  }}
                  className="p-2 text-stone-300 hover:text-white rounded-lg hover:bg-stone-800 flex items-center gap-1 text-xs"
                >
                  {copiedTip ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  {copiedTip && <span className="text-emerald-400">Copied</span>}
                </button>
                <button
                  onClick={() => setSelectedTip(null)}
                  className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
                  aria-label="Close tip reader"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
                  <Clock className="w-3.5 h-3.5 text-[#e5b36b]" />
                  <span>{activeTip.readTime}</span>
                  <span>·</span>
                  <span>{activeTip.date}</span>
                  <span>·</span>
                  <span>{activeTip.content.trim().split(/\s+/).length} Words</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif-display font-bold text-white leading-tight">
                  {activeTip.title}
                </h2>
              </div>

              {activeTipLocked ? (
                <div className="rounded-2xl bg-gradient-to-br from-[#23112d] via-[#150d20] to-[#0a070f] border border-[#e5b36b]/40 p-6 sm:p-8 text-center space-y-5">
                  <div className="w-16 h-16 rounded-full bg-[#e5b36b]/20 border border-[#e5b36b]/40 flex items-center justify-center text-[#e5b36b] mx-auto">
                    <Lock className="w-8 h-8" />
                  </div>

                  <div className="space-y-2 max-w-lg mx-auto">
                    <h3 className="text-2xl font-serif-display font-bold text-white">
                      {activeTip.isShareToUnlock
                        ? 'Share to Unlock Full 500-Word Masterclass'
                        : 'VIP Members-Only Masterclass Sealed'}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                      {activeTip.isShareToUnlock
                        ? 'This exclusive guide is locked for free readers. Share this page on social media below to unlock the complete article immediately, or join VIP for instant access to everything.'
                        : 'This private 18+ masterclass is reserved exclusively for VIP Inner Circle & Black Diamond members.'}
                    </p>
                  </div>

                  {activeTip.isShareToUnlock && (
                    <div className="p-4 rounded-xl bg-black/40 border border-sky-500/30 space-y-3">
                      <div className="text-xs font-semibold text-sky-300 uppercase tracking-wider">
                        Choose a Social Network to Share & Unlock Instantly
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2.5">
                        {['Facebook', 'Twitter / X', 'WhatsApp', 'Copy Share Link'].map((network) => (
                          <button
                            key={network}
                            type="button"
                            onClick={() => onShareToUnlock(activeTip.id)}
                            className="px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 transition-colors shadow-md"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Share via {network}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTip.isPrivateVIP && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTip(null);
                          onOpenVIPModal();
                        }}
                        className="px-7 py-3 rounded-xl text-xs font-bold gorgeous-btn-gradient text-stone-950 inline-flex items-center gap-2 shadow-xl"
                      >
                        <Crown className="w-4 h-4" />
                        <span>Unlock Everything with VIP ($05.99/mo)</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="h-56 sm:h-72 rounded-xl overflow-hidden border border-stone-800 bg-black">
                    <img
                      src={resolveAssetUrl(activeTip.image)}
                      alt={activeTip.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-4 text-sm md:text-base text-stone-200 leading-relaxed pb-4">
                    {renderFormattedArticle(activeTip.content)}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* FULL MONOGRAPH READER POPUP MODAL */}
      {isMonographModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center text-left"
          onClick={() => setIsMonographModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] bg-[#110c19] border border-[#e5b36b]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-[#161021] shrink-0">
              <div className="flex items-center gap-2 text-xs text-[#e5b36b] font-semibold uppercase tracking-wider">
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>Luxury Editorial Monograph · {featureWordCount} Words</span>
              </div>
              <button
                onClick={() => setIsMonographModalOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
                aria-label="Close monograph reader"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6">
              <h2 className="text-2xl md:text-4xl font-serif-display font-bold text-white leading-tight">
                {featureHeadline}
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <img src={img1} alt="Style 1" className="w-full h-28 sm:h-36 object-cover rounded-xl border border-stone-800" />
                <img src={img2} alt="Style 2" className="w-full h-28 sm:h-36 object-cover rounded-xl border border-stone-800" />
                <img src={img3} alt="Style 3" className="w-full h-28 sm:h-36 object-cover rounded-xl border border-stone-800" />
              </div>
              <div className="space-y-4 text-sm md:text-base leading-relaxed pb-4">
                {renderFormattedArticle(featureArticle)}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
