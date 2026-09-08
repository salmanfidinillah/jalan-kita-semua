"use client";

import Link from "next/link";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured());

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      if (!nextUser) {
        router.replace("/login");
        return;
      }
      setUser(nextUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [router]);

  async function handleSignOut() {
    await signOut(getFirebaseAuth());
    router.replace("/");
  }

  if (isLoading) return <main className="flex min-h-screen items-center justify-center text-muted-ink">Memuat akun...</main>;

  if (!isFirebaseConfigured()) return <main className="flex min-h-screen items-center justify-center px-5"><div className="max-w-md rounded-2xl border border-line bg-surface p-7 text-center"><h1 className="text-2xl font-bold">Dashboard belum tersedia</h1><p className="mt-3 leading-7 text-muted-ink">Hubungkan Firebase terlebih dahulu untuk mengakses dashboard.</p><Link className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 font-bold text-white" href="/">Kembali ke beranda</Link></div></main>;

  return <main className="min-h-screen px-5 py-8 lg:px-10"><header className="mx-auto flex max-w-300 items-center justify-between"><Link className="text-xl font-bold" href="/">JALANIN</Link><button className="rounded-full border border-line px-4 py-2 text-sm font-bold" onClick={handleSignOut}>Keluar</button></header><section className="mx-auto max-w-300 py-20"><p className="text-sm font-bold uppercase tracking-[0.16em] text-signal-orange">Dashboard</p><h1 className="mt-3 text-4xl font-bold">Halo, {user?.displayName || user?.email}</h1><p className="mt-4 max-w-lg leading-7 text-muted-ink">Tempat laporan, verifikasi, dan kontribusimu akan muncul di sini.</p><div className="mt-10 rounded-2xl border border-line bg-surface p-6"><h2 className="text-xl font-bold">Mulai kontribusi</h2><p className="mt-2 text-muted-ink">Fitur buat laporan menjadi baseline berikutnya setelah authentication stabil.</p></div></section></main>;
}
