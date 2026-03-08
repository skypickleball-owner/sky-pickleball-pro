import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  // JUDUL YANG MUNCUL DI TAB BROWSER & WHATSAPP
  title: "SKY PICKLEBALL & FUTSAL",
  description: "Sistem Booking Lapangan Futsal dan Pickleball - #1 Family Sportainment",
  
  // PENGATURAN TAMPILAN SAAT LINK DIBAGIKAN (OPEN GRAPH)
  openGraph: {
    title: "SKY PICKLEBALL & FUTSAL",
    description: "Booking Lapangan Jadi Lebih Mudah & Cepat!",
    url: "https://sky-pickleball-pro.vercel.app/",
    siteName: "SKY Sportainment",
    images: [
      {
        // KITA GUNAKAN LOGO PICKLEBALL SEBAGAI PREVIEW DI WA
        url: "/logo-pb.png", 
        width: 800,
        height: 600,
        alt: "SKY Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        {/* Ikon kecil di tab browser (Favicon) */}
        <link rel="icon" href="/logo-pb.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}