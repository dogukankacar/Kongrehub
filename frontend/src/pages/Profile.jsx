import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/api';

export default function Profile() {
  const { user, fetchMe } = useAuthStore();
  const [form, setForm] = useState({ fullName: user?.fullName || '', university: user?.university || '', department: user?.department || '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updateProfile(form);
      await fetchMe();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 600 }}>
      <h1 className="page-title">👤 Profilim</h1>
      <p className="page-sub">Hesap bilgilerinizi güncelleyin</p>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#000' }}>
            {user?.fullName?.[0]}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{user?.fullName}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>{user?.email}</div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: user?.role === 'Admin' ? 'rgba(231,76,60,0.15)' : 'rgba(0,212,170,0.15)', color: user?.role === 'Admin' ? 'var(--danger)' : 'var(--accent)' }}>
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#bbb' }}>Ad Soyad</label>
            <input className="input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
          </div>
          <div className="grid-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#bbb' }}>Üniversite</label>
              <input className="input" value={form.university} onChange={e => setForm({ ...form, university: e.target.value })} placeholder="Üniversite adı" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#bbb' }}>Bölüm</label>
              <input className="input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="Bölüm adı" />
            </div>
          </div>

          {success && <div style={{ background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#2ecc71' }}>✓ Profil güncellendi.</div>}

          <button className="btn btn-primary" style={{ width: 'fit-content' }} disabled={saving}>
            {saving ? 'Kaydediliyor...' : '💾 Kaydet'}
          </button>
        </form>
      </div>
    </div>
  );
}
