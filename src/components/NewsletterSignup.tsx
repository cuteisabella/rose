import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import { submitNewsletterSignupToCloud } from '../firebase';

interface NewsletterSignupProps {
  onSuccessToast: (message: string) => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ onSuccessToast }) => {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!EMAIL_PATTERN.test(trimmed) || trimmed.length > 200) {
      setErrorMsg('Please enter a valid email address (for example, name@domain.com).');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await submitNewsletterSignupToCloud(trimmed, 'footer');
      setSubscribedEmail(trimmed);
      setEmail('');
      onSuccessToast('Subscribed! Welcome to Isabella’s private newsletter dispatches.');
    } catch (err) {
      const msg =
        err instanceof Error && err.message && !err.message.startsWith('{')
          ? err.message
          : 'Unable to save your subscription right now. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-b border-stone-800/80 pb-10 mb-10">
      <div className="rounded-2xl border border-white/10 bg-[#120d1a] p-6 md:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-xs text-[#e5b36b] font-medium">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span>Private Dispatches</span>
          </div>
          <h3 className="text-xl md:text-2xl font-serif-display font-semibold text-white">
            Receive Late-Night Notes &amp; Editorial Releases
          </h3>
          <p className="text-xs md:text-sm text-stone-400 leading-relaxed">
            Subscribe for new journal essays, style monographs, and private vault announcements delivered discreetly.
          </p>
        </div>

        <div className="w-full lg:w-auto lg:min-w-[400px] space-y-2">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <label htmlFor="footer-newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-newsletter-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Enter your email address"
              disabled={isSubmitting}
              aria-invalid={Boolean(errorMsg)}
              aria-describedby={errorMsg ? 'footer-newsletter-error' : undefined}
              className="flex-1 min-w-0 bg-[#09080d] border border-stone-700/80 focus:border-[#e5b36b] rounded-xl px-4 py-3 text-xs md:text-sm text-white placeholder:text-stone-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-3 rounded-xl gorgeous-btn-gradient text-stone-950 font-semibold text-xs inline-flex items-center justify-center gap-1.5 hover:opacity-95 disabled:opacity-60 transition-opacity whitespace-nowrap shrink-0"
            >
              <span>{isSubmitting ? 'Subscribing...' : 'Subscribe'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {errorMsg && (
            <p id="footer-newsletter-error" role="alert" className="text-xs text-rose-400">
              {errorMsg}
            </p>
          )}

          {subscribedEmail && !errorMsg && (
            <div
              key={subscribedEmail}
              role="status"
              aria-live="polite"
              className="animate-toast-enter mt-2 px-3.5 py-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/35 text-xs text-emerald-300 flex items-center gap-2 shadow-lg origin-left"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Confirmed for <strong className="font-medium text-emerald-200">{subscribedEmail}</strong>. Watch your inbox for our next dispatch.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
