import { useEffect, useState } from 'react';
import { supabase, uploadMedia, mediaUrl, type Profile, type Project, type Service, type Experience } from '../lib/supabase';
import './Admin.css';
import ProfileEditor, { type ProfileFormData } from './admin/ProfileEditor';
import ProjectManager from './admin/ProjectManager';
import ServiceManager from './admin/ServiceManager';
import ExperienceManager from './admin/ExperienceManager';

const emptyProjectForm = {
  title: '',
  description: '',
  tech_tags: '',
  category: '',
  live_url: '',
  repo_url: '',
  display_order: '0',
  featured: false,
};

const emptyServiceForm = {
  title: '',
  description: '',
  display_order: '0',
};

const emptyExperienceForm = {
  role: '',
  organization: '',
  period: '',
  description: '',
  category: 'career',
  display_order: '0',
};

export default function AdminDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile state
  const [profileFormData, setProfileFormData] = useState<Partial<ProfileFormData>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Project state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [savingProject, setSavingProject] = useState(false);

  // Service state
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [savingService, setSavingService] = useState(false);

  // Experience state
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [experienceForm, setExperienceForm] = useState(emptyExperienceForm);
  const [savingExperience, setSavingExperience] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: profileData }, { data: projectData }, { data: serviceData }, { data: experienceData }] = await Promise.all([
      supabase.from('profile').select('*').limit(1).maybeSingle(),
      supabase.from('projects').select('*').order('display_order', { ascending: true }),
      supabase.from('services').select('*').order('display_order', { ascending: true }),
      supabase.from('experience').select('*').order('display_order', { ascending: true }),
    ]);
    const p = profileData as Profile | null;
    if (p) {
      setProfile(p);
      setProfileFormData({
        fullName: p.full_name,
        tagline: p.tagline,
        bio: p.bio,
        passions: p.passions.join(', '),
        skills: p.skills.join(', '),
        contactEmail: p.contact_email || '',
        socialLinks: p.social_links || {},
        avatarUrl: p.avatar_url,
      });
    }
    setProjects((projectData as Project[]) || []);
    setServices((serviceData as Service[]) || []);
    setExperience((experienceData as Experience[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ─── Profile ─────────────────────────────────────────────────
  const saveProfile = async () => {
    if (!profile) return;
    setSavingProfile(true);
    setProfileSaved(false);
    let avatar_url = profile.avatar_url;

    if (avatarFile) {
      const path = `avatar-${Date.now()}-${avatarFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error: upErr } = await uploadMedia(path, avatarFile);
      if (upErr) {
        setSavingProfile(false);
        alert('Photo upload failed: ' + upErr.message);
        return;
      }
      avatar_url = mediaUrl(path);
    }

    const { error } = await supabase.from('profile').update({
      full_name: profileFormData.fullName ?? profile.full_name,
      tagline: profileFormData.tagline ?? profile.tagline,
      bio: profileFormData.bio ?? profile.bio,
      passions: ((profileFormData.passions ?? '').split(',').map((s) => s.trim()).filter(Boolean)) || profile.passions,
      skills: ((profileFormData.skills ?? '').split(',').map((s) => s.trim()).filter(Boolean)) || profile.skills,
      contact_email: (profileFormData.contactEmail || '') || null,
      social_links: profileFormData.socialLinks || profile.social_links,
      avatar_url,
    }).eq('id', profile.id);

    if (!error) {
      setAvatarFile(null);
      setProfileFormData((prev) => ({ ...prev, avatarUrl: avatar_url }));
    }

    setSavingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
    load();
  };

  // ─── Projects ────────────────────────────────────────────────
  const startEditProject = (p: Project) => {
    setEditingProjectId(p.id);
    setProjectForm({
      title: p.title,
      description: p.description,
      tech_tags: p.tech_tags.join(', '),
      category: p.category || '',
      live_url: p.live_url || '',
      repo_url: p.repo_url || '',
      display_order: String(p.display_order),
      featured: p.featured,
    });
  };

  const startNewProject = () => {
    setEditingProjectId('new');
    setProjectForm(emptyProjectForm);
  };

  const cancelProjectEdit = () => {
    setEditingProjectId(null);
    setProjectForm(emptyProjectForm);
  };

  const saveProject = async (payload: Record<string, unknown>) => {
    if (editingProjectId === 'new') {
      await supabase.from('projects').insert([payload]);
    } else if (editingProjectId) {
      await supabase.from('projects').update(payload).eq('id', editingProjectId);
    }
    setSavingProject(false);
    cancelProjectEdit();
    load();
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await supabase.from('projects').delete().eq('id', id);
    load();
  };

  // ─── Services ────────────────────────────────────────────────
  const startEditService = (s: Service) => {
    setEditingServiceId(s.id);
    setServiceForm({ title: s.title, description: s.description, display_order: String(s.display_order) });
  };

  const startNewService = () => {
    setEditingServiceId('new');
    setServiceForm(emptyServiceForm);
  };

  const cancelServiceEdit = () => {
    setEditingServiceId(null);
    setServiceForm(emptyServiceForm);
  };

  const saveService = async () => {
    setSavingService(true);
    const payload = {
      title: serviceForm.title,
      description: serviceForm.description,
      display_order: Number(serviceForm.display_order) || 0,
    };
    if (editingServiceId === 'new') {
      await supabase.from('services').insert([payload]);
    } else if (editingServiceId) {
      await supabase.from('services').update(payload).eq('id', editingServiceId);
    }
    setSavingService(false);
    cancelServiceEdit();
    load();
  };

  const deleteService = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    await supabase.from('services').delete().eq('id', id);
    load();
  };

  // ─── Experience ──────────────────────────────────────────────
  const startEditExperience = (e: Experience) => {
    setEditingExperienceId(e.id);
    setExperienceForm({
      role: e.role,
      organization: e.organization,
      period: e.period,
      description: e.description,
      category: e.category || 'career',
      display_order: String(e.display_order),
    });
  };

  const startNewExperience = () => {
    setEditingExperienceId('new');
    setExperienceForm(emptyExperienceForm);
  };

  const cancelExperienceEdit = () => {
    setEditingExperienceId(null);
    setExperienceForm(emptyExperienceForm);
  };

  const saveExperience = async () => {
    setSavingExperience(true);
    const payload = {
      role: experienceForm.role,
      organization: experienceForm.organization,
      period: experienceForm.period,
      description: experienceForm.description,
      category: experienceForm.category || 'career',
      display_order: Number(experienceForm.display_order) || 0,
    };
    if (editingExperienceId === 'new') {
      await supabase.from('experience').insert([payload]);
    } else if (editingExperienceId) {
      await supabase.from('experience').update(payload).eq('id', editingExperienceId);
    }
    setSavingExperience(false);
    cancelExperienceEdit();
    load();
  };

  const deleteExperience = async (id: string) => {
    if (!confirm('Delete this experience?')) return;
    await supabase.from('experience').delete().eq('id', id);
    load();
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div className="admin-loading">Loading…</div>;

  return (
    <div className="admin">
      <div className="admin-header">
        <h1>Dashboard</h1>
        <div className="admin-header-actions">
          <a href="/" target="_blank" rel="noreferrer">View site ↗</a>
          <button className="btn-secondary" onClick={logout}>Log out</button>
        </div>
      </div>

      <ProfileEditor
        profile={profile!}
        formData={profileFormData as ProfileFormData}
        setFormData={(partial) => setProfileFormData((prev) => ({ ...prev, ...partial }))}
        avatarFile={avatarFile}
        onAvatarChange={setAvatarFile}
        saving={savingProfile}
        saved={profileSaved}
        onSave={saveProfile}
      />

      <ProjectManager
        projects={projects}
        editingId={editingProjectId}
        form={projectForm}
        setForm={setProjectForm}
        saving={savingProject}
        onStartEdit={startEditProject}
        onStartNew={startNewProject}
        onCancel={cancelProjectEdit}
        onSave={saveProject}
        onDelete={deleteProject}
      />

      <ServiceManager
        services={services}
        editingId={editingServiceId}
        form={serviceForm}
        setForm={setServiceForm}
        saving={savingService}
        onStartEdit={startEditService}
        onStartNew={startNewService}
        onCancel={cancelServiceEdit}
        onSave={saveService}
        onDelete={deleteService}
      />

      <ExperienceManager
        experiences={experience}
        editingId={editingExperienceId}
        form={experienceForm}
        setForm={setExperienceForm}
        saving={savingExperience}
        onStartEdit={startEditExperience}
        onStartNew={startNewExperience}
        onCancel={cancelExperienceEdit}
        onSave={saveExperience}
        onDelete={deleteExperience}
      />
    </div>
  );
}
