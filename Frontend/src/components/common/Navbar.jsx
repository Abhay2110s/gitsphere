import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitSphereLogo, ArrowRightIcon, MenuIcon, CloseIcon } from './Icons';

export default function Navbar({ onOpenAuth }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [activeSection, setActiveSection] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'explore', label: 'Overview', href: '#explore' },
    { id: 'features', label: 'Features', href: '#features' },
    { id: 'how-it-works', label: 'Workflow', href: '#how-it-works' },
  ];

  // Scroll-spy to automatically track which section is currently in view
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['explore', 'features', 'how-it-works'];
      const scrollPos = window.scrollY + 180;

      if (window.scrollY < 200) {
        setActiveSection('');
        return;
      }

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && scrollPos >= el.offsetTop) {
          setActiveSection(sections[i]);
          return;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll with clearance offset for the floating pill navbar
  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        const yOffset = -76;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop for outside-click dismiss */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden pointer-events-auto"
          />
        )}
      </AnimatePresence>

      <header className="fixed top-4 sm:top-5 inset-x-0 z-50 flex flex-col items-center px-4 pointer-events-none">
        
        {/* SLIM FLOATING PILL-SHAPED NAVBAR CONTAINER */}
        <div
          onMouseLeave={() => setHoveredItem(null)}
          className="pointer-events-auto w-[92%] sm:w-[86%] md:w-[78%] lg:w-[70%] max-w-[1020px] h-[52px] sm:h-[54px] px-3.5 sm:px-5 lg:px-6 bg-white/95 backdrop-blur-md border border-[#E5E5E5] rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex items-center justify-between transition-all duration-300 relative"
        >
          {/* LEFT: GitSphere Logo + Text */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onMouseEnter={() => setHoveredItem(null)}
            className="flex items-center gap-2 group select-none relative focus:outline-none shrink-0"
          >
            <motion.div
              whileHover={{ rotate: 8, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="text-black shrink-0"
            >
              <GitSphereLogo className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-black" />
            </motion.div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-black group-hover:opacity-80 transition-opacity">
              GitSphere
            </span>
          </a>

          {/* CENTER: Navigation Items with Shared Continuous Hover Indicator */}
          <nav className="hidden md:flex items-center gap-1 relative">
            {navItems.map((item) => {
              const isHovered = hoveredItem === item.id;
              const isActive = activeSection === item.id;

              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  className={`relative px-3.5 py-1.5 text-xs sm:text-[13px] font-medium transition-colors select-none block rounded-full ${
                    isActive ? 'text-black font-bold' : isHovered ? 'text-black' : 'text-[#555555]'
                  }`}
                >
                  {/* Shared Active / Hover Pill Indicator */}
                  {(isHovered || (isActive && !hoveredItem)) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className={`absolute inset-0 rounded-full -z-10 ${
                        isActive && !hoveredItem ? 'bg-[#EEEEEE]' : 'bg-[#F4F4F4]'
                      }`}
                      initial={false}
                      transition={{
                        type: 'spring',
                        stiffness: 450,
                        damping: 32,
                        mass: 0.8,
                      }}
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-1.5">
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-black inline-block" />
                    )}
                    {item.label}
                  </span>
                </a>
              );
            })}
          </nav>

          {/* RIGHT: Login & Get Started */}
          <div className="hidden md:flex items-center gap-1.5 sm:gap-2 shrink-0">
            
          {/* Compact Get Started Button */}
            <motion.button
              onClick={() => onOpenAuth('signup')}
              onMouseEnter={() => setHoveredItem(null)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="group relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black text-white text-xs sm:text-[13px] font-semibold border border-black hover:bg-[#222222] transition-colors duration-200 shadow-xs cursor-pointer select-none"
            >
              <span>Get Started</span>
              <ArrowRightIcon className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </motion.button>
          </div>

          {/* Mobile Hamburger Icon inside the Floating Pill */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="p-1.5 text-black hover:bg-[#F1F1F1] rounded-full transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <CloseIcon className="w-4.5 h-4.5" /> : <MenuIcon className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* MOBILE COMPACT FLOATING PANEL (Dismissible, nicely offset) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="pointer-events-auto md:hidden w-[92%] max-w-[360px] mt-2.5 p-4 bg-white/98 backdrop-blur-md border border-[#E5E5E5] rounded-[20px] shadow-[0_16px_36px_rgba(0,0,0,0.12)] flex flex-col gap-2"
            >
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`text-sm px-3.5 py-2.5 rounded-[12px] transition-colors flex items-center justify-between ${
                      isActive ? 'bg-[#EEEEEE] font-bold text-black' : 'font-medium text-[#333333] hover:bg-[#F5F5F5]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </a>
                );
              })}
              <div className="pt-2 border-t border-[#EEEEEE] flex flex-col gap-2">
                
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="w-full py-2 text-sm font-semibold bg-black text-white border border-black rounded-full hover:bg-[#222222] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Get Started</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

