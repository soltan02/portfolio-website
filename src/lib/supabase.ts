import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface Profile {
  id: string;
  full_name: string;
  tagline: string;
  bio: string;
  passions: string[];
  skills: string[];
  contact_email: string | null;
  social_links: Record<string, string>;
  avatar_url: string | null;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tech_tags: string[];
  category: string | null;
  image_url: string | null;
  image_url_2: string | null;
  image_url_3: string | null;
  live_url: string | null;
  repo_url: string | null;
  display_order: number;
  featured: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  display_order: number;
  created_at: string;
}

export interface Experience {
  id: string;
  role: string;
  organization: string;
  period: string;
  description: string;
  display_order: number;
  created_at: string;
}

const BUCKET = 'portfolio-media';

export function uploadMedia(path: string, file: File) {
  return supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
}

export function mediaUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
