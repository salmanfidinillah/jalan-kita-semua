import { collection, doc, getCountFromServer, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import type { DocumentData, QuerySnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

export type ReportListItem = {
  id: string;
  photo?: { downloadUrl?: string };
  location?: { latitude?: number; longitude?: number };
  damage?: { type?: string; severity?: string };
  priority?: { score?: number; classification?: string };
  status?: string;
  reporterDisplayName?: string;
  createdAt?: { seconds?: number };
};

function toReportListItem(snapshot: QuerySnapshot<DocumentData>) {
  return snapshot.docs.map((report) => ({ id: report.id, ...report.data() })) as ReportListItem[];
}

export async function getPublicReports(maxReports = 100) {
  const response = await fetch(`/api/public/reports?limit=${Math.min(100, Math.max(1, maxReports))}`, { cache: "no-store" });
  const payload = await response.json() as { success?: boolean; data?: ReportListItem[]; error?: { message?: string } };
  if (!response.ok || !payload.success) throw new Error(payload.error?.message || "Laporan publik belum dapat dimuat.");
  return payload.data || [];
}

export async function getReportsByUser(userId: string, maxReports = 20) {
  const snapshot = await getDocs(
    query(
      collection(getFirebaseDb(), "reports"),
      where("reporterId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(maxReports),
    ),
  );
  return toReportListItem(snapshot);
}

export async function getUserReportStats(userId: string) {
  const reports = collection(getFirebaseDb(), "reports");
  const [total, reported, verified, inProgress, resolved] = await Promise.all([
    getCountFromServer(query(reports, where("reporterId", "==", userId))),
    getCountFromServer(query(reports, where("reporterId", "==", userId), where("status", "==", "REPORTED"))),
    getCountFromServer(query(reports, where("reporterId", "==", userId), where("status", "==", "VERIFIED"))),
    getCountFromServer(query(reports, where("reporterId", "==", userId), where("status", "==", "IN_PROGRESS"))),
    getCountFromServer(query(reports, where("reporterId", "==", userId), where("status", "==", "RESOLVED"))),
  ]);

  return {
    total: total.data().count,
    active: reported.data().count + verified.data().count + inProgress.data().count,
    resolved: resolved.data().count,
  };
}

export async function getUserProfileSummary(userId: string) {
  const snapshot = await getDoc(doc(getFirebaseDb(), "users", userId));
  const data = snapshot.data() as { contributionCount?: number; reportCount?: number; verificationCount?: number } | undefined;
  return {
    contributionCount: data?.contributionCount || 0,
    reportCount: data?.reportCount || 0,
    verificationCount: data?.verificationCount || 0,
  };
}

export async function getPublicReportStats() {
  const response = await fetch("/api/public/stats", { cache: "no-store" });
  const payload = await response.json() as { success?: boolean; data?: { total: number; verified: number; inProgress: number; resolved: number; highPriority: number }; error?: { message?: string } };
  if (!response.ok || !payload.success) throw new Error(payload.error?.message || "Statistik publik belum dapat dimuat.");
  return payload.data || { total: 0, verified: 0, inProgress: 0, resolved: 0, highPriority: 0 };
}
