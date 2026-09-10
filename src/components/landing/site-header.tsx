"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`landing-header${isScrolled ? " is-scrolled" : ""}`}>
      <div className="landing-header-inner">
        <Link href="/" className="landing-brand" aria-label="JALANIN beranda">
          <span className="landing-brand-mark" aria-hidden="true"><span /></span>
          <span>JALANIN</span>
        </Link>
        <nav className="landing-nav" aria-label="Navigasi utama">
          <Link className="is-active" href="/map">Peta kondisi</Link>
          <a href="#cara-kerja">Cara kerja</a>
          <a href="#tentang">Tentang</a>
        </nav>
        <div className="landing-header-actions">
          <Link href="/login" className="landing-login">Masuk</Link>
          <Link href="/reports/new" className="landing-header-cta">Laporkan jalan <span aria-hidden="true">↗</span></Link>
        </div>
        <details className="landing-mobile-menu">
          <summary aria-label="Buka menu navigasi"><span /><span /></summary>
          <div className="landing-mobile-panel">
            <Link href="/map">Peta kondisi</Link><a href="#cara-kerja">Cara kerja</a><a href="#tentang">Tentang</a><Link href="/login">Masuk</Link>
            <Link href="/reports/new" className="landing-header-cta">Laporkan jalan <span aria-hidden="true">↗</span></Link>
          </div>
        </details>
      </div>
    </header>
  );
}
