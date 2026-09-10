import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-signal-orange">404</p>
      <h1 className="text-3xl font-bold">Halaman tidak ditemukan</h1>
      <p className="max-w-md leading-7 text-muted-ink">Alamat yang kamu buka tidak tersedia atau sudah dipindahkan.</p>
      <Link className="rounded-full bg-ink px-5 py-3 font-bold text-white" href="/">
        Kembali ke beranda
      </Link>
    </main>
  );
}

