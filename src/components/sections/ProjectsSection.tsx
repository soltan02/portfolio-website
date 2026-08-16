import { motion } from 'framer-motion';
import type { Project } from '../../lib/supabase';
import FadeIn from '../FadeIn';
import LiveProjectButton from '../LiveProjectButton';
import TechLogo from '../TechLogo';
import { ACCENT_CYCLE } from '../../lib/theme';

function initials(title: string): string {
  return title
    .split(/[\s—–-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

interface Props {
  projects: Project[];
}

export default function ProjectsSection({ projects }: Props) {
  return (
    <section
      id="projects"
      className="relative z-10 bg-ink rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 px-5 sm:px-8 md:px-10 pt-20 sm:pt-24 md:pt-32 pb-20"
    >
      <FadeIn y={40}>
        <h2
          className="hero-heading font-black uppercase leading-none tracking-tight text-center mb-16 sm:mb-20 md:mb-28"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Projects
        </h2>
      </FadeIn>

      {projects.length === 0 ? (
        <p className="text-mist/50 text-center">No projects yet.</p>
      ) : (
        <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => {
            const accent = ACCENT_CYCLE[i % ACCENT_CYCLE.length];
            const img = p.image_url;
            return (
              <FadeIn key={p.id} delay={i * 0.05}>
                <motion.div
                  className="group rounded-3xl border border-mist/10 overflow-hidden flex flex-col h-full bg-ink"
                  whileHover={{ y: -6, borderColor: accent }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                >
                  {img && (
                    <div className="overflow-hidden">
                      <img
                        src={img}
                        alt={p.title}
                        className="w-full aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center font-bold text-base select-none"
                        style={{ background: `${accent}1A`, color: accent }}
                        aria-hidden="true"
                      >
                        {initials(p.title)}
                      </span>
                      <div className="flex flex-col min-w-0">
                        {p.category && (
                          <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color: accent }}>
                            {p.category}
                          </span>
                        )}
                        <h3 className="text-mist font-medium uppercase leading-tight" style={{ fontSize: 'clamp(1.05rem, 2.2vw, 1.4rem)' }}>
                          {p.title}
                        </h3>
                      </div>
                      <div className="ml-auto">{p.live_url && <LiveProjectButton href={p.live_url} accentColor={accent} />}</div>
                    </div>
                    <p className="text-mist/70 text-sm flex-1 leading-relaxed">{p.description}</p>
                    {p.tech_tags && p.tech_tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {p.tech_tags.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-mist/60 border border-mist/15 rounded-full px-2.5 py-1"
                          >
                            <TechLogo name={t} className="w-3.5 h-3.5 group-hover:[color:var(--tech)]" />
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {p.repo_url && (
                      <a
                        href={p.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-mist/70 hover:text-mist text-sm uppercase tracking-widest border-b border-mist/20 pb-1 w-fit transition-colors"
                      >
                        Source
                      </a>
                    )}
                  </div>
                </motion.div>
              </FadeIn>
            );
          })}
        </div>
      )}
    </section>
  );
}
