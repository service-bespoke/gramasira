import "./globals.css";
import Providers from "./providers";
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Gramasira Water Billing",
  description: "Gramasira Water Billing Management System",

  manifest: "/manifest.json",

  icons: {
    icon: "/icons/192x192.png",
    apple: "/icons/512x512.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("font-sans", geist.variable)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
