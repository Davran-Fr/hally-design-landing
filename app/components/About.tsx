'use client';

import { useRef } from 'react';
import { useAboutAnimation } from './about/useAboutAnimation';
import { CylinderCarousel }  from './about/CylinderCarousel';
import { TextBlock }         from './about/TextBlock';

export default function About() {
  const sectionRef   = useRef<HTMLElement>(null);
  const cylinderRef  = useRef<HTMLDivElement>(null);
  const cardRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs      = useRef<(HTMLImageElement | null)[]>([]);
  const wordRef      = useRef<HTMLSpanElement>(null);
  const paraRef      = useRef<HTMLParagraphElement>(null);
  const dotRefs      = useRef<(HTMLButtonElement | null)[]>([]);
  const lineRef      = useRef<HTMLSpanElement>(null);
  const labelRef     = useRef<HTMLSpanElement>(null);
  const textBlockRef = useRef<HTMLDivElement>(null);

  useAboutAnimation({
    sectionRef, cylinderRef, cardRefs, imgRefs,
    wordRef, paraRef, dotRefs, lineRef, labelRef, textBlockRef,
  });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen px-6 md:px- max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-center gap-16"
    >
      <TextBlock
        textBlockRef={textBlockRef}
        lineRef={lineRef}
        labelRef={labelRef}
        wordRef={wordRef}
        paraRef={paraRef}
        dotRefs={dotRefs}
      />
      <CylinderCarousel
        cylinderRef={cylinderRef}
        cardRefs={cardRefs}
        imgRefs={imgRefs}
      />
    </section>
  );
}
