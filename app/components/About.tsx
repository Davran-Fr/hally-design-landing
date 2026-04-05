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
  const dotRefs     = useRef<(HTMLButtonElement | null)[]>([]);
  const lineRef     = useRef<HTMLSpanElement>(null);
  const labelRef    = useRef<HTMLSpanElement>(null);
  const textBlockRef = useRef<HTMLDivElement>(null);

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

    // ── Drag to rotate ──
    const wrap = el.parentElement;
    let isDragging = false;
    let dragStartX = 0;
    let ryAtDragStart = 0;
    let resumeTimer: ReturnType<typeof setTimeout>;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragStartX = e.clientX;
      ryAtDragStart = state.ry;
      tween.pause();
      clearTimeout(resumeTimer);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      if (wrap) wrap.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const newRy = ryAtDragStart + dx * 0.5;
      state.ry = ((newRy % 360) + 360) % 360;
      el.style.transform = `rotateX(${TILT_X}deg) rotateY(${state.ry}deg)`;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const effective = ((CARDS[i].angle + state.ry) % 360 + 360) % 360;
        const cos = Math.cos((effective * Math.PI) / 180);
        card.style.opacity = String(0.35 + 0.65 * ((cos + 1) / 2));
      });
    };

    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      if (wrap) wrap.style.cursor = 'grab';
      // Sync tween playhead to current rotation, then resume
      resumeTimer = setTimeout(() => {
        const dur = tween.duration();
        tween.time((state.ry / 360) * dur);
        tween.resume();
      }, 800);
    };

    if (wrap) {
      wrap.style.cursor = 'grab';
      wrap.addEventListener('pointerdown', onPointerDown);
      wrap.addEventListener('pointermove', onPointerMove);
      wrap.addEventListener('pointerup', onPointerUp);
      wrap.addEventListener('pointercancel', onPointerUp);
    }


    // ── Scroll-driven text + image swap ──
    const wordEl = wordRef.current;
    const paraEl = paraRef.current;
    if (!wordEl || !paraEl) return;

    let current = 0;
    let currentImages = 0;
    let pendingIndex = -1;
    let spinTween: gsap.core.Tween | null = null;
    let imgTween: gsap.core.Tween | null = null;

    const imgs = imgRefs.current.filter(Boolean) as HTMLImageElement[];

    const dots = dotRefs.current.filter(Boolean) as HTMLButtonElement[];

    const updateDots = (index: number) => {
      dots.forEach((dot, i) => {
        gsap.to(dot, {
          width: i === index ? 32 : 8,
          backgroundColor: i === index ? '#1F7872' : '#d4d4d4',
          duration: 0.4,
          ease: 'power2.out',
        });
      });
    };

    // ── Entrance animation ──
    const textBlock = textBlockRef.current;
    const line = lineRef.current;
    const label = labelRef.current;
    if (textBlock && line && label) {
      gsap.set([label, wordRef.current, paraRef.current, ...dots], { opacity: 0, y: 30 });
      gsap.set(line, { scaleX: 0 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
          tl.to(line, { scaleX: 1, duration: 0.6 })
            .to(label, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
            .to(wordRef.current, { opacity: 1, y: 0, duration: 0.6 }, '-=0.2')
            .to(paraRef.current, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
            .to(dots, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, '-=0.3');
        },
      });
    }

    const swapImages = (index: number) => {
      if (index === currentImages) return;
      currentImages = index;

      // Kill any in-progress image tween
      imgTween?.kill();

      imgTween = gsap.to(imgs, {
        opacity: 0,
        duration: 0.15,
        ease: 'power1.in',
        onComplete: () => {
          imgs.forEach((img, i) => { img.src = SLIDES[index].images[i]; });
          imgTween = gsap.to(imgs, { opacity: 1, duration: 0.3, ease: 'power1.out' });
        },
      });
    };

    const decelerate = () => {
      spinTween?.kill();
      spinTween = gsap.to(tween, {
        timeScale: 1,
        duration: 1.4,
        ease: 'power3.out',
        onComplete: () => {
          // If a new slide was requested while spinning — apply it now
          if (pendingIndex !== -1 && pendingIndex !== current) {
            const next = pendingIndex;
            pendingIndex = -1;
            goTo(next);
          }
        },
      });
    };

    const goTo = (index: number) => {
      if (index === current) return;

      // If already spinning fast — swap text + images immediately
      if (tween.timeScale() > 2) {
        pendingIndex = index;
        current = index;
        gsap.killTweensOf([wordEl, paraEl]);
        wordEl.textContent = SLIDES[index].word;
        paraEl.textContent = SLIDES[index].text;
        gsap.fromTo([wordEl, paraEl], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.3 });
        swapImages(index);
        updateDots(index);
        return;
      }

      current = index;
      pendingIndex = -1;
      updateDots(index);
      const slide = SLIDES[index];

      // Fade out text → swap → fade in
      gsap.killTweensOf([wordEl, paraEl]);
      gsap.to([wordEl, paraEl], {
        opacity: 0,
        y: -18,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          wordEl.textContent = slide.word;
          paraEl.textContent = slide.text;
          gsap.fromTo(
            [wordEl, paraEl],
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
          );
        },
      });

      // Accelerate → swap images → decelerate
      spinTween?.kill();
      spinTween = gsap.to(tween, {
        timeScale: 8,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          swapImages(current);
          decelerate();
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
      clearTimeout(resumeTimer);
      wrap?.removeEventListener('pointerdown', onPointerDown);
      wrap?.removeEventListener('pointermove', onPointerMove);
      wrap?.removeEventListener('pointerup', onPointerUp);
      wrap?.removeEventListener('pointercancel', onPointerUp);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen px-6 md:px-16 max-w-[1400px] mt-20 mx-auto flex flex-col md:flex-row items-center justify-center gap-16 overflow-hidden"
    >
      {/* ── Left: text ── */}
      <div ref={textBlockRef} className="md:w-[58%] shrink-0 flex flex-col">
        {/* Label with decorative line */}
        <div className="flex items-center gap-3 mb-4">
          <span
            ref={lineRef}
            className="inline-block w-10 h-[2px] bg-brand origin-left"
          />
          <span
            ref={labelRef}
            className="text-xs tracking-[0.22em] uppercase text-brand font-semibold"
          >
            About
          </span>
        </div>

        {/* Heading */}
        <h2 className="relative">
          <span
            ref={wordRef}
            className="text-7xl md:text-8xl font-bold text-brand block leading-[1.05]"
          >
            {SLIDES[0].word}
          </span>
        </h2>

        {/* Description */}
        <p
          ref={paraRef}
          className="text-neutral-600 font-medium leading-[1.9] max-w-lg text-lg md:text-xl mt-8"
        >
          {SLIDES[0].text}
        </p>

        {/* Slide indicators */}
        <div className="flex items-center gap-2 mt-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              ref={(el) => { dotRefs.current[i] = el; }}
              aria-label={`Slide ${i + 1}`}
              className="h-2 rounded-full transition-colors"
              style={{
                width: i === 0 ? 32 : 8,
                backgroundColor: i === 0 ? '#1F7872' : '#d4d4d4',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Right: 3D cylinder carousel ── */}
      <div
        className="flex-1 flex items-center justify-center select-none"
        style={{
          height: 520,
          perspective: '1200px',
          perspectiveOrigin: '10% 50%',
          touchAction: 'none',
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
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 10,
                  display: 'block',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
