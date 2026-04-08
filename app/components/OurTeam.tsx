'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const TEAM_SLIDES = [
  '/team/team.webp',
  '/team/team2.webp',
  '/team/team3.webp',
];

export default function OurTeam() {
  const sectionRef   = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs      = useRef<(HTMLButtonElement | null)[]>([]);
  const lineLeftRef  = useRef<HTMLSpanElement>(null);
  const lineRightRef = useRef<HTMLSpanElement>(null);
  const labelRef     = useRef<HTMLSpanElement>(null);
  const headingRef   = useRef<HTMLHeadingElement>(null);
  const paraRef      = useRef<HTMLParagraphElement>(null);

  const [active, setActive] = useState(0);
  const autoRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevRef  = useRef(0);
  const isFirst  = useRef(true);
  const total    = TEAM_SLIDES.length;

  /* ── Clip-path wipe + inner parallax ── */
  useEffect(() => {
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

    const prev  = prevRef.current;
    prevRef.current = active;
    if (active === prev) return;

    const newEl = imageRefs.current[active];
    const oldEl = imageRefs.current[prev];

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
      if (img) {
        gsap.fromTo(
          img,
          { scale: 1.12, x: 60 },
          { scale: 1, x: 0, duration: 1.4, ease: 'power3.out' },
        );
      }
    }

    if (oldEl) {
      gsap.set(oldEl, { zIndex: 1, clipPath: 'inset(0 0% 0 0)' });
    }

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

  /* ── Scroll-driven container shrink: full-width → padded + rounded ── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Start state: edge-to-edge, no radius
    gsap.set(container, { marginLeft: 0, marginRight: 0, borderRadius: 0 });

    const trig = gsap.fromTo(
      container,
      { marginLeft: 0, marginRight: 0, borderRadius: 0 },
      {
        marginLeft: 40,   // px-10
        marginRight: 40,
        borderRadius: 24, // rounded-3xl
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'bottom bottom',
          end:   'bottom bottom',
          scrub: 1.5,
        },
      },
    );

    return () => {
      trig.scrollTrigger?.kill();
      trig.kill();
    };
  }, []);

  /* ── Entrance — SplitText mask reveal ── */
  useEffect(() => {
    const lineL   = lineLeftRef.current;
    const lineR   = lineRightRef.current;
    const label   = labelRef.current;
    const heading = headingRef.current;
    const para    = paraRef.current;
    if (!lineL || !lineR || !label || !heading || !para) return;

    gsap.set([lineL, lineR], { scaleX: 0 });
    gsap.set(label, { opacity: 0, y: 20 });

    const splitH    = new SplitText(heading, { type: 'words,lines', mask: 'words' });
    const splitP    = new SplitText(para,    { type: 'words,lines', mask: 'words' });
    const headWords = [...splitH.words];
    const paraWords = [...splitP.words];
    gsap.set([...headWords, ...paraWords], { y: '110%' });

    let hasFired = false;
    let tl: gsap.core.Timeline | null = null;

    const runEntrance = () => {
      if (hasFired) return;
      hasFired = true;

      tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to([lineL, lineR], { scaleX: 1, duration: 0.55 })
        .to(label,          { opacity: 1, y: 0, duration: 0.45 },        '-=0.25')
        .to(headWords,      { y: '0%', duration: 0.62, stagger: 0.06 },  '-=0.2')
        .to(paraWords,      { y: '0%', duration: 0.48, stagger: 0.014 }, '-=0.38');
    };

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 80%',
      once: true,
      onEnter: runEntrance,
    });

    const rect = sectionRef.current?.getBoundingClientRect();
    if (rect && rect.top < window.innerHeight * 0.8) runEntrance();

    return () => {
      trigger.kill();
      tl?.kill();
      splitH.revert();
      splitP.revert();
    };
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
    // w-full — no horizontal constraints here; text gets its own wrapper
    <section ref={sectionRef} className="w-full pb-30 pt-20">

      {/* Text header — constrained to match site layout */}
      <div className="max-w-[1500px] mx-auto px-6 text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-6">
          <span
            ref={lineLeftRef}
            className="inline-block w-10 h-[2px] bg-brand/30 origin-right"
          />
          <span
            ref={labelRef}
            className="text-xs 2xl:text-xl tracking-[0.22em] uppercase text-brand/70 font-semibold"
          >
            Our Team
          </span>
          <span
            ref={lineRightRef}
            className="inline-block w-10 h-[2px] bg-brand/30 origin-left"
          />
        </div>

        <h2
          ref={headingRef}
          className="text-5xl md:text-8xl 2xl:text-[175px] font-bold text-brand leading-[1.05]"
        >
          Creative Minds
        </h2>

        <p
          ref={paraRef}
          className="text-neutral-600 font-medium leading-[1.9] max-w-xl mx-auto text-lg md:text-xl mt-4"
        >
          Passionate creators who transform concepts into
          unforgettable experiences.
        </p>
      </div>

      {/* Image container — starts edge-to-edge, GSAP animates margin + radius */}
      <div
        ref={containerRef}
        className="relative h-[500px] md:h-[850px] 2xl:h-[1500px] overflow-hidden"
      >
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
