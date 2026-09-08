"use client";

import Image from "next/image";
import Link from "next/link";
import { getIdToken, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/client";

type Report = {
  reporterId?: string;
  photo?: { downloadUrl?: string };
  location?: { latitude?: number; longitude?: number };
  damage?: { type?: string; severity?: string; description?: string };
  priority?: { score?: number; classification?: string };
  aiAnalysis?: { status?: string; damageType?: string; severity?: string; confidence?: number; description?: string };
  userReview?: { reviewed?: boolean };
  verificationSummary?: { stillExistsCount?: number; resolvedCount?: number; totalCount?: number; confidence?: number };
  status?: string;
};

const typeOptions = ["POTHOLE", "CRACK", "BROKEN_SURFACE", "FLOODING", "ROAD_OBSTRUCTION", "OTHER"];
const severityOptions = ["LOW", "MEDIUM", "HIGH"];

export default function ReportDetailPage() {
  const params = useParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [reviewType, setReviewType] = useState("OTHER");
  const [reviewSeverity, setReviewSeverity] = useState("LOW");
  const [reviewDescription, setReviewDescription] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), setUser);
    getDoc(doc(getFirebaseDb(), "reports", params.reportId))
      .then((snapshot) => {
        if (!snapshot.exists()) {
          setError("Laporan tidak ditemukan.");
          return;
        }
        const nextReport = snapshot.data() as Report;
        setReport(nextReport);
        setReviewType(nextReport.aiAnalysis?.damageType || nextReport.damage?.type || "OTHER");
        setReviewSeverity(nextReport.aiAnalysis?.severity || nextReport.damage?.severity || "LOW");
        setReviewDescription(nextReport.aiAnalysis?.description || nextReport.damage?.description || "");
      })
      .catch(() => setError("Laporan belum dapat dimuat. Coba lagi."));
    return unsubscribe;
  }, [params.reportId]);

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
      setReport((current) => current ? { ...current, aiAnalysis: { ...current.aiAnalysis, ...payload.data } } : current);
      setReviewType(payload.data?.damageType || "OTHER");
      setReviewSeverity(payload.data?.severity || "LOW");
      setReviewDescription(payload.data?.description || "");
    } catch (analysisError) {
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
      const payload = await response.json() as { success?: boolean; data?: { damage?: Report["damage"] }; error?: { message?: string } };
      if (!response.ok || !payload.success) throw new Error(payload.error?.message || "Review gagal disimpan.");
      setReport((current) => current ? { ...current, damage: payload.data?.damage, userReview: { reviewed: true } } : current);
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
      const payload = await response.json() as { success?: boolean; data?: { stillExistsCount?: number; resolvedCount?: number; totalCount?: number; priority?: Report["priority"] }; error?: { message?: string } };
      if (!response.ok || !payload.success) throw new Error(payload.error?.message || "Verifikasi gagal disimpan.");
      setReport((current) => current ? { ...current, verificationSummary: { stillExistsCount: payload.data?.stillExistsCount, resolvedCount: payload.data?.resolvedCount, totalCount: payload.data?.totalCount }, priority: payload.data?.priority } : current);
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : "Verifikasi gagal disimpan.");
    } finally {
      setIsVerifying(false);
    }
  }

  if (!isFirebaseConfigured()) return <main className="flex min-h-screen items-center justify-center px-5"><p className="text-muted-ink">Firebase belum terhubung.</p></main>;
  if (error && !report) return <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-5"><p className="text-lg font-bold">{error}</p><Link className="rounded-full bg-ink px-5 py-3 font-bold text-white" href="/dashboard">Kembali ke dashboard</Link></main>;
  if (!report) return <main className="flex min-h-screen items-center justify-center text-muted-ink">Memuat laporan...</main>;

  const isOwner = user?.uid === report.reporterId;
  const verification = report.verificationSummary;

  return (
    <main className="min-h-screen px-5 py-8 lg:px-10">
      <header className="mx-auto flex max-w-300 items-center justify-between"><Link className="text-xl font-bold" href="/dashboard">JALANIN</Link><Link className="text-sm font-bold text-road-blue" href="/dashboard">Dashboard</Link></header>
      <section className="mx-auto max-w-180 py-12">
        <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-signal-orange">Laporan terkirim</p><h1 className="mt-3 text-4xl font-bold">Kondisi jalan</h1></div><span className="rounded-full bg-[#fff4dc] px-4 py-2 text-sm font-bold text-warning-yellow">{report.status || "REPORTED"}</span></div>
        {report.photo?.downloadUrl && <Image className="mt-8 max-h-96 w-full rounded-2xl object-cover" src={report.photo.downloadUrl} alt="Foto kondisi jalan yang dilaporkan" width={1200} height={800} unoptimized />}
        <div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-line bg-surface p-5"><p className="text-sm text-muted-ink">Jenis kerusakan</p><p className="mt-2 text-xl font-bold">{report.damage?.type || "OTHER"}</p><p className="mt-2 text-sm text-muted-ink">{report.damage?.description}</p></div><div className="rounded-2xl border border-line bg-surface p-5"><p className="text-sm text-muted-ink">Priority score</p><p className="mt-2 text-3xl font-bold text-signal-orange">{report.priority?.score ?? 0}<span className="text-base text-muted-ink">/100</span></p><p className="mt-2 text-sm font-bold text-muted-ink">{report.priority?.classification || "LOW"} PRIORITY</p></div></div>
        {report.location && <div className="mt-4 rounded-2xl border border-line bg-surface p-5"><p className="text-sm text-muted-ink">Lokasi</p><p className="mt-2 font-bold">{report.location.latitude?.toFixed(5)}, {report.location.longitude?.toFixed(5)}</p></div>}

        <section className="mt-8 rounded-2xl border border-line bg-surface p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold">AI analysis</h2><p className="mt-2 leading-7 text-muted-ink">AI memberi saran, kamu tetap memeriksa hasilnya sebelum laporan menjadi final.</p></div>{isOwner && <button className="rounded-full bg-road-blue px-5 py-3 text-sm font-bold text-white disabled:opacity-60" onClick={handleAnalyze} disabled={isAnalyzing}>{isAnalyzing ? "Menganalisis..." : report.aiAnalysis?.status === "COMPLETED" ? "Analisis ulang" : "Analisis foto"}</button>}</div>{report.aiAnalysis?.status === "COMPLETED" && <p className="mt-4 rounded-xl bg-[#edf5f1] p-4 text-sm leading-6 text-leaf-green">Saran AI: {report.aiAnalysis.description} Confidence: {Math.round((report.aiAnalysis.confidence || 0) * 100)}%.</p>}</section>

        {isOwner && report.aiAnalysis?.status === "COMPLETED" && <form className="mt-4 rounded-2xl border border-line bg-surface p-5" onSubmit={handleReview}><h2 className="text-xl font-bold">Periksa hasil AI</h2><p className="mt-2 text-sm leading-6 text-muted-ink">Koreksi hasil sebelum menjadi data final laporan.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Jenis kerusakan<select className="mt-2 h-12 w-full rounded-xl border border-line bg-paper px-3 font-normal" value={reviewType} onChange={(event) => setReviewType(event.target.value)}>{typeOptions.map((option) => <option key={option}>{option}</option>)}</select></label><label className="text-sm font-bold">Severity<select className="mt-2 h-12 w-full rounded-xl border border-line bg-paper px-3 font-normal" value={reviewSeverity} onChange={(event) => setReviewSeverity(event.target.value)}>{severityOptions.map((option) => <option key={option}>{option}</option>)}</select></label></div><label className="mt-4 block text-sm font-bold">Deskripsi<textarea className="mt-2 min-h-28 w-full rounded-xl border border-line bg-paper p-3 font-normal" value={reviewDescription} onChange={(event) => setReviewDescription(event.target.value)} maxLength={500} required /></label><button className="mt-4 rounded-full bg-signal-orange px-5 py-3 font-bold text-white disabled:opacity-60" type="submit" disabled={isSavingReview}>{isSavingReview ? "Menyimpan..." : report.userReview?.reviewed ? "Simpan koreksi" : "Konfirmasi hasil"}</button></form>}

        <section className="mt-4 rounded-2xl border border-line bg-surface p-5"><h2 className="text-xl font-bold">Apakah kerusakan ini masih ada?</h2><p className="mt-2 text-sm leading-6 text-muted-ink">Bantu warga dan pengelola memahami kondisi terbaru.</p><div className="mt-4 flex flex-wrap gap-3"><button className="rounded-full border border-road-blue px-5 py-3 font-bold text-road-blue disabled:opacity-60" onClick={() => handleVerification("STILL_EXISTS")} disabled={isVerifying || isOwner}>Masih ada</button><button className="rounded-full border border-leaf-green px-5 py-3 font-bold text-leaf-green disabled:opacity-60" onClick={() => handleVerification("RESOLVED")} disabled={isVerifying || isOwner}>Sudah diperbaiki</button></div>{isOwner && <p className="mt-3 text-sm text-muted-ink">Pembuat laporan tidak memberikan vote pada laporannya sendiri.</p>}<div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm"><div className="rounded-xl bg-[#edf5f1] p-3"><strong className="block text-xl text-leaf-green">{verification?.stillExistsCount || 0}</strong>Masih ada</div><div className="rounded-xl bg-[#f1f5f1] p-3"><strong className="block text-xl text-leaf-green">{verification?.resolvedCount || 0}</strong>Selesai</div><div className="rounded-xl bg-paper p-3"><strong className="block text-xl">{verification?.totalCount || 0}</strong>Total vote</div></div></section>
        {error && <p className="mt-4 rounded-xl border border-danger-red/30 bg-[#fff0ed] p-4 text-sm text-danger-red" role="alert">{error}</p>}
      </section>
    </main>
  );
}
