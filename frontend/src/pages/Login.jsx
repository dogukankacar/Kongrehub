import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(form.email, form.password);
    if (ok) navigate('/');
  };

  return (
    <div style={s.root}>
      <div style={s.bg} />
      <div style={s.card} className="fade-in">
        <div style={s.logo}>
          <span style={{ fontSize: 48 }}>🎓</span>
          <h1 style={s.title}>KongreHub</h1>
          <p style={s.sub}>Türkiye Kongre Platformu</p>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>E-posta</label>
            <input
              className="input"
              type="email"
              placeholder="ornek@universite.edu.tr"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Şifre</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && <div style={s.error}>{error}</div>}

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Giriş Yap'}
          </button>
        </form>

        <p style={s.footer}>
          Hesabın yok mu?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' },
  bg: {
    position: 'fixed', inset: 0, zIndex: 0,
    backgroundImage: 'linear-gradient(rgba(0,212,170,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,0.03) 1px, transparent 1px)',
    backgroundSize: '60px 60px',
  },
  card: {
    width: '100%', maxWidth: 420, background: 'var(--bg2)',
    border: '1px solid var(--border)', borderRadius: 20,
    padding: '40px 36px', position: 'relative', zIndex: 1,
  },
  logo: { textAlign: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: 8 },
  sub: { color: 'var(--muted)', fontSize: 14, marginTop: 4 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#bbb' },
  error: { background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)' },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--muted)' },
};
