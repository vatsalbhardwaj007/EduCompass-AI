import type { Metadata } from "next";
import "./globals.css";
import { ProfileProvider } from "@/lib/ProfileContext";
import AIChatbot from "@/components/AIChatbot";
import ScrollRevealInit from "@/lib/ScrollRevealInit";
import PageTransition from "@/components/PageTransition";

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
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const saved = localStorage.getItem('educompass-theme'); const theme = saved === 'dark' || saved === 'light' ? saved : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.classList.toggle('dark', theme === 'dark'); document.documentElement.style.colorScheme = theme; } catch { } })();`,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col font-sans"
        style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
        suppressHydrationWarning
      >
        <ProfileProvider>
          <PageTransition>{children}</PageTransition>
          <AIChatbot />
        </ProfileProvider>

        {/* Scroll reveal: wakes up .reveal-on-scroll elements as they enter viewport */}
        <ScrollRevealInit />
      </body>
    </html>
  );
}
