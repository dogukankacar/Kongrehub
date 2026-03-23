import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { congressService, scraperService } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [scraping, setScraping] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState('');

  useEffect(() => {
    congressService.getStats().then(setStats).catch(() => {});
    congressService.getScraperLogs().then(setLogs).catch(() => {});
  }, []);

  const triggerScraper = async (type) => {
    setScraping(true);
    setScrapeMsg('');
    try {
      const res = type === 'full' ? await scraperService.run() : await scraperService.runAI('bilgisayar');
      setScrapeMsg(res.message);
    } catch {
      setScrapeMsg('Scraper başlatılamadı. Servis çalışıyor mu?');
    } finally {
      setScraping(false);
    }
  };

  const statCards = [
    { label: 'Toplam Kongre', value: stats?.total ?? '—', icon: '📋', color: '#0095ff' },
    { label: 'Yaklaşan', value: stats?.upcoming ?? '—', icon: '🗓', color: '#00d4aa' },
    { label: 'Bu Ay', value: stats?.thisMonth ?? '—', icon: '📅', color: '#f39c12' },
    { label: 'Log Sayısı', value: logs.length, icon: '📊', color: '#9b59b6' },
  ];

  return (
    <div className="fade-in">
      <h1 className="page-title">📊 Admin Dashboard</h1>
      <p className="page-sub">Platform yönetimi ve istatistikler</p>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {statCards.map(card => (
          <div key={card.label} className="card" style={{ borderTop: `3px solid ${card.color}` }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Quick actions */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>⚡ Hızlı İşlemler</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/admin/congresses" className="btn btn-secondary">📋 Kongre Yönetimi</Link>
            <Link to="/admin/users" className="btn btn-secondary">👥 Kullanıcı Yönetimi</Link>
            <button className="btn btn-secondary" onClick={() => triggerScraper('full')} disabled={scraping}>
              {scraping ? '⏳ Çalışıyor...' : '🕷️ Scraper\'ları Çalıştır'}
            </button>
          </div>
          {scrapeMsg && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--accent)' }}>
              {scrapeMsg}
            </div>
          )}
        </div>

        {/* Recent logs */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📜 Son Scraper Logları</h3>
          {logs.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Henüz log yok.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
              {logs.slice(0, 10).map(log => (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--surface)', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{log.source}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {log.congressesAdded}/{log.congressesFound} eklendi
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: log.status === 'success' ? 'rgba(39,174,96,0.15)' : 'rgba(231,76,60,0.15)', color: log.status === 'success' ? '#2ecc71' : 'var(--danger)' }}>
                      {log.status}
                    </span>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                      {new Date(log.ranAt).toLocaleString('tr-TR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
