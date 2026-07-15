import { lazy, Suspense } from 'react';
import type { Profile } from '../../lib/supabase';
import FadeIn from '../FadeIn';
import Magnet from '../Magnet';
import ContactButton from '../ContactButton';

// Lazy-loaded: the three.js/react-three-fiber chunk is sizeable and purely
// decorative, so it downloads after the text/photo have already painted
// instead of delaying first contentful paint.
const HeroScene = lazy(() => import('../HeroScene'));

interface Props {
  profile: Profile | null;
}

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

export default function HeroSection({ profile }: Props) {
  const firstName = (profile?.full_name || 'Your Name').trim().split(' ')[0];
  const tagline = profile?.tagline || 'a creator driven by crafting striking and unforgettable projects';

  // Long names shouldn't blow past the viewport at a fixed vw size —
  // scale the ceiling down as the name gets longer, on top of the
  // already-reduced base size.
  const nameLength = firstName.length + 6; // + "Hi, i'm " roughly
  const headingMaxRem = Math.max(3.5, 7.5 - nameLength * 0.12);

  return (
    <section className="relative isolate h-screen flex flex-col" style={{ overflowX: 'clip' }}>
      <div className="absolute inset-0 -z-10">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>

      <FadeIn delay={0} y={-20} as="nav" className="flex justify-between px-6 md:px-10 pt-6 md:pt-8">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-mist font-medium uppercase tracking-wider text-sm md:text-lg lg:text-[1.4rem] transition-opacity duration-200 hover:opacity-70"
          >
            {link.label}
          </a>
        ))}
      </FadeIn>

      <div className="overflow-hidden mt-6 sm:mt-4 md:-mt-5">
        <FadeIn delay={0.15} y={40}>
          <h1
            className="hero-heading font-black uppercase tracking-tight leading-none whitespace-nowrap w-full text-center"
            style={{ fontSize: `clamp(1.75rem, 9vw, ${headingMaxRem}rem)` }}
          >
            Hi, i&apos;m {firstName}
          </h1>
        </FadeIn>
      </div>

      <div className="relative flex-1">
        <div className="absolute left-1/2 -translate-x-1/2 z-10 w-[140px] sm:w-[180px] md:w-[220px] lg:w-[260px] top-1/2 -translate-y-1/2 sm:top-auto sm:translate-y-0 sm:bottom-0">
          <FadeIn delay={0.6} y={30}>
            <Magnet padding={150} strength={3} activeTransition="transform 0.3s ease-out" inactiveTransition="transform 0.6s ease-in-out">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full aspect-[4/5] rounded-[40px] border border-mist/10 shadow-2xl select-none"
                  style={{ objectFit: 'cover', objectPosition: '50% 15%' }}
                  draggable={false}
                />
              ) : (
                <div className="w-full aspect-[4/5] rounded-[40px] bg-gradient-to-b from-[#2a2c31] to-ink border border-[#2a2c31]" />
              )}
            </Magnet>
          </FadeIn>
        </div>
      </div>

      <div className="flex justify-between items-end pb-7 sm:pb-8 md:pb-10 px-6 md:px-10">
        <FadeIn delay={0.35} y={20}>
          <p
            className="text-mist font-light uppercase tracking-wide leading-snug max-w-[160px] sm:max-w-[220px] md:max-w-[260px]"
            style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1.5rem)' }}
          >
            {tagline}
          </p>
        </FadeIn>
        <FadeIn delay={0.5} y={20}>
          <ContactButton />
        </FadeIn>
      </div>
    </section>
  );
}
