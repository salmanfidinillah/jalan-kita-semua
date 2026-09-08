import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden">
      <header className="mx-auto flex max-w-300 items-center justify-between px-5 py-5 lg:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label="JALANIN beranda">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-road-blue text-lg font-bold text-white">J</span>
          <span className="text-xl font-bold tracking-tight">JALANIN</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-muted-ink md:flex">
          <a href="#peta" className="transition-colors hover:text-ink">Peta kondisi</a>
          <a href="#cara-kerja" className="transition-colors hover:text-ink">Cara kerja</a>
          <a href="#laporan" className="transition-colors hover:text-ink">Laporan terbaru</a>
        </nav>
        <a href="#mulai" className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5">Masuk</a>
      </header>

      <main>
        <section className="mx-auto grid max-w-300 gap-12 px-5 pb-20 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10 lg:pb-28 lg:pt-20">
          <div>
            <p className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-signal-orange">
              <span className="h-2 w-2 rounded-full bg-signal-orange" />
              Pantau jalan di sekitarmu
            </p>
            <h1 className="max-w-190 text-5xl font-bold leading-[1.04] tracking-tight text-ink sm:text-6xl lg:text-7xl">Jalan aman,<br /><span className="text-road-blue">kota nyaman.</span></h1>
            <p className="mt-7 max-w-140 text-lg leading-8 text-muted-ink">Temukan kondisi jalan, laporkan kerusakan dengan mudah, dan bantu kota menentukan mana yang perlu ditangani lebih dulu.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#peta" className="inline-flex items-center justify-center gap-3 rounded-full bg-signal-orange px-6 py-4 font-bold text-white transition-transform hover:-translate-y-0.5">Lihat peta kondisi <span aria-hidden="true">-&gt;</span></a>
              <a href="#mulai" className="inline-flex items-center justify-center rounded-full border border-line bg-surface px-6 py-4 font-bold text-ink transition-colors hover:border-ink">Buat laporan</a>
            </div>
            <p className="mt-5 text-sm text-muted-ink">Gratis untuk digunakan. Data publik, proses transparan.</p>
          </div>

          <div id="peta" className="relative min-h-105 overflow-hidden rounded-[2rem] border border-line bg-[#d9e1d8] shadow-[0_24px_70px_rgba(23,32,38,0.12)]">
            <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "linear-gradient(28deg, transparent 46%, #f6f4ef 47%, #f6f4ef 51%, transparent 52%), linear-gradient(112deg, transparent 41%, #f6f4ef 42%, #f6f4ef 45%, transparent 46%), linear-gradient(165deg, transparent 57%, #c1d0c4 58%, #c1d0c4 60%, transparent 61%)", backgroundSize: "180px 150px, 210px 180px, 260px 210px" }} />
            <div className="absolute left-[23%] top-[27%] h-5 w-5 rounded-full border-4 border-white bg-danger-red shadow-lg" />
            <div className="absolute left-[61%] top-[45%] h-5 w-5 rounded-full border-4 border-white bg-warning-yellow shadow-lg" />
            <div className="absolute left-[43%] top-[69%] h-5 w-5 rounded-full border-4 border-white bg-signal-orange shadow-lg" />
            <div className="absolute right-5 top-5 rounded-xl bg-surface/95 px-4 py-3 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-muted-ink">Area terlihat</p><p className="mt-1 text-lg font-bold">Surabaya</p></div>
            <div className="absolute bottom-5 left-5 rounded-2xl bg-surface/95 p-4 shadow-sm"><p className="text-sm font-bold">128 laporan aktif</p><p className="mt-1 text-xs text-muted-ink">Diperbarui beberapa menit lalu</p></div>
          </div>
        </section>

        <section id="cara-kerja" className="border-y border-line bg-surface">
          <div className="mx-auto max-w-300 px-5 py-16 lg:px-10 lg:py-20"><div className="grid gap-10 md:grid-cols-3">
            {[['01', 'Laporkan', 'Ambil foto dan tandai lokasi jalan yang bermasalah.'], ['02', 'Periksa', 'AI membantu membaca kondisi, kamu tetap memegang keputusan.'], ['03', 'Pantau', 'Lihat verifikasi warga dan perkembangan penanganannya.']].map(([number, title, text]) => <article key={number} className="border-l-2 border-line pl-5"><p className="text-sm font-bold text-signal-orange">{number}</p><h2 className="mt-3 text-2xl font-bold">{title}</h2><p className="mt-3 max-w-70 leading-7 text-muted-ink">{text}</p></article>)}
          </div></div>
        </section>

        <section id="laporan" className="mx-auto max-w-300 px-5 py-16 lg:px-10 lg:py-24"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-road-blue">Dari komunitas</p><h2 className="mt-3 text-4xl font-bold tracking-tight">Laporan yang perlu kamu tahu.</h2></div><a href="#peta" className="font-bold text-road-blue">Buka semua laporan -&gt;</a></div><div className="mt-10 grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-line bg-surface p-5"><div className="mb-14 h-28 rounded-xl bg-[#d7dcd2]" /><p className="text-xs font-bold uppercase tracking-wider text-danger-red">Prioritas tinggi</p><h3 className="mt-2 text-xl font-bold">Lubang besar di badan jalan</h3><p className="mt-2 text-sm text-muted-ink">Jl. Darmo, Surabaya</p></div><div className="rounded-2xl border border-line bg-surface p-5"><div className="mb-14 h-28 rounded-xl bg-[#e2dfd1]" /><p className="text-xs font-bold uppercase tracking-wider text-warning-yellow">Perlu diperiksa</p><h3 className="mt-2 text-xl font-bold">Genangan setelah hujan</h3><p className="mt-2 text-sm text-muted-ink">Jl. Ketintang, Surabaya</p></div><div className="rounded-2xl border border-line bg-surface p-5"><div className="mb-14 h-28 rounded-xl bg-[#d4ddd8]" /><p className="text-xs font-bold uppercase tracking-wider text-leaf-green">Selesai</p><h3 className="mt-2 text-xl font-bold">Permukaan jalan retak</h3><p className="mt-2 text-sm text-muted-ink">Jl. Raya Gubeng, Surabaya</p></div></div></section>
      </main>

      <footer id="mulai" className="bg-ink text-white"><div className="mx-auto flex max-w-300 flex-col gap-8 px-5 py-12 sm:flex-row sm:items-end sm:justify-between lg:px-10"><div><p className="text-2xl font-bold">JALANIN</p><p className="mt-2 max-w-80 text-sm leading-6 text-white/60">Jalan Aman, Kota Nyaman. Data jalan yang lebih terbuka untuk semua.</p></div><p className="text-sm text-white/50">MVP V1 &middot; Dibangun untuk kota yang lebih nyaman</p></div></footer>
    </div>
  );
}
