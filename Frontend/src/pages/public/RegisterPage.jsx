import React, { useState, useRef } from 'react';
import { GitSphereLogo, ArrowRightIcon } from '../../components/common/Icons';

// Eye toggle icons for show/hide password
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

export default function RegisterPage({ onNavigateToLogin, onNavigateToOtp, onNavigateToLanding, onLoginSuccess }) {
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER'); // 'USER' | 'MANAGER'
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Flow State: 'form' | 'creating' | 'verify' | 'success'
  const [flowState, setFlowState] = useState('form');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const otpInputRefs = useRef([]);


  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Name must be at least 2 characters.');
      return;
    }
    if (trimmedName.length > 60) {
      setErrorMessage('Name cannot exceed 60 characters.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!agreedToTerms) {
      setErrorMessage('Please agree to the Terms of Service.');
      return;
    }

    setIsSubmitting(true);
    setFlowState('creating');

    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password: password,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      if (data.token) {
        localStorage.setItem('gitsphere_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('gitsphere_user', JSON.stringify(data.user));
        setRegisteredUser(data.user);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('gitsphere_verification_email', trimmedEmail);
      }

      setTimeout(() => {
        if (onNavigateToOtp) {
          onNavigateToOtp(trimmedEmail);
        } else {
          setFlowState('verify');
        }
        setIsSubmitting(false);
      }, 700);

    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        // Fallback for offline/mock dev demo
        if (typeof window !== 'undefined') {
          localStorage.setItem('gitsphere_verification_email', trimmedEmail);
        }
        setRegisteredUser({
          name: trimmedName,
          email: trimmedEmail,
          role: role,
        });
        setTimeout(() => {
          if (onNavigateToOtp) {
            onNavigateToOtp(trimmedEmail);
          } else {
            setFlowState('verify');
          }
          setIsSubmitting(false);
        }, 700);
      } else {
        setFlowState('form');
        setIsSubmitting(false);
        setErrorMessage(err.message || 'Failed to create account.');
      }
    }
  };

  // OTP Handling
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      const newOtp = [...otpCode];
      pasted.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtpCode(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const entered = otpCode.join('');
    if (entered.length < 6) {
      setErrorMessage('Please enter the full 6-digit code.');
      return;
    }
    setErrorMessage('');
    setFlowState('success');
    setTimeout(() => {
      if (onLoginSuccess) onLoginSuccess();
      else if (onNavigateToLanding) onNavigateToLanding();
    }, 900);
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-3 sm:p-4 bg-black text-neutral-100 antialiased selection:bg-white selection:text-black overflow-y-auto">

      {/* ATMOSPHERIC BACKGROUND RADIAL GLOW - PURE MONOCHROME */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 255, 255, 0.05), transparent)'
        }}
        aria-hidden="true"
      />

      {/* TOP BRAND LOGO (HOME LINK) */}
      <div className="relative z-10 mb-3.5 flex items-center justify-center">
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

      {/* MINIMAL SAAS REGISTRATION CARD (PERFECTLY SIZED: 440-460px) */}
      <div className="relative z-10 w-full max-w-[440px] sm:max-w-[460px] rounded-2xl bg-[#0c0c0d]/90 border border-white/[0.08] backdrop-blur-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.95),inset_0_1px_0_0_rgba(255,255,255,0.06)] px-5 py-5 sm:px-7 sm:py-6 transition-all">

        {/* CARD HEADER */}
        <div className="text-center mb-3">
          <h1 className="text-xl sm:text-[22px] font-semibold tracking-tight text-white leading-tight">
            Create your account
          </h1>
          <p className="mt-0.5 text-xs text-neutral-400">
            Start collaborating with your team in a shared workspace.
          </p>
        </div>

        {/* ERROR ALERT */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-2.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center justify-between"
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

        {/* STAGE A: REGISTRATION FORM */}
        {flowState === 'form' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">

            {/* Row 1: Full Name & Email (2-Column Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label
                  htmlFor="register-name"
                  className="text-xs font-medium text-neutral-300 mb-1 select-none"
                >
                  Full name
                </label>
                <input
                  id="register-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  autoComplete="name"
                  minLength={2}
                  maxLength={60}
                  required
                  className="w-full h-9 px-3 rounded-lg bg-neutral-900/70 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="register-email"
                  className="text-xs font-medium text-neutral-300 mb-1 select-none"
                >
                  Email address
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  autoComplete="email"
                  required
                  className="w-full h-9 px-3 rounded-lg bg-neutral-900/70 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                />
              </div>
            </div>

            {/* Row 2: Role Selection (Minimal Segmented Pill Cards) */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1 select-none">
                <label className="text-xs font-medium text-neutral-300">
                  Select your role
                </label>
                <span className="text-[11px] text-neutral-400">
                  {role === 'MANAGER' ? 'Project Manager' : 'Developer'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={`h-9 px-3 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${role === 'USER'
                      ? 'bg-white/[0.08] border-white/30 text-white shadow-xs'
                      : 'bg-neutral-900/40 border-neutral-800/80 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-neutral-400">&lt;/&gt;</span>
                    <span className="text-xs font-medium">Developer</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${role === 'USER' ? 'bg-white' : 'bg-transparent border border-neutral-600'}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setRole('MANAGER')}
                  className={`h-9 px-3 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${role === 'MANAGER'
                      ? 'bg-white/[0.08] border-white/30 text-white shadow-xs'
                      : 'bg-neutral-900/40 border-neutral-800/80 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-neutral-400">◈</span>
                    <span className="text-xs font-medium">Manager</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${role === 'MANAGER' ? 'bg-white' : 'bg-transparent border border-neutral-600'}`} />
                </button>
              </div>
            </div>

            {/* Row 3: Password & Confirm Password (2-Column Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label
                  htmlFor="register-password"
                  className="text-xs font-medium text-neutral-300 mb-1 select-none"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    className="w-full h-9 pl-3 pr-8 rounded-lg bg-neutral-900/70 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOffIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="register-confirm-password"
                  className="text-xs font-medium text-neutral-300 mb-1 select-none"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    className="w-full h-9 pl-3 pr-8 rounded-lg bg-neutral-900/70 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOffIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>


            {/* Row 5: Minimal Terms Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-neutral-400">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-neutral-700 bg-neutral-900 text-white accent-white cursor-pointer"
              />
              <span>
                I agree to the{' '}
                <span className="text-neutral-200 hover:underline">Terms of Service</span> and{' '}
                <span className="text-neutral-200 hover:underline">Privacy Policy</span>.
              </span>
            </label>

            {/* Row 6: Primary Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 mt-1 rounded-lg bg-white text-black font-medium text-sm hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>Create account</span>
              <ArrowRightIcon className="w-3.5 h-3.5 text-black" />
            </button>
          </form>
        )}

        {/* STAGE B: CREATING LOADING */}
        {flowState === 'creating' && (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
            <h2 className="text-sm font-medium text-white mb-0.5">
              Setting up your workspace...
            </h2>
            <p className="text-xs text-neutral-400">
              Configuring your GitSphere environment.
            </p>
          </div>
        )}

        {/* STAGE C: EMAIL VERIFICATION */}
        {flowState === 'verify' && (
          <div className="py-2 flex flex-col items-center justify-center text-center">
            <h2 className="text-lg font-semibold text-white mb-1">
              Check your email
            </h2>
            <p className="text-xs text-neutral-400 max-w-xs mb-4">
              We sent a 6-digit confirmation code to{' '}
              <span className="text-neutral-200 font-medium">{registeredUser?.email || email}</span>.
            </p>

            <form onSubmit={handleVerifyOtp} className="w-full flex flex-col items-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-9 h-11 rounded-lg border border-neutral-800 bg-neutral-900/80 text-white text-center font-mono text-base font-semibold focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-lg bg-white text-black font-medium text-sm hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm mb-3"
              >
                <span>Verify & continue</span>
                <ArrowRightIcon className="w-3.5 h-3.5 text-black" />
              </button>

              <button
                type="button"
                onClick={() => setFlowState('form')}
                className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
              >
                ← Back to edit details
              </button>
            </form>
          </div>
        )}

        {/* STAGE D: SUCCESS */}
        {flowState === 'success' && (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3 text-emerald-400">
              <span className="text-base font-bold">✓</span>
            </div>
            <h2 className="text-lg font-semibold text-white mb-0.5">
              Welcome to GitSphere!
            </h2>
            <p className="text-xs text-neutral-400 max-w-xs mb-3">
              Your account is ready. Redirecting to workspace...
            </p>
          </div>
        )}

        {/* FOOTER SWITCH TO LOGIN */}
        {flowState === 'form' && (
          <div className="mt-4 pt-3.5 border-t border-white/[0.06] text-center text-xs text-neutral-400">
            <span>Already have an account? </span>
            <button
              type="button"
              onClick={() => {
                if (onNavigateToLogin) onNavigateToLogin();
                else window.location.hash = '#login';
              }}
              className="text-white hover:underline font-medium cursor-pointer ml-1"
            >
              Sign in
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
