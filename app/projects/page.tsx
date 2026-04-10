"use client";

import Image from "next/image";
import NewCarusel from "@/components/NewCarusel";
import { ReactNode, useRef, useState } from "react";

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

const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Marble Garden",
    category: "Dining Room",
    year: "2024",
    image: "/carusel/carusel.jpg",
    accentColor: "#A89060",
    tags: ["Dining", "Marble", "Top View"],
  },
  {
    id: 2,
    title: "Sage Retreat",
    category: "Bedroom",
    year: "2024",
    image: "/carusel/carusel2.jpg",
    accentColor: "#7A9E7E",
    tags: ["Bedroom", "Sage Green", "Herringbone"],
  },
  {
    id: 3,
    title: "Concrete Villa",
    category: "Architecture",
    year: "2023",
    image: "/carusel/carusel3.jpg",
    accentColor: "#9EAAB4",
    tags: ["Exterior", "Modern", "Minimalist"],
  },
  {
    id: 4,
    title: "Taupe Studio",
    category: "Living Room",
    year: "2024",
    image: "/carusel/carusel4.jpg",
    accentColor: "#C4A882",
    tags: ["Living", "Taupe", "Art Decor"],
  },
  {
    id: 5,
    title: "Aqua Spa",
    category: "Pool & Wellness",
    year: "2024",
    image: "/carusel/carusel5.jpg",
    accentColor: "#4A90C4",
    tags: ["Pool", "Spa", "Marble"],
  },
  {
    id: 6,
    title: "Solar Bedroom",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel6.jpg",
    accentColor: "#C9A84C",
    tags: ["Bedroom", "Gold", "Sunburst"],
  },
  {
    id: 7,
    title: "Bloom Dining",
    category: "Dining Room",
    year: "2024",
    image: "/carusel/carusel7.jpg",
    accentColor: "#7CAE7A",
    tags: ["Dining", "Floral", "White"],
  },
  {
    id: 8,
    title: "Art Living",
    category: "Living Room",
    year: "2023",
    image: "/carusel/carusel8.jpg",
    accentColor: "#B5A494",
    tags: ["Living", "Art Chair", "Cotton"],
  },
  {
    id: 9,
    title: "Crystal Lounge",
    category: "Living Room",
    year: "2024",
    image: "/carusel/carusel9.jpg",
    accentColor: "#C4973A",
    tags: ["Lounge", "Walnut", "Crystal"],
  },
  {
    id: 10,
    title: "Walnut Hall",
    category: "Living Room",
    year: "2024",
    image: "/carusel/carusel10.jpg",
    accentColor: "#A07840",
    tags: ["Living", "Dark Wood", "Chandelier"],
  },
  {
    id: 11,
    title: "Emerald Kitchen",
    category: "Kitchen",
    year: "2023",
    image: "/carusel/carusel11.jpg",
    accentColor: "#3A7D5A",
    tags: ["Kitchen", "Emerald", "Gold"],
  },
  {
    id: 12,
    title: "Graphite Atelier",
    category: "Showroom",
    year: "2024",
    image: "/carusel/carusel12.jpg",
    accentColor: "#8AB4B0",
    tags: ["Showroom", "Graphite", "Botanical"],
  },
  {
    id: 13,
    title: "Noir Suite",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel13.jpg",
    accentColor: "#8B7355",
    tags: ["Bedroom", "Black", "Tufted"],
  },
  {
    id: 14,
    title: "Grand Classique",
    category: "Master Bedroom",
    year: "2024",
    image: "/carusel/carusel14.jpg",
    accentColor: "#C9A84C",
    tags: ["Bedroom", "Classic", "Molding"],
  },
  {
    id: 15,
    title: "Emerald Lounge",
    category: "Living Room",
    year: "2024",
    image: "/carusel/carusel15.jpg",
    accentColor: "#2D7A5A",
    tags: ["Living", "Emerald", "Crystal"],
  },
  {
    id: 16,
    title: "Dark Walnut Suite",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel16.jpg",
    accentColor: "#9B7A3A",
    tags: ["Bedroom", "Walnut", "Bronze"],
  },
  {
    id: 16,
    title: "Dark Walnut Suite",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel16.jpg",
    accentColor: "#9B7A3A",
    tags: ["Bedroom", "Walnut", "Bronze"],
  },
  {
    id: 16,
    title: "Dark Walnut Suite",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel16.jpg",
    accentColor: "#9B7A3A",
    tags: ["Bedroom", "Walnut", "Bronze"],
  },
  {
    id: 16,
    title: "Dark Walnut Suite",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel16.jpg",
    accentColor: "#9B7A3A",
    tags: ["Bedroom", "Walnut", "Bronze"],
  },
  {
    id: 16,
    title: "Dark Walnut Suite",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel16.jpg",
    accentColor: "#9B7A3A",
    tags: ["Bedroom", "Walnut", "Bronze"],
  },
  {
    id: 16,
    title: "Dark Walnut Suite",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel16.jpg",
    accentColor: "#9B7A3A",
    tags: ["Bedroom", "Walnut", "Bronze"],
  },
  {
    id: 16,
    title: "Dark Walnut Suite",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel16.jpg",
    accentColor: "#9B7A3A",
    tags: ["Bedroom", "Walnut", "Bronze"],
  },
  {
    id: 16,
    title: "Dark Walnut Suite",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel16.jpg",
    accentColor: "#9B7A3A",
    tags: ["Bedroom", "Walnut", "Bronze"],
  },
  {
    id: 16,
    title: "Dark Walnut Suite",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel16.jpg",
    accentColor: "#9B7A3A",
    tags: ["Bedroom", "Walnut", "Bronze"],
  },
  {
    id: 16,
    title: "Dark Walnut Suite",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel16.jpg",
    accentColor: "#9B7A3A",
    tags: ["Bedroom", "Walnut", "Bronze"],
  },
  {
    id: 16,
    title: "Dark Walnut Suite",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel16.jpg",
    accentColor: "#9B7A3A",
    tags: ["Bedroom", "Walnut", "Bronze"],
  },
  {
    id: 16,
    title: "Dark Walnut Suite",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel16.jpg",
    accentColor: "#9B7A3A",
    tags: ["Bedroom", "Walnut", "Bronze"],
  },
  {
    id: 16,
    title: "Dark Walnut Suite",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel16.jpg",
    accentColor: "#9B7A3A",
    tags: ["Bedroom", "Walnut", "Bronze"],
  },
  {
    id: 16,
    title: "Dark Walnut Suite",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel16.jpg",
    accentColor: "#9B7A3A",
    tags: ["Bedroom", "Walnut", "Bronze"],
  },
  {
    id: 16,
    title: "Dark Walnut Suite",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel16.jpg",
    accentColor: "#9B7A3A",
    tags: ["Bedroom", "Walnut", "Bronze"],
  },
  {
    id: 16,
    title: "Dark Walnut Suite",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel16.jpg",
    accentColor: "#9B7A3A",
    tags: ["Bedroom", "Walnut", "Bronze"],
  },
  {
    id: 16,
    title: "Dark Walnut Suite",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel16.jpg",
    accentColor: "#9B7A3A",
    tags: ["Bedroom", "Walnut", "Bronze"],
  },
  {
    id: 16,
    title: "Dark Walnut Suite",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel16.jpg",
    accentColor: "#9B7A3A",
    tags: ["Bedroom", "Walnut", "Bronze"],
  },
  {
    id: 16,
    title: "Dark Walnut Suite",
    category: "Bedroom",
    year: "2023",
    image: "/carusel/carusel16.jpg",
    accentColor: "#9B7A3A",
    tags: ["Bedroom", "Walnut", "Bronze"],
  },
];

// Grouped by category so same-category cards sit together on the ring
const SORTED_PROJECTS = [...PROJECTS].sort((a, b) =>
  a.category.localeCompare(b.category)
);

// ── ProjectCard ────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }): ReactNode {
  return (
    <div
      style={{
        width: 60,
        height: 40,
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

function FeaturedCard({ project }: { project: Project }): ReactNode {
  return (
    <div
      style={{
        width: 380,
        height: 200,
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
            "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
        }}
      />

      {/* Accent line top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: project.accentColor,
        }}
      />

      {/* Year */}
      <div
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          fontSize: 10,
          fontWeight: 600,
          color: project.accentColor,
          letterSpacing: "0.14em",
          background: "rgba(0,0,0,0.5)",
          padding: "3px 8px",
          borderRadius: 5,
        }}
      >
        {project.year}
      </div>

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
        <p
          style={{
            fontSize: 9,
            fontWeight: 500,
            color: project.accentColor,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {project.category}
        </p>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            marginBottom: 10,
          }}
        >
          {project.title}
        </h2>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {project.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 8,
                fontWeight: 500,
                color: project.accentColor,
                background: `${project.accentColor}18`,
                border: `1px solid ${project.accentColor}35`,
                borderRadius: 100,
                padding: "2px 8px",
                letterSpacing: "0.05em",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const activeProjectRef = useRef<Project | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCardHover = (_: unknown, index: number) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (activeProjectRef.current !== null) {
      // Already showing a card — swap instantly, no delay
      activeProjectRef.current = SORTED_PROJECTS[index];
      setActiveProject(SORTED_PROJECTS[index]);
    } else {
      // First reveal — use delay for elegance
      hoverTimerRef.current = setTimeout(() => {
        activeProjectRef.current = SORTED_PROJECTS[index];
        setActiveProject(SORTED_PROJECTS[index]);
      }, 300);
    }
  };

  const handleCardHoverEnd = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      activeProjectRef.current = null;
      setActiveProject(null);
    }, 900);
  };

  const handleSpinStart = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    activeProjectRef.current = null;
    setActiveProject(null);
  };

  const carouselItems = SORTED_PROJECTS.map((project, i) => (
    <ProjectCard key={i} project={project} />
  ));

  return (
    <main className="h-screen">
      {/* Carousel */}
      <section
        className="flex-1 w-full h-full"
        style={{ height: "100vh",}}
        data-lenis-prevent
      >
        <NewCarusel
          items={carouselItems}
          radius={375}
          scrollSpeed={0.01}
          baseTiltAngle={-25}
          mouseTiltIntensity={1}
          dragSpeed={0.3}
          touchSpeed={0.3}
          autoRotate={false}
          onCardHover={handleCardHover}
          onCardHoverEnd={handleCardHoverEnd}
          onSpinStart={handleSpinStart}
          centerContent={activeProject ? <FeaturedCard project={activeProject} /> : undefined}
        />
      </section>

      {/* Footer counter */}
     
    </main>
  );
}
