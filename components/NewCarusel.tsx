"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  MouseEvent,
  TouchEvent,
} from "react";
import { gsap } from "gsap";

// ── Types ──────────────────────────────────────────────────────────────────

interface ImageItem {
  src: string;
  title?: string;
}

type CarouselItem = ImageItem | ReactNode;

function isImageItem(item: CarouselItem): item is ImageItem {
  return (
    typeof item === "object" &&
    item !== null &&
    !Array.isArray(item) &&
    "src" in (item as object)
  );
}

export interface CategoryGroup {
  label: string;
  count: number;
  startIndex: number;
  endIndex: number;
}

interface NewCaruselProps {
  items?: CarouselItem[];
  radius?: number;
  scrollSpeed?: number;
  baseTiltAngle?: number;
  mouseTiltIntensity?: number;
  dragSpeed?: number;
  touchSpeed?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  onCardHover?: (item: CarouselItem, index: number) => void;
  onCardHoverEnd?: () => void;
  onSpinStart?: () => void;
  centerContent?: ReactNode;
  categoryGroups?: CategoryGroup[];
  initialSpin?: number;
  initialRadius?: number;
  labelsOpacity?: number;
  onActiveIndexChange?: (index: number) => void;
  disableStaircase?: boolean;
  cardFaceCamera?: boolean;
  highlightActive?: boolean;
  popOutX?: number;
  activeAngleOffset?: number;
  disableHover?: boolean;
  cardBaseAngle?: number;
}

// ── Lerp helper ───────────────────────────────────────────────────────────

function lerp(current: number, target: number, factor: number): number {
  const diff = target - current;
  if (Math.abs(diff) < 0.01) return target;
  return current + diff * factor;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function NewCarusel({
  items = [],
  radius = 800,
  scrollSpeed = 0.05,
  baseTiltAngle = -15,
  mouseTiltIntensity = 8,
  dragSpeed = 0.3,
  touchSpeed = 0.3,
  autoRotate = false,
  autoRotateSpeed = 0.15,
  onCardHover,
  onCardHoverEnd,
  onSpinStart,
  centerContent,
  categoryGroups,
  initialSpin,
  initialRadius,
  labelsOpacity = 1,
  onActiveIndexChange,
  disableStaircase = false,
  cardFaceCamera = false,
  highlightActive = false,
  popOutX = 40,
  activeAngleOffset = 0,
  disableHover = false,
  cardBaseAngle = -90,
}: NewCaruselProps) {
  const itemCount = items.length;

  // State that drives React re-renders (affects rendered card positions)
  const [animatedRadius, setAnimatedRadius] = useState<number>(initialRadius ?? radius);
  const [rotation, setRotation] = useState<number>(0);
  const [yOffsetScale, setYOffsetScale] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Refs for values that only affect DOM elements updated directly (no re-render needed)
  const mousePosRef = useRef({ x: 0, y: 0 });
  const smoothMouseRef = useRef({ x: 0, y: 0 });
  const cursorPosRef = useRef({ x: 0, y: 0 });
  const smoothCursorRef = useRef({ x: 0, y: 0 });
  const cursorOpacityRef = useRef(0);
  const showCursorRef = useRef(false);
  const isDraggingRef = useRef(false);

  // DOM refs for direct style updates
  const tiltRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const momentumRef = useRef<number>(0);
  const dragRef = useRef<{ active: boolean; lastX: number; startX: number }>({
    active: false,
    lastX: 0,
    startX: 0,
  });
  const touchRef = useRef<{ active: boolean; lastX: number }>({ active: false, lastX: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<boolean>(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSpinningRef = useRef<boolean>(false);
  const isIntroducingRef = useRef<boolean>(false);
  const autoRotateRef = useRef<boolean>(autoRotate);
  autoRotateRef.current = autoRotate;

  // Store props in refs so the unified RAF loop can read them without re-creating
  const baseTiltAngleRef = useRef(baseTiltAngle);
  baseTiltAngleRef.current = baseTiltAngle;
  const mouseTiltIntensityRef = useRef(mouseTiltIntensity);
  mouseTiltIntensityRef.current = mouseTiltIntensity;
  const onSpinStartRef = useRef(onSpinStart);
  onSpinStartRef.current = onSpinStart;
  const activeAngleOffsetRef = useRef(activeAngleOffset);
  activeAngleOffsetRef.current = activeAngleOffset;

  // ── Intro animation — spin + radius expand ─────────────────────────────
  useEffect(() => {
    const tweens: gsap.core.Tween[] = [];

    if (initialSpin && initialSpin > 0) {
      isIntroducingRef.current = true;
      const spinProxy = { val: 0 };
      tweens.push(gsap.to(spinProxy, {
        val: initialSpin,
        duration: 3.0,
        ease: "power3.out",
        onUpdate: () => setRotation(spinProxy.val),
        onComplete: () => {
          isIntroducingRef.current = false;
        },
      }));
    }

    if (initialRadius != null && initialRadius !== radius) {
      const radiusProxy = { val: initialRadius };
      tweens.push(gsap.to(radiusProxy, {
        val: radius,
        duration: 2.5,
        ease: "power3.out",
        delay: 0.3,
        onUpdate: () => setAnimatedRadius(radiusProxy.val),
      }));
    }

    return () => {
      tweens.forEach(t => t.kill());
      isIntroducingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Wheel ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      momentumRef.current += e.deltaY * scrollSpeed;
      isScrollingRef.current = true;
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 150);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [scrollSpeed]);

  // ── Drag — global listeners so between-card gaps don't break drag ────
  const onMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragRef.current = { active: true, lastX: e.clientX, startX: e.clientX };
    isDraggingRef.current = true;
    if (containerRef.current) containerRef.current.style.cursor = "grabbing";

    const handleGlobalMove = (ev: globalThis.MouseEvent) => {
      if (!dragRef.current.active) return;
      const delta = ev.clientX - dragRef.current.lastX;
      dragRef.current.lastX = ev.clientX;
      // Invert direction when clearly on the far side (top) of the ring
      const rect = containerRef.current?.getBoundingClientRect();
      const centerY = rect ? rect.top + rect.height / 2 : 0;
      const deadZone = rect ? rect.height * 0.15 : 0;
      const dir = ev.clientY < centerY - deadZone ? -1 : 1;
      momentumRef.current += delta * dragSpeed * 0.5 * dir;
    };

    const handleGlobalUp = () => {
      dragRef.current.active = false;
      isDraggingRef.current = false;
      if (containerRef.current) containerRef.current.style.cursor = "grab";
      window.removeEventListener("mousemove", handleGlobalMove);
      window.removeEventListener("mouseup", handleGlobalUp);
    };

    window.addEventListener("mousemove", handleGlobalMove);
    window.addEventListener("mouseup", handleGlobalUp);
  }, [dragSpeed]);

  // ── Touch ─────────────────────────────────────────────────────────────
  const onTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    touchRef.current = { active: true, lastX: e.touches[0].clientX };
  }, []);

  const onTouchMove = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (!touchRef.current.active) return;
      e.preventDefault();
      const delta = e.touches[0].clientX - touchRef.current.lastX;
      touchRef.current.lastX = e.touches[0].clientX;
      // Invert direction when clearly on the far side (top) of the ring
      const rect = containerRef.current?.getBoundingClientRect();
      const centerY = rect ? rect.top + rect.height / 2 : 0;
      const deadZone = rect ? rect.height * 0.15 : 0;
      const dir = e.touches[0].clientY < centerY - deadZone ? -1 : 1;
      momentumRef.current += delta * touchSpeed * 0.5 * dir;
    },
    [touchSpeed]
  );

  const onTouchEnd = useCallback(() => {
    touchRef.current.active = false;
  }, []);

  // ── Mouse tracking for tilt ────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: globalThis.MouseEvent) => {
      mousePosRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      };
      cursorPosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // ── Unified animation loop ─────────────────────────────────────────────
  // Combines momentum/autoRotate, smooth mouse tilt, smooth cursor, and
  // cursor opacity into a single requestAnimationFrame loop.
  useEffect(() => {
    let raf: number;
    const tick = () => {
      // ─ Momentum + autoRotate ─
      if (autoRotateRef.current && Math.abs(momentumRef.current) < 0.1) {
        momentumRef.current += autoRotateSpeed * 0.05;
      }
      if (Math.abs(momentumRef.current) > 0.01) {
        setRotation((p) => p + momentumRef.current);
        momentumRef.current *= 0.92;
      } else if (!autoRotateRef.current) {
        momentumRef.current = 0;
      }

      // Lerp yOffsetScale: 0 while spinning fast, 1 when stopped/slow
      const isSpinning = isIntroducingRef.current || Math.abs(momentumRef.current) > 0.8;
      const scaleTarget = isSpinning ? 0 : 1;
      setYOffsetScale((p) => {
        const diff = scaleTarget - p;
        if (Math.abs(diff) < 0.001) return scaleTarget;
        return p + diff * 0.04;
      });

      // Detect spin start — clear hover & featured card with zero delay
      if (isSpinning && !isSpinningRef.current) {
        if (hoverLeaveTimerRef.current) clearTimeout(hoverLeaveTimerRef.current);
        setHoveredIndex(null);
        showCursorRef.current = false;
        onSpinStartRef.current?.();
      }
      isSpinningRef.current = isSpinning;

      // ─ Smooth mouse tilt (direct DOM update) ─
      const sm = smoothMouseRef.current;
      const mp = mousePosRef.current;
      sm.x = sm.x + (mp.x - sm.x) * 0.06;
      sm.y = sm.y + (mp.y - sm.y) * 0.06;

      if (tiltRef.current) {
        const tiltAngle = baseTiltAngleRef.current;
        const tiltIntensity = mouseTiltIntensityRef.current;
        tiltRef.current.style.transform =
          `rotateX(${tiltAngle + sm.y * tiltIntensity}deg) rotateY(${sm.x * tiltIntensity}deg)`;
      }

      // ─ Smooth cursor position + opacity (direct DOM update) ─
      const sc = smoothCursorRef.current;
      const cp = cursorPosRef.current;
      sc.x = sc.x + (cp.x - sc.x) * 0.15;
      sc.y = sc.y + (cp.y - sc.y) * 0.15;

      const opacityTarget = showCursorRef.current ? 1 : 0;
      cursorOpacityRef.current = lerp(cursorOpacityRef.current, opacityTarget, 0.15);

      if (cursorRef.current) {
        cursorRef.current.style.left = `${sc.x}px`;
        cursorRef.current.style.top = `${sc.y}px`;
        cursorRef.current.style.opacity = String(cursorOpacityRef.current);
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoRotateSpeed]);

  // ── Active index tracking (front-most card) ───────────────────────────
  useEffect(() => {
    if (itemCount === 0) return;
    const step = 360 / itemCount;
    const raw = Math.round((-rotation + activeAngleOffsetRef.current) / step);
    const idx = ((raw % itemCount) + itemCount) % itemCount;
    if (idx !== activeIndex) {
      setActiveIndex(idx);
      onActiveIndexChange?.(idx);
    }
  }, [rotation, itemCount, onActiveIndexChange, activeIndex]);

  // ── Empty state ────────────────────────────────────────────────────────
  if (itemCount === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#999",
          fontSize: 14,
        }}
      >
        Pass an items array
      </div>
    );
  }

  const angleStep = 360 / itemCount;
  const perspective = 1200;


  return (
    <>
      {/* Main container */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseLeave={() => { showCursorRef.current = false; }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective,
          perspectiveOrigin: "50% 50%",
          touchAction: "none",
          userSelect: "none",
          cursor: "grab",
        }}
      >
        {/* Tilt wrapper — reacts to mouse */}
        <div
          ref={tiltRef}
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${baseTiltAngle}deg) rotateY(0deg)`,
            transition: "transform 0.05s linear",
          }}
        >
          {/* Ring — 0x0 point at orbit center */}
          <div
            style={{
              position: "relative",
              width: 0,
              height: 0,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Category labels — positioned at group midpoint, counter-rotated to face screen */}
            {categoryGroups?.map((group) => {
              const midIndex = (group.startIndex + group.endIndex) / 2;
              const midAngle = rotation + angleStep * midIndex;
              const midAngleRad = (midAngle * Math.PI) / 180;
              const labelYOffset = disableStaircase
                ? 0
                : (Math.cos(midAngleRad) * 0.75 - 1) * 100 * yOffsetScale;

              return (
                <div
                  key={group.label}
                  suppressHydrationWarning
                  style={{
                    position: "absolute",
                    transformStyle: "preserve-3d",
                    transform: `translateX(-50%) translateY(-100%) translateY(${labelYOffset}px) rotateY(${midAngle}deg) translateZ(${animatedRadius + 125}px) rotateY(${-midAngle}deg) rotateX(${-baseTiltAngle}deg)`,
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                    opacity: labelsOpacity,
                    transition: "opacity 0.8s ease-out",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "rgba(0,0,0,0.72)",
                      letterSpacing: "-0.01em",
                      borderBottom: "1px solid rgba(0,0,0,0.22)",
                      paddingBottom: 2,
                    }}>
                      {group.label}
                    </span>
                    <span style={{
                      fontSize: 9,
                      fontWeight: 400,
                      color: "rgba(0,0,0,0.38)",
                      letterSpacing: "0.02em",
                      verticalAlign: "super",
                      lineHeight: 1,
                    }}>
                      ({group.count})
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Cards on the ring */}
            {items.map((item, i) => {
              const angle = rotation + angleStep * i;
              const isHovered = hoveredIndex === i;
              const isPoppedOut = isHovered || (highlightActive && activeIndex === i);

              const angleRad = (angle * Math.PI) / 180;
              const yOffset = disableStaircase
                ? 0
                : (Math.cos(angleRad) - 1) * 60 * yOffsetScale;

              return (
                <div
                  key={i}
                  suppressHydrationWarning
                  onMouseEnter={disableHover ? undefined : () => {
                    if (isSpinningRef.current) return;
                    if (hoverLeaveTimerRef.current) clearTimeout(hoverLeaveTimerRef.current);
                    setHoveredIndex(i);
                    if (!isScrollingRef.current) {
                      showCursorRef.current = true;
                      onCardHover?.(item, i);
                    }
                  }}
                  onMouseLeave={disableHover ? undefined : () => {
                    hoverLeaveTimerRef.current = setTimeout(() => {
                      setHoveredIndex(null);
                      showCursorRef.current = false;
                      onCardHoverEnd?.();
                    }, 80);
                  }}
                  style={{
                    position: "absolute",
                    transformStyle: "preserve-3d",
                    transform: `translateX(-50%) translateY(-100%) translateY(${yOffset}px) rotateY(${angle}deg) translateZ(${animatedRadius}px) ${cardFaceCamera ? `rotateY(${-angle + 15}deg)` : `rotateY(${cardBaseAngle}deg)`}`,
                    cursor: isDraggingRef.current ? "grabbing" : "pointer",
                  }}
                >
                  <div
                    style={{
                      transformStyle: "preserve-3d",
                      transform: `translateX(${isPoppedOut ? popOutX : 0}px)`,
                      transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      pointerEvents: "none",
                    }}
                  >
                    {isImageItem(item) ? (
                      <img
                        src={item.src}
                        alt={item.title ?? ""}
                        draggable={false}
                        style={{
                          display: "block",
                          width: 120,
                          height: 160,
                          objectFit: "cover",
                          borderRadius: 2,
                          pointerEvents: "none",
                        }}
                      />
                    ) : (
                      item as ReactNode
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Center content — outside 3D hierarchy, no transform contamination */}
      {centerContent && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 50,
          }}
        >
          <div style={{ animation: "fadeIn 0.35s ease" }}>
            {centerContent}
          </div>
        </div>
      )}

      {/* Custom "View" cursor */}
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          transform: "translate(-50%, -50%)",
          backgroundColor: "#fff",
          color: "#000",
          padding: "6px 16px",
          borderRadius: 100,
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.05em",
          pointerEvents: "none",
          zIndex: 9999,
          whiteSpace: "nowrap",
          opacity: 0,
        }}
      >
        View
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
