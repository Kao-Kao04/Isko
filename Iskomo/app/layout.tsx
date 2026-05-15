import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import HealthBanner from "@/components/shared/HealthBanner";

export const metadata: Metadata = {
  title: "IskoMo",
  description: "IskoMo - Scholarships & Opportunities for PUP Students",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <HealthBanner />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
