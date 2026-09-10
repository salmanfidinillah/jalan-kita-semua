"use client";

import Link from "next/link";
import { getIdToken, signOut } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { useAuth } from "@/components/auth/auth-provider";
import { LoadingState } from "@/components/ui/page-state";

type AdminReport = { id: string; damage?: { type?: string; severity?: string; description?: string }; aiAnalysis?: { status?: string; confidence?: number; description?: string }; verificationSummary?: { totalCount?: number; confidence?: number }; priority?: { score?: number; classification?: string }; status?: string; reporterDisplayName?: string };
const statuses = ["ALL", "REPORTED", "VERIFIED", "IN_PROGRESS", "RESOLVED"];
const statusLabels: Record<string, string> = { REPORTED: "Dilaporkan", VERIFIED: "Terverifikasi", IN_PROGRESS: "Sedang ditangani", RESOLVED: "Selesai" };
const severityLabels: Record<string, string> = { ALL: "Semua severity", LOW: "Rendah", MEDIUM: "Sedang", HIGH: "Tinggi" };
const priorityLabels: Record<string, string> = { ALL: "Semua priority", LOW: "Low", MEDIUM: "Medium", HIGH: "High" };

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [status, setStatus] = useState("ALL");
  const [severity, setSeverity] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { if (!isLoading && isFirebaseConfigured() && !user) router.replace("/login"); }, [isLoading, router, user]);
  useEffect(() => {
    if (!user) return;
    getIdToken(user).then((token) => fetch(`/api/admin/reports${status === "ALL" ? "" : `?status=${status}`}`, { headers: { Authorization: `Bearer ${token}` } })).then(async (response) => {
      const payload = await response.json() as { success?: boolean; data?: AdminReport[]; error?: { message?: string } };
      if (!response.ok || !payload.success) throw new Error(payload.error?.message || "Data admin gagal dimuat.");
      setReports(payload.data || []);
    }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Data admin gagal dimuat."));
  }, [status, user]);

  const filteredReports = useMemo(() => reports.filter((report) => {
    const term = search.trim().toLowerCase();
    return (severity === "ALL" || report.damage?.severity === severity) && (priority === "ALL" || report.priority?.classification === priority) && (!term || report.id.toLowerCase().includes(term) || report.reporterDisplayName?.toLowerCase().includes(term));
  }).sort((first, second) => (second.priority?.score || 0) - (first.priority?.score || 0)), [priority, reports, search, severity]);

  async function updateStatus(reportId: string, nextStatus: string) {
    if (!user) return;
    try {
      const token = await getIdToken(user);
      const response = await fetch(`/api/admin/reports/${reportId}/status`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: nextStatus }) });
      const payload = await response.json() as { success?: boolean; error?: { message?: string } };
      if (!response.ok || !payload.success) throw new Error(payload.error?.message || "Status gagal diperbarui.");
      setReports((current) => current.map((report) => report.id === reportId ? { ...report, status: nextStatus } : report));
    } catch (updateError) { setError(updateError instanceof Error ? updateError.message : "Status gagal diperbarui."); }
  }

  if (!isFirebaseConfigured()) return <main className="flex min-h-screen items-center justify-center px-5 text-muted-ink">Firebase belum terhubung.</main>;
  if (isLoading) return <main className="flex min-h-screen items-center justify-center text-muted-ink">Memuat admin...</main>;
  if (!user) return <LoadingState label="Mengalihkan ke login..." />;

  return <main className="min-h-screen px-5 py-8 lg:px-10"><header className="mx-auto flex max-w-300 items-center justify-between"><Link className="text-xl font-bold" href="/">JALANIN <span className="text-sm font-normal text-muted-ink">Admin</span></Link><button className="rounded-full border border-line px-4 py-2 text-sm font-bold" onClick={() => signOut(getFirebaseAuth())}>Keluar</button></header><section className="mx-auto max-w-300 py-14"><p className="text-sm font-bold uppercase tracking-[0.16em] text-signal-orange">Operasional</p><h1 className="mt-3 text-4xl font-bold">Review laporan jalan</h1><div className="mt-8 flex flex-wrap gap-2">{statuses.map((option) => <button className={`rounded-full border px-4 py-2 text-sm font-bold ${status === option ? "border-ink bg-ink text-white" : "border-line bg-surface text-muted-ink"}`} key={option} onClick={() => setStatus(option)}>{option === "ALL" ? "Semua" : statusLabels[option]}</button>)}</div><div className="mt-4 grid gap-3 sm:grid-cols-3"><input className="rounded-xl border border-line bg-surface px-4 py-3" placeholder="Cari ID atau nama reporter" value={search} onChange={(event) => setSearch(event.target.value)} /><select className="rounded-xl border border-line bg-surface px-4 py-3" value={severity} onChange={(event) => setSeverity(event.target.value)}>{Object.entries(severityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select className="rounded-xl border border-line bg-surface px-4 py-3" value={priority} onChange={(event) => setPriority(event.target.value)}>{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>{error && <p className="mt-5 rounded-xl border border-danger-red/30 bg-[#fff0ed] p-4 text-sm text-danger-red" role="alert">{error}</p>}<div className="mt-6 space-y-3">{filteredReports.map((report) => <article className="rounded-2xl border border-line bg-surface p-5" key={report.id}><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><p className="text-xs font-bold uppercase tracking-wider text-muted-ink">{report.damage?.type || "OTHER"} · {report.damage?.severity || "LOW"}</p><h2 className="mt-2 text-xl font-bold">Laporan dari {report.reporterDisplayName || "pengguna"}</h2><p className="mt-1 text-sm text-muted-ink">Priority {report.priority?.score ?? 0}/100 · {statusLabels[report.status || "REPORTED"]}</p><p className="mt-2 text-sm text-muted-ink">AI: {report.aiAnalysis?.status || "PENDING"} · {report.verificationSummary?.totalCount || 0} verifikasi</p></div><div className="flex flex-wrap gap-2"><Link className="rounded-full border border-line px-4 py-2 text-sm font-bold" href={`/reports/${report.id}`}>Buka detail</Link><select className="rounded-full border border-line bg-paper px-3 py-2 text-sm font-bold" value={report.status || "REPORTED"} onChange={(event) => updateStatus(report.id, event.target.value)}><option value="REPORTED">Dilaporkan</option><option value="VERIFIED">Terverifikasi</option><option value="IN_PROGRESS">Sedang ditangani</option><option value="RESOLVED">Selesai</option></select></div></div></article>)}</div>{filteredReports.length === 0 && !error && <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface p-8 text-muted-ink">Belum ada laporan pada filter ini.</div>}</section></main>;
}
