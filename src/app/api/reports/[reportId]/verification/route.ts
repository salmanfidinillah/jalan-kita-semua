import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";
const choices = new Set(["STILL_EXISTS", "RESOLVED"]);

function calculatePriority(severity: string, stillExistsRatio: number, riskValue: number) {
  const severityValue = severity === "HIGH" ? 100 : severity === "MEDIUM" ? 60 : 25;
  const communityValue = stillExistsRatio * 100;
  const score = Math.round(severityValue * 0.5 + communityValue * 0.3 + riskValue * 0.2);
  return { score, classification: score >= 80 ? "HIGH" : score >= 50 ? "MEDIUM" : "LOW", severityValue, communityValue };
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  if (!isFirebaseAdminConfigured()) return NextResponse.json({ success: false, error: { code: "SERVER_NOT_CONFIGURED", message: "Server belum dikonfigurasi." } }, { status: 503 });
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return NextResponse.json({ success: false, error: { code: "UNAUTHENTICATED", message: "Login diperlukan." } }, { status: 401 });

  try {
    const user = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const { reportId } = await params;
    const input = await request.json() as { choice?: string };
    if (!choices.has(input.choice || "")) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Pilihan verifikasi tidak valid." } }, { status: 400 });

    const db = getAdminDb();
    const reportRef = db.collection("reports").doc(reportId);
    const verificationRef = reportRef.collection("verifications").doc(user.uid);
    const result = await db.runTransaction(async (transaction) => {
      const reportSnapshot = await transaction.get(reportRef);
      if (!reportSnapshot.exists) throw new Error("NOT_FOUND");
      const report = reportSnapshot.data() as { reporterId?: string; damage?: { severity?: string }; riskFactor?: { value?: number } };
      if (report.reporterId === user.uid) throw new Error("OWNER_FORBIDDEN");
      const verificationSnapshots = await reportRef.collection("verifications").get();
      const choicesList = verificationSnapshots.docs.filter((item) => item.id !== user.uid).map((item) => item.data().choice);
      choicesList.push(input.choice);
      const stillExistsCount = choicesList.filter((choice) => choice === "STILL_EXISTS").length;
      const resolvedCount = choicesList.filter((choice) => choice === "RESOLVED").length;
      const totalCount = choicesList.length;
      const stillExistsRatio = totalCount ? stillExistsCount / totalCount : 0;
      const priority = calculatePriority(report.damage?.severity || "LOW", stillExistsRatio, report.riskFactor?.value ?? 50);
      transaction.set(verificationRef, { userId: user.uid, choice: input.choice, updatedAt: new Date() }, { merge: true });
      transaction.update(reportRef, { verificationSummary: { stillExistsCount, resolvedCount, totalCount, stillExistsRatio, confidence: Math.max(stillExistsRatio, 1 - stillExistsRatio) * 100, lastVerifiedAt: new Date() }, priority: { ...priority, riskValue: report.riskFactor?.value ?? 50, formulaVersion: "v1", calculatedAt: new Date() }, updatedAt: new Date() });
      return { stillExistsCount, resolvedCount, totalCount, priority };
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "NOT_FOUND") return NextResponse.json({ success: false, error: { code, message: "Laporan tidak ditemukan." } }, { status: 404 });
    if (code === "OWNER_FORBIDDEN") return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Pembuat laporan tidak dapat memverifikasi laporannya sendiri." } }, { status: 403 });
    return NextResponse.json({ success: false, error: { code: "VERIFICATION_FAILED", message: "Verifikasi gagal disimpan." } }, { status: 500 });
  }
}
