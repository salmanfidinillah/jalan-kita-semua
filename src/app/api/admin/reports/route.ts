import { NextRequest, NextResponse } from "next/server";
import { assertAdmin, getAdminAuth, getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";

type AdminReportData = { id: string; status?: string; [key: string]: unknown };

export async function GET(request: NextRequest) {
  if (!isFirebaseAdminConfigured()) return NextResponse.json({ success: false, error: { code: "SERVER_NOT_CONFIGURED", message: "Server belum dikonfigurasi." } }, { status: 503 });
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return NextResponse.json({ success: false, error: { code: "UNAUTHENTICATED", message: "Login diperlukan." } }, { status: 401 });

  try {
    const user = await getAdminAuth().verifyIdToken(authorization.slice(7));
    await assertAdmin(user.uid);
    const status = request.nextUrl.searchParams.get("status");
    const snapshot = await getAdminDb().collection("reports").orderBy("createdAt", "desc").limit(50).get();
    const reports = snapshot.docs
      .map((report) => ({ id: report.id, ...report.data() }) as AdminReportData)
      .filter((report) => !status || report.status === status);
    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    const code = error instanceof Error && error.message === "FORBIDDEN" ? "FORBIDDEN" : "ADMIN_REPORTS_FAILED";
    return NextResponse.json({ success: false, error: { code, message: code === "FORBIDDEN" ? "Akses admin diperlukan." : "Laporan admin belum dapat dimuat." } }, { status: code === "FORBIDDEN" ? 403 : 500 });
  }
}