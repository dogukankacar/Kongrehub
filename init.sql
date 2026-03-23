-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(500) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    university VARCHAR(255),
    department VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'Hoca', -- Admin | Hoca
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Congresses
CREATE TABLE IF NOT EXISTS congresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(500) NOT NULL,
    organizer VARCHAR(255),
    field VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Türkiye',
    start_date DATE,
    end_date DATE,
    deadline DATE,
    description TEXT,
    url VARCHAR(1000),
    source VARCHAR(100), -- ai | scraper | manual
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    congress_id UUID REFERENCES congresses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, congress_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraper Logs
CREATE TABLE IF NOT EXISTS scraper_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(100),
    status VARCHAR(50),
    congresses_found INT DEFAULT 0,
    congresses_added INT DEFAULT 0,
    error_message TEXT,
    ran_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_congresses_field ON congresses(field);
CREATE INDEX idx_congresses_city ON congresses(city);
CREATE INDEX idx_congresses_start_date ON congresses(start_date);
CREATE INDEX idx_favorites_user ON favorites(user_id);

-- Admin kullanici uygulama baslarken otomatik olusturulur.

-- ── GERÇEK KONGRE VERİLERİ 2025 ──────────────────────────────────

INSERT INTO congresses (name, organizer, field, city, country, start_date, end_date, deadline, description, url, source, is_verified) VALUES

-- TIP
('41. Ulusal Kardiyoloji Kongresi', 'Türk Kardiyoloji Derneği', 'tip', 'İstanbul', 'Türkiye', '2025-11-13', '2025-11-16', '2025-08-01', 'Kardiyolojinin güncel konularında genel oturumlar, konferanslar ve tartışmalı konularda karşıt görüş oturumları.', 'https://tkd.org.tr/2025kongre/', 'manual', true),
('61. Ulusal Nöroloji Kongresi', 'Türk Nöroloji Derneği', 'tip', 'Antalya', 'Türkiye', '2025-12-13', '2025-12-17', '2025-09-01', 'Royal Seginus Otel Lara Antalya''da düzenlenecek ulusal nöroloji kongresi. Nörodejeneratif hastalıklar ve inme yönetimi.', 'https://noroloji.org.tr', 'manual', true),
('Koruyucu Kardiyoloji ve Hipertansiyon Toplantısı 2025', 'Türk Kardiyoloji Derneği', 'tip', 'Fethiye', 'Türkiye', '2025-10-02', '2025-10-05', '2025-06-03', 'Koruyucu kardiyoloji, ateroskleroz ve hipertansiyon konularını ele alan TKD toplantısı. Liberty Hotel Lykia''da düzenlenecek.', 'https://koruyucukardiyolojivehipertansiyon2025.tkd.org.tr/', 'manual', true),
('Kardiyoloji Bahar Güncelleme Toplantısı 2025', 'Türk Kardiyoloji Derneği', 'tip', 'Antalya', 'Türkiye', '2025-04-10', '2025-04-13', '2025-02-03', 'Kardiyolojideki güncel gelişmelerin paylaşıldığı bahar toplantısı. Tüm oturumlar TTB STE Kredilendirme Kurulu tarafından kredilendirilmektedir.', 'https://kardiyobahar2025.tkd.org.tr/', 'manual', true),
('2025 Aritmi Ulusal Kongresi', 'Türk Kardiyoloji Derneği Aritmi Çalışma Grubu', 'tip', 'İstanbul', 'Türkiye', '2025-09-01', '2025-09-03', '2025-06-01', 'Aritmi alanındaki yenilikçi çözümlerin ve güncel konuların tartışıldığı ulusal kongre.', 'https://aritmi2025.tkd.org.tr/', 'manual', true),
('26. Ulusal Biyoloji Kongresi', 'Türk Biyoloji Derneği', 'fen', 'İstanbul', 'Türkiye', '2025-09-03', '2025-09-06', '2025-06-01', 'Biyolojinin tüm alt dallarını kapsayan ulusal kongre. Moleküler biyoloji, ekoloji ve biyoteknoloji alanlarında sunumlar.', 'https://kongresistemi.com', 'manual', true),

-- MÜHENDİSLİK
('7. Uluslararası Mühendislik ve Fen Bilimleri Kongresi (MFBK''25)', 'Marmara Üniversitesi', 'muhendislik', 'İstanbul', 'Türkiye', '2025-03-08', '2025-03-09', '2025-03-02', 'Makine, Mekatronik, Bilgisayar, Endüstri, Elektrik, İnşaat Mühendisliği alanlarında uluslararası kongre. Akademik teşvik ve doçentlik kriterlerini karşılamaktadır.', 'https://www.engineeringandsciencescongress.org/', 'manual', true),
('20. Türkiye Harita Bilimsel ve Teknik Kurultayı', 'TMMOB Harita ve Kadastro Mühendisleri Odası', 'muhendislik', 'Ankara', 'Türkiye', '2025-10-01', '2025-10-03', '2025-07-01', 'Harita, coğrafi bilgi sistemleri, uzaktan algılama ve kadastro alanlarında ulusal kurultay.', 'https://kongresistemi.com', 'manual', true),
('8th International Conference on Earthquake Engineering and Seismology (8ICEES)', 'AFAD ve ODTÜ', 'muhendislik', 'Ankara', 'Türkiye', '2026-05-17', '2026-05-19', '2025-12-01', 'Deprem mühendisliği ve sismoloji alanında uluslararası konferans. Deprem riski azaltma ve yapısal güvenlik konuları ele alınacak.', 'https://kongresistemi.com', 'manual', true),
('XXIV. Türkiye Ulusal Jeodezi Komisyonu Sempozyumu', 'Türkiye Ulusal Jeodezi Komisyonu', 'muhendislik', 'Ankara', 'Türkiye', '2025-11-05', '2025-11-07', '2025-08-01', 'Jeodezi, GPS/GNSS uygulamaları ve yer bilimlerinde ulusal sempozyum.', 'https://kongresistemi.com', 'manual', true),
('7. Dirençlilik Kongresi (IDRC 2025)', 'İstanbul Teknik Üniversitesi', 'muhendislik', 'İstanbul', 'Türkiye', '2025-10-13', '2025-10-15', '2025-07-01', 'Afet risk azaltma, kentsel dirençlilik ve sürdürülebilir altyapı konularında uluslararası kongre.', 'https://kongresistemi.com', 'manual', true),

-- BİLGİSAYAR / BİLİŞİM
('IEEE Sinyal İşleme ve İletişim Uygulamaları Konferansı (SIU 2025)', 'IEEE Türkiye', 'bilgisayar', 'Ankara', 'Türkiye', '2025-05-15', '2025-05-18', '2025-02-28', 'Yapay zeka, derin öğrenme, görüntü işleme ve iletişim sistemleri alanlarında IEEE konferansı.', 'https://www.ieee.org.tr', 'manual', true),
('Akademik Bilişim Konferansı 2025 (AB''25)', 'Üniversitelerarası Kurul', 'bilgisayar', 'Afyonkarahisar', 'Türkiye', '2025-02-19', '2025-02-21', '2024-12-15', 'Eğitimde bilişim teknolojileri, yazılım mühendisliği ve bilgisayar bilimleri alanlarında ulusal konferans.', 'https://www.ab.org.tr', 'manual', true),

-- EĞİTİM
('International Conference on Academic Studies in Technology and Education (ICASTE 2025)', 'ICASTE Organizing Committee', 'egitim', 'Antalya', 'Türkiye', '2025-11-12', '2025-11-15', '2025-08-01', 'Eğitim teknolojileri, öğretim yöntemleri ve eğitim politikaları alanlarında uluslararası konferans.', 'https://www.kongreuzmani.com', 'manual', true),
('8. Uluslararası Antalya Bilimsel Araştırmalar ve Yenilikçi Çalışmalar Kongresi', 'İKSAD', 'egitim', 'Antalya', 'Türkiye', '2025-01-25', '2025-01-27', '2025-01-10', 'Eğitim, sosyal bilimler ve fen bilimleri alanlarında multidisipliner uluslararası kongre.', 'https://www.iksadkongre.org', 'manual', true),
('12. Uluslararası Ankara Bilimsel Araştırmalar Kongresi', 'İKSAD', 'egitim', 'Ankara', 'Türkiye', '2025-09-03', '2025-09-05', '2025-07-01', 'Eğitim bilimleri, psikoloji ve sosyal bilimler alanlarında multidisipliner uluslararası kongre.', 'https://www.iksadkongre.org', 'manual', true),

-- EKONOMİ / İŞLETME
('11. Global İşletme Araştırmaları Kongresi (GİAK 2025)', 'İstanbul Teknik Üniversitesi ve Işık Üniversitesi', 'ekonomi', 'İstanbul', 'Türkiye', '2025-07-03', '2025-07-03', '2025-05-01', 'İşletme, yönetim, muhasebe, finans, ekonomi ve girişimcilik konularında online uluslararası kongre. UAK uluslararası kongre kriterlerini karşılamaktadır.', 'https://kongresempozyum.org/Home/CongressDetail/1d9e372b-4625-422e-a45b-42944cf768f5', 'manual', true),
('8. Uluslararası İstanbul Modern Bilimsel Araştırmalar Kongresi', 'İKSAD', 'ekonomi', 'İstanbul', 'Türkiye', '2025-10-10', '2025-10-12', '2025-08-01', 'İktisat, işletme, pazarlama ve uluslararası ticaret alanlarında uluslararası kongre.', 'https://www.iksadkongre.org', 'manual', true),
('13. Uluslararası Avrupa Temel Bilimlerde İleri Araştırmalar Kongresi', 'İKSAD', 'ekonomi', 'İstanbul', 'Türkiye', '2025-12-23', '2025-12-25', '2025-10-01', 'Ekonomi, sosyal bilimler ve fen bilimlerinde multidisipliner uluslararası kongre.', 'https://www.iksadkongre.org', 'manual', true),

-- SOSYAL BİLİMLER
('1. Uluslararası Katılımlı Göç Sempozyumu', 'Avrasya Üniversitesi', 'sosyal', 'Trabzon', 'Türkiye', '2025-07-24', '2025-07-25', '2025-05-01', 'Göç: Çok Boyutlu Dinamikler ve Etkiler konulu sempozyum. Sosyal entegrasyon, insan hakları ve sınır politikaları ele alınacak.', 'https://www.kongreuzmani.com/1-uluslararasi-katilimli-goc-sempozyumu.html', 'manual', true),

-- JEOLOJİ / FEN
('78. Türkiye Jeoloji Kurultayı', 'Türkiye Jeoloji Derneği', 'fen', 'Ankara', 'Türkiye', '2026-04-13', '2026-04-17', '2025-12-01', 'Türkiye''nin jeolojik yapısı, doğal kaynaklar ve çevre jeolojisi konularında uluslararası katılımlı kurultay.', 'https://kongresistemi.com', 'manual', true);

