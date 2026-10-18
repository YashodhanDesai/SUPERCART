import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ShoppingBag,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
  Send,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConfirmationResult } from 'firebase/auth';

export const AuthModal: React.FC = () => {
  const { 
    authModalOpen, 
    closeAuthModal, 
    authModalMode, 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail,
    resendVerificationEmail,
    verifyEmailOTP,
    sendPasswordReset,
    sendPhoneOTP,
    verifyPhoneOTP,
    sendPhoneVerificationEmailOTP,
    verifyPhoneVerificationEmailOTP,
    error,
    clearError
  } = useAuth();

  // Mode: 'signin' | 'signup' | 'phone' | 'forgot' | 'verify-email' | 'forgot-sent'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'phone' | 'forgot' | 'verify-email' | 'forgot-sent'>('signin');

  // Form states
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState(''); // Email address or phone number
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  
  // Phone OTP states (Country code strictly locked to +91 India)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNotificationEmail, setPhoneNotificationEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [dispatchedPhone, setDispatchedPhone] = useState<string | null>(null);
  const [dispatchedEmail, setDispatchedEmail] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // General loading & local feedback
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [popupBlockedUrl, setPopupBlockedUrl] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [resendEmailTimer, setResendEmailTimer] = useState(0);
  const [resendEmailSuccess, setResendEmailSuccess] = useState<string | null>(null);

  // Sync modal state whenever opened
  useEffect(() => {
    if (authModalOpen) {
      if (authModalMode === 'phone') {
        setAuthMode('phone');
      } else if (authModalMode === 'signup') {
        setAuthMode('signup');
      } else if (authModalMode === 'forgot') {
        setAuthMode('forgot');
      } else if (authModalMode === 'verify-email') {
        setAuthMode('verify-email');
      } else {
        setAuthMode('signin');
      }

      setName('');
      setIdentifier('');
      setPassword('');
      setPhoneNumber('');
      setOtpCode('');
      setOtpSent(false);
      setDispatchedPhone(null);
      setConfirmationResult(null);
      setLocalSuccess(null);
      setShowPassword(false);
      clearError();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeAuthModal();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [authModalOpen, authModalMode]);

  // Resend OTP countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Resend Email countdown
  useEffect(() => {
    if (resendEmailTimer > 0) {
      const timer = setTimeout(() => setResendEmailTimer(resendEmailTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendEmailTimer]);

  const handleResendEmail = async () => {
    const targetEmail = registeredEmail || parseIdentifierToEmail(identifier);
    if (!targetEmail) {
      return;
    }
    setLoading(true);
    clearError();
    setResendEmailSuccess(null);
    try {
      await resendVerificationEmail(targetEmail, password);
      setResendEmailSuccess(`Verification link successfully resent to ${targetEmail}! Please check your Inbox and Spam folder.`);
      setResendEmailTimer(60);
    } catch (err: any) {
      console.warn('Resend email error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailVerificationCode.trim()) return;
    const targetEmail = registeredEmail || parseIdentifierToEmail(identifier);
    if (!targetEmail) return;

    setLoading(true);
    clearError();
    try {
      await verifyEmailOTP(targetEmail, emailVerificationCode.trim());
      setLocalSuccess('Email verified successfully! You can now sign in.');
      setTimeout(() => {
        setAuthMode('signin');
        setLocalSuccess(null);
      }, 1500);
    } catch (err: any) {
      console.warn('Verify code error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!authModalOpen) return null;

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleCopyDomain = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentDomain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 3000);
    }
  };

  // 1. Google Sign In via Supabase OAuth (with dynamic origin redirect and error handling)
  const handleGoogle = async () => {
    setGoogleLoading(true);
    setLoading(true);
    setLocalSuccess(null);
    setPopupBlockedUrl(null);
    clearError();
    try {
      await signInWithGoogle();
      setLocalSuccess('Redirecting to Google authentication...');
    } catch (err: any) {
      console.error('Continue with Google error in AuthModal:', err);
      if (err?.isPopupBlocked && err?.url) {
        setPopupBlockedUrl(err.url);
      }
    } finally {
      setGoogleLoading(false);
      setLoading(false);
    }
  };

  // Helper to parse if the identifier is a 10-digit mobile number or standard email
  const parseIdentifierToEmail = (raw: string): string => {
    const clean = raw.trim();
    const digitsOnly = clean.replace(/\D/g, '');
    // If user provided a 10-digit number or +91 number without '@'
    if (!clean.includes('@') && (digitsOnly.length === 10 || (digitsOnly.length === 12 && digitsOnly.startsWith('91')))) {
      const last10 = digitsOnly.slice(-10);
      return `${last10}@phone.supercart.com`;
    }
    return clean;
  };

  // 2. Email/Phone Submit (Sign In or Sign Up)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalSuccess(null);
    clearError();

    try {
      const parsedEmail = parseIdentifierToEmail(identifier);
      if (!parsedEmail) {
        throw new Error('Please enter a valid email address or 10-digit phone number');
      }

      if (authMode === 'signin') {
        await signInWithEmail(parsedEmail, password);
      } else if (authMode === 'signup') {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        await signUpWithEmail(name.trim(), parsedEmail, password);
        setRegisteredEmail(parsedEmail);
        // Switch to dedicated Verification Screen
        setAuthMode('verify-email');
      }
    } catch (err) {
      // Handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  // 3. Forgot Password Submit
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = parseIdentifierToEmail(resetEmail || identifier);
    if (!targetEmail) return;
    setLoading(true);
    clearError();
    try {
      await sendPasswordReset(targetEmail);
      setRegisteredEmail(targetEmail);
      setAuthMode('forgot-sent');
    } catch (err) {
      // Handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  // 4. Phone OTP Send (Dispatches OTP code directly to user email)
  const handleSendPhoneOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = (phoneNumber || identifier).trim().replace(/\D/g, '').slice(-10);
    if (!cleanDigits || cleanDigits.length !== 10) {
      return;
    }
    setLoading(true);
    clearError();
    setLocalSuccess(null);

    const fullFormatted = `+91${cleanDigits}`;
    const targetEmail = phoneNotificationEmail.trim().toLowerCase() || `${cleanDigits}@phone.supercart.com`;

    try {
      if (phoneNotificationEmail.trim() && phoneNotificationEmail.includes('@')) {
        await sendPhoneVerificationEmailOTP(targetEmail, fullFormatted);
        setDispatchedEmail(targetEmail);
        setOtpSent(true);
        setDispatchedPhone(fullFormatted);
        setResendTimer(30);
        setLocalSuccess(`OTP verification code dispatched to ${targetEmail} for mobile ${fullFormatted}! Valid for 10 minutes.`);
      } else {
        const confirmation = await sendPhoneOTP(fullFormatted, 'recaptcha-auth-container');
        setConfirmationResult(confirmation);
        setOtpSent(true);
        setDispatchedPhone(fullFormatted);
        setResendTimer(30);
        setLocalSuccess(`OTP verification code dispatched to ${fullFormatted}! Valid for 30 seconds.`);
      }
    } catch (err: any) {
      console.error('OTP send failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // 5. Phone OTP Verify
  const handleVerifyPhoneOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    setLoading(true);
    clearError();
    try {
      if (dispatchedEmail) {
        const fullFormatted = dispatchedPhone || `+91${(phoneNumber || identifier).trim().replace(/\D/g, '').slice(-10)}`;
        await verifyPhoneVerificationEmailOTP(dispatchedEmail, otpCode.trim(), fullFormatted);
        closeAuthModal();
      } else if (confirmationResult) {
        await verifyPhoneOTP(confirmationResult, otpCode.trim());
      }
    } catch (err) {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Access for effortless testing
  const handleDemoSignIn = async (role: 'user' | 'admin') => {
    setLoading(true);
    clearError();
    setLocalSuccess(null);
    try {
      if (role === 'admin') {
        const adminEmail = 'admin@supercart.com';
        const adminPass = 'SuperAdmin2026!';
        try {
          await signInWithEmail(adminEmail, adminPass);
        } catch (signInErr: any) {
          if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
            await signUpWithEmail('SuperCart Admin', adminEmail, adminPass);
            await signInWithEmail(adminEmail, adminPass);
          } else {
            throw signInErr;
          }
        }
      } else {
        const demoEmail = 'shopper.demo@supercart.com';
        const demoPass = 'DemoShopper2026!';
        try {
          await signInWithEmail(demoEmail, demoPass);
        } catch (signInErr: any) {
          if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
            await signUpWithEmail('Sarah Jenkins', demoEmail, demoPass);
            await signInWithEmail(demoEmail, demoPass);
          } else {
            throw signInErr;
          }
        }
      }
    } catch (e) {
      console.warn('Demo login notice:', e);
    } finally {
      setLoading(false);
    }
  };

  const isDomainError = error?.toLowerCase().includes('domain') || error?.toLowerCase().includes('unauthorized-domain');

  return (
    <div 
      id="supercart-auth-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeAuthModal();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-md overflow-y-auto"
    >
      <div id="recaptcha-auth-container" />

      <motion.div
        id="supercart-auth-card"
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[28px] shadow-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 overflow-hidden text-zinc-900 dark:text-zinc-100 my-auto"
      >
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        {/* Close Button */}
        <button
          id="auth-modal-close-btn"
          type="button"
          onClick={closeAuthModal}
          aria-label="Close modal"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-90 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ========================================================================= */}
        {/* SCREEN 1: DEDICATED EMAIL VERIFICATION SCREEN                             */}
        {/* ========================================================================= */}
        {/* SCREEN 1: CONFIRMATION LINK VERIFICATION SCREEN                           */}
        {/* ========================================================================= */}
        {authMode === 'verify-email' && (
          <div id="verification-screen" className="text-center py-2 space-y-5">
            {/* Glowing Email Envelope Badge */}
            <div className="relative w-16 h-16 mx-auto rounded-3xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xl shadow-emerald-500/15">
              <Mail className="w-8 h-8 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                Confirm Your Email
              </h3>
              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 max-w-sm mx-auto">
                We've sent a secure activation link to:
              </p>
              <div className="inline-block px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 font-mono font-bold text-xs text-emerald-800 dark:text-emerald-300">
                {registeredEmail || identifier || 'your email'}
              </div>
            </div>

            {/* Step-by-Step Confirmation Instructions Card */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850/70 border border-zinc-200 dark:border-zinc-800 text-left space-y-2.5 text-xs">
              <p className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[10px]">
                How to activate your account:
              </p>
              <div className="space-y-2 text-zinc-600 dark:text-zinc-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Open your email inbox (check Spam or Junk folder if not found).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
                    2
                  </span>
                  <span>Click the <strong className="text-emerald-600 dark:text-emerald-400">"Confirm your mail"</strong> activation link.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
                    3
                  </span>
                  <span>You'll be instantly verified and redirected back into SuperCart!</span>
                </div>
              </div>

              {/* Direct Mail Webmail Shortcuts */}
              <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center gap-2">
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-3 rounded-xl bg-white dark:bg-zinc-750 border border-zinc-200 dark:border-zinc-700 text-[11px] font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition flex items-center justify-center gap-1.5"
                >
                  <span>Open Gmail</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
                <a
                  href="https://outlook.live.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-3 rounded-xl bg-white dark:bg-zinc-750 border border-zinc-200 dark:border-zinc-700 text-[11px] font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition flex items-center justify-center gap-1.5"
                >
                  <span>Open Outlook</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              </div>
            </div>

            {/* Primary Action Button: Proceed to Sign In once clicked */}
            <button
              id="verification-screen-signin-btn"
              type="button"
              onClick={() => {
                setAuthMode('signin');
                clearError();
              }}
              className="w-full py-3.5 px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>I've Clicked the Link — Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Resend Confirmation Link Option */}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 text-left">
              {resendEmailTimer > 0 ? (
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Confirmation link dispatched. Waiting for delivery...</span>
                  </div>
                  <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    {resendEmailTimer}s
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">
                      Didn't receive the email?
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      Ready to Resend
                    </span>
                  </div>
                  <p className="text-[11px]">Check your Spam folder, or click below to dispatch a fresh confirmation link.</p>
                  
                  {resendEmailSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{resendEmailSuccess}</span>
                    </div>
                  )}

                  <button
                    id="resend-verification-email-btn"
                    type="button"
                    disabled={loading}
                    onClick={handleResendEmail}
                    className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-100 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-650 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
                    <span>Resend Confirmation Link</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 2: FORGOT PASSWORD CONFIRMATION SCREEN                             */}
        {/* ========================================================================= */}
        {authMode === 'forgot-sent' && (
          <div id="forgot-password-confirmation-screen" className="text-center py-4 space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
              <Send className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                Password Reset Link Sent
              </h3>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 max-w-xs mx-auto">
                We sent you a password change link to{' '}
                <span className="font-bold text-zinc-900 dark:text-white underline decoration-amber-500 underline-offset-2">
                  {registeredEmail || resetEmail || identifier || 'your email'}
                </span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400">
              Click the link in the email to set a new password, then return here to log in.
            </div>

            <button
              id="forgot-sent-signin-btn"
              type="button"
              onClick={() => {
                setAuthMode('signin');
                clearError();
              }}
              className="w-full py-3.5 px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <span>Back to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 3: FORGOT PASSWORD REQUEST FORM                                    */}
        {/* ========================================================================= */}
        {authMode === 'forgot' && (
          <div id="forgot-password-request-screen" className="space-y-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">
                  Reset Password
                </h3>
                <p className="text-xs text-zinc-500">
                  Enter your email address to receive a recovery link
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Email address / Phone number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-3.5" />
                  <input
                    id="input-reset-email"
                    type="text"
                    required
                    placeholder="name@example.com"
                    value={resetEmail || identifier}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    autoFocus
                  />
                </div>
              </div>

              <button
                id="get-reset-link-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN AUTH FLOW (SIGN IN / CREATE ACCOUNT / PHONE OTP)                      */}
        {/* ========================================================================= */}
        {(authMode === 'signin' || authMode === 'signup' || authMode === 'phone') && (
          <div className="space-y-5">
            {/* Header Branding */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 mb-1">
                <ShoppingBag className="w-6 h-6 text-amber-300" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                {authMode === 'signup' ? 'Create SuperCart Account' : authMode === 'phone' ? 'Phone OTP Verification' : 'Welcome to SuperCart'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                15-Minute Grocery Delivery • Fresh Daily
              </p>
            </div>

            {/* Notifications / Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.96 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.96 }}
                  className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-100 shadow-sm space-y-2"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="leading-relaxed font-semibold">{error}</p>
                      {authMode === 'signin' && error.toLowerCase().includes('exist') && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('signup');
                            clearError();
                          }}
                          className="inline-flex items-center gap-1 font-bold text-rose-700 dark:text-rose-300 hover:underline pt-0.5"
                        >
                          <span>Click here to Create an account</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isDomainError && currentDomain && (
                    <div className="mt-2 pt-2 border-t border-rose-200/80 dark:border-rose-800/60 flex items-center justify-between gap-2">
                      <span className="truncate font-mono text-[10px] bg-white/80 dark:bg-black/50 px-2 py-1 rounded border border-rose-300 dark:border-rose-700">
                        {currentDomain}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyDomain}
                        className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-bold"
                      >
                        {copiedDomain ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedDomain ? 'Copied' : 'Copy Domain'}</span>
                      </button>
                    </div>
                  )}

                  {/* If user could not receive email after 1 time (sign-in unverified error), show option here */}
                  {error && error.toLowerCase().includes('verify') && (
                    <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-rose-700 dark:text-rose-300">
                        Didn't receive email after 1st attempt?
                      </span>
                      <button
                        type="button"
                        onClick={handleResendEmail}
                        disabled={loading || resendEmailTimer > 0}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition shadow-2xs"
                      >
                        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                        <span>{resendEmailTimer > 0 ? `Resend in ${resendEmailTimer}s` : 'Resend Email'}</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {(localSuccess || resendEmailSuccess) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{resendEmailSuccess || localSuccess}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* =================================================================== */}
            {/* EMAIL / PHONE NUMBER AUTH FORM (SIGN IN OR SIGN UP)                 */}
            {/* =================================================================== */}
            {(authMode === 'signin' || authMode === 'signup') && (
              <form onSubmit={handleAuthSubmit} className="space-y-3.5" autoComplete="off">
                {/* Full Name for Sign Up */}
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-400 absolute left-4 top-3.5" />
                      <input
                        id="input-signup-name"
                        type="text"
                        required
                        autoComplete="off"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                      />
                    </div>
                  </div>
                )}

                {/* Email address / Phone number Input */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Email address / Phone number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-3.5" />
                    <input
                      id="input-auth-email"
                      type="text"
                      required
                      autoComplete="off"
                      placeholder="name@example.com or 10-digit mobile"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                      Password
                    </label>
                    {authMode === 'signin' && (
                      <button
                        id="forgot-password-link"
                        type="button"
                        onClick={() => {
                          setResetEmail(identifier);
                          setAuthMode('forgot');
                          clearError();
                        }}
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-3.5" />
                    <input
                      id="input-auth-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="off"
                      minLength={6}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  id="submit-email-auth-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{authMode === 'signin' ? 'Sign In to SuperCart' : 'Create SuperCart Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Divider below Password / Submit button */}
                <div className="relative flex items-center justify-center py-1">
                  <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
                  <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                    or
                  </span>
                </div>

                {/* Sign in with Mobile OTP Button (styled similarly to Continue with Google) */}
                {authMode === 'signin' && (
                  <button
                    id="switch-to-phone-otp-btn"
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      const digits = identifier.replace(/\D/g, '').slice(-10);
                      if (digits.length === 10 && !identifier.includes('@')) {
                        setPhoneNumber(digits);
                      } else {
                        setPhoneNumber('');
                      }
                      setAuthMode('phone');
                      clearError();
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-white font-bold text-sm flex items-center justify-center gap-3 transition shadow-sm border border-zinc-200 dark:border-zinc-700 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Sign in with Mobile OTP (+91)</span>
                  </button>
                )}

                {/* Popup Blocked Warning & Direct Link Fallback */}
                {popupBlockedUrl && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-amber-300">Popup window was blocked</p>
                      <p className="mt-0.5 text-zinc-300 text-xs leading-relaxed">
                        Your browser blocked the Google sign-in popup. Click the button below to authorize Google in a new window:
                      </p>
                      <a
                        href={popupBlockedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm"
                      >
                        <span>Open Google Sign-In</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Continue with Google below password & submit */}
                <button
                  id="google-signin-btn"
                  type="button"
                  disabled={loading || googleLoading}
                  onClick={handleGoogle}
                  className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-white font-bold text-sm flex items-center justify-center gap-3 transition shadow-sm border border-zinc-200 dark:border-zinc-700 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {googleLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-500 shrink-0" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                  )}
                  <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
                </button>

                {/* BOTTOM PROMPT AS REQUESTED */}
                <div className="pt-2 text-center">
                  {authMode === 'signin' ? (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Don't have an account?{' '}
                      <button
                        id="switch-to-signup-bottom-btn"
                        type="button"
                        onClick={() => {
                          setAuthMode('signup');
                          clearError();
                        }}
                        className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                      >
                        Create an account
                      </button>
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Already have an account?{' '}
                      <button
                        id="switch-to-signin-bottom-btn"
                        type="button"
                        onClick={() => {
                          setAuthMode('signin');
                          clearError();
                        }}
                        className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                      >
                        Sign in
                      </button>
                    </p>
                  )}
                </div>
              </form>
            )}

            {/* =================================================================== */}
            {/* PHONE NUMBER AUTH (STRICT +91 INDIA OTP)                            */}
            {/* =================================================================== */}
            {authMode === 'phone' && (
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendPhoneOTP} className="space-y-3.5" autoComplete="off">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                        India Mobile Number to Verify
                      </label>
                      <div className="flex gap-2">
                        {/* Strictly locked +91 badge */}
                        <div 
                          id="locked-country-code-badge"
                          className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-black text-zinc-900 dark:text-white shrink-0 select-none shadow-sm"
                          title="Locked to India (+91)"
                        >
                          <span className="text-base leading-none">🇮🇳</span>
                          <span>+91</span>
                        </div>

                        {/* 10-Digit Phone Input */}
                        <div className="relative flex-1">
                          <Phone className="w-4 h-4 text-zinc-400 absolute left-4 top-3.5" />
                          <input
                            id="input-phone-number"
                            type="tel"
                            inputMode="numeric"
                            maxLength={16}
                            required
                            autoComplete="off"
                            placeholder="e.g. 9876543210"
                            value={phoneNumber}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length > 10 && val.startsWith('91')) {
                                val = val.slice(2);
                              }
                              if (val.length === 11 && val.startsWith('0')) {
                                val = val.slice(1);
                              }
                              setPhoneNumber(val.slice(0, 10));
                            }}
                            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 text-sm font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="flex justify-end mt-1">
                        <span className="text-[10px] font-mono text-zinc-400">
                          {phoneNumber.length}/10 digits {phoneNumber.length === 10 ? '✓' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Email destination for OTP code */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                        Receive Verification Code At Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-3.5" />
                        <input
                          id="input-phone-email-dest"
                          type="email"
                          required
                          placeholder="your.email@example.com"
                          value={phoneNotificationEmail}
                          onChange={(e) => setPhoneNotificationEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                        />
                      </div>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 ml-1 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>The 6-digit verification code will be sent to this email address.</span>
                      </p>
                    </div>

                    <button
                      id="send-otp-btn"
                      type="submit"
                      disabled={loading || phoneNumber.replace(/\D/g, '').length !== 10}
                      className="w-full py-3.5 px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Send OTP Code</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Google Sign In option in Phone mode too */}
                    <div className="relative flex items-center justify-center py-1">
                      <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
                      <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                        or
                      </span>
                    </div>

                    <button
                      id="google-signin-btn-phone-view"
                      type="button"
                      disabled={loading || googleLoading}
                      onClick={handleGoogle}
                      className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-white font-bold text-sm flex items-center justify-center gap-3 transition shadow-sm border border-zinc-200 dark:border-zinc-700 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                    >
                      {googleLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-500 shrink-0" />
                      ) : (
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                          />
                        </svg>
                      )}
                      <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
                    </button>

                    <div className="pt-2 text-center space-y-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signin');
                          clearError();
                        }}
                        className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        Sign in with Password instead
                      </button>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('signup');
                            clearError();
                          }}
                          className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Create an account
                        </button>
                      </p>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyPhoneOTP} className="space-y-4" autoComplete="off">
                    {/* Live Dispatch Status Card */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200 space-y-1.5">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                          {dispatchedEmail ? <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                          <span>{dispatchedEmail ? 'OTP Dispatched to Email' : 'OTP Dispatched via SMS'}</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 font-extrabold text-emerald-900 dark:text-emerald-100">
                          LIVE
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                        {dispatchedEmail ? (
                          <>
                            A 6-digit verification code was sent to <strong className="text-zinc-900 dark:text-white font-mono">{dispatchedEmail}</strong> for mobile number <strong className="text-zinc-900 dark:text-white font-mono">{dispatchedPhone}</strong>.
                          </>
                        ) : (
                          <>
                            A 6-digit verification code was sent to <strong className="text-zinc-900 dark:text-white font-mono">{dispatchedPhone}</strong>. It will reach your mobile number within 30 seconds.
                          </>
                        )}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                          {dispatchedEmail ? 'Enter 6-Digit Email Code' : 'Enter 6-Digit SMS OTP'}
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpCode('');
                          }}
                          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Change Details
                        </button>
                      </div>

                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-zinc-400 absolute left-4 top-3.5" />
                        <input
                          id="input-phone-otp"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          required
                          autoComplete="off"
                          placeholder="••••••"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-center font-mono text-lg font-black tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-zinc-900 dark:text-white"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
                      <span>{dispatchedEmail ? "Didn't receive email?" : "Didn't receive SMS?"}</span>
                      {resendTimer > 0 ? (
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          Resend in {resendTimer}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendPhoneOTP}
                          className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>

                    <button
                      id="verify-otp-btn"
                      type="submit"
                      disabled={loading || otpCode.length < 6}
                      className="w-full py-3.5 px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Verify & Sign In</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
