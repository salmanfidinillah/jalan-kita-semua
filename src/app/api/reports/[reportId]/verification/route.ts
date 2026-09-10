import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { calculatePriority } from "@/lib/domain/report";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
const choices = new Set(["STILL_EXISTS", "RESOLVED"]);

export async function PUT(request: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  if (!isFirebaseAdminConfigured()) return NextResponse.json({ success: false, error: { code: "SERVER_NOT_CONFIGURED", message: "Server belum dikonfigurasi." } }, { status: 503 });
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return NextResponse.json({ success: false, error: { code: "UNAUTHENTICATED", message: "Login diperlukan." } }, { status: 401 });

  try {
    const user = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const rate = checkRateLimit(`verification:${user.uid}`, 30, 15 * 60 * 1000);
    if (!rate.allowed) return NextResponse.json({ success: false, error: { code: "RATE_LIMITED", message: "Terlalu banyak verifikasi. Coba lagi nanti." } }, { status: 429 });
    const { reportId } = await params;
    const input = await request.json() as { choice?: string };
    if (!choices.has(input.choice || "")) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Pilihan verifikasi tidak valid." } }, { status: 400 });

    const db = getAdminDb();
    const reportRef = db.collection("reports").doc(reportId);
    const verificationRef = reportRef.collection("verifications").doc(user.uid);
    const userRef = db.collection("users").doc(user.uid);
    const result = await db.runTransaction(async (transaction) => {
      const reportSnapshot = await transaction.get(reportRef);
      const currentVerificationSnapshot = await transaction.get(verificationRef);
      const verificationSnapshots = await transaction.get(reportRef.collection("verifications"));
      const userSnapshot = await transaction.get(userRef);
      if (!reportSnapshot.exists) throw new Error("NOT_FOUND");
      const report = reportSnapshot.data() as { reporterId?: string; damage?: { severity?: string }; riskFactor?: { value?: number } };
      if (report.reporterId === user.uid) throw new Error("OWNER_FORBIDDEN");
      const choicesList = verificationSnapshots.docs.filter((item) => item.id !== user.uid).map((item) => item.data().choice);
      choicesList.push(input.choice);
      const stillExistsCount = choicesList.filter((choice) => choice === "STILL_EXISTS").length;
      const resolvedCount = choicesList.filter((choice) => choice === "RESOLVED").length;
      const totalCount = choicesList.length;
      const stillExistsRatio = totalCount ? stillExistsCount / totalCount : 0;
      const priority = calculatePriority(report.damage?.severity || "LOW", stillExistsRatio, report.riskFactor?.value ?? 50);
      const verifiedAt = new Date();
      transaction.set(verificationRef, { userId: user.uid, choice: input.choice, ...(currentVerificationSnapshot.exists ? {} : { createdAt: new Date() }), updatedAt: new Date() }, { merge: true });
      if (!currentVerificationSnapshot.exists && userSnapshot.exists) {
        const profile = userSnapshot.data() as { contributionCount?: number; verificationCount?: number };
        transaction.update(userRef, { contributionCount: (profile.contributionCount || 0) + 1, verificationCount: (profile.verificationCount || 0) + 1, updatedAt: new Date() });
      }
      transaction.update(reportRef, { verificationSummary: { stillExistsCount, resolvedCount, totalCount, stillExistsRatio, confidence: Math.max(stillExistsRatio, 1 - stillExistsRatio) * 100, lastVerifiedAt: verifiedAt }, priority: { ...priority, formulaVersion: "v1", calculatedAt: verifiedAt }, updatedAt: verifiedAt });
      return { stillExistsCount, resolvedCount, totalCount, stillExistsRatio, confidence: Math.max(stillExistsRatio, 1 - stillExistsRatio) * 100, lastVerifiedAt: { seconds: Math.floor(verifiedAt.getTime() / 1000) }, priority };
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "NOT_FOUND") return NextResponse.json({ success: false, error: { code, message: "Laporan tidak ditemukan." } }, { status: 404 });
    if (code === "OWNER_FORBIDDEN") return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Pembuat laporan tidak dapat memverifikasi laporannya sendiri." } }, { status: 403 });
    return NextResponse.json({ success: false, error: { code: "VERIFICATION_FAILED", message: "Verifikasi gagal disimpan." } }, { status: 500 });
  }
}
