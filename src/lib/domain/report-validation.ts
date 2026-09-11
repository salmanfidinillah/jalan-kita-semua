export type ReportLocationInput = {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  label?: string;
};

export function validateReportInput(location: ReportLocationInput, description: string) {
  const normalizedDescription = description.trim();
  const validLocation = Number.isFinite(location.latitude) && location.latitude >= -90 && location.latitude <= 90 && Number.isFinite(location.longitude) && location.longitude >= -180 && location.longitude <= 180;
  const validAccuracy = location.accuracyMeters === null || (Number.isFinite(location.accuracyMeters) && location.accuracyMeters >= 0);
  const validLabel = location.label === undefined || location.label.length <= 160;
  if (!validLocation || !validAccuracy || !validLabel || normalizedDescription.length < 10 || normalizedDescription.length > 500) {
    throw new Error("Data lokasi laporan tidak valid.");
  }
  return normalizedDescription;
}
