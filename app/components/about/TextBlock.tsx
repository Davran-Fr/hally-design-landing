import type { RefObject } from 'react';
import { SLIDES } from './constants';

interface Props {
  textBlockRef: RefObject<HTMLDivElement | null>;
  lineRef:      RefObject<HTMLSpanElement | null>;
  labelRef:     RefObject<HTMLSpanElement | null>;
  wordRef:      RefObject<HTMLSpanElement | null>;
  paraRef:      RefObject<HTMLParagraphElement | null>;
  dotRefs:      RefObject<(HTMLButtonElement | null)[]>;
}

export function TextBlock({ textBlockRef, lineRef, labelRef, wordRef, paraRef, dotRefs }: Props) {
  return (
    <div ref={textBlockRef} className="md:w-[45%] 2xl:w-[50%]  shrink-0 flex flex-col">
      {/* Label with decorative line */}
      <div className="flex items-center gap-3 mb-4">
        <span
          ref={lineRef}
          className="inline-block w-10 h-[2px] bg-brand origin-left"
        />
        <span
          ref={labelRef}
          className="text-xs 2xl:text-xl tracking-[0.22em] uppercase text-brand font-semibold"
        >
          About
        </span>
      </div>

      {/* Heading */}
      <h2 className="relative">
        <span
          ref={wordRef}
          className="text-7xl md:text-8xl 2xl:text-[175px]  font-bold text-brand block leading-[1.05]"
        >
          {SLIDES[0].word}
        </span>
      </h2>

      {/* Description */}
      <p
        ref={paraRef}
        className="text-neutral-600 font-medium leading-[1.9] max-w-lg 2xl:max-w-3xl text-lg md:text-xl 2xl:text-2xl mt-8"
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
  );
}
