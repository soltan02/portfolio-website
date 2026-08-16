import type { CSSProperties } from 'react';
import {
  siApachespark,
  siCss,
  siExpo,
  siExpress,
  siFramer,
  siHtml5,
  siJavascript,
  siLeaflet,
  siNodedotjs,
  siPostgresql,
  siPython,
  siReact,
  siSupabase,
  siTailwindcss,
  siTypescript,
  siVercel,
} from 'simple-icons';

const ICONS: Record<string, { path: string; hex: string }> = {
  react: siReact,
  'react native': siReact,
  typescript: siTypescript,
  javascript: siJavascript,
  'tailwind css': siTailwindcss,
  supabase: siSupabase,
  vercel: siVercel,
  express: siExpress,
  postgresql: siPostgresql,
  node: siNodedotjs,
  python: siPython,
  expo: siExpo,
  html: siHtml5,
  'html/css': siHtml5,
  css: siCss,
  'framer motion': siFramer,
  pyspark: siApachespark,
  leaflet: siLeaflet,
  'leaflet.js': siLeaflet,
};

function normalize(name: string) {
  return name.trim().toLowerCase();
}

interface TechLogoProps {
  name: string;
  className?: string;
}

export default function TechLogo({ name, className }: TechLogoProps) {
  const icon = ICONS[normalize(name)];
  if (!icon) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={{ '--tech': `#${icon.hex}` } as CSSProperties}
      aria-hidden="true"
    >
      <path d={icon.path} fill="currentColor" />
    </svg>
  );
}
