# JALANIN - API Specification

> **JALANIN - Jalan Aman, Kota Nyaman.**

Dokumen ini mendefinisikan kontrak API untuk menghubungkan web client, Firebase Authentication, Firestore, Firebase Storage, dan AI service.

**Version:** MVP V1  
**Style:** Server-side route handlers / API routes  
**Data source:** Cloud Firestore  
**Status:** Product Definition

---

## 1. API Principles

- Semua endpoint memakai JSON kecuali upload file.
- Semua timestamp dibuat server-side.
- Client tidak boleh mengirim atau menentukan role, aggregate, priority final, atau status history final.
- Endpoint protected wajib memvalidasi Firebase ID token.
- Error memakai format yang konsisten dan dapat ditangani UI.
- Endpoint create report harus idempotent terhadap retry.
- API key AI tidak pernah dikirim ke browser.

Base URL production:

```text
/api
```

---

## 2. Authentication

Authentication menggunakan Firebase Authentication. Client memperoleh ID token dari Firebase SDK dan mengirimkannya pada request protected.

```http
Authorization: Bearer <firebase-id-token>
```

### Roles

```text
guest
user
admin
```

Role dibaca dari profile `/users/{userId}` atau custom claim yang dikelola server. UI role check tidak cukup untuk authorization.

---

## 3. Common Response Format

### Success

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "request-id"
  }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Some fields are invalid.",
    "fieldErrors": {
      "location": "Location is required."
    }
  },
  "meta": {
    "requestId": "request-id"
  }
}
```

### Error Codes

| HTTP | Code | Meaning |
|---:|---|---|
| 400 | `VALIDATION_ERROR` | Input tidak valid |
| 401 | `UNAUTHENTICATED` | Token tidak ada atau tidak valid |
| 403 | `FORBIDDEN` | Role tidak memiliki akses |
| 404 | `NOT_FOUND` | Resource tidak ditemukan |
| 409 | `CONFLICT` | Konflik state atau duplicate request |
| 413 | `FILE_TOO_LARGE` | File melebihi batas |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Tipe file tidak didukung |
| 429 | `RATE_LIMITED` | Terlalu banyak request |
| 500 | `INTERNAL_ERROR` | Error server |
| 503 | `DEPENDENCY_UNAVAILABLE` | AI, storage, atau database tidak tersedia |

---

## 4. Endpoint Summary

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/reports` | Public | List report public |
| `GET` | `/api/reports/:reportId` | Public | Detail report |
| `POST` | `/api/reports` | User | Membuat report |
| `PATCH` | `/api/reports/:reportId` | Owner/Admin | Update data yang diizinkan |
| `GET` | `/api/reports/:reportId/status-history` | Public | Timeline status |
| `POST` | `/api/reports/:reportId/analyze` | User | Analisis foto dengan AI |
| `GET` | `/api/reports/:reportId/verification` | User | Verification milik current user |
| `PUT` | `/api/reports/:reportId/verification` | User | Create/update verification |
| `GET` | `/api/me/reports` | User | Report milik user |
| `GET` | `/api/me` | User | Profile current user |
| `PATCH` | `/api/me` | User | Update profile |
| `GET` | `/api/admin/reports` | Admin | List report untuk moderasi |
| `PATCH` | `/api/admin/reports/:reportId/status` | Admin | Update status |
| `PATCH` | `/api/admin/reports/:reportId/priority` | Admin | Update risk factor |
| `GET` | `/api/admin/stats` | Admin | Statistik admin |

---

## 5. Public Report API

### 5.1 List Reports

```http
GET /api/reports?limit=20&status=REPORTED&severity=HIGH&priority=HIGH&bbox=west,south,east,north&cursor=...
```

Query parameters:

- `limit`: 1-50, default 20.
- `status`: optional enum.
- `severity`: optional enum.
- `priority`: optional `LOW`, `MEDIUM`, `HIGH`.
- `bbox`: optional map bounding box.
- `cursor`: pagination cursor.

Response hanya mengembalikan report dengan `visibility=public` dan tidak mengandung data pribadi sensitif.

### 5.2 Report Detail

```http
GET /api/reports/:reportId
```

Guest boleh membaca report public. Owner dan admin dapat membaca data tambahan sesuai authorization.

### 5.3 Status History

```http
GET /api/reports/:reportId/status-history
```

Response mengembalikan history terurut dari terbaru atau sesuai parameter `order`.

---

## 6. Create Report Flow

Create report terdiri dari tiga tahap logis:

```text
Upload photo
    -> Analyze photo
    -> Review AI result
    -> Submit final report
```

### 6.1 Upload Photo

```http
POST /api/uploads/report-photo
Content-Type: multipart/form-data
```

Response:

```json
{
  "success": true,
  "data": {
    "uploadId": "upload-id",
    "storagePath": "reports/user-id/report-id/original.jpg",
    "mimeType": "image/jpeg",
    "sizeBytes": 245678
  }
}
```

Server memvalidasi MIME type, ukuran, ownership, dan extension. Upload yang belum dipakai akan dibersihkan oleh maintenance job.

### 6.2 Analyze Photo

```http
POST /api/reports/:reportId/analyze
```

Request:

```json
{
  "storagePath": "reports/user-id/report-id/original.jpg"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "status": "COMPLETED",
    "damageType": "POTHOLE",
    "severity": "HIGH",
    "confidence": 0.94,
    "description": "Large pothole affecting the road surface.",
    "model": "gemini-vision-model"
  }
}
```

### 6.3 Create Final Report

```http
POST /api/reports
Idempotency-Key: <unique-submit-key>
```

Request:

```json
{
  "clientReportId": "client-generated-id",
  "photo": {
    "uploadId": "upload-id",
    "storagePath": "reports/user-id/report-id/original.jpg"
  },
  "location": {
    "latitude": -7.2575,
    "longitude": 112.7521,
    "accuracyMeters": 12.5,
    "label": "Jl. Contoh, Surabaya",
    "capturedAt": "2026-09-08T10:00:00Z"
  },
  "damage": {
    "type": "POTHOLE",
    "severity": "HIGH",
    "description": "Large pothole affecting the road surface."
  },
  "aiAnalysis": {
    "analysisId": "analysis-id",
    "reviewed": true
  }
}
```

Server:

1. Validates token and ownership.
2. Validates photo and location.
3. Verifies AI analysis reference.
4. Creates report with status `REPORTED`.
5. Creates initial status history.
6. Calculates priority.
7. Updates user counter.
8. Returns the same result for a repeated idempotent request.

---

## 7. User API

### Current Profile

```http
GET /api/me
```

### Update Profile

```http
PATCH /api/me
```

Allowed fields:

```json
{
  "displayName": "Budi Santoso",
  "photoUrl": "https://..."
}
```

`role`, `email`, `isActive`, dan counters tidak boleh diubah melalui endpoint ini.

### My Reports

```http
GET /api/me/reports?limit=20&cursor=...
```

Server selalu menerapkan filter `reporterId == currentUserId`.

---

## 8. Verification API

### Read Current User Verification

```http
GET /api/reports/:reportId/verification
```

Jika belum ada, response `data` bernilai `null` dengan HTTP 200.

### Create or Update Verification

```http
PUT /api/reports/:reportId/verification
```

Request:

```json
{
  "choice": "STILL_EXISTS"
}
```

Server melakukan transaction:

1. Validasi report dan current user.
2. Menolak owner report pada MVP.
3. Create atau update document `/verifications/{userId}`.
4. Recalculate verification summary.
5. Recalculate priority.
6. Update `updatedAt`.

---

## 9. Admin API

Semua endpoint `/api/admin/*` memerlukan role `admin`.

### Admin Report List

```http
GET /api/admin/reports?status=REPORTED&severity=HIGH&priority=HIGH&sort=priority_desc
```

### Update Status

```http
PATCH /api/admin/reports/:reportId/status
```

Request:

```json
{
  "status": "VERIFIED",
  "note": "Evidence reviewed and report is valid."
}
```

Server memvalidasi transition, mengubah report, membuat status history, dan mengisi `resolvedAt` bila relevan.

### Update Risk Factor

```http
PATCH /api/admin/reports/:reportId/priority
```

Request:

```json
{
  "riskValue": 75,
  "reason": "Located near a school entrance."
}
```

Server menghitung ulang priority. Client tidak boleh mengirim score final.

### Admin Stats

```http
GET /api/admin/stats
```

Stats minimal:

```text
Total reports
Reported
Verified
In progress
Resolved
High priority
```

---

## 10. Pagination and Map Queries

- Semua list endpoint memakai cursor pagination.
- `limit` memiliki batas maksimum.
- Public map tidak mengambil seluruh database sekaligus.
- Map request memakai bounding box atau geospatial query.
- Marker response menggunakan payload ringkas.
- Detail report diambil setelah marker dipilih.

---

## 11. Rate Limiting

Rate limit awal:

| Operation | Limit |
|---|---|
| Public list/detail | Per IP, configurable |
| AI analysis | Per authenticated user dan per report |
| Create report | Per user, configurable |
| Verification | Per user dan report |
| Admin operations | Per admin account |

Limit dan angka final disimpan sebagai environment/configuration, bukan hardcoded pada UI.

---

## 12. API Definition of Done

- Endpoint protected menolak token invalid.
- Role admin divalidasi server-side.
- Response error konsisten.
- Semua list memakai pagination.
- Create report idempotent.
- AI endpoint tidak mengekspos secret.
- Verification tidak membuat duplicate document.
- Priority dan aggregate dihitung server-side.
- Status update membuat history atomically.
- Public response tidak mengandung data sensitif.
- Contract diuji dengan success, validation, unauthorized, forbidden, not found, rate limit, dan dependency failure.
