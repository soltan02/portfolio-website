import { useEffect, useState } from 'react';
import { supabase, type Profile, type Project, type Service, type Experience } from '../lib/supabase';
import HeroSection from '../components/sections/HeroSection';
import MarqueeSection from '../components/sections/MarqueeSection';
import AboutSection from '../components/sections/AboutSection';
import ExperienceSection from '../components/sections/ExperienceSection';
import ServicesSection from '../components/sections/ServicesSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import FadeIn from '../components/FadeIn';

const SOCIAL_LABELS: Record<string, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  twitter: 'Twitter / X',
  instagram: 'Instagram',
  facebook: 'Facebook',
};

export default function PublicSite() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: profileData }, { data: projectData }, { data: serviceData }, { data: experienceData }] = await Promise.all([
        supabase.from('profile').select('*').limit(1).maybeSingle(),
        supabase.from('projects').select('*').order('display_order', { ascending: true }),
        supabase.from('services').select('*').order('display_order', { ascending: true }),
        supabase.from('experience').select('*').order('display_order', { ascending: true }),
      ]);
      setProfile(profileData as Profile | null);
      setProjects((projectData as Project[]) || []);
      setServices((serviceData as Service[]) || []);
      setExperience((experienceData as Experience[]) || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center text-[#D7E2EA]/60">
        Chargement…
      </div>
    );
  }

  const socialEntries = Object.entries(profile?.social_links || {}).filter(([, url]) => url);

  return (
    <div className="bg-[#0C0C0C]" style={{ overflowX: 'clip' }}>
      <HeroSection profile={profile} />
      <MarqueeSection />
      <AboutSection profile={profile} />
      <ExperienceSection experience={experience} />
      <ServicesSection services={services} />
      <ProjectsSection projects={projects} />

      {(profile?.contact_email || socialEntries.length > 0) && (
        <section id="contact" className="relative z-10 bg-[#0C0C0C] px-5 sm:px-8 md:px-10 py-20 text-center">
          <FadeIn y={30}>
            <div className="flex flex-wrap justify-center gap-6">
              {profile?.contact_email && (
                <a href={`mailto:${profile.contact_email}`} className="text-[#D7E2EA] border-b border-[#D7E2EA]/30 hover:border-[#D7E2EA] pb-1">
                  {profile.contact_email}
                </a>
              )}
              {socialEntries.map(([key, url]) => (
                <a key={key} href={url} target="_blank" rel="noreferrer" className="text-[#D7E2EA] border-b border-[#D7E2EA]/30 hover:border-[#D7E2EA] pb-1">
                  {SOCIAL_LABELS[key] || key}
                </a>
              ))}
            </div>
          </FadeIn>
        </section>
      )}

      <footer className="text-center py-8">
        <a href="/admin" className="text-[#D7E2EA]/30 hover:text-[#D7E2EA]/70 text-xs">Admin</a>
      </footer>
    </div>
  );
}
