import { type Experience } from '../../lib/supabase';
import '../Admin.css';

const emptyExperienceForm = {
  role: '',
  organization: '',
  period: '',
  description: '',
  category: 'career',
  display_order: '0',
};

const CATEGORY_OPTIONS = [
  { value: 'education', label: 'Education (study)' },
  { value: 'career', label: 'Career (work)' },
];

interface ExperienceManagerProps {
  experiences: Experience[];
  editingId: string | null;
  form: typeof emptyExperienceForm;
  setForm: (form: typeof emptyExperienceForm) => void;
  saving: boolean;
  onStartEdit: (e: Experience) => void;
  onStartNew: () => void;
  onCancel: () => void;
  onSave: () => Promise<void>;
  onDelete: (id: string) => void;
}

export default function ExperienceManager({
  experiences,
  editingId,
  form,
  setForm,
  saving,
  onStartEdit,
  onStartNew,
  onCancel,
  onSave,
  onDelete,
}: ExperienceManagerProps) {
  const startEdit = (e: Experience) => {
    onStartEdit(e);
    setForm({
      role: e.role,
      organization: e.organization,
      period: e.period,
      description: e.description,
      category: e.category || 'career',
      display_order: String(e.display_order),
    });
  };

  const startNew = () => {
    onStartNew();
    setForm(emptyExperienceForm);
  };

  const cancel = () => {
    onCancel();
    setForm(emptyExperienceForm);
  };

  const categoryLabel = (value: string) =>
    CATEGORY_OPTIONS.find((o) => o.value === value)?.label ?? value;

  return (
    <section className="admin-card">
      <div className="admin-card-header">
        <h2>Experience</h2>
        {editingId === null && (
          <button className="btn-primary" onClick={startNew}>+ Add experience</button>
        )}
      </div>

      {editingId !== null && (
        <div className="project-form">
          <div className="form-grid">
            <label>
              Role / title
              <input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. Bachelor of Computer Science"
              />
            </label>
            <label>
              Organisation{' '}
              <span className="hint">(school, company, project…)</span>
              <input
                value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
              />
            </label>
            <label>
              Type
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label>
              Period{' '}
              <span className="hint">(e.g. 2020 — 2024)</span>
              <input
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
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
          </div>
          <div className="project-form-actions">
            <button className="btn-primary" onClick={onSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save experience'}
            </button>
            <button className="btn-secondary" onClick={cancel}>Cancel</button>
          </div>
        </div>
      )}

      <ul className="project-list">
        {experiences.map((e) => (
          <li key={e.id} className="project-list-item">
            <div className="project-list-info">
              <strong>{e.role}{e.organization ? ` — ${e.organization}` : ''}</strong>
              <span>{e.period} · {categoryLabel(e.category || 'career')}</span>
            </div>
            <div className="project-list-actions">
              <button className="btn-secondary" onClick={() => startEdit(e)}>Edit</button>
              <button className="btn-danger" onClick={() => onDelete(e.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
