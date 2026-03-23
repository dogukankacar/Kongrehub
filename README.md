# KongreHub — Türkiye Kongre Platformu

## Kurulum

### Gereksinim
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Projeyi indir ve klasöre gir
```bash
cd kongre-platform
```

### 2. `.env` dosyası oluştur
```bash
cp .env.example .env
```
İstersen `.env` içindeki şifre ve JWT secret'ı değiştir.

### 3. Çalıştır
```bash
docker-compose up --build
```

### 4. Tarayıcıdan aç
```
http://localhost:3000
```

### Varsayılan Admin
| Alan | Değer |
|------|-------|
| E-posta | admin@kongrehub.com |
| Şifre | admin123 |

> ⚠️ İlk girişten sonra şifreyi değiştir!

---

## Servisler

| Servis | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Auth API (Swagger) | http://localhost:5001/swagger |
| Congress API (Swagger) | http://localhost:5002/swagger |
| Scraper | http://localhost:5003/health |

---

## GitHub'a Atma

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/kullanici/kongre-platform.git
git push -u origin main
```

> `.env` dosyası `.gitignore`'a eklenmiştir, GitHub'a gitmez.
> Yalnızca `.env.example` commit edilir.
