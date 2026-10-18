import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Phone, KeyRound, ShieldCheck, AlertCircle, CheckCircle2, ArrowRight, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPhone: string) => void;
}

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { userProfile, user, sendPhoneVerificationEmailOTP, verifyPhoneVerificationEmailOTP } = useAuth();
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [dispatchedPhone, setDispatchedPhone] = useState<string | null>(null);
  const [targetEmail, setTargetEmail] = useState<string>('');
  const [step, setStep] = useState<'enter-phone' | 'enter-otp'>('enter-phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Initialize email from active user profile / auth user
  React.useEffect(() => {
    const email = userProfile?.email || user?.email || '';
    setTargetEmail(email);
  }, [userProfile, user, isOpen]);

  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  if (!isOpen) return null;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)');
      return;
    }
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('A valid email address is required to receive the verification OTP.');
      return;
    }

    const fullPhoneNumber = `${countryCode}${cleanPhone.slice(-10)}`;
    setLoading(true);
    setError(null);

    try {
      // Send 6-digit verification code directly to the user's email address
      await sendPhoneVerificationEmailOTP(cleanEmail, fullPhoneNumber);
      setDispatchedPhone(fullPhoneNumber);
      setStep('enter-otp');
      setResendTimer(30);
      setSuccessMsg(`Verification code sent to your email (${cleanEmail})! Valid for 10 minutes.`);
    } catch (err: any) {
      console.error('Phone update send OTP to email error:', err);
      setError(err.message || 'Failed to dispatch verification code to email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }
    const cleanEmail = targetEmail.trim().toLowerCase();
    const fullPhoneNumber = dispatchedPhone || `${countryCode}${phoneNumber.trim().replace(/\D/g, '')}`;

    setLoading(true);
    setError(null);

    try {
      await verifyPhoneVerificationEmailOTP(cleanEmail, otpCode.trim(), fullPhoneNumber);
      onSuccess(fullPhoneNumber);
      onClose();
    } catch (err: any) {
      console.error('Verify error:', err);
      setError(err.message || 'Invalid verification OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        id="phone-otp-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 text-zinc-900 dark:text-zinc-100"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
              Verify & Link Mobile Number
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Verification code is delivered to your registered email
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 'enter-phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            {/* Target Email where OTP code is delivered */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Receive Verification OTP at Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Verification OTP code will be sent to this email address.</span>
              </p>
            </div>

            {/* Mobile Number to be linked and verified */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Mobile Number to Verify & Link
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-28 px-2.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="+91">🇮🇳 +91 (IN)</option>
                  <option value="+1">🇺🇸 +1 (US)</option>
                  <option value="+44">🇬🇧 +44 (UK)</option>
                  <option value="+971">🇦🇪 +971 (UAE)</option>
                  <option value="+61">🇦🇺 +61 (AU)</option>
                  <option value="+65">🇸🇬 +65 (SG)</option>
                  <option value="+49">🇩🇪 +49 (DE)</option>
                </select>

                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Enter your 10-digit mobile number for order delivery coordination.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !targetEmail.trim()}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Verification Code to Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndSave} className="space-y-4" autoComplete="off">
            {/* Status card indicating OTP sent to email */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-xs text-emerald-900 dark:text-emerald-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                  <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>OTP Sent to Email</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 font-extrabold text-emerald-900 dark:text-emerald-100">
                  DELIVERED
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                A 6-digit verification code has been sent to{' '}
                <strong className="font-mono text-zinc-900 dark:text-white underline decoration-emerald-500">{targetEmail}</strong>{' '}
                to verify mobile number <strong className="font-mono text-zinc-900 dark:text-white">{dispatchedPhone}</strong>.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Enter 6-Digit Email Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep('enter-phone');
                    setOtpCode('');
                  }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                >
                  Change Details
                </button>
              </div>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoComplete="off"
                  placeholder="••••••"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-base font-mono font-bold tracking-widest text-center focus:ring-2 focus:ring-emerald-500/40 text-zinc-900 dark:text-white"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Didn't receive email code?</span>
              {resendTimer > 0 ? (
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  Resend in {resendTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  Resend Code
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Code & Link Phone</span>
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
