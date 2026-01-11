import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LinkQR - Smart QR Codes & URL Shortener",
    template: "%s | LinkQR",
  },
  description:
    "Create branded QR codes, shorten URLs, and track engagement with powerful analytics. The all-in-one link management platform for businesses.",
  keywords: [
    "QR code generator",
    "URL shortener",
    "link analytics",
    "link management",
    "branded links",
    "custom QR codes",
    "link tracking",
  ],
  authors: [{ name: "LinkQR" }],
  creator: "LinkQR",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "LinkQR - Smart QR Codes & URL Shortener",
    description:
      "Create branded QR codes, shorten URLs, and track engagement with powerful analytics.",
    siteName: "LinkQR",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkQR - Smart QR Codes & URL Shortener",
    description:
      "Create branded QR codes, shorten URLs, and track engagement with powerful analytics.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {children}
          <Toaster position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
