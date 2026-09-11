import { NextRequest, NextResponse } from "next/server";
import { assertAdmin, getAdminAuth, getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { canTransitionReportStatus, isReportStatus } from "@/lib/domain/report-status";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  if (!isFirebaseAdminConfigured()) return NextResponse.json({ success: false, error: { code: "SERVER_NOT_CONFIGURED", message: "Server belum dikonfigurasi." } }, { status: 503 });
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return NextResponse.json({ success: false, error: { code: "UNAUTHENTICATED", message: "Login diperlukan." } }, { status: 401 });

  try {
    const user = await getAdminAuth().verifyIdToken(authorization.slice(7));
    await assertAdmin(user.uid);
    const rate = checkRateLimit(`admin-status:${user.uid}`, 60, 15 * 60 * 1000);
    if (!rate.allowed) return NextResponse.json({ success: false, error: { code: "RATE_LIMITED", message: "Terlalu banyak perubahan status. Coba lagi nanti." } }, { status: 429 });
    const { reportId } = await params;
    const input = await request.json() as { status?: string; note?: string };
    if (!isReportStatus(input.status) || (input.note && input.note.length > 500)) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Status atau catatan tidak valid." } }, { status: 400 });
    const nextStatus = input.status;

    const db = getAdminDb();
    const reportRef = db.collection("reports").doc(reportId);
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reportRef);
      if (!snapshot.exists) throw new Error("NOT_FOUND");
      const currentStatus = snapshot.data()?.status || "REPORTED";
      if (!isReportStatus(currentStatus) || !canTransitionReportStatus(currentStatus, nextStatus)) throw new Error("INVALID_STATUS_TRANSITION");
      const historyRef = reportRef.collection("statusHistory").doc();
      const logRef = db.collection("admin_logs").doc();
      const changedAt = new Date();
      transaction.update(reportRef, { status: nextStatus, resolvedAt: nextStatus === "RESOLVED" ? new Date() : null, updatedAt: new Date() });
      transaction.set(historyRef, { fromStatus: currentStatus, toStatus: nextStatus, changedBy: user.uid, changedByRole: "admin", note: input.note?.trim() || "Status diperbarui oleh admin.", createdAt: changedAt });
      transaction.set(logRef, { action: "STATUS_CHANGE", reportId, adminId: user.uid, fromStatus: currentStatus, toStatus: nextStatus, note: input.note?.trim() || null, createdAt: changedAt });
    });
    return NextResponse.json({ success: true, data: { status: nextStatus } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "FORBIDDEN") return NextResponse.json({ success: false, error: { code, message: "Akses admin diperlukan." } }, { status: 403 });
    if (code === "NOT_FOUND") return NextResponse.json({ success: false, error: { code, message: "Laporan tidak ditemukan." } }, { status: 404 });
    if (code === "INVALID_STATUS_TRANSITION") return NextResponse.json({ success: false, error: { code, message: "Perubahan status tidak mengikuti alur laporan yang valid." } }, { status: 409 });
    return NextResponse.json({ success: false, error: { code: "STATUS_UPDATE_FAILED", message: "Status gagal diperbarui." } }, { status: 500 });
  }
}
