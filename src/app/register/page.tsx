import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="fixed left-5 top-5 sm:left-8 sm:top-8"><Link className="font-bold text-road-blue hover:underline" href="/">&lt;- Kembali ke beranda</Link></div>
      <AuthForm mode="register" />
    </main>
  );
}
