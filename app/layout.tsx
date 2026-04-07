import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/react"; 
import { Toaster } from "@/components/atoms/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "IzziOrder - Gestão de Recursos",
  description: "Plataforma interna para maximizar o desempenho do gerenciamento de estabelecimentos.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
    other: [
      { rel: "manifest", url: "/site.webmanifest" }, 
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}