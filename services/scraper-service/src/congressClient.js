import axios from 'axios';

const BASE = process.env.CONGRESS_SERVICE_URL || 'http://localhost:5002';

export async function postCongress(congress) {
  const res = await axios.post(`${BASE}/api/congresses/scraper`, congress, {
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
  });
  return res.data;
}

export async function logScrape(log) {
  try {
    await axios.post(`${BASE}/api/congresses/scraper-logs`, log, {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Log kaydedilemedi:', err.message);
  }
}
