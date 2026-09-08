# JALANIN - UI/UX Specification

> **JALANIN - Jalan Aman, Kota Nyaman.**

Dokumen ini mendefinisikan arah visual dan pengalaman penggunaan JALANIN MVP V1. Tujuan utamanya adalah membuat aplikasi pelaporan jalan yang terasa seperti layanan publik modern: jelas, tenang, mudah dipindai, dan tidak terlihat seperti template AI.

**Design direction:** Civic Utility / Street Atlas  
**Audience:** masyarakat umum, reporter aktif, dan admin operasional  
**Status:** Product Definition

---

## 1. Design Research Summary

Arah ini dirumuskan dari pola design system layanan publik seperti GOV.UK Design System dan U.S. Web Design System:

- task utama harus terlihat sejak awal,
- form memakai label dan instruksi yang jelas,
- feedback error berada dekat dengan sumber masalah,
- status tidak bergantung pada warna saja,
- layout responsive dan accessible,
- komponen konsisten lebih penting daripada dekorasi.

Referensi:

- [GOV.UK Design System](https://design-system.service.gov.uk/)
- [U.S. Web Design System](https://designsystem.digital.gov/)
- [W3C Web Accessibility Initiative](https://www.w3.org/WAI/)

---

## 2. Product Feel

JALANIN harus terasa:

```text
jelas
tepercaya
lokal
praktis
hangat secukupnya
```

JALANIN tidak boleh terasa:

```text
seperti dashboard enterprise yang dingin
seperti landing page startup AI
penuh glassmorphism
penuh gradient neon
penuh card bertumpuk
```

Arah visual: peta, bukti foto, status, dan tindakan menjadi pusat perhatian. Dekorasi hanya membantu orientasi.

---

## 3. Typography

### Primary Font

Gunakan **Public Sans** sebagai font utama. Public Sans adalah sans humanist yang terbaca untuk label, angka, form, peta, dan status. Karakternya lebih civic dan utilitarian daripada font startup yang terlalu geometris.

### Supporting Font

Gunakan **Source Serif 4** hanya untuk quote pendek, statement brand, atau section pembuka yang membutuhkan nada editorial. Jangan memakai serif untuk form, tabel, map control, atau admin workflow.

### Typography Rules

- H1 landing: 44-64px desktop, 36-44px mobile.
- Page heading: 32-40px desktop, 28-32px mobile.
- Section heading: 22-28px.
- Body: 16-18px dengan line-height sekitar 1.5.
- Form label: 14-16px, jelas dan selalu terlihat.
- Data label: 12-14px.
- Hindari uppercase untuk paragraf.
- Letter spacing default 0.
- Jangan menggunakan font size berbasis viewport.

---

## 4. Color Direction

Palette bukan dark mode dan bukan purple-on-white.

```text
--ink: #172026
--muted-ink: #5B6468
--paper: #F6F4EF
--surface: #FFFFFF
--line: #D9D6CE
--road-blue: #2D6871
--signal-orange: #D66A3D
--leaf-green: #3E7854
--warning-yellow: #D3A62A
--danger-red: #B8493F
```

### Usage

- `ink`: text utama.
- `paper`: background utama yang hangat namun tetap netral.
- `road-blue`: link, primary action sekunder, map context.
- `signal-orange`: CTA utama dan high-priority signal.
- `leaf-green`: resolved/success.
- `warning-yellow`: medium priority dan warning.
- `danger-red`: destructive action atau error.

Warna selalu didampingi label, icon, atau pattern. Jangan menyampaikan status hanya lewat warna.

---

## 5. Layout Principles

- Public homepage memakai full-width bands dengan content container, bukan kumpulan card besar.
- Public map menjadi elemen nyata, bukan placeholder kecil.
- Dashboard memakai sidebar atau top navigation yang stabil.
- Card hanya untuk report item, stat ringkas, modal, dan tool yang memang perlu dibingkai.
- Jangan menaruh card di dalam card.
- Spacing memakai skala konsisten 4, 8, 12, 16, 24, 32, 48, 64.
- Desktop content max width sekitar 1200-1280px.
- Mobile memakai padding 16-20px.
- Tombol dan input memiliki tinggi stabil minimal 44px.

---

## 6. Navigation Model

### Guest

```text
Logo | Peta | Laporan Terbaru | Tentang | Masuk | Laporkan
```

`Laporkan` untuk guest mengarah ke login/register.

### User

```text
Logo | Peta | Buat Laporan | Laporan Saya | Profil
```

### Admin

```text
Logo | Ringkasan | Semua Laporan | Prioritas Tinggi | Pengaturan
```

Navigation tidak boleh berubah posisi secara drastis antara route yang berdekatan.

---

## 7. Public Home

First viewport harus langsung menjawab:

```text
Apa itu JALANIN?
Apa tindakan utama saya?
Di mana kondisi jalan dapat dilihat?
```

Struktur:

1. Header sederhana.
2. Hero dengan headline product, copy singkat, dan CTA `Lihat Peta` / `Buat Laporan`.
3. Preview peta yang benar-benar dapat dibuka.
4. Cara kerja tiga langkah: Laporkan, Periksa, Pantau.
5. Laporan terbaru.
6. Statistik ringkas.
7. Footer.

Jangan membuat hero yang hanya menjual fitur AI. Nilai utama adalah informasi jalan yang dapat dipercaya dan ditindaklanjuti.

---

## 8. Public Map

Map adalah tool utama, bukan dekorasi.

Komponen:

- search lokasi,
- filter status/severity/type,
- marker dengan bentuk dan warna,
- legend,
- selected report preview,
- tombol kembali ke lokasi pengguna bila permission tersedia.

Marker minimum memakai warna plus bentuk/label:

```text
HIGH       circle + label HIGH
MEDIUM     circle + label MEDIUM
LOW        circle + label LOW
RESOLVED   check marker + label RESOLVED
```

Pada mobile, map menjadi layar penuh dengan bottom sheet report preview. Pada desktop, panel detail dapat berada di samping map tanpa menutupi kontrol utama.

---

## 9. Create Report Experience

Create report harus terasa seperti satu tugas pendek, bukan form panjang.

### Stepper

```text
1 Foto
2 Lokasi
3 Periksa AI
4 Kirim
```

Setiap step menampilkan:

- judul yang konkret,
- alasan singkat jika dibutuhkan,
- satu primary action,
- progress yang jelas,
- tombol back tanpa kehilangan input.

### Photo

- Camera/upload control besar dan mudah dipahami.
- Preview langsung.
- Error dekat dengan control.
- Beri contoh kualitas foto secara singkat, bukan paragraf panjang.

### Location

- Tampilkan permission explanation sebelum browser prompt.
- Preview coordinate pada map mini.
- Beri fallback retry jika permission ditolak.

### AI Review

- Tampilkan hasil AI sebagai suggestion.
- Gunakan select untuk damage type dan severity.
- Tampilkan confidence sebagai informasi.
- Beri kalimat tegas: `Periksa hasil sebelum mengirim.`
- Jangan membuat AI result terlihat seperti keputusan final.

### Submit

Ringkasan final harus terlihat sebelum submit:

```text
Foto
Lokasi
Jenis kerusakan
Severity
Deskripsi
```

---

## 10. Report Detail

Report detail memiliki hierarchy:

1. Status dan priority.
2. Foto bukti.
3. Jenis kerusakan dan severity.
4. Lokasi.
5. Community verification.
6. Timeline.
7. Metadata waktu.

Primary action user login:

```text
Apakah kerusakan ini masih ada?
[Masih ada] [Sudah diperbaiki]
```

Verification summary menampilkan count dan confidence dengan copy yang tidak berlebihan.

---

## 11. Status Language

Gunakan label yang konsisten:

```text
Dilaporkan
Terverifikasi
Sedang ditangani
Selesai
```

Database enum tetap uppercase dalam data; UI menerjemahkan ke bahasa manusia.

Setiap status tampil dengan:

- label,
- icon,
- warna,
- dan penjelasan singkat jika konteksnya tidak jelas.

---

## 12. User Dashboard

Dashboard bukan halaman statistik yang ramai. Prioritaskan tindakan:

```text
Buat laporan
Laporan terakhir
Status laporan saya
Kontribusi verifikasi
```

Empty state harus mengarahkan user ke tindakan berikutnya. Gunakan tabel/list yang mudah dipindai untuk My Reports, bukan grid card yang terlalu dekoratif.

---

## 13. Admin Dashboard

Admin membutuhkan kepadatan informasi yang teratur:

- summary cards tipis dan ringkas,
- filter bar,
- table/list report,
- priority score yang mudah dibandingkan,
- detail review dengan evidence di satu tempat.

Admin UI boleh lebih dense daripada public UI, tetapi tetap memiliki whitespace dan hierarchy. Hindari chart dekoratif yang tidak mengubah keputusan.

---

## 14. Components

Komponen inti:

```text
Button
LinkButton
TextInput
Select
FilePicker
LocationPicker
Map
MapMarker
StatusBadge
PriorityBadge
ReportCard
ReportTable
ReportTimeline
VerificationControl
Toast
InlineError
EmptyState
Dialog
Skeleton
```

Gunakan icon library yang sudah tersedia. Icon button wajib memiliki accessible label dan tooltip untuk icon yang tidak familiar.

---

## 15. Accessibility

- Semua input memiliki label nyata.
- Focus state terlihat.
- Keyboard dapat mencapai semua action.
- Contrast memenuhi WCAG AA sebagai target minimum.
- Status tidak disampaikan lewat warna saja.
- Error dibaca screen reader dan dikaitkan dengan field.
- Map memiliki fallback list laporan.
- Foto memiliki alt text yang bermakna.
- Motion dapat dikurangi melalui prefers-reduced-motion.
- Target sentuh minimal 44x44px.

---

## 16. Responsive Behavior

### Mobile

- Bottom navigation atau compact header.
- Single-column create flow.
- Map dan report preview memakai bottom sheet.
- Table admin berubah menjadi stacked list atau horizontal scroll yang terkontrol.
- Primary action tetap mudah dijangkau ibu jari.

### Desktop

- Map dan detail dapat side-by-side.
- Form memiliki max width yang nyaman dibaca.
- Admin table memanfaatkan lebar layar.
- Hero tetap menyisakan glimpse section berikutnya.

---

## 17. Motion

Motion hanya untuk orientasi:

- page content fade/slide pendek saat load,
- step transition pada create report,
- marker selection,
- progress upload/analysis.

Hindari animasi looping, parallax berat, dan motion yang membuat data sulit dibaca.

---

## 18. UI Definition of Done

- User memahami CTA utama tanpa membaca panjang.
- Create report dapat diselesaikan di mobile.
- Loading, empty, success, dan error tersedia.
- Public map tetap berguna tanpa login.
- Admin dapat membandingkan report berdasarkan priority dan status.
- Tidak ada informasi penting yang hanya dibedakan lewat warna.
- Typography, spacing, button, dan status konsisten antar halaman.
- Visual terasa civic, modern, bersih, dan tidak seperti template AI.
