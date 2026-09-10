import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <div className="auth-map-layer" aria-hidden="true"><span className="auth-map auth-map-one" /><span className="auth-map auth-map-two" /><span className="auth-map-dot auth-map-dot-one" /><span className="auth-map-dot auth-map-dot-two" /></div>
      <header className="auth-header"><Link href="/" className="brand" aria-label="JALANIN beranda"><span className="brand-logo" aria-hidden="true" /><span>JALANIN</span></Link><Link className="auth-back" href="/">&lt;- Kembali ke beranda</Link></header>
      <div className="auth-content"><AuthForm mode="register" /><p className="auth-note">Bergabung untuk ikut melaporkan dan memantau kondisi jalan di kotamu.</p></div>
    </main>
  );
}
