import { NextResponse } from "next/server";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";

export async function GET() {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ success: false, error: { code: "SERVER_NOT_CONFIGURED", message: "Server belum dikonfigurasi." } }, { status: 503 });
  }

  try {
    const snapshot = await getAdminDb().collection("reports").where("visibility", "==", "public").get();
    const reports = snapshot.docs.map((report) => report.data());
    const stats = {
      total: reports.length,
      verified: reports.filter((report) => report.status === "VERIFIED").length,
      inProgress: reports.filter((report) => report.status === "IN_PROGRESS").length,
      resolved: reports.filter((report) => report.status === "RESOLVED").length,
      highPriority: reports.filter((report) => (report.priority as { classification?: string } | undefined)?.classification === "HIGH").length,
    };
    return NextResponse.json({ success: true, data: stats }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Public stats query failed", {
      name: error instanceof Error ? error.name : "unknown_error",
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ success: false, error: { code: "PUBLIC_STATS_FAILED", message: "Statistik publik belum dapat dimuat." } }, { status: 500 });
  }
}
