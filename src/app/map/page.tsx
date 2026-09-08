"use client";

import Link from "next/link";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { GoogleRoadMap } from "@/components/maps/google-road-map";
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/client";

type Report = {
  id: string;
  location?: { latitude?: number; longitude?: number };
  damage?: { type?: string; severity?: string };
  status?: string;
  priority?: { score?: number; classification?: string };
};

const filters = ["ALL", "HIGH", "MEDIUM", "LOW"];

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    getDocs(query(collection(getFirebaseDb(), "reports"), where("visibility", "==", "public"), limit(100)))
      .then((snapshot) => setReports(snapshot.docs.map((report) => ({ id: report.id, ...report.data() } as Report))))
      .catch(() => setError("Laporan publik belum dapat dimuat."));
  }, []);

  const filteredReports = useMemo(() => filter === "ALL" ? reports : reports.filter((report) => report.damage?.severity === filter), [filter, reports]);

  if (!isFirebaseConfigured()) return <main className="flex min-h-screen items-center justify-center px-5 text-muted-ink">Firebase belum terhubung.</main>;

  return <main className="min-h-screen px-5 py-8 lg:px-10"><header className="mx-auto flex max-w-300 items-center justify-between"><Link className="text-xl font-bold" href="/">JALANIN</Link><div className="flex items-center gap-4"><Link className="text-sm font-bold text-road-blue" href="/dashboard">Masuk</Link><Link className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white" href="/reports/new">Buat laporan</Link></div></header><section className="mx-auto max-w-300 py-10"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-signal-orange">Public map</p><h1 className="mt-3 text-4xl font-bold tracking-tight">Kondisi jalan di sekitar kita.</h1><p className="mt-3 max-w-xl leading-7 text-muted-ink">Lihat laporan publik berdasarkan lokasi, severity, dan status penanganannya.</p></div><div className="flex flex-wrap gap-2">{filters.map((option) => <button className={`rounded-full border px-4 py-2 text-sm font-bold ${filter === option ? "border-ink bg-ink text-white" : "border-line bg-surface text-muted-ink"}`} key={option} onClick={() => setFilter(option)}>{option === "ALL" ? "Semua" : `${option} severity`}</button>)}</div></div>{error && <p className="mt-5 rounded-xl border border-danger-red/30 bg-[#fff0ed] p-4 text-sm text-danger-red">{error}</p>}<div className="mt-8 h-[min(70vh,720px)]"><GoogleRoadMap reports={filteredReports} /></div><div className="mt-5 flex flex-wrap gap-5 text-sm text-muted-ink"><span><b className="mr-2 inline-block h-3 w-3 rounded-full bg-danger-red" />High</span><span><b className="mr-2 inline-block h-3 w-3 rounded-full bg-warning-yellow" />Medium</span><span><b className="mr-2 inline-block h-3 w-3 rounded-full bg-leaf-green" />Low</span></div></section></main>;
}
