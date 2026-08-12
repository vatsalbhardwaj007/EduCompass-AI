import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Geist_Mono,
  Playfair_Display,
  Dancing_Script,
} from "next/font/google";
import "./globals.css";
import { ProfileProvider } from "@/lib/ProfileContext";
import ScrollRevealInit from "@/lib/ScrollRevealInit";
import LogoAnimation from "@/lib/LogoAnimation";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "900"],
});

/** Signature / handwritten wordmark font */
const dancingScript = Dancing_Script({
  variable: "--font-signature",
  subsets: ["latin"],
  weight: ["700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduCompass AI — Find Your Best-Fit Engineering College",
  description:
    "EduCompass AI helps Indian JEE Main/Advanced students find the engineering college that truly fits them — not just the one they can get into. Deterministic scoring meets AI counselling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${plusJakarta.variable} ${playfair.variable} ${dancingScript.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body
        className="min-h-full flex flex-col font-sans selection:bg-white/10 selection:text-white"
        style={{ backgroundColor: "var(--bg-page)", color: "var(--text-primary)" }}
        suppressHydrationWarning
      >
        <ProfileProvider>{children}</ProfileProvider>

        {/* Scroll reveal: wakes up .reveal-on-scroll elements as they enter viewport */}
        <ScrollRevealInit />

        {/*
         * Logo writing animation:
         * Renders as a fixed overlay above all content.
         * Plays once per full page load (layout doesn't remount on SPA nav).
         * Respects prefers-reduced-motion.
         */}
        <LogoAnimation />
      </body>
    </html>
  );
}
