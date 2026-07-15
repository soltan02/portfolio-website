import { motion } from 'framer-motion';
import { Cpu, BarChart3, Sparkles, type LucideIcon } from 'lucide-react';
import type { Service } from '../../lib/supabase';
import FadeIn from '../FadeIn';
import { ACCENT_CYCLE } from '../../lib/theme';

interface Props {
  services: Service[];
}

const ICON_CYCLE: LucideIcon[] = [Cpu, BarChart3, Sparkles];

export default function ServicesSection({ services }: Props) {
  if (services.length === 0) return null;

  return (
    <section id="services" className="bg-paper rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32">
      <FadeIn y={40}>
        <h2
          className="text-ink font-black uppercase text-center mb-16 sm:mb-20 md:mb-28"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Services
        </h2>
      </FadeIn>

      <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-6">
        {services.map((s, i) => {
          const accent = ACCENT_CYCLE[i % ACCENT_CYCLE.length];
          const Icon = ICON_CYCLE[i % ICON_CYCLE.length];
          return (
            <FadeIn key={s.id} delay={i * 0.1}>
              <motion.div
                className="relative overflow-hidden rounded-3xl border border-ink/10 p-6 sm:p-8 h-full"
                whileHover={{ y: -6, borderColor: accent, boxShadow: `0 14px 34px -12px ${accent}55` }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              >
                <span
                  className="absolute -top-2 right-2 font-black text-ink/[0.06] select-none pointer-events-none"
                  style={{ fontSize: 'clamp(4rem, 10vw, 8rem)' }}
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div
                  className="relative z-10 w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${accent}1A`, color: accent }}
                >
                  <Icon size={22} strokeWidth={2} />
                </div>

                <h3 className="relative z-10 text-ink font-medium uppercase" style={{ fontSize: 'clamp(1rem, 2.2vw, 1.6rem)' }}>
                  {s.title}
                </h3>
                <p className="relative z-10 text-ink/60 font-light leading-relaxed mt-2" style={{ fontSize: 'clamp(0.85rem, 1.6vw, 1.1rem)' }}>
                  {s.description}
                </p>
              </motion.div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
