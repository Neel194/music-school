import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Analytics from "@/components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Music School - Master the Art of Music",
  description:
    "Transform your musical journey with our comprehensive music courses. Learn guitar, piano, vocals, drums, and more from expert instructors. Join our vibrant community of musicians.",
  keywords:
    "music school, guitar lessons, piano lessons, vocal training, drum lessons, music courses, online music education",
  authors: [{ name: "Music School Team" }],
  creator: "Music School",
  openGraph: {
    title: "Music School - Master the Art of Music",
    description:
      "Transform your musical journey with our comprehensive music courses.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Music School - Master the Art of Music",
    description:
      "Transform your musical journey with our comprehensive music courses.",
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
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Analytics />
        <div className="relative w-full flex items-center justify-center">
          <Navbar />
        </div>
        {children}
      </body>
    </html>
  );
}
