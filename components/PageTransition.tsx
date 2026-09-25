"use client";

import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <div
      key={pathname}
      className={isLanding ? "app-page" : "app-page app-page-transition"}
    >
      {children}
    </div>
  );
}
