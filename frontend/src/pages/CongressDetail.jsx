import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { congressService, favoriteService } from '../services/api';

export default function CongressDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [congress, setCongress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    congressService.getById(id)
      .then(data => { setCongress(data); setIsFav(data.isFavorite); })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleFav = async () => {
    if (isFav) { await favoriteService.remove(id); setIsFav(false); }
    else { await favoriteService.add(id); setIsFav(true); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>;
  if (!congress) return null;

  const fmt = (d) => d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

  return (
    <div className="fade-in" style={{ maxWidth: 800 }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }}>← Geri</button>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={s.topRow}>
          <div style={s.badges}>
            <span style={s.fieldBadge}>{congress.field}</span>
            {congress.isVerified && <span className="badge badge-green">✓ Doğrulandı</span>}
            <span className="badge badge-blue">{congress.source}</span>
          </div>
          <button onClick={toggleFav} className="btn btn-secondary btn-sm">
            {isFav ? '⭐ Favoriden Çıkar' : '☆ Favoriye Ekle'}
          </button>
        </div>

        <h1 style={s.title}>{congress.name}</h1>
        {congress.organizer && <p style={s.organizer}>🏛 {congress.organizer}</p>}

        <div style={s.infoGrid}>
          <InfoItem icon="📍" label="Şehir" value={`${congress.city || '—'}, ${congress.country}`} />
          <InfoItem icon="🗓" label="Başlangıç" value={fmt(congress.startDate)} />
          <InfoItem icon="🗓" label="Bitiş" value={fmt(congress.endDate)} />
          <InfoItem icon="⏰" label="Bildiri Son Tarihi" value={fmt(congress.deadline)} />
        </div>

        {congress.description && (
          <div style={s.desc}>
            <h3 style={s.descTitle}>Açıklama</h3>
            <p style={s.descText}>{congress.description}</p>
          </div>
        )}

        {congress.url && (
          <a href={congress.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: 16, width: 'fit-content' }}>
            🔗 Kongre Sitesine Git
          </a>
        )}
      </div>

      <div style={s.meta}>
        <span>Eklenme: {fmt(congress.createdAt)}</span>
        <span>Kaynak: {congress.source}</span>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '12px 16px' }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{icon} {label}</div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

const s = {
  topRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 },
  badges: { display: 'flex', alignItems: 'center', gap: 8 },
  fieldBadge: { fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(0,212,170,0.15)', color: 'var(--accent)' },
  title: { fontSize: 22, fontWeight: 800, lineHeight: 1.3, marginBottom: 8, letterSpacing: '-0.3px' },
  organizer: { fontSize: 14, color: 'var(--muted)', marginBottom: 20 },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 20 },
  desc: { borderTop: '1px solid var(--border)', paddingTop: 16 },
  descTitle: { fontSize: 14, fontWeight: 700, marginBottom: 8, color: '#ccc' },
  descText: { fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 },
  meta: { display: 'flex', gap: 24, fontSize: 12, color: 'var(--muted)' },
};
