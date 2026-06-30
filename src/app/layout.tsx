import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Edu UZ — SafarAI",
  description: "Bolalar uchun xavfsiz AI yordamchi — ta'lim, mashg'ulot va kuzatuv",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
