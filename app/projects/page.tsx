"use client";

import Image from "next/image";
import NewCarusel from "@/components/NewCarusel";
import { ReactNode, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { gsap } from "gsap";

function useXLScale(): number {
  const [scale, setScale] = useState<number>(1);
  useEffect(() => {
    const update = () => setScale(window.innerWidth > 2000 ? 1.4 : 1);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return scale;
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 1280);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return isMobile;
}

// ── Types ──────────────────────────────────────────────────────────────────

interface Project {
  id: number;
  title: string;
  category: string;
  year: string;
  image: string;
  accentColor: string;
  tags: string[];
}

// ── Data — based on real renders in /public/carusel/ ───────────────────────

// Unique projects per category
const UNIQUE_PROJECTS: Project[] = [
  // Architecture
  { id: 3, title: "Concrete Villa", category: "Architecture", year: "2023", image: "/carusel/carusel3.webp", accentColor: "#9EAAB4", tags: ["Exterior", "Modern", "Minimalist"] },
  // Bedroom
  { id: 2, title: "Sage Retreat", category: "Bedroom", year: "2024", image: "/carusel/carusel2.webp", accentColor: "#7A9E7E", tags: ["Bedroom", "Sage Green", "Herringbone"] },
  { id: 6, title: "Solar Bedroom", category: "Bedroom", year: "2023", image: "/carusel/carusel6.webp", accentColor: "#C9A84C", tags: ["Bedroom", "Gold", "Sunburst"] },
  { id: 13, title: "Noir Suite", category: "Bedroom", year: "2023", image: "/carusel/carusel13.webp", accentColor: "#8B7355", tags: ["Bedroom", "Black", "Tufted"] },
  { id: 16, title: "Dark Walnut Suite", category: "Bedroom", year: "2023", image: "/carusel/carusel16.webp", accentColor: "#9B7A3A", tags: ["Bedroom", "Walnut", "Bronze"] },
  // Dining Room
  { id: 1, title: "Marble Garden", category: "Dining Room", year: "2024", image: "/carusel/carusel.webp", accentColor: "#A89060", tags: ["Dining", "Marble", "Top View"] },
  { id: 7, title: "Bloom Dining", category: "Dining Room", year: "2024", image: "/carusel/carusel7.webp", accentColor: "#7CAE7A", tags: ["Dining", "Floral", "White"] },
  // Kitchen
  { id: 11, title: "Emerald Kitchen", category: "Kitchen", year: "2023", image: "/carusel/carusel11.webp", accentColor: "#3A7D5A", tags: ["Kitchen", "Emerald", "Gold"] },
  // Living Room
  { id: 4, title: "Taupe Studio", category: "Living Room", year: "2024", image: "/carusel/carusel4.webp", accentColor: "#C4A882", tags: ["Living", "Taupe", "Art Decor"] },
  { id: 8, title: "Art Living", category: "Living Room", year: "2023", image: "/carusel/carusel8.webp", accentColor: "#B5A494", tags: ["Living", "Art Chair", "Cotton"] },
  { id: 9, title: "Crystal Lounge", category: "Living Room", year: "2024", image: "/carusel/carusel9.webp", accentColor: "#C4973A", tags: ["Lounge", "Walnut", "Crystal"] },
  { id: 10, title: "Walnut Hall", category: "Living Room", year: "2024", image: "/carusel/carusel10.webp", accentColor: "#A07840", tags: ["Living", "Dark Wood", "Chandelier"] },
  { id: 15, title: "Emerald Lounge", category: "Living Room", year: "2024", image: "/carusel/carusel15.webp", accentColor: "#2D7A5A", tags: ["Living", "Emerald", "Crystal"] },
  // Master Bedroom
  { id: 14, title: "Grand Classique", category: "Master Bedroom", year: "2024", image: "/carusel/carusel14.webp", accentColor: "#C9A84C", tags: ["Bedroom", "Classic", "Molding"] },
  // Pool & Wellness
  { id: 5, title: "Aqua Spa", category: "Pool & Wellness", year: "2024", image: "/carusel/carusel5.webp", accentColor: "#4A90C4", tags: ["Pool", "Spa", "Marble"] },
  // Showroom
  { id: 12, title: "Graphite Atelier", category: "Showroom", year: "2024", image: "/carusel/carusel12.webp", accentColor: "#8AB4B0", tags: ["Showroom", "Graphite", "Botanical"] },
];

// 10 cards per category — repeats unique projects within each category
const CARDS_PER_CATEGORY = 10;
const PROJECTS: Project[] = (() => {
  const byCategory = new Map<string, Project[]>();
  for (const p of UNIQUE_PROJECTS) {
    if (!byCategory.has(p.category)) byCategory.set(p.category, []);
    byCategory.get(p.category)!.push(p);
  }
  const result: Project[] = [];
  for (const [, items] of byCategory) {
    for (let i = 0; i < CARDS_PER_CATEGORY; i++) {
      result.push(items[i % items.length]);
    }
  }
  return result;
})();

// Grouped by category so same-category cards sit together on the ring
const SORTED_PROJECTS = [...PROJECTS].sort((a, b) =>
  a.category.localeCompare(b.category)
);

// Category group boundaries for ring labels
const CATEGORY_GROUPS = (() => {
  const groups: { label: string; count: number; startIndex: number; endIndex: number }[] = [];
  let i = 0;
  while (i < SORTED_PROJECTS.length) {
    const category = SORTED_PROJECTS[i].category;
    let j = i;
    while (j < SORTED_PROJECTS.length && SORTED_PROJECTS[j].category === category) j++;
    groups.push({ label: category, count: j - i, startIndex: i, endIndex: j - 1 });
    i = j;
  }
  return groups;
})();

// ── ProjectCard ────────────────────────────────────────────────────────────

function ProjectCard({ project, scale = 1 }: { project: Project; scale?: number }): ReactNode {
  return (
    <div
      style={{
        width: 75 * scale,
        height: 40 * scale,
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <Image
        src={project.image}
        alt={project.title}
        fill
        sizes="100px"
        style={{ objectFit: "cover" }}
        draggable={false}
      />
    </div>
  );
}

// ── FeaturedCard — shown in ring center on click ───────────────────────────

function FeaturedCard({ project, scale = 1 }: { project: Project; scale?: number }): ReactNode {
  return (
    <div
      style={{
        width: 380 * scale,
        height: 250 * scale,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        // boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px ${project.accentColor}30`,
      }}
    >
      <Image
        src={project.image}
        alt={project.title}
        fill
        sizes="280px"
        style={{ objectFit: "cover" }}
        draggable={false}
      />

      {/* Gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 60%, transparent 100%)",
        }}
      />

      {/* Bottom info */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "20px 18px",
        }}
      >
        <h2
          style={{
            fontSize: 20,
            textAlign : 'center',
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            marginBottom: 10,
          }}
         >
          {project.title}
        </h2>
      </div>
    </div>
  );
}

// ── Grid View ──────────────────────────────────────────────────────────────

function GridView(): ReactNode {
  const uniqueProjects = useMemo(
    () =>
      Array.from(
        new Map(PROJECTS.map((p) => [`${p.id}-${p.title}`, p])).values()
      ),
    []
  );

  return (
    <main className="min-h-screen pt-24 pb-20 px-6 md:px-12 bg-[#f5f3ee]">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-10 flex items-baseline justify-between">
          <h1 className="font-cormorant text-4xl md:text-5xl text-brand tracking-tight">
            Projects
          </h1>
          <span className="text-xs tracking-[0.18em] uppercase text-brand/60">
            {uniqueProjects.length} works
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {uniqueProjects.map((project) => (
            <div
              key={`${project.id}-${project.title}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-neutral-200"
            >
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-x-5 bottom-5 text-white">
                <p className="text-[10px] uppercase tracking-[0.22em] opacity-75">
                  {project.category} · {project.year}
                </p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight">
                  {project.title}
                </h3>
              </div>
              <div
                className="absolute top-5 right-5 w-2 h-2 rounded-full"
                style={{ backgroundColor: project.accentColor }}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

const MOBILE_TILT_ANGLE = -10;
const DESKTOP_TILT_ANGLE = -25;

function CarouselView(): ReactNode {
  const scale = useXLScale();
  const isMobile = useIsMobile();
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [displayProject, setDisplayProject] = useState<Project>(SORTED_PROJECTS[0]);
  const [labelsOpacity, setLabelsOpacity] = useState<number>(0);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hallyRef = useRef<HTMLHeadingElement>(null);
  const cardLayerRef = useRef<HTMLDivElement>(null);
  const isFirstMountRef = useRef<boolean>(true);

  useEffect(() => {
    gsap.set(hallyRef.current, { y: 50, opacity: 0 });
    // Intro sequence — labels fade in after the spin + HALLY reveal
    const labelsTimer = setTimeout(() => setLabelsOpacity(1), 3400);
    return () => clearTimeout(labelsTimer);
  }, []);

  useEffect(() => {
    if (activeProject) setDisplayProject(activeProject);
    const active = activeProject !== null;
    const firstMount = isFirstMountRef.current;
    isFirstMountRef.current = false;
    gsap.to(hallyRef.current, {
      opacity: active ? 0 : 1,
      y: active ? 30 : 0,
      duration: 0.9,
      delay: active ? 0 : firstMount ? 2.9 : 0.25,
      ease: "power3.out",
      overwrite: true,
    });
    gsap.to(cardLayerRef.current, {
      opacity: active ? 1 : 0,
      scale: active ? 1 : 0.96,
      duration: 0.5,
      ease: "power2.out",
      overwrite: true,
    });
  }, [activeProject]);

  const handleCardHover = (_: unknown, index: number) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setActiveProject(SORTED_PROJECTS[index]);
  };

  const handleCardHoverEnd = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setActiveProject(null), 2500);
  };

  const handleCenterEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  };

  const handleCenterLeave = () => {
    hoverTimerRef.current = setTimeout(() => setActiveProject(null), 2500);
  };

  const handleSpinStart = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setActiveProject(null);
  };

  const carouselItems = SORTED_PROJECTS.map((project, i) => (
    <ProjectCard key={i} project={project} scale={scale > 1 ? 1.15 : 1} />
  ));

  if (isMobile) {
    const mobileItems = SORTED_PROJECTS.map((project, i) => (
      <ProjectCard key={i} project={project} scale={1.6} />
    ));

    return (
      <main className="relative h-screen overflow-hidden bg-[#f5f3ee] flex flex-col">
        {/* Top info panel — active project */}
        <section className="z-20 px-5 pt-20 shrink-0">
          <p className="font-cormorant text-sm text-brand/70 mb-1">
            {displayProject.category}
          </p>
          <h1 className="font-cormorant text-4xl text-brand tracking-tight mb-4 leading-[1.05]">
            {displayProject.title}
          </h1>
          <div className="relative w-full aspect-[16/10] rounded-sm overflow-hidden">
            <Image
              key={displayProject.image + displayProject.title}
              src={displayProject.image}
              alt={displayProject.title}
              fill
              sizes="100vw"
              className="object-cover"
              draggable={false}
            />
          </div>
          <a
            href="#"
            className="mt-4 inline-block text-sm font-semibold text-brand border-b border-brand pb-0.5"
          >
            View project +
          </a>
        </section>

        {/* Carousel — below the active image */}
        <section
          className="relative flex-1"
          style={{
            transform: "translate(100vw, 0)",
            touchAction: "none",
          }}
          data-lenis-prevent
        >
          <NewCarusel
            items={mobileItems}
            radius={350}
            scrollSpeed={0.01}
            baseTiltAngle={MOBILE_TILT_ANGLE}
            mouseTiltIntensity={0}
            dragSpeed={0.4}
            touchSpeed={0.5}
            autoRotate={false}
            disableStaircase
            highlightActive
            disableHover
            cardBaseAngle={-90}
            popOutX={50}
            activeAngleOffset={-90}
            onActiveIndexChange={(i) => setDisplayProject(SORTED_PROJECTS[i])}
            categoryGroups={CATEGORY_GROUPS}
            labelsOpacity={0}
          />
        </section>
      </main>
    );
  }

  return (
    <main className="h-screen ">
      {/* Carousel */}
      <section
        className="flex-1 w-full h-full"
        style={{ height: "100vh", paddingBottom: scale > 1 ? 200 : 0 }}
        data-lenis-prevent
      >
        <NewCarusel
          items={carouselItems}
          initialSpin={1080}
          labelsOpacity={labelsOpacity}
          radius={375 * scale}
          scrollSpeed={0.01}
          baseTiltAngle={DESKTOP_TILT_ANGLE}
          mouseTiltIntensity={1}
          dragSpeed={0.3}
          touchSpeed={0.3}
          autoRotate={false}
          onCardHover={handleCardHover}
          onCardHoverEnd={handleCardHoverEnd}
          onSpinStart={handleSpinStart}
          categoryGroups={CATEGORY_GROUPS}
          centerContent={
            <div
              onMouseEnter={handleCenterEnter}
              onMouseLeave={handleCenterLeave}
              style={{ transform: "translateY(-50px)", paddingBottom: scale > 1 ? 120 : 0 }}
            >
              <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* Featured layer — in flow, sizes the wrapper */}
                <div
                  ref={cardLayerRef}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    opacity: 0,
                  }}
                >
                  <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(0,0,0,0.5)", margin: 0 }}>
                    {displayProject.category}
                  </p>
                  <FeaturedCard project={displayProject} scale={scale > 1 ? 1.15 : 0.9} />
                </div>
                {/* HALLY overlay — absolute, centered over featured layer */}
                <h1
                  ref={hallyRef}
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: 0,
                    color: "#1F7872",
                    fontSize: scale > 1 ? 104 : 80,
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    pointerEvents: "none",
                    willChange: "transform, opacity",
                    opacity: 0,
                  }}
                >
                  HALLY
                </h1>
              </div>
            </div>
          }
        />
      </section>
    </main>
  );
}

// ── Default Export — reads ?view= and picks carousel vs grid ──────────────

function ProjectsRouter(): ReactNode {
  const searchParams = useSearchParams();
  const isGrid = searchParams.get("view") === "grid";
  return isGrid ? <GridView /> : <CarouselView />;
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<main className="h-screen" />}>
      <ProjectsRouter />
    </Suspense>
  );
}
