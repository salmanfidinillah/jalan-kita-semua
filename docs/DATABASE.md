# JALANIN - Database Specification

> **JALANIN - Jalan Aman, Kota Nyaman.**

Dokumen ini mendefinisikan struktur data, relasi, validasi, akses, indexing, dan aturan perubahan data untuk JALANIN MVP V1.

**Database:** Cloud Firestore  
**File storage:** Firebase Storage  
**Authentication:** Firebase Authentication  
**Status:** Product Definition  
**Scope:** MVP V1

---

## 1. Database Principles

Database JALANIN harus:

- menyimpan data core workflow secara konsisten,
- mudah dibaca oleh public map dan admin dashboard,
- tidak menyimpan data pribadi lebih banyak dari yang diperlukan,
- mendukung verifikasi satu user satu report,
- menyimpan histori perubahan status,
- memiliki validasi server-side,
- dan tidak bergantung pada query atau struktur yang terlalu kompleks untuk MVP.

Firestore menjadi source of truth untuk data aplikasi. Firebase Authentication menjadi source of truth untuk identitas login dan password.

---

## 2. Firestore Structure

```text
/users/{userId}

/reports/{reportId}
    /verifications/{userId}
    /statusHistory/{historyId}
```

MVP tidak menggunakan subcollection `reports/{reportId}/comments`, `notifications`, atau `analytics` karena fitur tersebut belum termasuk scope.

### 2.1 Collection Summary

| Collection | Purpose | Access |
|---|---|---|
| `users` | Profile, role, dan ringkasan kontribusi | User sendiri dan admin |
| `reports` | Entity utama laporan jalan | Public read terbatas, owner dan admin write |
| `verifications` | Satu pilihan verifikasi aktif per user per report | User login dan admin read |
| `statusHistory` | Riwayat perubahan status laporan | Public read, admin write |

---

## 3. Identity and User Profile

Firebase Authentication menyimpan credential. Firestore hanya menyimpan profile dan data aplikasi.

### 3.1 Document: `/users/{userId}`

`userId` harus sama dengan Firebase Authentication UID.

```json
{
  "displayName": "Budi Santoso",
  "email": "budi@example.com",
  "role": "user",
  "photoUrl": null,
  "isActive": true,
  "contributionCount": 0,
  "reportCount": 0,
  "verificationCount": 0,
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### 3.2 Field Definition

| Field | Type | Required | Rules |
|---|---|---:|---|
| `displayName` | string | Yes | 2-80 karakter |
| `email` | string | Yes | Diambil dari auth, lowercase |
| `role` | string | Yes | `user` atau `admin` |
| `photoUrl` | string/null | No | URL profile jika tersedia |
| `isActive` | boolean | Yes | Akun yang dinonaktifkan tidak dapat berkontribusi |
| `contributionCount` | number | Yes | Counter terdenormalisasi |
| `reportCount` | number | Yes | Counter terdenormalisasi |
| `verificationCount` | number | Yes | Counter terdenormalisasi |
| `createdAt` | timestamp | Yes | Server timestamp |
| `updatedAt` | timestamp | Yes | Server timestamp |

### 3.3 User Rules

- Password tidak boleh disimpan di Firestore.
- User tidak boleh mengubah `role` atau `isActive` sendiri.
- User boleh mengubah `displayName` dan `photoUrl` miliknya.
- Email profile harus mengikuti email dari Firebase Authentication.
- Admin hanya dibuat atau dipromosikan melalui proses yang aman, bukan dari form publik.

---

## 4. Report Entity

Report adalah entity utama JALANIN. Satu report merepresentasikan satu kondisi jalan pada satu lokasi dan waktu tertentu.

### 4.1 Document: `/reports/{reportId}`

```json
{
  "reporterId": "firebase-user-uid",
  "reporterDisplayName": "Budi Santoso",
  "visibility": "public",
  "photo": {
    "storagePath": "reports/firebase-user-uid/report-id/original.jpg",
    "downloadUrl": "https://storage.example/image.jpg",
    "mimeType": "image/jpeg",
    "sizeBytes": 245678,
    "width": 1280,
    "height": 960
  },
  "location": {
    "latitude": -7.2575,
    "longitude": 112.7521,
    "accuracyMeters": 12.5,
    "label": "Jl. Contoh, Surabaya",
    "capturedAt": "Timestamp",
    "geohash": "w ru..."
  },
  "damage": {
    "type": "POTHOLE",
    "severity": "HIGH",
    "description": "Large pothole affecting the road surface."
  },
  "aiAnalysis": {
    "status": "COMPLETED",
    "damageType": "POTHOLE",
    "severity": "HIGH",
    "confidence": 0.94,
    "description": "Large pothole affecting the road surface.",
    "model": "gemini-vision-model",
    "analyzedAt": "Timestamp"
  },
  "userReview": {
    "reviewed": true,
    "damageTypeChanged": false,
    "severityChanged": false,
    "descriptionChanged": false,
    "reviewedAt": "Timestamp"
  },
  "verificationSummary": {
    "stillExistsCount": 0,
    "resolvedCount": 0,
    "totalCount": 0,
    "stillExistsRatio": 0,
    "confidence": 0,
    "lastVerifiedAt": null
  },
  "riskFactor": {
    "value": 50,
    "source": "default",
    "reason": null
  },
  "priority": {
    "score": 50,
    "classification": "MEDIUM",
    "severityValue": 100,
    "communityValue": 0,
    "riskValue": 50,
    "calculatedAt": "Timestamp",
    "formulaVersion": "v1"
  },
  "status": "REPORTED",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp",
  "resolvedAt": null
}
```

### 4.2 Report Field Definition

| Field | Type | Required | Rules |
|---|---|---:|---|
| `reporterId` | string | Yes | Firebase UID pembuat laporan |
| `reporterDisplayName` | string | Yes | Snapshot nama, bukan data sensitif |
| `visibility` | string | Yes | `public`, `hidden`, atau `removed` |
| `photo` | map | Yes | Metadata file dan reference Storage |
| `location` | map | Yes | Latitude, longitude, accuracy, dan timestamp |
| `damage` | map | Yes | Data final setelah user review |
| `aiAnalysis` | map | Yes | Hasil analisis dan status AI |
| `userReview` | map | Yes | Bukti bahwa user meninjau hasil AI |
| `verificationSummary` | map | Yes | Aggregate hasil verification |
| `riskFactor` | map | Yes | Nilai 0-100 untuk perhitungan priority |
| `priority` | map | Yes | Snapshot score dan komponennya |
| `status` | string | Yes | Status workflow aktif |
| `createdAt` | timestamp | Yes | Server timestamp saat submit |
| `updatedAt` | timestamp | Yes | Server timestamp perubahan terakhir |
| `resolvedAt` | timestamp/null | No | Diisi saat status menjadi `RESOLVED` |

### 4.3 Report Enums

#### Damage Type

```text
POTHOLE
CRACK
BROKEN_SURFACE
FLOODING
ROAD_OBSTRUCTION
OTHER
```

#### Severity

```text
LOW
MEDIUM
HIGH
```

#### Status

```text
REPORTED
VERIFIED
IN_PROGRESS
RESOLVED
```

#### Visibility

```text
PUBLIC
HIDDEN
REMOVED
```

Enum sebaiknya disimpan dalam uppercase agar konsisten antara database, API, dan UI.

---

## 5. Photo and Storage Data

File gambar disimpan di Firebase Storage. Firestore hanya menyimpan metadata dan reference file.

### 5.1 Storage Path

```text
reports/{reporterId}/{reportId}/original.{extension}
reports/{reporterId}/{reportId}/thumbnail.{extension}
```

### 5.2 Upload Rules

- Hanya file image yang diterima.
- MIME type harus divalidasi di client dan server.
- Batas ukuran file ditentukan oleh konfigurasi aplikasi.
- Nama file dari user tidak dijadikan path langsung.
- File wajib terkait dengan user yang sedang login.
- File report yang dihapus atau disembunyikan tidak boleh tetap tampil di public UI.
- API key AI tidak boleh disimpan di client atau metadata file.

---

## 6. Location Data

Location disimpan dalam object `location` pada report.

```json
{
  "latitude": -7.2575,
  "longitude": 112.7521,
  "accuracyMeters": 12.5,
  "label": "Jl. Contoh, Surabaya",
  "capturedAt": "Timestamp",
  "geohash": "..."
}
```

### Location Rules

- `latitude` harus berada pada rentang `-90` sampai `90`.
- `longitude` harus berada pada rentang `-180` sampai `180`.
- `accuracyMeters` tidak boleh negatif.
- Coordinate wajib tersedia sebelum report dibuat.
- `label` bersifat optional dan tidak boleh menjadi pengganti coordinate.
- Coordinate yang ditampilkan ke publik merupakan lokasi report, bukan lokasi rumah atau data pribadi reporter.

`geohash` disimpan untuk mendukung pencarian laporan di sekitar area pada iterasi berikutnya. Query lokasi MVP dapat dimulai dengan bounding box sederhana apabila library geospatial belum dipasang.

---

## 7. AI Analysis Data

AI analysis menyimpan output model dan status proses. Data final yang dipakai product tetap berada di `damage`, setelah user melakukan review.

### 7.1 AI Status

```text
PENDING
PROCESSING
COMPLETED
FAILED
```

### 7.2 AI Rules

- AI dipanggil dari server-side environment.
- Response AI harus divalidasi terhadap schema sebelum disimpan.
- `confidence` harus berupa angka antara `0` dan `1`.
- `damageType`, `severity`, dan `description` harus memiliki nilai valid.
- Jika AI gagal, report tidak boleh dibuat dengan hasil AI palsu.
- User boleh mengoreksi `damage.type`, `damage.severity`, dan `damage.description`.
- Hasil AI asli tidak boleh ditimpa oleh koreksi user.
- `aiAnalysis` menjadi rekaman output model; `damage` menjadi nilai final yang digunakan product.

---

## 8. User Review Data

User review wajib dilakukan sebelum submit report.

```json
{
  "reviewed": true,
  "damageTypeChanged": false,
  "severityChanged": true,
  "descriptionChanged": false,
  "reviewedAt": "Timestamp"
}
```

Sistem tidak perlu menyimpan seluruh versi perubahan form untuk MVP. Jika audit perubahan AI diperlukan pada versi berikutnya, tambahkan collection khusus atau event log terpisah.

---

## 9. Community Verification

Verification menjawab pertanyaan:

> **Apakah kerusakan ini masih ada?**

### 9.1 Document: `/reports/{reportId}/verifications/{userId}`

ID document harus sama dengan UID user agar satu user hanya memiliki satu verification aktif untuk satu report.

```json
{
  "userId": "firebase-user-uid",
  "choice": "STILL_EXISTS",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### 9.2 Verification Enum

```text
STILL_EXISTS
RESOLVED
```

### 9.3 Verification Rules

- Hanya user login yang dapat membuat verification.
- Guest tidak dapat melakukan verification.
- User tidak boleh memverifikasi report miliknya sendiri pada MVP.
- User dapat mengubah pilihan verification miliknya.
- User tidak dapat membuat document kedua karena document ID menggunakan `userId`.
- `verificationSummary` pada report diperbarui secara server-side setelah create atau update.
- Penghapusan verification, jika didukung, juga harus memperbarui aggregate summary.
- Satu user hanya dihitung satu kali dalam summary.

### 9.4 Verification Aggregate

Nilai berikut disimpan pada `reports/{reportId}.verificationSummary` agar report detail dan public map dapat dibaca dengan satu read utama:

```text
stillExistsCount
resolvedCount
totalCount
stillExistsRatio
confidence
lastVerifiedAt
```

Formula awal:

```text
stillExistsRatio = stillExistsCount / totalCount
confidence = max(stillExistsRatio, 1 - stillExistsRatio) * 100
```

Jika `totalCount` adalah `0`, `confidence` dan `stillExistsRatio` bernilai `0`.

---

## 10. Priority Data and Calculation

Priority score disimpan sebagai snapshot di report dan dihitung ulang ketika data yang relevan berubah.

### 10.1 Normalized Values

| Input | Range | MVP Source |
|---|---:|---|
| `severityValue` | 0-100 | `LOW=25`, `MEDIUM=60`, `HIGH=100` |
| `communityValue` | 0-100 | `verificationSummary.stillExistsRatio * 100` |
| `riskValue` | 0-100 | `riskFactor.value` |

### 10.2 Formula

```text
Priority Score =
  (severityValue * 0.50)
  + (communityValue * 0.30)
  + (riskValue * 0.20)
```

Score dibulatkan menjadi integer dan dibatasi pada rentang `0-100`.

### 10.3 Classification

```text
80-100 -> HIGH
50-79  -> MEDIUM
0-49   -> LOW
```

### 10.4 Priority Rules

- Score awal dihitung saat report dibuat.
- Score dihitung ulang setelah verification berubah.
- Score dihitung ulang jika admin mengubah risk factor.
- Formula dan komponen score disimpan untuk transparansi.
- `formulaVersion` wajib diisi agar perubahan formula di masa depan dapat dilacak.
- User tidak boleh mengubah score secara langsung.

---

## 11. Status and Status History

### 11.1 Current Status

Status aktif disimpan di `reports/{reportId}.status` untuk kebutuhan filtering dan tampilan cepat.

### 11.2 Document: `/reports/{reportId}/statusHistory/{historyId}`

```json
{
  "fromStatus": null,
  "toStatus": "REPORTED",
  "changedBy": "firebase-user-uid",
  "changedByRole": "user",
  "note": "Report submitted",
  "createdAt": "Timestamp"
}
```

### 11.3 Status Transition

```text
REPORTED
    ↓
VERIFIED
    ↓
IN_PROGRESS
    ↓
RESOLVED
```

MVP mengizinkan admin mengembalikan status ke status sebelumnya jika diperlukan untuk koreksi data, tetapi setiap perubahan harus tercatat di `statusHistory`.

### 11.4 Status Rules

- Status awal report selalu `REPORTED`.
- User tidak dapat mengubah status report.
- Admin dapat mengubah status melalui server-side operation.
- Setiap perubahan status membuat satu history document.
- `resolvedAt` hanya diisi saat status menjadi `RESOLVED`.
- Jika status keluar dari `RESOLVED`, `resolvedAt` dikosongkan kembali.
- Report dengan `visibility` `removed` tidak ditampilkan pada public map.

---

## 12. Report Visibility and Public Data

Public report boleh menampilkan:

```text
Report ID
Photo
Location
Damage Type
Severity
Description
Status
Priority Score
Verification Summary
Created At
Updated At
```

Public report tidak boleh menampilkan:

```text
Reporter email
Reporter password
Authentication token
Private profile data
Internal moderation data
API key
```

`reporterDisplayName` merupakan snapshot opsional untuk kebutuhan atribusi dan dapat disembunyikan dari public UI. Email tidak disalin ke report.

---

## 13. Access Control Matrix

| Data / Action | Guest | User | Owner | Admin |
|---|---:|---:|---:|---:|
| Read public report | Yes | Yes | Yes | Yes |
| Read hidden/removed report | No | Owner only | Yes | Yes |
| Create report | No | Yes | Yes | Yes |
| Update own report draft/final | No | Limited | Yes | Yes |
| Change report status | No | No | No | Yes |
| Read own profile | No | Yes | Yes | Yes |
| Update own profile | No | Yes | Yes | Yes |
| Read all user profiles | No | No | No | Yes |
| Create verification | No | Yes | No for own report | Yes if needed |
| Update own verification | No | Yes | No for own report | Yes |
| Read public status history | Yes | Yes | Yes | Yes |
| Create status history | No | No | No | Server/Admin |
| Change priority score | No | No | No | Server/Admin |

Authorization harus diperiksa di Firestore Rules dan server-side function. Hiding tombol di UI bukan authorization.

---

## 14. Firestore Query Requirements

Query MVP yang harus didukung:

### Public Map

- Reports dengan `visibility == public`.
- Reports dengan `status != RESOLVED` atau filter status tertentu.
- Reports berdasarkan area lokasi.
- Reports berdasarkan `priority.classification`.

### Latest Reports

```text
visibility == public
orderBy createdAt descending
limit N
```

### My Reports

```text
reporterId == currentUserId
orderBy createdAt descending
```

### Admin Dashboard

- Filter berdasarkan `status`.
- Filter berdasarkan `damage.severity`.
- Filter berdasarkan `priority.classification`.
- Sort berdasarkan `priority.score` descending.
- Sort berdasarkan `createdAt` descending.

### Verification

```text
/reports/{reportId}/verifications/{currentUserId}
```

Read langsung berdasarkan document ID digunakan untuk mengecek pilihan user tanpa query tambahan.

---

## 15. Recommended Composite Indexes

Index berikut disiapkan ketika query mulai digunakan:

| Collection | Fields |
|---|---|
| `reports` | `visibility ASC`, `createdAt DESC` |
| `reports` | `visibility ASC`, `status ASC`, `createdAt DESC` |
| `reports` | `visibility ASC`, `priority.classification ASC`, `priority.score DESC` |
| `reports` | `reporterId ASC`, `createdAt DESC` |
| `reports` | `status ASC`, `priority.score DESC` |
| `statusHistory` | `createdAt ASC` |

Firestore akan memberikan error berisi link pembuatan index jika query membutuhkan index tambahan. Index hanya ditambahkan sesuai query nyata agar tidak membebani konfigurasi.

---

## 16. Atomicity and Consistency

Operasi berikut harus menggunakan server-side transaction atau batched write jika mengubah lebih dari satu document:

### Create Report

1. Buat document report.
2. Buat status history `REPORTED`.
3. Update counter `users.reportCount`.

### Create or Update Verification

1. Buat atau update document verification.
2. Hitung ulang verification summary.
3. Hitung ulang priority.
4. Update `report.updatedAt`.
5. Update counter kontribusi jika memang berubah sesuai definisi produk.

### Change Status

1. Update current status pada report.
2. Buat status history.
3. Update `resolvedAt` jika diperlukan.
4. Update `report.updatedAt`.

Client tidak boleh dipercaya untuk mengirim aggregate count, priority score, atau status history final.

---

## 17. Validation Rules

Sebelum write ke Firestore, server harus memvalidasi:

- UID user valid dan sedang authenticated.
- Role user sesuai dengan action.
- Semua required field tersedia.
- Enum memiliki nilai yang diizinkan.
- Latitude dan longitude valid.
- Confidence berada pada rentang `0-1`.
- Priority score berada pada rentang `0-100`.
- Photo reference sesuai dengan reporter dan report ID.
- User review sudah dilakukan.
- Verification choice valid.
- Status transition diizinkan.
- Timestamp server digunakan untuk field audit.

Jika validasi gagal, tidak ada partial write yang boleh meninggalkan report dalam kondisi setengah jadi.

---

## 18. Error and Recovery Data Rules

### AI Failed

- Jangan membuat report final dengan output palsu.
- Simpan status AI `FAILED` hanya jika proses report draft atau proses analisis memang dipersist.
- User dapat retry.

### Upload Failed

- Jangan membuat report jika photo reference belum valid.
- File sementara yang tidak terhubung ke report dapat dibersihkan oleh proses maintenance.

### Submit Retried

- Gunakan `reportId` yang dibuat sekali pada proses submit atau idempotency key agar retry tidak membuat report ganda.
- Submit yang berhasil harus mengembalikan report ID yang sama.

### Verification Failed

- Jangan mengubah aggregate jika verification write gagal.
- Tampilkan pilihan user terakhir yang benar-benar tersimpan.

### Status Update Failed

- Current status dan history harus tetap konsisten.
- Gunakan transaction atau batched write.

---

## 19. Data Lifecycle

### Create

- User membuat report dengan status `REPORTED`.
- Photo disimpan ke Storage.
- Data final dan AI snapshot disimpan ke Firestore.

### Update

- User dapat memperbarui profile sendiri.
- User dapat mengubah verification miliknya.
- Admin dapat mengubah status dan risk factor sesuai permission.
- Priority dan aggregate dihitung ulang oleh server.

### Hide or Remove

- Admin dapat mengubah `visibility` menjadi `hidden` atau `removed` untuk moderasi.
- Data tidak langsung dihapus dari database pada MVP agar audit tetap tersedia.
- Penghapusan permanen, retention policy, dan cleanup Storage ditentukan pada dokumen Security/Deployment.

---

## 20. MVP Decisions and Deferred Data

Tidak dibuat pada MVP:

- chat atau komentar,
- notification document,
- report draft persistence,
- duplicate report entity khusus,
- clustering laporan,
- analytics event warehouse,
- government integration,
- public API,
- full audit log untuk setiap field change.

Kebutuhan tersebut dapat ditambahkan setelah core workflow stabil tanpa mengubah entity utama `users` dan `reports` secara drastis.

---

## 21. Database Definition of Done

Database MVP dianggap siap apabila:

- user profile dibuat setelah register,
- role tersimpan dan tidak dapat diubah user biasa,
- user dapat membuat report dengan photo dan coordinate valid,
- AI result dan user-reviewed result tersimpan terpisah,
- report muncul pada public map sesuai visibility,
- user hanya dapat melihat laporan miliknya pada My Reports,
- setiap user hanya memiliki satu verification per report,
- verification summary dihitung ulang dengan benar,
- priority score dihitung dengan formula versi yang tercatat,
- status dan status history selalu konsisten,
- admin dapat melakukan review dan status update,
- data sensitif tidak tampil pada public response,
- retry submit tidak menghasilkan duplicate report,
- security rules diuji untuk guest, user, owner, dan admin.

---

## 22. Implementation Order

Urutan implementasi database yang disarankan:

1. Firebase Authentication dan `/users`.
2. Firebase Storage upload dan photo metadata.
3. `/reports` dengan location, damage, AI, dan status.
4. `statusHistory` untuk timeline.
5. `verifications` dan aggregate summary.
6. Priority calculation server-side.
7. Firestore security rules.
8. Composite indexes berdasarkan query yang sudah digunakan.
9. Seed data development dan test data.

Dokumen ini menjadi acuan database sebelum pembuatan API, AI system, architecture, dan kode aplikasi.
