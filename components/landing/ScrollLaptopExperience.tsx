"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowDownRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const range = (value: number, start: number, end: number) =>
  clamp((value - start) / (end - start));
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;
const LAPTOP_FRAME_COUNT = 84;
const LAPTOP_FRAME_WIDTH = 2560;
const LAPTOP_FRAME_HEIGHT = 1600;
const SCREEN_BOUNDS = { left: 52 / LAPTOP_FRAME_WIDTH, top: 96 / LAPTOP_FRAME_HEIGHT, width: 2396 / LAPTOP_FRAME_WIDTH, height: 1448 / LAPTOP_FRAME_HEIGHT };
const PROGRESS_SMOOTHING = 0.28;
const frameSource = (index: number) =>
  `/images/laptop-cinematic/laptop_${String(index).padStart(3, "0")}.webp`;

export default function ScrollLaptopExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const sequenceCanvasRef = useRef<HTMLCanvasElement>(null);
  const [sequenceReady, setSequenceReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const shell = section?.querySelector<HTMLElement>(".landing-hero-shell");
    const canvas = sequenceCanvasRef.current;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactViewport = window.matchMedia("(max-width: 700px)");
    if (!section || !shell || !canvas || prefersReducedMotion.matches || compactViewport.matches) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let animationFrame: number | null = null;
    let preloadTimer: number | null = null;
    let backgroundPreloadTimer: number | null = null;
    let sectionTop = 0;
    let sectionHeight = 0;
    let viewportHeight = window.innerHeight;
    let targetProgress = 0;
    let displayProgress = 0;
    let activeFrame = -1;
    let desiredFrame = 0;
    let travelDirection = 1;
    let lastDrawnFrame = -1;
    let canvasSizeDirty = true;
    let disposed = false;
    let hasRenderedFrame = false;
    let backgroundFrame = 13;
    const loadedFrames = new Map<number, HTMLImageElement>();
    const loadingFrames = new Set<number>();

    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const targetWidth = Math.max(1, Math.round(width * pixelRatio));
      const targetHeight = Math.max(1, Math.round(height * pixelRatio));
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }
      canvasSizeDirty = false;
      return { targetWidth, targetHeight };
    };

    const drawImage = (index: number, image: HTMLImageElement) => {
      const { targetWidth, targetHeight } = resizeCanvas();

      const scale = Math.min(targetWidth / image.naturalWidth, targetHeight / image.naturalHeight);
      const renderWidth = image.naturalWidth * scale;
      const renderHeight = image.naturalHeight * scale;
      context.clearRect(0, 0, targetWidth, targetHeight);
      context.drawImage(
        image,
        (targetWidth - renderWidth) / 2,
        (targetHeight - renderHeight) / 2,
        renderWidth,
        renderHeight,
      );
      lastDrawnFrame = index;
      if (!hasRenderedFrame) {
        hasRenderedFrame = true;
        setSequenceReady(true);
      }
    };

    const closestLoadedFrame = (target: number) => {
      let closest: number | null = null;
      for (const index of loadedFrames.keys()) {
        if (closest === null || Math.abs(index - target) < Math.abs(closest - target)) {
          closest = index;
        }
      }
      return closest;
    };

    const drawFrame = (target: number, force = false) => {
      desiredFrame = target;
      const sourceIndex = loadedFrames.has(target) ? target : closestLoadedFrame(target);
      if (sourceIndex === null) return;
      const source = loadedFrames.get(sourceIndex);
      if (!source || (!force && sourceIndex === lastDrawnFrame && !canvasSizeDirty)) return;
      drawImage(sourceIndex, source);
    };

    const trimFrameCache = () => {
      if (loadedFrames.size <= 18) return;
      const removableFrames = [...loadedFrames.keys()]
        .filter((index) => index !== desiredFrame)
        .sort((left, right) => Math.abs(right - desiredFrame) - Math.abs(left - desiredFrame));
      for (const index of removableFrames) {
        if (loadedFrames.size <= 14) break;
        loadedFrames.delete(index);
      }
    };

    const loadFrame = (index: number) => {
      if (index < 0 || index >= LAPTOP_FRAME_COUNT || loadedFrames.has(index) || loadingFrames.has(index)) return;
      loadingFrames.add(index);
      const image = new window.Image();
      image.decoding = "async";
      image.onload = async () => {
        try {
          await image.decode();
        } catch {
          // Browsers may reject decode() for an already-decoded cache entry.
        }
        loadingFrames.delete(index);
        if (disposed) return;
        loadedFrames.set(index, image);
        trimFrameCache();
        drawFrame(desiredFrame);
      };
      image.onerror = () => loadingFrames.delete(index);
      image.src = frameSource(index);
    };

    const preloadNearbyFrames = (index: number, direction: number) => {
      const offsets = direction >= 0
        ? [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8]
        : [-8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4];
      offsets.forEach((offset) => loadFrame(index + offset));
    };

    const preloadBackgroundFrames = () => {
      if (disposed || backgroundFrame >= LAPTOP_FRAME_COUNT) return;
      const batchEnd = Math.min(backgroundFrame + 6, LAPTOP_FRAME_COUNT);
      for (let index = backgroundFrame; index < batchEnd; index += 1) loadFrame(index);
      backgroundFrame = batchEnd;
      backgroundPreloadTimer = window.setTimeout(preloadBackgroundFrames, 220);
    };

    const refreshGeometry = () => {
      const rect = section.getBoundingClientRect();
      sectionTop = rect.top + window.scrollY;
      sectionHeight = section.offsetHeight;
      viewportHeight = window.innerHeight;
      canvasSizeDirty = true;
    };

    const updateHandoffGeometry = (handoffProgress: number) => {
      const shellRect = shell.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const scale = Math.min(
        canvasRect.width / LAPTOP_FRAME_WIDTH,
        canvasRect.height / LAPTOP_FRAME_HEIGHT,
      );
      const imageWidth = LAPTOP_FRAME_WIDTH * scale;
      const imageHeight = LAPTOP_FRAME_HEIGHT * scale;
      const imageLeft = canvasRect.left + (canvasRect.width - imageWidth) / 2;
      const imageTop = canvasRect.top + (canvasRect.height - imageHeight) / 2;
      const screenLeft = imageLeft + imageWidth * SCREEN_BOUNDS.left - shellRect.left;
      const screenTop = imageTop + imageHeight * SCREEN_BOUNDS.top - shellRect.top;
      const screenWidth = imageWidth * SCREEN_BOUNDS.width;
      const screenHeight = imageHeight * SCREEN_BOUNDS.height;
      const screenRadius = Math.max(4, imageWidth * 0.006);

      section.style.setProperty("--screen-surface-left", `${lerp(screenLeft, -shellRect.left, handoffProgress)}px`);
      section.style.setProperty("--screen-surface-top", `${lerp(screenTop, -shellRect.top, handoffProgress)}px`);
      section.style.setProperty("--screen-surface-width", `${lerp(screenWidth, window.innerWidth, handoffProgress)}px`);
      section.style.setProperty("--screen-surface-height", `${lerp(screenHeight, window.innerHeight, handoffProgress)}px`);
      section.style.setProperty("--screen-surface-radius", `${lerp(screenRadius, 0, handoffProgress)}px`);
    };

    const updateScene = (progress: number) => {
      const sequenceProgress = range(progress, 0.06, 0.8);
      const selectedFrame = Math.min(LAPTOP_FRAME_COUNT - 1, Math.round(sequenceProgress * (LAPTOP_FRAME_COUNT - 1)));
      if (selectedFrame !== activeFrame) {
        travelDirection = selectedFrame < activeFrame ? -1 : 1;
        activeFrame = selectedFrame;
        preloadNearbyFrames(selectedFrame, travelDirection);
      }
      drawFrame(selectedFrame);

      const displayTakeover = range(progress, 0.68, 0.72);
      const screenTakeover = range(progress, 0.72, 0.82);
      const screenSurface = range(progress, 0.72, 0.82);
      const headlineIn = range(progress, 0.84, 0.865);
      const supportIn = range(progress, 0.862, 0.885);
      const messageOut = range(progress, 0.93, 0.95);

      // The sequence stays visible while the calibrated screen plane grows into DOM.
      section.style.setProperty("--laptop-sequence-scale", `${1 + displayTakeover * 0.35}`);
      section.style.setProperty("--laptop-sequence-opacity", `${1 - range(progress, 0.81, 0.86)}`);
      section.style.setProperty("--laptop-poster-opacity", `${1 - range(progress, 0.1, 0.16)}`);
      section.style.setProperty("--hero-copy-opacity", `${1 - range(progress, 0.16, 0.34)}`);
      section.style.setProperty("--hero-copy-y", `${-16 * range(progress, 0.16, 0.34)}px`);
      section.style.setProperty("--screen-canvas-opacity", `${screenSurface}`);
      section.style.setProperty("--experience-headline-opacity", `${headlineIn * (1 - messageOut)}`);
      section.style.setProperty("--experience-headline-y", `${20 * (1 - headlineIn) - 10 * messageOut}px`);
      section.style.setProperty("--experience-support-opacity", `${supportIn * (1 - messageOut)}`);
      section.style.setProperty("--experience-support-y", `${16 * (1 - supportIn) - 8 * messageOut}px`);
      updateHandoffGeometry(screenTakeover);
    };

    const animateToTarget = () => {
      const delta = targetProgress - displayProgress;
      if (Math.abs(delta) < 0.0004) {
        displayProgress = targetProgress;
      } else {
        displayProgress += delta * PROGRESS_SMOOTHING;
      }
      updateScene(displayProgress);
      if (Math.abs(targetProgress - displayProgress) >= 0.0004) {
        animationFrame = window.requestAnimationFrame(animateToTarget);
      } else {
        animationFrame = null;
      }
    };

    const updateProgressTarget = () => {
      const availableDistance = Math.max(sectionHeight - viewportHeight, 1);
      // Finish just before sticky release, leaving a short deliberate dark-screen hold.
      targetProgress = clamp((window.scrollY - sectionTop) / (availableDistance * 0.94));
      if (animationFrame === null) animationFrame = window.requestAnimationFrame(animateToTarget);
    };

    const onScroll = () => {
      updateProgressTarget();
    };
    const onResize = () => {
      refreshGeometry();
      updateProgressTarget();
    };

    refreshGeometry();
    for (let index = 0; index <= 12; index += 1) loadFrame(index);
    preloadTimer = window.setTimeout(() => {
      preloadBackgroundFrames();
    }, 700);
    const availableDistance = Math.max(sectionHeight - viewportHeight, 1);
    targetProgress = clamp((window.scrollY - sectionTop) / (availableDistance * 0.94));
    displayProgress = targetProgress;
    updateScene(displayProgress);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      disposed = true;
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      if (preloadTimer !== null) window.clearTimeout(preloadTimer);
      if (backgroundPreloadTimer !== null) window.clearTimeout(backgroundPreloadTimer);
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
            <div className={`landing-laptop-sequence${sequenceReady ? " is-ready" : ""}`}>
              <Image
                className="landing-laptop-poster"
                src={frameSource(0)}
                alt=""
                width={2560}
                height={1600}
                priority
                unoptimized
              />
              <canvas ref={sequenceCanvasRef} className="landing-laptop-frame-canvas" />
            </div>
          </div>

          <div className="landing-screen-canvas">
            <div className="landing-experience-message" aria-hidden="true">
              <h2>See the full picture.</h2>
              <p>Compare what matters before you choose.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="landing-scroll-cue" aria-hidden="true"><span /> Scroll to enter</div>
    </section>
  );
}
