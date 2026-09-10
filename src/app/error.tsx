"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/page-state";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("JALANIN route error", error);
  }, [error]);

  return <ErrorState message="Halaman belum dapat dimuat. Silakan coba lagi." onRetry={reset} />;
}

