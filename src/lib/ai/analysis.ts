import {
  DAMAGE_TYPES,
  SEVERITIES,
  type DamageType,
  type Severity,
  isDamageType,
  isSeverity,
} from "@/lib/domain/report";

export const AI_PROMPT_VERSION = "road-damage-v1";

export type AiAnalysisResult = {
  damageType: DamageType;
  severity: Severity;
  confidence: number;
  description: string;
  observations: string[];
};

export function buildRoadAnalysisPrompt() {
  return `Analyze the road condition in this image. Return JSON only, with no markdown and exactly these fields:
{
  "damage_type": "POTHOLE | CRACK | BROKEN_SURFACE | FLOODING | ROAD_OBSTRUCTION | OTHER",
  "severity": "LOW | MEDIUM | HIGH",
  "confidence": 0.0,
  "description": "A concise description in at most 500 characters.",
  "observations": ["At most five short visual observations."]
}
Use OTHER when the road damage is unclear or not represented by the allowed types. Be conservative: confidence must be between 0 and 1 and should reflect only what is visible in the image. Do not infer personal identity, exact location, or information outside the image.`;
}

function parseJsonObject(text: string): Record<string, unknown> {
  const withoutFence = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  const start = withoutFence.indexOf("{");
  const end = withoutFence.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI returned no JSON object.");
  const parsed: unknown = JSON.parse(withoutFence.slice(start, end + 1));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("AI returned an invalid object.");
  return parsed as Record<string, unknown>;
}

export function parseAiResponse(text: string): AiAnalysisResult {
  const parsed = parseJsonObject(text);
  const damageType = parsed.damage_type;
  const severity = parsed.severity;
  const confidence = typeof parsed.confidence === "number" ? parsed.confidence : Number(parsed.confidence);
  const description = typeof parsed.description === "string" ? parsed.description.trim() : "";
  const observations = Array.isArray(parsed.observations)
    ? parsed.observations.filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(Boolean).slice(0, 5)
    : [];

  if (!isDamageType(damageType) || !isSeverity(severity) || !Number.isFinite(confidence) || confidence < 0 || confidence > 1 || !description || description.length > 500) {
    throw new Error(`AI response does not match the allowed schema: ${DAMAGE_TYPES.join(", ")} / ${SEVERITIES.join(", ")}.`);
  }
  if (observations.some((observation) => observation.length > 200)) throw new Error("AI observations exceed the allowed length.");

  return { damageType, severity, confidence, description, observations };
}
