import React, { useState } from 'react';
import { 
  Lock, 
  Key, 
  ArrowRight, 
  ShieldCheck, 
  X, 
  AlertCircle 
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: () => void;
  correctPasscode: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  correctPasscode
}) => {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === correctPasscode.trim()) {
      setErrorMsg('');
      setPasscode('');
      onSuccessLogin();
    } else {
      setErrorMsg('Incorrect passcode. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#110f17] border border-stone-800 rounded-2xl p-6 shadow-2xl text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-2 rounded-lg hover:bg-stone-800/60 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#c99757]/15 border border-[#c99757]/30 flex items-center justify-center text-[#c99757]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-serif-display font-semibold text-white">
              Private Admin Portal
            </h3>
            <p className="text-xs text-stone-400">
              Restricted access. Passcode verification required.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              Enter Admin Security Passcode
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full bg-[#09080d] border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-[#c99757] font-mono tracking-wider"
                autoFocus
                required
              />
              <Key className="w-4 h-4 text-stone-500 absolute right-3.5 top-3" />
            </div>
            {errorMsg && (
              <p className="text-rose-400 text-xs mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#c99757] hover:bg-[#d6a567] text-stone-950 flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            <span>Unlock Admin Panel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            AES Encrypted Storage
          </span>
          <span>Access via secret #admin</span>
        </div>
      </div>
    </div>
  );
};
