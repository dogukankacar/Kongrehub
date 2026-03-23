<div align="center">
  <img src="https://img.shields.io/badge/.NET-5C2D91?style=for-the-badge&logo=.net&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</div>

<h1 align="center">KongreHub — Türkiye Kongre Platformu 🚀</h1>

<p align="center">
  Türkiye'deki akademik ve mesleki kongreleri keşfetmenizi, favorilerinize eklemenizi ve web scraping ile otomatik verileri almanızı sağlayan <b>mikroservis tabanlı</b> projedir.
</p>

---

## 🌟 Özellikler / Features

- **Mikroservis Mimarisi**: Auth, Kongre ve Scraper olarak 3 ayrı backend servisi bulunur.
- **Güvenli Kimlik Doğrulama**: JWT (JSON Web Token) tabanlı yetkilendirme sistemi.
- **Otomatik Veri Çekme (Scraping)**: Arka planda Node.js tabanlı çalışan servis belirli aralıklarla yeni kongre verilerini çeker.
- **Gelişmiş Ön Belleğe Alma (Caching)**: Sık kullanılan sorguları daha hızlı yanıtlamak için **Redis** entegrasyonu.
- **Modern ve Hızlı Frontend**: Vite ve React kullanılarak geliştirilmiş kullanıcı dostu arayüz.
- **Kolay Kurulum**: Tüm proje uçtan uca **Docker Compose** ile tek tıkla kurulabilir durumdadır.

---

## 🏗️ Mimari & Teknolojiler

Proje aşağıdaki bileşenlerden ve servislerden oluşmaktadır:

### 1) Backend (API Servisleri)
- **C# .NET 8 (REST API)** 
  - `auth-service`: Kimlik doğrulama, kullanıcı yönetimi.
  - `congress-service`: Kongrelerin yönetimi, favorileme, cache yönetimi.
- **Node.js (Worker)**
  - `scraper-service`: İnternetten dış veri kaynaklı kongre bilgilerini toplayıp ana API'ye iter.
  
### 2) Frontend 
- **React.js & Vite**: `frontend` klasörü altında tek sayfa (SPA) uygulaması.

### 3) Veritabanı & Cache
- **PostgreSQL**: Sürdürülebilir ilişkisel veritabanı.
- **Redis**: Servisler arası hızlı veri aktarımı ve cache belleği.

---

## 🚀 Hızlı Başlangıç (Kurulum)

Eğer projenizi kendi bilgisayarınızda ayağa kaldırmak istiyorsanız aşağıdaki adımları takip edebilirsiniz:

### Ön Koşullar
- Bilgisayarınızda **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**'ın kurulu ve çalışır durumda olması gerekir.

### 1. Ortam Değişkenlerini Ayarlayın
Proje dizininde yer alan `.env.example` dosyasının adını `.env` olarak değiştirerek bir kopyasını oluşturun:
```bash
cp .env.example .env
```
*(Dilerseniz dosya içerisindeki JWT secret veya veritabanı şifrelerini özelleştirebilirsiniz.)*

### 2. Projeyi Ayağa Kaldırın
Aşağıdaki komutu projenin ana dizininde çalıştırarak tüm (Veritabanı, Redis, API, Frontend) imajların build edilip başlatılmasını sağlayın:
```bash
docker-compose up --build -d
```

### 3. Tarayıcıdan Erişin
Sistem ayağa kalktıktan sonra servislerinize şu linklerden erişebilirsiniz:
* 🌐 **Web Arayüzü (Frontend):** [http://localhost:3000](http://localhost:3000)
* 🔐 **Auth API (Swagger):** [http://localhost:5001/swagger](http://localhost:5001/swagger)
* 🏢 **Congress API (Swagger):** [http://localhost:5002/swagger](http://localhost:5002/swagger)
* 🕷️ **Scraper Health:** [http://localhost:5003/health](http://localhost:5003/health)

> **Varsayılan Admin Bilgileri** 🛡️
> - **E-posta:** `admin@kongrehub.com`
> - **Şifre:** `admin123`
> *(Lütfen ilk hesaba girdikten sonra yönetici şifrenizi değiştirin!)*

---

## 🛠️ Klasör Yapısı (Folder Structure)

```text
kongre-platform/
│
├── frontend/             # React uygulaması
├── services/             # Backend Mikroservisleri
│   ├── auth-service/     # .NET API (Auth)
│   ├── congress-service/ # .NET API (Kongre Yönetimi)
│   └── scraper-service/  # Node.js Kongre Scraper Botu
│
├── init.sql              # Docker açılırken Postgres'in veritabanını hazırlaması için SQL scripti
├── docker-compose.yml    # Tüm projeyi birbirine bağlayan Docker konfigürasyonu
└── .env.example          # Ortam değişkenleri şablonu
```

---

<p align="center">
  Geliştirilmiş ve <a href="https://github.com/dogukankacar">Doğukan</a> tarafından tasarlanmıştır. 
</p>
