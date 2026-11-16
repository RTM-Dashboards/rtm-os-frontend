import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import { NotificationCountProvider } from "@/components/layout/NotificationCountContext";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Real Time Marketing Operational Dashboards",
  description: "Real Time Marketing — Operational Dashboards for the modern home service marketing agency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en" className={`${montserrat.variable} ${geistMono.variable} h-full`}
    >
      <body className="h-full antialiased">
        <NotificationCountProvider>{children}</NotificationCountProvider>
      </body>
    </html>
  );
}
