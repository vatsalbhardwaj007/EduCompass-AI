"use client";

import { useEffect, useRef } from "react";

/**
 * LogoAnimation
 *
 * Flow:
 * 1. Overlay (black #0a0a0a) covers page. Body scroll locked.
 * 2. Yellow cursive "EduCompass" + "AI 2.0" badge pops in (0 → ~1.2s).
 * 3. At 2.2s: overlay gets `.logo-transitioning` → CSS opacity transition to 0 (1.2s).
 *             Landing page simultaneously fades in.
 * 4. On `transitionend`: overlay gets `.logo-done` → display:none. Scroll unlocked.
 */
export default function LogoAnimation() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const finishCompletely = () => {
      el.classList.add("logo-done");
      document.body.classList.remove("logo-anim-active");
      document.body.classList.remove("logo-page-opening");
      document.body.classList.add("logo-animation-done");
    };

    if (prefersReduced) {
      finishCompletely();
      return;
    }

    // Lock scroll
    document.body.classList.add("logo-anim-active");

    // At 2.2s: start the opacity fade-out (CSS handles the 1.2s transition)
    const t1 = setTimeout(() => {
      // Trigger landing page fade-in first (slight head start)
      document.body.classList.add("logo-page-opening");

      // Then start overlay fade-out
      requestAnimationFrame(() => {
        el.classList.add("logo-transitioning");
      });
    }, 2200);

    // Listen for the overlay fade to finish, then hide it cleanly
    const handleTransitionEnd = (e: TransitionEvent) => {
      // Only respond to the opacity transition on the overlay itself
      if (e.target === el && e.propertyName === "opacity") {
        finishCompletely();
        el.removeEventListener("transitionend", handleTransitionEnd);
      }
    };

    el.addEventListener("transitionend", handleTransitionEnd);

    // Safety fallback: if transitionend never fires (e.g. display issues)
    const fallback = setTimeout(finishCompletely, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(fallback);
      el.removeEventListener("transitionend", handleTransitionEnd);
      finishCompletely();
    };
  }, []);

  const handleSkip = () => {
    const el = overlayRef.current;
    if (!el) return;
    document.body.classList.add("logo-page-opening");
    el.classList.add("logo-transitioning");

    const onEnd = (e: TransitionEvent) => {
      if (e.target === el && e.propertyName === "opacity") {
        el.classList.add("logo-done");
        document.body.classList.remove("logo-anim-active");
        document.body.classList.remove("logo-page-opening");
        document.body.classList.add("logo-animation-done");
        el.removeEventListener("transitionend", onEnd);
      }
    };
    el.addEventListener("transitionend", onEnd);
  };

  return (
    <div
      ref={overlayRef}
      className="logo-anim-overlay"
      aria-hidden="true"
      role="presentation"
      onClick={handleSkip}
      title="Click to skip intro"
      style={{ cursor: "pointer" }}
    >
      {/* Centered Yellow Signature Wordmark */}
      <div className="logo-anim-inner">
        <span
          className="logo-anim-word"
          aria-label="EduCompass"
          style={{
            fontFamily:
              "var(--font-signature), 'Dancing Script', 'Brush Script MT', cursive, sans-serif",
          }}
        >
          EduCompass
        </span>

      </div>

      {/* Glowing pen-tip cursor */}
      <div className="logo-anim-cursor" aria-hidden="true" />
    </div>
  );
}
