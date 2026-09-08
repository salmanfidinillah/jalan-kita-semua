# JALANIN — Feature Specification

> **JALANIN — Jalan Aman, Kota Nyaman.**

Dokumen ini mendefinisikan fitur JALANIN secara fungsional untuk menjadi acuan sebelum implementasi.

**Version:** MVP V1  
**Status:** Product Definition  
**Scope:** Web Application

---

# 1. Feature Philosophy

JALANIN dibangun berdasarkan prinsip:

- **Real Product First** — fitur harus benar-benar dapat digunakan.
- **MVP First** — hanya fitur yang mendukung core value yang masuk V1.
- **AI Must Be Functional** — AI harus menghasilkan output yang digunakan sistem.
- **Human in the Loop** — hasil AI dapat diperiksa dan dikoreksi manusia.
- **Community as Signal** — verifikasi komunitas menjadi sinyal tambahan.
- **Transparent Status** — user dapat mengetahui perkembangan laporan.

---

# 2. Feature Priority

Setiap fitur memiliki prioritas:

| Priority | Meaning |
|---|---|
| P0 | Wajib untuk MVP / core workflow |
| P1 | Penting, tetapi dapat menyusul setelah core stabil |
| P2 | Nice-to-have / future improvement |

MVP V1 berfokus pada fitur **P0**.

---

# 3. Feature Map

```text
JALANIN
│
├── PUBLIC
│   ├── Landing Page
│   ├── Public Map
│   ├── Search
│   ├── Latest Reports
│   ├── Statistics
│   └── Report Detail
│
├── AUTHENTICATION
│   ├── Register
│   ├── Login
│   └── Logout
│
├── USER
│   ├── Dashboard
│   ├── Create Report
│   ├── AI Analysis
│   ├── My Reports
│   ├── Report Detail
│   ├── Community Verification
│   └── Profile
│
└── ADMIN
    ├── Dashboard
    ├── Report Management
    ├── Report Review
    ├── Priority Monitoring
    └── Status Management
```

---

# 4. Public Features

## F01 — Landing Page

**Priority:** P0

### Purpose

Menjelaskan JALANIN dan memberikan value kepada pengunjung tanpa login.

### Components

- Hero section
- Problem
- Solution
- How it works
- Public map preview
- Latest reports
- Statistics
- CTA
- Footer

### Acceptance Criteria

- Landing page dapat diakses tanpa login.
- Responsive pada desktop dan mobile.
- CTA login/register tersedia.
- Public map dapat diakses.
- Tidak ada fitur private yang dapat diakses guest.

---

# 5. F02 — Public Map

**Priority:** P0

### Purpose

Menampilkan kondisi jalan berdasarkan lokasi laporan.

### Features

- Interactive map
- Report markers
- Marker berdasarkan severity/status
- Click marker
- Report preview
- Open report detail
- Location search

### Marker Concept

```text
🔴 HIGH / CRITICAL DAMAGE
🟠 MEDIUM DAMAGE
🟡 LOW DAMAGE
🟢 RESOLVED
```

### Acceptance Criteria

- Guest dapat melihat map.
- Report valid dapat muncul sebagai marker.
- Marker menunjukkan informasi dasar.
- Marker dapat dibuka.
- User dapat menuju detail laporan.

---

# 6. F03 — Location Search

**Priority:** P1

### Purpose

Membantu user menemukan kondisi jalan di area tertentu.

### Features

- Search address/place
- Map recenter
- Display nearby reports

### Acceptance Criteria

- User dapat memasukkan lokasi.
- Map berpindah ke lokasi yang dicari.
- Laporan di sekitar lokasi dapat ditemukan.

---

# 7. F04 — Latest Reports

**Priority:** P1

### Purpose

Menampilkan laporan terbaru kepada publik.

### Information

- Photo thumbnail
- Damage type
- Severity
- Location
- Status
- Timestamp

### Acceptance Criteria

- Data berasal dari database.
- Tidak menggunakan hardcoded reports pada production MVP.
- Report dapat dibuka ke detail.

---

# 8. F05 — Public Statistics

**Priority:** P1

### Purpose

Memberikan gambaran kondisi jalan berdasarkan data JALANIN.

### Example

```text
Total Reports
Verified
In Progress
Resolved
High Priority
```

### Acceptance Criteria

- Statistik berasal dari data nyata.
- Statistik dapat berubah ketika data berubah.
- Data tidak menampilkan informasi pribadi.

---

# 9. F06 — Report Detail

**Priority:** P0

### Purpose

Menampilkan informasi lengkap sebuah laporan.

### Information

```text
Photo
Damage Type
Severity
AI Confidence
Description
Location
Map
Created At
Status
Priority Score
Community Verification
Status Timeline
```

### Acceptance Criteria

- Report dapat dibuka dari map.
- Informasi berasal dari database.
- Status terlihat jelas.
- Community verification tersedia jika user memenuhi syarat.
- Data reporter yang sensitif tidak ditampilkan secara publik.

---

# 10. Authentication Features

## F07 — Register

**Priority:** P0

### Purpose

Membuat akun JALANIN.

### Fields

```text
Name
Email
Password
```

### Acceptance Criteria

- User dapat membuat akun.
- Email divalidasi.
- Password memenuhi aturan keamanan.
- User tersimpan di sistem authentication.
- Profile dasar tersimpan di database.

---

# 11. F08 — Login

**Priority:** P0

### Purpose

Mengakses fitur user.

### Acceptance Criteria

- User dapat login.
- Credential divalidasi oleh Firebase Authentication.
- Session dipertahankan sesuai konfigurasi.
- User diarahkan ke dashboard setelah login.

---

# 12. F09 — Logout

**Priority:** P0

### Acceptance Criteria

- User dapat logout.
- Session authentication dihentikan.
- Protected pages tidak dapat diakses setelah logout.

---

# 13. User Features

## F10 — User Dashboard

**Priority:** P1

### Purpose

Memberikan ringkasan kontribusi user.

### Information

```text
Total Reports
Verified Reports
Resolved Reports
My Contributions
```

### Sections

```text
Overview
My Reports
Verification History
Profile
```

---

# 14. F11 — Create Report

**Priority:** P0

### Purpose

Membuat laporan kerusakan jalan.

### Main Flow

```text
Create Report
     ↓
Upload Photo
     ↓
Get GPS
     ↓
AI Analysis
     ↓
Review
     ↓
Submit
```

### Required Input

```text
Photo
Location
```

### Generated Data

```text
Damage Type
Severity
Confidence
Description
Priority Score
Timestamp
```

### Acceptance Criteria

- User harus login.
- Photo wajib tersedia.
- Location wajib tersedia.
- AI analysis harus berhasil atau menghasilkan error yang dapat ditangani.
- User dapat memeriksa hasil AI.
- Report tersimpan setelah submit.

---

# 15. F12 — Photo Upload

**Priority:** P0

### Purpose

Mengambil evidence visual kerusakan.

### Requirements

- Image only
- File size limitation
- MIME type validation
- Upload progress
- Preview image

### Acceptance Criteria

- File bukan image ditolak.
- File terlalu besar ditolak.
- Preview ditampilkan.
- Image berhasil disimpan ke Storage.
- URL/reference tersimpan di report.

---

# 16. F13 — GPS Location

**Priority:** P0

### Purpose

Mengambil lokasi laporan.

### Data

```text
Latitude
Longitude
Timestamp
```

Optional:

```text
Address / Location Label
```

### Acceptance Criteria

- Browser meminta permission.
- Coordinate berhasil diperoleh.
- Coordinate ditampilkan kepada user.
- User dapat melihat lokasi sebelum submit.
- Jika permission ditolak, user mendapat pesan yang jelas.

---

# 17. F14 — AI Damage Analysis

**Priority:** P0

### Purpose

Menganalisis foto kerusakan jalan.

### Input

```text
Road Damage Image
```

### Output

```json
{
  "damage_type": "pothole",
  "severity": "high",
  "confidence": 0.94,
  "description": "Large pothole affecting the road surface."
}
```

### AI Tasks

- Damage classification
- Severity estimation
- Confidence estimation
- Description generation

### Acceptance Criteria

- AI dipanggil dari server-side environment yang aman.
- API key tidak dikirim ke browser.
- Output mengikuti schema yang ditentukan.
- Invalid AI response ditangani.
- Error API ditangani.
- User melihat hasil AI sebelum submit.

---

# 18. F15 — AI Result Review

**Priority:** P0

### Purpose

Memberikan kontrol kepada user sebelum data menjadi report final.

### User dapat melihat:

```text
Damage Type
Severity
Confidence
Description
```

User dapat:

- menerima hasil,
- mengoreksi damage type,
- mengoreksi severity,
- mengubah description jika diperlukan.

### Acceptance Criteria

- AI result tidak langsung dianggap final.
- User dapat melakukan correction.
- Final report menyimpan hasil setelah review.

---

# 19. F16 — My Reports

**Priority:** P0

### Purpose

Menampilkan seluruh laporan yang dibuat user.

### Information

```text
Report ID
Photo
Damage
Severity
Status
Priority
Created At
```

### Acceptance Criteria

- User hanya melihat report miliknya.
- Report dapat dibuka.
- Status terlihat.
- Report terbaru muncul sesuai sorting.

---

# 20. F17 — Report Status Tracking

**Priority:** P0

### Status

```text
REPORTED
VERIFIED
IN_PROGRESS
RESOLVED
```

### Purpose

Membuat proses penanganan transparan.

### Acceptance Criteria

- Status tersimpan di database.
- Status terlihat pada report detail.
- User dapat melihat perubahan status.
- Perubahan status dilakukan oleh role yang berwenang.

---

# 21. F18 — Status Timeline

**Priority:** P1

### Example

```text
02 Sep — Reported
03 Sep — Verified
05 Sep — In Progress
10 Sep — Resolved
```

### Acceptance Criteria

- Setiap perubahan status dapat dicatat.
- Timeline diurutkan berdasarkan waktu.
- User dapat melihat riwayat status.

---

# 22. F19 — Community Verification

**Priority:** P0

### Question

> Apakah kerusakan ini masih ada?

### Options

```text
👍 Masih ada
👎 Sudah diperbaiki
```

### Data

```text
User ID
Report ID
Vote
Created At
Updated At
```

### Rules

- User harus login.
- Satu user hanya memiliki satu vote aktif per report.
- User dapat mengubah vote sesuai aturan.
- User tidak dapat melakukan spam vote.

---

# 23. F20 — Verification Summary

**Priority:** P0

### Example

```text
Community Verification

23 — Masih ada
2 — Sudah diperbaiki

Confidence: 92%
```

### Purpose

Mengubah kumpulan vote menjadi signal yang mudah dipahami.

### Acceptance Criteria

- Jumlah vote dihitung dari database.
- Confidence dihitung secara konsisten.
- Perubahan vote memperbarui hasil.
- Tidak menampilkan identitas pribadi voter secara publik.

---

# 24. F21 — Priority Score

**Priority:** P0

### Purpose

Menentukan tingkat urgensi report.

### Input

```text
Severity Score
Community Confidence
Risk Factor
```

### Initial Formula

```text
Priority Score =
(Severity × 0.50)
+
(Community Confidence × 0.30)
+
(Risk Factor × 0.20)
```

### Classification

```text
80–100 → HIGH PRIORITY
50–79  → MEDIUM PRIORITY
0–49   → LOW PRIORITY
```

### Acceptance Criteria

- Score selalu berada pada 0–100.
- Formula dapat dihitung ulang.
- Score tersimpan atau dapat direkonstruksi.
- Perubahan input relevan dapat memperbarui score.

---

# 25. F22 — Admin Dashboard

**Priority:** P0

### Purpose

Mengelola laporan dan memantau kondisi jalan.

### Dashboard Cards

```text
Total Reports
Reported
Verified
In Progress
Resolved
High Priority
```

### Acceptance Criteria

- Hanya admin yang dapat mengakses.
- Data berasal dari database.
- Admin dapat membuka report detail.

---

# 26. F23 — Admin Report Management

**Priority:** P0

### Features

- List reports
- Search
- Filter
- Sort
- Open report
- Review report
- Change status

### Filters

```text
Status
Severity
Priority
Damage Type
Date
```

---

# 27. F24 — Admin Report Review

**Priority:** P0

Admin dapat melihat:

```text
Photo
Location
AI Analysis
User Correction
Community Verification
Priority Score
Report History
```

Admin dapat melakukan:

```text
Verify
Reject
Change Status
```

### Important

Admin actions harus tercatat dan dilindungi authorization.

---

# 28. F25 — Admin Status Management

**Priority:** P0

Admin dapat mengubah:

```text
REPORTED
→ VERIFIED
→ IN_PROGRESS
→ RESOLVED
```

Sistem mencatat:

```text
Previous Status
New Status
Admin ID
Timestamp
```

---

# 29. F26 — Profile

**Priority:** P1

User dapat melihat/mengelola:

```text
Name
Email
Profile information
```

Email authentication mengikuti Firebase Authentication.

---

# 30. Feature Dependencies

Core dependencies:

```text
Authentication
      ↓
Create Report
      ↓
Photo Upload + GPS
      ↓
AI Analysis
      ↓
Firestore Report
      ↓
Public Map
      ↓
Community Verification
      ↓
Priority Score
      ↓
Admin Dashboard
```

Artinya implementasi tidak sebaiknya dilakukan secara acak.

---

# 31. MVP Critical Path

Urutan implementasi feature utama:

```text
1. Authentication
       ↓
2. Firebase Database
       ↓
3. Storage
       ↓
4. Create Report
       ↓
5. GPS
       ↓
6. AI Analysis
       ↓
7. Report Detail
       ↓
8. Public Map
       ↓
9. Community Verification
       ↓
10. Priority Score
       ↓
11. Admin Dashboard
       ↓
12. Status Management
```

Landing page dapat dibuat paralel setelah struktur aplikasi dasar stabil.

---

# 32. Error States

Setiap core feature harus memiliki error state.

## Authentication

```text
Invalid email
Wrong password
Email already exists
Network error
```

## Upload

```text
Invalid file
File too large
Upload failed
```

## GPS

```text
Permission denied
Location unavailable
Timeout
```

## AI

```text
AI unavailable
Invalid response
Rate limit
Timeout
```

## Database

```text
Permission denied
Network error
Write failed
```

User harus mendapatkan pesan yang jelas dan actionable.

---

# 33. Loading States

Core operations harus memiliki loading state:

```text
Uploading...
Getting location...
Analyzing image...
Submitting report...
Loading reports...
Updating status...
```

Tidak boleh membuat user mengira aplikasi hang.

---

# 34. Empty States

Contoh:

### My Reports

```text
Belum ada laporan.

Temukan jalan rusak?
Buat laporan pertama kamu.
```

### Verification

```text
Belum ada laporan yang dapat diverifikasi.
```

### Admin

```text
Tidak ada laporan sesuai filter.
```

---

# 35. Permission Rules

| Feature | Guest | User | Admin |
|---|---:|---:|---:|
| Landing | ✅ | ✅ | ✅ |
| Public Map | ✅ | ✅ | ✅ |
| Report Detail | ✅ | ✅ | ✅ |
| Register/Login | ✅ | — | — |
| Create Report | ❌ | ✅ | ✅* |
| Community Verification | ❌ | ✅ | ✅* |
| My Reports | ❌ | ✅ | ❌ |
| Admin Dashboard | ❌ | ❌ | ✅ |
| Change Status | ❌ | ❌ | ✅ |

`*` dapat diatur sesuai kebutuhan authorization.

---

# 36. Feature Security Requirements

Core features wajib mempertimbangkan:

- authentication,
- authorization,
- Firestore Security Rules,
- Storage Security Rules,
- input validation,
- file validation,
- API key protection,
- rate limiting,
- duplicate vote prevention,
- admin role protection.

Detail keamanan akan didefinisikan dalam:

`SECURITY.md`

---

# 37. Feature Acceptance Philosophy

Sebuah feature dianggap selesai bukan ketika UI selesai.

Feature dianggap selesai jika:

```text
UI
 ↓
Frontend Logic
 ↓
Backend/API
 ↓
Database
 ↓
Security
 ↓
Error Handling
 ↓
Testing
```

semuanya bekerja sesuai kebutuhan.

---

# 38. MVP Feature Checklist

## Public

- [ ] Landing Page
- [ ] Public Map
- [ ] Report Detail
- [ ] Latest Reports
- [ ] Statistics
- [ ] Location Search

## Authentication

- [ ] Register
- [ ] Login
- [ ] Logout
- [ ] Role Authorization

## Reporting

- [ ] Create Report
- [ ] Photo Upload
- [ ] GPS
- [ ] AI Analysis
- [ ] AI Review
- [ ] Submit Report

## Community

- [ ] Verification
- [ ] Verification Summary
- [ ] One Vote Per User

## Status

- [ ] Reported
- [ ] Verified
- [ ] In Progress
- [ ] Resolved
- [ ] Status Timeline

## Priority

- [ ] Severity Score
- [ ] Community Score
- [ ] Risk Factor
- [ ] Priority Score
- [ ] Priority Classification

## User

- [ ] Dashboard
- [ ] My Reports
- [ ] Profile

## Admin

- [ ] Admin Dashboard
- [ ] Report List
- [ ] Search
- [ ] Filter
- [ ] Review
- [ ] Status Management

---

# 39. Definition of Done — Features

MVP feature system dianggap siap ketika satu user dapat:

```text
Register
 ↓
Login
 ↓
Create Report
 ↓
Upload Photo
 ↓
Get GPS
 ↓
Run AI
 ↓
Review AI
 ↓
Submit
 ↓
See Report
```

Kemudian user lain:

```text
Login
 ↓
Open Report
 ↓
Verify
```

Kemudian admin:

```text
Login
 ↓
Open Dashboard
 ↓
Review Report
 ↓
Check Priority
 ↓
Update Status
```

Dan user pertama:

```text
Open My Report
 ↓
See Verification
 ↓
See Priority
 ↓
See Updated Status
```

Jika seluruh flow tersebut berjalan menggunakan data nyata, maka feature set inti JALANIN V1 telah terbukti.

---

# 40. Future Feature Backlog

Fitur berikut disimpan untuk versi setelah MVP:

```text
V2
- Push Notifications
- Duplicate Detection
- Report Clustering
- Advanced Analytics
- Better Risk Scoring
- AI Model Improvement
- Moderation System

V3
- Mobile App
- Government Integration
- Traffic Data
- CCTV
- IoT
- Predictive Maintenance
- Public API
```

---

# 41. Final Feature Principle

> **JALANIN tidak perlu memiliki banyak fitur untuk menjadi produk yang kuat.**

Core value harus terlebih dahulu bekerja:

```text
REPORT
   ↓
UNDERSTAND
   ↓
VERIFY
   ↓
PRIORITIZE
   ↓
MONITOR
```

Jika core loop tersebut stabil, barulah fitur tambahan dikembangkan.
