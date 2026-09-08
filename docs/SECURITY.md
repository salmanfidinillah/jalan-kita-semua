# JALANIN - Security Specification

> **JALANIN - Jalan Aman, Kota Nyaman.**

Dokumen ini mendefinisikan kontrol keamanan dan privasi JALANIN MVP V1.

**Security posture:** secure-by-default MVP  
**Primary services:** Firebase Authentication, Firestore, Storage, server-side AI  
**Status:** Product Definition

---

## 1. Security Principles

- Deny by default.
- Authorization dilakukan di server dan database rules.
- Least privilege untuk user, admin, service account, dan storage.
- Credential tidak pernah disimpan di client atau Firestore.
- Data publik dipisahkan dari data personal.
- Semua input dari client dianggap tidak terpercaya.
- Audit penting disimpan tanpa mengumpulkan data berlebihan.

---

## 2. Threat Model

Risiko utama:

| Threat | Impact | Control |
|---|---|---|
| User mengubah role menjadi admin | Critical | Server-managed role, rules, custom claims |
| User membaca report private | High | Firestore rules dan server authorization |
| Spam report | Medium | Auth requirement, rate limit, moderation |
| Duplicate submit | Medium | Idempotency key |
| Malicious file upload | High | MIME/size validation, Storage rules, processing |
| AI key exposure | Critical | Server-only secret |
| Manipulated priority | High | Server-side calculation |
| Duplicate/spam verification | Medium | UID document ID, transaction, rate limit |
| XSS melalui description | High | Output escaping, sanitization |
| Location privacy leak | Medium | Public fields minimal, privacy policy |
| Admin account takeover | Critical | Strong auth, MFA when available |

---

## 3. Authentication

- Firebase Authentication menangani password dan session.
- Password tidak pernah masuk Firestore.
- Email verification dapat diwajibkan sebelum report dibuat jika product memerlukannya.
- Session persistence mengikuti kebutuhan device.
- Logout membersihkan session client.
- Admin account harus memakai password kuat dan MFA bila tersedia.
- Login error tidak boleh mengungkap apakah email tertentu terdaftar bila itu meningkatkan enumeration risk.

---

## 4. Authorization

### Guest

- Read public reports.
- Read public status history.
- Tidak dapat write.

### User

- Read public data.
- Read dan update profile sendiri pada field yang diizinkan.
- Create report sebagai dirinya sendiri.
- Read report sendiri.
- Create/update verification sendiri.
- Tidak dapat mengubah role, status, priority, aggregate, atau history.

### Admin

- Read report untuk moderasi.
- Update status dan visibility melalui server operation.
- Update risk factor melalui server operation.
- Read moderation-relevant data.
- Tidak boleh berbagi credential admin.

Authorization wajib ditegakkan di:

```text
UI guard
API/server check
Firestore Security Rules
Storage Rules
```

UI guard hanya pengalaman, bukan security boundary.

---

## 5. Firestore Security Rules Intent

Rules harus memastikan:

- public hanya membaca report `visibility=public`,
- user hanya membuat report dengan `reporterId == request.auth.uid`,
- user tidak dapat mengubah immutable fields setelah submit,
- user hanya mengakses verification document dengan ID UID sendiri,
- user tidak memalsukan aggregate atau priority,
- hanya admin/server yang dapat mengubah status dan history,
- user profile hanya dapat diubah pada field yang diizinkan.

Privileged operation dapat dilakukan melalui server Admin SDK, tetapi server tetap wajib melakukan authorization dan validation karena Admin SDK melewati Firestore Rules.

---

## 6. Storage Security

Path canonical:

```text
reports/{userId}/{reportId}/{filename}
```

Rules:

- user hanya upload ke path miliknya,
- file hanya image,
- ukuran dibatasi,
- user tidak boleh menulis file ke path user lain,
- public download hanya untuk report public melalui mekanisme yang dipilih,
- file hidden/removed tidak ditampilkan oleh API publik,
- orphan file dibersihkan berkala,
- filename tidak boleh menjadi input path mentah.

Validasi MIME dilakukan pada client, server, dan Storage metadata. Client validation saja tidak cukup.

---

## 7. Input Security

Input yang harus divalidasi:

- display name,
- description,
- enum damage/severity/status,
- coordinates,
- image type and size,
- pagination and filter values,
- risk factor,
- admin note.

Output user-generated text selalu di-escape/sanitize sebelum render. Jangan render HTML dari description tanpa sanitizer yang tepat.

---

## 8. API Security

- HTTPS pada seluruh environment non-local.
- Validate Firebase ID token.
- Rate limit endpoint publik, AI, submit, dan verification.
- CSRF protection bila menggunakan cookie session.
- CORS dibatasi pada origin aplikasi.
- Request body memiliki size limit.
- Error response tidak membocorkan stack trace, provider secret, atau path internal.
- Idempotency untuk operasi create.
- Server timeout untuk AI dan dependency eksternal.

---

## 9. Privacy

Data personal minimum:

```text
displayName
email untuk authentication/profile
optional photoUrl
```

Public tidak melihat email atau credential reporter. Lokasi report dianggap data yang berpotensi sensitif dan hanya dibagikan karena merupakan inti product; jangan menyimpan data lokasi background atau lokasi rumah.

User-facing privacy notice harus menjelaskan:

- data apa yang dikumpulkan,
- mengapa foto dan coordinate diperlukan,
- siapa yang dapat melihat report publik,
- bagaimana report disembunyikan/dimoderasi,
- bagaimana user meminta bantuan atau penghapusan akun.

---

## 10. AI Security and Privacy

- AI credential server-only.
- Kirim hanya foto dan konteks minimum.
- Jangan kirim email, UID, atau profile ke model.
- Raw provider errors tidak ditampilkan.
- Jangan menganggap AI output sebagai fact tanpa review.
- Simpan model/prompt version untuk audit kualitas.
- Tetapkan retention untuk input dan result AI.

---

## 11. Admin Security

- Admin role tidak dapat dipilih dari register.
- Promosi role dilakukan manual melalui trusted process.
- Admin actions memakai audit history.
- Admin UI protected di server route dan API.
- Batasi jumlah admin aktif.
- Review login dan action failures.
- MFA menjadi target sebelum production yang lebih luas.

---

## 12. Abuse and Moderation

MVP minimal harus memiliki:

- `visibility=hidden/removed`,
- admin review,
- report photo validation,
- rate limit,
- duplicate submit protection,
- clear abuse contact path.

Content moderation otomatis bukan scope MVP. Namun admin harus dapat menyembunyikan report yang melanggar aturan tanpa menghapus audit data langsung.

---

## 13. Secrets and Environments

Pisahkan secret untuk:

```text
development
staging
production
```

Secret disimpan pada secret manager/platform environment variables. Jangan commit `.env`, service account JSON, token, atau API key.

Repository harus memiliki `.env.example` tanpa nilai secret ketika implementasi dimulai.

---

## 14. Security Testing

Test minimal:

- guest cannot create report,
- user cannot read another user's private data,
- user cannot become admin,
- user cannot change report status,
- user cannot alter priority aggregate,
- user cannot write to another user's Storage path,
- duplicate verification remains one document,
- malformed coordinates and enums are rejected,
- oversized/non-image file is rejected,
- unauthenticated admin endpoint is rejected,
- XSS payload is escaped,
- repeated submit does not duplicate report.

---

## 15. Incident Response

Jika credential atau data sensitif bocor:

1. Revoke/rotate secret.
2. Disable affected account/service.
3. Review logs dan scope akses.
4. Patch rules atau endpoint.
5. Restore data bila perlu.
6. Catat incident dan tindakan perbaikan.

Jangan menghapus evidence incident sebelum investigasi selesai.

---

## 16. Security Definition of Done

- Auth dan role check berjalan server-side.
- Firestore dan Storage Rules diuji.
- Secret tidak berada di repository/client.
- Public response tidak berisi data sensitif.
- File upload memiliki validation berlapis.
- Admin action dan status change tercatat.
- Rate limit tersedia pada endpoint berisiko.
- Security test utama lulus sebelum deployment production.
