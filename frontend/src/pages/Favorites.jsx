// ── Favorites Page ────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoriteService } from '../services/api';

export function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    favoriteService.getAll().then(setFavorites).finally(() => setLoading(false));
  }, []);

  const remove = async (id) => {
    await favoriteService.remove(id);
    setFavorites(f => f.filter(c => c.id !== id));
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <h1 className="page-title">⭐ Favorilerim</h1>
      <p className="page-sub">{favorites.length} kayıtlı kongre</p>

      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          <span style={{ fontSize: 48 }}>⭐</span>
          <p style={{ marginTop: 12 }}>Henüz favori eklemediniz.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Kongrelere Bak</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {favorites.map(c => (
            <div key={c.id} className="card" style={{ position: 'relative' }}>
              <button onClick={() => remove(c.id)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#f39c12' }}>⭐</button>
              <Link to={`/congress/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, paddingRight: 24, lineHeight: 1.4 }}>{c.name}</h3>
                {c.organizer && <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>🏛 {c.organizer}</p>}
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#aaa' }}>
                  {c.city && <span>📍 {c.city}</span>}
                  {c.startDate && <span>🗓 {new Date(c.startDate).toLocaleDateString('tr-TR')}</span>}
                </div>
                {c.url && <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 10, fontWeight: 600 }}>🔗 Siteye Git →</div>}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
