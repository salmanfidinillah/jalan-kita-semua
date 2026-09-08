"use client";

import Link from "next/link";
import { getIdToken, onAuthStateChanged, signOut, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";

type AdminReport = { id: string; damage?: { type?: string; severity?: string }; priority?: { score?: number; classification?: string }; status?: string; reporterDisplayName?: string };
const statuses = ["ALL", "REPORTED", "VERIFIED", "IN_PROGRESS", "RESOLVED"];
const statusLabels: Record<string, string> = { REPORTED: "Dilaporkan", VERIFIED: "Terverifikasi", IN_PROGRESS: "Sedang ditangani", RESOLVED: "Selesai" };

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [status, setStatus] = useState("ALL");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured());

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    return onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      if (!nextUser) return;
      setUser(nextUser);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    getIdToken(user).then((token) => fetch(`/api/admin/reports${status === "ALL" ? "" : `?status=${status}`}`, { headers: { Authorization: `Bearer ${token}` } })).then(async (response) => {
      const payload = await response.json() as { success?: boolean; data?: AdminReport[]; error?: { message?: string } };
      if (!response.ok || !payload.success) throw new Error(payload.error?.message || "Data admin gagal dimuat.");
      setReports(payload.data || []);
    }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Data admin gagal dimuat."));
  }, [status, user]);

  async function updateStatus(reportId: string, nextStatus: string) {
    if (!user) return;
    try {
      const token = await getIdToken(user);
      const response = await fetch(`/api/admin/reports/${reportId}/status`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: nextStatus }) });
      const payload = await response.json() as { success?: boolean; error?: { message?: string } };
      if (!response.ok || !payload.success) throw new Error(payload.error?.message || "Status gagal diperbarui.");
      setReports((current) => current.map((report) => report.id === reportId ? { ...report, status: nextStatus } : report));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Status gagal diperbarui.");
    }
  }

  if (!isFirebaseConfigured()) return <main className="flex min-h-screen items-center justify-center px-5 text-muted-ink">Firebase belum terhubung.</main>;
  if (isLoading) return <main className="flex min-h-screen items-center justify-center text-muted-ink">Memuat admin...</main>;

  return <main className="min-h-screen px-5 py-8 lg:px-10"><header className="mx-auto flex max-w-300 items-center justify-between"><Link className="text-xl font-bold" href="/">JALANIN <span className="text-sm font-normal text-muted-ink">Admin</span></Link><button className="rounded-full border border-line px-4 py-2 text-sm font-bold" onClick={() => signOut(getFirebaseAuth())}>Keluar</button></header><section className="mx-auto max-w-300 py-14"><p className="text-sm font-bold uppercase tracking-[0.16em] text-signal-orange">Operasional</p><h1 className="mt-3 text-4xl font-bold">Review laporan jalan</h1><div className="mt-8 flex flex-wrap gap-2">{statuses.map((option) => <button className={`rounded-full border px-4 py-2 text-sm font-bold ${status === option ? "border-ink bg-ink text-white" : "border-line bg-surface text-muted-ink"}`} key={option} onClick={() => setStatus(option)}>{option === "ALL" ? "Semua" : statusLabels[option]}</button>)}</div>{error && <p className="mt-5 rounded-xl border border-danger-red/30 bg-[#fff0ed] p-4 text-sm text-danger-red">{error}</p>}<div className="mt-6 space-y-3">{reports.map((report) => <article className="rounded-2xl border border-line bg-surface p-5" key={report.id}><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><p className="text-xs font-bold uppercase tracking-wider text-muted-ink">{report.damage?.type || "OTHER"} · {report.damage?.severity || "LOW"}</p><h2 className="mt-2 text-xl font-bold">Laporan dari {report.reporterDisplayName || "pengguna"}</h2><p className="mt-1 text-sm text-muted-ink">Priority {report.priority?.score ?? 0}/100 · {statusLabels[report.status || "REPORTED"]}</p></div><div className="flex flex-wrap gap-2"><Link className="rounded-full border border-line px-4 py-2 text-sm font-bold" href={`/reports/${report.id}`}>Buka detail</Link><select className="rounded-full border border-line bg-paper px-3 py-2 text-sm font-bold" value={report.status || "REPORTED"} onChange={(event) => updateStatus(report.id, event.target.value)}><option value="REPORTED">Dilaporkan</option><option value="VERIFIED">Terverifikasi</option><option value="IN_PROGRESS">Sedang ditangani</option><option value="RESOLVED">Selesai</option></select></div></div></article>)}</div>{reports.length === 0 && !error && <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface p-8 text-muted-ink">Belum ada laporan pada filter ini.</div>}</section></main>;
}