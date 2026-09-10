"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GoogleRoadMap } from "@/components/maps/google-road-map";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { getPublicReports, type ReportListItem } from "@/lib/firebase/report-queries";
import { LoadingState } from "@/components/ui/page-state";

type Report = ReportListItem;

const filters = ["ALL", "HIGH", "MEDIUM", "LOW"];
const statusFilters = ["ALL", "REPORTED", "VERIFIED", "IN_PROGRESS", "RESOLVED"];
const statusLabels: Record<string, string> = { REPORTED: "Dilaporkan", VERIFIED: "Terverifikasi", IN_PROGRESS: "Sedang ditangani", RESOLVED: "Selesai" };
const severityLabels: Record<string, string> = { ALL: "Semua severity", HIGH: "Tinggi", MEDIUM: "Sedang", LOW: "Rendah" };

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured());

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    getPublicReports()
      .then(setReports)
      .catch(() => setError("Laporan publik belum dapat dimuat."))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredReports = useMemo(() => reports.filter((report) => (filter === "ALL" || report.damage?.severity === filter) && (statusFilter === "ALL" || report.status === statusFilter)), [filter, reports, statusFilter]);

  if (!isFirebaseConfigured()) return <main className="flex min-h-screen items-center justify-center px-5 text-muted-ink">Firebase belum terhubung.</main>;
  if (isLoading) return <LoadingState label="Memuat laporan publik..." />;

  return <main className="min-h-screen px-5 py-8 lg:px-10"><header className="mx-auto flex max-w-300 items-center justify-between"><Link className="text-xl font-bold" href="/">JALANIN</Link><div className="flex items-center gap-4"><Link className="text-sm font-bold text-road-blue" href="/dashboard">Masuk</Link><Link className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white" href="/reports/new">Buat laporan</Link></div></header><section className="mx-auto max-w-300 py-10"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-signal-orange">Public map</p><h1 className="mt-3 text-4xl font-bold tracking-tight">Kondisi jalan di sekitar kita.</h1><p className="mt-3 max-w-xl leading-7 text-muted-ink">Lihat laporan publik berdasarkan lokasi, severity, dan status penanganannya.</p></div><div className="flex flex-col gap-3"><div className="flex flex-wrap gap-2" aria-label="Filter severity">{filters.map((option) => <button aria-pressed={filter === option} className={`rounded-full border px-4 py-2 text-sm font-bold ${filter === option ? "border-ink bg-ink text-white" : "border-line bg-surface text-muted-ink"}`} key={option} onClick={() => setFilter(option)}>{severityLabels[option]}</button>)}</div><div className="flex flex-wrap gap-2" aria-label="Filter status">{statusFilters.map((option) => <button aria-pressed={statusFilter === option} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${statusFilter === option ? "border-road-blue bg-road-blue text-white" : "border-line bg-surface text-muted-ink"}`} key={option} onClick={() => setStatusFilter(option)}>{option === "ALL" ? "Semua status" : statusLabels[option]}</button>)}</div></div></div>{error && <p className="mt-5 rounded-xl border border-danger-red/30 bg-[#fff0ed] p-4 text-sm text-danger-red" role="alert">{error}</p>}{!error && reports.length > 0 && filteredReports.length === 0 && <p className="mt-5 rounded-xl border border-dashed border-line bg-surface p-4 text-sm text-muted-ink">Tidak ada laporan yang sesuai filter ini.</p>}<div className="mt-8 h-[min(70vh,720px)]"><GoogleRoadMap reports={filteredReports} /></div><div className="mt-5 flex flex-wrap gap-5 text-sm text-muted-ink"><span><b className="mr-2 inline-block h-3 w-3 rounded-full bg-danger-red" />High</span><span><b className="mr-2 inline-block h-3 w-3 rounded-full bg-warning-yellow" />Medium</span><span><b className="mr-2 inline-block h-3 w-3 rounded-full bg-leaf-green" />Low</span><span><b className="mr-2 inline-block h-3 w-3 rounded-full bg-road-blue" />Selesai</span></div></section></main>;
}
