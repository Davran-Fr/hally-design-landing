'use client';

import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

const BRAND = '#1F7872';

const ITEMS = [
  {
    id: 'formats',
    title: 'What file formats do you deliver?',
    description:
      'All projects are delivered in industry-standard formats: floor plans and technical drawings as PDF and DWG, 3D models as OBJ or FBX, brand assets as AI and SVG with exported PNG and PDF sets. Every file is named, versioned, and structured so your contractor or printer can work with it directly — no reformatting required.',
    tags: 'PDF · DWG · SVG · OBJ',
    image: '/images/design5.jpg',
  },
  {
    id: 'software',
    title: 'Which tools and software do you use?',
    description:
      'Spatial and interior work is produced in AutoCAD and Revit for technical documentation, with 3ds Max or Blender for visualization. Brand and graphic work runs through the Adobe suite. All outputs are software-agnostic — you receive files, not subscriptions.',
    tags: 'AutoCAD · Revit · Blender · Adobe',
    image: '/images/gallery2.jpg',
  },
  {
    id: 'revisions',
    title: 'How are revisions handled?',
    description:
      'Each project phase includes a defined revision window. Feedback is collected through a structured review document — not email threads. Changes are tracked, versioned, and applied in a single consolidated pass. You always have access to the previous version until the updated one is signed off.',
    tags: 'Versioning · Review · Sign-off',
    image: '/images/lighting2.jpg',
  },
  {
    id: 'visualization',
    title: 'Do you provide 3D renders and walkthroughs?',
    description:
      'Photorealistic renders and animated walkthroughs are available for spatial and interior projects. Renders are produced at a minimum of 4K resolution with full lighting simulation. Interactive walkthroughs are exported as standalone web files — no special software needed on your end to view or share them.',
    tags: '4K Renders · Animation · Web Export',
    image: '/images/design5.jpg',
  },
  {
    id: 'collaboration',
    title: 'Can you integrate with our existing contractors?',
    description:
      'Yes. We regularly coordinate with structural engineers, builders, and AV integrators. We share technical packages directly in their preferred format and attend coordination calls as needed. Our drawings are dimensionally complete and annotated to contractor-ready standard — no interpretation layer between design and build.',
    tags: 'Coordination · Documentation · Handoff',
    image: '/images/gallery2.jpg',
  },
] as const;

type Item = (typeof ITEMS)[number];

interface RowProps {
  item: Item;
  isOpen: boolean;
  onToggle: () => void;
}

function Row({ item, isOpen, onToggle }: RowProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const plusRef = useRef<HTMLSpanElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const prevOpen = useRef(isOpen);

  useLayoutEffect(() => {
    gsap.set(bodyRef.current, { height: 0 });
    gsap.set(hoverRef.current, { yPercent: 100 });
  }, []);

  const handleMouseEnter = () => {
    if (isOpen) return;
    gsap.killTweensOf(hoverRef.current);
    gsap.to(hoverRef.current, { yPercent: 0, duration: 0.4, ease: 'power3.out' });
    gsap.to([titleRef.current, plusRef.current], { color: '#ffffff', duration: 0.28, ease: 'power2.out' });
  };

  const handleMouseLeave = () => {
    if (isOpen) return;
    gsap.killTweensOf(hoverRef.current);
    gsap.to(hoverRef.current, { yPercent: 100, duration: 0.35, ease: 'power3.in' });
    gsap.to([titleRef.current, plusRef.current], {
      color: '#000000', duration: 0.28, ease: 'power2.out',
      onComplete() { gsap.set([titleRef.current, plusRef.current], { clearProps: 'color' }); },
    });
  };

  useEffect(() => {
    if (prevOpen.current === isOpen) return;
    prevOpen.current = isOpen;

    tlRef.current?.kill();
    gsap.killTweensOf([wrapRef.current, bodyRef.current, titleRef.current, plusRef.current, imgRef.current, textRef.current, hoverRef.current]);

    if (isOpen) {
      gsap.set(wrapRef.current, { backgroundColor: BRAND });
      gsap.set(hoverRef.current, { yPercent: 100 });

      tlRef.current = gsap.timeline()
        .to(plusRef.current, { rotation: 45, color: '#ffffff', duration: 0.32, ease: 'power2.out' }, 0)
        .to(titleRef.current, { color: '#ffffff', duration: 0.28, ease: 'power2.out' }, 0.04)
        .to(bodyRef.current, { height: 'auto', duration: 0.68, ease: 'power3.inOut' }, 0.22)
        .fromTo(imgRef.current, { scale: 1.08 }, { scale: 1, duration: 0.82, ease: 'power3.out' }, 0.5)
        .fromTo(textRef.current, { y: 32 }, { y: 0, duration: 0.58, ease: 'power3.out' }, 0.66);
    } else {
      const stillHovered = wrapRef.current?.matches(':hover');

      if (stillHovered) {
        gsap.set(hoverRef.current, { yPercent: 0 });
      }

      const textColor = stillHovered ? '#ffffff' : '#000000';

      tlRef.current = gsap.timeline()
        .to(textRef.current, { y: 16, duration: 0.28, ease: 'power2.in' }, 0)
        .to(bodyRef.current, { height: 0, duration: 0.52, ease: 'power3.inOut' }, 0.12)
        .to(wrapRef.current, {
          backgroundColor: 'rgba(0,0,0,0)', duration: 0.4, ease: 'power2.inOut',
          onComplete() { gsap.set(wrapRef.current, { clearProps: 'backgroundColor' }); },
        }, 0.28)
        .to(titleRef.current, {
          color: textColor, duration: 0.32, ease: 'power2.out',
          onComplete() { if (!stillHovered) gsap.set(titleRef.current, { clearProps: 'color' }); },
        }, 0.28)
        .to(plusRef.current, {
          rotation: 0, color: textColor, duration: 0.3, ease: 'power2.out',
          onComplete() { if (!stillHovered) gsap.set(plusRef.current, { clearProps: 'color' }); },
        }, 0.28);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => { tlRef.current?.kill(); };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="faq-row border-t rounded-3xl border-brand relative overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={hoverRef}
        className="absolute inset-0 bg-brand rounded-3xl pointer-events-none"
      />

      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
        className="relative z-10 w-full cursor-pointer text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-between py-5 md:py-7 px-6 md:px-10">
          <span ref={titleRef} className="text-[clamp(2rem,5vw,3rem)] text-black tracking-tight leading-none">
            {item.title}
          </span>
          <span
            ref={plusRef}
            className="text-black text-2xl font-thin ml-6 flex-shrink-0 inline-block origin-center select-none"
            aria-hidden
          >
            +
          </span>
        </div>

        <div ref={bodyRef} style={{ overflow: 'hidden' }}>
          <div className="grid grid-cols-1 md:grid-cols-[5fr_6fr] pb-10 md:pb-16 px-6 md:px-10 gap-8 md:gap-0">
            <div ref={textRef} className="flex flex-col justify-between pr-0 md:pr-16">
              <div>
                <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-md">{item.description}</p>
              </div>
              <p className="text-white/30 text-xs mt-10 tracking-[0.25em] uppercase">{item.tags}</p>
            </div>

            <div ref={imgRef} className="relative h-56 rounded-3xl md:h-[440px] overflow-hidden">
              <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 55vw" className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);

  const toggle = (id: string) => setOpenId(p => (p === id ? null : id));

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        defaults: { ease: 'power3.out' },
      });
      tl.fromTo(headRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
        .fromTo('.faq-row', { y: 28, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.65 }, 0.15);
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-10 md:pb-30 overflow-hidden">
      <div className="max-w-[1800px] px-6 mx-auto">
        <div ref={headRef} className="mb-14 md:mb-20">
          <div className="flex items-center gap-4 mb-3">
            <span className="w-10 h-px bg-brand/30" />
            <p className="text-brand/70 text-sm tracking-[0.35em] font-medium uppercase whitespace-nowrap">
              Frequently Asked
            </p>
          </div>
          <h2 className="text-brand text-5xl md:text-8xl font-medium tracking-tight leading-none">
            Questions
          </h2>
        </div>

        <div>
          {ITEMS.map((item) => (
            <Row
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => toggle(item.id)}
            />
          ))}
          <div className="border-t border-white/10" />
        </div>
      </div>
    </section>
  );
}