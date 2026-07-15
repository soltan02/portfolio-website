import type { Project } from '../../lib/supabase';
import FadeIn from '../FadeIn';
import ProjectCardStack from './ProjectCardStack';

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
          Project
        </h2>
      </FadeIn>

      {projects.length === 0 ? (
        <p className="text-mist/50 text-center">No projects yet.</p>
      ) : (
        <div className="max-w-5xl mx-auto flex flex-col gap-0">
          {projects.map((p, i) => (
            <ProjectCardStack key={p.id} project={p} index={i} total={projects.length} />
          ))}
        </div>
      )}
    </section>
  );
}
