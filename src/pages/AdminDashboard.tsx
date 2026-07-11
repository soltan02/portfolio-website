import { useEffect, useState } from 'react';
import { supabase, uploadMedia, mediaUrl, type Profile, type Project, type Service, type Experience } from '../lib/supabase';
import './Admin.css';

const SOCIAL_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'github', label: 'GitHub' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'twitter', label: 'Twitter / X' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
];

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
  display_order: '0',
};

export default function AdminDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Profile form state
  const [fullName, setFullName] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [passions, setPassions] = useState('');
  const [skills, setSkills] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Project form state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [projectImageFiles, setProjectImageFiles] = useState<Array<File | null>>([null, null, null]);
  const [projectImagePreviews, setProjectImagePreviews] = useState<Array<string | null>>([null, null, null]);
  const [savingProject, setSavingProject] = useState(false);

  // Service form state
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [savingService, setSavingService] = useState(false);

  // Experience form state
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
      setFullName(p.full_name);
      setTagline(p.tagline);
      setBio(p.bio);
      setPassions(p.passions.join(', '));
      setSkills(p.skills.join(', '));
      setContactEmail(p.contact_email || '');
      setSocialLinks(p.social_links || {});
      setAvatarPreview(p.avatar_url);
    }
    setProjects((projectData as Project[]) || []);
    setServices((serviceData as Service[]) || []);
    setExperience((experienceData as Experience[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAvatarChange = (file: File | null) => {
    setAvatarFile(file);
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSavingProfile(true);
    setProfileSaved(false);
    let avatar_url = profile.avatar_url;
    if (avatarFile) {
      const path = `avatar-${Date.now()}-${avatarFile.name}`;
      const { error: upErr } = await uploadMedia(path, avatarFile);
      if (!upErr) avatar_url = mediaUrl(path);
    }
    await supabase.from('profile').update({
      full_name: fullName,
      tagline,
      bio,
      passions: passions.split(',').map((s) => s.trim()).filter(Boolean),
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      contact_email: contactEmail || null,
      social_links: socialLinks,
      avatar_url,
    }).eq('id', profile.id);
    setAvatarFile(null);
    setSavingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
    load();
  };

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
    setProjectImagePreviews([p.image_url, p.image_url_2, p.image_url_3]);
    setProjectImageFiles([null, null, null]);
  };

  const startNewProject = () => {
    setEditingProjectId('new');
    setProjectForm(emptyProjectForm);
    setProjectImagePreviews([null, null, null]);
    setProjectImageFiles([null, null, null]);
  };

  const cancelProjectEdit = () => {
    setEditingProjectId(null);
    setProjectForm(emptyProjectForm);
    setProjectImagePreviews([null, null, null]);
    setProjectImageFiles([null, null, null]);
  };

  const handleProjectImageChange = (slot: number, file: File | null) => {
    setProjectImageFiles((prev) => { const next = [...prev]; next[slot] = file; return next; });
    if (file) {
      setProjectImagePreviews((prev) => { const next = [...prev]; next[slot] = URL.createObjectURL(file); return next; });
    }
  };

  const saveProject = async () => {
    setSavingProject(true);
    const existing = editingProjectId !== 'new' ? projects.find((p) => p.id === editingProjectId) : undefined;
    const existingUrls = [existing?.image_url ?? null, existing?.image_url_2 ?? null, existing?.image_url_3 ?? null];

    const finalUrls: Array<string | null> = [...existingUrls];
    for (let i = 0; i < 3; i++) {
      const file = projectImageFiles[i];
      if (file) {
        const path = `project-${Date.now()}-${i}-${file.name}`;
        const { error: upErr } = await uploadMedia(path, file);
        if (!upErr) finalUrls[i] = mediaUrl(path);
      }
    }

    const payload = {
      title: projectForm.title,
      description: projectForm.description,
      tech_tags: projectForm.tech_tags.split(',').map((s) => s.trim()).filter(Boolean),
      category: projectForm.category || null,
      live_url: projectForm.live_url || null,
      repo_url: projectForm.repo_url || null,
      display_order: Number(projectForm.display_order) || 0,
      featured: projectForm.featured,
      image_url: finalUrls[0],
      image_url_2: finalUrls[1],
      image_url_3: finalUrls[2],
    };
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
    if (!confirm('Supprimer ce projet ?')) return;
    await supabase.from('projects').delete().eq('id', id);
    load();
  };

  // Services CRUD
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
    if (!confirm('Supprimer ce service ?')) return;
    await supabase.from('services').delete().eq('id', id);
    load();
  };

  // Experience CRUD
  const startEditExperience = (e: Experience) => {
    setEditingExperienceId(e.id);
    setExperienceForm({
      role: e.role,
      organization: e.organization,
      period: e.period,
      description: e.description,
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
    if (!confirm('Supprimer cette expérience ?')) return;
    await supabase.from('experience').delete().eq('id', id);
    load();
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div className="admin-loading">Chargement…</div>;

  return (
    <div className="admin">
      <div className="admin-header">
        <h1>Tableau de bord</h1>
        <div className="admin-header-actions">
          <a href="/" target="_blank" rel="noreferrer">Voir le site ↗</a>
          <button className="btn-secondary" onClick={logout}>Se déconnecter</button>
        </div>
      </div>

      <section className="admin-card">
        <h2>Profil</h2>
        <div className="form-grid">
          <label>
            Nom complet
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>
          <label>
            Slogan / tagline
            <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="ex: Créateur d'applications" />
          </label>
          <label className="span-2">
            Bio
            <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
          </label>
          <label className="span-2">
            Passions <span className="hint">(séparées par des virgules)</span>
            <input value={passions} onChange={(e) => setPassions(e.target.value)} placeholder="ex: voyage, photographie, musique" />
          </label>
          <label className="span-2">
            Compétences <span className="hint">(séparées par des virgules)</span>
            <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="ex: gestion de produit, design, IA" />
          </label>
          <label>
            Email de contact
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </label>
          <label>
            Photo de profil
            <input type="file" accept="image/*" onChange={(e) => handleAvatarChange(e.target.files?.[0] || null)} />
            {avatarPreview && <img className="avatar-preview" src={avatarPreview} alt="" />}
          </label>
        </div>

        <h3>Réseaux sociaux</h3>
        <div className="form-grid">
          {SOCIAL_FIELDS.map((f) => (
            <label key={f.key}>
              {f.label}
              <input
                value={socialLinks[f.key] || ''}
                onChange={(e) => setSocialLinks((prev) => ({ ...prev, [f.key]: e.target.value }))}
                placeholder="https://…"
              />
            </label>
          ))}
        </div>

        <button className="btn-primary" onClick={saveProfile} disabled={savingProfile}>
          {savingProfile ? 'Enregistrement…' : profileSaved ? 'Enregistré ✓' : 'Enregistrer le profil'}
        </button>
      </section>

      <section className="admin-card">
        <div className="admin-card-header">
          <h2>Services</h2>
          {editingServiceId === null && (
            <button className="btn-primary" onClick={startNewService}>+ Ajouter un service</button>
          )}
        </div>

        {editingServiceId !== null && (
          <div className="project-form">
            <div className="form-grid">
              <label>
                Titre
                <input value={serviceForm.title} onChange={(e) => setServiceForm((f) => ({ ...f, title: e.target.value }))} />
              </label>
              <label>
                Ordre d'affichage
                <input type="number" value={serviceForm.display_order} onChange={(e) => setServiceForm((f) => ({ ...f, display_order: e.target.value }))} />
              </label>
              <label className="span-2">
                Description
                <textarea rows={3} value={serviceForm.description} onChange={(e) => setServiceForm((f) => ({ ...f, description: e.target.value }))} />
              </label>
            </div>
            <div className="project-form-actions">
              <button className="btn-primary" onClick={saveService} disabled={savingService}>
                {savingService ? 'Enregistrement…' : 'Enregistrer le service'}
              </button>
              <button className="btn-secondary" onClick={cancelServiceEdit}>Annuler</button>
            </div>
          </div>
        )}

        <ul className="project-list">
          {services.map((s) => (
            <li key={s.id} className="project-list-item">
              <div className="project-list-info">
                <strong>{s.title}</strong>
                <span>{s.description}</span>
              </div>
              <div className="project-list-actions">
                <button className="btn-secondary" onClick={() => startEditService(s)}>Modifier</button>
                <button className="btn-danger" onClick={() => deleteService(s.id)}>Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-card">
        <div className="admin-card-header">
          <h2>Expérience</h2>
          {editingExperienceId === null && (
            <button className="btn-primary" onClick={startNewExperience}>+ Ajouter une expérience</button>
          )}
        </div>

        {editingExperienceId !== null && (
          <div className="project-form">
            <div className="form-grid">
              <label>
                Poste / rôle
                <input value={experienceForm.role} onChange={(e) => setExperienceForm((f) => ({ ...f, role: e.target.value }))} placeholder="ex: Fondateur, Développeur freelance…" />
              </label>
              <label>
                Organisation <span className="hint">(entreprise, projet, etc.)</span>
                <input value={experienceForm.organization} onChange={(e) => setExperienceForm((f) => ({ ...f, organization: e.target.value }))} />
              </label>
              <label>
                Période <span className="hint">(ex: 2022 — présent)</span>
                <input value={experienceForm.period} onChange={(e) => setExperienceForm((f) => ({ ...f, period: e.target.value }))} />
              </label>
              <label>
                Ordre d'affichage
                <input type="number" value={experienceForm.display_order} onChange={(e) => setExperienceForm((f) => ({ ...f, display_order: e.target.value }))} />
              </label>
              <label className="span-2">
                Description
                <textarea rows={3} value={experienceForm.description} onChange={(e) => setExperienceForm((f) => ({ ...f, description: e.target.value }))} />
              </label>
            </div>
            <div className="project-form-actions">
              <button className="btn-primary" onClick={saveExperience} disabled={savingExperience}>
                {savingExperience ? 'Enregistrement…' : 'Enregistrer l\'expérience'}
              </button>
              <button className="btn-secondary" onClick={cancelExperienceEdit}>Annuler</button>
            </div>
          </div>
        )}

        <ul className="project-list">
          {experience.map((e) => (
            <li key={e.id} className="project-list-item">
              <div className="project-list-info">
                <strong>{e.role}{e.organization ? ` — ${e.organization}` : ''}</strong>
                <span>{e.period}</span>
              </div>
              <div className="project-list-actions">
                <button className="btn-secondary" onClick={() => startEditExperience(e)}>Modifier</button>
                <button className="btn-danger" onClick={() => deleteExperience(e.id)}>Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-card">
        <div className="admin-card-header">
          <h2>Projets</h2>
          {editingProjectId === null && (
            <button className="btn-primary" onClick={startNewProject}>+ Ajouter un projet</button>
          )}
        </div>

        {editingProjectId !== null && (
          <div className="project-form">
            <div className="form-grid">
              <label>
                Titre
                <input value={projectForm.title} onChange={(e) => setProjectForm((f) => ({ ...f, title: e.target.value }))} />
              </label>
              <label>
                Catégorie <span className="hint">(ex: Client, Personnel)</span>
                <input value={projectForm.category} onChange={(e) => setProjectForm((f) => ({ ...f, category: e.target.value }))} />
              </label>
              <label>
                Ordre d'affichage
                <input type="number" value={projectForm.display_order} onChange={(e) => setProjectForm((f) => ({ ...f, display_order: e.target.value }))} />
              </label>
              <label className="span-2">
                Description
                <textarea rows={3} value={projectForm.description} onChange={(e) => setProjectForm((f) => ({ ...f, description: e.target.value }))} />
              </label>
              <label className="span-2">
                Technologies <span className="hint">(séparées par des virgules)</span>
                <input value={projectForm.tech_tags} onChange={(e) => setProjectForm((f) => ({ ...f, tech_tags: e.target.value }))} />
              </label>
              <label>
                Lien du projet
                <input value={projectForm.live_url} onChange={(e) => setProjectForm((f) => ({ ...f, live_url: e.target.value }))} placeholder="https://…" />
              </label>
              <label>
                Lien du code source
                <input value={projectForm.repo_url} onChange={(e) => setProjectForm((f) => ({ ...f, repo_url: e.target.value }))} placeholder="https://…" />
              </label>
              {[0, 1, 2].map((slot) => (
                <label key={slot}>
                  Image {slot + 1}{slot === 0 ? '' : ' (optionnelle)'}
                  <input type="file" accept="image/*" onChange={(e) => handleProjectImageChange(slot, e.target.files?.[0] || null)} />
                  {projectImagePreviews[slot] && <img className="project-preview" src={projectImagePreviews[slot]!} alt="" />}
                </label>
              ))}
              <label className="checkbox-label">
                <input type="checkbox" checked={projectForm.featured} onChange={(e) => setProjectForm((f) => ({ ...f, featured: e.target.checked }))} />
                Projet mis en avant
              </label>
            </div>
            <div className="project-form-actions">
              <button className="btn-primary" onClick={saveProject} disabled={savingProject}>
                {savingProject ? 'Enregistrement…' : 'Enregistrer le projet'}
              </button>
              <button className="btn-secondary" onClick={cancelProjectEdit}>Annuler</button>
            </div>
          </div>
        )}

        <ul className="project-list">
          {projects.map((p) => (
            <li key={p.id} className="project-list-item">
              {p.image_url && <img src={p.image_url} alt="" className="project-list-thumb" />}
              <div className="project-list-info">
                <strong>{p.title}</strong>
                <span>{p.description}</span>
              </div>
              <div className="project-list-actions">
                <button className="btn-secondary" onClick={() => startEditProject(p)}>Modifier</button>
                <button className="btn-danger" onClick={() => deleteProject(p.id)}>Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
