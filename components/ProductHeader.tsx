"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EduCompassBrand from "@/components/EduCompassBrand";
import ThemeToggle from "@/components/landing/ThemeToggle";

type ProductNavItem = "overview" | "matches" | "compare";

interface ProductHeaderProps {
  active?: ProductNavItem;
  returnHref: string;
  returnLabel: string;
}

const navigation: { href: string; label: string; item: ProductNavItem }[] = [
  { href: "/", label: "Overview", item: "overview" },
  { href: "/dashboard", label: "Matches", item: "matches" },
  { href: "/compare", label: "Compare", item: "compare" },
];

export default function ProductHeader({
  active,
  returnHref,
  returnLabel,
}: ProductHeaderProps) {
  return (
    <header className="product-header">
      <nav className="product-header-inner" aria-label="Product navigation">
        <EduCompassBrand />

        <div className="product-header-links">
          {navigation.map((item) => (
            <Link
              key={item.item}
              href={item.href}
              aria-current={active === item.item ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="product-header-actions">
          <span className="product-theme-label">Theme</span>
          <ThemeToggle />
          <Link className="product-header-return" href={returnHref}>
            <ArrowLeft size={14} aria-hidden="true" />
            {returnLabel}
          </Link>
        </div>
      </nav>
    </header>
  );
}
