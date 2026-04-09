import type { RefObject } from 'react';
import { CARDS, CARD_COUNT, CARD_W, CARD_H, RADIUS, SLIDES, TILT_X } from './constants';

interface Props {
  cylinderRef: RefObject<HTMLDivElement | null>;
  cardRefs:    RefObject<(HTMLDivElement | null)[]>;
  imgRefs:     RefObject<(HTMLImageElement | null)[]>;
}

export function CylinderCarousel({ cylinderRef, cardRefs, imgRefs }: Props) {
  return (
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
            {SLIDES.map((slide, si) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={si}
                ref={(el) => { imgRefs.current[si * CARD_COUNT + i] = el; }}
                src={slide.images[i]}
                alt=""
                draggable={false}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 10,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                  pointerEvents: 'none',
                  opacity: si === 0 ? 1 : 0,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
