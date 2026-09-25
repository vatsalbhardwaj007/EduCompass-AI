"use client";

import { useEffect, useRef, useState } from "react";

export default function LogoAnimation() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const finishCompletely = () => {
      setVisible(false);
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
      if (el) el.removeEventListener("transitionend", handleTransitionEnd);
      finishCompletely();
    };
  }, []);

  const handleSkip = () => {
    setVisible(false);
    document.body.classList.remove("logo-anim-active");
    document.body.classList.remove("logo-page-opening");
    document.body.classList.add("logo-animation-done");
  };

  if (!visible) return null;

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
