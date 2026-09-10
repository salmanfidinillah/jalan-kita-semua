"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { getReportsByUser, getUserProfileSummary, getUserReportStats, type ReportListItem } from "@/lib/firebase/report-queries";
import { useAuth } from "@/components/auth/auth-provider";
import { LoadingState } from "@/components/ui/page-state";

const statusLabels: Record<string, string> = { ALL: "Semua status", REPORTED: "Dilaporkan", VERIFIED: "Terverifikasi", IN_PROGRESS: "Sedang ditangani", RESOLVED: "Selesai" };
const damageLabels: Record<string, string> = { POTHOLE: "Lubang jalan", CRACK: "Retakan", BROKEN_SURFACE: "Permukaan rusak", FLOODING: "Genangan", ROAD_OBSTRUCTION: "Hambatan jalan", OTHER: "Kerusakan lain" };

function formatDate(timestamp?: { seconds?: number }) {
  return timestamp?.seconds ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(timestamp.seconds * 1000)) : "Tanggal tidak tersedia";
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0 });
  const [profile, setProfile] = useState({ contributionCount: 0, reportCount: 0, verificationCount: 0 });
  const [filter, setFilter] = useState("ALL");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [reportsError, setReportsError] = useState("");

  useEffect(() => {
    if (!user) {
      if (!isLoading && isFirebaseConfigured()) router.replace("/login");
      return;
    }
    Promise.all([getReportsByUser(user.uid), getUserReportStats(user.uid), getUserProfileSummary(user.uid)])
      .then(([nextReports, nextStats, nextProfile]) => { setReports(nextReports); setStats(nextStats); setProfile(nextProfile); })
      .catch(() => setReportsError("Data dashboard belum dapat dimuat. Coba lagi."))
      .finally(() => setIsLoadingData(false));
  }, [isLoading, router, user]);

  async function handleSignOut() {
    await signOut(getFirebaseAuth());
    router.replace("/");
  }

  const filteredReports = useMemo(() => filter === "ALL" ? reports : reports.filter((report) => report.status === filter), [filter, reports]);

  if (isLoading) return <main className="flex min-h-screen items-center justify-center text-muted-ink">Memuat akun...</main>;
  if (!isFirebaseConfigured()) return <main className="flex min-h-screen items-center justify-center px-5"><div className="max-w-md rounded-2xl border border-line bg-surface p-7 text-center"><h1 className="text-2xl font-bold">Dashboard belum tersedia</h1><p className="mt-3 leading-7 text-muted-ink">Hubungkan Firebase terlebih dahulu untuk mengakses dashboard.</p><Link className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 font-bold text-white" href="/">Kembali ke beranda</Link></div></main>;
  if (!user) return <LoadingState label="Mengalihkan ke login..." />;

  return <main className="min-h-screen px-5 py-8 lg:px-10"><header className="mx-auto flex max-w-300 items-center justify-between"><Link className="text-xl font-bold" href="/">JALANIN</Link><button className="rounded-full border border-line px-4 py-2 text-sm font-bold" onClick={handleSignOut}>Keluar</button></header><section className="mx-auto max-w-300 py-12"><p className="text-sm font-bold uppercase tracking-[0.16em] text-signal-orange">Dashboard</p><h1 className="mt-3 text-4xl font-bold">Halo, {user.displayName || user.email}</h1><p className="mt-4 max-w-lg leading-7 text-muted-ink">Pantau laporan dan kontribusimu untuk jalan yang lebih nyaman.</p><div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-line bg-surface p-5"><p className="text-sm text-muted-ink">Total laporan</p><p className="mt-2 text-3xl font-bold">{stats.total}</p></div><div className="rounded-2xl border border-line bg-surface p-5"><p className="text-sm text-muted-ink">Laporan aktif</p><p className="mt-2 text-3xl font-bold text-signal-orange">{stats.active}</p></div><div className="rounded-2xl border border-line bg-surface p-5"><p className="text-sm text-muted-ink">Laporan selesai</p><p className="mt-2 text-3xl font-bold text-leaf-green">{stats.resolved}</p></div></div><div className="mt-4 flex flex-col justify-between gap-4 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center"><div><p className="text-sm text-muted-ink">Kontribusi komunitas</p><p className="mt-1 text-xl font-bold">{profile.verificationCount} verifikasi</p><p className="mt-1 text-sm text-muted-ink">Setiap verifikasi membantu memperbarui prioritas laporan.</p></div><Link className="inline-flex w-fit rounded-full bg-signal-orange px-5 py-3 font-bold text-white" href="/reports/new">Buat laporan</Link></div><div className="mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-2xl font-bold">Laporan saya</h2><p className="mt-1 text-sm text-muted-ink">{reports.length} laporan terbaru ditampilkan</p></div><label className="text-sm font-bold">Filter status<select className="ml-2 rounded-xl border border-line bg-surface px-3 py-2 font-normal" value={filter} onChange={(event) => setFilter(event.target.value)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>{reportsError && <p className="mt-5 rounded-xl border border-danger-red/30 bg-[#fff0ed] p-4 text-sm text-danger-red" role="alert">{reportsError}</p>}{isLoadingData && <div className="mt-5 rounded-2xl border border-line bg-surface p-8 text-center text-muted-ink">Memuat laporanmu...</div>}{!isLoadingData && !reportsError && reports.length === 0 && <div className="mt-5 rounded-2xl border border-dashed border-line bg-surface p-8"><h3 className="text-xl font-bold">Belum ada laporan</h3><p className="mt-2 max-w-md leading-7 text-muted-ink">Temukan jalan rusak di sekitarmu dan buat laporan pertamamu.</p><Link className="mt-5 inline-flex font-bold text-road-blue" href="/reports/new">Mulai buat laporan →</Link></div>}{!isLoadingData && !reportsError && reports.length > 0 && filteredReports.length === 0 && <div className="mt-5 rounded-2xl border border-dashed border-line bg-surface p-8 text-muted-ink">Tidak ada laporan dengan status {statusLabels[filter].toLowerCase()}.</div>}{!isLoadingData && filteredReports.length > 0 && <div className="mt-5 space-y-3">{filteredReports.map((report) => <Link className="flex flex-col justify-between gap-4 rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-road-blue sm:flex-row sm:items-center" href={`/reports/${report.id}`} key={report.id}><div><p className="text-xs font-bold uppercase tracking-wider text-muted-ink">{damageLabels[report.damage?.type || "OTHER"] || "Kerusakan lain"} · {report.damage?.severity || "LOW"}</p><h3 className="mt-2 text-lg font-bold">Laporan kondisi jalan</h3><p className="mt-1 text-sm text-muted-ink">{statusLabels[report.status || "REPORTED"] || report.status} · {formatDate(report.createdAt)}</p></div><div className="text-left sm:text-right"><p className="text-2xl font-bold text-signal-orange">{report.priority?.score ?? 0}<span className="text-sm text-muted-ink">/100</span></p><p className="text-xs font-bold text-muted-ink">{report.priority?.classification || "LOW"} priority</p></div></Link>)}</div>}</section></main>;
}
