import type { Metadata } from "next";
import "./globals.css";
import "./tailwind.css";
import { AuthProvider } from "@/components/auth/auth-provider";

export const metadata: Metadata = {
  title: "JALANIN | Jalan Aman, Kota Nyaman",
  description:
    "Pantau kondisi jalan di sekitarmu, laporkan kerusakan, dan bantu tentukan prioritasnya.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="id"><body><AuthProvider>{children}</AuthProvider></body></html>;
}
