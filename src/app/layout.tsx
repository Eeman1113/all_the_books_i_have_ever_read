import type { Metadata } from "next";
import { Geist, Geist_Mono, Ole } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ole = Ole({
  variable: "--font-ole",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "all the books i have ever read",
  description:
    "all the books i have ever read (at least the ones i can remember)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${ole.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="preconnect"
          href="https://covers.openlibrary.org"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://covers.openlibrary.org" />
        <link
          rel="preconnect"
          href="https://openlibrary.org"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://openlibrary.org" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
