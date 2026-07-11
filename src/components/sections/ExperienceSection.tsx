import type { Experience } from '../../lib/supabase';
import FadeIn from '../FadeIn';

interface Props {
  experience: Experience[];
}

export default function ExperienceSection({ experience }: Props) {
  if (experience.length === 0) return null;

  return (
    <section id="experience" className="bg-[#0C0C0C] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-28">
      <FadeIn y={40}>
        <h2
          className="hero-heading font-black uppercase leading-none tracking-tight text-center mb-16 sm:mb-20 md:mb-24"
          style={{ fontSize: 'clamp(2.5rem, 9vw, 120px)' }}
        >
          Experience
        </h2>
      </FadeIn>

      <div className="max-w-4xl mx-auto flex flex-col gap-0">
        {experience.map((e, i) => (
          <FadeIn key={e.id} delay={i * 0.1}>
            <div
              className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 sm:gap-6 py-8 sm:py-10"
              style={{ borderBottom: i < experience.length - 1 ? '1px solid rgba(215,226,234,0.15)' : 'none' }}
            >
              <div className="flex flex-col gap-1 sm:max-w-[70%]">
                <h3 className="text-[#D7E2EA] font-medium uppercase" style={{ fontSize: 'clamp(1.1rem, 2.4vw, 1.6rem)' }}>
                  {e.role}
                </h3>
                {e.organization && <p className="text-[#D7E2EA]/60 text-sm sm:text-base">{e.organization}</p>}
                {e.description && (
                  <p className="text-[#D7E2EA]/50 font-light leading-relaxed mt-2" style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1.05rem)' }}>
                    {e.description}
                  </p>
                )}
              </div>
              {e.period && (
                <span className="text-[#D7E2EA]/40 uppercase tracking-widest text-xs sm:text-sm whitespace-nowrap">
                  {e.period}
                </span>
              )}
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
