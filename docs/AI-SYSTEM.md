# JALANIN - AI System Specification

> **JALANIN - Jalan Aman, Kota Nyaman.**

Dokumen ini mendefinisikan peran AI vision dalam workflow JALANIN MVP V1. AI membantu memahami bukti foto, tetapi tidak menjadi keputusan final tanpa review user dan sinyal komunitas.

**AI provider:** Gemini API / Vertex AI  
**Mode:** Server-side only  
**Status:** Product Definition

---

## 1. AI Product Role

AI digunakan untuk mempercepat dan menstrukturkan analisis foto jalan:

- mengklasifikasikan jenis kerusakan,
- memperkirakan severity,
- memberi confidence,
- dan menghasilkan deskripsi singkat.

AI tidak digunakan untuk:

- mengidentifikasi orang,
- membaca plat nomor,
- menentukan tindakan hukum,
- mengklaim bahwa jalan pasti aman,
- menggantikan keputusan admin,
- atau menjadi chatbot pada MVP.

Core principle:

```text
AI suggestion -> User review -> Final report -> Community signal -> Admin decision
```

---

## 2. Input Contract

Input utama adalah satu foto kondisi jalan dari Firebase Storage.

Input tambahan:

```json
{
  "locationContext": "optional location label",
  "requestedOutput": "road damage classification"
}
```

AI tidak perlu menerima identitas reporter. Coordinate tidak perlu dikirim ke model kecuali dibutuhkan untuk konteks risiko pada versi berikutnya.

### Image Preconditions

- MIME type image.
- Ukuran file sesuai batas aplikasi.
- File dapat dibaca.
- Foto menampilkan permukaan jalan dengan cukup jelas.
- Foto tidak diproses ulang jika upload reference tidak dimiliki current user.

---

## 3. Output Contract

AI harus menghasilkan JSON yang divalidasi server-side.

```json
{
  "damage_type": "POTHOLE",
  "severity": "HIGH",
  "confidence": 0.94,
  "description": "Large pothole affecting the road surface.",
  "observations": [
    "Visible depression on the road surface"
  ]
}
```

### Allowed Values

```text
damage_type:
POTHOLE
CRACK
BROKEN_SURFACE
FLOODING
ROAD_OBSTRUCTION
OTHER

severity:
LOW
MEDIUM
HIGH
```

### Output Rules

- `confidence` berada di antara `0` dan `1`.
- `description` maksimal 500 karakter.
- `observations` maksimal 5 item.
- Jika foto tidak cukup jelas, `damage_type=OTHER` dan confidence rendah, bukan hasil yang dibuat-buat.
- Extra field diabaikan atau ditolak sesuai validator.
- Output bebas tidak boleh langsung ditampilkan sebagai data final tanpa mapping enum.

---

## 4. Processing Pipeline

```text
User selects photo
        ↓
Client validates file
        ↓
Upload to Storage
        ↓
Server creates analysis request
        ↓
AI provider receives image
        ↓
Response schema validation
        ↓
Save AI snapshot
        ↓
User reviews result
        ↓
Save final report values
```

### Analysis States

```text
PENDING
PROCESSING
COMPLETED
FAILED
```

Setiap request memiliki `analysisId`, `reportId`, `userId`, `model`, `startedAt`, `completedAt`, dan `errorCode` bila gagal.

---

## 5. Prompt Behavior

Prompt harus mengarahkan model untuk:

1. Fokus pada kondisi permukaan jalan.
2. Memilih satu damage type utama.
3. Memilih severity berdasarkan dampak yang terlihat.
4. Memberikan confidence konservatif.
5. Menjelaskan evidence visual secara singkat.
6. Mengembalikan JSON saja.
7. Mengakui ketidakpastian jika foto blur, gelap, terlalu jauh, atau bukan jalan.

Prompt tidak boleh meminta model memberikan keputusan penanganan, data pribadi, atau klaim di luar evidence visual.

Prompt version wajib disimpan pada analysis record agar hasil dapat dievaluasi ketika prompt berubah.

---

## 6. Human in the Loop

User melihat:

- damage type AI,
- severity AI,
- confidence,
- description.

User dapat mengubah:

- damage type,
- severity,
- description.

Sistem menyimpan:

```text
aiAnalysis = output asli model
 damage = nilai final setelah user review
userReview = bukti proses review
```

AI confidence ditampilkan sebagai informasi, bukan jaminan akurasi.

---

## 7. Confidence Interpretation

Confidence model tidak boleh dipresentasikan sebagai kebenaran absolut.

Tampilan yang disarankan:

```text
AI confidence: 94%
Review hasil ini sebelum mengirim laporan.
```

MVP tidak menetapkan hard threshold yang otomatis menolak report. Namun hasil dengan confidence rendah dapat diberi warning:

```text
Foto belum cukup jelas untuk dianalisis dengan yakin.
Periksa hasil AI sebelum melanjutkan.
```

---

## 8. Failure and Recovery

### Invalid Image

- Tolak sebelum memanggil AI.
- Minta user memilih file lain.

### Timeout

- Mark analysis `FAILED`.
- Tampilkan retry.
- Jangan membuat data final palsu.

### Provider Error

- Simpan error internal tanpa secret.
- Tampilkan pesan yang dapat dimengerti user.
- Log request ID untuk debugging.

### Invalid Model Response

- Jangan menyimpan sebagai final analysis.
- Coba satu normalisasi/repair terkontrol bila aman.
- Jika tetap invalid, return error dan minta retry.

### Rate Limit

- Tampilkan bahwa layanan sedang sibuk.
- Terapkan retry dengan batas.
- Jangan membuat loop retry tanpa batas.

---

## 9. Safety and Privacy

- Secret AI hanya berada di server environment.
- Foto hanya diakses untuk analysis yang authorized.
- Jangan mengirim email, UID, atau profile data ke model.
- Jangan menyimpan prompt yang mengandung credential.
- Jangan menampilkan raw provider error kepada user.
- Review log agar URL Storage sensitif tidak tersebar.
- Tetapkan retention policy untuk input/output AI pada dokumen Security dan Deployment.

---

## 10. Evaluation Plan

Sebelum release MVP, siapkan dataset evaluasi kecil yang berisi contoh lokal:

- pothole,
- crack,
- broken surface,
- flooding,
- obstruction,
- non-road atau foto tidak jelas.

Evaluasi minimal:

| Metric | Purpose |
|---|---|
| Damage type accuracy | Apakah kategori utama tepat |
| Severity agreement | Apakah level masuk akal |
| Invalid response rate | Apakah schema stabil |
| User correction rate | Seberapa sering user mengubah AI |
| Analysis success rate | Reliabilitas pipeline |
| Median analysis time | Pengalaman user |

Data evaluasi tidak boleh menggunakan foto pribadi tanpa izin.

---

## 11. AI Definition of Done

- AI dipanggil server-side.
- Output tervalidasi dengan schema.
- Enum output cocok dengan database.
- Hasil AI disimpan terpisah dari final user result.
- User dapat mengoreksi hasil.
- Error memiliki retry yang jelas.
- Tidak ada fake result ketika provider gagal.
- Prompt dan model version tercatat.
- Success rate dan correction rate dapat diukur.
- API key dan data pribadi tidak masuk ke client/log publik.
