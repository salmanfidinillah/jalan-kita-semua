import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ success: false, error: { code: "SERVER_NOT_CONFIGURED", message: "Server belum dikonfigurasi." } }, { status: 503 });
  }
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHENTICATED", message: "Login diperlukan." } }, { status: 401 });
  }

  try {
    const user = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const { reportId } = await params;
    const db = getAdminDb();
    const reportRef = db.collection("reports").doc(reportId);
    const userRef = db.collection("users").doc(user.uid);
    await db.runTransaction(async (transaction) => {
      const reportSnapshot = await transaction.get(reportRef);
      if (!reportSnapshot.exists) throw new Error("NOT_FOUND");
      const report = reportSnapshot.data() || {};
      if (report.reporterId !== user.uid) throw new Error("FORBIDDEN");
      if ((report.accounting as { reportCountApplied?: boolean } | undefined)?.reportCountApplied === true) return;

      const profileSnapshot = await transaction.get(userRef);
      const profile = profileSnapshot.data() || {};
      const now = new Date();
      if (profileSnapshot.exists) {
        transaction.update(userRef, {
          reportCount: Number(profile.reportCount || 0) + 1,
          contributionCount: Number(profile.contributionCount || 0) + 1,
          updatedAt: now,
        });
      }
      transaction.update(reportRef, { accounting: { reportCountApplied: true, appliedAt: now }, updatedAt: now });
    });
    return NextResponse.json({ success: true, data: { reportCountApplied: true } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "NOT_FOUND") return NextResponse.json({ success: false, error: { code, message: "Laporan tidak ditemukan." } }, { status: 404 });
    if (code === "FORBIDDEN") return NextResponse.json({ success: false, error: { code, message: "Akses laporan ditolak." } }, { status: 403 });
    console.error("Report accounting failed", error instanceof Error ? error.name : "unknown_error");
    return NextResponse.json({ success: false, error: { code: "ACCOUNTING_FAILED", message: "Counter laporan belum dapat diperbarui." } }, { status: 500 });
  }
}
