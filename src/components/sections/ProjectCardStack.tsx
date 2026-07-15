import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { Project } from '../../lib/supabase';
import LiveProjectButton from '../LiveProjectButton';
import { ACCENT_CYCLE } from '../../lib/theme';

interface Props {
  project: Project;
  index: number;
  total: number;
}

export default function ProjectCardStack({ project: p, index, total }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const accent = ACCENT_CYCLE[index % ACCENT_CYCLE.length];

  const { scrollYProgress } = useScroll({ target: cardRef, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale]);
  // Deepens the "receding into the stack" illusion as the next card scrolls
  // over this one — additive on top of the existing scale mechanic, doesn't
  // touch it.
  const filter = useTransform(scrollYProgress, [0, 1], ['brightness(1)', 'brightness(0.55)']);

  const images = [p.image_url, p.image_url_2, p.image_url_3].filter(Boolean) as string[];
  const [colImg1, colImg2] = images;
  const colImg3 = images[2] || images[0];

  return (
    <div
      ref={cardRef}
      className="sticky h-[85vh]"
      style={{ top: `calc(6rem + ${index * 28}px)` }}
    >
      <motion.div
        style={{ scale, filter }}
        whileHover={{ borderColor: accent }}
        transition={{ borderColor: { duration: 0.3 } }}
        className="rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 border-mist bg-ink p-4 sm:p-6 md:p-8 h-full flex flex-col gap-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="text-mist/20 font-black leading-none" style={{ fontSize: 'clamp(2.5rem, 8vw, 100px)' }}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col">
              {p.category && <span className="text-mist/60 uppercase tracking-widest text-xs sm:text-sm">{p.category}</span>}
              <h3 className="text-mist font-medium uppercase" style={{ fontSize: 'clamp(1.2rem, 3vw, 2.4rem)' }}>{p.title}</h3>
            </div>
          </div>
          {p.live_url && <LiveProjectButton href={p.live_url} accentColor={accent} />}
        </div>

        {images.length > 0 && (
          <div className="flex gap-3 flex-1 min-h-0">
            <div className="flex flex-col gap-3" style={{ width: '40%' }}>
              {colImg1 && (
                <img
                  src={colImg1}
                  alt=""
                  className="w-full object-cover rounded-[40px] sm:rounded-[50px] md:rounded-[60px]"
                  style={{ height: 'clamp(130px, 16vw, 230px)' }}
                />
              )}
              {colImg2 && (
                <img
                  src={colImg2}
                  alt=""
                  className="w-full object-cover rounded-[40px] sm:rounded-[50px] md:rounded-[60px] flex-1"
                  style={{ minHeight: 'clamp(160px, 22vw, 340px)' }}
                />
              )}
            </div>
            {colImg3 && (
              <img
                src={colImg3}
                alt=""
                className="object-cover rounded-[40px] sm:rounded-[50px] md:rounded-[60px]"
                style={{ width: '60%' }}
              />
            )}
          </div>
        )}

        <p className="text-mist/70 text-sm sm:text-base max-w-xl">{p.description}</p>
      </motion.div>
    </div>
  );
}
