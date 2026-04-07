'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TEAM_SLIDES = [
  '/team/team.webp',
  '/team/team2.webp',
  '/team/team3.webp',
];

export default function OurTeam() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs    = useRef<(HTMLButtonElement | null)[]>([]);
  const textRef    = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevRef = useRef(0);
  const isFirst = useRef(true);
  const total = TEAM_SLIDES.length;

  /* ── Clip-path wipe + inner parallax ── */
  useEffect(() => {
    // First render — show slide 0, hide the rest
    if (isFirst.current) {
      isFirst.current = false;
      imageRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, {
          clipPath: i === 0 ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
          zIndex: i === 0 ? 2 : 1,
        });
      });
      return;
    }

    const prev = prevRef.current;
    prevRef.current = active;
    if (active === prev) return;

    const newEl = imageRefs.current[active];
    const oldEl = imageRefs.current[prev];

    // New slide wipes in from the right
    if (newEl) {
      const img = newEl.querySelector('img');
      gsap.set(newEl, { zIndex: 2 });
      gsap.fromTo(
        newEl,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.2,
          ease: 'power3.inOut',
          onComplete: () => {
            imageRefs.current.forEach((el, i) => {
              if (!el || i === active) return;
              gsap.set(el, { clipPath: 'inset(0 100% 0 0)', zIndex: 1 });
            });
          },
        },
      );
      // Inner parallax shift
      if (img) {
        gsap.fromTo(
          img,
          { scale: 1.12, x: 60 },
          { scale: 1, x: 0, duration: 1.4, ease: 'power3.out' },
        );
      }
    }

    // Old slide stays visible underneath during wipe
    if (oldEl) {
      gsap.set(oldEl, { zIndex: 1, clipPath: 'inset(0 0% 0 0)' });
    }

    // Dots
    dotRefs.current.forEach((dot, i) => {
      if (!dot) return;
      gsap.to(dot, {
        width: i === active ? 32 : 8,
        backgroundColor: i === active ? '#ffffff' : 'rgba(255,255,255,0.4)',
        duration: 0.4,
        ease: 'power2.out',
      });
    });
  }, [active, total]);

  /* ── Entrance (ScrollTrigger, once) ── */
  useEffect(() => {
    const trig = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        if (textRef.current) {
          gsap.from(textRef.current.children, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.14,
            ease: 'power3.out',
          });
        }
      },
    });
    return () => trig.kill();
  }, []);

  /* ── Auto-advance ── */
  useEffect(() => {
    autoRef.current = setInterval(() => setActive((p) => (p + 1) % total), 5000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [total]);

  const goTo = useCallback((index: number) => {
    setActive(index);
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => setActive((p) => (p + 1) % total), 5000);
  }, [total]);

  return (
    <section ref={sectionRef} className="w-full max-w-[1500px] mx-auto px-6 py-30">
      {/* Section header */}
      <div ref={textRef} className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="inline-block w-10 h-[2px] bg-brand/30" />
          <span className="text-xs tracking-[0.22em] uppercase text-brand/70 font-semibold">
            Our Team
          </span>
          <span className="inline-block w-10 h-[2px] bg-brand/30" />
        </div>

        <h2 className="text-5xl md:text-8xl font-bold text-brand leading-[1.05]">
          Creative Minds
        </h2>

        <p className="text-neutral-600 font-medium leading-[1.9] max-w-xl mx-auto text-lg md:text-xl mt-4">
          Passionate creators who transform concepts into
          unforgettable experiences.
        </p>
      </div>

      <div className="relative h-[500px] md:h-[800px] rounded-3xl overflow-hidden">
        {/* Slides */}
        {TEAM_SLIDES.map((src, i) => (
          <div
            key={src}
            ref={(el) => { imageRefs.current[i] = el; }}
            className="absolute inset-0"
          >
            <img
              src={src}
              alt={`Team ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/25 z-[1]" />

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-[2]">
          {TEAM_SLIDES.map((_, i) => (
            <button
              key={i}
              ref={(el) => { dotRefs.current[i] = el; }}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className="h-2 rounded-full cursor-pointer"
              style={{
                width: i === 0 ? 32 : 8,
                backgroundColor: i === 0 ? '#ffffff' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
