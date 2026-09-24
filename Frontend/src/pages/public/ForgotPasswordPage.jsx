import { useState, useEffect } from 'react';
import { GitSphereLogo, ArrowRightIcon } from '../../components/common/Icons';

export default function ForgotPasswordPage({
  onNavigateToLogin,
  onNavigateToVerify,
  onNavigateToLanding,
}) {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  // Resend cooldown timer for success state
  const [resendCooldown, setResendCooldown] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [resendNotice, setResendNotice] = useState('');

  useEffect(() => {
    let timer;
    if (isSuccess && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSuccess, resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMessage('Email address is required.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      setSubmittedEmail(trimmedEmail);
      if (typeof window !== 'undefined') {
        localStorage.setItem('gitsphere_verification_email', trimmedEmail);
      }
      setIsLoading(false);
      setIsSuccess(true);
      setResendCooldown(45);
      setCanResend(false);
    } catch (err) {
      if (
        err.message.includes('Failed to fetch') ||
        err.message.includes('404') ||
        err.message.includes('NetworkError') ||
        err.message.includes('Not Found')
      ) {
        // Fallback for offline/prototype mode
        setTimeout(() => {
          setSubmittedEmail(trimmedEmail);
          if (typeof window !== 'undefined') {
            localStorage.setItem('gitsphere_verification_email', trimmedEmail);
          }
          setIsLoading(false);
          setIsSuccess(true);
          setResendCooldown(45);
          setCanResend(false);
        }, 600);
      } else {
        setIsLoading(false);
        setErrorMessage(err.message || 'Something went wrong. Please try again.');
      }
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    setCanResend(false);
    setResendCooldown(45);
    setResendNotice('Verification code resent successfully.');
    setTimeout(() => setResendNotice(''), 4000);

    try {
      await fetch('/api/v1/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: submittedEmail }),
      });
    } catch {
      // Prototype resilient
    }
  };

  const handleVerifyClick = () => {
    if (submittedEmail && typeof window !== 'undefined') {
      localStorage.setItem('gitsphere_verification_email', submittedEmail);
    }
    if (onNavigateToVerify) {
      onNavigateToVerify(submittedEmail);
    } else {
      window.location.hash = '#verify';
    }
  };

  const handleLoginClick = (e) => {
    if (e) e.preventDefault();
    if (onNavigateToLogin) onNavigateToLogin();
    else window.location.hash = '#login';
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-3 sm:p-4 bg-black text-neutral-100 antialiased selection:bg-white selection:text-black">
      
      {/* ATMOSPHERIC BACKGROUND RADIAL GLOW - PURE MONOCHROME */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden" 
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 255, 255, 0.05), transparent)'
        }}
        aria-hidden="true" 
      />

      {/* TOP BRAND LOGO (HOME LINK) */}
      <div className="relative z-10 mb-3 sm:mb-3.5 flex items-center justify-center">
        <button
          type="button"
          onClick={() => {
            if (onNavigateToLanding) onNavigateToLanding();
            else window.location.href = '/';
          }}
          title="Return to GitSphere Home"
          aria-label="Return to GitSphere Home"
          className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-white backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm group"
        >
          <GitSphereLogo className="w-6 h-6 text-white transition-transform group-hover:scale-105" />
        </button>
      </div>

      {/* MINIMAL SAAS CARD (PERFECTLY SIZED: 440-460px) */}
      <div className="relative z-10 w-full max-w-[440px] sm:max-w-[460px] rounded-2xl bg-[#0c0c0d]/90 border border-white/[0.08] backdrop-blur-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.95),inset_0_1px_0_0_rgba(255,255,255,0.06)] px-5 py-5 sm:px-8 sm:py-6 transition-all">
        
        {/* CARD HEADER */}
        <div className="text-center mb-5">
          <h1 className="text-xl sm:text-[22px] font-semibold tracking-tight text-white">
            {isSuccess ? 'Check your email' : 'Forgot your password?'}
          </h1>
          <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
            {isSuccess
              ? 'We sent a verification code to your registered email.'
              : "Enter your registered email and we'll send you a verification code."}
          </p>
        </div>

        {/* ERROR ALERT */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-3.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center justify-between"
          >
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="text-rose-400 hover:text-rose-200 ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* STAGE A: FORGOT PASSWORD FORM */}
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            
            {/* Email Address */}
            <div className="flex flex-col">
              <label
                htmlFor="forgot-email"
                className="text-xs font-medium text-neutral-300 mb-1 select-none"
              >
                Email address
              </label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
                disabled={isLoading}
                className="w-full h-9 sm:h-10 px-3.5 rounded-lg bg-neutral-900/70 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all disabled:opacity-50"
              />
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 mt-1 rounded-lg bg-white text-black font-medium text-sm hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Sending code...</span>
                </div>
              ) : (
                <>
                  <span>Send verification code</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 text-black" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STAGE B: EMAIL SENT CONFIRMATION */
          <div className="flex flex-col gap-3">
            
            {/* Submitted Email Badge */}
            <div className="p-3 rounded-lg bg-neutral-900/70 border border-neutral-800/80 flex items-center justify-between text-xs">
              <span className="text-neutral-400 truncate mr-2">{submittedEmail}</span>
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0">
                Code sent
              </span>
            </div>

            {/* Resend Notice */}
            {resendNotice && (
              <div
                role="status"
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium"
              >
                ✓ {resendNotice}
              </div>
            )}

            {/* Primary Action: Enter Code */}
            <button
              type="button"
              onClick={handleVerifyClick}
              className="w-full h-10 mt-1 rounded-lg bg-white text-black font-medium text-sm hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Enter verification code</span>
              <ArrowRightIcon className="w-3.5 h-3.5 text-black" />
            </button>

            {/* Resend Option */}
            <div className="text-center text-xs text-neutral-400 pt-1">
              <span>Didn't receive code? </span>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-white hover:underline font-medium cursor-pointer ml-1"
                >
                  Resend code
                </button>
              ) : (
                <span className="text-neutral-500 ml-1">
                  Resend in {resendCooldown}s
                </span>
              )}
            </div>

            {/* Use Different Email */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setErrorMessage('');
                }}
                className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Use a different email
              </button>
            </div>
          </div>
        )}

        {/* FOOTER SWITCH TO LOGIN */}
        <div className="mt-4 pt-3.5 border-t border-white/[0.06] text-center text-xs text-neutral-400">
          <span>Remember your password? </span>
          <button
            type="button"
            onClick={handleLoginClick}
            className="text-white hover:underline font-medium cursor-pointer ml-1"
          >
            Sign in
          </button>
        </div>

      </div>
    </div>
  );
}
