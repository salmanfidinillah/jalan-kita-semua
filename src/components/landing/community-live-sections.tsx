"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GoogleRoadMap } from "@/components/maps/google-road-map";
import type { ReportListItem } from "@/lib/firebase/report-queries";

type Stats = { total: number; inProgress: number; resolved: number };

async function loadJson<T>(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  const payload = await response.json() as { success?: boolean; data?: T; error?: { message?: string } };
  if (!response.ok || !payload.success) throw new Error(payload.error?.message || "Data publik belum dapat dimuat.");
  return payload.data as T;
}

export function CommunityStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadJson<{ total: number; inProgress: number; resolved: number }>("/api/public/stats")
      .then(setStats)
      .catch(() => setError(true));
  }, []);

  return <section className="impact-strip section-wrap" aria-label="Statistik publik JALANIN" aria-busy={!stats && !error}><div><strong>{stats ? `${stats.total}` : "—"}<span>{stats ? "+" : ""}</span></strong><span>Laporan publik</span></div><div><strong>{stats ? `${stats.inProgress}` : "—"}<span>{stats ? "+" : ""}</span></strong><span>Sedang ditangani</span></div><div><strong>{stats ? `${stats.resolved}` : "—"}<span>{stats ? "+" : ""}</span></strong><span>Sudah selesai</span></div><p>{error ? "Statistik publik belum tersedia." : "Data publik yang membantu"}<br />kota bergerak lebih cepat.</p></section>;
}

export function CommunityMapPreview() {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadJson<ReportListItem[]>("/api/public/reports?limit=100")
      .then(setReports)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Peta publik belum tersedia."));
  }, []);

  if (error) return <div className="map-preview"><div className="map-live-empty"><strong>Peta publik belum tersedia</strong><p>{error}</p><Link href="/map" className="text-link">Buka halaman peta <span>-&gt;</span></Link></div></div>;
  return <div className="map-preview live-map"><GoogleRoadMap reports={reports} /></div>;
}

export function CommunityLatestReports() {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadJson<ReportListItem[]>("/api/public/reports?limit=6")
      .then(setReports)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Laporan publik belum tersedia."));
  }, []);

  if (error) return <div className="report-grid"><div className="community-empty"><strong>Laporan publik belum tersedia</strong><p>{error}</p><Link href="/map" className="text-link">Buka peta kondisi <span>-&gt;</span></Link></div></div>;
  if (reports.length === 0) return <div className="report-grid"><div className="community-empty"><strong>Belum ada laporan publik</strong><p>Jadilah warga pertama yang membagikan kondisi jalan di sekitarmu.</p><Link href="/reports/new" className="text-link">Buat laporan <span>-&gt;</span></Link></div></div>;

  return <div className="report-grid">{reports.slice(0, 3).map((report) => {
    const severity = report.damage?.severity || "LOW";
    const levelClass = report.status === "RESOLVED" ? "resolved" : severity === "HIGH" ? "high" : "medium";
    return <Link className="report-card" href={`/reports/${report.id}`} key={report.id}><div className={`report-image report-image-live ${levelClass}`} style={report.photo?.downloadUrl ? { backgroundImage: `url(${report.photo.downloadUrl})` } : undefined}><span className={`report-level ${levelClass}`}>{severity} · {report.status || "REPORTED"}</span></div><div className="report-body"><h3>{report.damage?.type || "Kondisi jalan"}</h3><p className="report-location">{report.location?.latitude?.toFixed(4)}, {report.location?.longitude?.toFixed(4)}</p><div className="report-status"><span className={`status-dot ${levelClass}`} />{report.status || "REPORTED"}<span className="report-arrow">-&gt;</span></div></div></Link>;
  })}</div>;
}
