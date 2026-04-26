import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_Hebrew } from "next/font/google";
import { AppProviders } from "@/components/app-providers";
import { Toaster } from "@/components/ui/sonner";
import { he } from "@/lib/i18n/he";
import "./globals.css";

const notoSansHebrew = Noto_Sans_Hebrew({
  variable: "--font-geist-sans",
  subsets: ["hebrew"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: he.meta.title,
  description: he.meta.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${notoSansHebrew.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full min-w-[20rem] flex flex-col text-lg leading-relaxed">
        <AppProviders>
          {children}
          <Toaster position="top-center" richColors />
        </AppProviders>
      </body>
    </html>
  );
}
