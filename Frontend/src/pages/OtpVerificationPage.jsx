import React, { useState, useEffect, useRef } from 'react';
import { GitSphereLogo, ArrowRightIcon } from '../components/common/Icons';

// Arrow Left Icon
function ArrowLeftIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

export default function OtpVerificationPage({
  userEmail = 'abh***@gmail.com',
  onChangeEmail,
  onVerificationComplete,
  onNavigateToLanding,
}) {
  // 6 digits state
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [activeIdx, setActiveIdx] = useState(0);

  // States: 'idle' | 'verifying' | 'error' | 'success'
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Countdown timer: 45 seconds initial
  const [timeLeft, setTimeLeft] = useState(45);
  const [isResending, setIsResending] = useState(false);
  const [resendNotification, setResendNotification] = useState('');

  // Micro shake animation state for error
  const [isShaking, setIsShaking] = useState(false);

  // Input DOM references for direct focus management
  const inputRefs = useRef([]);

  // Mask email helper for display if a plain email is passed
  const displayEmail = React.useMemo(() => {
    if (!userEmail) return 'abh***@gmail.com';
    if (userEmail.includes('***')) return userEmail;
    const parts = userEmail.split('@');
    if (parts.length === 2) {
      const user = parts[0];
      const domain = parts[1];
      const maskedUser =
        user.length <= 3
          ? `${user.charAt(0)}***`
          : `${user.slice(0, 3)}***`;
      return `${maskedUser}@${domain}`;
    }
    return userEmail;
  }, [userEmail]);

  // Initial focus on first input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Natural countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format seconds to mm:ss
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Handle single digit input & auto-focus progression
  const handleDigitChange = (index, value) => {
    if (value.length > 1) {
      handlePasteData(value, index);
      return;
    }

    const cleanDigit = value.replace(/[^0-9]/g, '');

    const newDigits = [...digits];
    newDigits[index] = cleanDigit;
    setDigits(newDigits);
    setStatus('idle');
    setStatusMessage('');

    if (cleanDigit && index < 5) {
      setActiveIdx(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Keyboard navigation & Backspace handling
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        setActiveIdx(index - 1);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      setActiveIdx(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      setActiveIdx(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Paste complete 6-digit OTP support
  const handlePasteData = (pastedText, startIndex = 0) => {
    const numbers = pastedText.replace(/[^0-9]/g, '').slice(0, 6).split('');
    if (numbers.length === 0) return;

    const newDigits = [...digits];
    numbers.forEach((num, idx) => {
      const targetIdx = startIndex === 0 ? idx : Math.min(startIndex + idx, 5);
      if (targetIdx < 6) {
        newDigits[targetIdx] = num;
      }
    });

    setDigits(newDigits);
    setStatus('idle');
    setStatusMessage('');

    const nextFocus = Math.min(numbers.length, 5);
    setActiveIdx(nextFocus);
    inputRefs.current[nextFocus]?.focus();
  };

  const handleNativePaste = (e, index) => {
    e.preventDefault();
    const pasteContent = e.clipboardData.getData('text');
    handlePasteData(pasteContent, index);
  };

  // Trigger verification submission to backend
  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length < 6) {
      setStatus('error');
      setStatusMessage('Please enter the full 6-digit code');
      triggerErrorShake();
      return;
    }

    setStatus('verifying');
    setStatusMessage('');

    try {
      const response = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: userEmail,
          otp: code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid verification code');
      }

      if (data.token) {
        localStorage.setItem('gitsphere_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('gitsphere_user', JSON.stringify(data.user));
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setStatusMessage(err.message || 'Invalid verification code');
      triggerErrorShake();
      setDigits(['', '', '', '', '', '']);
      setActiveIdx(0);
      inputRefs.current[0]?.focus();
    }
  };

  // Subtle error shake animation
  const triggerErrorShake = () => {
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
    }, 320);
  };

  // Handle Resend Code request to backend
  const handleResend = async () => {
    if (timeLeft > 0 || isResending) return;

    setIsResending(true);
    setResendNotification('Sending new code...');

    try {
      const response = await fetch('/api/v1/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: userEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend code');
      }

      setIsResending(false);
      setTimeLeft(45);
      setResendNotification('New code sent to your email.');
      setTimeout(() => setResendNotification(''), 3000);
      setDigits(['', '', '', '', '', '']);
      setActiveIdx(0);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setIsResending(false);
      setResendNotification(err.message || 'Failed to send new code.');
      setTimeout(() => setResendNotification(''), 3000);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-3 sm:p-4 bg-[#090A0C] text-neutral-100 antialiased selection:bg-white selection:text-black">
      
      {/* ATMOSPHERIC BACKGROUND RADIAL GLOW */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden" 
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.12), transparent)'
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

      {/* MINIMAL SAAS OTP CARD (MATCHES LOGIN & REGISTER: 440-460px) */}
      <div
        className={`relative z-10 w-full max-w-[440px] sm:max-w-[460px] rounded-2xl bg-[#111215]/85 border border-white/[0.08] backdrop-blur-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.08)] px-5 py-5 sm:px-8 sm:py-6 transition-all ${
          isShaking ? 'translate-x-[-3px] translate-x-[3px]' : ''
        }`}
        style={
          isShaking
            ? {
                animation: 'otpShake 320ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
              }
            : undefined
        }
      >
        {/* STEP PROGRESS INDICATOR */}
        <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-white/[0.06] text-[10.5px] font-mono tracking-wider">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span className="font-semibold text-xs text-neutral-300">01</span>
            <span>ACCOUNT</span>
          </div>

          <div className="flex-1 mx-2.5 h-[1px] bg-white/[0.08]" />

          <div className="flex items-center gap-1.5 text-white font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="font-semibold text-xs">02</span>
            <span>VERIFY</span>
          </div>

          <div className="flex-1 mx-2.5 h-[1px] bg-white/[0.08]" />

          <div className="flex items-center gap-1.5 text-neutral-500">
            <span className="font-semibold text-xs">03</span>
            <span>READY</span>
          </div>
        </div>

        {/* STAGE A & B: OTP ENTRY FORM OR SUCCESS STATE */}
        {status !== 'success' ? (
          <div>
            {/* CARD HEADER */}
            <div className="text-center mb-4">
              <h1 className="text-xl sm:text-[22px] font-semibold tracking-tight text-white leading-tight">
                Verify your email
              </h1>
              <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
                We've sent a 6-digit verification code to
              </p>
              <div className="text-xs text-white font-medium mt-0.5 tracking-wide">
                {displayEmail}
              </div>
            </div>

            {/* ERROR NOTIFICATION */}
            {status === 'error' && (
              <div
                role="alert"
                className="mb-3 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center justify-between animate-fadeIn"
              >
                <span>{statusMessage || 'Invalid verification code'}</span>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="text-rose-400 hover:text-rose-200 ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* OTP 6-BOX INPUT GROUP */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-4">
              {digits.map((digit, idx) => {
                const isActive = activeIdx === idx;
                return (
                  <div key={idx} className="relative flex-1 max-w-[50px] sm:max-w-[54px]">
                    <input
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onFocus={() => setActiveIdx(idx)}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={(e) => handleNativePaste(e, idx)}
                      disabled={status === 'verifying'}
                      aria-label={`Verification code digit ${idx + 1}`}
                      className={`w-full h-11 sm:h-12 rounded-lg bg-neutral-900/70 text-center text-xl sm:text-2xl font-mono font-semibold text-white transition-all duration-150 focus:outline-none select-all ${
                        isActive
                          ? 'border-[1.5px] border-white/60 shadow-[0_0_12px_rgba(255,255,255,0.08)] scale-[1.02]'
                          : digit
                          ? 'border border-neutral-700 bg-neutral-900/90'
                          : 'border border-neutral-800'
                      } ${status === 'error' ? 'border-rose-500/50' : ''}`}
                    />
                  </div>
                );
              })}
            </div>

            {/* PRIMARY VERIFY BUTTON */}
            <button
              type="button"
              onClick={handleVerify}
              disabled={status === 'verifying' || digits.join('').length < 6}
              className="w-full h-10 mt-1 rounded-lg bg-white text-black font-medium text-sm hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed select-none"
            >
              {status === 'verifying' ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Verifying code...</span>
                </div>
              ) : (
                <>
                  <span>Verify Email</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 text-black" />
                </>
              )}
            </button>

            {/* RESEND SECTION */}
            <div className="mt-3.5 text-center text-xs text-neutral-400">
              <span>Didn't receive the code? </span>
              {timeLeft > 0 ? (
                <span className="text-neutral-500 font-mono ml-1 select-none">
                  Resend in {formatTimer(timeLeft)}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="font-medium text-neutral-300 hover:text-white cursor-pointer ml-1 transition-colors underline underline-offset-4"
                >
                  {isResending ? 'Sending...' : 'Resend code'}
                </button>
              )}

              {/* Transient resend notification */}
              {resendNotification && (
                <div className="text-[11px] text-neutral-300 mt-1.5 font-mono animate-fadeIn">
                  {resendNotification}
                </div>
              )}
            </div>

            {/* CHANGE EMAIL LINK */}
            <div className="mt-3 pt-3 border-t border-white/[0.06] text-center">
              <button
                type="button"
                onClick={() => {
                  if (onChangeEmail) onChangeEmail();
                  else if (onNavigateToLanding) onNavigateToLanding();
                  else window.location.hash = '#register';
                }}
                className="group inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer select-none"
              >
                <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
                  <ArrowLeftIcon />
                </span>
                <span>Change email</span>
              </button>
            </div>
          </div>
        ) : (
          /* STAGE C: SUCCESS TRANSITION */
          <div className="py-4 text-center animate-fadeIn">
            {/* Success icon */}
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 text-emerald-400">
              <span className="text-base font-bold">✓</span>
            </div>

            {/* Success Heading */}
            <h2 className="text-xl sm:text-[22px] font-semibold text-white tracking-tight leading-tight mb-1">
              Email verified
            </h2>

            {/* Success Subtitle */}
            <p className="text-xs text-neutral-400 max-w-xs mx-auto mb-5 leading-relaxed">
              Your GitSphere account is ready.
            </p>

            {/* Continue Button */}
            <button
              type="button"
              onClick={() => {
                if (onVerificationComplete) onVerificationComplete();
                else if (onNavigateToLanding) onNavigateToLanding();
                else window.location.href = '/';
              }}
              className="w-full h-10 rounded-lg bg-white text-black font-medium text-sm hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm select-none"
            >
              <span>Continue to GitSphere</span>
              <ArrowRightIcon className="w-3.5 h-3.5 text-black" />
            </button>
          </div>
        )}
      </div>

      {/* KEYFRAME ANIMATIONS */}
      <style>{`
        @keyframes otpShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-3px); }
          40%, 80% { transform: translateX(3px); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 300ms ease-out forwards;
        }
      `}</style>
    </div>
  );
}
