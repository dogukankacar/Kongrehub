import axios from 'axios';
import * as cheerio from 'cheerio';
import { postCongress, logScrape } from './congressClient.js';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'tr-TR,tr;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

// kongreuzmani.com kategori URL'leri → field eşlemesi
const CATEGORIES = [
  { url: 'https://www.kongreuzmani.com/kategoriler/2025-tip-kongreleri.php',           field: 'tip' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2025-muhendislik-kongreleri.php',   field: 'muhendislik' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2025-bilisim-teknoloji-kongreleri.php', field: 'bilgisayar' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2025-egitim-kongreleri.php',        field: 'egitim' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2025-iktisad-ekonomi-isletme-kongreleri.php', field: 'ekonomi' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2025-hukuk-kongreleri.php',         field: 'hukuk' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2025-sosyal-bilimler-kongreleri.php', field: 'sosyal' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2025-fen-bilimleri-kongreleri.php', field: 'fen' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2025-mimarlik-kongreleri.php',      field: 'mimari' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2025-hemsirelik-ebelik-kongreleri.php', field: 'saglik' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2025-tarim-ziraat-kongreleri.php',  field: 'tarim' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2025-psikoloji-psikiyatri-kongreleri.php', field: 'psikoloji' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2025-dis-hekimligi-kongreleri.php', field: 'tip' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2025-eczacilik-ilac-kongreleri.php', field: 'saglik' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2025-turizm-kongreleri.php',        field: 'sosyal' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2025-gida-beslenme-kongreleri.php', field: 'tarim' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2025-spor-kongreleri.php',          field: 'sosyal' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2025-cevre-sehir-insaat-kongreleri.php', field: 'muhendislik' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2025-enerji-kongreleri.php',        field: 'muhendislik' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2026-tip-kongreleri.php',           field: 'tip' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2026-muhendislik-kongreleri.php',   field: 'muhendislik' },
  { url: 'https://www.kongreuzmani.com/kategoriler/2026-bilisim-teknoloji-kongreleri.php', field: 'bilgisayar' },
];

// Kongre detay sayfasını çek
async function fetchCongressDetail(url, field) {
  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 10000 });
    const $ = cheerio.load(data);

    // kongreuzmani.com detay sayfası yapısı
    const name = $('h1').first().text().trim()
      || $('title').text().replace('− Kongre Uzmanı', '').trim();

    const metaText = $('body').text();

    // Tarih çek (format: "15 Mayıs - 18 Mayıs 2025")
    const dateMatch = metaText.match(/(\d{1,2})\s+(Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)\s*[-–]\s*(\d{1,2})\s+(Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)\s+(\d{4})/);

    const MONTHS = { 'Ocak':1,'Şubat':2,'Mart':3,'Nisan':4,'Mayıs':5,'Haziran':6,'Temmuz':7,'Ağustos':8,'Eylül':9,'Ekim':10,'Kasım':11,'Aralık':12 };

    let startDate = null, endDate = null;
    if (dateMatch) {
      const year = dateMatch[5];
      const startMonth = String(MONTHS[dateMatch[2]]).padStart(2,'0');
      const endMonth   = String(MONTHS[dateMatch[4]]).padStart(2,'0');
      const startDay   = String(dateMatch[1]).padStart(2,'0');
      const endDay     = String(dateMatch[3]).padStart(2,'0');
      startDate = `${year}-${startMonth}-${startDay}`;
      endDate   = `${year}-${endMonth}-${endDay}`;
    }

    // Şehir çek
    const cityMatch = metaText.match(/,\s*(İstanbul|Ankara|İzmir|Antalya|Bursa|Trabzon|Konya|Eskişehir|Kayseri|Diyarbakır|Erzurum|Gaziantep|Muğla|Bodrum|Fethiye|Mersin|Adana|Samsun|Elazığ|Malatya|Afyonkarahisar)/);
    const city = cityMatch ? cityMatch[1] : null;

    // Organizatör
    const organizerEl = $('td:contains("Organizatör"), td:contains("Düzenleyen")').next().text().trim()
      || $('strong:contains("Organizatör")').parent().text().replace('Organizatör', '').trim();

    // Açıklama
    const description = $('meta[name="description"]').attr('content')
      || $('p').first().text().trim().substring(0, 300);

    if (!name || name.length < 10) return null;

    return { name, field, city, startDate, endDate, description: description || null, url, organizer: organizerEl || null, source: 'scraper', country: 'Türkiye' };
  } catch {
    return null;
  }
}

// Kategori sayfasından kongre linklerini çek
async function scrapeCategory(categoryUrl, field) {
  const results = [];
  try {
    const { data } = await axios.get(categoryUrl, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(data);

    const links = new Set();

    // kongreuzmani.com'daki kongre listesi linkleri
    $('a[href*="kongreuzmani.com"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('.html') && !href.includes('kategoriler') && !href.includes('kongre-firmalar')) {
        links.add(href.startsWith('http') ? href : `https://www.kongreuzmani.com/${href}`);
      }
    });

    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.endsWith('.html') && !href.includes('kategoriler')) {
        const full = href.startsWith('http') ? href : `https://www.kongreuzmani.com/${href}`;
        links.add(full);
      }
    });

    console.log(`[${field}] ${links.size} link bulundu: ${categoryUrl}`);

    // Her linki detay sayfasından çek (max 30 tane, rate limit için bekle)
    let count = 0;
    for (const link of links) {
      if (count >= 30) break;
      const congress = await fetchCongressDetail(link, field);
      if (congress) results.push(congress);
      count++;
      await new Promise(r => setTimeout(r, 300)); // 300ms bekle
    }
  } catch (err) {
    console.error(`Kategori scrape hatası [${categoryUrl}]:`, err.message);
  }
  return results;
}

// Tüm kategorileri tara
export async function runAllScrapers() {
  let totalFound = 0, totalAdded = 0;

  for (const cat of CATEGORIES) {
    const results = await scrapeCategory(cat.url, cat.field);
    totalFound += results.length;

    for (const congress of results) {
      try {
        await postCongress(congress);
        totalAdded++;
      } catch {
        // upsert ise zaten var, geç
      }
    }

    await logScrape({
      source: `kongreuzmani:${cat.field}`,
      status: 'success',
      congressesFound: results.length,
      congressesAdded: results.length,
      errorMessage: null,
      ranAt: new Date().toISOString(),
    });

    console.log(`[${cat.field}] ${results.length} kongre işlendi.`);
    await new Promise(r => setTimeout(r, 1000)); // kategoriler arası 1sn bekle
  }

  console.log(`\nToplam: ${totalFound} bulundu, ${totalAdded} eklendi/güncellendi.`);
}
