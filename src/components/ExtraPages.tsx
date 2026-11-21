import React, { useState } from 'react';
import {
  Crown,
  Sparkles,
  Coffee,
  CheckCircle2,
  FileText,
  MapPin,
  ShieldCheck,
  Award,
  Camera,
  Heart,
  Clock,
  Lock,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { UserSubscription, ExtraPageItem, SiteSettings, FrontEditableTexts } from '../types';
import { ISABELLA_AVATAR_IMG, ISABELLA_HERO_IMG, resolveAssetUrl } from '../defaultStore';
import { renderRichMarkdown } from '../utils/markdown';
import { compressImageFileToDataUrl } from '../utils/imageUpload';
import { FAQCategory, FAQSection } from './FAQSection';

interface ExtraPagesProps {
  activePage: 'about' | 'tips' | 'membership' | 'contact' | 'custom';
  customPage?: ExtraPageItem | null;
  pages?: ExtraPageItem[];
  subscription: UserSubscription;
  settings?: SiteSettings;
  frontTexts?: FrontEditableTexts;
  isLiveEditorActive?: boolean;
  onUpdateFrontText?: (field: keyof FrontEditableTexts, val: string) => void;
  onUpdateSettingsImage?: (field: keyof SiteSettings, url: string) => void;
  vipMonthlyPrice?: number;
  blackDiamondPrice?: number;
  onOpenVIPModal: () => void;
  onNavigate?: (target: string) => void;
}

export const ExtraPages: React.FC<ExtraPagesProps> = ({
  activePage,
  customPage,
  pages = [],
  subscription,
  settings,
  frontTexts,
  isLiveEditorActive = false,
  onUpdateFrontText,
  onUpdateSettingsImage,
  vipMonthlyPrice = 5.99,
  blackDiamondPrice = 14.99,
  onOpenVIPModal,
  onNavigate
}) => {
  const [contactSent, setContactSent] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('VIP Membership / Vault Access');
  const [contactMessage, setContactMessage] = useState('');

  const formattedMonthly = vipMonthlyPrice < 10 ? `0${vipMonthlyPrice.toFixed(2)}` : vipMonthlyPrice.toFixed(2);
  const formattedQuarterly = blackDiamondPrice.toFixed(2);

  const aboutPageData = pages.find((p) => p.slug === 'about' && p.status === 'published');
  const membershipPageData = pages.find((p) => p.slug === 'membership' && p.status === 'published');
  const conciergePageData = pages.find((p) => p.slug === 'concierge' && p.status === 'published');

  const handleImageFileUpload = (field: keyof SiteSettings, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateSettingsImage) return;
    compressImageFileToDataUrl(file, (dataUrl) => {
      onUpdateSettingsImage(field, dataUrl);
    });
  };

  return (
    <div className="py-16 bg-gradient-to-b from-[#0b0710] via-[#140b1e] to-[#09080b] min-h-[75vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CUSTOM ADMIN EXTRA PAGE (Pure English + Rich Text + Banner + Integrated FAQ) */}
        {activePage === 'custom' && customPage && (() => {
          const slugLower = (customPage.slug || '').toLowerCase();
          const customFaqDefaultCategory: FAQCategory = slugLower.includes('concierge')
            ? 'concierge'
            : slugLower.includes('blog') || slugLower.includes('journal')
              ? 'blog'
              : slugLower.includes('membership')
                ? 'vip'
                : 'all';

          return (
            <div className="space-y-10">
              <div className="max-w-3xl mx-auto bg-[#161021]/90 border border-[#e5b36b]/30 rounded-3xl overflow-hidden gorgeous-card-glow">
                {customPage.bannerImage && (
                  <div className="aspect-16/7 w-full overflow-hidden border-b border-white/10 bg-black">
                    <img
                      src={resolveAssetUrl(customPage.bannerImage)}
                      alt={customPage.titleEn}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-8 md:p-10 space-y-6">
                  <div className="flex items-center gap-2 text-xs text-[#e5b36b] uppercase tracking-widest font-semibold">
                    <FileText className="w-4 h-4" />
                    <span>Featured Page · Updated {customPage.lastUpdated}</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-serif-display font-bold text-white tracking-tight">
                    {customPage.titleEn}
                  </h1>
                  <div className="border-t border-white/10 pt-6 space-y-4 text-sm md:text-base text-stone-200 leading-relaxed">
                    {renderRichMarkdown(customPage.content)}
                  </div>
                </div>
              </div>

              <FAQSection
                subscription={subscription}
                vipMonthlyPrice={vipMonthlyPrice}
                blackDiamondPrice={blackDiamondPrice}
                defaultCategory={customFaqDefaultCategory}
                onOpenVIPModal={onOpenVIPModal}
                onNavigate={onNavigate}
              />
            </div>
          );
        })()}

        {/* RICH ABOUT ISABELLA PAGE (Unified with Extra Pages Management) */}
        {activePage === 'about' && (
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs text-[#e5b36b] uppercase tracking-widest font-semibold block mb-2">
                Biographical Monograph · Milan · Paris · New York
              </span>
              {isLiveEditorActive && onUpdateFrontText ? (
                <input
                  type="text"
                  value={frontTexts?.aboutHeadline || aboutPageData?.titleEn || 'Meet Isabella Rose'}
                  onChange={(e) => onUpdateFrontText('aboutHeadline', e.target.value)}
                  className="w-full text-center text-3xl font-serif-display font-bold text-white bg-black/60 border border-amber-400 rounded-lg px-3 py-1.5"
                />
              ) : (
                <h1 className="text-4xl md:text-5xl font-serif-display font-bold text-white tracking-tight">
                  {aboutPageData?.titleEn || frontTexts?.aboutHeadline || 'Meet Isabella Rose'}
                </h1>
              )}
              <p className="text-sm md:text-base text-stone-300 mt-3 leading-relaxed">
                International haute couture muse, luxury gastronomy curator, and creator of an uncensored private visual sanctuary for discerning global patrons.
              </p>
            </div>

            {/* Portrait + Biography Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-[#161021]/90 p-6 md:p-10 rounded-3xl border border-[#e5b36b]/25 gorgeous-card-glow">
              <div className="md:col-span-5 relative">
                <img
                  src={resolveAssetUrl(settings?.aboutImage || aboutPageData?.bannerImage, ISABELLA_AVATAR_IMG)}
                  alt="Isabella Rose portrait"
                  className="w-full aspect-square object-cover rounded-2xl border border-[#e5b36b]/40 shadow-2xl"
                />
                {isLiveEditorActive && onUpdateSettingsImage && (
                  <div className="mt-2 p-2.5 rounded-xl bg-black/80 border border-amber-400/50 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-amber-300 font-semibold">
                      <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> About Image</span>
                      <label className="px-2 py-0.5 rounded bg-amber-500 text-black font-bold cursor-pointer flex items-center gap-1">
                        <Upload className="w-3 h-3" /> Upload
                        <input type="file" accept="image/*" onChange={(e) => handleImageFileUpload('aboutImage', e)} className="hidden" />
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="Paste image URL..."
                      value={settings?.aboutImage || ''}
                      onChange={(e) => onUpdateSettingsImage('aboutImage', e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-[11px] text-white font-mono"
                    />
                  </div>
                )}
              </div>
              <div className="md:col-span-7 space-y-4 text-sm text-stone-200 leading-relaxed">
                {isLiveEditorActive && onUpdateFrontText ? (
                  <textarea
                    rows={6}
                    value={frontTexts?.aboutBio || ''}
                    onChange={(e) => onUpdateFrontText('aboutBio', e.target.value)}
                    className="w-full bg-black/70 border border-amber-400 rounded-lg p-3 text-sm text-stone-100 leading-relaxed"
                  />
                ) : aboutPageData?.content ? (
                  <div className="space-y-4">
                    {renderRichMarkdown(aboutPageData.content)}
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl md:text-3xl font-serif-display font-semibold text-white">
                      "Sensuality is power in its most poetic, unapologetic form."
                    </h2>
                    <p>
                      {frontTexts?.aboutBio ||
                        'Born with an insatiable devotion to European aesthetics, I spent my early twenties modeling in Milanese ateliers and documenting clandestine supper clubs across Saint-Germain-des-Prés. What began as a private travel diary evolved into a global community of over 1.2 million admirers.'}
                    </p>
                  </>
                )}

                <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-lg font-bold gold-gradient-text font-serif-display">1.2M+</div>
                    <div className="text-stone-400 text-[11px]">Global Audience</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold rose-gold-gradient font-serif-display">Milan · Paris</div>
                    <div className="text-stone-400 text-[11px]">Primary Studios</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white font-serif-display">4K UHD</div>
                    <div className="text-stone-400 text-[11px]">Private Archives</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Pillars of Isabella's World */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#161021] border border-[#e5b36b]/20 space-y-3 gorgeous-card-glow">
                <div className="w-10 h-10 rounded-xl bg-[#e5b36b]/15 border border-[#e5b36b]/30 flex items-center justify-center text-[#e5b36b]">
                  <Camera className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif-display font-semibold text-white">Unfiltered Artistry</h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Shot on medium-format digital and 35mm cinema film in private suites across Paris, Lake Como, and Manhattan without censorship.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-[#161021] border border-[#e5b36b]/20 space-y-3 gorgeous-card-glow">
                <div className="w-10 h-10 rounded-xl bg-[#b84b6e]/15 border border-[#b84b6e]/30 flex items-center justify-center text-[#ff7eb3]">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif-display font-semibold text-white">Intimate Connection</h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  VIP members gain access to late-night personal confessions, sensory fragrance rituals, and private reader conversations.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-[#161021] border border-[#e5b36b]/20 space-y-3 gorgeous-card-glow">
                <div className="w-10 h-10 rounded-xl bg-[#e5b36b]/15 border border-[#e5b36b]/30 flex items-center justify-center text-[#e5b36b]">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif-display font-semibold text-white">Luxury Lifestyle</h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Front-row couture critiques, Michelin-starred champagne pairings, and refined feminine poise masterclasses updated daily.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TIPS FALLBACK */}
        {activePage === 'tips' && (
          <div className="space-y-10">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs text-[#e5b36b] uppercase tracking-widest font-semibold block mb-2">
                Curated Secrets & Masterclasses
              </span>
              <h1 className="text-3xl md:text-5xl font-serif-display font-bold text-white tracking-tight">
                Isabella’s Exclusive Tips
              </h1>
              <p className="text-sm text-stone-300 mt-3 leading-relaxed">
                Actionable advice on feminine magnetism, luxury dining etiquette, wardrobe investment, and high-impact camera confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#161021] border border-[#e5b36b]/20 space-y-3 gorgeous-card-glow">
                <div className="w-10 h-10 rounded-xl bg-[#e5b36b]/15 border border-[#e5b36b]/30 flex items-center justify-center text-[#e5b36b]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif-display font-semibold text-white">Feminine Sovereignty</h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  How to hold presence without words. The quiet discipline of speaking slower, holding eye contact for 3 extra seconds, and never justifying your worth.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#161021] border border-[#e5b36b]/20 space-y-3 gorgeous-card-glow">
                <div className="w-10 h-10 rounded-xl bg-[#e5b36b]/15 border border-[#e5b36b]/30 flex items-center justify-center text-[#e5b36b]">
                  <Coffee className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif-display font-semibold text-white">Fine Dining Etiquette</h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Navigating 7-course tastings, understanding stemware temperature rules, tipping with discreet elegance, and requesting bespoke off-menu pairings.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#161021] border border-[#e5b36b]/20 space-y-3 gorgeous-card-glow">
                <div className="w-10 h-10 rounded-xl bg-[#e5b36b]/15 border border-[#e5b36b]/30 flex items-center justify-center text-[#e5b36b]">
                  <Crown className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif-display font-semibold text-white">Camera & Pose Mastery</h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Angles that flatter collarbones, creating natural movement in high-fashion dresses, and manipulating natural shadows for effortless glamour.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* RICH MEMBERSHIP PAGE */}
        {activePage === 'membership' && (
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs text-[#e5b36b] uppercase tracking-widest font-semibold block mb-2">
                Discreet VIP Society
              </span>
              <h1 className="text-4xl md:text-5xl font-serif-display font-bold text-white tracking-tight">
                {membershipPageData?.titleEn || (
                  <>
                    Premium <span className="rose-gold-gradient">Membership Tiers</span>
                  </>
                )}
              </h1>
              {membershipPageData?.content ? (
                <div className="mt-4 text-sm text-stone-300 space-y-3 text-left bg-[#161021]/70 border border-[#e5b36b]/20 rounded-2xl p-6">
                  {renderRichMarkdown(membershipPageData.content)}
                </div>
              ) : (
                <p className="text-sm text-stone-300 mt-3 leading-relaxed">
                  Step past the velvet curtain. Unlock Isabella's uncompressed adult boudoir galleries, 4K midnight video diaries, and priority VIP concierge privileges.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#15101e] border border-stone-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Public Access</span>
                  <div className="text-2xl font-bold text-white mt-2 font-serif-display">Free Forever</div>
                  <p className="text-xs text-stone-400 mt-2">Explore Isabella's public fashion lookbooks and dining stories.</p>
                  <ul className="text-xs text-stone-300 space-y-2.5 mt-5">
                    <li>✓ Public fashion & travel journals</li>
                    <li>✓ Non-adult lifestyle & skincare tips</li>
                    <li>✓ Share-to-Unlock selected teasers</li>
                    <li className="text-stone-500">✗ Locked VIP Adult boudoir vaults</li>
                    <li className="text-stone-500">✗ 4K Private video streaming</li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-800 text-xs text-stone-400 text-center">
                  Active Public Status
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#1e1329] border-2 border-[#e5b36b] flex flex-col justify-between shadow-xl relative gorgeous-card-glow">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full gorgeous-btn-gradient text-stone-950 text-[10px] font-bold uppercase tracking-widest">
                  Most Popular
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#e5b36b] uppercase tracking-wider">VIP Inner Circle</span>
                  <div className="text-3xl font-bold text-white mt-2 font-serif-display">
                    ${formattedMonthly}<span className="text-xs font-normal text-stone-300">/mo</span>
                  </div>
                  <p className="text-xs text-stone-300 mt-2">Complete monthly pass to all private adult 18+ articles & galleries.</p>
                  <ul className="text-xs text-stone-200 space-y-2.5 mt-5">
                    <li>✓ Full adult 18+ VIP stories & intimate tips</li>
                    <li>✓ Unfiltered boudoir multi-photo vault</li>
                    <li>✓ Weekly private streaming reels</li>
                    <li>✓ Direct article commenting privileges</li>
                  </ul>
                </div>
                <button
                  onClick={onOpenVIPModal}
                  className="mt-6 w-full py-2.5 px-4 rounded-xl gorgeous-btn-gradient text-stone-950 font-bold text-xs transition-opacity hover:opacity-95"
                >
                  Join VIP Inner Circle (${formattedMonthly}/mo)
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#291733] to-[#130d1c] border border-[#b84b6e]/60 flex flex-col justify-between gorgeous-card-glow">
                <div>
                  <span className="text-xs font-semibold rose-gold-gradient uppercase tracking-wider">Black Diamond VIP</span>
                  <div className="text-3xl font-bold text-white mt-2 font-serif-display">
                    ${formattedQuarterly}<span className="text-xs font-normal text-stone-300">/3mo</span>
                  </div>
                  <p className="text-xs text-stone-300 mt-2">Our highest quarterly patron tier for total vault access & savings.</p>
                  <ul className="text-xs text-stone-200 space-y-2.5 mt-5">
                    <li>✓ Everything in VIP Inner Circle (3 Months)</li>
                    <li>✓ Uncompressed 4K master video reels</li>
                    <li>✓ Private personal audio diary drops</li>
                    <li>✓ Priority concierge & custom shoot polls</li>
                  </ul>
                </div>
                <button
                  onClick={onOpenVIPModal}
                  className="mt-6 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#f3cf8a] via-[#e5b36b] to-[#b84b6e] text-stone-950 font-bold text-xs transition-opacity hover:opacity-95"
                >
                  Get Black Diamond (${formattedQuarterly}/3mo)
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#161021] border border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Discreet Billing Descriptor</div>
                  <p className="text-stone-400 mt-1">Statements appear cleanly under "IR-Studio Digital" for total privacy.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-[#e5b36b] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Instant Vault Activation</div>
                  <p className="text-stone-400 mt-1">Every locked photo album, 4K stream, and 18+ guide opens immediately.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#ff7eb3] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Cancel Anytime</div>
                  <p className="text-stone-400 mt-1">No hidden commitments—manage or pause your VIP pass effortlessly.</p>
                </div>
              </div>
            </div>

            <FAQSection
              subscription={subscription}
              vipMonthlyPrice={vipMonthlyPrice}
              blackDiamondPrice={blackDiamondPrice}
              defaultCategory="vip"
              onOpenVIPModal={onOpenVIPModal}
              onNavigate={onNavigate}
            />
          </div>
        )}

        {/* RICH PRIVATE CONCIERGE (CONTACT) PAGE */}
        {activePage === 'contact' && (
          <div className="space-y-10">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs text-[#e5b36b] uppercase tracking-widest font-semibold block mb-2">
                24/7 Discreet Patron Desk
              </span>
              {isLiveEditorActive && onUpdateFrontText ? (
                <input
                  type="text"
                  value={frontTexts?.conciergeHeadline || 'Private Concierge'}
                  onChange={(e) => onUpdateFrontText('conciergeHeadline', e.target.value)}
                  className="w-full text-center text-3xl font-serif-display font-bold text-white bg-black/60 border border-amber-400 rounded-lg px-3 py-1.5"
                />
              ) : (
                <h1 className="text-4xl md:text-5xl font-serif-display font-bold text-white tracking-tight">
                  {conciergePageData?.titleEn || frontTexts?.conciergeHeadline || 'Private Concierge'}
                </h1>
              )}
              {isLiveEditorActive && onUpdateFrontText ? (
                <textarea
                  rows={2}
                  value={frontTexts?.conciergeDescription || ''}
                  onChange={(e) => onUpdateFrontText('conciergeDescription', e.target.value)}
                  className="w-full mt-3 text-sm text-stone-200 bg-black/60 border border-amber-400 rounded-lg p-2"
                />
              ) : conciergePageData?.content ? (
                <div className="mt-4 text-sm text-stone-300 space-y-3 text-left bg-[#161021]/70 border border-[#e5b36b]/20 rounded-2xl p-5">
                  {renderRichMarkdown(conciergePageData.content)}
                </div>
              ) : (
                <p className="text-sm text-stone-300 mt-3 leading-relaxed">
                  {frontTexts?.conciergeDescription ||
                    'Reach Isabella\'s dedicated management team for VIP membership assistance, luxury brand partnerships, couture showroom fittings, and private event invitations.'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Info Panel */}
              <div className="lg:col-span-5 space-y-5">
                <div className="rounded-3xl overflow-hidden border border-[#e5b36b]/30 bg-[#161021] gorgeous-card-glow">
                  <img
                    src={resolveAssetUrl(settings?.conciergeImage || conciergePageData?.bannerImage, ISABELLA_HERO_IMG)}
                    alt="Isabella Rose Concierge"
                    className="w-full h-52 object-cover"
                  />
                  {isLiveEditorActive && onUpdateSettingsImage && (
                    <div className="p-3 bg-black/80 border-b border-amber-400/30 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-amber-300 font-semibold">
                        <span>Concierge Banner Photo</span>
                        <label className="px-2 py-0.5 rounded bg-amber-500 text-black font-bold cursor-pointer flex items-center gap-1">
                          <Upload className="w-3 h-3" /> Upload
                          <input type="file" accept="image/*" onChange={(e) => handleImageFileUpload('conciergeImage', e)} className="hidden" />
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="Paste image URL..."
                        value={settings?.conciergeImage || ''}
                        onChange={(e) => onUpdateSettingsImage('conciergeImage', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-[11px] text-white font-mono"
                      />
                    </div>
                  )}
                  <div className="p-6 space-y-4 text-xs">
                    <h3 className="text-xl font-serif-display font-semibold text-white">Direct Management Desk</h3>
                    <p className="text-stone-300 leading-relaxed">
                      All messages are encrypted and reviewed privately by Isabella's personal concierge within 12 hours.
                    </p>
                    <div className="space-y-3 pt-2 border-t border-white/10">
                      <div className="flex items-center gap-3 text-stone-200">
                        <MapPin className="w-4 h-4 text-[#e5b36b] shrink-0" />
                        <span>Place Vendôme, Paris · Via Monte Napoleone, Milan</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Inquiry Form */}
              <div className="lg:col-span-7 bg-[#161021]/90 p-8 rounded-3xl border border-[#e5b36b]/30 gorgeous-card-glow">
                <h2 className="text-2xl font-serif-display font-bold text-white mb-1">
                  Send a Confidential Inquiry
                </h2>
                <p className="text-xs text-stone-400 mb-6">
                  Select your inquiry category below for priority routing.
                </p>

                {contactSent ? (
                  <div className="p-6 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-center space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h3 className="text-lg font-serif-display font-semibold text-white">Inquiry Dispatched</h3>
                    <p className="text-xs text-emerald-200 leading-relaxed">
                      Thank you, {contactName || 'Patron'}. Your confidential inquiry regarding <strong>{contactSubject}</strong> has been received by Isabella's private concierge.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setContactSent(false);
                        setContactName('');
                        setContactEmail('');
                        setContactMessage('');
                      }}
                      className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs font-medium"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setContactSent(true);
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-stone-200 mb-1 font-medium">Your Name / Organization</label>
                        <input
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. Laurent de Montcalm"
                          className="w-full bg-[#0d0914] border border-stone-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#e5b36b]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-stone-200 mb-1 font-medium">Email Address</label>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="patron@domain.com"
                          className="w-full bg-[#0d0914] border border-stone-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#e5b36b]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-200 mb-1 font-medium">Inquiry Subject</label>
                      <select
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        className="w-full bg-[#0d0914] border border-stone-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#e5b36b]"
                      >
                        <option>VIP Membership / Vault Access</option>
                        <option>Brand Collaboration / Haute Couture</option>
                        <option>Private Event Invitation</option>
                        <option>Custom Shoot Request (Black Diamond)</option>
                        <option>General Media Inquiries</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-stone-200 mb-1 font-medium">Confidential Message</label>
                      <textarea
                        rows={5}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Write your discreet inquiry..."
                        className="w-full bg-[#0d0914] border border-stone-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#e5b36b]"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl gorgeous-btn-gradient text-stone-950 font-bold transition-opacity hover:opacity-95 shadow-md text-xs"
                    >
                      Send Discreet Message to Concierge
                    </button>
                  </form>
                )}
              </div>
            </div>

            <FAQSection
              subscription={subscription}
              vipMonthlyPrice={vipMonthlyPrice}
              blackDiamondPrice={blackDiamondPrice}
              defaultCategory="concierge"
              onOpenVIPModal={onOpenVIPModal}
              onNavigate={onNavigate}
            />
          </div>
        )}
      </div>
    </div>
  );
};
