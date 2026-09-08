import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";
const damageTypes = new Set(["POTHOLE", "CRACK", "BROKEN_SURFACE", "FLOODING", "ROAD_OBSTRUCTION", "OTHER"]);
const severities = new Set(["LOW", "MEDIUM", "HIGH"]);

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  if (!isFirebaseAdminConfigured()) return NextResponse.json({ success: false, error: { code: "SERVER_NOT_CONFIGURED", message: "Server belum dikonfigurasi." } }, { status: 503 });
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return NextResponse.json({ success: false, error: { code: "UNAUTHENTICATED", message: "Login diperlukan." } }, { status: 401 });

  try {
    const user = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const { reportId } = await params;
    const input = await request.json() as { damageType?: string; severity?: string; description?: string };
    const reportRef = getAdminDb().collection("reports").doc(reportId);
    const snapshot = await reportRef.get();
    if (!snapshot.exists) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Laporan tidak ditemukan." } }, { status: 404 });
    const report = snapshot.data() as { reporterId?: string; aiAnalysis?: { confidence?: number } };
    if (report.reporterId !== user.uid) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Hanya pembuat laporan yang dapat memeriksa hasil AI." } }, { status: 403 });
    if (!damageTypes.has(input.damageType || "") || !severities.has(input.severity || "") || !input.description?.trim() || input.description.length > 500) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Hasil review belum valid." } }, { status: 400 });

    await reportRef.update({
      "damage.type": input.damageType,
      "damage.severity": input.severity,
      "damage.description": input.description.trim(),
      "userReview": { reviewed: true, reviewedAt: new Date() },
      updatedAt: new Date(),
    });
    return NextResponse.json({ success: true, data: { damage: { type: input.damageType, severity: input.severity, description: input.description.trim() }, confidence: report.aiAnalysis?.confidence || 0 } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "REVIEW_FAILED", message: "Review gagal disimpan." } }, { status: 500 });
  }
}
