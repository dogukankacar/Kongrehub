import { useState, useEffect } from 'react';
import { authService } from '../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    authService.getUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  const toggleActive = async (id, current) => {
    await authService.setUserActive(id, !current);
    setUsers(us => us.map(u => u.id === id ? { ...u, isActive: !current } : u));
  };

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.university || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <h1 className="page-title">👥 Kullanıcı Yönetimi</h1>
      <p className="page-sub">{users.length} kayıtlı kullanıcı</p>

      <input className="input" style={{ marginBottom: 16, maxWidth: 360 }} placeholder="🔍 İsim, email veya üniversite ara..." value={search} onChange={e => setSearch(e.target.value)} />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.th}>Kullanıcı</th>
                <th style={s.th}>Üniversite / Bölüm</th>
                <th style={s.th}>Rol</th>
                <th style={s.th}>Kayıt</th>
                <th style={s.th}>Durum</th>
                <th style={s.th}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ ...s.tr, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={s.avatar}>{u.fullName[0]}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{u.fullName}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={s.td}>
                    <div style={{ fontSize: 12 }}>{u.university || '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.department || ''}</div>
                  </td>
                  <td style={s.td}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: u.role === 'Admin' ? 'rgba(231,76,60,0.15)' : 'rgba(0,212,170,0.15)', color: u.role === 'Admin' ? 'var(--danger)' : 'var(--accent)' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={s.td}><span style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(u.createdAt).toLocaleDateString('tr-TR')}</span></td>
                  <td style={s.td}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: u.isActive ? 'rgba(39,174,96,0.15)' : 'rgba(100,100,100,0.15)', color: u.isActive ? '#2ecc71' : '#666' }}>
                      {u.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <button
                      className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-secondary'}`}
                      onClick={() => toggleActive(u.id, u.isActive)}
                    >
                      {u.isActive ? '🚫 Pasif Yap' : '✓ Aktif Yap'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const s = {
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: '12px 16px', verticalAlign: 'middle' },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#000', flexShrink: 0 },
};
