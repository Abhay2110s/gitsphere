import React, { useState, useEffect } from 'react';
import { GitSphereLogo, CloseIcon, CheckIcon, ArrowRightIcon } from './Icons';

export default function Modal({ isOpen, mode = 'signup', onClose }) {
  const [activeMode, setActiveMode] = useState(mode);
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setActiveMode(mode);
  }, [mode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail('');
        setOrg('');
        onClose();
      }, 1500);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity"
    >
      <div className="relative w-full max-w-md bg-white text-black p-6 sm:p-8 rounded-2xl border-2 border-black shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-1 rounded-full text-black hover:bg-[#F0F0F0] transition-colors cursor-pointer"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="flex items-center gap-2 mb-6">
          <GitSphereLogo className="w-7 h-7 text-black" />
          <span className="font-extrabold text-xl tracking-tight text-black">
            GitSphere
          </span>
        </div>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-black text-white mx-auto flex items-center justify-center mb-4">
              <CheckIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-black">
              {activeMode === 'login' ? 'Welcome Back!' : 'Workspace Created'}
            </h3>
            <p className="text-xs text-[#666666] mt-2">
              Preparing your collaborative workspace sandbox...
            </p>
          </div>
        ) : (
          <div>
            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 bg-[#F0F0F0] rounded-xl mb-6 border border-[#E0E0E0]">
              <button
                type="button"
                onClick={() => setActiveMode('signup')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeMode === 'signup'
                    ? 'bg-black text-white shadow'
                    : 'text-[#666666] hover:text-black'
                }`}
              >
                Create Workspace
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeMode === 'login'
                    ? 'bg-black text-white shadow'
                    : 'text-[#666666] hover:text-black'
                }`}
              >
                Sign In
              </button>
            </div>

            <h3 className="text-2xl font-black tracking-tight text-black">
              {activeMode === 'login' ? 'Welcome Back' : 'Get Started with GitSphere'}
            </h3>
            <p className="text-xs text-[#555555] mt-1.5 leading-relaxed">
              {activeMode === 'login'
                ? 'Sign in to access your repositories, sprint backlogs, and code reviews.'
                : 'Join modern engineering teams building high-reliability software in GitSphere.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#333333] block mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-black text-sm text-black placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-black font-medium"
                />
              </div>

              {activeMode === 'signup' && (
                <div>
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#333333] block mb-1.5">
                    Team Organization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. acme-labs"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#CCCCCC] text-sm text-black placeholder:text-[#888888] focus:border-black focus:outline-none font-medium"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 py-3.5 px-4 rounded-full bg-black text-white font-bold text-sm hover:bg-[#222222] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>{activeMode === 'login' ? 'Continue to Console' : 'Initialize Workspace'}</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#EEEEEE] text-center text-xs text-[#666666]">
              By continuing you agree to GitSphere&apos;s Terms of Service & Security Model.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
