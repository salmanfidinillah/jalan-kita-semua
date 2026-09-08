# JALANIN - Deployment Specification

> **JALANIN - Jalan Aman, Kota Nyaman.**

Dokumen ini mendefinisikan environment, release flow, configuration, monitoring, backup, dan rollback JALANIN MVP V1.

**Target hosting:** Vercel atau equivalent Next.js hosting  
**Managed services:** Firebase, AI provider, map provider  
**Status:** Product Definition

---

## 1. Deployment Principles

- Development, staging, dan production terpisah.
- Tidak ada deploy production langsung dari laptop tanpa review.
- Secret dikelola oleh platform environment, bukan repository.
- Database rules dan index ikut version control.
- Release kecil lebih mudah di-rollback.
- Deployment harus dapat diulang oleh anggota tim lain.

---

## 2. Environments

| Environment | Purpose | Data |
|---|---|---|
| Development | Local feature work | Emulator atau test data |
| Staging | Integration and acceptance | Staging Firebase project |
| Production | Real user data | Production Firebase project |

Development tidak boleh memakai production write credential. Staging tidak boleh menampilkan data personal production.

---

## 3. Required Services

- Next.js hosting.
- Firebase Authentication.
- Cloud Firestore.
- Firebase Storage.
- Firebase Admin SDK untuk server operation.
- Gemini API / Vertex AI.
- Leaflet + OpenStreetMap atau Google Maps.
- Error/log monitoring.

Provider final dipilih berdasarkan cost, quota, legal, dan kebutuhan geospatial.

---

## 4. Build and Release Flow

```text
Feature branch
    ↓
Pull request
    ↓
Lint / typecheck / test / build
    ↓
Deploy preview
    ↓
Staging deployment
    ↓
Acceptance test
    ↓
Production approval
    ↓
Production deployment
    ↓
Smoke test
```

CI harus gagal jika build, typecheck, security rule test, atau required test gagal.

---

## 5. Environment Variables

Contoh nama configuration:

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
AI_PROVIDER_API_KEY
AI_MODEL_NAME
MAP_PROVIDER_KEY
NEXT_PUBLIC_APP_URL
```

Nilai server-only tidak boleh memakai prefix `NEXT_PUBLIC_`.

`.env.example` berisi nama variable tanpa secret. Production secret diatur melalui dashboard/secret manager hosting.

---

## 6. Firebase Deployment

Deploy versioned configuration:

```text
Firestore Security Rules
Firestore Indexes
Storage Rules
Authentication configuration
Cloud Functions/server handlers jika digunakan
```

Sebelum deploy production:

- review diff rules,
- test guest/user/admin access,
- deploy indexes yang dibutuhkan,
- verifikasi Storage path,
- pastikan Admin SDK memakai project yang benar.

---

## 7. Database Migration

MVP meminimalkan migration kompleks. Jika schema berubah:

1. Dokumentasikan perubahan.
2. Tentukan backward compatibility.
3. Update read path agar dapat membaca versi lama bila diperlukan.
4. Jalankan backfill pada staging.
5. Verifikasi count dan sample document.
6. Jalankan production backfill dengan monitoring.
7. Hapus legacy field hanya setelah semua reader berpindah.

Jangan mengubah enum/status secara langsung tanpa memetakan data existing.

---

## 8. Deployment Checklist

### Before Deploy

- [ ] Branch bersih dari secret.
- [ ] Lint/typecheck/test lulus.
- [ ] Build production lulus.
- [ ] Environment target sudah benar.
- [ ] Firestore/Storage rules direview.
- [ ] AI quota dan map quota tersedia.
- [ ] Migration/backfill plan siap bila ada.

### After Deploy

- [ ] Landing page terbuka.
- [ ] Register/login berhasil.
- [ ] Upload photo berhasil.
- [ ] GPS dan map berfungsi.
- [ ] AI analysis berhasil atau failure state jelas.
- [ ] Submit report berhasil.
- [ ] Public map menampilkan marker.
- [ ] Verification berhasil.
- [ ] Admin status update berhasil.
- [ ] Error monitoring menerima event test.

---

## 9. Smoke Test

Test production menggunakan account test yang terpisah:

```text
Guest -> open map -> open report
User -> login -> upload -> GPS -> AI -> submit
User 2 -> open report -> verify
Admin -> review -> update status
```

Setelah smoke test selesai, hapus atau tandai test data sesuai kebijakan environment.

---

## 10. Monitoring

Pantau minimal:

- deployment failure,
- HTTP 4xx/5xx,
- AI failure and latency,
- upload failure,
- Firestore permission denied,
- report submit failure,
- verification failure,
- quota usage,
- storage growth,
- authentication failure spike.

Alert severity:

```text
P0 - core workflow down or data exposure
P1 - major feature unavailable
P2 - degraded feature or elevated error
P3 - non-blocking issue
```

---

## 11. Backup and Recovery

- Aktifkan backup/export Firestore sesuai kemampuan project dan budget.
- Simpan rules, indexes, dan configuration di repository.
- Storage backup/retention ditentukan berdasarkan cost dan privacy.
- Uji restore pada staging, bukan hanya menganggap backup ada.
- Catat Recovery Point Objective dan Recovery Time Objective sebelum production luas.

Target MVP awal:

```text
RPO: sesuai kemampuan backup harian
RTO: same-day recovery untuk critical service
```

Target ini harus disesuaikan setelah mengetahui plan provider yang dipakai.

---

## 12. Rollback

### Application Rollback

- Roll back ke deployment hosting sebelumnya.
- Verifikasi environment variables tetap cocok.
- Jalankan smoke test.

### Database/Rules Rollback

- Rules dikembalikan ke version sebelumnya jika aman.
- Schema migration tidak di-rollback sembarangan; gunakan backward-compatible reader atau forward fix.
- Jangan menghapus data production untuk memperbaiki deploy aplikasi.

### AI Rollback

- Kembalikan model/prompt version sebelumnya.
- Simpan formula/prompt version pada result agar data lama tetap dapat dibaca.

---

## 13. Cost Controls

- Batasi ukuran dan jumlah upload.
- Batasi AI analysis per user/report.
- Gunakan thumbnail pada list/map.
- Gunakan pagination.
- Hindari Firestore listener realtime jika tidak diperlukan.
- Pantau map tile/geocoding quota.
- Set budget alert pada provider.
- Jangan mengaktifkan service mahal sebelum feature membutuhkannya.

---

## 14. Production Ownership

Sebelum launch, tetapkan owner untuk:

```text
Hosting
Firebase project
AI provider
Map provider
Security incident
Data backup
Admin account
```

Credential ownership tidak boleh bergantung pada satu personal account tanpa recovery path.

---

## 15. Deployment Definition of Done

- Tiga environment memiliki boundary jelas.
- Secret tersimpan di environment manager.
- CI memvalidasi build dan tests.
- Firebase rules/indexes ter-version.
- Smoke test terdokumentasi.
- Monitoring dan alert tersedia.
- Backup dan restore path diketahui.
- Rollback aplikasi dapat dilakukan.
- Cost/quota memiliki batas dan alert.
- Ada owner untuk operasi setelah launch.
