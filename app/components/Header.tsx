'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'Home',     href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'About',    href: '/about' },
];

export default function Header() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* ── Header ── */}
      <header className={`
        fixed top-2.5 left-1/2 max-w-[400px] -translate-x-1/2 z-50
        w-[calc(100%-2rem)] bg-black/10 border border-brand/50
         backdrop-blur-2xl rounded-full overflow-hidden
        transition-all duration-500
        ${scrolled ? 'shadow-[0_8px_40px_rgba(0,0,0,0.18)]' : ''}
      `}>
        <div className="flex items-stretch justify-between h-12 px-1 py-1">

          {/* Logo */}
          <Link href="/" className="flex relative h-10 w-12 overflow-hidden rounded-full">
              <Image src="/logo.png" alt="Hally" fill />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-stretch gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center px-5 rounded-4xl bg-brand text-white font-medium hover:bg-brand-dark text-xs tracking-[0.14em] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? 'translate-y-[5px] rotate-45' : ''}`} />
            <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? '-translate-y-[5px] -rotate-45' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed top-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[800px] z-40 md:hidden overflow-hidden rounded-2xl transition-all duration-300 bg-brand-dark ${menuOpen ? 'max-h-64' : 'max-h-0'}`}
      >
        <nav className="flex flex-col px-6 py-5 gap-5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/80 hover:text-white text-[13px] font-light uppercase tracking-[0.18em] transition-colors duration-200 border-b border-white/10 pb-4"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="self-start px-5 py-2 text-[12px] font-medium uppercase tracking-[0.16em] text-brand bg-white hover:bg-white/90 transition-colors"
            style={{ clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)' }}
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>
        </nav>
      </div>
    </>
  );
}
