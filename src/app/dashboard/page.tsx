"use client";

import Link from "next/link";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/client";

type UserReport = {
  id: string;
  damage?: { type?: string; severity?: string };
  priority?: { score?: number; classification?: string };
  status?: string;
  createdAt?: { seconds?: number };
};

const statusLabels: Record<string, string> = {
  REPORTED: "Dilaporkan",
  VERIFIED: "Terverifikasi",
  IN_PROGRESS: "Sedang ditangani",
  RESOLVED: "Selesai",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured());
  const [reports, setReports] = useState<UserReport[]>([]);
  const [reportsError, setReportsError] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      if (!nextUser) {
        router.replace("/login");
        return;
      }
      setUser(nextUser);
      getDocs(query(collection(getFirebaseDb(), "reports"), where("reporterId", "==", nextUser.uid), orderBy("createdAt", "desc"), limit(20)))
        .then((snapshot) => setReports(snapshot.docs.map((report) => ({ id: report.id, ...report.data() } as UserReport))))
        .catch(() => setReportsError("Daftar laporan belum dapat dimuat."));
      setIsLoading(false);
    });

    return unsubscribe;
  }, [router]);

  async function handleSignOut() {
    await signOut(getFirebaseAuth());
    router.replace("/");
  }

  if (isLoading) return <main className="flex min-h-screen items-center justify-center text-muted-ink">Memuat akun...</main>;

  if (!isFirebaseConfigured()) return <main className="flex min-h-screen items-center justify-center px-5"><div className="max-w-md rounded-2xl border border-line bg-surface p-7 text-center"><h1 className="text-2xl font-bold">Dashboard belum tersedia</h1><p className="mt-3 leading-7 text-muted-ink">Hubungkan Firebase terlebih dahulu untuk mengakses dashboard.</p><Link className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 font-bold text-white" href="/">Kembali ke beranda</Link></div></main>;

  return <main className="min-h-screen px-5 py-8 lg:px-10"><header className="mx-auto flex max-w-300 items-center justify-between"><Link className="text-xl font-bold" href="/">JALANIN</Link><button className="rounded-full border border-line px-4 py-2 text-sm font-bold" onClick={handleSignOut}>Keluar</button></header><section className="mx-auto max-w-300 py-16"><p className="text-sm font-bold uppercase tracking-[0.16em] text-signal-orange">Dashboard</p><h1 className="mt-3 text-4xl font-bold">Halo, {user?.displayName || user?.email}</h1><p className="mt-4 max-w-lg leading-7 text-muted-ink">Pantau laporan dan kontribusimu untuk jalan yang lebih nyaman.</p><div className="mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-2xl font-bold">Laporan saya</h2><p className="mt-1 text-sm text-muted-ink">{reports.length} laporan terbaru</p></div><Link className="inline-flex w-fit rounded-full bg-signal-orange px-5 py-3 font-bold text-white" href="/reports/new">Buat laporan</Link></div>{reportsError && <p className="mt-5 rounded-xl border border-danger-red/30 bg-[#fff0ed] p-4 text-sm text-danger-red">{reportsError}</p>}{!reportsError && reports.length === 0 && <div className="mt-5 rounded-2xl border border-dashed border-line bg-surface p-8"><h3 className="text-xl font-bold">Belum ada laporan</h3><p className="mt-2 max-w-md leading-7 text-muted-ink">Temukan jalan rusak di sekitarmu dan buat laporan pertamamu.</p><Link className="mt-5 inline-flex font-bold text-road-blue" href="/reports/new">Mulai buat laporan -&gt;</Link></div>}{reports.length > 0 && <div className="mt-5 space-y-3">{reports.map((report) => <Link className="flex flex-col justify-between gap-4 rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-road-blue sm:flex-row sm:items-center" href={`/reports/${report.id}`} key={report.id}><div><p className="text-xs font-bold uppercase tracking-wider text-muted-ink">{report.damage?.type || "OTHER"} · {report.damage?.severity || "LOW"}</p><h3 className="mt-2 text-lg font-bold">Laporan kondisi jalan</h3><p className="mt-1 text-sm text-muted-ink">Status: {statusLabels[report.status || "REPORTED"] || report.status}</p></div><div className="text-left sm:text-right"><p className="text-2xl font-bold text-signal-orange">{report.priority?.score ?? 0}<span className="text-sm text-muted-ink">/100</span></p><p className="text-xs font-bold text-muted-ink">{report.priority?.classification || "LOW"} PRIORITY</p></div></Link>)}</div>}</section></main>;
}
