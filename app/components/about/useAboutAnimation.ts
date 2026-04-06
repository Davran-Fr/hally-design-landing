import { useEffect } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CARDS, CARD_COUNT, SLIDES, TILT_X } from './constants';

gsap.registerPlugin(ScrollTrigger);

interface Refs {
  sectionRef:   RefObject<HTMLElement | null>;
  cylinderRef:  RefObject<HTMLDivElement | null>;
  cardRefs:     RefObject<(HTMLDivElement | null)[]>;
  imgRefs:      RefObject<(HTMLImageElement | null)[]>;
  wordRef:      RefObject<HTMLSpanElement | null>;
  paraRef:      RefObject<HTMLParagraphElement | null>;
  dotRefs:      RefObject<(HTMLButtonElement | null)[]>;
  lineRef:      RefObject<HTMLSpanElement | null>;
  labelRef:     RefObject<HTMLSpanElement | null>;
  textBlockRef: RefObject<HTMLDivElement | null>;
}

export function useAboutAnimation(refs: Refs) {
  const {
    sectionRef, cylinderRef, cardRefs, imgRefs,
    wordRef, paraRef, dotRefs, lineRef, labelRef, textBlockRef,
  } = refs;

  useEffect(() => {
    const el = cylinderRef.current;
    if (!el) return;

    // ── Cylinder auto-rotate ──
    const state = { ry: 0 };
    const rotateTween = gsap.to(state, {
      ry: 360,
      duration: 40,
      ease: 'none',
      repeat: -1,
      paused: true,
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
    let isDragging    = false;
    let dragStartX    = 0;
    let ryAtDragStart = 0;
    let resumeTimer: ReturnType<typeof setTimeout>;

    const onPointerDown = (e: PointerEvent) => {
      isDragging    = true;
      dragStartX    = e.clientX;
      ryAtDragStart = state.ry;
      rotateTween.pause();
      clearTimeout(resumeTimer);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      if (wrap) wrap.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const newRy = ryAtDragStart + (e.clientX - dragStartX) * 0.5;
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
      resumeTimer = setTimeout(() => {
        rotateTween.time((state.ry / 360) * rotateTween.duration());
        rotateTween.resume();
      }, 800);
    };

    if (wrap) {
      wrap.style.cursor = 'grab';
      wrap.addEventListener('pointerdown',  onPointerDown);
      wrap.addEventListener('pointermove',  onPointerMove);
      wrap.addEventListener('pointerup',    onPointerUp);
      wrap.addEventListener('pointercancel', onPointerUp);
    }

    // ── Scroll-driven slide controller ──
    const wordEl = wordRef.current;
    const paraEl = paraRef.current;
    if (!wordEl || !paraEl) return;

    let current       = 0;
    let currentImages = 0;
    let pendingIndex  = -1;
    let spinTween: gsap.core.Tween | null = null;
    let imgTween:  gsap.core.Tween | null = null;

    const dots = dotRefs.current.filter(Boolean) as HTMLButtonElement[];

    // ── Entrance animation ──
    const line  = lineRef.current;
    const label = labelRef.current;
    if (textBlockRef.current && line && label) {
      gsap.set([label, wordEl, paraEl, ...dots], { opacity: 0, y: 30 });
      gsap.set(line, { scaleX: 0 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          // Text entrance
          gsap.timeline({ defaults: { ease: 'power3.out' } })
            .to(line,  { scaleX: 1, duration: 0.6 })
            .to(label, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
            .to(wordEl, { opacity: 1, y: 0, duration: 0.6 }, '-=0.2')
            .to(paraEl, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
            .to(dots,  { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, '-=0.3');

          // Carousel entrance: fast spin → decelerate to normal
          rotateTween.timeScale(20);
          rotateTween.play();
          gsap.to(rotateTween, { timeScale: 1, duration: 3, ease: 'power3.out' });
        },
      });
    }

    // ── Helpers ──
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

    const swapImages = (index: number) => {
      if (index === currentImages) return;
      const prevIndex = currentImages;
      currentImages = index;

      imgTween?.kill();

      const prevImgs: HTMLImageElement[] = [];
      const nextImgs: HTMLImageElement[] = [];
      for (let i = 0; i < CARD_COUNT; i++) {
        const prev = imgRefs.current[prevIndex * CARD_COUNT + i];
        const next = imgRefs.current[index  * CARD_COUNT + i];
        if (prev) prevImgs.push(prev);
        if (next) nextImgs.push(next);
      }

      gsap.to(prevImgs, { opacity: 0, duration: 0.3, ease: 'power1.in' });
      imgTween = gsap.to(nextImgs, { opacity: 1, duration: 0.3, ease: 'power1.out' });
    };

    const decelerate = () => {
      spinTween?.kill();
      spinTween = gsap.to(rotateTween, {
        timeScale: 1,
        duration: 1.4,
        ease: 'power3.out',
        onComplete: () => {
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

      if (rotateTween.timeScale() > 2) {
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

      gsap.killTweensOf([wordEl, paraEl]);
      gsap.to([wordEl, paraEl], {
        opacity: 0,
        y: -18,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          wordEl.textContent = SLIDES[index].word;
          paraEl.textContent = SLIDES[index].text;
          gsap.fromTo(
            [wordEl, paraEl],
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
          );
        },
      });

      spinTween?.kill();
      spinTween = gsap.to(rotateTween, {
        timeScale: 8,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          swapImages(current);
          decelerate();
        },
      });
    };

    // ── Pin + scroll progress ──
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=200%',
      pin: true,
      onUpdate: (self) => {
        const p = self.progress;
        if      (p < 0.33) goTo(0);
        else if (p < 0.66) goTo(1);
        else               goTo(2);
      },
    });

    return () => {
      rotateTween.kill();
      spinTween?.kill();
      imgTween?.kill();
      clearTimeout(resumeTimer);
      wrap?.removeEventListener('pointerdown',   onPointerDown);
      wrap?.removeEventListener('pointermove',   onPointerMove);
      wrap?.removeEventListener('pointerup',     onPointerUp);
      wrap?.removeEventListener('pointercancel', onPointerUp);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps
}
