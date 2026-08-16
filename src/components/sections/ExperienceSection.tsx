import type { Experience } from '../../lib/supabase';
import FadeIn from '../FadeIn';
import { ACCENT_CYCLE, COLORS } from '../../lib/theme';

function Timeline({ items, startIndex }: { items: Experience[]; startIndex: number }) {
  if (items.length === 0) {
    return <p className="text-mist/40 text-sm">Nothing to show yet.</p>;
  }
  return (
    <div className="max-w-3xl mx-auto relative">
      <div
        className="absolute left-[7px] sm:left-[9px] top-2 bottom-2 w-px"
        style={{ background: `linear-gradient(180deg, ${COLORS.accent.magenta}, ${COLORS.accent.violet})` }}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-6 sm:gap-8">
        {items.map((e, i) => {
          const accent = ACCENT_CYCLE[(startIndex + i) % ACCENT_CYCLE.length];
          return (
            <FadeIn key={e.id} delay={i * 0.08}>
              <div className="relative pl-8 sm:pl-10 group">
                <span
                  className="absolute left-0 top-6 w-[15px] h-[15px] sm:w-[19px] sm:h-[19px] rounded-full border-2"
                  style={{ borderColor: accent, background: COLORS.ink }}
                  aria-hidden="true"
                />
                <div className="rounded-2xl border border-mist/10 px-5 py-5 sm:px-6 sm:py-6">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 sm:gap-6">
                    <div className="flex flex-col gap-1 sm:max-w-[70%]">
                      <h3 className="text-mist font-medium uppercase" style={{ fontSize: 'clamp(1.1rem, 2.4vw, 1.6rem)' }}>
                        {e.role}
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
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}

interface Props {
  education: Experience[];
  career: Experience[];
}

export default function ExperienceSection({ education, career }: Props) {
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

      <div className="space-y-20 sm:space-y-24">
        <div>
          <FadeIn y={30}>
            <div className="flex items-center gap-4 max-w-3xl mx-auto mb-10">
              <span className="text-mist/30 font-black text-2xl">01</span>
              <h3 className="hero-heading font-black uppercase" style={{ fontSize: 'clamp(1.6rem, 5vw, 3rem)' }}>Education</h3>
              <span className="flex-1 h-px bg-mist/10" />
            </div>
          </FadeIn>
          <Timeline items={education} startIndex={0} />
        </div>

        <div>
          <FadeIn y={30}>
            <div className="flex items-center gap-4 max-w-3xl mx-auto mb-10">
              <span className="text-mist/30 font-black text-2xl">02</span>
              <h3 className="hero-heading font-black uppercase" style={{ fontSize: 'clamp(1.6rem, 5vw, 3rem)' }}>Career</h3>
              <span className="flex-1 h-px bg-mist/10" />
            </div>
          </FadeIn>
          <Timeline items={career} startIndex={1} />
        </div>
      </div>
    </section>
  );
}
