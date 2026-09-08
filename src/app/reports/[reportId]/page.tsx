"use client";

import Image from "next/image";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/client";

type Report = {
  photo?: { downloadUrl?: string };
  location?: { latitude?: number; longitude?: number };
  damage?: { type?: string; severity?: string; description?: string };
  priority?: { score?: number; classification?: string };
  status?: string;
};

export default function ReportDetailPage() {
  const params = useParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    getDoc(doc(getFirebaseDb(), "reports", params.reportId))
      .then((snapshot) => {
        if (!snapshot.exists()) {
          setError("Laporan tidak ditemukan.");
          return;
        }
        setReport(snapshot.data() as Report);
      })
      .catch(() => setError("Laporan belum dapat dimuat. Coba lagi."));
  }, [params.reportId]);

  if (!isFirebaseConfigured()) return <main className="flex min-h-screen items-center justify-center px-5"><p className="text-muted-ink">Firebase belum terhubung.</p></main>;
  if (error) return <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-5"><p className="text-lg font-bold">{error}</p><Link className="rounded-full bg-ink px-5 py-3 font-bold text-white" href="/dashboard">Kembali ke dashboard</Link></main>;
  if (!report) return <main className="flex min-h-screen items-center justify-center text-muted-ink">Memuat laporan...</main>;

  return <main className="min-h-screen px-5 py-8 lg:px-10"><header className="mx-auto flex max-w-300 items-center justify-between"><Link className="text-xl font-bold" href="/dashboard">JALANIN</Link><Link className="text-sm font-bold text-road-blue" href="/dashboard">Dashboard</Link></header><section className="mx-auto max-w-180 py-12"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-signal-orange">Laporan terkirim</p><h1 className="mt-3 text-4xl font-bold">Kondisi jalan</h1></div><span className="rounded-full bg-[#fff4dc] px-4 py-2 text-sm font-bold text-warning-yellow">{report.status || "REPORTED"}</span></div>{report.photo?.downloadUrl && <Image className="mt-8 max-h-96 w-full rounded-2xl object-cover" src={report.photo.downloadUrl} alt="Foto kondisi jalan yang dilaporkan" width={1200} height={800} unoptimized /> }<div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-line bg-surface p-5"><p className="text-sm text-muted-ink">Jenis kerusakan</p><p className="mt-2 text-xl font-bold">{report.damage?.type || "OTHER"}</p><p className="mt-2 text-sm text-muted-ink">{report.damage?.description}</p></div><div className="rounded-2xl border border-line bg-surface p-5"><p className="text-sm text-muted-ink">Priority score</p><p className="mt-2 text-3xl font-bold text-signal-orange">{report.priority?.score ?? 0}<span className="text-base text-muted-ink">/100</span></p><p className="mt-2 text-sm font-bold text-muted-ink">{report.priority?.classification || "LOW"} PRIORITY</p></div></div>{report.location && <div className="mt-4 rounded-2xl border border-line bg-surface p-5"><p className="text-sm text-muted-ink">Lokasi</p><p className="mt-2 font-bold">{report.location.latitude?.toFixed(5)}, {report.location.longitude?.toFixed(5)}</p></div>}<div className="mt-8 rounded-2xl border border-line bg-surface p-5"><h2 className="text-xl font-bold">Langkah berikutnya</h2><p className="mt-2 leading-7 text-muted-ink">Laporan sudah masuk. Analisis AI dan verifikasi komunitas akan melengkapi informasi ini.</p></div></section></main>;
}
