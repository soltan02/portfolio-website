import type { Profile } from '../../lib/supabase';
import FadeIn from '../FadeIn';
import AnimatedText from '../AnimatedText';
import ContactButton from '../ContactButton';
import DataMotifBackground from '../DataMotifBackground';
import { ACCENT_CYCLE } from '../../lib/theme';

interface Props {
  profile: Profile | null;
}

export default function AboutSection({ profile }: Props) {
  const bio = profile?.bio || 'Tell me about yourself and this will show up here.';

  return (
    <section id="about" className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 md:px-10 py-20 overflow-hidden">
      <DataMotifBackground opacity={0.3} />

      <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16 relative z-10">
        <FadeIn delay={0} y={40}>
          <h2 className="hero-heading font-black uppercase leading-none tracking-tight text-center" style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}>
            About me
          </h2>
        </FadeIn>

        <div className="flex flex-col items-center gap-16 sm:gap-20 md:gap-24">
          <div className="flex flex-col items-center gap-6 max-w-[560px]">
            <AnimatedText
              text={bio}
              className="text-mist font-medium text-center leading-relaxed"
            />
            <style>{`#about p { font-size: clamp(1rem, 2vw, 1.35rem); }`}</style>

            {profile && (profile.passions.length > 0 || profile.skills.length > 0) && (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {profile.passions.map((p, i) => (
                  <span
                    key={p}
                    className="text-xs sm:text-sm px-3 py-1 rounded-full border text-mist"
                    style={{ borderColor: ACCENT_CYCLE[i % ACCENT_CYCLE.length] }}
                  >
                    {p}
                  </span>
                ))}
                {profile.skills.map((s) => (
                  <span key={s} className="text-xs sm:text-sm px-3 py-1 rounded-full bg-mist/10 text-mist">{s}</span>
                ))}
              </div>
            )}
          </div>

          <ContactButton />
        </div>
      </div>
    </section>
  );
}
