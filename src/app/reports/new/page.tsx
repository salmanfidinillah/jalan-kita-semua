"use client";

import Image from "next/image";
import Link from "next/link";
import { getIdToken } from "firebase/auth";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { LoadingState } from "@/components/ui/page-state";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { createReport, deleteReportPhoto, uploadReportPhoto } from "@/lib/firebase/reports";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

export default function NewReportPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!isLoading && isFirebaseConfigured() && !user) router.replace("/login");
  }, [isLoading, router, user]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    setError("");
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) {
      setFile(null);
      setPreviewUrl("");
      setError("Pilih file gambar untuk foto laporan.");
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setPreviewUrl("");
      setError("Ukuran foto maksimal 8 MB.");
      return;
    }
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
  }

  function handleGetLocation() {
    if (!navigator.geolocation) {
      setError("Browser ini tidak mendukung pengambilan lokasi.");
      return;
    }
    setError("");
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords);
        setIsGettingLocation(false);
      },
      () => {
        setError("Lokasi belum tersedia. Izinkan akses lokasi lalu coba lagi.");
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !file || !location || description.trim().length < 10) {
      setError("Foto, lokasi, dan deskripsi minimal 10 karakter wajib tersedia sebelum laporan dikirim.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    setUploadProgress(0);
    let uploadedPhoto: Awaited<ReturnType<typeof uploadReportPhoto>> | null = null;
    let createdReportId: string | null = null;

    try {
      uploadedPhoto = await uploadReportPhoto(user.uid, file, undefined, setUploadProgress);
      createdReportId = await createReport(user, uploadedPhoto, {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracyMeters: location.accuracy,
        ...(locationLabel.trim() ? { label: locationLabel.trim() } : {}),
      }, description);

      try {
        const token = await getIdToken(user);
        await fetch(`/api/reports/${createdReportId}/analyze`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // The report remains valid with aiAnalysis.status=PENDING and can be retried on detail.
      }

      router.push(`/reports/${createdReportId}`);
    } catch (submitError) {
      if (uploadedPhoto && !createdReportId) {
        await deleteReportPhoto(uploadedPhoto.storagePath).catch(() => undefined);
      }
      setError(submitError instanceof Error ? submitError.message : "Laporan gagal dikirim. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <LoadingState label="Memuat akun..." />;
  if (!isFirebaseConfigured()) return <main className="flex min-h-screen items-center justify-center px-5"><div className="rounded-2xl border border-line bg-surface p-7 text-center"><h1 className="text-2xl font-bold">Firebase belum terhubung</h1><p className="mt-3 text-muted-ink">Isi konfigurasi Firebase untuk membuat laporan.</p></div></main>;
  if (!user) return <LoadingState label="Mengalihkan ke login..." />;

  const currentStep = !file ? 1 : !location ? 2 : description.trim().length < 10 ? 3 : 4;

  return <main className="min-h-screen px-5 py-8 lg:px-10"><header className="mx-auto flex max-w-300 items-center justify-between"><Link className="text-xl font-bold" href="/dashboard">JALANIN</Link><Link className="text-sm font-bold text-road-blue" href="/dashboard">Batal</Link></header><section className="mx-auto max-w-180 py-12"><p className="text-sm font-bold uppercase tracking-[0.16em] text-signal-orange">Buat laporan</p><h1 className="mt-3 text-4xl font-bold tracking-tight">Tunjukkan kondisi jalan.</h1><p className="mt-4 max-w-xl leading-7 text-muted-ink">Ikuti empat langkah singkat: siapkan foto, tandai lokasi, jelaskan kondisi, lalu kirim untuk dianalisis.</p><ol className="mt-8 grid grid-cols-4 gap-2" aria-label="Progress pembuatan laporan">{["Foto", "Lokasi", "Deskripsi", "Kirim"].map((step, index) => <li className={`border-t-2 pt-2 text-xs font-bold ${currentStep >= index + 1 ? "border-road-blue text-road-blue" : "border-line text-muted-ink"}`} key={step}><span className="block">0{index + 1}</span>{step}</li>)}</ol><form className="mt-10 space-y-6" onSubmit={handleSubmit}><div className="rounded-2xl border border-line bg-surface p-5"><label className="block text-sm font-bold" htmlFor="report-photo">1. Foto kerusakan<p className="mt-2 font-normal text-muted-ink">Gunakan foto yang memperlihatkan permukaan jalan dengan jelas.</p><input id="report-photo" className="mt-4 block w-full rounded-xl border border-dashed border-road-blue bg-paper p-4 text-sm" type="file" accept="image/*" onChange={handleFileChange} required /></label>{previewUrl && <Image className="mt-4 max-h-72 w-full rounded-xl object-cover" src={previewUrl} alt="Preview foto kondisi jalan" width={900} height={600} unoptimized />}{isSubmitting && uploadProgress > 0 && uploadProgress < 100 && <p className="mt-3 text-sm text-muted-ink" role="status">Mengunggah foto {uploadProgress}%</p>}</div><div className="rounded-2xl border border-line bg-surface p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="font-bold">2. Lokasi laporan</h2><p className="mt-1 text-sm text-muted-ink">Izinkan lokasi agar laporan dapat ditempatkan di peta.</p></div><button className="rounded-full bg-road-blue px-5 py-3 text-sm font-bold text-white disabled:opacity-60" type="button" onClick={handleGetLocation} disabled={isGettingLocation}>{isGettingLocation ? "Mencari lokasi..." : location ? "Perbarui lokasi" : "Ambil lokasi saya"}</button></div>{location && <div className="mt-4 space-y-3"><p className="rounded-xl bg-[#edf5f1] p-3 text-sm text-leaf-green">Lokasi siap: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)} (akurasi ±{Math.round(location.accuracy)} m)</p><label className="block text-sm font-bold" htmlFor="location-label">Nama jalan/tempat <span className="font-normal text-muted-ink">(opsional)</span><input id="location-label" className="mt-2 h-12 w-full rounded-xl border border-line bg-paper px-4 font-normal outline-none focus:border-road-blue focus:ring-2 focus:ring-road-blue/20" value={locationLabel} onChange={(event) => setLocationLabel(event.target.value)} maxLength={160} placeholder="Contoh: Jl. Ahmad Yani" /></label></div>}</div><div className="rounded-2xl border border-line bg-surface p-5"><label className="block text-sm font-bold" htmlFor="report-description">3. Jelaskan kondisi jalan<p className="mt-2 font-normal text-muted-ink">Deskripsi membantu AI dan warga memahami konteks laporan.</p><textarea id="report-description" className="mt-4 min-h-32 w-full rounded-xl border border-line bg-paper p-3 font-normal outline-none focus:border-road-blue focus:ring-2 focus:ring-road-blue/20" value={description} onChange={(event) => setDescription(event.target.value)} minLength={10} maxLength={500} required placeholder="Contoh: Lubang cukup dalam di lajur kiri dan berisiko untuk pengendara motor." /><p className="mt-2 text-right text-xs text-muted-ink">{description.length}/500</p></label></div>{error && <p className="rounded-xl border border-danger-red/30 bg-[#fff0ed] p-4 text-sm leading-6 text-danger-red" role="alert">{error}</p>}<button className="h-13 w-full rounded-full bg-signal-orange px-6 font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting || !file || !location || description.trim().length < 10}>{isSubmitting ? uploadProgress < 100 ? `Mengunggah foto ${uploadProgress}%` : "Menganalisis kondisi jalan..." : "Kirim untuk dianalisis"}</button><p className="text-center text-xs leading-5 text-muted-ink">AI memberi saran, bukan keputusan mutlak. Kamu dapat memeriksa dan mengoreksi hasilnya di halaman detail.</p></form></section></main>;
}
