'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

export function useMenuAnimation() {
  const [menuOpen, setMenuOpen] = useState(false);

  const tlRef      = useRef<gsap.core.Timeline | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksRef   = useRef<HTMLDivElement>(null);
  const decorRef   = useRef<HTMLDivElement>(null);
  const bar1Ref    = useRef<HTMLSpanElement>(null);
  const bar2Ref    = useRef<HTMLSpanElement>(null);
  const bar3Ref    = useRef<HTMLSpanElement>(null);

  /* ── Build timeline once on mount ── */
  useEffect(() => {
    const overlay = overlayRef.current;
    const links   = linksRef.current?.querySelectorAll('a');
    const decor   = decorRef.current;
    const b1      = bar1Ref.current;
    const b2      = bar2Ref.current;
    const b3      = bar3Ref.current;
    if (!overlay || !links || !b1 || !b2 || !b3) return;

    gsap.set(overlay, { clipPath: 'circle(0% at 92% 3%)', visibility: 'hidden' });
    gsap.set(links,   { y: 60, opacity: 0 });
    gsap.set(decor,   { scaleX: 0, opacity: 0 });

    tlRef.current = gsap.timeline({ paused: true })
      // ── Overlay expand ──
      .set(overlay, { visibility: 'visible' })
      .to(overlay, { clipPath: 'circle(170% at 92% 3%)', duration: 0.8, ease: 'power4.inOut' })
      .to(decor,   { scaleX: 1, opacity: 1, duration: 0.5, ease: 'power2.out'              }, '-=0.3')
      .to(links,   { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out'     }, '-=0.3')
      // ── Hamburger → X (anchored at t=0 so reverse is perfectly mirrored) ──
      .to(b2, { opacity: 0, scaleX: 0.15, duration: 0.18, ease: 'power2.in'  }, 0)
      .to(b1, { y:  7,      duration: 0.28, ease: 'power3.inOut'              }, 0.06)
      .to(b3, { y: -7,      duration: 0.28, ease: 'power3.inOut'              }, 0.06)
      .to(b1, { rotation:  45, duration: 0.38, ease: 'back.out(1.8)'          }, 0.28)
      .to(b3, { rotation: -45, duration: 0.38, ease: 'back.out(1.8)'          }, 0.28);

    return () => { tlRef.current?.kill(); };
  }, []);

  /* ── Play / reverse on toggle ── */
  useEffect(() => {
    if (!tlRef.current) return;
    menuOpen ? tlRef.current.play() : tlRef.current.reverse();
  }, [menuOpen]);

  return { menuOpen, setMenuOpen, overlayRef, linksRef, decorRef, bar1Ref, bar2Ref, bar3Ref };
}
