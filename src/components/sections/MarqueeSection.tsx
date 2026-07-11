import { useEffect, useRef } from 'react';

// Self-made gradient placeholder tiles — no third-party hotlinked images.
// Swap these for real project/screenshot images later if desired.
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

const ROW1 = Array.from({ length: 11 }, (_, i) => GRADIENTS[i % GRADIENTS.length]);
const ROW2 = Array.from({ length: 10 }, (_, i) => GRADIENTS[(i + 4) % GRADIENTS.length]);

function Tile({ gradient, index }: { gradient: string; index: number }) {
  return (
    <div
      className="flex-shrink-0 w-[420px] h-[270px] rounded-2xl"
      style={{ background: gradient }}
      aria-hidden={index > 0}
    />
  );
}

function Row({ tiles, rowKey }: { tiles: string[]; rowKey: string }) {
  const tripled = [...tiles, ...tiles, ...tiles];
  return (
    <div className="flex gap-3">
      {tripled.map((g, i) => (
        <Tile key={`${rowKey}-${i}`} gradient={g} index={i % tiles.length} />
      ))}
    </div>
  );
}

export default function MarqueeSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const offset = (window.scrollY - sectionTop + window.innerHeight) * 0.3;
      if (row1Ref.current) row1Ref.current.style.transform = `translateX(${offset - 200}px)`;
      if (row2Ref.current) row2Ref.current.style.transform = `translateX(${-(offset - 200)}px)`;
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#0C0C0C] pt-24 sm:pt-32 md:pt-40 pb-10 overflow-hidden">
      <div className="flex flex-col gap-3">
        <div ref={row1Ref} style={{ willChange: 'transform' }}>
          <Row tiles={ROW1} rowKey="r1" />
        </div>
        <div ref={row2Ref} style={{ willChange: 'transform' }}>
          <Row tiles={ROW2} rowKey="r2" />
        </div>
      </div>
    </section>
  );
}
