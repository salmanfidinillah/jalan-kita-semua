export const DAMAGE_TYPES = [
  "POTHOLE",
  "CRACK",
  "BROKEN_SURFACE",
  "FLOODING",
  "ROAD_OBSTRUCTION",
  "OTHER",
] as const;

export const SEVERITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export const REPORT_STATUSES = ["REPORTED", "VERIFIED", "IN_PROGRESS", "RESOLVED"] as const;

export type DamageType = (typeof DAMAGE_TYPES)[number];
export type Severity = (typeof SEVERITIES)[number];
export type ReportStatus = (typeof REPORT_STATUSES)[number];

const severityValues: Record<Severity, number> = {
  LOW: 25,
  MEDIUM: 60,
  HIGH: 100,
};

export function isDamageType(value: unknown): value is DamageType {
  return typeof value === "string" && DAMAGE_TYPES.includes(value as DamageType);
}

export function isSeverity(value: unknown): value is Severity {
  return typeof value === "string" && SEVERITIES.includes(value as Severity);
}

export function isReportStatus(value: unknown): value is ReportStatus {
  return typeof value === "string" && REPORT_STATUSES.includes(value as ReportStatus);
}

export function calculatePriority(
  severity: string,
  stillExistsRatio: number,
  riskValue: number,
) {
  const severityValue = isSeverity(severity) ? severityValues[severity] : severityValues.LOW;
  const normalizedCommunity = Math.min(1, Math.max(0, stillExistsRatio));
  const normalizedRisk = Math.min(100, Math.max(0, riskValue));
  const communityValue = normalizedCommunity * 100;
  const score = Math.round(severityValue * 0.5 + communityValue * 0.3 + normalizedRisk * 0.2);

  return {
    score: Math.min(100, Math.max(0, score)),
    classification: score >= 80 ? "HIGH" : score >= 50 ? "MEDIUM" : "LOW",
    severityValue,
    communityValue,
    riskValue: normalizedRisk,
  } as const;
}

