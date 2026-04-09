'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useMenuAnimation } from '@/hooks/useMenuAnimation';

const NAV_LINKS = [
  { label: 'Home',     href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'About',    href: '/about' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  const {
    menuOpen, setMenuOpen,
    overlayRef, linksRef, decorRef,
    bar1Ref, bar2Ref, bar3Ref,
  } = useMenuAnimation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* ── Header ── */}
      <header className={`
        fixed top-2.5 left-1/2 max-w-[350px] font-cormorant -translate-x-1/2 z-50
        w-[calc(100%-2rem)] bg-brand/20  border-brand/50
        backdrop-blur-2xl rounded-xl overflow-hidden
        transition-all duration-500
        ${scrolled ? 'shadow-[0_8px_40px_rgba(0,0,0,0.18)]' : ''}
      `}>
        <div className="flex items-stretch justify-between h-12 px-1 py-1">

          {/* Logo */}
          <Link href="/" className="flex relative h-10 w-10 overflow-hidden rounded-full">
            <Image src="/logo.png" alt="Hally" fill />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center h-full px-4 rounded-lg bg-white text-brand border-[1px border-brand font-medium hover:bg-brand/90 hover:text-white text-xs tracking-[0.14em] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex flex-col justify-center gap-1.5 px-3"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span ref={bar1Ref} className="block h-px w-5 bg-brand" />
            <span ref={bar2Ref} className="block h-px w-5 bg-brand" />
            <span ref={bar3Ref} className="block h-px w-5 bg-brand" />
          </button>
        </div>
      </header>

      {/* ── Full-screen Mobile Overlay ── */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40 md:hidden bg-brand flex flex-col justify-between px-8 pt-28 pb-16"
        style={{ visibility: 'hidden' }}
      >
        {/* Decorative line */}
        <div
          ref={decorRef}
          className="absolute top-24 left-8 right-8 h-px bg-white/20 origin-left"
        />

        {/* Nav links */}
        <div ref={linksRef} className="flex flex-col mt-4">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative flex items-center justify-between py-6 border-b border-white/10 overflow-hidden"
              onClick={() => setMenuOpen(false)}
            >
              <span className="absolute inset-0 bg-white/8 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />

              <div className="relative flex items-baseline gap-4">
                <span className="text-white/25 text-xs font-light tracking-widest tabular-nums">
                  0{i + 1}
                </span>
                <span className="text-white text-5xl font-extralight tracking-tight group-hover:translate-x-2 transition-transform duration-300">
                  {link.label}
                </span>
              </div>

              <span className="relative w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/40 group-hover:border-white group-hover:text-white group-hover:bg-white/10 transition-all duration-300 text-sm">
                →
              </span>
            </Link>
          ))}

          <Link
            href="/contact"
            className="group mt-10 flex items-center justify-between px-6 py-4 border border-white/30 rounded-full hover:bg-white/10 transition-colors duration-300"
            onClick={() => setMenuOpen(false)}
          >
            <span className="text-white text-sm font-light uppercase tracking-[0.2em]">Get in touch</span>
            <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-brand text-xs group-hover:scale-110 transition-transform duration-300">→</span>
          </Link>
        </div>

        {/* Bottom branding */}
        <div className="flex items-center gap-3 opacity-30">
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <Image src="/logo.png" alt="Hally" fill sizes="32px" className="object-contain" />
          </div>
          <span className="text-white text-xs tracking-[0.2em] uppercase">Hally Art Gallery</span>
        </div>
      </div>
    </>
  );
}
