'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

const WORDS = ['Design', 'Art Gallery', 'Lighting'];

export default function Hero() {
  const wordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = wordRef.current;
    if (!el) return;

    let index = 0;

    const cycle = () => {
      el.textContent = WORDS[index];

      const split = new SplitText(el, { type: 'chars' });
      const chars = split.chars;

      // ── Enter: буквы влетают слева по одной ──
      gsap.fromTo(
        chars,
        { x: -40, opacity: 0, filter: 'blur(6px)' },
        {
          x: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.5,
          ease: 'expo.out',
          stagger: 0.04,
          onComplete: () => {
            // ── Exit: буквы уходят вправо — быстро, резко ──
            gsap.to(chars, {
              x: 40,
              opacity: 0,
              filter: 'blur(6px)',
              duration: 0.3,
              ease: 'expo.in',
              stagger: 0.03,
              delay: 2,
              onComplete: () => {
                split.revert();
                index = (index + 1) % WORDS.length;
                cycle();
              },
            });
          },
        }
      );
    };

    cycle();
    return () => gsap.killTweensOf(el);
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center">
      <div className="flex items-baseline pl-20 gap-4">
        <h1 className="text-6xl text-brand  font-black shrink-0">Hally</h1>

        {/* fixed width = longest word "Art Gallery", overflow-hidden clips slide */}
        <div className="overflow-hidden w-[220px]">
          <p
            className="text-3xl font-extralight tracking-[-0.02em] select-none"
            style={{ WebkitTextStroke: '1px #1F7872', color: 'transparent' }}
          >
            <span ref={wordRef} className="inline-block" />
          </p>
        </div>
      </div>
    </section>
  );
}
