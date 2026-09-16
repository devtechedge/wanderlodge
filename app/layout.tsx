import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const PAGE_TITLE = "WanderLodge - Curated Cabins, Lodges & Local Adventures";
const PAGE_DESCRIPTION = "Explore highly curated architectural lodges, mountain-view timber cabins, and bespoke waterfront retreats.";
const SITE_URL = "https://wanderlodge-taupe.vercel.app";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  // Shared links (LinkedIn, Slack, email) render a bare URL without these.
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: SITE_URL,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body suppressHydrationWarning className="bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
        <StoreProvider>
          {children}
          <AccessibilityToolbar />
        </StoreProvider>
      </body>
    </html>
  );
}
