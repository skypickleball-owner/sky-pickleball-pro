import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SKY Pickleball & Futsal | Booking Real-Time",
  description: "Gak pake antri, gak pake ribet! Booking lapangan favoritmu di SKY dalam 30 detik saja.",
  
  // Pondasi Open Graph (WhatsApp, FB, IG)
  openGraph: {
    title: "SKY Pickleball & Futsal",
    description: "Booking Lapangan Sat-Set! Cek jadwal real-time dan amankan slotmu sekarang.",
    url: "https://sky-pickleball-pro.vercel.app",
    siteName: "SKY Pickleball",
    images: [
      {
        url: "/og-image.png", // Mengambil langsung dari folder public
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
    title: "SKY Pickleball & Futsal",
    description: "Booking Lapangan Sat-Set dalam 30 detik!",
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
}import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SKY Pickleball & Futsal | Booking Real-Time",
  description: "Gak pake antri, gak pake ribet! Booking lapangan favoritmu di SKY dalam 30 detik saja.",
  
  // Pondasi Open Graph (WhatsApp, FB, IG)
  openGraph: {
    title: "SKY Pickleball & Futsal",
    description: "Booking Lapangan Sat-Set! Cek jadwal real-time dan amankan slotmu sekarang.",
    url: "https://sky-pickleball-pro.vercel.app",
    siteName: "SKY Pickleball",
    images: [
      {
        url: "/og-image.png", // Mengambil langsung dari folder public
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
    title: "SKY Pickleball & Futsal",
    description: "Booking Lapangan Sat-Set dalam 30 detik!",
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