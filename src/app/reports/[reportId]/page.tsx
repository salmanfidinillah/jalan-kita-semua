"use client";

import Image from "next/image";
import Link from "next/link";
import { getIdToken } from "firebase/auth";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { useAuth } from "@/components/auth/auth-provider";

type Report = {
  id?: string;
  reporterId?: string;
  isOwner?: boolean;
  photo?: { downloadUrl?: string };
  location?: { latitude?: number; longitude?: number; label?: string };
  damage?: { type?: string; severity?: string; description?: string };
  priority?: { score?: number; classification?: string; severityValue?: number; communityValue?: number; riskValue?: number; formulaVersion?: string };
  aiAnalysis?: { status?: string; analysisId?: string; attempts?: number; model?: string; damageType?: string; severity?: string; confidence?: number; description?: string; observations?: string[]; errorCode?: string };
  userReview?: { reviewed?: boolean };
  verificationSummary?: { stillExistsCount?: number; resolvedCount?: number; totalCount?: number; stillExistsRatio?: number; confidence?: number; lastVerifiedAt?: { seconds?: number } | null };
  status?: string;
  createdAt?: { seconds?: number };
  updatedAt?: { seconds?: number };
};

type StatusHistory = {
  id: string;
  fromStatus?: string | null;
  toStatus?: string;
  note?: string;
  createdAt?: { seconds?: number };
};

const statusLabels: Record<string, string> = {
  REPORTED: "Dilaporkan",
  VERIFIED: "Terverifikasi",
  IN_PROGRESS: "Sedang ditangani",
  RESOLVED: "Selesai",
};

const typeOptions = ["POTHOLE", "CRACK", "BROKEN_SURFACE", "FLOODING", "ROAD_OBSTRUCTION", "OTHER"];
const severityOptions = ["LOW", "MEDIUM", "HIGH"];

const damageLabels: Record<string, string> = {
  POTHOLE: "Lubang jalan",
  CRACK: "Retakan",
  BROKEN_SURFACE: "Permukaan rusak",
  FLOODING: "Genangan atau banjir",
  ROAD_OBSTRUCTION: "Hambatan jalan",
  OTHER: "Kerusakan lain",
};

const severityLabels: Record<string, string> = { LOW: "Rendah", MEDIUM: "Sedang", HIGH: "Tinggi" };

function formatDate(timestamp?: { seconds?: number } | null) {
  if (!timestamp?.seconds) return "Tanggal tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(timestamp.seconds * 1000));
}

export default function ReportDetailPage() {
  const params = useParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [userChoice, setUserChoice] = useState<"STILL_EXISTS" | "RESOLVED" | null>(null);
  const [reviewType, setReviewType] = useState("OTHER");
  const [reviewSeverity, setReviewSeverity] = useState("LOW");
  const [reviewDescription, setReviewDescription] = useState("");
  const userId = user?.uid;

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    let cancelled = false;
    async function loadReport() {
      try {
        const headers: HeadersInit = user ? { Authorization: `Bearer ${await getIdToken(user)}` } : {};
        const response = await fetch(`/api/reports/${encodeURIComponent(params.reportId)}`, { headers, cache: "no-store" });
        const payload = await response.json() as { success?: boolean; data?: { report: Report; statusHistory: StatusHistory[]; userChoice?: "STILL_EXISTS" | "RESOLVED" | null }; error?: { message?: string } };
        if (!response.ok || !payload.success || !payload.data) throw new Error(payload.error?.message || "Laporan belum dapat dimuat. Coba lagi.");
        if (cancelled) return;
        const nextReport = payload.data.report;
        setReport(nextReport);
        setStatusHistory(payload.data.statusHistory);
        setUserChoice(payload.data.userChoice || null);
        setReviewType(nextReport.aiAnalysis?.damageType || nextReport.damage?.type || "OTHER");
        setReviewSeverity(nextReport.aiAnalysis?.severity || nextReport.damage?.severity || "LOW");
        setReviewDescription(nextReport.aiAnalysis?.description || nextReport.damage?.description || "");
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Laporan belum dapat dimuat. Coba lagi.");
      }
    }
    void loadReport();
    return () => { cancelled = true; };
  }, [params.reportId, user, userId]);

  async function getToken() {
    if (!user) throw new Error("Login diperlukan untuk aksi ini.");
    return getIdToken(user);
  }

  async function handleAnalyze() {
    setIsAnalyzing(true);
    setError("");
    try {
      const response = await fetch(`/api/reports/${params.reportId}/analyze`, { method: "POST", headers: { Authorization: `Bearer ${await getToken()}` } });
      const payload = await response.json() as { success?: boolean; data?: Report["aiAnalysis"]; error?: { message?: string } };
      if (!response.ok || !payload.success) throw new Error(payload.error?.message || "Analisis gagal.");
      setReport((current) => current ? { ...current, aiAnalysis: { ...current.aiAnalysis, ...payload.data, status: "COMPLETED" } } : current);
      setReviewType(payload.data?.damageType || "OTHER");
      setReviewSeverity(payload.data?.severity || "LOW");
      setReviewDescription(payload.data?.description || "");
    } catch (analysisError) {
      setReport((current) => current ? { ...current, aiAnalysis: { ...current.aiAnalysis, status: "FAILED" } } : current);
      setError(analysisError instanceof Error ? analysisError.message : "Analisis gagal. Silakan coba lagi.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingReview(true);
    setError("");
    try {
      const response = await fetch(`/api/reports/${params.reportId}/review`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${await getToken()}` }, body: JSON.stringify({ damageType: reviewType, severity: reviewSeverity, description: reviewDescription }) });
      const payload = await response.json() as { success?: boolean; data?: { damage?: Report["damage"]; priority?: Report["priority"] }; error?: { message?: string } };
      if (!response.ok || !payload.success) throw new Error(payload.error?.message || "Review gagal disimpan.");
      setReport((current) => current ? { ...current, damage: payload.data?.damage, priority: payload.data?.priority, userReview: { reviewed: true } } : current);
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "Review gagal disimpan.");
    } finally {
      setIsSavingReview(false);
    }
  }

  async function handleVerification(choice: "STILL_EXISTS" | "RESOLVED") {
    setIsVerifying(true);
    setError("");
    try {
      const response = await fetch(`/api/reports/${params.reportId}/verification`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${await getToken()}` }, body: JSON.stringify({ choice }) });
      const payload = await response.json() as { success?: boolean; data?: { stillExistsCount?: number; resolvedCount?: number; totalCount?: number; stillExistsRatio?: number; confidence?: number; lastVerifiedAt?: { seconds?: number }; priority?: Report["priority"] }; error?: { message?: string } };
      if (!response.ok || !payload.success) throw new Error(payload.error?.message || "Verifikasi gagal disimpan.");
      setUserChoice(choice);
      setReport((current) => current ? { ...current, verificationSummary: { stillExistsCount: payload.data?.stillExistsCount, resolvedCount: payload.data?.resolvedCount, totalCount: payload.data?.totalCount, stillExistsRatio: payload.data?.stillExistsRatio, confidence: payload.data?.confidence, lastVerifiedAt: payload.data?.lastVerifiedAt }, priority: payload.data?.priority } : current);
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : "Verifikasi gagal disimpan.");
    } finally {
      setIsVerifying(false);
    }
  }

  if (!isFirebaseConfigured()) return <main className="flex min-h-screen items-center justify-center px-5"><p className="text-muted-ink">Firebase belum terhubung.</p></main>;
  if (error && !report) return <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-5"><p className="text-lg font-bold">{error}</p><Link className="rounded-full bg-ink px-5 py-3 font-bold text-white" href={user ? "/dashboard" : "/map"}>{user ? "Kembali ke dashboard" : "Kembali ke peta"}</Link></main>;
  if (!report) return <main className="flex min-h-screen items-center justify-center text-muted-ink">Memuat laporan...</main>;

  const isOwner = report.isOwner === true;
  const verification = report.verificationSummary;

  return (
    <main className="min-h-screen px-5 py-8 lg:px-10">
      <header className="mx-auto flex max-w-300 items-center justify-between"><Link className="text-xl font-bold" href="/">JALANIN</Link><Link className="text-sm font-bold text-road-blue" href={user ? "/dashboard" : "/map"}>{user ? "Dashboard" : "Kembali ke peta"}</Link></header>
      <section className="mx-auto max-w-180 py-12">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-signal-orange">Detail laporan</p><h1 className="mt-3 text-4xl font-bold">Kondisi jalan</h1><p className="mt-2 text-sm text-muted-ink">Dilaporkan {formatDate(report.createdAt)}</p></div><span className="w-fit rounded-full bg-[#fff4dc] px-4 py-2 text-sm font-bold text-warning-yellow">{statusLabels[report.status || "REPORTED"] || report.status || "Dilaporkan"}</span></div>
        {report.photo?.downloadUrl && <Image className="mt-8 max-h-96 w-full rounded-2xl object-cover" src={report.photo.downloadUrl} alt="Foto kondisi jalan yang dilaporkan" width={1200} height={800} unoptimized />}
        <div className="mt-6 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-line bg-surface p-5"><p className="text-sm text-muted-ink">Jenis kerusakan</p><p className="mt-2 text-xl font-bold">{damageLabels[report.damage?.type || "OTHER"] || "Kerusakan lain"}</p><p className="mt-1 text-sm font-bold text-signal-orange">{severityLabels[report.damage?.severity || "LOW"] || "Rendah"}</p><p className="mt-3 text-sm leading-6 text-muted-ink">{report.damage?.description || "Deskripsi belum tersedia."}</p></div><div className="rounded-2xl border border-line bg-surface p-5"><p className="text-sm text-muted-ink">Priority score</p><p className="mt-2 text-3xl font-bold text-signal-orange">{report.priority?.score ?? 0}<span className="text-base text-muted-ink">/100</span></p><p className="mt-2 text-sm font-bold text-muted-ink">{report.priority?.classification || "LOW"} priority</p><div className="mt-3 space-y-1 text-xs text-muted-ink"><p>Severity: {report.priority?.severityValue ?? 0} × 50%</p><p>Community: {report.priority?.communityValue ?? 0} × 30%</p><p>Risk factor: {report.priority?.riskValue ?? 0} × 20%</p></div></div><div className="rounded-2xl border border-line bg-surface p-5"><p className="text-sm text-muted-ink">Status saat ini</p><p className="mt-2 text-xl font-bold">{statusLabels[report.status || "REPORTED"] || report.status || "Dilaporkan"}</p><p className="mt-2 text-sm text-muted-ink">Data publik tanpa informasi pribadi pelapor.</p></div></div>
        {report.location && <div className="mt-4 rounded-2xl border border-line bg-surface p-5"><p className="text-sm text-muted-ink">Lokasi jalan</p><p className="mt-2 font-bold">{report.location.label || "Lokasi berdasarkan GPS"}</p><p className="mt-1 text-sm text-muted-ink">{report.location.latitude?.toFixed(5)}, {report.location.longitude?.toFixed(5)}</p></div>}

        <section className="mt-8 rounded-2xl border border-line bg-surface p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold">AI analysis</h2><p className="mt-2 leading-7 text-muted-ink">AI memberi saran, kamu tetap memeriksa hasilnya sebelum laporan menjadi final.</p></div>{isOwner && <button className="rounded-full bg-road-blue px-5 py-3 text-sm font-bold text-white disabled:opacity-60" onClick={handleAnalyze} disabled={isAnalyzing || report.aiAnalysis?.status === "PROCESSING"}>{isAnalyzing || report.aiAnalysis?.status === "PROCESSING" ? "Menganalisis..." : report.aiAnalysis?.status === "COMPLETED" ? "Analisis ulang" : report.aiAnalysis?.status === "FAILED" ? "Coba lagi" : "Analisis foto"}</button>}</div>{report.aiAnalysis?.status === "PROCESSING" && <p className="mt-4 rounded-xl bg-[#eef4fb] p-4 text-sm leading-6 text-road-blue" role="status">Foto sedang dianalisis. Proses ini dapat membutuhkan beberapa detik.</p>}{report.aiAnalysis?.status === "FAILED" && <p className="mt-4 rounded-xl bg-[#fff0ed] p-4 text-sm leading-6 text-danger-red" role="alert">Analisis sebelumnya gagal. Silakan coba lagi; hasil AI tidak mengubah laporan sampai kamu mengonfirmasinya.</p>}{report.aiAnalysis?.status === "COMPLETED" && <div className="mt-4 rounded-xl bg-[#edf5f1] p-4 text-sm leading-6 text-leaf-green"><p>Saran AI: {report.aiAnalysis.description}</p><div className="mt-3 grid gap-2 text-xs font-bold uppercase tracking-wide sm:grid-cols-3"><span>Jenis: {report.aiAnalysis.damageType}</span><span>Severity: {report.aiAnalysis.severity}</span><span>Confidence: {Math.round((report.aiAnalysis.confidence || 0) * 100)}%</span></div>{report.aiAnalysis.observations?.length ? <ul className="mt-3 list-disc space-y-1 pl-5 font-normal normal-case tracking-normal">{report.aiAnalysis.observations.map((observation) => <li key={observation}>{observation}</li>)}</ul> : null}</div>}</section>

        {isOwner && report.aiAnalysis?.status === "COMPLETED" && <form className="mt-4 rounded-2xl border border-line bg-surface p-5" onSubmit={handleReview}><h2 className="text-xl font-bold">Periksa hasil AI</h2><p className="mt-2 text-sm leading-6 text-muted-ink">Koreksi hasil sebelum menjadi data final laporan.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Jenis kerusakan<select className="mt-2 h-12 w-full rounded-xl border border-line bg-paper px-3 font-normal" value={reviewType} onChange={(event) => setReviewType(event.target.value)}>{typeOptions.map((option) => <option key={option}>{option}</option>)}</select></label><label className="text-sm font-bold">Severity<select className="mt-2 h-12 w-full rounded-xl border border-line bg-paper px-3 font-normal" value={reviewSeverity} onChange={(event) => setReviewSeverity(event.target.value)}>{severityOptions.map((option) => <option key={option}>{option}</option>)}</select></label></div><label className="mt-4 block text-sm font-bold">Deskripsi<textarea className="mt-2 min-h-28 w-full rounded-xl border border-line bg-paper p-3 font-normal" value={reviewDescription} onChange={(event) => setReviewDescription(event.target.value)} maxLength={500} required /></label><button className="mt-4 rounded-full bg-signal-orange px-5 py-3 font-bold text-white disabled:opacity-60" type="submit" disabled={isSavingReview}>{isSavingReview ? "Menyimpan..." : report.userReview?.reviewed ? "Simpan koreksi" : "Konfirmasi hasil"}</button></form>}

        <section className="mt-4 rounded-2xl border border-line bg-surface p-5"><h2 className="text-xl font-bold">Apakah kerusakan ini masih ada?</h2><p className="mt-2 text-sm leading-6 text-muted-ink">Bantu warga dan pengelola memahami kondisi terbaru.</p><div className="mt-4 flex flex-wrap gap-3"><button className={`rounded-full border px-5 py-3 font-bold disabled:opacity-60 ${userChoice === "STILL_EXISTS" ? "border-road-blue bg-[#eef4fb] text-road-blue" : "border-road-blue text-road-blue"}`} onClick={() => handleVerification("STILL_EXISTS")} disabled={isVerifying || isOwner || !user} aria-pressed={userChoice === "STILL_EXISTS"}>👍 {userChoice === "STILL_EXISTS" ? "Pilihan tersimpan" : "Masih ada"}</button><button className={`rounded-full border px-5 py-3 font-bold disabled:opacity-60 ${userChoice === "RESOLVED" ? "border-leaf-green bg-[#edf5f1] text-leaf-green" : "border-leaf-green text-leaf-green"}`} onClick={() => handleVerification("RESOLVED")} disabled={isVerifying || isOwner || !user} aria-pressed={userChoice === "RESOLVED"}>👎 {userChoice === "RESOLVED" ? "Pilihan tersimpan" : "Sudah diperbaiki"}</button></div>{!user && <p className="mt-3 text-sm text-muted-ink">Masuk untuk memberikan atau mengubah verifikasi.</p>}{isOwner && <p className="mt-3 text-sm text-muted-ink">Pembuat laporan tidak memberikan vote pada laporannya sendiri.</p>}<div className="mt-5 grid gap-3 text-center text-sm sm:grid-cols-4"><div className="rounded-xl bg-[#edf5f1] p-3"><strong className="block text-xl text-leaf-green">{verification?.stillExistsCount || 0}</strong>Masih ada</div><div className="rounded-xl bg-paper p-3"><strong className="block text-xl text-leaf-green">{verification?.resolvedCount || 0}</strong>Selesai</div><div className="rounded-xl bg-paper p-3"><strong className="block text-xl">{verification?.totalCount || 0}</strong>Total vote</div><div className="rounded-xl bg-paper p-3"><strong className="block text-xl">{Math.round(verification?.confidence || 0)}%</strong>Confidence komunitas</div></div>{verification?.lastVerifiedAt && <p className="mt-4 text-xs text-muted-ink">Pembaruan komunitas terakhir: {formatDate(verification.lastVerifiedAt)}</p>}</section>
        <section className="mt-4 rounded-2xl border border-line bg-surface p-5"><h2 className="text-xl font-bold">Perjalanan laporan</h2><div className="mt-5 space-y-5">{statusHistory.map((history, index) => <div className="flex gap-4" key={history.id}><div className="flex flex-col items-center"><span className="mt-1 h-3 w-3 rounded-full bg-road-blue" />{index < statusHistory.length - 1 && <span className="mt-2 h-full w-px bg-line" />}</div><div className="pb-1"><p className="font-bold">{statusLabels[history.toStatus || ""] || history.toStatus}</p><p className="mt-1 text-sm text-muted-ink">{history.note || "Status diperbarui"}</p><p className="mt-1 text-xs text-muted-ink">{formatDate(history.createdAt)}</p></div></div>)}{statusHistory.length === 0 && <p className="text-sm text-muted-ink">Belum ada riwayat status.</p>}</div></section>
        {error && <p className="mt-4 rounded-xl border border-danger-red/30 bg-[#fff0ed] p-4 text-sm text-danger-red" role="alert">{error}</p>}
      </section>
    </main>
  );
}
