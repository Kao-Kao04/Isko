import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IskoMo",
  description: "IskoMo - Scholarships & Opportunities for PUP Students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="icon" type="image/png" href="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* Global CSS - main styles */}
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="stylesheet" href="/css/responsive.css" />
        <link rel="stylesheet" href="/css/sections.css" />
        {/* Dashboard & portal styles */}
        <link rel="stylesheet" href="/css/global-dashboard.css" />
        <link rel="stylesheet" href="/css/dashboard-styles.css" />
        <link rel="stylesheet" href="/css/navbar-component.css" />
        <link rel="stylesheet" href="/css/nav-temp.css" />
        {/* Profile & legal styles */}
        <link rel="stylesheet" href="/css/profile.css" />
        <link rel="stylesheet" href="/css/unified-profile.css" />
        <link rel="stylesheet" href="/css/compact-profile.css" />
        <link rel="stylesheet" href="/css/legal.css" />
        {/* Core UI SaaS Polish overrides */}
        <link rel="stylesheet" href="/css/ui-polish.css" />
        <script src="https://unpkg.com/@supabase/supabase-js@2" async></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
