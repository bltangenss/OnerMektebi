import type { Metadata } from "next";
import { Fira_Sans_Extra_Condensed, Onest } from "next/font/google";
import "../globals.css";

const onest = Onest({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-onest", display: "swap" });
const fira = Fira_Sans_Extra_Condensed({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["700"],
  variable: "--font-fira",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Админ-панель — Өнер мектебі",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="ru" className={`${onest.variable} ${fira.variable}`}>
      <body className="min-h-svh bg-linen">{children}</body>
    </html>
  );
}
