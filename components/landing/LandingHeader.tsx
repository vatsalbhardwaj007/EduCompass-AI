"use client";

import Link from "next/link";
import { Compass, Menu, X } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "@/components/landing/ThemeToggle";

const navigation = [
  { href: "#method", label: "How it works" },
  { href: "#what-we-weigh", label: "What we weigh" },
  { href: "#families", label: "For families" },
];

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="landing-header">
      <div className="landing-header-inner">
        <Link href="/" className="landing-brand" aria-label="EduCompass home">
          <span className="landing-brand-mark" aria-hidden="true">
            <Compass size={19} strokeWidth={1.8} />
          </span>
          <span>
            <span className="landing-brand-name">EduCompass</span>
            <span className="landing-brand-descriptor">Smart engineering admissions</span>
          </span>
          <span className="landing-brand-badge">AI 2.0</span>
        </Link>

        <nav className="landing-desktop-nav" aria-label="Landing page navigation">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="landing-header-actions">
          <ThemeToggle />
          <Link className="landing-header-cta" href="/profile">
            Launch planner <span aria-hidden="true">→</span>
          </Link>
          <button
            type="button"
            className="landing-menu-toggle"
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="landing-mobile-nav" aria-label="Mobile landing page navigation">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
