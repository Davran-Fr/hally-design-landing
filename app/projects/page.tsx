"use client";

import Image from "next/image";
import NewCarusel from "@/components/NewCarusel";
import { ReactNode, useState } from "react";

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
];

// ── ProjectCard ────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }): ReactNode {
  return (
    <div
      style={{
        width: 150,
        height: 100,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* Photo */}
      <Image
        src={project.image}
        alt={project.title}
        fill
        sizes="150px"
        style={{ objectFit: "cover" }}
        draggable={false}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.18) 55%, transparent 100%)",
        }}
      />

      {/* Accent top line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: project.accentColor,
          opacity: 0.85,
        }}
      />

      {/* Year badge */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          fontSize: 9,
          fontWeight: 600,
          color: project.accentColor,
          letterSpacing: "0.12em",
          background: "rgba(0,0,0,0.45)",
          padding: "2px 6px",
          borderRadius: 4,
        }}
      >
        {project.year}
      </div>

      {/* Bottom text */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "10px 10px 10px",
        }}
      >
        <p
          style={{
            fontSize: 8,
            fontWeight: 500,
            color: project.accentColor,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 3,
            opacity: 0.9,
          }}
        >
          {project.category}
        </p>
        <h3
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
          }}
        >
          {project.title}
        </h3>
      </div>
    </div>
  );
}

// ── FeaturedCard — shown in ring center on click ───────────────────────────

function FeaturedCard({ project }: { project: Project }): ReactNode {
  return (
    <div
      style={{
        width: 380,
        height: 260,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px ${project.accentColor}30`,
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

  const carouselItems = PROJECTS.map((project) => (
    <ProjectCard key={project.id} project={project} />
  ));

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <section className="pt-32 pb-10 px-8 flex flex-col items-center text-center">
        <p className="text-xs font-medium tracking-[0.25em] uppercase text-white/25 mb-5">
          Selected Work
        </p>
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-none tracking-tight mb-6">
          Our Projects
        </h1>
        <p className="text-sm text-white/35 max-w-sm leading-relaxed">
          Scroll, drag, or swipe to explore the ring.
        </p>
      </section>

      {/* Carousel */}
      <section
        className="flex-1 w-full"
        style={{ height: "65vh", minHeight: 520 }}
        data-lenis-prevent
      >
        <NewCarusel
          items={carouselItems}
          radius={500}
          scrollSpeed={0.01}
          baseTiltAngle={-25}
          mouseTiltIntensity={8}
          dragSpeed={0.3}
          touchSpeed={0.3}
          autoRotate={true}
          onCardClick={(_, index) => setActiveProject(PROJECTS[index])}
          centerContent={activeProject ? <FeaturedCard project={activeProject} /> : undefined}
        />
      </section>

      {/* Footer counter */}
      <section className="py-10 px-8 flex justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-px bg-white/15" />
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-white/20">
            {PROJECTS.length} Projects
          </span>
          <div className="w-8 h-px bg-white/15" />
        </div>
      </section>
    </main>
  );
}
