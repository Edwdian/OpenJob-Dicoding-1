# OpenJob RESTful API V1

Aplikasi RESTful API untuk rekrutmen karyawan internal perusahaan.

## Prasyarat

- Node.js >= 18
- PostgreSQL >= 13
- npm

## Setup & Instalasi

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Konfigurasi Environment

Salin `.env.example` ke `.env` dan sesuaikan nilai:

```bash
cp .env.example .env
```

Isi variabel berikut di `.env`:

```env
HOST=localhost
PORT=3000

PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=openjob
PGHOST=localhost
PGPORT=5432

ACCESS_TOKEN_KEY=your_access_token_secret_min_32_chars
REFRESH_TOKEN_KEY=your_refresh_token_secret_min_32_chars
```

### 3. Buat Database PostgreSQL

```sql
CREATE DATABASE openjob;
```

### 4. Jalankan Migrasi Database

```bash
npm run migrate
```

### 5. Jalankan Server

```bash
# Development (dengan auto-reload)
npm run start:dev

# Production
npm start
```

Server berjalan di `http://localhost:3000`

---

## Struktur Proyek

```
openjob/
├── migrations/                  # File migrasi database (node-pg-migrate)
│   ├── 1780126508379_create-table-users.js
│   ├── 1780126508380_create-table-companies.js
│   ├── 1780126508381_create-table-categories.js
│   ├── 1780126508382_create-table-jobs.js
│   ├── 1780126508383_create-table-applications.js
│   ├── 1780126508384_create-table-bookmarks.js
│   ├── 1780126508385_create-table-documents.js
│   └── 1780126508386_create-table-authentications.js
├── src/
│   ├── app.js                   # Entry point Express
│   ├── handlers/                # Route handlers
│   │   ├── usersHandler.js
│   │   ├── authenticationsHandler.js
│   │   ├── companiesHandler.js
│   │   ├── categoriesHandler.js
│   │   ├── jobsHandler.js
│   │   ├── applicationsHandler.js
│   │   ├── bookmarksHandler.js
│   │   ├── documentsHandler.js
│   │   └── profileHandler.js
│   ├── services/                # Business logic & DB queries
│   │   ├── usersService.js
│   │   ├── authService.js
│   │   ├── companiesService.js
│   │   ├── categoriesService.js
│   │   ├── jobsService.js
│   │   ├── applicationsService.js
│   │   ├── bookmarksService.js
│   │   └── documentsService.js
│   ├── middleware/
│   │   ├── auth.js              # JWT auth middleware
│   │   ├── validate.js          # Joi validation middleware
│   │   └── errorHandler.js      # Error handling middleware
│   ├── validators/
│   │   └── schemas.js           # Joi schemas
│   └── utils/
│       ├── db.js                # PostgreSQL pool
│       └── errors.js            # Custom error classes
├── ERD-OpenJob-versi-1.png      # Entity Relationship Diagram
├── .env.example
├── .gitignore
└── package.json
```

---

## Endpoints

### Public Endpoints (No Auth Required)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/users` | Register user baru |
| GET | `/users/:id` | Get profil user |
| GET | `/companies` | List semua perusahaan |
| GET | `/companies/:id` | Detail perusahaan |
| GET | `/categories` | List semua kategori |
| GET | `/categories/:id` | Detail kategori |
| GET | `/jobs` | List semua lowongan (support `?title=`, `?company-name=`) |
| GET | `/jobs/:id` | Detail lowongan |
| GET | `/jobs/company/:companyId` | Lowongan berdasarkan perusahaan |
| GET | `/jobs/category/:categoryId` | Lowongan berdasarkan kategori |
| POST | `/authentications` | Login |
| PUT | `/authentications` | Refresh access token |
| GET | `/documents` | List semua dokumen |
| GET | `/documents/:id` | Detail dokumen |

### Protected Endpoints (Bearer Token Required)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/profile` | Profil user yang login |
| GET | `/profile/applications` | Daftar lamaran user yang login |
| GET | `/profile/bookmarks` | Daftar bookmark user yang login |
| POST | `/companies` | Buat perusahaan baru |
| PUT | `/companies/:id` | Update perusahaan |
| DELETE | `/companies/:id` | Hapus perusahaan |
| POST | `/categories` | Buat kategori baru |
| PUT | `/categories/:id` | Update kategori |
| DELETE | `/categories/:id` | Hapus kategori |
| POST | `/jobs` | Buat lowongan baru |
| PUT | `/jobs/:id` | Update lowongan |
| DELETE | `/jobs/:id` | Hapus lowongan |
| POST | `/jobs/:jobId/bookmark` | Bookmark lowongan |
| GET | `/jobs/:jobId/bookmark/:id` | Detail bookmark |
| DELETE | `/jobs/:jobId/bookmark` | Hapus bookmark |
| GET | `/bookmarks` | Semua bookmark user yang login |
| POST | `/applications` | Lamar pekerjaan |
| GET | `/applications` | List semua lamaran |
| GET | `/applications/:id` | Detail lamaran |
| GET | `/applications/user/:userId` | Lamaran berdasarkan user |
| GET | `/applications/job/:jobId` | Lamaran berdasarkan lowongan |
| PUT | `/applications/:id` | Update status lamaran |
| DELETE | `/applications/:id` | Hapus lamaran |
| POST | `/documents` | Upload dokumen (multipart/form-data, field: `document`) |
| DELETE | `/documents/:id` | Hapus dokumen |
| DELETE | `/authentications` | Logout |

---

## Autentikasi

API menggunakan JWT Bearer Token:
- **Access Token**: berlaku 3 jam
- **Refresh Token**: berlaku permanen (disimpan di database)

Header yang dibutuhkan untuk protected endpoints:
```
Authorization: Bearer <access_token>
```

## Query Parameter untuk Pencarian Lowongan

```
GET /jobs?title=developer
GET /jobs?company-name=acme
GET /jobs?title=backend&company-name=tech
```
