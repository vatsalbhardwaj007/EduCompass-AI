"use client";

import { useEffect, useRef, type ReactNode } from "react";

type LandingMotionProps = {
  children: ReactNode;
};

/**
 * A single, one-time editorial reveal system for the static landing sections.
 * It leaves the markup visible without JavaScript and avoids scroll listeners.
 */
export default function LandingMotion({ children }: LandingMotionProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const revealAll = () => targets.forEach((target) => target.classList.add("is-revealed"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    root.classList.add("motion-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return <div ref={rootRef} className="landing-motion-root">{children}</div>;
}
