import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', university: '', department: '' });
  const { register, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await register(form);
    if (ok) navigate('/');
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={s.root}>
      <div style={s.bg} />
      <div style={s.card} className="fade-in">
        <div style={s.logo}>
          <span style={{ fontSize: 40 }}>🎓</span>
          <h1 style={s.title}>KongreHub'a Katıl</h1>
          <p style={s.sub}>Üniversite hesabınızla kayıt olun</p>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Ad Soyad</label>
            <input className="input" placeholder="Prof. Dr. Ad Soyad" value={form.fullName} onChange={e => set('fullName', e.target.value)} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>E-posta</label>
            <input className="input" type="email" placeholder="ad.soyad@universite.edu.tr" value={form.email} onChange={e => set('email', e.target.value)} required />
          </div>
          <div className="grid-2">
            <div style={s.field}>
              <label style={s.label}>Üniversite</label>
              <input className="input" placeholder="ODTÜ" value={form.university} onChange={e => set('university', e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Bölüm</label>
              <input className="input" placeholder="Bilgisayar Müh." value={form.department} onChange={e => set('department', e.target.value)} />
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label}>Şifre</label>
            <input className="input" type="password" placeholder="En az 6 karakter" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
          </div>

          {error && <div style={s.error}>{error}</div>}

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Kayıt Ol'}
          </button>
        </form>

        <p style={s.footer}>
          Hesabın var mı?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' },
  bg: { position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'linear-gradient(rgba(0,212,170,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' },
  card: { width: '100%', maxWidth: 480, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 20, padding: '36px', position: 'relative', zIndex: 1 },
  logo: { textAlign: 'center', marginBottom: 28 },
  title: { fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: 8 },
  sub: { color: 'var(--muted)', fontSize: 13, marginTop: 4 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#bbb' },
  error: { background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)' },
  footer: { textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--muted)' },
};
