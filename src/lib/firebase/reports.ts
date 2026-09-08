import type { User } from "firebase/auth";
import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebaseDb, getFirebaseStorage } from "@/lib/firebase/client";

type ReportLocation = {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
};

export async function uploadReportPhoto(userId: string, file: File) {
  const reportId = crypto.randomUUID();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const storagePath = `reports/${userId}/${reportId}/original.${extension}`;
  const photoRef = ref(getFirebaseStorage(), storagePath);

  await uploadBytes(photoRef, file, { contentType: file.type });

  return {
    reportId,
    storagePath,
    downloadUrl: await getDownloadURL(photoRef),
  };
}

export async function createReport(user: User, photo: Awaited<ReturnType<typeof uploadReportPhoto>>, location: ReportLocation) {
  const db = getFirebaseDb();
  const reportRef = doc(collection(db, "reports"));
  const historyRef = doc(collection(reportRef, "statusHistory"));
  const batch = writeBatch(db);

  batch.set(reportRef, {
    reporterId: user.uid,
    reporterDisplayName: user.displayName?.trim() || "Pengguna JALANIN",
    visibility: "public",
    photo: {
      storagePath: photo.storagePath,
      downloadUrl: photo.downloadUrl,
      mimeType: "image/*",
    },
    location: {
      ...location,
      capturedAt: serverTimestamp(),
    },
    damage: {
      type: "OTHER",
      severity: "LOW",
      description: "Menunggu analisis kondisi jalan.",
    },
    aiAnalysis: {
      status: "PENDING",
    },
    userReview: {
      reviewed: false,
    },
    verificationSummary: {
      stillExistsCount: 0,
      resolvedCount: 0,
      totalCount: 0,
      stillExistsRatio: 0,
      confidence: 0,
      lastVerifiedAt: null,
    },
    riskFactor: {
      value: 50,
      source: "default",
      reason: null,
    },
    priority: {
      score: 23,
      classification: "LOW",
      severityValue: 25,
      communityValue: 0,
      riskValue: 50,
      formulaVersion: "v1",
      calculatedAt: serverTimestamp(),
    },
    status: "REPORTED",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    resolvedAt: null,
  });
  batch.set(historyRef, {
    fromStatus: null,
    toStatus: "REPORTED",
    changedBy: user.uid,
    changedByRole: "user",
    note: "Report submitted",
    createdAt: serverTimestamp(),
  });
  await batch.commit();

  return reportRef.id;
}