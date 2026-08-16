import { useEffect, useState } from 'react';
import { type Profile } from '../../lib/supabase';
import '../Admin.css';

const SOCIAL_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'github', label: 'GitHub' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'twitter', label: 'Twitter / X' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
];

export interface ProfileFormData {
  fullName: string;
  tagline: string;
  bio: string;
  passions: string;
  skills: string;
  contactEmail: string;
  socialLinks: Record<string, string>;
  avatarUrl: string | null;
}

interface ProfileEditorProps {
  profile: Profile;
  formData: ProfileFormData;
  setFormData: (form: Partial<ProfileFormData>) => void;
  avatarFile: File | null;
  onAvatarChange: (file: File | null) => void;
  saving: boolean;
  saved: boolean;
  onSave: () => Promise<void>;
}

export default function ProfileEditor({
  formData,
  setFormData,
  avatarFile,
  onAvatarChange,
  saving,
  saved,
  onSave,
}: ProfileEditorProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(formData.avatarUrl);

  useEffect(() => {
    if (!avatarFile) setAvatarPreview(formData.avatarUrl);
  }, [formData.avatarUrl, avatarFile]);

  const handleAvatarChange = (file: File | null) => {
    onAvatarChange(file);
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleChange = (field: keyof ProfileFormData, value: string | Record<string, string>) => {
    setFormData({ [field]: value });
  };

  return (
    <section className="admin-card">
      <h2>Profile</h2>
      <div className="form-grid">
        <label>
          Full name
          <input
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
          />
        </label>
        <label>
          Tagline / slogan
          <input
            value={formData.tagline}
            onChange={(e) => handleChange('tagline', e.target.value)}
            placeholder="e.g. Builder of striking, memorable products"
          />
        </label>
        <label className="span-2">
          Bio
          <textarea
            rows={4}
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
          />
        </label>
        <label className="span-2">
          Passions{' '}
          <span className="hint">(separate with commas)</span>
          <input
            value={formData.passions}
            onChange={(e) => handleChange('passions', e.target.value)}
            placeholder="e.g. travel, photography, music"
          />
        </label>
        <label className="span-2">
          Skills{' '}
          <span className="hint">(separate with commas)</span>
          <input
            value={formData.skills}
            onChange={(e) => handleChange('skills', e.target.value)}
            placeholder="e.g. product management, design, AI"
          />
        </label>
        <label>
          Contact email
          <input
            type="email"
            value={formData.contactEmail}
            onChange={(e) => handleChange('contactEmail', e.target.value)}
          />
        </label>
        <label>
          Profile photo
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleAvatarChange(e.target.files?.[0] || null)}
          />
          {avatarPreview && (
            <span className="avatar-preview-wrap">
              <img className="avatar-preview" src={avatarPreview} alt="" />
              <button
                type="button"
                className="avatar-remove"
                onClick={() => {
                  onAvatarChange(null);
                  setAvatarPreview(null);
                }}
              >
                Remove
              </button>
            </span>
          )}
        </label>
      </div>

      <h3>Social links</h3>
      <div className="form-grid">
        {SOCIAL_FIELDS.map((f) => (
          <label key={f.key}>
            {f.label}
            <input
              value={formData.socialLinks[f.key] || ''}
              onChange={(e) => {
                const next = { ...formData.socialLinks, [f.key]: e.target.value };
                handleChange('socialLinks', next);
              }}
              placeholder="https://…"
            />
          </label>
        ))}
      </div>

      <button className="btn-primary" onClick={onSave} disabled={saving}>
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save profile'}
      </button>
    </section>
  );
}
