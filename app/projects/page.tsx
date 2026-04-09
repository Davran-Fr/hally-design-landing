"use client";

import NewCarusel from "@/components/NewCarusel";
import { ReactNode } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Project {
  id: number;
  title: string;
  category: string;
  year: string;
  color: string;
  accentColor: string;
  tags: string[];
}

// ── Data ───────────────────────────────────────────────────────────────────

const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Noir Atelier",
    category: "Brand Identity",
    year: "2024",
    color: "#0D0D0D",
    accentColor: "#C9A84C",
    tags: ["Branding", "Typography", "Print"],
  },
  {
    id: 2,
    title: "Bloom Studio",
    category: "Web Design",
    year: "2024",
    color: "#1A1A2E",
    accentColor: "#E94560",
    tags: ["UI/UX", "Motion", "React"],
  },
  {
    id: 3,
    title: "Solaris",
    category: "Product Design",
    year: "2023",
    color: "#0F2027",
    accentColor: "#F7971E",
    tags: ["Product", "3D", "Figma"],
  },
  {
    id: 4,
    title: "Arcane Labs",
    category: "Digital Experience",
    year: "2023",
    color: "#16002E",
    accentColor: "#A855F7",
    tags: ["Interactive", "WebGL", "Three.js"],
  },
  {
    id: 5,
    title: "Drift Magazine",
    category: "Editorial Design",
    year: "2023",
    color: "#1C1917",
    accentColor: "#84CC16",
    tags: ["Editorial", "Grid", "Print"],
  },
  {
    id: 6,
    title: "Kova Systems",
    category: "SaaS Dashboard",
    year: "2024",
    color: "#0A192F",
    accentColor: "#64FFDA",
    tags: ["Dashboard", "Data Viz", "UX"],
  },
  {
    id: 7,
    title: "Phantom Wave",
    category: "Motion Design",
    year: "2024",
    color: "#0E0E1A",
    accentColor: "#818CF8",
    tags: ["Motion", "AE", "Cinema 4D"],
  },
  {
    id: 8,
    title: "Terra Forma",
    category: "Packaging Design",
    year: "2023",
    color: "#0F1A0A",
    accentColor: "#86EFAC",
    tags: ["Packaging", "Print", "3D"],
  },
  {
    id: 9,
    title: "Void Market",
    category: "E-Commerce",
    year: "2024",
    color: "#1A0A0A",
    accentColor: "#F87171",
    tags: ["E-Commerce", "UI/UX", "Next.js"],
  },
  {
    id: 10,
    title: "Lumen AR",
    category: "Augmented Reality",
    year: "2024",
    color: "#001A1A",
    accentColor: "#22D3EE",
    tags: ["AR", "Unity", "Spatial UI"],
  },
  {
    id: 11,
    title: "Celeste Type",
    category: "Type Design",
    year: "2023",
    color: "#12001A",
    accentColor: "#D946EF",
    tags: ["Typography", "Variable Font", "Print"],
  },
  {
    id: 12,
    title: "Obsidian OS",
    category: "UI System",
    year: "2024",
    color: "#0A0A0A",
    accentColor: "#94A3B8",
    tags: ["Design System", "Figma", "Tokens"],
  },
  {
    id: 13,
    title: "Helio Bank",
    category: "Fintech App",
    year: "2023",
    color: "#001A0D",
    accentColor: "#34D399",
    tags: ["Fintech", "iOS", "UX"],
  },
  {
    id: 14,
    title: "Dusk Festival",
    category: "Event Identity",
    year: "2023",
    color: "#1A0800",
    accentColor: "#FB923C",
    tags: ["Event", "Branding", "Poster"],
  },
  {
    id: 15,
    title: "Cryo Labs",
    category: "Scientific Viz",
    year: "2024",
    color: "#00101A",
    accentColor: "#38BDF8",
    tags: ["Data Viz", "WebGL", "Science"],
  },
  {
    id: 16,
    title: "Mira Health",
    category: "Healthcare UX",
    year: "2024",
    color: "#0A001A",
    accentColor: "#C084FC",
    tags: ["Healthcare", "Mobile", "UX"],
  },
  {
    id: 17,
    title: "Fold Studio",
    category: "Architecture",
    year: "2023",
    color: "#1A1200",
    accentColor: "#FDE68A",
    tags: ["Architecture", "3D", "Render"],
  },
  {
    id: 18,
    title: "Neon District",
    category: "Game UI",
    year: "2024",
    color: "#0A001A",
    accentColor: "#F472B6",
    tags: ["Game UI", "Unity", "HUD"],
  },
  {
    id: 19,
    title: "Atlas Maps",
    category: "Geo Data Viz",
    year: "2023",
    color: "#001A14",
    accentColor: "#6EE7B7",
    tags: ["Maps", "D3.js", "Data"],
  },
  {
    id: 20,
    title: "Rune Audio",
    category: "Music App",
    year: "2024",
    color: "#0D0014",
    accentColor: "#A78BFA",
    tags: ["Music", "iOS", "Motion"],
  },
  {
    id: 21,
    title: "Zinc Editorial",
    category: "Editorial Design",
    year: "2024",
    color: "#0A0A00",
    accentColor: "#EAB308",
    tags: ["Editorial", "Layout", "Print"],
  },
  {
    id: 21,
    title: "Zinc Editorial",
    category: "Editorial Design",
    year: "2024",
    color: "#0A0A00",
    accentColor: "#EAB308",
    tags: ["Editorial", "Layout", "Print"],
  },
  {
    id: 21,
    title: "Zinc Editorial",
    category: "Editorial Design",
    year: "2024",
    color: "#0A0A00",
    accentColor: "#EAB308",
    tags: ["Editorial", "Layout", "Print"],
  },
  {
    id: 21,
    title: "Zinc Editorial",
    category: "Editorial Design",
    year: "2024",
    color: "#0A0A00",
    accentColor: "#EAB308",
    tags: ["Editorial", "Layout", "Print"],
  },
  {
    id: 21,
    title: "Zinc Editorial",
    category: "Editorial Design",
    year: "2024",
    color: "#0A0A00",
    accentColor: "#EAB308",
    tags: ["Editorial", "Layout", "Print"],
  },
  {
    id: 21,
    title: "Zinc Editorial",
    category: "Editorial Design",
    year: "2024",
    color: "#0A0A00",
    accentColor: "#EAB308",
    tags: ["Editorial", "Layout", "Print"],
  },
  {
    id: 21,
    title: "Zinc Editorial",
    category: "Editorial Design",
    year: "2024",
    color: "#0A0A00",
    accentColor: "#EAB308",
    tags: ["Editorial", "Layout", "Print"],
  },
  {
    id: 21,
    title: "Zinc Editorial",
    category: "Editorial Design",
    year: "2024",
    color: "#0A0A00",
    accentColor: "#EAB308",
    tags: ["Editorial", "Layout", "Print"],
  },
  {
    id: 21,
    title: "Zinc Editorial",
    category: "Editorial Design",
    year: "2024",
    color: "#0A0A00",
    accentColor: "#EAB308",
    tags: ["Editorial", "Layout", "Print"],
  },
  {
    id: 21,
    title: "Zinc Editorial",
    category: "Editorial Design",
    year: "2024",
    color: "#0A0A00",
    accentColor: "#EAB308",
    tags: ["Editorial", "Layout", "Print"],
  },
];

// ── ProjectCard ────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }): ReactNode {
  return (
    <div
      style={{
        width: 150,
        height: 70,
        borderRadius: 16,
        background: project.color,
        border: `1px solid ${project.accentColor}25`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px 18px",
        position: "relative",
        boxShadow: `0 20px 60px ${project.accentColor}15, 0 0 0 1px ${project.accentColor}12`,
      }}
    >
      {/* Glow orb */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${project.accentColor}28 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            width: 50,
            height: 30,
            borderRadius: 8,
            background: `${project.accentColor}18`,
            border: `1px solid ${project.accentColor}35`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: project.accentColor,
              opacity: 0.85,
            }}
          />
        </div>
        <span
          style={{
            fontSize: 10,
            color: `${project.accentColor}80`,
            fontWeight: 500,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {project.year}
        </span>
      </div>

      {/* Decorative line */}
      <div
        style={{
          width: "100%",
          height: 1,
          background: `linear-gradient(90deg, ${project.accentColor}45 0%, transparent 100%)`,
        }}
      />

      {/* Bottom content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <p
            style={{
              fontSize: 10,
              color: `${project.accentColor}70`,
              fontWeight: 500,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              marginBottom: 5,
            }}
          >
            {project.category}
          </p>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {project.title}
          </h3>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {project.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 9,
                fontWeight: 500,
                color: project.accentColor,
                background: `${project.accentColor}12`,
                border: `1px solid ${project.accentColor}28`,
                borderRadius: 100,
                padding: "3px 8px",
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

      {/* Carousel — data-lenis-prevent stops Lenis from stealing wheel events */}
      <section className="flex-1 w-full" style={{ height: "65vh", minHeight: 520 }} data-lenis-prevent>
        <NewCarusel
          items={carouselItems}
          radius={300}
          scrollSpeed={0.01}
          baseTiltAngle={-35}
          mouseTiltIntensity={8}
          dragSpeed={0.3}
          touchSpeed={0.3}
          autoRotate={false}
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
