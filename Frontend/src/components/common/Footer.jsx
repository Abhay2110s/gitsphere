import React, { useState } from 'react';
import {
  GitSphereLogo,
  ArrowRightIcon,
  CheckIcon,
} from './Icons';
import { HexagonShape } from './Hexagon';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const subject = encodeURIComponent(
      email.trim() ? `GitSphere Message from ${email.trim()}` : 'GitSphere Collaboration Inquiry'
    );
    const body = encodeURIComponent(
      `${message.trim()}\n\n---\nSent from: ${email.trim() || 'Anonymous'}`
    );

    window.location.href = `mailto:abhaysingh14922@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);

    setTimeout(() => {
      setSent(false);
      setMessage('');
      setEmail('');
    }, 4000);
  };

  return (
    <footer className="relative bg-[#111111] text-white pt-10 sm:pt-12 pb-0 border-t border-[#2A2A2A] overflow-hidden select-none">

      {/* Subtle Hexagonal Outline Details */}
      <div className="absolute -left-12 -bottom-14 pointer-events-none z-0 opacity-30">
        <HexagonShape size={180} fill="none" stroke="#222222" strokeWidth={1} />
      </div>

      <div className="absolute -right-14 -bottom-16 pointer-events-none z-0 opacity-30">
        <HexagonShape size={200} fill="none" stroke="#222222" strokeWidth={1} />
      </div>

      {/* Main Container */}
      <div className="max-w-[1180px] mx-auto w-full px-6 sm:px-8 lg:px-12 relative z-10">

        {/* MESSAGE BOX SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Side: Brand & Direct Contact Info */}
          <div className="lg:col-span-5 flex flex-col justify-between py-1">
            <div>
              <div className="flex items-center gap-2.5">
                <GitSphereLogo className="w-7 h-7 text-white shrink-0" />
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white">
                  GitSphere
                </span>
              </div>

              <p className="mt-2 text-xs text-[#888888] font-mono tracking-wider uppercase">
                Build. Review. Collaborate.
              </p>

              <p className="mt-3 text-xs sm:text-sm text-[#777777] leading-relaxed max-w-sm">
                Have questions, feature feedback, or want to collaborate? Send a message directly to my inbox.
              </p>
            </div>

            {/* Concise Meta Row */}
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-mono text-[#666666]">
              <span>© 2026 GitSphere</span>
              <span>•</span>
              <a
                href="https://github.com/Abhay2110s/gitsphere"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* Right Side: Sleek Message Box Form */}
          <div className="lg:col-span-7 bg-[#161616] border border-[#2A2A2A] rounded-2xl p-5 sm:p-6 shadow-xl relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" />
                <h3 className="text-xs sm:text-sm font-mono font-bold tracking-widest text-[#AAAAAA] uppercase">
                  DROP A MESSAGE
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#666666]">
                Direct to Developer
              </span>
            </div>

            <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email (optional)"
                className="w-full bg-[#111111] border border-[#262626] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#444444] transition-colors"
              />

              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message or inquiry here..."
                className="w-full bg-[#111111] border border-[#262626] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#444444] transition-colors resize-none"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#666666]">
                  {sent ? (
                    <span className="text-white font-medium inline-flex items-center gap-1">
                      <CheckIcon className="w-3.5 h-3.5 text-white" />
                      Opening email client...
                    </span>
                  ) : (
                    'Opens in your default email client'
                  )}
                </span>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-all cursor-pointer inline-flex items-center gap-2 shrink-0 shadow-sm hover:scale-[1.02]"
                >
                  <span>Mail to Me</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* Subtle Background Watermark (Spread across entire width of the screen) */}
      <div
        className="w-full overflow-hidden pointer-events-none select-none relative z-0 mt-4 sm:mt-6 text-center"
        aria-hidden="true"
      >
        <span className="block font-black text-[18.5vw] text-[#222222] tracking-tighter leading-none whitespace-nowrap translate-y-[32%] w-full">
          GitSphere
        </span>
      </div>

    </footer>
  );
}
