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

interface ActiveItem {
  item: CarouselItem;
  index: number;
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
  onCardClick?: (item: CarouselItem, index: number) => void;
  centerContent?: ReactNode;
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
  onCardClick,
  centerContent,
}: NewCaruselProps) {
  const itemCount = items.length;

  const [rotation, setRotation] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [smoothMouse, setSmoothMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
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

  // ── Card click ────────────────────────────────────────────────────────
  const handleCardClick = useCallback(
    (item: CarouselItem, index: number) => {
      if (isScrollingRef.current) return;
      if (Math.abs(dragRef.current.startX - dragRef.current.lastX) > 5) return;
      setActiveItem({ item, index });
      onCardClick?.(item, index);
    },
    [onCardClick]
  );

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
            {/* Center content — shown on card click */}
            {(activeItem || centerContent) && (
              <div
                style={{
                  position: "absolute",
                  transformStyle: "preserve-3d",
                  transform: "translateZ(0px)",
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                    zIndex: 100,
                    textAlign: "center",
                  }}
                >
                  {activeItem ? (
                    <div style={{ animation: "fadeIn 0.3s ease" }}>
                      {isImageItem(activeItem.item) ? (
                        <>
                          <img
                            src={activeItem.item.src}
                            alt={activeItem.item.title ?? ""}
                            style={{
                              maxWidth: 400,
                              maxHeight: 280,
                              objectFit: "cover",
                              borderRadius: 4,
                              display: "block",
                              margin: "0 auto",
                            }}
                          />
                          {activeItem.item.title && (
                            <div
                              style={{
                                marginTop: 12,
                                fontSize: 20,
                                fontWeight: 600,
                                color: "#111",
                                letterSpacing: "-0.02em",
                              }}
                            >
                              {activeItem.item.title}
                            </div>
                          )}
                        </>
                      ) : (
                        activeItem.item as ReactNode
                      )}
                    </div>
                  ) : (
                    centerContent
                  )}
                </div>
              </div>
            )}

            {/* Cards on the ring */}
            {items.map((item, i) => {
              const angle = rotation + angleStep * i;
              const isActive = activeItem?.index === i;
              const isHovered = hoveredIndex === i;
              return (
                // Outer div — orbit position, NO transition (updates every frame)
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    transformStyle: "preserve-3d",
                    transform: `translateX(-50%) translateY(-50%) rotateY(${angle}deg) translateZ(${radius}px) rotateY(-90deg)`,
                  }}
                >
                  {/* Inner div — hover pull-out only, transition safe here */}
                  <div
                    onClick={() => handleCardClick(item, i)}
                    onMouseEnter={() => {
                      setHoveredIndex(i);
                      if (!isScrollingRef.current) setShowCursor(true);
                    }}
                    onMouseLeave={() => {
                      setHoveredIndex(null);
                      setShowCursor(false);
                    }}
                    style={{
                      transformStyle: "preserve-3d",
                      transform: `translateY(${isHovered ? -40 : 0}px)`,
                      transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      cursor: "pointer",
                      outline: isActive ? "2px solid rgba(255,255,255,0.6)" : "none",
                      outlineOffset: 2,
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
