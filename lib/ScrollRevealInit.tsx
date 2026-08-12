"use client";

import { useEffect } from "react";

/**
 * ScrollRevealInit – pure CSS IntersectionObserver scroll-reveal.
 * Finds all elements with class `reveal-on-scroll` and adds `in-view`
 * when they enter the viewport. Respects prefers-reduced-motion
 * (the CSS already disables transitions in that case).
 */
export default function ScrollRevealInit() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal-on-scroll");
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return null;
}
