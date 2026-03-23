import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { congressService, favoriteService, scraperService } from '../services/api';

const FIELDS = [
  { id: '', label: 'Tümü', icon: '🌐' },
  { id: 'tip', label: 'Tıp & Sağlık', icon: '🩺' },
  { id: 'bilgisayar', label: 'Bilgisayar', icon: '💻' },
  { id: 'muhendislik', label: 'Mühendislik', icon: '⚙️' },
  { id: 'egitim', label: 'Eğitim', icon: '📚' },
  { id: 'ekonomi', label: 'Ekonomi', icon: '📊' },
  { id: 'hukuk', label: 'Hukuk', icon: '⚖️' },
  { id: 'sosyal', label: 'Sosyal', icon: '🏛️' },
  { id: 'fen', label: 'Fen', icon: '🔬' },
  { id: 'mimari', label: 'Mimarlık', icon: '🏗️' },
  { id: 'saglik', label: 'Hemşirelik', icon: '💊' },
  { id: 'tarim', label: 'Tarım', icon: '🌾' },
  { id: 'psikoloji', label: 'Psikoloji', icon: '🧠' },
];

const SOURCE_COLORS = { ai: '#0095ff', scraper: '#f39c12', manual: '#27ae60' };
const SOURCE_LABELS = { ai: '🤖 AI', scraper: '🕷️ Scraper', manual: '✏️ Manuel' };

export default function CongressList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [congresses, setCongresses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const field = searchParams.get('field') || '';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { field: field || undefined, search: search || undefined, upcomingOnly: upcomingOnly || undefined, page, pageSize: 18 };
      const res = await congressService.getAll(params);
      setCongresses(res.items);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [field, search, upcomingOnly, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    favoriteService.getAll()
      .then(favs => setFavoriteIds(new Set(favs.map(f => f.id))))
      .catch(() => {});
  }, []);

  const handleRefresh = async () => {
    setScraping(true);
    setScrapeMsg('');
    try {
      await scraperService.run();
      setScrapeMsg('✅ Kongreler güncelleniyor, birkaç dakika sürebilir...');
      // 10 saniye sonra veriyi yenile
      setTimeout(() => {
        fetchData();
        setScrapeMsg('');
      }, 10000);
    } catch {
      setScrapeMsg('⚠️ Güncelleme başlatılamadı.');
    } finally {
      setScraping(false);
    }
  };

  const toggleFavorite = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    const isFav = favoriteIds.has(id);
    const next = new Set(favoriteIds);
    if (isFav) { next.delete(id); await favoriteService.remove(id); }
    else { next.add(id); await favoriteService.add(id); }
    setFavoriteIds(next);
  };

  const currentField = FIELDS.find(f => f.id === field) || FIELDS[0];
  const totalPages = Math.ceil(total / 18);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 className="page-title">{currentField.icon} {currentField.label || 'Tüm Kongreler'}</h1>
          <p className="page-sub">{total} kongre bulundu</p>
        </div>
        <div style={s.headerActions}>
          <input
            className="input"
            style={{ width: 240 }}
            placeholder="🔍 Kongre, şehir, kuruluş ara..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <label style={s.toggle}>
            <input type="checkbox" checked={upcomingOnly} onChange={e => { setUpcomingOnly(e.target.checked); setPage(1); }} style={{ display: 'none' }} />
            <span style={{ ...s.toggleKnob, background: upcomingOnly ? 'var(--accent)' : 'var(--surface2)' }}>
              {upcomingOnly ? '✓' : ''} Yaklaşanlar
            </span>
          </label>
          <button
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={scraping}
            title="kongreuzmani.com'dan güncel kongreleri çek"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span style={{ display: 'inline-block', animation: scraping ? 'spin 1s linear infinite' : 'none' }}>🔄</span>
            {scraping ? 'Güncelleniyor...' : 'Güncelle'}
          </button>
        </div>
      </div>

      {scrapeMsg && (
        <div style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: 'var(--accent)', marginBottom: 16 }}>
          {scrapeMsg}
        </div>
      )}

      {/* Field tabs */}
      <div style={s.tabs}>
        {FIELDS.map(f => (
          <button
            key={f.id}
            onClick={() => { setSearchParams(f.id ? { field: f.id } : {}); setPage(1); }}
            style={{
              ...s.tab,
              background: field === f.id ? 'rgba(0,212,170,0.15)' : 'var(--surface)',
              color: field === f.id ? 'var(--accent)' : 'var(--muted)',
              border: `1px solid ${field === f.id ? 'rgba(0,212,170,0.3)' : 'var(--border)'}`,
            }}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={s.center}><div className="spinner" /></div>
      ) : congresses.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize: 48 }}>🔍</span>
          <p>Bu alanda kongre bulunamadı.</p>
          <button className="btn btn-secondary" onClick={handleRefresh} disabled={scraping}>
            🔄 Kongreuzmanı'ndan Çek
          </button>
        </div>
      ) : (
        <>
          <div style={s.grid}>
            {congresses.map(c => (
              <Link key={c.id} to={`/congress/${c.id}`} style={s.card}>
                <div style={s.cardTop}>
                  <span style={{ ...s.sourceBadge, background: (SOURCE_COLORS[c.source] || '#888') + '22', color: SOURCE_COLORS[c.source] || '#888' }}>
                    {SOURCE_LABELS[c.source] || c.source}
                  </span>
                  {c.isVerified && <span style={s.verifiedBadge}>✓ Doğrulandı</span>}
                  <button onClick={(e) => toggleFavorite(c.id, e)} style={s.favBtn}>
                    {favoriteIds.has(c.id) ? '⭐' : '☆'}
                  </button>
                </div>

                <h3 style={s.cardTitle}>{c.name}</h3>
                {c.organizer && <p style={s.cardOrg}>🏛 {c.organizer}</p>}

                <div style={s.cardMeta}>
                  {c.city && <span style={s.metaItem}>📍 {c.city}</span>}
                  {c.startDate && <span style={s.metaItem}>🗓 {new Date(c.startDate).toLocaleDateString('tr-TR')}</span>}
                  {c.deadline && <span style={{ ...s.metaItem, color: '#f39c12' }}>⏰ Son: {new Date(c.deadline).toLocaleDateString('tr-TR')}</span>}
                </div>

                {c.description && <p style={s.cardDesc}>{c.description.substring(0, 120)}...</p>}

                {c.url && <div style={s.cardLink}>🔗 Siteye Git →</div>}
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={s.pagination}>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Önceki</button>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>{page} / {totalPages}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Sonraki →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const s = {
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  headerActions: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  toggle: { cursor: 'pointer' },
  toggleKnob: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'white', transition: 'background 0.2s' },
  tabs: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  tab: { padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 8, transition: 'all 0.2s', cursor: 'pointer', textDecoration: 'none', color: 'var(--text)' },
  cardTop: { display: 'flex', alignItems: 'center', gap: 8 },
  sourceBadge: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 },
  verifiedBadge: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(39,174,96,0.15)', color: '#2ecc71' },
  favBtn: { marginLeft: 'auto', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#f39c12' },
  cardTitle: { fontSize: 15, fontWeight: 700, lineHeight: 1.4, color: '#f0f0f0' },
  cardOrg: { fontSize: 12, color: 'var(--muted)' },
  cardMeta: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  metaItem: { fontSize: 12, color: '#aaa' },
  cardDesc: { fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, flex: 1 },
  cardLink: { fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginTop: 4 },
  center: { display: 'flex', justifyContent: 'center', padding: '60px 0' },
  empty: { textAlign: 'center', padding: '60px 0', color: 'var(--muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, fontSize: 15 },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 32 },
};
