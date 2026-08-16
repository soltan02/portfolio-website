import { type Service } from '../../lib/supabase';
import '../Admin.css';

const emptyServiceForm = {
  title: '',
  description: '',
  display_order: '0',
};

interface ServiceManagerProps {
  services: Service[];
  editingId: string | null;
  form: typeof emptyServiceForm;
  setForm: (form: typeof emptyServiceForm) => void;
  saving: boolean;
  onStartEdit: (s: Service) => void;
  onStartNew: () => void;
  onCancel: () => void;
  onSave: () => Promise<void>;
  onDelete: (id: string) => void;
}

export default function ServiceManager({
  services,
  editingId,
  form,
  setForm,
  saving,
  onStartEdit,
  onStartNew,
  onCancel,
  onSave,
  onDelete,
}: ServiceManagerProps) {
  const startEdit = (s: Service) => {
    onStartEdit(s);
    setForm({ title: s.title, description: s.description, display_order: String(s.display_order) });
  };

  const startNew = () => {
    onStartNew();
    setForm(emptyServiceForm);
  };

  const cancel = () => {
    onCancel();
    setForm(emptyServiceForm);
  };

  return (
    <section className="admin-card">
      <div className="admin-card-header">
        <h2>Services</h2>
        {editingId === null && (
          <button className="btn-primary" onClick={startNew}>+ Add service</button>
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
              {saving ? 'Saving…' : 'Save service'}
            </button>
            <button className="btn-secondary" onClick={cancel}>Cancel</button>
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
              <button className="btn-secondary" onClick={() => startEdit(s)}>Edit</button>
              <button className="btn-danger" onClick={() => onDelete(s.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
