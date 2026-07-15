import { motion } from 'framer-motion';
import type { Experience } from '../../lib/supabase';
import FadeIn from '../FadeIn';
import { ACCENT_CYCLE, COLORS } from '../../lib/theme';

interface Props {
  experience: Experience[];
}

export default function ExperienceSection({ experience }: Props) {
  if (experience.length === 0) return null;

  return (
    <section id="experience" className="bg-ink px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-28">
      <FadeIn y={40}>
        <h2
          className="hero-heading font-black uppercase leading-none tracking-tight text-center mb-16 sm:mb-20 md:mb-24"
          style={{ fontSize: 'clamp(2.5rem, 9vw, 120px)' }}
        >
          Experience
        </h2>
      </FadeIn>

      <div className="max-w-4xl mx-auto relative">
        <div
          className="absolute left-[7px] sm:left-[9px] top-2 bottom-2 w-px"
          style={{ background: `linear-gradient(180deg, ${COLORS.accent.magenta}, ${COLORS.accent.violet})` }}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-6 sm:gap-8">
          {experience.map((e, i) => {
            const accent = ACCENT_CYCLE[i % ACCENT_CYCLE.length];
            return (
              <FadeIn key={e.id} delay={i * 0.1}>
                <div className="relative pl-8 sm:pl-10 group">
                  <span
                    className="absolute left-0 top-6 w-[15px] h-[15px] sm:w-[19px] sm:h-[19px] rounded-full border-2"
                    style={{ borderColor: accent, background: COLORS.ink }}
                    aria-hidden="true"
                  />
                  <span
                    className="absolute left-0 top-6 w-[15px] h-[15px] sm:w-[19px] sm:h-[19px] rounded-full opacity-0 group-hover:opacity-70 blur-[6px] transition-opacity duration-300"
                    style={{ background: accent }}
                    aria-hidden="true"
                  />

                  <motion.div
                    className="rounded-2xl border border-mist/10 px-5 py-5 sm:px-6 sm:py-6"
                    whileHover={{ y: -4, borderColor: accent, boxShadow: `0 10px 30px -8px ${accent}55` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 sm:gap-6">
                      <div className="flex flex-col gap-1 sm:max-w-[70%]">
                        <h3
                          className="relative inline-block w-fit text-mist font-medium uppercase"
                          style={{ fontSize: 'clamp(1.1rem, 2.4vw, 1.6rem)' }}
                        >
                          {e.role}
                          <span
                            className="absolute left-0 -bottom-1 h-[2px] w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                            style={{ background: accent }}
                            aria-hidden="true"
                          />
                        </h3>
                        {e.organization && <p className="text-mist/60 text-sm sm:text-base">{e.organization}</p>}
                        {e.description && (
                          <p className="text-mist/50 font-light leading-relaxed mt-2" style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1.05rem)' }}>
                            {e.description}
                          </p>
                        )}
                      </div>
                      {e.period && (
                        <span className="text-mist/40 uppercase tracking-widest text-xs sm:text-sm whitespace-nowrap">
                          {e.period}
                        </span>
                      )}
                    </div>
                  </motion.div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
