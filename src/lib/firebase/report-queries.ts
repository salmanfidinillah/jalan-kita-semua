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
  const snapshot = await getDocs(
    query(collection(getFirebaseDb(), "reports"), where("visibility", "==", "public"), orderBy("createdAt", "desc"), limit(maxReports)),
  );
  return toReportListItem(snapshot);
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
  const reports = collection(getFirebaseDb(), "reports");
  const [total, verified, inProgress, resolved, highPriority] = await Promise.all([
    getCountFromServer(query(reports, where("visibility", "==", "public"))),
    getCountFromServer(query(reports, where("visibility", "==", "public"), where("status", "==", "VERIFIED"))),
    getCountFromServer(query(reports, where("visibility", "==", "public"), where("status", "==", "IN_PROGRESS"))),
    getCountFromServer(query(reports, where("visibility", "==", "public"), where("status", "==", "RESOLVED"))),
    getCountFromServer(query(reports, where("visibility", "==", "public"), where("priority.classification", "==", "HIGH"))),
  ]);

  return {
    total: total.data().count,
    verified: verified.data().count,
    inProgress: inProgress.data().count,
    resolved: resolved.data().count,
    highPriority: highPriority.data().count,
  };
}
