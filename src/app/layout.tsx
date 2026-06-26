import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteBackground } from "@/components/layout/SiteBackground";
import { SITE } from "@/lib/constants";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: SITE.title,
  description: SITE.description,
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        <SiteBackground />
        <div className="site-shell">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-surface px-4 focus:py-2"
          >
            Ir al contenido
          </a>
          {children}
        </div>
      </body>
    </html>
  );
}
