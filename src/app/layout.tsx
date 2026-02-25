import type { Metadata, Viewport } from "next";
import { Source_Sans_3, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/layout/providers";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#16100a",
};

// Static inline script to prevent flash of wrong theme (FOUC).
// Content is a hardcoded string with no user input — safe to use dangerouslySetInnerHTML.
const THEME_SCRIPT = `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${sourceSans.variable} ${playfair.variable} font-[var(--font-source-sans)] antialiased`}
      >
        <Providers>{children}</Providers>
        <span className="fixed bottom-2 right-2 text-[0.6rem] text-[var(--muted)]/40 pointer-events-none select-none">
          v2.4.1
        </span>
      </body>
    </html>
  );
}
