import { useState } from 'react';
import { uploadMedia, mediaUrl, type Project } from '../../lib/supabase';
import '../Admin.css';

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

/** Tracks which images have been newly uploaded for this edit cycle. */
interface ImageUploadState {
  files: Array<File | null>;
  previews: Array<string | null>;
}

interface ProjectManagerProps {
  projects: Project[];
  editingId: string | null;
  form: typeof emptyProjectForm;
  setForm: (form: typeof emptyProjectForm) => void;
  saving: boolean;
  onStartEdit: (p: Project) => void;
  onStartNew: () => void;
  onCancel: () => void;
  /** Called with the prepared payload and existing image URLs. Return the saved project. */
  onSave: (payload: Record<string, unknown>, existingUrls: Array<string | null>) => Promise<void>;
  onDelete: (id: string) => void;
}

export default function ProjectManager({
  projects,
  editingId,
  form,
  setForm,
  saving,
  onStartEdit,
  onStartNew,
  onCancel,
  onSave,
  onDelete,
}: ProjectManagerProps) {
  const [images, setImages] = useState<ImageUploadState>({ files: [null, null, null], previews: [null, null, null] });

  const handleImageChange = (slot: number, file: File | null) => {
    setImages((prev) => {
      const files = [...prev.files];
      const previews = [...prev.previews];
      files[slot] = file;
      previews[slot] = file ? URL.createObjectURL(file) : null;
      return { files, previews };
    });
  };

  const resetImages = (existing: Project | undefined) => {
    const urls = [existing?.image_url ?? null, existing?.image_url_2 ?? null, existing?.image_url_3 ?? null];
    setImages({ files: [null, null, null], previews: [...urls] });
  };

  const startEdit = (p: Project) => {
    onStartEdit(p);
    resetImages(p);
  };

  const startNew = () => {
    onStartNew();
    setForm(emptyProjectForm);
    resetImages(undefined);
  };

  const cancel = () => {
    onCancel();
    setForm(emptyProjectForm);
    resetImages(undefined);
  };

  const handleSave = async () => {
    const existing = editingId !== 'new' ? projects.find((p) => p.id === editingId) : undefined;
    const existingUrls = [existing?.image_url ?? null, existing?.image_url_2 ?? null, existing?.image_url_3 ?? null];
    const finalUrls: Array<string | null> = [...existingUrls];

    // Upload new images
    for (let i = 0; i < 3; i++) {
      const file = images.files[i];
      if (file) {
        const path = `project-${Date.now()}-${i}-${file.name}`;
        const { error: upErr } = await uploadMedia(path, file);
        if (!upErr) finalUrls[i] = mediaUrl(path);
      }
    }

    const payload = {
      title: form.title,
      description: form.description,
      tech_tags: form.tech_tags.split(',').map((s) => s.trim()).filter(Boolean),
      category: form.category || null,
      live_url: form.live_url || null,
      repo_url: form.repo_url || null,
      display_order: Number(form.display_order) || 0,
      featured: form.featured,
      image_url: finalUrls[0],
      image_url_2: finalUrls[1],
      image_url_3: finalUrls[2],
    };

    await onSave(payload, existingUrls);
  };

  return (
    <section className="admin-card">
      <div className="admin-card-header">
        <h2>Projects</h2>
        {editingId === null && (
          <button className="btn-primary" onClick={startNew}>+ Add project</button>
        )}
      </div>

      {editingId !== null && (
        <div className="project-form">
          <div className="form-grid">
            <label>
              Title
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label>
              Category{' '}
              <span className="hint">(e.g. Client, Personal)</span>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </label>
            <label>
              Display order
              <input
                type="number"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: e.target.value })}
              />
            </label>
            <label className="span-2">
              Description
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label className="span-2">
              Technologies{' '}
              <span className="hint">(separate with commas)</span>
              <input
                value={form.tech_tags}
                onChange={(e) => setForm({ ...form, tech_tags: e.target.value })}
              />
            </label>
            <label>
              Live project link
              <input
                value={form.live_url}
                onChange={(e) => setForm({ ...form, live_url: e.target.value })}
                placeholder="https://…"
              />
            </label>
            <label>
              Source code link
              <input
                value={form.repo_url}
                onChange={(e) => setForm({ ...form, repo_url: e.target.value })}
                placeholder="https://…"
              />
            </label>
            {[0, 1, 2].map((slot) => (
              <label key={slot}>
                Image {slot + 1}{slot === 0 ? '' : ' (optional)'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(slot, e.target.files?.[0] || null)}
                />
                {images.previews[slot] && (
                  <img className="project-preview" src={images.previews[slot]!} alt="" />
                )}
              </label>
            ))}
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Featured project
            </label>
          </div>
          <div className="project-form-actions">
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save project'}
            </button>
            <button className="btn-secondary" onClick={cancel}>Cancel</button>
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
              <button className="btn-secondary" onClick={() => startEdit(p)}>Edit</button>
              <button className="btn-danger" onClick={() => onDelete(p.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
