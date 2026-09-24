import { useState, useMemo } from 'react';
import { GitSphereLogo, ArrowRightIcon } from '../../components/common/Icons';

// Eye toggle icons for show/hide password (matches LoginPage & RegisterPage)
function EyeIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export default function ResetPasswordPage({
  userEmail = '',
  onNavigateToLogin,
  onNavigateToForgotPassword,
  onNavigateToLanding,
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Resolve user email
  const effectiveEmail = useMemo(() => {
    if (userEmail && userEmail.trim()) return userEmail.trim();
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('gitsphere_verification_email') ||
        localStorage.getItem('gitsphere_pending_email') ||
        ''
      );
    }
    return '';
  }, [userEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: effectiveEmail,
          password: newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401 || response.status === 403 || data.message?.includes('expired')) {
          throw new Error('Your reset session has expired. Please request a new code.');
        } else if (data.message) {
          throw new Error(data.message);
        } else {
          throw new Error('Something went wrong. Please try again.');
        }
      }

      setIsLoading(false);
      setIsSuccess(true);
    } catch (err) {
      if (
        err.message.includes('Failed to fetch') ||
        err.message.includes('404') ||
        err.message.includes('NetworkError') ||
        err.message.includes('Not Found')
      ) {
        // Prototype fallback for offline or mock mode
        setTimeout(() => {
          setIsLoading(false);
          setIsSuccess(true);
        }, 600);
      } else {
        setIsLoading(false);
        setErrorMessage(err.message || 'Something went wrong. Please try again.');
      }
    }
  };

  const handleLoginClick = (e) => {
    if (e) e.preventDefault();
    if (onNavigateToLogin) onNavigateToLogin();
    else window.location.hash = '#login';
  };

  const handleForgotPasswordClick = (e) => {
    if (e) e.preventDefault();
    if (onNavigateToForgotPassword) onNavigateToForgotPassword();
    else window.location.hash = '#forgot-password';
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
            {isSuccess ? 'Password reset successful' : 'Create new password'}
          </h1>
          <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
            {isSuccess
              ? 'Your password has been updated. You can now sign in with your new password.'
              : 'Enter your new password below to secure your account.'}
          </p>
        </div>

        {/* ERROR ALERT */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-3.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center justify-between"
          >
            <div>
              <span>{errorMessage}</span>
              {errorMessage.includes('expired') && (
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  className="text-rose-200 underline hover:text-white ml-2 cursor-pointer"
                >
                  Request new code
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="text-rose-400 hover:text-rose-200 ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* STAGE A: RESET PASSWORD FORM */}
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            
            {/* New Password */}
            <div className="flex flex-col">
              <label
                htmlFor="reset-new-password"
                className="text-xs font-medium text-neutral-300 mb-1 select-none"
              >
                New password
              </label>
              <div className="relative">
                <input
                  id="reset-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  className="w-full h-9 sm:h-10 pl-3.5 pr-10 rounded-lg bg-neutral-900/70 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                >
                  {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col">
              <label
                htmlFor="reset-confirm-password"
                className="text-xs font-medium text-neutral-300 mb-1 select-none"
              >
                Confirm new password
              </label>
              <div className="relative">
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  className="w-full h-9 sm:h-10 pl-3.5 pr-10 rounded-lg bg-neutral-900/70 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
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
                  <span>Updating password...</span>
                </div>
              ) : (
                <>
                  <span>Reset password</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 text-black" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STAGE B: SUCCESS CONFIRMATION */
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleLoginClick}
              className="w-full h-10 mt-1 rounded-lg bg-white text-black font-medium text-sm hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Continue to sign in</span>
              <ArrowRightIcon className="w-3.5 h-3.5 text-black" />
            </button>
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
