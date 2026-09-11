import { Timestamp } from "firebase-admin/firestore";

type PlainTimestamp = { seconds: number; nanoseconds?: number };

function serializeTimestamp(value: unknown): PlainTimestamp | null {
  if (value instanceof Timestamp) {
    return { seconds: value.seconds, nanoseconds: value.nanoseconds };
  }
  if (value instanceof Date) {
    return { seconds: Math.floor(value.getTime() / 1000), nanoseconds: (value.getTime() % 1000) * 1_000_000 };
  }
  return null;
}

function pickTimestamp(value: unknown) {
  return serializeTimestamp(value);
}

export function projectPublicReport(id: string, data: Record<string, unknown>, includeOwnerData = false) {
  const photo = (data.photo || {}) as Record<string, unknown>;
  const location = (data.location || {}) as Record<string, unknown>;
  const damage = (data.damage || {}) as Record<string, unknown>;
  const priority = (data.priority || {}) as Record<string, unknown>;
  const analysis = (data.aiAnalysis || {}) as Record<string, unknown>;
  const userReview = (data.userReview || {}) as Record<string, unknown>;
  const verification = (data.verificationSummary || {}) as Record<string, unknown>;

  return {
    id,
    photo: typeof photo.downloadUrl === "string" ? { downloadUrl: photo.downloadUrl } : undefined,
    location: {
      latitude: location.latitude,
      longitude: location.longitude,
      label: typeof location.label === "string" ? location.label : undefined,
    },
    damage: {
      type: damage.type,
      severity: damage.severity,
      description: damage.description,
    },
    priority: {
      score: priority.score,
      classification: priority.classification,
      severityValue: priority.severityValue,
      communityValue: priority.communityValue,
      riskValue: priority.riskValue,
      formulaVersion: priority.formulaVersion,
    },
    aiAnalysis: {
      status: analysis.status,
      damageType: analysis.damageType,
      severity: analysis.severity,
      confidence: analysis.confidence,
      description: analysis.description,
      observations: analysis.observations,
    },
    userReview: includeOwnerData ? { reviewed: userReview.reviewed } : undefined,
    verificationSummary: {
      stillExistsCount: verification.stillExistsCount,
      resolvedCount: verification.resolvedCount,
      totalCount: verification.totalCount,
      stillExistsRatio: verification.stillExistsRatio,
      confidence: verification.confidence,
      lastVerifiedAt: pickTimestamp(verification.lastVerifiedAt),
    },
    status: data.status,
    createdAt: pickTimestamp(data.createdAt),
    updatedAt: pickTimestamp(data.updatedAt),
    ...(includeOwnerData ? { reporterId: data.reporterId } : {}),
  };
}

export function serializeStatusHistory(id: string, data: Record<string, unknown>) {
  return {
    id,
    fromStatus: data.fromStatus ?? null,
    toStatus: data.toStatus,
    note: data.note,
    createdAt: pickTimestamp(data.createdAt),
  };
}
