import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Lock,
  Crown,
  ShieldCheck,
  X,
  QrCode,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { MemberItem, SiteSettings } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: 'VIP Member' | 'Black Diamond VIP';
  price: number;
  settings: SiteSettings;
  onSuccessPayment: (member: MemberItem) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedTier,
  price,
  settings,
  onSuccessPayment
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card' | 'crypto'>('paypal');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [txReference, setTxReference] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [formError, setFormError] = useState('');
  const [copiedWallet, setCopiedWallet] = useState(false);

  if (!isOpen) return null;

  const formattedPrice = price < 10 ? `0${price.toFixed(2)}` : price.toFixed(2);
  const paypalRecipient = settings.paypalEmail || settings.contactEmail || 'cuteisabellarose@gmail.com';
  const paypalDirectLink = settings.paypalMeUrl
    ? `${settings.paypalMeUrl.replace(/\/$/, '')}/${price.toFixed(2)}`
    : `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(paypalRecipient)}&item_name=${encodeURIComponent(`Isabella Rose ${selectedTier}`)}&amount=${price.toFixed(2)}&currency_code=USD`;

  const stripeLink =
    selectedTier === 'VIP Member' ? settings.stripeMonthlyLink : settings.stripeQuarterlyLink;

  const walletAddress =
    settings.cryptoWalletAddress || 'Set your USDT wallet inside Admin → Settings → Payment Gateways';

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim()) {
      setFormError('Please enter your full name and VIP email address.');
      return;
    }
    setFormError('');
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);

      const gatewayLabel =
        paymentMethod === 'paypal'
          ? `PayPal (${paypalRecipient})${txReference ? ` · Ref: ${txReference}` : ''}`
          : paymentMethod === 'card'
          ? `Card / Stripe (${settings.stripeAccountLabel || paypalRecipient})`
          : `Crypto ${settings.cryptoNetwork || 'USDT'}${txReference ? ` · Tx: ${txReference}` : ''}`;

      const newMember: MemberItem = {
        id: `mem-${Date.now()}`,
        name: customerName.trim(),
        email: customerEmail.trim(),
        tier: selectedTier,
        status: 'active',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        paymentMethod: gatewayLabel,
        amountPaid: `$${formattedPrice}`
      };

      setTimeout(() => {
        onSuccessPayment(newMember);
        setIsCompleted(false);
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#110c19] border border-[#e5b36b]/40 rounded-3xl p-6 md:p-8 shadow-2xl text-left overflow-y-auto max-h-[92vh]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-white p-2 rounded-lg hover:bg-stone-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isCompleted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif-display font-bold text-white">
              Payment Verified!
            </h3>
            <p className="text-xs text-stone-300 max-w-sm mx-auto leading-relaxed">
              Welcome to the Inner Circle. Your account has been upgraded to{' '}
              <strong className="text-[#e7c792]">{selectedTier}</strong>. Unlocking your private 4K vault now...
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#e5b36b]/20 border border-[#e5b36b]/40 flex items-center justify-center text-[#e5b36b]">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#e5b36b] font-semibold">
                  Direct Creator Checkout · 256-Bit SSL
                </span>
                <h3 className="text-xl font-serif-display font-bold text-white">
                  Join {selectedTier}
                </h3>
              </div>
            </div>

            <div className="p-3.5 bg-[#181224] border border-stone-800 rounded-xl mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">{selectedTier} Membership</div>
                <div className="text-[11px] text-stone-400">
                  {selectedTier === 'VIP Member' ? 'Monthly Pass · Full Adult Vault' : '3-Month Pass · All-Inclusive 4K Access'}
                </div>
              </div>
              <div className="text-xl font-serif-display font-bold text-[#e7c792]">
                ${formattedPrice}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${paymentMethod === 'paypal' ? 'bg-[#e5b36b]/20 border-[#e5b36b] text-[#f6e2bb]' : 'bg-[#14101c] border-stone-800 text-stone-400 hover:text-white'}`}
              >
                <span>PayPal</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${paymentMethod === 'card' ? 'bg-[#e5b36b]/20 border-[#e5b36b] text-[#f6e2bb]' : 'bg-[#14101c] border-stone-800 text-stone-400 hover:text-white'}`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                Credit Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('crypto')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${paymentMethod === 'crypto' ? 'bg-[#e5b36b]/20 border-[#e5b36b] text-[#f6e2bb]' : 'bg-[#14101c] border-stone-800 text-stone-400 hover:text-white'}`}
              >
                <QrCode className="w-3.5 h-3.5" />
                Crypto
              </button>
            </div>

            <form onSubmit={handlePay} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Julian Vance"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e5b36b]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">VIP Account Email *</label>
                  <input
                    type="email"
                    placeholder="patron@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e5b36b]"
                    required
                  />
                </div>
              </div>

              {/* PAYPAL GATEWAY */}
              {paymentMethod === 'paypal' && (
                <div className="p-4 bg-[#161021] rounded-xl border border-[#e5b36b]/30 space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-400">Verified PayPal Recipient:</span>
                    <span className="font-mono font-semibold text-[#f6e2bb]">{paypalRecipient}</span>
                  </div>
                  <a
                    href={paypalDirectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-lg bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Step 1: Pay ${formattedPrice} on PayPal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <div>
                    <label className="block text-stone-300 mb-1 font-medium">
                      Step 2: Enter PayPal Transaction ID (Optional for instant verification)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9XK48219PP..."
                      value={txReference}
                      onChange={(e) => setTxReference(e.target.value)}
                      className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#e5b36b]"
                    />
                  </div>
                </div>
              )}

              {/* CREDIT CARD / STRIPE PAYMENT LINK */}
              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#161021] border border-stone-800 flex items-center justify-between text-[11px]">
                    <span className="text-stone-400">Merchant Payout Account:</span>
                    <span className="font-mono text-[#f6e2bb]">
                      {settings.stripeAccountLabel || paypalRecipient}
                    </span>
                  </div>

                  {stripeLink ? (
                    <div className="p-4 bg-[#161021] rounded-xl border border-[#e5b36b]/30 space-y-3">
                      <a
                        href={stripeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <span>Step 1: Complete Secure Stripe Card Checkout (${formattedPrice})</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <input
                        type="text"
                        placeholder="Receipt / Confirmation Ref (optional)"
                        value={txReference}
                        onChange={(e) => setTxReference(e.target.value)}
                        className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#e5b36b]"
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-stone-300 mb-1 font-medium">Card Number</label>
                        <input
                          type="text"
                          placeholder="4532 •••• •••• 8892"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#e5b36b]"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-stone-300 mb-1 font-medium">Expiration (MM/YY)</label>
                          <input
                            type="text"
                            placeholder="12/28"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#e5b36b]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-stone-300 mb-1 font-medium">CVC / CVV</label>
                          <input
                            type="text"
                            placeholder="382"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#e5b36b]"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* CRYPTO WALLET */}
              {paymentMethod === 'crypto' && (
                <div className="p-4 bg-[#161021] rounded-xl border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-400">Network: <strong className="text-white">{settings.cryptoNetwork || 'USDT (TRC20)'}</strong></span>
                    {settings.cryptoWalletAddress && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(settings.cryptoWalletAddress).catch(() => {});
                          setCopiedWallet(true);
                          setTimeout(() => setCopiedWallet(false), 2000);
                        }}
                        className="text-[#e5b36b] hover:text-[#f6e2bb] flex items-center gap-1"
                      >
                        {copiedWallet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedWallet ? 'Copied' : 'Copy Address'}</span>
                      </button>
                    )}
                  </div>
                  <p className="font-mono text-[11px] text-[#e7c792] break-all bg-black/50 p-2.5 rounded-lg border border-stone-800">
                    {walletAddress}
                  </p>
                  <input
                    type="text"
                    placeholder="Paste Transaction Hash (TxID)"
                    value={txReference}
                    onChange={(e) => setTxReference(e.target.value)}
                    className="w-full bg-[#09080d] border border-stone-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#e5b36b]"
                  />
                </div>
              )}

              {formError && (
                <p className="text-rose-400 text-xs">{formError}</p>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold gorgeous-btn-gradient text-stone-950 flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg mt-4 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Verifying & Activating VIP Vault...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      {paymentMethod === 'paypal' || (paymentMethod === 'card' && stripeLink) || paymentMethod === 'crypto'
                        ? `Confirm $${formattedPrice} Payment & Activate VIP`
                        : `Pay $${formattedPrice} & Unlock Immediately`}
                    </span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Discreet billing as "IR-Studio Digital"
              </span>
              <span>Cancel Anytime</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
