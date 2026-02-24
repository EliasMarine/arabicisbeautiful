import type { Metadata } from "next";
import { Source_Sans_3, Playfair_Display } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lebanese Arabic | من البداية للطلاقة",
  description:
    "Complete Lebanese Arabic fluency course — from reactivation to mastery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${sourceSans.variable} ${playfair.variable} font-[var(--font-source-sans)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
