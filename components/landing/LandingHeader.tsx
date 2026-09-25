"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import EduCompassBrand from "@/components/EduCompassBrand";
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
        <EduCompassBrand className="landing-brand" descriptor />

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
