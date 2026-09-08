"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { createUserProfile } from "@/lib/firebase/user-profile";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

const errorMessages: Record<string, string> = {
  "auth/invalid-credential": "Email atau password belum benar.",
  "auth/email-already-in-use": "Email ini sudah terdaftar. Coba masuk.",
  "auth/weak-password": "Password harus memiliki minimal 6 karakter.",
  "auth/invalid-email": "Masukkan alamat email yang valid.",
  "auth/too-many-requests": "Terlalu banyak percobaan. Coba lagi beberapa saat.",
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const auth = getFirebaseAuth();
      const credential = isRegister
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);

      if (isRegister && displayName.trim()) {
        await updateProfile(credential.user, { displayName: displayName.trim() });
      }

      if (isRegister) {
        await createUserProfile(credential.user);
      }

      router.push("/dashboard");
    } catch (authError) {
      const code = authError instanceof Error && "code" in authError
        ? String(authError.code)
        : "";
      setError(errorMessages[code] ?? (authError instanceof Error ? authError.message : "Terjadi kesalahan. Coba lagi."));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-line bg-surface p-7 shadow-[0_24px_70px_rgba(23,32,38,0.08)] sm:p-9">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-signal-orange">JALANIN</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{isRegister ? "Buat akun" : "Selamat datang kembali"}</h1>
        <p className="mt-3 leading-7 text-muted-ink">
          {isRegister ? "Mulai bantu pantau jalan di kotamu." : "Masuk untuk membuat laporan dan ikut memverifikasi."}
        </p>
      </div>

      {!isFirebaseConfigured() && (
        <div className="mb-5 rounded-xl border border-warning-yellow/40 bg-[#fff8df] p-4 text-sm leading-6 text-ink">
          Firebase belum terhubung di environment ini. Tambahkan konfigurasi Firebase sebelum mencoba masuk.
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        {isRegister && <label className="block text-sm font-bold">Nama lengkap<input className="mt-2 h-12 w-full rounded-xl border border-line bg-paper px-4 font-normal outline-none transition focus:border-road-blue focus:ring-2 focus:ring-road-blue/20" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" required /></label>}
        <label className="block text-sm font-bold">Email<input className="mt-2 h-12 w-full rounded-xl border border-line bg-paper px-4 font-normal outline-none transition focus:border-road-blue focus:ring-2 focus:ring-road-blue/20" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
        <label className="block text-sm font-bold">Password<input className="mt-2 h-12 w-full rounded-xl border border-line bg-paper px-4 font-normal outline-none transition focus:border-road-blue focus:ring-2 focus:ring-road-blue/20" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isRegister ? "new-password" : "current-password"} minLength={6} required /></label>
        {error && <p className="rounded-xl border border-danger-red/30 bg-[#fff0ed] p-3 text-sm leading-6 text-danger-red" role="alert">{error}</p>}
        <button className="h-12 w-full rounded-full bg-signal-orange px-5 font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isPending || !isFirebaseConfigured()}>{isPending ? "Memproses..." : isRegister ? "Buat akun" : "Masuk"}</button>
      </form>

      <p className="mt-7 text-center text-sm text-muted-ink">{isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}<Link className="font-bold text-road-blue hover:underline" href={isRegister ? "/login" : "/register"}>{isRegister ? "Masuk" : "Daftar sekarang"}</Link></p>
    </div>
  );
}
