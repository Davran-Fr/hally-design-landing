'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

gsap.registerPlugin(SplitText, ScrollTrigger, ScrollSmoother);

const WORDS = ['Design', 'Art Gallery', 'Lighting'];

const VIDEOS = [
  '/video/design.webm',
  '/video/design2.webm',
  '/video/design3.webm',
  '/video/design4.webm',
  '/video/design5.webm',
  '/video/design6.webm',
  '/video/gallery.webm',
  '/video/gallery2.webm',
  '/video/lighting1.webm',
];

// Senior designer layout: organic scatter, varied sizes, slight tilts, depth via opacity
// opacity: 1 = featured | 0.5 = supporting | 0.1 = ghostly background
// speed < 1 → drifts behind scroll (distant) | speed > 1 → leads scroll (close)
const VIDEO_CARDS: {
  pos: React.CSSProperties;
  size: string;
  rotate: string;
  opacity: number;
  speed: number;
}[] = [
  { pos: { top: '-4%',  left: '-2%'   },              size: 'w-62 h-52', rotate: '-2deg',   opacity: 1,   speed: 0.80 }, // featured
  { pos: { top: '20%', left: '25%'  },              size: 'w-42 h-32', rotate: '1.5deg',  opacity: 0.1, speed: 0.50 }, // supporting
  { pos: { top: '5%',  right: '29%' },              size: 'w-42 h-32', rotate: '-1deg',   opacity: 0.2, speed: 0.60 }, // ghostly
  { pos: { top: '-10%',  right: '2%'  },              size: 'w-62 h-52', rotate: '2deg',    opacity: 1,   speed: 0.85 }, // featured
  { pos: { top: '40%', left: '1%'   },              size: 'w-42 h-32', rotate: '1deg',    opacity: 1,   speed: 0.90 }, // ghostly
  { pos: { top: '37%', right: '15%' },              size: 'w-44 h-44', rotate: '-1.5deg', opacity: 1,   speed: 1.10 }, // supporting
  { pos: { top: '77%', left: 'calc(50% - 8px)' },  size: 'w-42 h-32', rotate: '1.5deg',  opacity: 0.5, speed: 0.70 }, // center-bottom
  { pos: { bottom: '-10%', left: '15%' },            size: 'w-62 h-52', rotate: '-1.5deg', opacity: 1,   speed: 0.75 }, // featured
  { pos: { bottom: '-20%',  right: '2%' },            size: 'w-62 h-52', rotate: '2deg',    opacity: 1,   speed: 0.80 }, // featured
];

export default function Hero() {
  const smoothWrapperRef = useRef<HTMLDivElement>(null);
  const smoothContentRef = useRef<HTMLDivElement>(null);
  const wordRef          = useRef<HTMLSpanElement>(null);
  const videoRefs        = useRef<(HTMLDivElement | null)[]>([]);

  // ScrollSmoother — wrapper/content enable smooth page scroll + data-speed parallax per card
  useEffect(() => {
    const smoother = ScrollSmoother.create({
      wrapper:  smoothWrapperRef.current!,
      content:  smoothContentRef.current!,
      smooth:   1.5,
      effects:  true,
    });
    return () => smoother.kill();
  }, []);

  // Staggered fade-in — each card animates to its own target opacity
  useEffect(() => {
    videoRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.92, y: 12 },
        {
          opacity: VIDEO_CARDS[i].opacity,
          scale: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          delay: 0.4 + i * 0.18,
        }
      );
    });
  }, []);

  // Cycling word animation
  useEffect(() => {
    const el = wordRef.current;
    if (!el) return;

    let index = 0;

    const cycle = () => {
      el.textContent = WORDS[index];

      const split = new SplitText(el, { type: 'chars' });
      const chars = split.chars;

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
    <div ref={smoothWrapperRef} style={{ overflow: 'hidden' }}>
      <div ref={smoothContentRef}>
    <section className="relative min-h-[100vh] flex items-center justify-center">
      {/* Video cards — data-speed drives ScrollSmoother parallax depth per card */}
      {VIDEOS.map((src, i) => (
        // outer: position anchor + fade-in target
        <div
          key={src}
          ref={(el) => { videoRefs.current[i] = el; }}
          className="absolute opacity-0"
          style={VIDEO_CARDS[i].pos}
          data-speed={VIDEO_CARDS[i].speed}
        >
          {/* inner: rotation + shadow — isolated from GSAP transforms */}
          <div
            className={`${VIDEO_CARDS[i].size} rounded-2xl overflow-hidden shadow-[0_8px_28px_rgba(0,0,0,0.10)]`}
            style={{ transform: `rotate(${VIDEO_CARDS[i].rotate})` }}
          >
            <video
              src={src}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ))}

      {/* Main text — above videos */}
      <div className="relative z-10 flex flex-col items-center gap-4">


        {/* Logo row */}
        <div className="flex items-baseline gap-4 pl-30">
          <h1 className="text-7xl text-brand font-black shrink-0">Hally</h1>
        {/* Description above logo */}
          <div className="overflow-hidden w-[220px]">
            <p
              className="text-3xl font-extralight tracking-[-0.02em] select-none"
              style={{ WebkitTextStroke: '1px #1F7872', color: 'transparent' }}
            >
              <span ref={wordRef} className="inline-block" />
            </p>
          </div>
        </div>
         <p className="max-w-[500px] text-center text-lg  font-light leading-[1.9] tracking-[0.02em] text-neutral-400 select-none">
          We curate art, shape environments, and command light —
          three disciplines united by a single belief that every space
          has the power to leave a lasting impression.
        </p>

      </div>
    </section>
      </div>
    </div>
  );
}
