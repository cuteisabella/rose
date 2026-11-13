import React, { useState } from 'react';
import { 
  Play, 
  Lock, 
  Eye, 
  Heart, 
  Sparkles, 
  Crown, 
  X,
  Share2,
  ChevronLeft,
  ChevronRight,
  Images,
  Check
} from 'lucide-react';
import { VideoItem, UserSubscription } from '../types';
import { resolveAssetUrl } from '../defaultStore';
import { ShareUnlockGatePanel } from './ShareUnlockModal';

interface MediaVaultProps {
  videos: VideoItem[];
  categories: string[];
  subscription: UserSubscription;
  onOpenVIPModal: () => void;
  onShareToUnlock: (id: string) => void;
  onVerifiedShareUnlock: (id: string) => void;
  unlockedShareIds: string[];
}

export const MediaVault: React.FC<MediaVaultProps> = ({
  videos,
  categories,
  subscription,
  onOpenVIPModal,
  onShareToUnlock,
  onVerifiedShareUnlock,
  unlockedShareIds
}) => {
  const [filter, setFilter] = useState<string>('All');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState<number>(0);
  const [copiedMedia, setCopiedMedia] = useState(false);

  const allFilters = ['All', ...categories];

  const filteredVideos = videos
    .filter((v) => v.status === 'Published')
    .filter(v => {
      if (filter === 'All') return true;
      return v.category === filter;
    });

  const handleOpenItem = (item: VideoItem) => {
    setSelectedVideo(item);
    setCurrentGalleryIndex(0);
  };

  const handlePrevImage = (e: React.MouseEvent, max: number) => {
    e.stopPropagation();
    setCurrentGalleryIndex(prev => (prev === 0 ? max - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent, max: number) => {
    e.stopPropagation();
    setCurrentGalleryIndex(prev => (prev === max - 1 ? 0 : prev + 1));
  };

  return (
    <section id="vault" className="py-20 border-t border-stone-800/80 bg-gradient-to-b from-[#09080b] via-[#110a19] to-[#0d0714]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#e5b36b] uppercase tracking-widest font-semibold mb-2">
              <Sparkles className="w-4 h-4 text-[#e5b36b]" />
              <span>Exclusive Media Vault</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif-display font-bold text-white tracking-tight">
              Curated Visual Cinema & <span className="rose-gold-gradient">VIP Private Stills</span>
            </h2>
            <p className="text-sm text-stone-300 mt-2 max-w-xl leading-relaxed">
              Experience Isabella's world in pristine resolution. Interactive photo albums with multiple slide views, high-definition videos, and locked adult private vaults.
            </p>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-900/80 border border-stone-800 rounded-xl">
            {allFilters.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${filter === cat ? 'bg-gradient-to-r from-[#e5b36b] to-[#b84b6e] text-stone-950 font-bold shadow-md' : 'text-stone-400 hover:text-white'}`}
              >
                {cat === 'VIP Private' ? '🔒 VIP Private' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((item) => {
            const isShareUnlocked = unlockedShareIds.includes(item.id);
            const isVipUnlocked = subscription.tier !== 'Free';
            const isLocked =
              (item.isPrivateVIP || Boolean(item.isShareToUnlock)) && !isVipUnlocked && !isShareUnlocked;

            return (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden border border-stone-800/80 bg-[#161021]/80 hover:border-[#e5b36b]/60 transition-all duration-300 flex flex-col gorgeous-card-glow"
              >
                {/* Media Image / Preview */}
                <div
                  className="relative aspect-4/3 overflow-hidden bg-stone-950 cursor-pointer"
                  onClick={() => handleOpenItem(item)}
                >
                  <img
                    src={resolveAssetUrl(item.thumbnailUrl)}
                    alt={item.titleEn}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'blur-xl scale-110 select-none pointer-events-none' : ''}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-stone-300 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 uppercase tracking-wider flex items-center gap-1">
                      {item.type === 'gallery' ? <Images className="w-3 h-3 text-[#e5b36b]" /> : <Play className="w-3 h-3 text-[#e5b36b]" />}
                      {item.category}
                    </span>

                    {item.isPrivateVIP && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 px-2.5 py-1 rounded-md bg-amber-950/80 border border-amber-600/40 backdrop-blur-md uppercase tracking-wider">
                        <Lock className="w-3 h-3" /> VIP Vault
                      </span>
                    )}
                  </div>

                  {/* Center Action Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isLocked ? (
                      <div className="p-3.5 rounded-full bg-black/80 border border-amber-500/50 text-amber-400 shadow-xl group-hover:scale-110 transition-transform">
                        <Lock className="w-6 h-6" />
                      </div>
                    ) : item.type === 'video' ? (
                      <div className="p-3.5 rounded-full bg-gradient-to-r from-[#e5b36b] to-[#b84b6e] text-stone-950 shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-current" />
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-full bg-black/70 text-white border border-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform flex items-center gap-1.5 text-xs font-semibold px-4">
                        <Images className="w-4 h-4 text-[#e5b36b]" />
                        <span>View Gallery ({item.galleryImages?.length || 4})</span>
                      </div>
                    )}
                  </div>

                  {item.duration && (
                    <span className="absolute bottom-3 right-3 text-[11px] font-mono text-white px-2 py-0.5 rounded bg-black/70 backdrop-blur-md">
                      {item.duration}
                    </span>
                  )}
                </div>

                {/* Info Card */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#e5b36b] block mb-1">
                      {item.brandName}
                    </span>
                    <h3 className="text-base font-serif-display font-semibold text-white group-hover:text-[#f6e2bb] transition-colors leading-snug">
                      {item.titleEn}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.descriptionEn}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                    <span className="font-mono">👁 {item.viewsCount} Views</span>

                    {isLocked ? (
                      <div className="flex items-center gap-2">
                        {item.isShareToUnlock && (
                          <button
                            onClick={() => onShareToUnlock(item.id)}
                            className="px-2 py-1 rounded-md bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 font-medium text-[10px] flex items-center gap-1"
                            title="Share on Facebook / Twitter to unlock"
                          >
                            <Share2 className="w-3 h-3" />
                            Share to Unlock
                          </button>
                        )}
                        <button
                          onClick={onOpenVIPModal}
                          className="font-semibold text-[#e5b36b] hover:text-[#f6e2bb] flex items-center gap-1 text-xs"
                        >
                          <Crown className="w-3 h-3" />
                          Join VIP
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenItem(item)}
                        className="font-medium text-stone-300 hover:text-white"
                      >
                        {item.type === 'gallery' ? 'Open Album →' : 'Play Video →'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Lightbox (Supports Video & Photo Gallery Sliding) */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="relative w-full max-w-4xl bg-[#110a19] border border-stone-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-[#160e22]">
              <div>
                <h4 className="text-sm font-semibold text-white">{selectedVideo.titleEn}</h4>
                <span className="text-xs text-stone-400">
                  {selectedVideo.category} · {selectedVideo.type === 'gallery' ? `Photo Gallery (${(selectedVideo.galleryImages?.length || 1)} Images)` : selectedVideo.duration}
                </span>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-stone-400 hover:text-white text-xs px-3 py-1.5 rounded-lg bg-stone-800"
              >
                Close (ESC)
              </button>
            </div>

            {/* Content Area: Video or Gallery Slider */}
            <div className="relative p-4 flex-1 flex items-center justify-center bg-black min-h-[420px] overflow-hidden">
              {/* Check Locked Status */}
              {(selectedVideo.isPrivateVIP || Boolean(selectedVideo.isShareToUnlock)) && subscription.tier === 'Free' && !unlockedShareIds.includes(selectedVideo.id) ? (
                <div className="text-center p-8 max-w-md">
                  <div className="w-16 h-16 rounded-full bg-[#e5b36b]/20 border border-[#e5b36b]/40 flex items-center justify-center text-[#e5b36b] mx-auto mb-4">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif-display font-bold text-white mb-2">
                    Private Member Access Required
                  </h3>
                  <p className="text-xs text-stone-300 mb-5 leading-relaxed">
                    This uncut media is locked for Isabella's VIP &amp; Black Diamond members. {selectedVideo.isShareToUnlock ? 'Share on a social network below and confirm completion to unlock free access, or join VIP ($05.99/mo) immediately.' : 'Upgrade your subscription ($05.99/mo) to unlock immediately.'}
                  </p>
                  {selectedVideo.isShareToUnlock && (
                    <div className="mb-4 text-left">
                      <ShareUnlockGatePanel
                        itemId={selectedVideo.id}
                        itemTitle={selectedVideo.titleEn}
                        onVerifiedUnlock={onVerifiedShareUnlock}
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedVideo(null);
                        onOpenVIPModal();
                      }}
                      className="px-6 py-2.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#e5b36b] to-[#b84b6e] text-stone-950 transition-opacity hover:opacity-95 inline-flex items-center gap-2"
                    >
                      <Crown className="w-4 h-4" />
                      Join VIP ($05.99/mo)
                    </button>
                  </div>
                </div>
              ) : selectedVideo.type === 'gallery' ? (
                /* MULTI-PHOTO GALLERY VIEWER */
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  {(() => {
                    const gallery = selectedVideo.galleryImages && selectedVideo.galleryImages.length > 0 
                      ? selectedVideo.galleryImages 
                      : [selectedVideo.thumbnailUrl];
                    const currentImg = gallery[currentGalleryIndex % gallery.length];

                    return (
                      <>
                        <img
                          src={resolveAssetUrl(currentImg)}
                          alt=""
                          className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-2xl transition-all duration-300"
                        />

                        {/* Navigation Arrows */}
                        {gallery.length > 1 && (
                          <>
                            <button
                              onClick={(e) => handlePrevImage(e, gallery.length)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all shadow-xl"
                            >
                              <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                              onClick={(e) => handleNextImage(e, gallery.length)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all shadow-xl"
                            >
                              <ChevronRight className="w-6 h-6" />
                            </button>

                            {/* Counter & Thumbnails */}
                            <div className="absolute bottom-2 flex items-center gap-2 px-3 py-1 bg-black/70 rounded-full border border-white/20 text-xs text-white">
                              <span>Image {currentGalleryIndex + 1} of {gallery.length}</span>
                            </div>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : (
                /* VIDEO PLAYER */
                <video
                  src={selectedVideo.embedLink}
                  controls
                  autoPlay
                  className="max-h-[65vh] w-full rounded-lg"
                />
              )}
            </div>

            <div className="p-4 border-t border-stone-800 text-xs text-stone-300 flex items-center justify-between bg-[#160e22]">
              <div>
                <span className="font-semibold text-[#e5b36b]">{selectedVideo.brandName}: </span>
                {selectedVideo.descriptionEn}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href).catch(() => {});
                  setCopiedMedia(true);
                  setTimeout(() => setCopiedMedia(false), 2000);
                }}
                className="text-stone-400 hover:text-white flex items-center gap-1 ml-4 shrink-0"
              >
                {copiedMedia ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedMedia ? 'Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
