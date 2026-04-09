"use client";

import { useRef, useEffect, useState, ReactNode, WheelEvent, MouseEvent, TouchEvent } from "react";

interface Orbit3DCarouselProps {
  items?: ReactNode[];
  orientation?: "horizontal" | "vertical";
  radius?: number;
  scrollSpeed?: number;
  baseTiltAngle?: number;
  mouseTiltIntensity?: number;
  touchSpeed?: number;
  cardScale?: number;
  dragSpeed?: number;
  showCursor?: boolean;
  cursorText?: string;
  cursorBgColor?: string;
  cursorTextColor?: string;
  cursorPadding?: string;
  cursorBorderRadius?: number;
}

interface Vec2 {
  x: number;
  y: number;
}

interface DragState {
  active: boolean;
  lastX: number;
  lastY: number;
}

interface TouchState {
  active: boolean;
  lastY: number;
}

export default function Orbit3DCarousel({
  items = [],
  orientation = "horizontal",
  radius = 600,
  scrollSpeed = 0.04,
  baseTiltAngle = -12,
  mouseTiltIntensity = 10,
  touchSpeed = 0.25,
  cardScale = 1,
  dragSpeed = 0.2,
  showCursor = true,
  cursorText = "View",
  cursorBgColor = "#000000",
  cursorTextColor = "#FFFFFF",
  cursorPadding = "8px 16px",
  cursorBorderRadius = 100,
}: Orbit3DCarouselProps) {
  const itemCount = items.length;

  const [rotation, setRotation] = useState<number>(0);
  const [mousePos, setMousePos] = useState<Vec2>({ x: 0, y: 0 });
  const [smoothMouse, setSmoothMouse] = useState<Vec2>({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState<Vec2>({ x: 0, y: 0 });
  const [smoothCursor, setSmoothCursor] = useState<Vec2>({ x: 0, y: 0 });
  const [showCustomCursor, setShowCustomCursor] = useState<boolean>(false);
  const [cursorOpacity, setCursorOpacity] = useState<number>(0);

  const momentumRef = useRef<number>(0);
  const dragRef = useRef<DragState>({ active: false, lastX: 0, lastY: 0 });
  const touchRef = useRef<TouchState>({ active: false, lastY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<boolean>(false);

  // Non-passive wheel listener to allow preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: globalThis.WheelEvent) => {
      if (container.contains(e.target as Node)) {
        e.preventDefault();
        momentumRef.current += e.deltaY * scrollSpeed;
        isScrollingRef.current = true;
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 100);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [scrollSpeed]);

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    momentumRef.current += e.deltaY * scrollSpeed;
    isScrollingRef.current = true;
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 100);
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragRef.current.active = true;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    if (orientation === "horizontal") {
      const deltaX = e.clientX - dragRef.current.lastX;
      dragRef.current.lastX = e.clientX;
      setRotation((prev) => prev + deltaX * dragSpeed);
    } else {
      const deltaY = e.clientY - dragRef.current.lastY;
      dragRef.current.lastY = e.clientY;
      setRotation((prev) => prev + deltaY * dragSpeed);
    }
  };

  const handleMouseUp = () => {
    dragRef.current.active = false;
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      touchRef.current.active = true;
      touchRef.current.lastY = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!touchRef.current.active) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchRef.current.lastY;
    touchRef.current.lastY = touch.clientY;
    setRotation((prev) => prev + deltaY * touchSpeed);
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    touchRef.current.active = false;
  };

  // Momentum animation
  useEffect(() => {
    let frame: number;
    const animate = () => {
      if (Math.abs(momentumRef.current) > 0.01) {
        setRotation((p) => p + momentumRef.current);
        momentumRef.current *= 0.9;
      } else {
        momentumRef.current = 0;
      }
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMove = (e: globalThis.MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y: -y });
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Smooth mouse lerp
  useEffect(() => {
    let frame: number;
    const animate = () => {
      setSmoothMouse((p) => ({
        x: p.x + (mousePos.x - p.x) * 0.07,
        y: p.y + (mousePos.y - p.y) * 0.07,
      }));
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [mousePos.x, mousePos.y]);

  // Smooth cursor lerp
  useEffect(() => {
    let frame: number;
    const animate = () => {
      setSmoothCursor((p) => ({
        x: p.x + (cursorPosition.x - p.x) * 0.15,
        y: p.y + (cursorPosition.y - p.y) * 0.15,
      }));
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [cursorPosition.x, cursorPosition.y]);

  // Cursor opacity animation
  useEffect(() => {
    let frame: number;
    const targetOpacity = showCustomCursor ? 1 : 0;
    const animate = () => {
      setCursorOpacity((current) => {
        const diff = targetOpacity - current;
        if (Math.abs(diff) < 0.01) return targetOpacity;
        return current + diff * 0.15;
      });
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [showCustomCursor]);

  if (itemCount === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#E8E6F0",
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#9B8FD6",
            textAlign: "center",
          }}
        >
          No items
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#B4A6E8",
            textAlign: "center",
            maxWidth: 240,
            lineHeight: 1.4,
          }}
        >
          Pass an items array to render the carousel.
        </div>
      </div>
    );
  }

  const rotationAxis = orientation === "horizontal" ? "rotateY" : "rotateX";
  const tiltAxis = orientation === "horizontal" ? "rotateX" : "rotateY";

  return (
    <>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective: 1400,
          touchAction: "none",
          userSelect: "none",
          cursor:
            showCursor && showCustomCursor
              ? "none"
              : dragRef.current.active
              ? "grabbing"
              : "grab",
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setShowCustomCursor(false);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            transformStyle: "preserve-3d",
            transform: `${tiltAxis}(${
              baseTiltAngle + smoothMouse.y * mouseTiltIntensity
            }deg) ${
              orientation === "horizontal"
                ? `rotateY(${smoothMouse.x * mouseTiltIntensity}deg)`
                : `rotateX(${-smoothMouse.x * mouseTiltIntensity}deg)`
            }`,
          }}
        >
          {/* This wrapper is 0×0 and centered in the outer flex container.
              Cards use position:absolute and are shifted by -50%/-50% so
              their own center aligns with this origin point — the orbit center. */}
          <div style={{ position: "relative", transformStyle: "preserve-3d" }}>
            {items.map((item, i) => {
              const angle = rotation + (360 / itemCount) * i;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    transformStyle: "preserve-3d",
                    transform: `translateX(-50%) translateY(-50%) ${rotationAxis}(${angle}deg) translateZ(${radius}px) scale(${cardScale})`,
                  }}
                  onMouseEnter={() => {
                    if (showCursor && !isScrollingRef.current)
                      setShowCustomCursor(true);
                  }}
                  onMouseLeave={() => setShowCustomCursor(false)}
                >
                  {item}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showCursor && !dragRef.current.active && (
        <div
          style={{
            position: "fixed",
            left: smoothCursor.x,
            top: smoothCursor.y,
            transform: "translate(-50%, -50%)",
            backgroundColor: cursorBgColor,
            color: cursorTextColor,
            padding: cursorPadding,
            borderRadius: cursorBorderRadius,
            pointerEvents: "none",
            zIndex: 10000,
            whiteSpace: "nowrap",
            opacity: cursorOpacity,
            transition: "opacity 0.2s ease-out",
          }}
        >
          {cursorText}
        </div>
      )}
    </>
  );
}
