import type { Metadata } from "next";
import localFont from "next/font/local";
import { AuthProvider } from "@/components/providers/auth-provider";
import { DevNavigator } from "@/components/dev-navigator";
import { Toaster } from "sonner";
import "./globals.css";

const inter = localFont({
  src: [
    { path: "../../public/fonts/inter-latin-400-normal.woff2", weight: "400" },
    { path: "../../public/fonts/inter-latin-500-normal.woff2", weight: "500" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SD2 — 漫剧生产平台",
  description: "高保真前端原型",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full flex flex-col overflow-hidden bg-background text-foreground font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster theme="dark" position="top-center" richColors />
        <DevNavigator />
      </body>
    </html>
  );
}
