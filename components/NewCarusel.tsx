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
}: NewCaruselProps) {
  const itemCount = items.length;

  const [rotation, setRotation] = useState<number>(0);
  const [yOffsetScale, setYOffsetScale] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [smoothMouse, setSmoothMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showCursor, setShowCursor] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [smoothCursor, setSmoothCursor] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cursorOpacity, setCursorOpacity] = useState<number>(0);

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
  const autoRotateRef = useRef<boolean>(autoRotate);
  autoRotateRef.current = autoRotate;

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

    const handleGlobalMove = (ev: globalThis.MouseEvent) => {
      if (!dragRef.current.active) return;
      const delta = ev.clientX - dragRef.current.lastX;
      dragRef.current.lastX = ev.clientX;
      momentumRef.current += delta * dragSpeed * 0.5;
    };

    const handleGlobalUp = () => {
      dragRef.current.active = false;
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
      momentumRef.current += delta * touchSpeed * 0.5;
    },
    [touchSpeed]
  );

  const onTouchEnd = useCallback(() => {
    touchRef.current.active = false;
  }, []);

  // ── Momentum + autoRotate loop ─────────────────────────────────────────
  useEffect(() => {
    let raf: number;
    const tick = () => {
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
      // Threshold 0.8 — autoRotate (~0.1) won't trigger flat mode
      const isSpinning = Math.abs(momentumRef.current) > 0.8;
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
        setShowCursor(false);
        onSpinStart?.();
      }
      isSpinningRef.current = isSpinning;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoRotateSpeed]);

  // ── Mouse tracking for tilt ────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: globalThis.MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y: -y });
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // ── Smooth mouse tilt lerp ─────────────────────────────────────────────
  useEffect(() => {
    let raf: number;
    const tick = () => {
      setSmoothMouse((p) => ({
        x: p.x + (mousePos.x - p.x) * 0.06,
        y: p.y + (mousePos.y - p.y) * 0.06,
      }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mousePos.x, mousePos.y]);

  // ── Smooth cursor lerp ─────────────────────────────────────────────────
  useEffect(() => {
    let raf: number;
    const tick = () => {
      setSmoothCursor((p) => ({
        x: p.x + (cursorPos.x - p.x) * 0.15,
        y: p.y + (cursorPos.y - p.y) * 0.15,
      }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cursorPos.x, cursorPos.y]);

  // ── Cursor opacity fade ────────────────────────────────────────────────
  useEffect(() => {
    let raf: number;
    const target = showCursor ? 1 : 0;
    const tick = () => {
      setCursorOpacity((c) => {
        const d = target - c;
        if (Math.abs(d) < 0.01) return target;
        return c + d * 0.15;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [showCursor]);

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

  return (
    <>
      {/* Main container */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseLeave={() => setShowCursor(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective: 1200,
          perspectiveOrigin: "50% 50%",
          touchAction: "none",
          userSelect: "none",
          cursor: dragRef.current.active ? "grabbing" : "grab",
        }}
      >
        {/* Tilt wrapper — reacts to mouse */}
        <div
          style={{
            transformStyle: "preserve-3d",
            transform: `
              rotateX(${baseTiltAngle + smoothMouse.y * mouseTiltIntensity}deg)
              rotateY(${smoothMouse.x * mouseTiltIntensity}deg)
            `,
            transition: "transform 0.05s linear",
          }}
        >
          {/* Ring — 0×0 point at orbit center */}
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
              const labelYOffset = (Math.cos(midAngleRad) - 1) * 60 * yOffsetScale;

              return (
                <div
                  key={group.label}
                  suppressHydrationWarning
                  style={{
                    position: "absolute",
                    transformStyle: "preserve-3d",
                    // Place at midpoint angle on ring, push beyond cards, counter-rotate to face camera
                    transform: `translateX(-50%) translateY(-50%) translateY(${labelYOffset}px) rotateY(${midAngle}deg) translateZ(${radius + 90}px) rotateY(${-midAngle}deg)`,
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                    <span style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.85)",
                      letterSpacing: "-0.02em",
                    }}>
                      {group.label}
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 400,
                      color: "rgba(255,255,255,0.35)",
                      letterSpacing: "0.02em",
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

              // Staircase Y offset: 0 while spinning, smooth lerp to full when stopped
              const angleRad = (angle * Math.PI) / 180;
              const yOffset = (Math.cos(angleRad) - 1) * 60 * yOffsetScale;

              return (
                // Outer div — orbit position, NO transition (updates every frame)
                <div
                  key={i}
                  suppressHydrationWarning
                  style={{
                    position: "absolute",
                    transformStyle: "preserve-3d",
                    transform: `translateX(-50%) translateY(-100%) translateY(${yOffset}px) rotateY(${angle}deg) translateZ(${radius}px) rotateY(-90deg)`,
                  }}
                >
                  {/* Inner div — hover pull-out only, transition safe here */}
                  <div
                    onMouseEnter={() => {
                      if (isSpinningRef.current) return;
                      // Cancel any pending leave — prevents flicker at card edges
                      if (hoverLeaveTimerRef.current) clearTimeout(hoverLeaveTimerRef.current);
                      setHoveredIndex(i);
                      if (!isScrollingRef.current) {
                        setShowCursor(true);
                        onCardHover?.(item, i);
                      }
                    }}
                    onMouseLeave={() => {
                      // Short debounce: if mouse re-enters another card within 80ms,
                      // the leave is cancelled — no flicker, no false onCardHoverEnd
                      hoverLeaveTimerRef.current = setTimeout(() => {
                        setHoveredIndex(null);
                        setShowCursor(false);
                        onCardHoverEnd?.();
                      }, 80);
                    }}
                    style={{
                      transformStyle: "preserve-3d",
                      transform: `translateX(${isHovered ? 40 : 0}px)`,
                      transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      cursor: "default",
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
            pointerEvents: "none",
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
        style={{
          position: "fixed",
          left: smoothCursor.x,
          top: smoothCursor.y,
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
          opacity: cursorOpacity,
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
