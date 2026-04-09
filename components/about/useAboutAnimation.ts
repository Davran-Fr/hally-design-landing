import { useEffect } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CARDS, CARD_COUNT, SLIDES, TILT_X } from './constants';

gsap.registerPlugin(ScrollTrigger, SplitText);

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
    // ── All null-checks up front so cleanup always runs ──
    const el       = cylinderRef.current;
    const wordEl   = wordRef.current;
    const paraEl   = paraRef.current;
    const line     = lineRef.current;
    const label    = labelRef.current;
    const wrap     = el?.parentElement ?? null;

    if (!el || !wordEl || !paraEl) return;

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
    let isDragging    = false;
    let dragStartX    = 0;
    let ryAtDragStart = 0;
    let resumeTimer: ReturnType<typeof setTimeout> | undefined;

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
      wrap.addEventListener('pointerdown',   onPointerDown);
      wrap.addEventListener('pointermove',   onPointerMove);
      wrap.addEventListener('pointerup',     onPointerUp);
      wrap.addEventListener('pointercancel', onPointerUp);
    }

    // ── Slide state ──
    let current       = 0;
    let currentImages = 0;
    let pendingIndex  = -1;
    let spinTween:    gsap.core.Tween    | null = null;
    let imgTween:     gsap.core.Tween    | null = null;
    let activeTl:     gsap.core.Timeline | null = null; // slide transition TL
    let entranceTl:   gsap.core.Timeline | null = null; // entrance TL (tracked separately)

    let splitWord: InstanceType<typeof SplitText> | null = null;
    let splitPara: InstanceType<typeof SplitText> | null = null;

    const dots = dotRefs.current.filter(Boolean) as HTMLButtonElement[];

    // ── SplitText helpers ──

    // Kill slide-transition timeline + any stray word tweens + entrance if still running
    const killActive = () => {
      if (entranceTl) {
        // Snap line/label/dots to their final visible state before killing —
        // otherwise they stay at opacity:0 / scaleX:0 forever if the entrance
        // was interrupted before it could render a single frame.
        entranceTl.progress(1);
        entranceTl.kill();
        entranceTl = null;
      }
      activeTl?.kill();
      activeTl = null;
      if (splitWord?.words) gsap.killTweensOf(splitWord.words);
      if (splitPara?.words) gsap.killTweensOf(splitPara.words);
    };

    // Revert → set new text → re-split → animate words in.
    // revert() MUST come before textContent change — SplitText.revert()
    // restores the original text node, overwriting any change made before it.
    const swapAndEnter = (index: number, fromY: string) => {
      splitWord?.revert();
      splitPara?.revert();
      splitWord = null;
      splitPara = null;

      wordEl.textContent = SLIDES[index].word;
      paraEl.textContent = SLIDES[index].text;

      splitWord = new SplitText(wordEl, { type: 'words,lines', mask: 'words' });
      splitPara = new SplitText(paraEl, { type: 'words,lines', mask: 'words' });

      gsap.set([...splitWord.words, ...splitPara.words], { y: fromY });

      activeTl = gsap.timeline()
        .to(splitWord.words, { y: '0%', duration: 0.55, ease: 'power3.out', stagger: 0.055 })
        .to(splitPara.words, { y: '0%', duration: 0.42, ease: 'power3.out', stagger: 0.014 }, '-=0.28');
    };

    // Exit current words, then swap content and enter new words.
    // isForward true  → scroll down: exit ↑, enter from ↓
    // isForward false → scroll up:   exit ↓, enter from ↑
    const transitionSlide = (index: number, isForward: boolean) => {
      const toY   = isForward ? '-110%' : '110%';
      const fromY = isForward ? '110%'  : '-110%';

      if (splitWord?.words.length && splitPara?.words.length) {
        activeTl = gsap.timeline({ onComplete: () => swapAndEnter(index, fromY) })
          .to(splitWord.words, { y: toY, duration: 0.26, ease: 'power2.in', stagger: 0.016 })
          .to(splitPara.words, { y: toY, duration: 0.20, ease: 'power2.in', stagger: 0.010 }, '<0.04');
      } else {
        swapAndEnter(index, fromY);
      }
    };

    // ── Entrance animation ──
    if (textBlockRef.current && line && label) {
      // Split once; capture word arrays locally so the runEntrance closure
      // is not affected if splitWord/splitPara change before it fires.
      splitWord = new SplitText(wordEl, { type: 'words,lines', mask: 'words' });
      splitPara = new SplitText(paraEl, { type: 'words,lines', mask: 'words' });

      const entryWordEls = [...splitWord.words];
      const entryParaEls = [...splitPara.words];

      gsap.set([label, ...dots], { opacity: 0, y: 30 });
      gsap.set(line, { scaleX: 0 });
      gsap.set([...entryWordEls, ...entryParaEls], { y: '110%' });

      // Guard prevents double-firing if both ScrollTrigger and the
      // immediate-check below would otherwise both call runEntrance.
      let entranceHasFired = false;
      const runEntrance = () => {
        if (entranceHasFired) return;
        entranceHasFired = true;

        entranceTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
          .to(line,         { scaleX: 1, duration: 0.6 })
          .to(label,        { opacity: 1, y: 0, duration: 0.5 },          '-=0.3')
          .to(entryWordEls, { y: '0%', duration: 0.62, stagger: 0.06 },   '-=0.2')
          .to(entryParaEls, { y: '0%', duration: 0.48, stagger: 0.014 },  '-=0.38')
          .to(dots,         { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, '-=0.28');

        // Carousel entrance: fast spin → decelerate to normal speed
        rotateTween.timeScale(20);
        rotateTween.play();
        gsap.to(rotateTween, { timeScale: 1, duration: 3, ease: 'power3.out' });
      };

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true,
        onEnter: runEntrance,
      });

      // onEnter only fires when scrolling down into view — it never fires
      // if the page is refreshed while the section is already visible or
      // scrolled past. Detect that case and run entrance immediately.
      const rect = sectionRef.current?.getBoundingClientRect();
      if (rect && rect.top < window.innerHeight * 0.8) {
        runEntrance();
      }
    }

    // ── Dot indicators ──
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

    // ── Image swap ──
    const swapImages = (index: number) => {
      if (index === currentImages) return;
      const prevIndex = currentImages;
      currentImages = index;
      imgTween?.kill();
      const prevImgs: HTMLImageElement[] = [];
      const nextImgs: HTMLImageElement[] = [];
      for (let i = 0; i < CARD_COUNT; i++) {
        const prev = imgRefs.current[prevIndex * CARD_COUNT + i];
        const next = imgRefs.current[index    * CARD_COUNT + i];
        if (prev) prevImgs.push(prev);
        if (next) nextImgs.push(next);
      }
      gsap.to(prevImgs, { opacity: 0, duration: 0.3, ease: 'power1.in' });
      imgTween = gsap.to(nextImgs, { opacity: 1, duration: 0.3, ease: 'power1.out' });
    };

    // ── Cylinder decelerate ──
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

    // ── Slide controller ──
    const goTo = (index: number) => {
      if (index === current) return;

      const isForward = index > current;

      // Fast-spin path: skip long exit, just swap and enter
      if (rotateTween.timeScale() > 2) {
        pendingIndex = index;
        current = index;
        killActive();
        swapAndEnter(index, isForward ? '110%' : '-110%');
        swapImages(index);
        updateDots(index);
        return;
      }

      current = index;
      pendingIndex = -1;
      updateDots(index);

      killActive();
      transitionSlide(index, isForward);

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

    // ── Cleanup ──
    return () => {
      rotateTween.kill();
      spinTween?.kill();
      imgTween?.kill();
      activeTl?.kill();
      entranceTl?.kill();
      splitWord?.revert();
      splitPara?.revert();
      clearTimeout(resumeTimer);
      if (wrap) {
        wrap.removeEventListener('pointerdown',   onPointerDown);
        wrap.removeEventListener('pointermove',   onPointerMove);
        wrap.removeEventListener('pointerup',     onPointerUp);
        wrap.removeEventListener('pointercancel', onPointerUp);
      }
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps
}
