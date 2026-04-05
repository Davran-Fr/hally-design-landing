'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const RADIUS = 250;
const CARD_W = 320;
const CARD_H = 220;
const TILT_X = -8;
const CARD_COUNT = 5;

const SLIDES = [
  {
    word: 'Design',
    text: 'We curate art, shape environments, and command light — three disciplines united by a single belief that every space has the power to leave a lasting impression.',
    images: [
      '/images/design2.jpg',
      '/images/design3.jpg',
      '/images/design4.jpg',
      '/images/design5.jpg',
      '/images/design2.jpg', // 5th card — repeat
    ],
  },
  {
    word: 'Art Gallery',
    text: 'We collect and present works that challenge perception, provoke emotion, and transform ordinary walls into windows of meaning.',
    images: [
      '/images/gallery.jpg',
      '/images/gallery2.jpg',
      '/images/gallery3.jpg',
      '/images/gallery.jpg',
      '/images/gallery2.jpg',
    ],
  },
  {
    word: 'Lighting',
    text: 'We engineer light as a material — sculpting atmosphere, guiding focus, and turning architecture into lived experience.',
    images: [
      '/images/lighting.jpg',
      '/images/lighting2.jpg',
      '/images/lighting3.jpg',
      '/images/lighting.jpg',
      '/images/lighting2.jpg',
    ],
  },
];

const CARDS = Array.from({ length: CARD_COUNT }, (_, i) => ({
  angle: i * (360 / CARD_COUNT),
}));

export default function About() {
  const sectionRef  = useRef<HTMLElement>(null);
  const cylinderRef = useRef<HTMLDivElement>(null);
  const cardRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs     = useRef<(HTMLImageElement | null)[]>([]);
  const wordRef     = useRef<HTMLSpanElement>(null);
  const paraRef     = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = cylinderRef.current;
    if (!el) return;

    // ── Cylinder auto-rotate ──
    const state = { ry: 0 };
    const tween = gsap.to(state, {
      ry: 360,
      duration: 40,
      ease: 'none',
      repeat: -1,
      onUpdate: () => {
        el.style.transform = `rotateX(${TILT_X}deg) rotateY(${state.ry}deg)`;
        cardRefs.current.forEach((card, i) => {
          if (!card) return;
          const effective = ((CARDS[i].angle + state.ry) % 360 + 360) % 360;
          const cos = Math.cos((effective * Math.PI) / 180);
          card.style.opacity = String(0.35 + 0.65 * ((cos + 1) / 2));
        });
      },
    });

    const wrap = el.parentElement;
    const pause  = () => tween.pause();
    const resume = () => tween.resume();
    wrap?.addEventListener('mouseenter', pause);
    wrap?.addEventListener('mouseleave', resume);

    // ── Scroll-driven text + image swap ──
    const wordEl = wordRef.current;
    const paraEl = paraRef.current;
    if (!wordEl || !paraEl) return;

    let current = 0;

    const goTo = (index: number) => {
      if (index === current) return;
      current = index;
      const slide = SLIDES[index];

      // Fade out text
      gsap.to([wordEl, paraEl], {
        opacity: 0,
        y: -18,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          wordEl.textContent = slide.word;
          paraEl.textContent = slide.text;
          gsap.fromTo(
            [wordEl, paraEl],
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
          );
        },
      });

      // Fade out cards, swap images, fade in
      gsap.to(imgRefs.current.filter(Boolean), {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          imgRefs.current.forEach((img, i) => {
            if (!img) return;
            img.src = slide.images[i];
          });
          gsap.to(imgRefs.current.filter(Boolean), {
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
        },
      });
    };

    // Pin the section
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=200%',
      pin: true,
      onUpdate: (self) => {
        const p = self.progress;
        if (p < 0.33) goTo(0);
        else if (p < 0.66) goTo(1);
        else goTo(2);
      },
    });

    return () => {
      tween.kill();
      wrap?.removeEventListener('mouseenter', pause);
      wrap?.removeEventListener('mouseleave', resume);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen px-6 md:px-16 max-w-[1400px] mt-20 mx-auto flex flex-col md:flex-row items-center justify-center gap-16 overflow-hidden"
    >
      {/* ── Left: text ── */}
      <div className="md:w-[58%] shrink-0 flex flex-col">
        <h2 className="text-7xl text-brand font-bold">
          <span className="text-xs tracking-[0.22em] uppercase text-black font-medium mr-2">
            About
          </span>
          <span ref={wordRef} style={{ display: 'block' }}>
            {SLIDES[0].word}
          </span>
        </h2>

        <p
          ref={paraRef}
          className="text-neutral-700 font-medium leading-[1.9] max-w-lg text-2xl mt-7"
        >
          {SLIDES[0].text}
        </p>
      </div>

      {/* ── Right: 3D cylinder carousel ── */}
      <div
        className="flex-1 flex items-center justify-center"
        style={{
          height: 520,
          perspective: '1200px',
          perspectiveOrigin: '10% 50%',
        }}
      >
        <div
          ref={cylinderRef}
          style={{
            position: 'relative',
            width: CARD_W,
            height: CARD_H,
            transformStyle: 'preserve-3d',
            transform: `rotateX(${TILT_X}deg) rotateY(0deg)`,
            willChange: 'transform',
          }}
        >
          {CARDS.map(({ angle }, i) => (
            <div
              key={angle}
              ref={(el) => { cardRefs.current[i] = el; }}
              style={{
                position: 'absolute',
                inset: 0,
                transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={(el) => { imgRefs.current[i] = el; }}
                src={SLIDES[0].images[i]}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 10,
                  display: 'block',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
