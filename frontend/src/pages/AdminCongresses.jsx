import { useState, useEffect } from 'react';
import { congressService } from '../services/api';

const FIELDS = ['tip','muhendislik','bilgisayar','egitim','ekonomi','hukuk','sosyal','fen','mimari','saglik','tarim','psikoloji'];
const EMPTY = { name:'', organizer:'', field:'bilgisayar', city:'', country:'Türkiye', startDate:'', endDate:'', deadline:'', description:'', url:'', source:'manual' };

export default function AdminCongresses() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | {id, ...}
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await congressService.getAll({ search: search || undefined, page, pageSize: 15 });
      setItems(res.items);
      setTotal(res.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, search]);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (c) => {
    setForm({ name: c.name, organizer: c.organizer||'', field: c.field, city: c.city||'', country: c.country, startDate: c.startDate||'', endDate: c.endDate||'', deadline: c.deadline||'', description: c.description||'', url: c.url||'', source: c.source, isVerified: c.isVerified });
    setModal(c);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') await congressService.create(form);
      else await congressService.update(modal.id, form);
      setModal(null);
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu kongreyi silmek istediğinize emin misiniz?')) return;
    await congressService.delete(id);
    load();
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 className="page-title">📋 Kongre Yönetimi</h1>
          <p className="page-sub">{total} kongre kayıtlı</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Yeni Kongre</button>
      </div>

      <input className="input" style={{ marginBottom: 16, maxWidth: 360 }} placeholder="🔍 Kongre ara..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.th}>Kongre Adı</th>
                <th style={s.th}>Alan</th>
                <th style={s.th}>Şehir</th>
                <th style={s.th}>Tarih</th>
                <th style={s.th}>Kaynak</th>
                <th style={s.th}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c, i) => (
                <tr key={c.id} style={{ ...s.tr, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={s.td}>
                    <div style={{ fontSize: 13, fontWeight: 600, maxWidth: 300 }}>{c.name}</div>
                    {c.organizer && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.organizer}</div>}
                  </td>
                  <td style={s.td}><span style={s.fieldChip}>{c.field}</span></td>
                  <td style={s.td}><span style={{ fontSize: 13 }}>{c.city || '—'}</span></td>
                  <td style={s.td}><span style={{ fontSize: 12, color: 'var(--muted)' }}>{c.startDate ? new Date(c.startDate).toLocaleDateString('tr-TR') : '—'}</span></td>
                  <td style={s.td}><span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(0,149,255,0.15)', color: '#0095ff' }}>{c.source}</span></td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 15 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 20 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>← Önceki</button>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{page} / {Math.ceil(total/15)}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p+1)} disabled={page >= Math.ceil(total/15)}>Sonraki →</button>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={s.overlay} onClick={() => setModal(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{modal === 'create' ? '+ Yeni Kongre' : 'Kongreyi Düzenle'}</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '70vh', overflowY: 'auto', paddingRight: 4 }}>
              <Field label="Kongre Adı *"><input className="input" value={form.name} onChange={e => set('name', e.target.value)} required /></Field>
              <div className="grid-2">
                <Field label="Düzenleyen"><input className="input" value={form.organizer} onChange={e => set('organizer', e.target.value)} /></Field>
                <Field label="Alan *">
                  <select className="input" value={form.field} onChange={e => set('field', e.target.value)}>
                    {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid-2">
                <Field label="Şehir"><input className="input" value={form.city} onChange={e => set('city', e.target.value)} /></Field>
                <Field label="Ülke"><input className="input" value={form.country} onChange={e => set('country', e.target.value)} /></Field>
              </div>
              <div className="grid-2">
                <Field label="Başlangıç"><input className="input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></Field>
                <Field label="Bitiş"><input className="input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></Field>
              </div>
              <Field label="Bildiri Son Tarihi"><input className="input" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} /></Field>
              <Field label="Web Sitesi"><input className="input" type="url" value={form.url} placeholder="https://..." onChange={e => set('url', e.target.value)} /></Field>
              <Field label="Açıklama"><textarea className="input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} /></Field>
              {modal !== 'create' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isVerified || false} onChange={e => set('isVerified', e.target.checked)} />
                  Doğrulanmış kongre olarak işaretle
                </label>
              )}
              <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>İptal</button>
                <button className="btn btn-primary" disabled={saving}>{saving ? 'Kaydediliyor...' : '💾 Kaydet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#bbb' }}>{label}</label>
      {children}
    </div>
  );
}

const s = {
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid var(--border)', transition: 'background 0.15s' },
  td: { padding: '12px 16px', verticalAlign: 'middle' },
  fieldChip: { fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(0,212,170,0.1)', color: 'var(--accent)' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' },
  modal: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 560 },
};
