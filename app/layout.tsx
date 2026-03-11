import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // Judul Opsi B: Fokus pada Solusi (59 Karakter - Sangat Ideal)
  title: "SKY Pickleball & Futsal - Solusi Mabar Lancar Tanpa Antri",
  description: "Gak pake antri, gak pake ribet! Booking lapangan favoritmu di SKY dalam 30 detik saja.",
  
  // Konfigurasi Open Graph untuk WhatsApp & Sosial Media
  openGraph: {
    title: "SKY Pickleball & Futsal - Solusi Mabar Lancar Tanpa Antri",
    description: "Cek jadwal real-time dan amankan slot mabar komunitasmu sekarang. Sat-set, tanpa drama!",
    url: "https://sky-pickleball-pro.vercel.app",
    siteName: "SKY Pickleball",
    images: [
      {
        url: "/og-image.png", // Mengambil file 1200x630 dari folder public
        width: 1200,
        height: 630,
        alt: "SKY Pickleball & Futsal - Digital Booking System",
      },
    ],
    locale: "id_ID",
    type: "website",
  },

  // Tampilan khusus Twitter/X agar gambar muncul besar
  twitter: {
    card: "summary_large_image",
    title: "SKY Pickleball & Futsal - Solusi Mabar Lancar Tanpa Antri",
    description: "Solusi mabar lancar tanpa nunggu balasan admin!",
    images: ["/og-image.png"],
  },

  // Icon browser (Favicon)
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-white text-black antialiased`}>
        {children}
      </body>
    </html>
  );
}