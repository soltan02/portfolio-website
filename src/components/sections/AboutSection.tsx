import type { Profile } from '../../lib/supabase';
import FadeIn from '../FadeIn';
import AnimatedText from '../AnimatedText';
import ContactButton from '../ContactButton';

interface Props {
  profile: Profile | null;
}

// Self-made abstract decorative shapes (no third-party assets) standing
// in for the corner "props" in the original design — simple layered
// radial-gradient blobs, distinct per corner.
function CornerBlob({ className, gradient }: { className: string; gradient: string }) {
  return <div className={`absolute rounded-full blur-2xl opacity-60 ${className}`} style={{ background: gradient }} />;
}

export default function AboutSection({ profile }: Props) {
  const bio = profile?.bio || 'Tell me about yourself and this will show up here.';

  return (
    <section id="about" className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 md:px-10 py-20 overflow-hidden">
      <FadeIn delay={0.1} x={-80} y={0} duration={0.9}>
        <CornerBlob className="top-[4%] left-[1%] sm:left-[2%] md:left-[4%] w-[120px] sm:w-[160px] md:w-[210px] aspect-square" gradient="radial-gradient(circle,#3a3f5a,transparent 70%)" />
      </FadeIn>
      <FadeIn delay={0.25} x={-80} y={0} duration={0.9}>
        <CornerBlob className="bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%] w-[100px] sm:w-[140px] md:w-[180px] aspect-square" gradient="radial-gradient(circle,#5a3a4a,transparent 70%)" />
      </FadeIn>
      <FadeIn delay={0.15} x={80} y={0} duration={0.9}>
        <CornerBlob className="top-[4%] right-[1%] sm:right-[2%] md:right-[4%] w-[120px] sm:w-[160px] md:w-[210px] aspect-square" gradient="radial-gradient(circle,#3a5a4f,transparent 70%)" />
      </FadeIn>
      <FadeIn delay={0.3} x={80} y={0} duration={0.9}>
        <CornerBlob className="bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%] w-[130px] sm:w-[170px] md:w-[220px] aspect-square" gradient="radial-gradient(circle,#5a4a3a,transparent 70%)" />
      </FadeIn>

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
              className="text-[#D7E2EA] font-medium text-center leading-relaxed"
            />
            <style>{`#about p { font-size: clamp(1rem, 2vw, 1.35rem); }`}</style>

            {profile && (profile.passions.length > 0 || profile.skills.length > 0) && (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {profile.passions.map((p) => (
                  <span key={p} className="text-xs sm:text-sm px-3 py-1 rounded-full border border-[#D7E2EA]/30 text-[#D7E2EA]">{p}</span>
                ))}
                {profile.skills.map((s) => (
                  <span key={s} className="text-xs sm:text-sm px-3 py-1 rounded-full bg-[#D7E2EA]/10 text-[#D7E2EA]">{s}</span>
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
