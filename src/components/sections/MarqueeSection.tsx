import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { Project } from '../../lib/supabase';

// Self-made gradient placeholder tiles — no third-party hotlinked images.
const GRADIENTS = [
  'linear-gradient(135deg,#3a3f47,#0C0C0C)',
  'linear-gradient(135deg,#4a3a47,#0C0C0C)',
  'linear-gradient(135deg,#3a4a47,#0C0C0C)',
  'linear-gradient(135deg,#47443a,#0C0C0C)',
  'linear-gradient(135deg,#3a3f5a,#0C0C0C)',
  'linear-gradient(135deg,#5a3a4a,#0C0C0C)',
  'linear-gradient(135deg,#3a5a4f,#0C0C0C)',
  'linear-gradient(135deg,#5a4a3a,#0C0C0C)',
  'linear-gradient(135deg,#3a4a5a,#0C0C0C)',
  'linear-gradient(135deg,#4a3a5a,#0C0C0C)',
  'linear-gradient(135deg,#5a3a3a,#0C0C0C)',
];

const FALLBACK_TAGS = ['PYTHON', 'MACHINE LEARNING', 'SQL', 'DATA VIZ', 'STATISTICS'];

function buildRow(length: number, tags: string[], tagOffset: number): { gradient: string; tag: string }[] {
  return Array.from({ length }, (_, i) => ({
    gradient: GRADIENTS[i % GRADIENTS.length],
    tag: tags[(i + tagOffset) % tags.length],
  }));
}

function Tile({ gradient, tag, index }: { gradient: string; tag: string; index: number }) {
  return (
    <div
      className="relative flex-shrink-0 w-[420px] h-[270px] rounded-2xl overflow-hidden flex items-end p-6"
      style={{ background: gradient }}
      aria-hidden={index > 0}
    >
      <span className="text-mist/70 font-semibold uppercase tracking-[0.2em] text-sm">{tag}</span>
    </div>
  );
}

function Row({ tiles, rowKey }: { tiles: { gradient: string; tag: string }[]; rowKey: string }) {
  const tripled = [...tiles, ...tiles, ...tiles];
  return (
    <div className="flex gap-3">
      {tripled.map((t, i) => (
        <Tile key={`${rowKey}-${i}`} gradient={t.gradient} tag={t.tag} index={i % tiles.length} />
      ))}
    </div>
  );
}

interface Props {
  projects: Project[];
}

export default function MarqueeSection({ projects }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [sectionTop, setSectionTop] = useState(0);

  useEffect(() => {
    const measure = () => {
      const section = sectionRef.current;
      if (section) setSectionTop(section.getBoundingClientRect().top + window.scrollY);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const { scrollY } = useScroll();
  // Same "distance scrolled past this section's top, offset by one viewport
  // height, scaled by 0.3" feel as the original hand-rolled version — just
  // driven by a Framer Motion value instead of a manual style mutation.
  const row1X = useTransform(scrollY, (value) => (value - sectionTop + window.innerHeight) * 0.3 - 200);
  const row2X = useTransform(scrollY, (value) => -((value - sectionTop + window.innerHeight) * 0.3 - 200));

  const tags = useMemo(() => {
    const fromProjects = Array.from(new Set(projects.flatMap((p) => p.tech_tags || []).filter(Boolean)));
    return fromProjects.length > 0 ? fromProjects.map((t) => t.toUpperCase()) : FALLBACK_TAGS;
  }, [projects]);

  const row1 = useMemo(() => buildRow(11, tags, 0), [tags]);
  const row2 = useMemo(() => buildRow(10, tags, 3), [tags]);

  return (
    <section ref={sectionRef} className="bg-ink pt-24 sm:pt-32 md:pt-40 pb-10 overflow-hidden">
      <div className="flex flex-col gap-3">
        <motion.div style={{ x: row1X, willChange: 'transform' }}>
          <Row tiles={row1} rowKey="r1" />
        </motion.div>
        <motion.div style={{ x: row2X, willChange: 'transform' }}>
          <Row tiles={row2} rowKey="r2" />
        </motion.div>
      </div>
    </section>
  );
}
