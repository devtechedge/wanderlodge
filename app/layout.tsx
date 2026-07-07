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

export const metadata: Metadata = {
  title: "WanderLodge — Curated Cabins, Lodges & Local Adventures",
  description: "Explore highly curated architectural lodges, mountain-view timber cabins, and bespoke waterfront retreats.",
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
