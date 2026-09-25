"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight } from "lucide-react";
import { useEffect, useRef } from "react";
import ProductPreview from "@/components/landing/ProductPreview";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const range = (value: number, start: number, end: number) =>
  clamp((value - start) / (end - start));
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

export default function ScrollLaptopExperience() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame: number | null = null;
    let sectionTop = 0;
    let sectionHeight = 0;
    let viewportHeight = window.innerHeight;

    const refreshGeometry = () => {
      const rect = section.getBoundingClientRect();
      sectionTop = rect.top + window.scrollY;
      sectionHeight = section.offsetHeight;
      viewportHeight = window.innerHeight;
    };

    const updateProgress = () => {
      frame = null;
      const availableDistance = Math.max(sectionHeight - viewportHeight, 1);
      // Finish the transformation before sticky release, leaving a calm moment on the product canvas.
      const progress = clamp((window.scrollY - sectionTop) / (availableDistance * 0.84));
      const turn = range(progress, 0.14, 0.38);
      const screenTakeover = range(progress, 0.38, 0.68);
      const chassisExit = range(progress, 0.6, 0.76);
      const screenSurface = range(progress, 0.48, 0.6);
      const messageIn = range(progress, 0.66, 0.72);
      const messageOut = range(progress, 0.84, 0.92);
      const message = messageIn * (1 - messageOut);
      const preview = range(progress, 0.84, 0.96);

      // The dark canvas begins over the display and its clip expands to the viewport.
      // Keeping the geometry in the same progress loop makes the sequence reversible.
      const collapsedLeft = lerp(64, 21, turn);
      const collapsedRight = lerp(4, 20, turn);
      const collapsedTop = lerp(27, 19, turn);
      const collapsedBottom = lerp(34, 25, turn);

      section.style.setProperty("--laptop-x", `${-28 * turn - 5 * screenTakeover}%`);
      section.style.setProperty("--laptop-y", `${-6 * turn - 10 * screenTakeover}%`);
      section.style.setProperty("--laptop-scale", `${1 + 0.28 * turn + 1.65 * screenTakeover}`);
      section.style.setProperty("--laptop-rotate-x", `${8 * (1 - turn)}deg`);
      section.style.setProperty("--laptop-rotate-y", `${-13 * (1 - turn)}deg`);
      section.style.setProperty("--laptop-opacity", `${1 - chassisExit}`);
      section.style.setProperty("--hero-copy-opacity", `${1 - range(progress, 0.16, 0.34)}`);
      section.style.setProperty("--hero-copy-y", `${-16 * range(progress, 0.16, 0.34)}px`);
      section.style.setProperty("--screen-canvas-opacity", `${screenSurface}`);
      section.style.setProperty("--screen-top", `${collapsedTop * (1 - screenTakeover)}%`);
      section.style.setProperty("--screen-right", `${collapsedRight * (1 - screenTakeover)}%`);
      section.style.setProperty("--screen-bottom", `${collapsedBottom * (1 - screenTakeover)}%`);
      section.style.setProperty("--screen-left", `${collapsedLeft * (1 - screenTakeover)}%`);
      section.style.setProperty("--screen-radius", `${12 * (1 - screenTakeover)}px`);
      section.style.setProperty("--experience-message-opacity", `${message}`);
      section.style.setProperty("--experience-message-y", `${26 * (1 - messageIn) - 8 * messageOut}px`);
      section.style.setProperty("--experience-message-scale", `${0.96 + 0.04 * messageIn}`);
      section.style.setProperty("--preview-opacity", `${preview}`);
      section.style.setProperty("--preview-y", `${14 * (1 - preview)}px`);
      section.style.setProperty("--preview-scale", `${0.985 + preview * 0.015}`);
    };

    const onScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(updateProgress);
    };
    const onResize = () => {
      refreshGeometry();
      onScroll();
    };

    refreshGeometry();
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={sectionRef} className="landing-hero-experience" aria-labelledby="hero-heading">
      <div className="landing-hero-sticky">
        <div className="landing-hero-shell">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow">Built for the decision after the rank</p>
            <h1 id="hero-heading">A clearer way<br />to choose your<br /><em>next move.</em></h1>
            <p className="landing-hero-support">EduCompass turns your score, priorities, and possibilities into a shortlist that feels grounded—not guessed.</p>
            <div className="landing-hero-actions">
              <Link className="landing-primary-action" href="/profile">Find my best-fit colleges <span aria-hidden="true">→</span></Link>
              <a className="landing-text-action" href="#method">See the method <ArrowDownRight size={16} aria-hidden="true" /></a>
            </div>
          </div>

          <div className="landing-laptop-stage" aria-hidden="true">
            <div className="landing-laptop-shot">
              <Image
                src="/images/educompass-hero-laptop-v2.png"
                alt=""
                width={1536}
                height={1024}
                priority
                sizes="(max-width: 700px) 94vw, (max-width: 1100px) 58vw, 720px"
              />
            </div>
          </div>

          <div className="landing-screen-canvas">
            <div className="landing-experience-message" aria-hidden="true">
              <h2>See the full picture.</h2>
              <p>Compare what matters before you choose.</p>
            </div>
            <div className="landing-preview-stage">
              <ProductPreview />
            </div>
          </div>
        </div>
      </div>
      <div className="landing-scroll-cue" aria-hidden="true"><span /> Scroll to enter</div>
    </section>
  );
}
