import type { User } from "firebase/auth";
import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { getFirebaseDb, getFirebaseStorage } from "@/lib/firebase/client";
import { calculatePriority } from "@/lib/domain/report";
import { validateReportInput, type ReportLocationInput } from "@/lib/domain/report-validation";

type ReportLocation = ReportLocationInput;

export async function uploadReportPhoto(userId: string, file: File, reportId = crypto.randomUUID(), onProgress?: (progress: number) => void) {
  if (!userId || !file.type.startsWith("image/")) {
    throw new Error("Foto laporan tidak valid.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Ukuran foto maksimal 8 MB.");
  }
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const storagePath = `reports/${userId}/${reportId}/original.${extension}`;
  const photoRef = ref(getFirebaseStorage(), storagePath);

  await new Promise<void>((resolve, reject) => {
    const uploadTask = uploadBytesResumable(photoRef, file, { contentType: file.type });
    uploadTask.on(
      "state_changed",
      (snapshot) => onProgress?.(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
      reject,
      resolve,
    );
  });

  return {
    reportId,
    storagePath,
    mimeType: file.type,
    sizeBytes: file.size,
    downloadUrl: await getDownloadURL(photoRef),
  };
}

export async function deleteReportPhoto(storagePath: string) {
  await deleteObject(ref(getFirebaseStorage(), storagePath));
}

export async function createReport(user: User, photo: Awaited<ReturnType<typeof uploadReportPhoto>>, location: ReportLocation, description: string) {
  if (!photo.reportId) throw new Error("Foto laporan tidak valid.");
  const normalizedDescription = validateReportInput(location, description);
  const db = getFirebaseDb();
  const reportRef = doc(db, "reports", photo.reportId);
  const historyRef = doc(collection(reportRef, "statusHistory"));
  const batch = writeBatch(db);

  const priority = calculatePriority("LOW", 0, 50);

  batch.set(reportRef, {
    reporterId: user.uid,
    reporterDisplayName: user.displayName?.trim() || "Pengguna JALANIN",
    visibility: "public",
    photo: {
      storagePath: photo.storagePath,
      downloadUrl: photo.downloadUrl,
      mimeType: photo.mimeType,
      sizeBytes: photo.sizeBytes,
    },
    location: { ...location, ...(location.label ? { label: location.label } : {}), capturedAt: serverTimestamp() },
    damage: {
      type: "OTHER",
      severity: "LOW",
      description: normalizedDescription,
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
    priority: { ...priority, formulaVersion: "v1", calculatedAt: serverTimestamp() },
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
