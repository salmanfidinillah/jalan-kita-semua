import { NextRequest, NextResponse } from "next/server";
import { assertAdmin, getAdminAuth, getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";
const statuses = new Set(["REPORTED", "VERIFIED", "IN_PROGRESS", "RESOLVED"]);

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  if (!isFirebaseAdminConfigured()) return NextResponse.json({ success: false, error: { code: "SERVER_NOT_CONFIGURED", message: "Server belum dikonfigurasi." } }, { status: 503 });
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return NextResponse.json({ success: false, error: { code: "UNAUTHENTICATED", message: "Login diperlukan." } }, { status: 401 });

  try {
    const user = await getAdminAuth().verifyIdToken(authorization.slice(7));
    await assertAdmin(user.uid);
    const { reportId } = await params;
    const input = await request.json() as { status?: string; note?: string };
    if (!statuses.has(input.status || "")) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Status tidak valid." } }, { status: 400 });

    const db = getAdminDb();
    const reportRef = db.collection("reports").doc(reportId);
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reportRef);
      if (!snapshot.exists) throw new Error("NOT_FOUND");
      const currentStatus = snapshot.data()?.status || "REPORTED";
      const historyRef = reportRef.collection("statusHistory").doc();
      transaction.update(reportRef, { status: input.status, resolvedAt: input.status === "RESOLVED" ? new Date() : null, updatedAt: new Date() });
      transaction.set(historyRef, { fromStatus: currentStatus, toStatus: input.status, changedBy: user.uid, changedByRole: "admin", note: input.note?.trim() || "Status diperbarui oleh admin.", createdAt: new Date() });
    });
    return NextResponse.json({ success: true, data: { status: input.status } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "FORBIDDEN") return NextResponse.json({ success: false, error: { code, message: "Akses admin diperlukan." } }, { status: 403 });
    if (code === "NOT_FOUND") return NextResponse.json({ success: false, error: { code, message: "Laporan tidak ditemukan." } }, { status: 404 });
    return NextResponse.json({ success: false, error: { code: "STATUS_UPDATE_FAILED", message: "Status gagal diperbarui." } }, { status: 500 });
  }
}