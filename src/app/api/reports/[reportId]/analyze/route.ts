import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, getAdminStorage, isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";

const damageTypes = new Set(["POTHOLE", "CRACK", "BROKEN_SURFACE", "FLOODING", "ROAD_OBSTRUCTION", "OTHER"]);
const severities = new Set(["LOW", "MEDIUM", "HIGH"]);

function parseModelJson(text: string) {
  const jsonText = text.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonText) throw new Error("AI returned no JSON.");
  const parsed = JSON.parse(jsonText) as Record<string, unknown>;
  const damageType = String(parsed.damage_type || "");
  const severity = String(parsed.severity || "");
  const confidence = Number(parsed.confidence);
  const description = String(parsed.description || "").trim();

  if (!damageTypes.has(damageType) || !severities.has(severity) || !Number.isFinite(confidence) || confidence < 0 || confidence > 1 || !description || description.length > 500) {
    throw new Error("AI response tidak sesuai schema.");
  }

  return { damageType, severity, confidence, description };
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  const reportId = (await params).reportId;
  const apiKey = process.env.AI_PROVIDER_API_KEY;
  if (!isFirebaseAdminConfigured() || !apiKey) {
    return NextResponse.json({ success: false, error: { code: "AI_NOT_CONFIGURED", message: "AI belum dikonfigurasi di server." } }, { status: 503 });
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHENTICATED", message: "Login diperlukan." } }, { status: 401 });
  }

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const reportRef = getAdminDb().collection("reports").doc(reportId);
    const reportSnapshot = await reportRef.get();
    if (!reportSnapshot.exists) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Laporan tidak ditemukan." } }, { status: 404 });
    }

    const report = reportSnapshot.data() as { reporterId?: string; photo?: { storagePath?: string } };
    if (report.reporterId !== decodedToken.uid) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Hanya pembuat laporan yang dapat menjalankan analisis." } }, { status: 403 });
    }
    if (!report.photo?.storagePath) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Foto laporan tidak tersedia." } }, { status: 400 });
    }

    const imageFile = getAdminStorage().bucket().file(report.photo.storagePath);
    const [imageBuffer] = await imageFile.download();
    const [metadata] = await imageFile.getMetadata();
    const mimeType = metadata.contentType || "image/jpeg";
    const model = process.env.AI_MODEL_NAME || "gemini-2.5-flash";
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Analyze this road condition photo. Return JSON only with damage_type (POTHOLE, CRACK, BROKEN_SURFACE, FLOODING, ROAD_OBSTRUCTION, OTHER), severity (LOW, MEDIUM, HIGH), confidence (0 to 1), and description (max 500 characters). Be conservative when the image is unclear." },
            { inlineData: { mimeType, data: imageBuffer.toString("base64") } },
          ],
        }],
      }),
    });

    if (!aiResponse.ok) {
      return NextResponse.json({ success: false, error: { code: "AI_PROVIDER_ERROR", message: "Layanan AI sedang tidak tersedia." } }, { status: 503 });
    }

    const aiPayload = await aiResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const modelText = aiPayload.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const result = parseModelJson(modelText);
    await reportRef.update({
      aiAnalysis: {
        status: "COMPLETED",
        damageType: result.damageType,
        severity: result.severity,
        confidence: result.confidence,
        description: result.description,
        model,
        analyzedAt: new Date(),
      },
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("AI analysis failed", error);
    return NextResponse.json({ success: false, error: { code: "AI_ANALYSIS_FAILED", message: "Analisis gagal. Silakan coba lagi." } }, { status: 500 });
  }
}
