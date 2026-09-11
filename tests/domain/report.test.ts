import { describe, expect, it } from "vitest";
import { calculatePriority } from "@/lib/domain/report";
import { canTransitionReportStatus } from "@/lib/domain/report-status";
import { validateReportInput } from "@/lib/domain/report-validation";

describe("report domain", () => {
  it("calculates a bounded priority score", () => {
    const result = calculatePriority("HIGH", 1, 100);
    expect(result.score).toBe(100);
    expect(result.classification).toBe("HIGH");
  });

  it("rejects invalid report input", () => {
    expect(() => validateReportInput({ latitude: 100, longitude: 112, accuracyMeters: 10 }, "Jalan rusak cukup parah")).toThrow();
    expect(validateReportInput({ latitude: -7.2, longitude: 112.7, accuracyMeters: 12 }, "Lubang besar di lajur kiri")).toBe("Lubang besar di lajur kiri");
  });

  it("enforces the report status lifecycle", () => {
    expect(canTransitionReportStatus("REPORTED", "VERIFIED")).toBe(true);
    expect(canTransitionReportStatus("VERIFIED", "REPORTED")).toBe(false);
    expect(canTransitionReportStatus("RESOLVED", "IN_PROGRESS")).toBe(false);
  });
});
