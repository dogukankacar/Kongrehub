import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { notificationService } from '../services/api';

const FIELDS = [
  { id: 'tip', label: 'Tıp & Sağlık', icon: '🩺' },
  { id: 'bilgisayar', label: 'Bilgisayar', icon: '💻' },
  { id: 'muhendislik', label: 'Mühendislik', icon: '⚙️' },
  { id: 'egitim', label: 'Eğitim', icon: '📚' },
  { id: 'ekonomi', label: 'Ekonomi', icon: '📊' },
  { id: 'hukuk', label: 'Hukuk', icon: '⚖️' },
  { id: 'sosyal', label: 'Sosyal Bilimler', icon: '🏛️' },
  { id: 'fen', label: 'Fen Bilimleri', icon: '🔬' },
  { id: 'mimari', label: 'Mimarlık', icon: '🏗️' },
  { id: 'saglik', label: 'Hemşirelik', icon: '💊' },
  { id: 'tarim', label: 'Tarım & Gıda', icon: '🌾' },
  { id: 'psikoloji', label: 'Psikoloji', icon: '🧠' },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [notifCount, setNotifCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    notificationService.getAll()
      .then(n => setNotifCount(n.filter(x => !x.isRead).length))
      .catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={s.root}>
      {/* Sidebar */}
      <aside style={{ ...s.sidebar, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
        {/* Logo */}
        <div style={s.logo}>
          <span style={{ fontSize: 28 }}>🎓</span>
          <div>
            <div style={s.logoTitle}>KongreHub</div>
            <div style={s.logoSub}>v2.0</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={s.nav}>
          <div style={s.navSection}>ANA MENÜ</div>
          <SideLink to="/" icon="🏠" label="Tüm Kongreler" end />
          <SideLink to="/favorites" icon="⭐" label="Favorilerim" />
          {isAdmin() && <>
            <div style={{ ...s.navSection, marginTop: 16 }}>YÖNETİM</div>
            <SideLink to="/admin" icon="📊" label="Dashboard" end />
            <SideLink to="/admin/congresses" icon="📋" label="Kongre Yönetimi" />
            <SideLink to="/admin/users" icon="👥" label="Kullanıcılar" />
          </>}

          <div style={{ ...s.navSection, marginTop: 16 }}>ALANLAR</div>
          {FIELDS.map(f => (
            <NavLink
              key={f.id}
              to={`/?field=${f.id}`}
              style={({ isActive }) => ({
                ...s.fieldLink,
                color: isActive ? 'var(--accent)' : 'var(--muted)',
              })}
            >
              <span>{f.icon}</span>
              <span style={{ fontSize: 12 }}>{f.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div style={s.userBox}>
          <div style={s.userAvatar}>{user?.fullName?.[0] || '?'}</div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, truncate: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {user?.fullName}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{user?.role}</div>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn} title="Çıkış">↩</button>
        </div>
      </aside>

      {/* Main */}
      <div style={s.main}>
        {/* Topbar */}
        <header style={s.topbar}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={s.menuBtn}>☰</button>
          <div style={s.topbarRight}>
            <NavLink to="/profile" style={s.topbarBtn}>👤 Profil</NavLink>
            <NavLink to="/favorites" style={{ ...s.topbarBtn, position: 'relative' }}>
              ⭐ Favoriler
              {notifCount > 0 && <span style={s.badge}>{notifCount}</span>}
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <div style={s.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function SideLink({ to, icon, label, end }) {
  return (
    <NavLink to={to} end={end} style={({ isActive }) => ({
      ...s.sideLink,
      background: isActive ? 'rgba(0,212,170,0.1)' : 'transparent',
      color: isActive ? 'var(--accent)' : 'var(--text)',
      borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
    })}>
      <span>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

const s = {
  root: { display: 'flex', minHeight: '100vh', background: 'var(--bg)' },
  sidebar: {
    width: 'var(--sidebar-w)', minHeight: '100vh', background: 'var(--bg2)',
    borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
    position: 'fixed', top: 0, left: 0, zIndex: 50,
    transition: 'transform 0.3s', overflowY: 'auto',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '20px 16px',
    borderBottom: '1px solid var(--border)',
  },
  logoTitle: { fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  logoSub: { fontSize: 10, color: 'var(--muted)', letterSpacing: '0.5px' },
  nav: { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 },
  navSection: { fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '1px', padding: '8px 8px 4px' },
  sideLink: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
    borderRadius: 8, fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
    textDecoration: 'none',
  },
  fieldLink: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
    borderRadius: 6, fontSize: 12, transition: 'color 0.15s', textDecoration: 'none',
  },
  userBox: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
    borderTop: '1px solid var(--border)', marginTop: 'auto',
  },
  userAvatar: {
    width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent2))',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#000', flexShrink: 0,
  },
  logoutBtn: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, cursor: 'pointer', padding: 4 },
  main: { marginLeft: 'var(--sidebar-w)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  topbar: {
    height: 56, background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 40,
  },
  menuBtn: { background: 'none', border: 'none', color: 'var(--text)', fontSize: 20 },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 8 },
  topbarBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
    borderRadius: 8, fontSize: 13, fontWeight: 500, color: 'var(--muted)',
    background: 'var(--surface)', border: '1px solid var(--border)',
    transition: 'color 0.2s',
  },
  badge: {
    position: 'absolute', top: -4, right: -4, background: 'var(--danger)',
    color: 'white', borderRadius: '50%', width: 16, height: 16,
    fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  content: { flex: 1, padding: '28px 28px', maxWidth: 1200, width: '100%' },
};
