import Link from "next/link";
import { LandingDataProvider, LandingImpact, LandingLatestReports, LandingMapPreview } from "@/components/landing/landing-community-data";
import { SiteHeader } from "@/components/landing/site-header";

function BrandMap() {
  return <div className="landing-map-background" aria-hidden="true"><div className="landing-world-map map-a" /><div className="landing-world-map map-b" /><div className="landing-world-map map-c" /><svg className="landing-network-line" viewBox="0 0 700 360" preserveAspectRatio="none"><path d="M20 92c120-90 155 58 275-4s175-74 385 80" /><path d="M120 318c105-108 180-37 252-130s163-65 284-136" /></svg><span className="landing-map-dot dot-a" /><span className="landing-map-dot dot-b" /><span className="landing-map-dot dot-c" /><span className="landing-map-dot dot-d" /></div>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="landing-eyebrow"><span />{children}</p>;
}

export default function Home() {
  return <LandingDataProvider><div className="landing-page">
    <BrandMap />
    <SiteHeader />
    <main>
      <section className="landing-wrap landing-hero">
        <div className="landing-hero-copy landing-reveal"><Eyebrow>Jalan aman, kota nyaman</Eyebrow><h1>Jalan yang lebih baik<br />dimulai dari <em>kepedulian kita.</em></h1><p className="landing-hero-intro">Laporkan kerusakan jalan di sekitar Anda, lihat kondisi jalan, dan ikut mengawal perbaikannya secara terbuka.</p><div className="landing-hero-actions"><Link href="/reports/new" className="landing-button landing-button-accent">Buat laporan <span aria-hidden="true">↗</span></Link><Link href="/map" className="landing-text-link">Jelajahi peta <span aria-hidden="true">↗</span></Link></div><div className="landing-proof"><span className="landing-proof-avatars"><i /><i /><i /></span><span>Dipantau bersama oleh warga</span><b>01</b></div></div>
        <div className="landing-hero-visual landing-reveal landing-reveal-delay"><div className="landing-visual-caption"><span>FIELD NOTE / 01</span><i /> Kondisi nyata di sekitar kita</div><div className="landing-road-image" /><div className="landing-road-image-small" /><span className="landing-hero-pin pin-one" /><span className="landing-hero-pin pin-two" /><span className="landing-route route-one" /><span className="landing-route route-two" /><div className="landing-report-card"><div className="landing-report-card-top"><span className="landing-status-dot high" />Laporan terbaru</div><strong>Jalan rusak</strong><span className="landing-report-location">⌖ Sukoharjo, Jawa Tengah</span><span className="landing-report-status">Menunggu penanganan <b aria-hidden="true">↗</b></span></div><div className="landing-coordinate"><span>−7° 40&apos; 23.1&quot;</span><span>110° 50&apos; 09.5&quot;</span></div></div>
      </section>

      <LandingImpact />

      <section id="cara-kerja" className="landing-wrap landing-process"><div className="landing-section-heading"><div><Eyebrow>Cara kerja JALANIN</Eyebrow><h2>Semudah melihat,<br /><em>melaporkan, dan mengawal.</em></h2></div><p>Setiap laporan melewati proses yang jelas agar informasi jalan dapat dipercaya dan ditindaklanjuti.</p></div><div className="landing-process-line">{[{ number: "01", title: "TEMUKAN", text: "Temukan jalan yang mengalami kerusakan.", icon: "⌖" }, { number: "02", title: "LAPORKAN", text: "Kirim foto, lokasi, dan kondisi jalan.", icon: "↗" }, { number: "03", title: "PANTAU", text: "Ikuti perkembangan laporan sampai ditindaklanjuti.", icon: "◌" }].map((step) => <article key={step.number}><span className="landing-step-number">{step.number}</span><span className="landing-step-icon">{step.icon}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div></section>

      <section id="tentang" className="landing-wrap landing-features"><div className="landing-feature-intro"><Eyebrow>Semua yang dibutuhkan</Eyebrow><h2>Semua yang kamu<br /><em>butuhkan untuk<br />melaporkan jalan.</em></h2><Link href="/reports/new" className="landing-text-link">Mulai dari sekarang <span aria-hidden="true">↗</span></Link></div><div className="landing-feature-list">{[{ icon: "⌖", title: "Lokasi akurat", text: "Tandai titik kerusakan dengan lokasi yang mudah ditemukan." }, { icon: "▧", title: "Foto & bukti", text: "Lengkapi laporan dengan kondisi nyata di lapangan." }, { icon: "◷", title: "Status laporan", text: "Pantau setiap tahap, dari dikirim sampai ditangani." }, { icon: "⌁", title: "Peta kondisi", text: "Lihat masalah jalan yang sedang terjadi di sekitarmu." }].map((feature) => <article key={feature.title}><span className="landing-feature-icon">{feature.icon}</span><div><h3>{feature.title}</h3><p>{feature.text}</p></div><span className="landing-feature-arrow" aria-hidden="true">↗</span></article>)}</div></section>

      <section className="landing-wrap landing-map-section"><div className="landing-map-copy"><Eyebrow>Eksplorasi kondisi jalan</Eyebrow><h2>Lihat kondisi jalan<br /><em>di sekitar kamu.</em></h2><p>Peta publik JALANIN menghubungkan laporan warga dengan lokasi nyata, sehingga kamu tahu apa yang perlu diperhatikan.</p><Link href="/map" className="landing-button landing-button-dark">Buka peta kondisi <span aria-hidden="true">↗</span></Link></div><LandingMapPreview /></section>

      <section className="landing-wrap landing-story"><div className="landing-story-image"><div className="landing-story-photo" /><span className="landing-story-stamp">Untuk<br /><b>kota kita</b></span><span className="landing-story-note">STORY / 02</span></div><div className="landing-story-copy"><Eyebrow>Mengapa JALANIN</Eyebrow><h2>Satu laporan kecil<br /><em>bisa membawa<br />perubahan besar.</em></h2><p>Jalan yang aman bukan hanya soal aspal. Ia adalah akses menuju sekolah, pekerjaan, keluarga, dan kesempatan. Dengan berbagi informasi, kita membantu kota mengambil keputusan yang lebih baik.</p><Link href="/map" className="landing-text-link">Kenapa JALANIN? <span aria-hidden="true">↗</span></Link></div></section>

      <section id="laporan" className="landing-wrap landing-latest"><div className="landing-section-heading"><div><Eyebrow>Dari komunitas</Eyebrow><h2>Laporan terbaru<br /><em>di sekitar kita.</em></h2></div><Link href="/map" className="landing-text-link">Buka semua laporan <span aria-hidden="true">↗</span></Link></div><LandingLatestReports /></section>

      <section className="landing-wrap landing-final-cta"><div><Eyebrow>Mulai dari sekitarmu</Eyebrow><h2>Melihat jalan rusak?</h2><p>Jangan hanya melewatinya. Laporkan dan bantu wujudkan jalan yang lebih baik.</p></div><Link href="/reports/new" className="landing-button landing-button-light">Laporkan jalan rusak <span aria-hidden="true">↗</span></Link><div className="landing-cta-map" aria-hidden="true" /></section>
    </main>

    <footer className="landing-footer"><div className="landing-wrap landing-footer-inner"><div className="landing-footer-brand"><Link href="/" className="landing-brand landing-brand-light"><span className="landing-brand-mark" aria-hidden="true"><span /></span><span>JALANIN</span></Link><p>Lapor jalan rusak,<br /><em>wujudkan perubahan.</em></p></div><div className="landing-footer-column"><b>Jelajahi</b><Link href="/map">Peta kondisi</Link><a href="#cara-kerja">Cara kerja</a><a href="#laporan">Laporan terbaru</a></div><div className="landing-footer-column"><b>Partisipasi</b><Link href="/reports/new">Buat laporan</Link><Link href="/login">Masuk</Link><Link href="/register">Daftar</Link></div><div className="landing-footer-column"><b>Bantuan</b><a href="mailto:halo@jalanin.id">Kontak</a><a href="#tentang">Tentang JALANIN</a><a href="/docs/SECURITY.md">Kebijakan privasi</a></div></div><div className="landing-wrap landing-footer-bottom"><span>© 2026 JALANIN</span><span>Jalan Aman, Kota Nyaman.</span><span className="landing-footer-status"><span /> Sistem publik aktif</span></div></footer>
  </div></LandingDataProvider>;
}
