# JALANIN - Product Roadmap

> **JALANIN - Jalan Aman, Kota Nyaman.**

Roadmap ini mengatur urutan delivery JALANIN berdasarkan validasi core product, bukan berdasarkan jumlah halaman yang terlihat selesai.

**Planning horizon:** MVP V1, V1.1, V2, V3  
**Status:** Product Definition

---

## 1. Roadmap Principles

- Validasi workflow utama sebelum menambah fitur.
- Satu milestone harus menghasilkan sesuatu yang dapat dicoba.
- Quality gate lebih penting daripada mengejar banyak fitur.
- Jangan membangun integrasi eksternal sebelum data internal stabil.
- Prioritas berubah berdasarkan feedback dan KPI nyata.

---

## 2. MVP V1 Goal

Membuktikan bahwa masyarakat dapat mengubah kondisi jalan nyata menjadi report yang:

```text
Reported -> Analyzed -> Reviewed -> Verified -> Prioritized -> Monitored
```

### MVP Success Condition

- User dapat register/login.
- User dapat upload photo dan mengambil GPS.
- AI menghasilkan structured suggestion.
- User dapat review dan mengirim report.
- Report muncul pada public map.
- User lain dapat melakukan verification.
- Priority score berubah sesuai input.
- Admin dapat review dan mengubah status.

---

## 3. Phase 0 - Foundation

### Output

- Product docs disepakati.
- Firebase projects development/staging dibuat.
- Next.js project baseline siap.
- Environment strategy dan access ownership ditetapkan.
- Design tokens dan navigation model disepakati.

### Gate

Tidak mulai feature implementation sebelum schema database, auth model, dan core route boundary dipahami.

---

## 4. Phase 1 - Public Experience

### Scope

- Landing page.
- Public map shell.
- Report detail public.
- Latest reports.
- Basic statistics.
- Responsive navigation.

### Validation

- Guest memperoleh value tanpa login.
- Map dapat membuka report detail.
- Tidak ada private data pada public response.

---

## 5. Phase 2 - Authentication

### Scope

- Register.
- Login.
- Logout.
- User profile creation.
- Role-aware redirect.
- Protected route boundary.

### Validation

- User dan admin dapat diarahkan ke area benar.
- Guest tidak dapat membuka protected workflow.
- Role tidak dapat dipilih dari public register.

---

## 6. Phase 3 - Create Report Core

### Scope

- Photo upload.
- Photo preview and validation.
- GPS permission and coordinate preview.
- Report form stepper.
- Firestore report creation.
- My Reports.
- Report status awal.

### Validation

- Report benar-benar tersimpan.
- Retry tidak menggandakan report.
- Owner dapat melihat report miliknya.
- Public map dapat membaca report public.

---

## 7. Phase 4 - AI Analysis

### Scope

- Server-side AI adapter.
- Structured output validation.
- AI loading/error/retry.
- User review and correction.
- AI snapshot dan final damage data.

### Validation

- API key tidak pernah sampai browser.
- Invalid output ditolak.
- User dapat mengoreksi hasil.
- AI failure tidak menghasilkan fake report.

---

## 8. Phase 5 - Community and Priority

### Scope

- Verification control.
- One user one verification.
- Verification summary.
- Priority score calculation.
- Score/classification pada detail dan admin list.

### Validation

- Update vote memperbarui summary.
- Priority berubah ketika input berubah.
- Score selalu 0-100.
- User tidak dapat memanipulasi aggregate.

---

## 9. Phase 6 - Admin Operations

### Scope

- Admin dashboard.
- Report filtering and sorting.
- Evidence review.
- Status transition.
- Status timeline.
- Visibility moderation.
- Risk factor adjustment.

### Validation

- Hanya admin yang dapat melakukan action.
- Perubahan status tercatat.
- User melihat update status yang benar.
- Report invalid dapat disembunyikan.

---

## 10. Phase 7 - Hardening and Launch

### Scope

- Security rules test.
- API contract test.
- Mobile QA.
- Accessibility audit.
- Error/empty/loading review.
- Performance pass.
- Backup and deployment runbook.
- Analytics KPI baseline.

### Launch Gate

- Core workflow berhasil dengan data nyata.
- Critical security test lulus.
- Tidak ada blocker pada create report.
- Admin dapat menangani report end-to-end.
- Rollback dan incident path dipahami tim.

---

## 11. V1.1 - Quality Improvements

Prioritas setelah MVP stabil:

- duplicate report detection sederhana,
- location search yang lebih baik,
- better map clustering,
- improved admin filters,
- report correction history,
- email/in-app notification ringan,
- improved AI prompt/model evaluation,
- accessibility refinement,
- performance optimization.

V1.1 tidak boleh mengganggu reliability core workflow.

---

## 12. V2 - Scale of Insight

Fokus:

- report clustering,
- advanced analytics,
- area trends,
- better risk calculation,
- moderation improvements,
- richer verification signal,
- operational reporting.

V2 dimulai setelah cukup data terkumpul untuk membuktikan kebutuhan fitur tersebut.

---

## 13. V3 - Ecosystem

Fokus potensial:

- authority/government integration,
- mobile application,
- traffic data,
- CCTV/IoT integration,
- predictive maintenance,
- public API,
- regional expansion.

V3 memiliki dependency legal, operational, dan partnership yang tidak boleh diasumsikan tersedia pada MVP.

---

## 14. KPI by Phase

### MVP

```text
Report submission success rate
AI analysis success rate
Report verification participation
Admin review completion
Resolved reports
```

### V1.1+

```text
Active users
Reports per active user
Average resolution time
User correction rate
Return verification rate
```

North Star:

```text
Verified Road Reports
```

---

## 15. Prioritization Rule

Sebuah request masuk roadmap jika memenuhi setidaknya satu:

- meningkatkan completion core workflow,
- meningkatkan trust atau data quality,
- mengurangi kerja admin yang berulang,
- memperbaiki accessibility atau security,
- atau dibutuhkan oleh constraint platform.

Fitur yang hanya mempercantik demo tetapi tidak memperkuat value ditunda.

---

## 16. Roadmap Definition of Done

Roadmap dianggap siap dieksekusi apabila:

- setiap fase memiliki outcome yang dapat diuji,
- dependency antar fase jelas,
- setiap gate memiliki acceptance criteria,
- non-goal tetap dilindungi,
- KPI dapat diukur,
- dan ada keputusan eksplisit sebelum masuk fase berikutnya.
