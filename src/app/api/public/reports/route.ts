import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { projectPublicReport } from "@/lib/server/public-report";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ success: false, error: { code: "SERVER_NOT_CONFIGURED", message: "Server belum dikonfigurasi." } }, { status: 503 });
  }

  const requestedLimit = Number(request.nextUrl.searchParams.get("limit") || 100);
  const limit = Number.isFinite(requestedLimit) ? Math.min(100, Math.max(1, Math.floor(requestedLimit))) : 100;

  try {
    const snapshot = await getAdminDb().collection("reports").where("visibility", "==", "public").orderBy("createdAt", "desc").limit(limit).get();
    const reports = snapshot.docs.map((report) => projectPublicReport(report.id, report.data()));
    return NextResponse.json({ success: true, data: reports }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Public reports query failed", {
      name: error instanceof Error ? error.name : "unknown_error",
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ success: false, error: { code: "PUBLIC_REPORTS_FAILED", message: "Laporan publik belum dapat dimuat." } }, { status: 500 });
  }
}
