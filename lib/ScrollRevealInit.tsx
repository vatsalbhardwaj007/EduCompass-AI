"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * ScrollRevealInit – pure CSS IntersectionObserver scroll-reveal.
 * Automatically discovers dynamically mounted `.reveal-on-scroll` elements
 * via MutationObserver and pathname changes.
 */
export default function ScrollRevealInit() {
  const pathname = usePathname();

  useEffect(() => {
    const observeElements = () => {
      const els = document.querySelectorAll<HTMLElement>(".reveal-on-scroll:not(.in-view)");
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
        { threshold: 0.05, rootMargin: "50px 0px 50px 0px" }
      );

      els.forEach((el) => {
        // Instant fallback if element is already in viewport
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("in-view");
        } else {
          obs.observe(el);
        }
      });
    };

    // Run initially
    observeElements();
    const timeout = setTimeout(observeElements, 200);

    // Watch for dynamic DOM changes (e.g. recommendation cards rendering)
    const mutationObs = new MutationObserver(() => {
      observeElements();
    });

    mutationObs.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timeout);
      mutationObs.disconnect();
    };
  }, [pathname]);

  return null;
}
