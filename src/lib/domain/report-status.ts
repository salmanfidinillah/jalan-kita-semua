import { REPORT_STATUSES, type ReportStatus } from "@/lib/domain/report";

const transitions: Record<ReportStatus, readonly ReportStatus[]> = {
  REPORTED: ["REPORTED", "VERIFIED", "IN_PROGRESS"],
  VERIFIED: ["VERIFIED", "IN_PROGRESS"],
  IN_PROGRESS: ["IN_PROGRESS", "RESOLVED"],
  RESOLVED: ["RESOLVED"],
};

export function isReportStatus(value: unknown): value is ReportStatus {
  return typeof value === "string" && REPORT_STATUSES.includes(value as ReportStatus);
}

export function canTransitionReportStatus(from: ReportStatus, to: ReportStatus) {
  return transitions[from].includes(to);
}
