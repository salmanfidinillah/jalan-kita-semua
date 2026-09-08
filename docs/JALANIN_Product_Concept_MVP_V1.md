# JALANIN — Product Concept & MVP Specification

> **JALANIN — Jalan Aman, Kota Nyaman.**
>
> Platform pemantauan kondisi jalan berbasis AI dan komunitas untuk membantu masyarakat melaporkan, memverifikasi, memantau, dan memprioritaskan kerusakan jalan.

**Dokumen:** Product Concept & MVP V1  
**Status:** Draft — Step 1: Finalisasi Product Concept  
**Target:** MVP usable + siap dikembangkan menjadi produk nyata  
**Konteks kompetisi:** Trunodjoyo Creative Competition (TCC) 2026 — VIBE CODE / Web Application Development

---

## 1. Product Vision

JALANIN bertujuan menjadi platform penghubung antara **masyarakat, data kondisi jalan, AI, dan proses pemantauan perbaikan**.

Masalah utama yang ingin diselesaikan bukan hanya "bagaimana melaporkan jalan rusak", tetapi:

> **Bagaimana membuat kondisi jalan yang dilaporkan menjadi data yang terstruktur, dapat dipercaya, dapat dipantau, dan dapat diprioritaskan berdasarkan tingkat urgensinya.**

### Vision

Membangun ekosistem pemantauan kondisi jalan yang transparan, partisipatif, dan data-driven.

### Mission

1. Mempermudah masyarakat melaporkan kerusakan jalan.
2. Menggunakan AI untuk membantu menganalisis kondisi jalan dari foto.
3. Menggunakan komunitas untuk meningkatkan kepercayaan terhadap laporan.
4. Menampilkan kondisi jalan secara geografis melalui peta.
5. Membantu menentukan kerusakan yang perlu diprioritaskan.
6. Menyediakan status yang transparan dari laporan sampai penyelesaian.

---

# 2. Problem Statement

Saat ini seseorang yang menemukan jalan rusak dapat mengalami beberapa masalah:

- Tidak tahu harus melapor ke mana.
- Proses pelaporan dapat terasa rumit.
- Sulit mengetahui apakah laporan sudah diterima atau diproses.
- Sulit mengetahui apakah kerusakan masih ada.
- Tidak ada gambaran kondisi jalan secara geografis yang mudah dipahami.
- Banyak laporan belum tentu berarti semua memiliki tingkat urgensi yang sama.
- Data kerusakan dapat tersebar dan sulit digunakan untuk menentukan prioritas.

### Core Problem

**Masyarakat membutuhkan cara yang mudah dan transparan untuk melaporkan serta memantau kondisi jalan, sementara pihak pengelola membutuhkan data yang terstruktur untuk mengetahui laporan mana yang paling perlu diperhatikan.**

---

# 3. Proposed Solution

JALANIN menyediakan satu alur:

```text
Temukan Jalan Rusak
        ↓
Ambil Foto + GPS
        ↓
AI Menganalisis
        ↓
User Memeriksa Hasil
        ↓
Laporan Disubmit
        ↓
Laporan Muncul di Peta
        ↓
Komunitas Memverifikasi
        ↓
Priority Score Dihitung
        ↓
Admin Melakukan Review
        ↓
Status Diperbarui
        ↓
Resolved
```

JALANIN memiliki tiga nilai utama:

### 3.1 Report

Membuat laporan kerusakan jalan menjadi mudah.

### 3.2 Verify

Menggunakan komunitas untuk membantu memastikan laporan masih relevan.

### 3.3 Prioritize

Mengubah kumpulan laporan menjadi informasi mengenai **kerusakan mana yang lebih mendesak**.

---

# 4. Product Positioning

JALANIN bukan sekadar:

- website pelaporan,
- dashboard admin,
- atau aplikasi pendeteksi pothole.

JALANIN diposisikan sebagai:

> **AI-powered community road condition monitoring platform.**

AI membantu memahami foto.

Komunitas membantu memvalidasi kondisi aktual.

Data lokasi membantu memahami persebaran.

Priority Score membantu menentukan urgensi.

---

# 5. Target Users

## 5.1 Guest / Public User

Orang yang belum login.

### Kebutuhan

- Melihat kondisi jalan.
- Mengetahui laporan terbaru.
- Mencari lokasi.
- Melihat status laporan.

### Hak akses

Guest dapat:

- membuka landing page,
- melihat public map,
- melihat laporan,
- melihat detail laporan,
- mencari lokasi,
- melihat statistik.

Guest tidak dapat:

- membuat laporan,
- melakukan verifikasi,
- mengakses dashboard user,
- mengakses admin dashboard.

---

## 5.2 Registered User

Masyarakat yang sudah memiliki akun.

### Kebutuhan

- Membuat laporan dengan cepat.
- Mendapat bantuan AI saat mengidentifikasi kerusakan.
- Mengetahui status laporan.
- Memverifikasi laporan orang lain.
- Melihat riwayat kontribusi.

### Hak akses

User dapat:

- membuat laporan,
- upload foto,
- menggunakan GPS,
- melihat AI analysis,
- mengirim laporan,
- melihat laporan miliknya,
- melakukan community verification,
- melihat status laporan.

---

## 5.3 Admin

Admin bertugas melakukan moderasi dan mengelola data.

### Kebutuhan

- Melihat seluruh laporan.
- Review laporan.
- Melihat AI analysis.
- Melihat lokasi dan foto.
- Mengubah status.
- Melihat laporan berdasarkan severity.
- Melihat priority score.

---

# 6. MVP V1 Scope

MVP V1 harus cukup kecil untuk realistis dikerjakan mahasiswa, tetapi sudah membuktikan core value JALANIN.

## 6.1 Landing Page — MUST HAVE

Komponen:

- Hero
- Problem
- Solution
- Cara kerja
- Public map preview
- Statistik
- Laporan terbaru
- CTA
- Footer

Tujuan:

> Memberikan value bahkan sebelum user login.

---

## 6.2 Authentication — MUST HAVE

Menggunakan Firebase Authentication.

Fitur:

- Register
- Login
- Logout
- Protected routes
- Role user/admin

---

## 6.3 Public Map — MUST HAVE

Peta menampilkan laporan yang valid.

Marker berdasarkan severity/status.

Contoh:

```text
🔴 High
🟠 Medium
🟡 Low
🟢 Resolved
```

Klik marker → tampilkan ringkasan:

```text
Jl. Raya Telang

Pothole
Severity: HIGH

Reported:
2 September 2026

Status:
Verified

Priority:
87/100
```

---

## 6.4 Create Report — MUST HAVE

Flow:

```text
Upload Foto
    ↓
GPS Location
    ↓
AI Analysis
    ↓
Review Result
    ↓
Submit
```

Data minimal:

- photo
- latitude
- longitude
- address/location label
- damage type
- severity
- confidence
- description
- reporter
- timestamp
- status
- priority score

---

# 7. AI Vision

AI merupakan fitur inti MVP.

Model menganalisis foto jalan.

### Output

```json
{
  "damage_type": "pothole",
  "severity": "high",
  "confidence": 0.94,
  "description": "Large pothole affecting the road surface."
}
```

### AI Responsibilities

AI membantu:

1. klasifikasi jenis kerusakan,
2. estimasi severity,
3. confidence score,
4. deskripsi kerusakan.

### Important Product Rule

AI bukan sumber kebenaran absolut.

User harus dapat:

```text
AI Result
↓
User Review
↓
Confirm / Adjust
↓
Submit
```

Ini mengurangi risiko hasil AI yang salah langsung masuk sebagai data final.

---

# 8. Damage Categories

Untuk MVP jangan membuat terlalu banyak kategori.

Gunakan:

```text
Pothole
Crack
Broken Surface
Flooding
Road Obstruction
Other
```

Kategori dapat diperluas di versi berikutnya.

---

# 9. Severity

Gunakan tiga level:

```text
LOW
MEDIUM
HIGH
```

### LOW

Kerusakan kecil dengan risiko relatif rendah.

### MEDIUM

Kerusakan cukup mengganggu dan berpotensi membahayakan.

### HIGH

Kerusakan signifikan dengan risiko keselamatan atau gangguan lalu lintas tinggi.

AI memberikan rekomendasi severity, tetapi user/admin dapat melakukan koreksi.

---

# 10. Report Status

Status MVP:

```text
REPORTED
    ↓
VERIFIED
    ↓
IN_PROGRESS
    ↓
RESOLVED
```

Makna:

### REPORTED

Laporan baru dibuat.

### VERIFIED

Laporan telah dianggap valid/relevan setelah review atau verifikasi.

### IN_PROGRESS

Penanganan sedang berlangsung.

### RESOLVED

Kerusakan telah dinyatakan selesai/diperbaiki.

---

# 11. Community Verification

Community verification digunakan untuk menjawab:

> "Apakah kerusakan ini masih ada?"

Pilihan:

```text
👍 Masih ada
👎 Sudah diperbaiki
```

Sistem menyimpan:

- user
- report
- vote
- timestamp

User tidak boleh memberikan vote berulang untuk laporan yang sama.

### Example

```text
Community Verification

23 — Masih ada
2 — Sudah diperbaiki

Confidence: 92%
```

### Prinsip

Community verification adalah **sinyal tambahan**, bukan satu-satunya dasar keputusan.

---

# 12. Priority Score

Priority Score merupakan salah satu differentiator utama JALANIN.

Tujuan:

> Mengurutkan laporan berdasarkan tingkat urgensi.

## MVP Formula

Gunakan formula sederhana dan transparan:

```text
Priority Score =
(Severity × 0.50)
+
(Community Confidence × 0.30)
+
(Traffic/Risk × 0.20)
```

Semua komponen dinormalisasi menjadi 0–100.

### Severity Mapping

```text
LOW    = 30
MEDIUM = 60
HIGH   = 90
```

### Community Confidence

Berdasarkan rasio/verifikasi komunitas.

### Traffic/Risk

Untuk MVP dapat dimulai sebagai:

- input sederhana,
- rule-based estimation,
- atau nilai default berdasarkan tipe lokasi.

Jangan mengklaim traffic risk sebagai data real-time jika belum menggunakan sumber data traffic aktual.

### Priority Classification

```text
80–100 = HIGH PRIORITY
50–79  = MEDIUM PRIORITY
0–49   = LOW PRIORITY
```

---

# 13. Report Detail

Setiap laporan memiliki halaman detail.

Informasi:

- Foto
- Jenis kerusakan
- Severity
- AI confidence
- Deskripsi
- Lokasi
- Map
- Waktu laporan
- Reporter (dengan privacy yang sesuai)
- Status
- Priority Score
- Community Verification
- Timeline status

Contoh:

```text
ROAD REPORT

Pothole
HIGH

AI Confidence
94%

Priority Score
87/100

Location
Jl. Raya Telang

Status
VERIFIED

Community
23 masih ada
2 sudah diperbaiki
```

---

# 14. User Dashboard

Dashboard user:

```text
Overview
├── Total Reports
├── Verified Reports
├── Resolved Reports
└── Contribution

My Reports
├── Report #001
├── Report #002
└── Report #003

Verification
└── Verification History

Profile
```

Fokus dashboard bukan banyak statistik, tetapi membantu user memahami kontribusinya.

---

# 15. Admin Dashboard

Admin dashboard:

```text
Overview
├── Total Reports
├── Reported
├── Verified
├── In Progress
└── Resolved

Reports
├── All
├── High Priority
├── Pending Review
└── Resolved

Report Detail
├── Photo
├── AI Analysis
├── Location
├── Community Verification
├── Priority Score
└── Status Control
```

---

# 16. Information Architecture

```text
JALANIN
│
├── Landing
│
├── Public Map
│   ├── Map
│   ├── Search
│   └── Report Detail
│
├── Auth
│   ├── Login
│   └── Register
│
├── User
│   ├── Dashboard
│   ├── Create Report
│   ├── My Reports
│   ├── Verification
│   └── Profile
│
└── Admin
    ├── Dashboard
    ├── Reports
    └── Report Detail
```

---

# 17. Core User Journey

## Journey A — Guest

```text
Landing
→ Public Map
→ Search Location
→ Open Report
→ See Status
→ CTA Login
```

## Journey B — Reporter

```text
Login
→ Create Report
→ Upload Photo
→ GPS
→ AI Analysis
→ Review
→ Submit
→ Report Detail
→ Track Status
```

## Journey C — Community

```text
Login
→ Public Map
→ Open Report
→ Community Verification
→ Vote
```

## Journey D — Admin

```text
Admin Login
→ Dashboard
→ Review Reports
→ Inspect AI Result
→ Check Community
→ Update Status
→ Monitor Priority
```

---

# 18. MVP Success Criteria

MVP dianggap berhasil apabila end-to-end flow berikut dapat dilakukan tanpa data dummy:

```text
User Register
      ↓
Login
      ↓
Upload Photo
      ↓
GPS Obtained
      ↓
AI Analysis
      ↓
User Review
      ↓
Submit Report
      ↓
Data Stored
      ↓
Report Appears on Map
      ↓
Another User Verifies
      ↓
Priority Score Updates
      ↓
Admin Reviews
      ↓
Admin Updates Status
      ↓
User Sees Updated Status
```

Ini adalah **Definition of Done utama** JALANIN V1.

---

# 19. Non-Goals — Jangan Dikerjakan di MVP

Untuk menjaga scope tetap realistis:

- Mobile application
- Chat
- Push notification kompleks
- Gamification / XP
- Payment
- AI chatbot
- IoT
- CCTV integration
- Government API integration
- Real-time traffic integration
- Complex recommendation engine
- Social feed
- Advanced analytics
- Multi-region enterprise deployment

Semua dapat masuk roadmap V2/V3.

---

# 20. MVP vs Future

## V1 — Core MVP

```text
Landing
Public Map
Auth
Report
GPS
AI Vision
Firestore
Storage
Verification
Status
Priority Score
Admin Dashboard
```

## V2 — Product Growth

```text
Advanced analytics
Notifications
Better traffic/risk data
More robust AI
Report clustering
Duplicate detection
Moderation improvements
Public statistics
```

## V3 — Ecosystem

```text
Government/authority integration
Mobile app
IoT/CCTV
Real-time traffic
Predictive road maintenance
Open data/API
Regional expansion
```

---

# 21. Product Principles

## Principle 1 — Real Product Over Demo

Setiap fitur harus memiliki alasan penggunaan nyata.

Jangan membuat fitur hanya karena terlihat keren saat presentasi.

## Principle 2 — AI Must Be Functional

AI harus menghasilkan output yang benar-benar digunakan oleh sistem.

## Principle 3 — Human-in-the-loop

AI membantu manusia, bukan menggantikan keputusan manusia sepenuhnya.

## Principle 4 — Transparency

User harus dapat melihat status dan alasan utama laporan menjadi prioritas.

## Principle 5 — Community as Signal

Komunitas membantu memperkuat validitas data.

## Principle 6 — MVP First

Fitur kompleks ditunda sampai core flow stabil.

## Principle 7 — Security by Design

Authentication, authorization, validation, storage rules, dan API key security harus dipikirkan sejak awal.

---

# 22. Key Product Differentiator

JALANIN memiliki tiga lapisan nilai:

```text
                 JALANIN
                    │
       ┌────────────┼────────────┐
       ↓            ↓            ↓
      AI       COMMUNITY      DATA
       │            │            │
 Analyze Photo   Verify       Location
 Severity        Condition    Status
 Description     Confidence   History
       └────────────┼────────────┘
                    ↓
             PRIORITY SCORE
                    ↓
          KNOW WHAT MATTERS MOST
```

Dengan demikian, JALANIN tidak berhenti pada:

> "Melaporkan jalan rusak."

Tetapi berkembang menjadi:

> **"Memahami kondisi jalan dan membantu menentukan mana yang perlu diprioritaskan."**

---

# 23. Technology Direction

## Frontend

```text
Next.js
Tailwind CSS
```

## Authentication

```text
Firebase Authentication
```

## Database

```text
Cloud Firestore
```

## Storage

```text
Firebase Storage
```

## AI

```text
Gemini API / Vertex AI
```

## Map

MVP dapat memilih salah satu:

```text
Option A:
Leaflet + OpenStreetMap

Option B:
Google Maps
```

Keputusan final dilakukan sebelum implementasi map.

## Deployment

```text
Vercel
atau
Google Cloud Run
```

Pemilihan deployment mengikuti kebutuhan API/backend dan keamanan secret.

---

# 24. High-Level Architecture

```text
                    USER
                     │
                     ↓
              Next.js Frontend
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
       Firebase    API/Server   Map
        Auth          │
                      ↓
                 AI Service
                Gemini/Vertex
                      │
                      ↓
               Firestore DB
                      │
                      ↓
              Firebase Storage
```

Catatan:

Secret AI/API key tidak boleh diletakkan di client-side.

---

# 25. Data Entities

Entity utama MVP:

```text
User
Report
Verification
AIAnalysis
StatusHistory
```

Secara konsep:

```text
User
 ├── creates → Report
 └── submits → Verification

Report
 ├── has → AIAnalysis
 ├── has → Verification
 └── has → StatusHistory
```

Schema detail akan difinalisasi pada **Step 5: Database Schema**.

---

# 26. Security Baseline

MVP wajib memiliki minimal:

- Firebase Authentication
- Role-based authorization
- Firestore Security Rules
- Storage Security Rules
- Input validation
- File type validation
- File size limitation
- API secret tidak dikirim ke frontend
- Server-side AI calls jika menggunakan secret API key
- User hanya dapat mengubah data miliknya sesuai aturan
- Admin-only operations dilindungi role

---

# 27. Abuse & Data Quality Considerations

Potensi abuse:

### Spam reports

Mitigasi:

- authentication,
- rate limiting,
- validation,
- admin moderation.

### Fake GPS

Mitigasi MVP:

- gunakan browser/device geolocation,
- simpan timestamp,
- simpan coordinate,
- admin dapat review.

### Fake verification

Mitigasi:

- satu user satu vote per report,
- simpan timestamp,
- batasi pola abuse,
- gunakan verification sebagai signal, bukan kebenaran mutlak.

### Bad AI result

Mitigasi:

```text
AI
↓
User Review
↓
Admin Review
```

---

# 28. Product Metrics

MVP dapat mengukur:

### Usage

- registered users
- active users
- reports created

### Data Quality

- verified reports
- rejected reports
- duplicate reports

### Community

- verification count
- verification participation

### Resolution

- reports resolved
- average time to resolution

### AI

- AI analysis success rate
- AI confidence distribution
- user corrections terhadap AI result

Metrics ini dapat dikembangkan setelah MVP stabil.

---

# 29. Competition Alignment

JALANIN tetap relevan dengan TCC 2026:

### Innovation & Solution Fit — 25%

Solusi menggabungkan:

- public map,
- AI analysis,
- community verification,
- status tracking,
- priority scoring.

### Technology & AI — 30%

AI digunakan secara nyata untuk:

- image analysis,
- damage classification,
- severity estimation,
- description generation.

### Website Functionality — 30%

MVP memiliki end-to-end workflow:

```text
Auth
→ Report
→ AI
→ Database
→ Map
→ Verification
→ Admin
→ Status
```

### UI/UX — 15%

Fokus:

- mobile responsive,
- simple reporting flow,
- clear visual status,
- map-first experience,
- minimal friction.

---

# 30. Product Risks

## Risk 1 — AI Accuracy

AI dapat salah mengklasifikasikan kerusakan.

**Mitigasi:** human-in-the-loop.

## Risk 2 — Map Cost / API Limits

Provider map dapat memiliki batas penggunaan.

**Mitigasi:** pilih provider sesuai skala MVP dan cek pricing/limits sebelum production.

## Risk 3 — Firebase Rules

Kesalahan security rules dapat membuka data.

**Mitigasi:** test rules sebelum deployment.

## Risk 4 — Scope Creep

Terlalu banyak fitur dapat menghambat MVP.

**Mitigasi:** gunakan V1/V2/V3 separation.

## Risk 5 — Fake Data

Demo menggunakan data dummy dapat menyembunyikan bug.

**Mitigasi:** seluruh core flow menggunakan database nyata.

---

# 31. Final MVP Feature Checklist

## Public

- [ ] Landing page
- [ ] Public map
- [ ] Search location
- [ ] Latest reports
- [ ] Report detail
- [ ] Statistics
- [ ] Login CTA

## Authentication

- [ ] Register
- [ ] Login
- [ ] Logout
- [ ] Protected routes
- [ ] User/Admin role

## Reporting

- [ ] Upload image
- [ ] GPS
- [ ] AI analysis
- [ ] AI result review
- [ ] Submit report
- [ ] Report detail
- [ ] Report history

## Community

- [ ] Still exists vote
- [ ] Resolved vote
- [ ] One vote per user/report
- [ ] Verification statistics

## Status

- [ ] Reported
- [ ] Verified
- [ ] In Progress
- [ ] Resolved
- [ ] Status history

## Priority

- [ ] Severity score
- [ ] Community score
- [ ] Risk score
- [ ] Priority score
- [ ] Priority classification

## Admin

- [ ] Admin dashboard
- [ ] Reports list
- [ ] Report review
- [ ] AI result inspection
- [ ] Priority sorting
- [ ] Status update

---

# 32. Definition of MVP

JALANIN V1 **bukan selesai ketika semua halaman sudah dibuat**.

JALANIN V1 selesai ketika:

> **Seorang user dapat menemukan kerusakan jalan, mengambil foto dan lokasi, mendapatkan analisis AI, mengirim laporan nyata, melihat laporan tersebut di peta, menerima verifikasi komunitas, mendapatkan priority score, dan melihat perubahan status yang dilakukan admin — seluruhnya menggunakan data nyata.**

Itulah core product JALANIN.

---

# 33. Next Development Steps

Setelah dokumen ini disetujui, development dilanjutkan dengan:

```text
STEP 1
Product Concept & MVP
        ↓
STEP 2
User Flow
        ↓
STEP 3
Information Architecture
        ↓
STEP 4
UI/UX Structure
        ↓
STEP 5
Database Schema
        ↓
STEP 6
Tech Architecture
        ↓
STEP 7
Project Setup
        ↓
STEP 8+
Implementation
```

**Aturan development:**

> Jangan coding fitur sebelum flow, data yang dibutuhkan, dan acceptance criteria fitur tersebut jelas.

---

## Status Dokumen

**Current phase:** Step 1 — Product Concept & MVP

**Next phase:** User Flow & Information Architecture

**Development principle:**

> Build the smallest version that proves the biggest value.
