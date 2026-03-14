import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SKY Pickleball & Futsal - Solusi Mabar Lancar Tanpa Antri",
  description: "Gak pake antri, gak pake ribet! Booking lapangan favoritmu di SKY dalam 30 detik saja.",
  openGraph: {
    title: "SKY Pickleball & Futsal - Solusi Mabar Lancar Tanpa Antri",
    description: "Cek jadwal real-time dan amankan slot mabar komunitasmu sekarang. Sat-set, tanpa drama!",
    url: "https://sky-pickleball-pro.vercel.app",
    siteName: "SKY Pickleball",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "SKY Pickleball & Futsal" }],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SKY Pickleball & Futsal",
    images: ["/og-image.png"],
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Perisai 1: Di tag html
    <html lang="id" suppressHydrationWarning>
      {/* Perisai 2: Di tag body untuk menangkal extension seperti Bitwarden */}
      <body 
        className={`${inter.className} bg-white text-black antialiased`} 
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}