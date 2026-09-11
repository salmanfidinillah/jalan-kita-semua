import { describe, expect, it } from "vitest";
import { parseAiResponse } from "@/lib/ai/analysis";

describe("AI response parser", () => {
  it("accepts the supported structured response", () => {
    const result = parseAiResponse(JSON.stringify({
      damage_type: "POTHOLE",
      severity: "HIGH",
      confidence: 0.93,
      description: "Lubang besar terlihat pada permukaan jalan.",
      observations: ["Permukaan aspal terputus"],
    }));
    expect(result.damageType).toBe("POTHOLE");
    expect(result.confidence).toBe(0.93);
  });

  it("rejects an unsupported or unsafe response", () => {
    expect(() => parseAiResponse(JSON.stringify({ damage_type: "UNKNOWN", severity: "HIGH", confidence: 1, description: "x" }))).toThrow();
    expect(() => parseAiResponse(JSON.stringify({ damage_type: "CRACK", severity: "LOW", confidence: 1.4, description: "x" }))).toThrow();
  });
});
