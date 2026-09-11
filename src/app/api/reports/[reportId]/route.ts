import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { projectPublicReport, serializeStatusHistory } from "@/lib/server/public-report";

export const runtime = "nodejs";

async function getViewer(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  try {
    const token = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const profile = await getAdminDb().collection("users").doc(token.uid).get();
    return { uid: token.uid, isAdmin: profile.data()?.role === "admin" && profile.data()?.isActive === true };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ success: false, error: { code: "SERVER_NOT_CONFIGURED", message: "Server belum dikonfigurasi." } }, { status: 503 });
  }

  try {
    const { reportId } = await params;
    const db = getAdminDb();
    const reportRef = db.collection("reports").doc(reportId);
    const reportSnapshot = await reportRef.get();
    if (!reportSnapshot.exists) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Laporan tidak ditemukan." } }, { status: 404 });
    }

    const report = reportSnapshot.data() || {};
    const viewer = await getViewer(request);
    const isOwner = Boolean(viewer && report.reporterId === viewer.uid);
    const canView = report.visibility === "public" || isOwner || viewer?.isAdmin;
    if (!canView) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Laporan tidak ditemukan." } }, { status: 404 });
    }

    const historySnapshot = await reportRef.collection("statusHistory").orderBy("createdAt", "asc").get();
    const verificationSnapshot = viewer
      ? await reportRef.collection("verifications").doc(viewer.uid).get()
      : null;
    const projectedReport = projectPublicReport(reportId, report, isOwner || Boolean(viewer?.isAdmin));
    const data = {
      report: { ...projectedReport, isOwner },
      statusHistory: historySnapshot.docs.map((history) => serializeStatusHistory(history.id, history.data())),
      userChoice: verificationSnapshot?.exists ? verificationSnapshot.data()?.choice || null : null,
    };
    return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Report detail query failed", error instanceof Error ? error.name : "unknown_error");
    return NextResponse.json({ success: false, error: { code: "REPORT_DETAIL_FAILED", message: "Laporan belum dapat dimuat." } }, { status: 500 });
  }
}
