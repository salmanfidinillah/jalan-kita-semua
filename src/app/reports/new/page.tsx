"use client";

import Link from "next/link";
import Image from "next/image";
import { onAuthStateChanged, User } from "firebase/auth";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createReport, uploadReportPhoto } from "@/lib/firebase/reports";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

export default function NewReportPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured());
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    return onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      if (!nextUser) {
        router.replace("/login");
        return;
      }
      setUser(nextUser);
      setIsLoading(false);
    });
  }, [router]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    setError("");
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) {
      setError("Pilih file gambar untuk foto laporan.");
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
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
    if (!user || !file || !location) {
      setError("Foto dan lokasi wajib tersedia sebelum laporan dikirim.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const photo = await uploadReportPhoto(user.uid, file);
      const reportId = await createReport(user, photo, {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracyMeters: location.accuracy,
      });
      router.push(`/reports/${reportId}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Laporan gagal dikirim. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <main className="flex min-h-screen items-center justify-center text-muted-ink">Memuat akun...</main>;
  if (!isFirebaseConfigured()) return <main className="flex min-h-screen items-center justify-center px-5"><div className="rounded-2xl border border-line bg-surface p-7 text-center"><h1 className="text-2xl font-bold">Firebase belum terhubung</h1><p className="mt-3 text-muted-ink">Isi konfigurasi Firebase untuk membuat laporan.</p></div></main>;

  return <main className="min-h-screen px-5 py-8 lg:px-10"><header className="mx-auto flex max-w-300 items-center justify-between"><Link className="text-xl font-bold" href="/dashboard">JALANIN</Link><Link className="text-sm font-bold text-road-blue" href="/dashboard">Batal</Link></header><section className="mx-auto max-w-180 py-12"><p className="text-sm font-bold uppercase tracking-[0.16em] text-signal-orange">Buat laporan</p><h1 className="mt-3 text-4xl font-bold tracking-tight">Tunjukkan kondisi jalan.</h1><p className="mt-4 max-w-xl leading-7 text-muted-ink">Ambil foto yang jelas dan tandai lokasi. AI akan membantu menganalisis detailnya pada langkah berikutnya.</p><form className="mt-10 space-y-6" onSubmit={handleSubmit}><div className="rounded-2xl border border-line bg-surface p-5"><label className="block text-sm font-bold">Foto kerusakan<p className="mt-2 font-normal text-muted-ink">Gunakan foto yang memperlihatkan permukaan jalan dengan jelas.</p><input className="mt-4 block w-full rounded-xl border border-dashed border-road-blue bg-paper p-4 text-sm" type="file" accept="image/*" onChange={handleFileChange} required /></label>{previewUrl && <Image className="mt-4 max-h-72 w-full rounded-xl object-cover" src={previewUrl} alt="Preview foto kondisi jalan" width={900} height={600} unoptimized />}</div><div className="rounded-2xl border border-line bg-surface p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="font-bold">Lokasi laporan</h2><p className="mt-1 text-sm text-muted-ink">Lokasi dipakai untuk menempatkan laporan di peta.</p></div><button className="rounded-full bg-road-blue px-5 py-3 text-sm font-bold text-white disabled:opacity-60" type="button" onClick={handleGetLocation} disabled={isGettingLocation}>{isGettingLocation ? "Mencari lokasi..." : location ? "Lokasi tersimpan" : "Ambil lokasi saya"}</button></div>{location && <p className="mt-4 rounded-xl bg-[#edf5f1] p-3 text-sm text-leaf-green">Lokasi siap: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)} (akurasi ±{Math.round(location.accuracy)} m)</p>}</div>{error && <p className="rounded-xl border border-danger-red/30 bg-[#fff0ed] p-4 text-sm leading-6 text-danger-red" role="alert">{error}</p>}<button className="h-13 w-full rounded-full bg-signal-orange px-6 font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting || !file || !location}>{isSubmitting ? "Mengirim laporan..." : "Kirim laporan"}</button></form></section></main>;
}