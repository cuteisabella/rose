import React, { useState, useEffect } from 'react';
import {
  Share2,
  X,
  Lock,
  CheckCircle2,
  Crown,
  ExternalLink,
  Clock,
  ShieldCheck
} from 'lucide-react';

export interface ShareGateTarget {
  id: string;
  title: string;
  shareUrl?: string;
}

interface ShareUnlockGatePanelProps {
  itemId: string;
  itemTitle: string;
  shareUrl?: string;
  onVerifiedUnlock: (id: string) => void;
  onOpenVIPModal?: () => void;
}

export const ShareUnlockGatePanel: React.FC<ShareUnlockGatePanelProps> = ({
  itemId,
  itemTitle,
  shareUrl,
  onVerifiedUnlock,
  onOpenVIPModal
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [shareVerifiedReady, setShareVerifiedReady] = useState<boolean>(false);

  const targetUrl = shareUrl || (typeof window !== 'undefined' ? window.location.href : 'https://isabellarose.vip');
  const encodedUrl = encodeURIComponent(targetUrl);
  const encodedText = encodeURIComponent(`Read "${itemTitle}" inside Isabella Rose VIP Sanctum`);

  const networks = [
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      btnClass: 'bg-[#1877F2] hover:bg-[#166fe5] text-white'
    },
    {
      name: 'X / Twitter',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      btnClass: 'bg-stone-800 hover:bg-stone-700 border border-stone-600 text-white'
    },
    {
      name: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white'
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      btnClass: 'bg-[#0A66C2] hover:bg-[#0958a8] text-white'
    }
  ];

  useEffect(() => {
    setSelectedNetwork(null);
    setSecondsRemaining(0);
    setShareVerifiedReady(false);
  }, [itemId]);

  useEffect(() => {
    if (!selectedNetwork || secondsRemaining <= 0) {
      if (selectedNetwork && secondsRemaining === 0) {
        setShareVerifiedReady(true);
      }
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setShareVerifiedReady(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedNetwork, secondsRemaining]);

  const handleStartExternalShare = (networkName: string) => {
    setSelectedNetwork(networkName);
    setShareVerifiedReady(false);
    setSecondsRemaining(5);
  };

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-black/50 border border-sky-500/35 space-y-4 text-center">
      <div className="space-y-1">
        <div className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
          <Share2 className="w-3.5 h-3.5" />
          <span>Step 1: Share on a Social Network</span>
        </div>
        <p className="text-[11px] text-stone-300 leading-relaxed max-w-md mx-auto">
          Click any social button below to post your share in a new tab. Return here once shared to activate access.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {networks.map((net) => (
          <a
            key={net.name}
            href={net.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleStartExternalShare(net.name)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-md ${net.btnClass}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Share on {net.name}</span>
          </a>
        ))}
      </div>

      <div className="pt-3 border-t border-white/10 space-y-2.5">
        <div className="text-[11px] font-semibold text-stone-300 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#e5b36b]" />
          <span>Step 2: Verify Share Completion</span>
        </div>

        {!selectedNetwork ? (
          <p className="text-[11px] text-stone-400 italic">
            Waiting for you to share on Facebook, X, WhatsApp, or LinkedIn above...
          </p>
        ) : !shareVerifiedReady ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs font-medium">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Verifying your {selectedNetwork} share... ({secondsRemaining}s remaining)</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onVerifiedUnlock(itemId)}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs inline-flex items-center gap-2 shadow-lg transition-transform hover:scale-[1.02]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I Completed Sharing — Unlock Content Now</span>
          </button>
        )}
      </div>

      {onOpenVIPModal && (
        <div className="pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onOpenVIPModal}
            className="text-[11px] text-[#e5b36b] hover:text-[#f6e2bb] font-semibold inline-flex items-center gap-1"
          >
            <Crown className="w-3 h-3" />
            <span>Skip sharing & unlock the entire VIP Vault ($05.99/mo)</span>
          </button>
        </div>
      )}
    </div>
  );
};

interface ShareUnlockModalProps {
  target: ShareGateTarget | null;
  onClose: () => void;
  onVerifiedUnlock: (id: string) => void;
  onOpenVIPModal: () => void;
}

export const ShareUnlockModal: React.FC<ShareUnlockModalProps> = ({
  target,
  onClose,
  onVerifiedUnlock,
  onOpenVIPModal
}) => {
  if (!target) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#140d1e] border border-[#e5b36b]/40 rounded-2xl p-6 shadow-2xl space-y-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif-display font-bold text-white leading-snug">
                Verified Social Share Unlock
              </h3>
              <p className="text-[11px] text-stone-400 line-clamp-1">
                {target.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
            aria-label="Close share modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <ShareUnlockGatePanel
          itemId={target.id}
          itemTitle={target.title}
          shareUrl={target.shareUrl}
          onVerifiedUnlock={(id) => {
            onVerifiedUnlock(id);
            onClose();
          }}
          onOpenVIPModal={() => {
            onClose();
            onOpenVIPModal();
          }}
        />
      </div>
    </div>
  );
};
