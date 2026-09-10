import { NextRequest, NextResponse } from "next/server";
import { AI_PROMPT_VERSION, buildRoadAnalysisPrompt, parseAiResponse } from "@/lib/ai/analysis";
import { getAdminAccessToken, getAdminAuth, getAdminDb, getAdminStorage, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type ReportData = { reporterId?: string; photo?: { storagePath?: string }; aiAnalysis?: { attempts?: number } };

function jsonError(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  const reportId = (await params).reportId;
  const apiKey = process.env.AI_PROVIDER_API_KEY;
  let markUnexpectedFailure: (() => Promise<void>) | null = null;
  if (!isFirebaseAdminConfigured()) return jsonError("AI_NOT_CONFIGURED", "AI belum dikonfigurasi di server.", 503);
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return jsonError("UNAUTHENTICATED", "Login diperlukan.", 401);

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const rate = checkRateLimit(`ai:${decodedToken.uid}`, 5, 15 * 60 * 1000);
    if (!rate.allowed) return jsonError("RATE_LIMITED", "Terlalu banyak permintaan analisis. Coba lagi nanti.", 429);
    const db = getAdminDb();
    const reportRef = db.collection("reports").doc(reportId);
    const reportSnapshot = await reportRef.get();
    if (!reportSnapshot.exists) return jsonError("NOT_FOUND", "Laporan tidak ditemukan.", 404);
    const report = reportSnapshot.data() as ReportData;
    if (report.reporterId !== decodedToken.uid) return jsonError("FORBIDDEN", "Hanya pembuat laporan yang dapat menjalankan analisis.", 403);
    if (!report.photo?.storagePath) return jsonError("VALIDATION_ERROR", "Foto laporan tidak tersedia.", 400);

    const modelName = process.env.AI_MODEL_NAME || "gemini-2.5-flash";
    const model = apiKey ? modelName : `vertex-ai/${modelName}`;
    const analysisRef = db.collection("ai_analyses").doc();
    const analysisId = analysisRef.id;
    const attempts = (report.aiAnalysis?.attempts || 0) + 1;
    const startedAt = new Date();
    const baseAnalysis = { analysisId, reportId, userId: decodedToken.uid, model, promptVersion: AI_PROMPT_VERSION, attempts, startedAt };

    const markFailure = async (errorCode: string) => {
      const failedAt = new Date();
      const batch = db.batch();
      batch.set(analysisRef, { ...baseAnalysis, status: "FAILED", errorCode, failedAt });
      batch.update(reportRef, { aiAnalysis: { ...baseAnalysis, status: "FAILED", errorCode, failedAt }, updatedAt: failedAt });
      try { await batch.commit(); } catch { /* Keep the provider error response safe if persistence also fails. */ }
    };
    markUnexpectedFailure = () => markFailure("AI_ANALYSIS_FAILED");

    const imageFile = getAdminStorage().bucket().file(report.photo.storagePath);
    const [metadata] = await imageFile.getMetadata();
    const mimeType = metadata.contentType || "";
    const sizeBytes = Number(metadata.size || 0);
    if (!SUPPORTED_IMAGE_TYPES.has(mimeType) || !Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_IMAGE_BYTES) {
      await markFailure("INVALID_IMAGE");
      return jsonError("INVALID_IMAGE", "Foto harus berupa JPG, PNG, atau WebP dengan ukuran maksimal 8 MB.", 400);
    }

    const processingBatch = db.batch();
    processingBatch.set(analysisRef, { ...baseAnalysis, status: "PROCESSING" });
    processingBatch.update(reportRef, { aiAnalysis: { ...baseAnalysis, status: "PROCESSING" }, updatedAt: startedAt });
    await processingBatch.commit();

    const [imageBuffer] = await imageFile.download();
    const vertexLocation = process.env.AI_VERTEX_LOCATION || "us-central1";
    const vertexMode = !apiKey;
    const endpoint = vertexMode
      ? `https://${vertexLocation}-aiplatform.googleapis.com/v1/projects/${process.env.FIREBASE_ADMIN_PROJECT_ID}/locations/${vertexLocation}/publishers/google/models/${modelName}:generateContent`
      : `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (vertexMode) headers.Authorization = `Bearer ${await getAdminAccessToken()}`;
    const aiResponse = await fetch(endpoint, {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({ contents: [{ parts: [{ text: buildRoadAnalysisPrompt() }, { inlineData: { mimeType, data: imageBuffer.toString("base64") } }] }] }),
    });
    if (!aiResponse.ok) {
      await markFailure("AI_PROVIDER_ERROR");
      return jsonError("AI_PROVIDER_ERROR", "Layanan AI sedang tidak tersedia.", 503);
    }

    const aiPayload = await aiResponse.json() as { candidates?: Array<{ finishReason?: string; content?: { parts?: Array<{ text?: string }> } }> };
    const candidate = aiPayload.candidates?.[0];
    const modelText = candidate?.content?.parts?.map((part) => part.text || "").join("\n") || "";
    if (!modelText || candidate?.finishReason === "SAFETY" || candidate?.finishReason === "RECITATION") {
      await markFailure("AI_INVALID_RESPONSE");
      return jsonError("AI_INVALID_RESPONSE", "AI mengembalikan hasil yang tidak dapat digunakan.", 502);
    }

    let result;
    try { result = parseAiResponse(modelText); } catch {
      await markFailure("AI_INVALID_RESPONSE");
      return jsonError("AI_INVALID_RESPONSE", "AI mengembalikan format hasil yang tidak valid.", 502);
    }

    const completedAt = new Date();
    const completedAnalysis = { ...baseAnalysis, status: "COMPLETED", damageType: result.damageType, severity: result.severity, confidence: result.confidence, description: result.description, observations: result.observations, completedAt };
    const completedBatch = db.batch();
    completedBatch.set(analysisRef, completedAnalysis);
    completedBatch.update(reportRef, { aiAnalysis: completedAnalysis, updatedAt: completedAt });
    await completedBatch.commit();
    return NextResponse.json({ success: true, data: { ...result, status: "COMPLETED", model, analysisId } });
  } catch (error) {
    if (markUnexpectedFailure) await markUnexpectedFailure();
    console.error("AI analysis request failed", error instanceof Error ? error.name : "unknown_error");
    return jsonError("AI_ANALYSIS_FAILED", "Analisis gagal. Silakan coba lagi.", 500);
  }
}
