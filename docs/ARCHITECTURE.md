# JALANIN - Architecture Specification

> **JALANIN - Jalan Aman, Kota Nyaman.**

Dokumen ini mendefinisikan bentuk teknis aplikasi JALANIN MVP V1 tanpa masuk ke implementasi kode.

**Architecture style:** Modular monolith web application  
**Frontend:** Next.js  
**Backend services:** Next.js server routes/actions + Firebase  
**Status:** Product Definition

---

## 1. Architecture Principles

- Bangun smallest real product.
- Satu aplikasi web dengan boundary module yang jelas.
- Pakai managed services untuk auth, database, storage, dan AI integration.
- Semua secret dan privileged operation berada di server.
- Pisahkan domain product dari provider-specific code.
- Public read path harus cepat dan ringan.
- Observability dan error recovery masuk sejak awal.

MVP tidak menggunakan microservices, message broker, Kubernetes, atau database tambahan tanpa kebutuhan nyata.

---

## 2. High-Level Architecture

```text
Browser
  |
  v
Next.js Web App
  |-- Public UI
  |-- User UI
  |-- Admin UI
  |-- Route Handlers / Server Actions
  |
  +--> Firebase Authentication
  +--> Cloud Firestore
  +--> Firebase Storage
  +--> AI Provider (Gemini / Vertex AI)
  +--> Map Provider (Leaflet + OpenStreetMap or Google Maps)
```

---

## 3. Application Layers

### Presentation Layer

- route pages,
- reusable UI components,
- loading/error/empty states,
- client-side map interaction,
- form state.

### Application Layer

- use cases: create report, analyze photo, verify report, update status,
- request validation,
- authorization orchestration,
- transaction coordination.

### Domain Layer

- report status transitions,
- damage and severity enums,
- priority calculation,
- verification summary calculation,
- AI output normalization.

### Infrastructure Layer

- Firebase clients,
- Firestore repositories,
- Storage adapter,
- Authentication adapter,
- AI provider adapter,
- map provider adapter,
- logging and configuration.

---

## 4. Suggested Modules

```text
public
  landing
  public-map
  report-detail

auth
  register
  login
  session

reports
  create-report
  my-reports
  report-detail
  report-repository
  report-validation

ai
  analysis-service
  prompt-config
  output-schema

verification
  verification-service
  verification-summary

priority
  priority-calculator

admin
  admin-dashboard
  report-review
  status-management

shared
  auth
  errors
  storage
  dates
  logging
  configuration
```

Nama folder final mengikuti conventions repository ketika kode mulai dibuat. Boundary module tetap dipertahankan.

---

## 5. Request Flow: Create Report

```text
Browser form
   ↓
Validate basic fields
   ↓
Upload photo
   ↓
Server analysis endpoint
   ↓
AI adapter
   ↓
Validated AI result
   ↓
User review
   ↓
Create report use case
   ↓
Firestore transaction/batch
   ↓
Report detail response
```

Browser tidak boleh langsung menghitung priority final, membuat status history, atau mengubah aggregate verification.

---

## 6. Request Flow: Verification

```text
Report detail
   ↓
Authenticated user action
   ↓
Verification endpoint
   ↓
Authorization
   ↓
Firestore transaction
   |-- upsert verification
   |-- recalculate summary
   |-- recalculate priority
   `-- update report timestamp
   ↓
Updated report response
```

---

## 7. Request Flow: Admin Status

```text
Admin action
   ↓
Admin endpoint
   ↓
Verify Firebase token + role
   ↓
Validate status transition
   ↓
Atomic write
   |-- update report status
   |-- create status history
   `-- set resolvedAt
   ↓
Admin response
```

---

## 8. Rendering Strategy

### Public Pages

- Landing page dapat memakai static generation atau server rendering.
- Latest reports dan stats dapat server-rendered dengan cache yang sesuai.
- Map markers membutuhkan client interaction.

### User and Admin Pages

- Protected route.
- Data fetch server-side jika memungkinkan.
- Client components hanya untuk interaction yang memang membutuhkan browser API, seperti GPS dan map.

### Map

Leaflet + OpenStreetMap menjadi pilihan default untuk mengurangi vendor lock-in dan biaya awal. Google Maps dapat dipakai jika kebutuhan geocoding atau map quality membutuhkan provider tersebut.

---

## 9. Data Ownership

| Concern | Owner |
|---|---|
| Identity/session | Firebase Authentication |
| User profile/role | Firestore `users` |
| Report data | Firestore `reports` |
| Photo binary | Firebase Storage |
| AI output | AI service + Firestore snapshot |
| Map rendering | Leaflet/provider |
| Priority calculation | Server/domain module |
| Authorization | Firebase Rules + server checks |

---

## 10. Configuration Boundaries

Environment configuration minimal:

```text
Firebase client configuration
Firebase Admin credentials
AI provider credentials
Map provider configuration
Storage limits
Rate limits
Public app URL
```

Client-safe values dipisahkan dari server-only secrets. Configuration divalidasi saat startup sehingga aplikasi gagal lebih awal dengan pesan yang jelas.

---

## 11. Reliability Strategy

- Gunakan transaction/batched write untuk multi-document update.
- Gunakan idempotency key pada submit report.
- Terapkan timeout pada AI request.
- Sediakan retry terbatas untuk dependency transient.
- Jangan retry operasi non-idempotent tanpa key.
- Tampilkan state loading dan failure di UI.
- Simpan request ID untuk tracing.

---

## 12. Caching Strategy

Cache hanya untuk data yang aman dan tidak terlalu cepat berubah:

- landing content,
- public latest reports dengan TTL pendek,
- public statistics dengan TTL pendek.

Jangan cache response private user atau admin di public cache. Setelah status/visibility berubah, cache publik harus di-invalidate atau memiliki TTL yang dapat diterima.

---

## 13. Observability

Minimal logging:

- request ID,
- route/operation,
- duration,
- actor role tanpa credential,
- dependency result,
- error code,
- report ID jika relevan.

Metric awal:

```text
API error rate
AI success rate
AI latency
Upload failure rate
Report submit success rate
Verification failure rate
Status update failure rate
```

Jangan log password, ID token, API key, atau raw private profile.

---

## 14. Architecture Definition of Done

- Domain logic tidak tersebar di komponen UI.
- AI, storage, map, dan database memiliki adapter/boundary.
- Protected operation selalu melewati server authorization.
- Create report dan verification konsisten secara atomik.
- Public dan private data memiliki response boundary.
- Error dan logging memiliki format bersama.
- Aplikasi dapat dijalankan pada environment development, staging, dan production.
- Tidak ada dependency eksternal yang ditambahkan tanpa alasan product/technical yang jelas.
