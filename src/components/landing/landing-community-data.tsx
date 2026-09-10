"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { GoogleRoadMap } from "@/components/maps/google-road-map";
import { getPublicReportStats, getPublicReports, type ReportListItem } from "@/lib/firebase/report-queries";
import { isFirebaseConfigured } from "@/lib/firebase/client";

type LandingStats = {
  total: number;
  verified: number;
  inProgress: number;
  resolved: number;
  highPriority: number;
};

type LandingData = {
  reports: ReportListItem[];
  stats: LandingStats | null;
  isLoading: boolean;
  error: string;
};

const LandingDataContext = createContext<LandingData>({ reports: [], stats: null, isLoading: true, error: "" });

export function LandingDataProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [stats, setStats] = useState<LandingStats | null>(null);
  const [isLoading, setIsLoading] = useState(() => isFirebaseConfigured());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    Promise.all([getPublicReports(6), getPublicReportStats()])
      .then(([nextReports, nextStats]) => {
        setReports(nextReports);
        setStats(nextStats);
      })
      .catch(() => setError("Data publik belum dapat dimuat."))
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo(() => ({ reports, stats, isLoading, error }), [error, isLoading, reports, stats]);
  return <LandingDataContext.Provider value={value}>{children}</LandingDataContext.Provider>;
}

function useLandingData() {
  return useContext(LandingDataContext);
}

const statusLabels: Record<string, string> = {
  REPORTED: "Dilaporkan",
  VERIFIED: "Terverifikasi",
  IN_PROGRESS: "Sedang ditangani",
  RESOLVED: "Selesai",
};

function StatValue({ value }: { value: number | undefined }) {
  return <strong>{value === undefined ? "—" : value}<span>{value === undefined ? "" : "+"}</span></strong>;
}

export function LandingImpact() {
  const { stats, isLoading, error } = useLandingData();
  return (
    <section className="landing-wrap landing-impact" aria-label="Statistik publik JALANIN" aria-busy={isLoading}>
      <div className="landing-impact-intro"><p className="landing-eyebrow"><span />Dampak yang terlihat</p><h2>Setiap laporan<br /><em>punya arti.</em></h2>{error && <p className="landing-data-note">Statistik publik belum tersedia.</p>}</div>
      <div className="landing-stat"><StatValue value={stats?.total} /><span>Laporan publik</span></div>
      <div className="landing-stat"><StatValue value={stats?.inProgress} /><span>Sedang ditangani</span></div>
      <div className="landing-stat"><StatValue value={stats?.resolved} /><span>Sudah selesai</span></div>
    </section>
  );
}

export function LandingMapPreview() {
  const { reports, isLoading, error } = useLandingData();
  const hasMapsKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  return (
    <div className="landing-map-frame">
      {hasMapsKey && !error ? <GoogleRoadMap reports={reports} /> : <div className="landing-map-empty" role="status"><span className="landing-map-empty-icon" aria-hidden="true">⌖</span><strong>{error ? "Peta publik belum tersedia" : "Peta publik JALANIN"}</strong><p>{hasMapsKey ? (isLoading ? "Memuat laporan publik..." : "Belum ada laporan publik di area ini.") : "Tambahkan Google Maps API key untuk mengaktifkan peta interaktif."}</p><Link href="/map" className="landing-text-link">Buka halaman peta <span aria-hidden="true">↗</span></Link></div>}
    </div>
  );
}

export function LandingLatestReports() {
  const { reports, isLoading, error } = useLandingData();
  const latestReports = reports.slice(0, 3);

  return (
    <div className="landing-report-grid" aria-busy={isLoading}>
      {latestReports.map((report) => {
        const severity = report.damage?.severity || "LOW";
        const levelClass = report.status === "RESOLVED" ? "resolved" : severity === "HIGH" ? "high" : "medium";
        return <Link className="landing-report-tile" href={`/reports/${report.id}`} key={report.id}>
          <div className={`landing-report-image landing-report-image-${levelClass}`} style={report.photo?.downloadUrl ? { backgroundImage: `url(${report.photo.downloadUrl})` } : undefined}>
            <span className={`landing-report-level ${levelClass}`}>{severity} · {statusLabels[report.status || "REPORTED"] || "Dilaporkan"}</span>
          </div>
          <div className="landing-report-body"><h3>{report.damage?.type || "Kondisi jalan"}</h3><p>{report.location ? `${report.location.latitude?.toFixed(4)}, ${report.location.longitude?.toFixed(4)}` : "Lokasi tersedia di detail laporan"}</p><div><span className={`landing-status-dot ${levelClass}`} />{statusLabels[report.status || "REPORTED"] || "Dilaporkan"}<span className="landing-report-arrow" aria-hidden="true">↗</span></div></div>
        </Link>;
      })}
      {!isLoading && latestReports.length === 0 && <div className="landing-data-empty"><strong>{error ? "Laporan publik belum tersedia" : "Belum ada laporan publik"}</strong><p>{error || "Jadilah warga pertama yang membagikan kondisi jalan di sekitarmu."}</p><Link href="/reports/new" className="landing-text-link">Buat laporan <span aria-hidden="true">↗</span></Link></div>}
    </div>
  );
}
