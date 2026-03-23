import express from 'express';
import { CronJob } from 'cron';
import { runAllScrapers } from './scrapers.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '0 2 * * *'; // 02:00 every night

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ── Manual trigger (Admin can call this) ──────────────────────────
app.post('/run', async (req, res) => {
  res.json({ message: 'Scraper başlatıldı, arka planda çalışıyor.' });
  runAll().catch(console.error);
});

// ── Combined run ──────────────────────────────────────────────────
async function runAll() {
  console.log(`[${new Date().toISOString()}] Scraper çalışıyor...`);
  try {
    await runAllScrapers();
    console.log(`[${new Date().toISOString()}] Scraper tamamlandı.`);
  } catch (err) {
    console.error('Scraper hatası:', err);
  }
}

// ── Cron job ──────────────────────────────────────────────────────
const job = new CronJob(CRON_SCHEDULE, runAll, null, true, 'Europe/Istanbul');
console.log(`Cron job ayarlandı: ${CRON_SCHEDULE}`);

app.listen(PORT, () => {
  console.log(`Scraper service port ${PORT} üzerinde çalışıyor.`);
});
