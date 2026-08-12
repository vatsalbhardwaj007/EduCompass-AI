"use client";

import { useState } from "react";
import Link from "next/link";
import EduCompassLogo from "@/components/EduCompassLogo";
import {
  GraduationCap,
  Target,
  BarChart3,
  MessageSquareText,
  ArrowRight,
  Sparkles,
  Shield,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Building2,
  Award,
  Zap,
  ChevronRight,
  Compass,
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Transparent FIT Score Engine",
    description:
      "Deterministic 6-factor algorithm evaluating admission safety, ROI, branch match, placements, hostel quality & coding culture — zero AI hallucination.",
    badge: "100% Deterministic",
  },
  {
    icon: Sliders,
    title: "Real-Time Factor Weighting",
    description:
      "Customize what matters most to YOU. Adjust sliders for budget, coding culture, or placements and watch college rankings re-order live.",
    badge: "Interactive Tuning",
  },
  {
    icon: BarChart3,
    title: "Side-by-Side Spec Matrix",
    description:
      "Compare up to 3 colleges head-to-head. Visual breakdown of fees, average CTC, NIRF rankings, and cutoff safety across all categories.",
    badge: "Head-to-Head",
  },
  {
    icon: MessageSquareText,
    title: "Grounded AI Counsellor",
    description:
      "Chat with an AI counsellor trained strictly on your matched dataset. Get honest answers without fake numbers or fluff.",
    badge: "Llama 3.3 Powered",
  },
];

const stats = [
  { value: "25+", label: "Premier Colleges (IIT, NIT, IIIT)" },
  { value: "6", label: "Weighted Scoring Pillars" },
  { value: "100%", label: "Verifiable Decision Rules" },
  { value: "0", label: "AI Hallucinations on Ranks" },
];

export default function LandingPage() {
  const [simRank, setSimRank] = useState(4500);
  const [simWeightPlacement, setSimWeightPlacement] = useState(80);

  const calculatedScore = Math.min(
    98,
    Math.max(45, Math.round(92 - (simRank / 1000) * 4 + (simWeightPlacement / 100) * 12))
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ backgroundColor: "#0a0a0a", color: "#ffffff" }}>

      {/* ── Ambient background: subtle radial top glow + grid ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grid-pattern" style={{ opacity: 0.5 }} />
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(255,255,255,0.06) 0%, transparent 70%)",
        }}
      />
      {/* Bottom vignette */}
      <div
        className="pointer-events-none fixed bottom-0 left-0 right-0 -z-10 h-64"
        style={{ background: "linear-gradient(to top, #0a0a0a 0%, transparent 100%)" }}
      />

      {/* ── Navigation ── */}
      <header className="sticky top-0 z-50 glass-nav">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
          <EduCompassLogo size="md" />

          <Link href="/profile">
            <button className="btn-accent px-5 py-2 text-sm cursor-pointer">
              Launch Planner
              <ArrowRight className="inline ml-1.5 h-4 w-4 -mb-0.5" />
            </button>
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-20 md:pt-24 md:pb-28 md:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div className="space-y-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full border animate-reveal-up"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderColor: "rgba(255,255,255,0.14)",
                color: "#aaaaaa",
              }}
            >
              <Sparkles className="h-3.5 w-3.5 animate-spin-slow" style={{ color: "#ffffff" }} />
              Engineered for JEE Main &amp; Advanced Aspirants
            </div>

            <h1
              className="editorial-heading animate-reveal-up delay-75"
              style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)", lineHeight: 1.1 }}
            >
              Where{" "}
              <span style={{ color: "#ffffff", fontStyle: "italic" }}>SHOULD</span>{" "}
              you go,
              <br />
              not just where{" "}
              <span style={{ color: "#888888", fontStyle: "italic" }}>CAN</span>{" "}
              you get in?
            </h1>

            <p
              className="text-lg leading-relaxed max-w-lg animate-reveal-up delay-150"
              style={{ color: "#888888" }}
            >
              Stop guessing cutoffs.{" "}
              <strong style={{ color: "#ffffff", fontWeight: 600 }}>EduCompass AI</strong>{" "}
              calculates a multi-dimensional{" "}
              <strong style={{ color: "#ffffff", fontWeight: 600 }}>FIT score</strong>{" "}
              combining admission safety, ROI, branch preference, hostel quality, and coding culture.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-reveal-up delay-225">
              <Link href="/profile">
                <button className="btn-accent px-8 py-3.5 text-base cursor-pointer flex items-center gap-2 rounded-full">
                  <Zap className="h-4 w-4" />
                  Find My Best-Fit Colleges
                  <ChevronRight className="h-4 w-4" />
                </button>
              </Link>
            </div>

            <div
              className="flex flex-wrap gap-5 text-xs font-medium animate-reveal-up delay-300"
              style={{ color: "#555555" }}
            >
              {[
                "Deterministic Scoring Engine",
                "No Hallucinated Data",
                "IIT, NIT, IIIT, GFTI Datasets",
              ].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: "#888888" }} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Realistic MacBook 3D Mockup */}
          <div className="relative flex justify-center items-end animate-reveal-up delay-150" style={{ paddingBottom: "24px" }}>

            {/* Ambient glow behind */}
            <div className="absolute inset-0 -z-10 pointer-events-none" style={{
              background: "radial-gradient(ellipse 75% 55% at 50% 65%, rgba(250,204,21,0.07) 0%, transparent 70%)",
            }} />

            {/* Master perspective container */}
            <div style={{ width: "100%", maxWidth: "580px", perspective: "2200px", perspectiveOrigin: "50% 10%" }}>

              {/* Full laptop — 3D tilt */}
              <div style={{
                transform: "rotateX(10deg) rotateY(-5deg) rotateZ(0.5deg)",
                transformStyle: "preserve-3d",
                filter: "drop-shadow(0 50px 70px rgba(0,0,0,0.9)) drop-shadow(0 15px 30px rgba(0,0,0,0.6))",
              }}>

                {/* ════════════════════════════════
                    SCREEN LID
                ════════════════════════════════ */}
                <div style={{
                  position: "relative",
                  background: "linear-gradient(155deg, #5c5c60 0%, #4a4a4e 15%, #3e3e42 40%, #363638 70%, #2e2e30 100%)",
                  borderRadius: "18px 18px 5px 5px",
                  padding: "3px 3px 0 3px",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.18)," +
                    "inset 1px 0 0 rgba(255,255,255,0.07)," +
                    "inset -1px 0 0 rgba(0,0,0,0.25)," +
                    "0 -2px 6px rgba(0,0,0,0.5)",
                }}>

                  {/* Lid bottom edge — thin aluminum strip before hinge */}
                  <div style={{
                    position: "absolute",
                    bottom: -5, left: 8, right: 8,
                    height: 5,
                    background: "linear-gradient(180deg, #1c1c1e 0%, #0f0f10 100%)",
                    borderRadius: "0 0 3px 3px",
                  }} />

                  {/* Screen inner bezel */}
                  <div style={{
                    background: "#141416",
                    borderRadius: "16px 16px 3px 3px",
                    padding: "13px 7px 7px",
                    position: "relative",
                    overflow: "hidden",
                  }}>

                    {/* Notch */}
                    <div style={{
                      position: "absolute",
                      top: 0, left: "50%",
                      transform: "translateX(-50%)",
                      width: 62, height: 12,
                      background: "#141416",
                      borderRadius: "0 0 10px 10px",
                      zIndex: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      {/* Camera */}
                      <div style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: "#0d0d0f",
                        boxShadow: "0 0 0 1px rgba(255,255,255,0.07), inset 0 0 3px rgba(255,255,255,0.12)",
                      }} />
                    </div>

                    {/* ── DISPLAY ── */}
                    <div style={{
                      borderRadius: "10px",
                      overflow: "hidden",
                      aspectRatio: "16/10",
                      background: "#090909",
                      position: "relative",
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05), 0 0 40px rgba(255,255,255,0.02) inset",
                    }}>

                      {/* Screen glow */}
                      <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: "45%", pointerEvents: "none", zIndex: 10,
                        background: "radial-gradient(ellipse 85% 65% at 50% 0%, rgba(255,255,255,0.05) 0%, transparent 80%)",
                      }} />

                      {/* ── Mini Website ── */}
                      <div style={{ width: "100%", height: "100%", fontSize: "7px", overflow: "hidden", position: "relative", background: "#0a0a0a" }}>

                        {/* Nav */}
                        <div style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "5px 12px", background: "rgba(8,8,8,0.97)",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "linear-gradient(135deg,#f0b429,#c98a00)", boxShadow: "0 0 6px rgba(240,180,41,0.6)" }} />
                            <span style={{ color: "#e8e8e8", fontWeight: 700, fontSize: "7.5px", letterSpacing: "0.03em" }}>EduCompass</span>
                          </div>
                          <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, padding: "2px 8px", fontSize: "5.5px", color: "#ccc", fontWeight: 600 }}>
                            Launch Planner →
                          </div>
                        </div>

                        {/* Hero */}
                        <div style={{ display: "flex", padding: "10px 12px 6px", gap: "10px", alignItems: "flex-start" }}>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 999, padding: "2px 6px", fontSize: "4.5px", color: "#888", width: "fit-content" }}>
                              ✦ Engineered for JEE Aspirants
                            </div>
                            <div style={{ color: "#fff", fontWeight: 800, fontSize: "10px", lineHeight: 1.2, marginTop: 1 }}>
                              Where <em>SHOULD</em> you go,<br />
                              not just where <span style={{ color: "#555" }}><em>CAN</em></span> you?
                            </div>
                            <div style={{ color: "#555", fontSize: "5px", lineHeight: 1.6, maxWidth: "115px" }}>
                              <span style={{ color: "#bbb", fontWeight: 600 }}>EduCompass AI</span> calculates your<br />multi-dimensional FIT score.
                            </div>
                            <div style={{ background: "#fff", color: "#000", borderRadius: 999, padding: "3px 9px", fontSize: "5px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3, width: "fit-content" }}>
                              ⚡ Find My Best-Fit Colleges →
                            </div>
                          </div>

                          {/* FIT Card */}
                          <div style={{ flexShrink: 0, width: 115, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "7px 8px" }}>
                            <div style={{ fontSize: "4.5px", color: "#666", marginBottom: 4, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>FIT Score Simulator</div>
                            {[["JEE Rank", "#4,500", "22%", "#fff"], ["Placement Wt.", "80%", "80%", "#555"]].map(([l, v, pct, c]) => (
                              <div key={String(l)} style={{ marginBottom: 5 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "4px", color: "#666", marginBottom: 2 }}>
                                  <span>{l}</span><span style={{ color: String(c) }}>{v}</span>
                                </div>
                                <div style={{ height: 2, background: "#1c1c1c", borderRadius: 999 }}>
                                  <div style={{ width: String(pct), height: "100%", background: String(c), borderRadius: 999 }} />
                                </div>
                              </div>
                            ))}
                            <div style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 5, padding: "4px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <div style={{ fontSize: "3.5px", color: "#444", marginBottom: 1 }}>Overall FIT</div>
                                <span style={{ fontSize: "12px", fontWeight: 800, color: "#fff", fontFamily: "monospace", lineHeight: 1 }}>84</span>
                                <span style={{ fontSize: "3.5px", color: "#333" }}>/100</span>
                              </div>
                              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 3, padding: "2px 5px", fontSize: "3.5px", color: "#eee", fontWeight: 700 }}>High Fit ✓</div>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div style={{ display: "flex", justifyContent: "space-around", padding: "5px 12px", borderTop: "1px solid rgba(255,255,255,0.04)", marginTop: 2 }}>
                          {[["25+","Colleges"],["6","Factors"],["100%","Verifiable"],["0","Hallucinations"]].map(([v,l]) => (
                            <div key={String(l)} style={{ textAlign: "center" }}>
                              <div style={{ fontSize: "8px", fontWeight: 800, color: "#fff" }}>{v}</div>
                              <div style={{ fontSize: "3.5px", color: "#444", marginTop: 1 }}>{l}</div>
                            </div>
                          ))}
                        </div>

                      </div>
                    </div>
                  </div>
                </div>

                {/* ════════════════════════════════
                    HINGE
                ════════════════════════════════ */}
                <div style={{
                  height: 7,
                  marginLeft: 10, marginRight: 10,
                  background: "linear-gradient(180deg, #0a0a0a 0%, #181818 50%, #222224 100%)",
                  boxShadow: "0 2px 14px rgba(0,0,0,1), inset 0 1px 0 rgba(255,255,255,0.04)",
                }} />

                {/* ════════════════════════════════
                    BASE — Keyboard & Trackpad
                ════════════════════════════════ */}
                <div style={{
                  position: "relative",
                  background: "linear-gradient(170deg, #484849 0%, #404042 20%, #3a3a3c 55%, #333334 80%, #2c2c2e 100%)",
                  borderRadius: "4px 4px 18px 18px",
                  padding: "12px 18px 16px",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.1)," +
                    "inset 0 -1px 0 rgba(0,0,0,0.5)," +
                    "0 0 0 1px rgba(255,255,255,0.06)," +
                    "0 10px 50px rgba(0,0,0,0.9)",
                }}>

                  {/* Left ports (MagSafe + 2× USB-C) */}
                  <div style={{ position: "absolute", left: -1, top: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                    {/* MagSafe */}
                    <div style={{ width: 5, height: 10, background: "linear-gradient(90deg,#0a0a0a,#252528)", borderRadius: "0 3px 3px 0", boxShadow: "inset 0 0 4px rgba(0,0,0,0.8)" }} />
                    {/* USB-C × 2 */}
                    {[16, 16].map((h, i) => (
                      <div key={i} style={{ width: 5, height: h, background: "linear-gradient(90deg,#0a0a0a,#1e1e20)", borderRadius: "0 4px 4px 0", boxShadow: "inset 0 0 4px rgba(0,0,0,0.8)" }} />
                    ))}
                  </div>

                  {/* Right ports (USB-C + headphone) */}
                  <div style={{ position: "absolute", right: -1, top: 22, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ width: 5, height: 16, background: "linear-gradient(90deg,#1e1e20,#0a0a0a)", borderRadius: "4px 0 0 4px", boxShadow: "inset 0 0 4px rgba(0,0,0,0.8)" }} />
                    <div style={{ width: 5, height: 9, background: "linear-gradient(90deg,#181818,#0a0a0a)", borderRadius: "3px 0 0 3px", boxShadow: "inset 0 0 4px rgba(0,0,0,0.8)" }} />
                  </div>

                  {/* ── KEYBOARD — 6 rows, full perspective tilt ── */}
                  <div style={{ perspective: "500px", perspectiveOrigin: "50% -10%", marginBottom: 10 }}>
                    <div style={{ transform: "rotateX(22deg)", transformOrigin: "top center", transformStyle: "preserve-3d" }}>

                      {/* fn / function row */}
                      {(() => {
                        const fnRow = [1.4, ...Array(12).fill(1), 1.2];
                        return (
                          <div style={{ display: "flex", gap: "2px", marginBottom: "3px" }}>
                            {fnRow.map((w, i) => (
                              <div key={i} style={{ flex: w, height: 8, position: "relative" }}>
                                <div style={{
                                  position: "absolute", inset: 0,
                                  background: i === fnRow.length - 1
                                    ? "linear-gradient(145deg,#4a4a4e,#38383c)"  // Touch ID
                                    : "linear-gradient(145deg,#3a3a3c,#2e2e30)",
                                  borderRadius: 2,
                                  boxShadow:
                                    "inset 0 1px 0 rgba(255,255,255,0.12)," +
                                    "inset 0 -1px 0 rgba(0,0,0,0.5)," +
                                    "0 2px 4px rgba(0,0,0,0.6)," +
                                    "0 0 0 0.5px rgba(255,255,255,0.06)",
                                }}>
                                  {i === fnRow.length - 1 && (
                                    <div style={{ position: "absolute", inset: 1, borderRadius: 1, background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.08)" }} />
                                  )}
                                </div>
                                {/* south wall */}
                                <div style={{ position: "absolute", bottom: -3, left: 1, right: 1, height: 3, background: "#111", borderRadius: "0 0 2px 2px" }} />
                              </div>
                            ))}
                          </div>
                        );
                      })()}

                      {/* Rows 1-5 */}
                      {[
                        [1.2, 1,1,1,1,1,1,1,1,1,1,1,1, 1.8],   // ` 1 2 … 0 - = delete
                        [1.6, 1,1,1,1,1,1,1,1,1,1,1,1, 1.4],   // tab q w … ] \
                        [1.85,1,1,1,1,1,1,1,1,1,1,1,   2.15],  // caps a s … ; return
                        [2.3, 1,1,1,1,1,1,1,1,1,1,     2.3],   // shift z x … / shift
                        [1.3, 1.1,1.1, 4.6, 1.1,1.1,1.1, 1.3], // fn ctrl opt ___space opt cmd
                      ].map((row, ri) => (
                        <div key={ri} style={{ display: "flex", gap: "2px", marginBottom: ri < 4 ? "2px" : 0 }}>
                          {row.map((w, ki) => (
                            <div key={ki} style={{ flex: w, height: ri === 4 ? 11 : 12, position: "relative" }}>
                              {/* Key face */}
                              <div style={{
                                position: "absolute", inset: 0,
                                background: "linear-gradient(150deg, #363638 0%, #2e2e30 50%, #282829 100%)",
                                borderRadius: 2.5,
                                boxShadow:
                                  "inset 0 1px 0 rgba(255,255,255,0.13)," +
                                  "inset 0 -1px 0 rgba(0,0,0,0.55)," +
                                  "inset 1px 0 0 rgba(255,255,255,0.04)," +
                                  "0 1px 0 rgba(255,255,255,0.03)," +
                                  "0 3px 5px rgba(0,0,0,0.65)," +
                                  "0 0 0 0.5px rgba(255,255,255,0.06)",
                              }}>
                                {/* Subtle backlight on space bar */}
                                {ri === 4 && ki === 3 && (
                                  <div style={{ position: "absolute", inset: 0, borderRadius: 2.5, background: "rgba(255,255,255,0.02)" }} />
                                )}
                              </div>
                              {/* South wall depth */}
                              <div style={{ position: "absolute", bottom: -3, left: 1, right: 1, height: 3, background: "linear-gradient(180deg,#141414,#0c0c0c)", borderRadius: "0 0 2px 2px" }} />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── TRACKPAD (Force Touch) ── */}
                  <div style={{
                    width: "52%",
                    height: 54,
                    margin: "0 auto",
                    background: "linear-gradient(160deg, #3c3c3e 0%, #343436 40%, #2e2e30 100%)",
                    borderRadius: 8,
                    border: "1px solid rgba(0,0,0,0.6)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.08)," +
                      "inset 0 -1px 0 rgba(0,0,0,0.6)," +
                      "inset 0 0 0 0.5px rgba(255,255,255,0.05)," +
                      "0 1px 3px rgba(0,0,0,0.5)",
                  }}>
                    {/* Trackpad surface sheen */}
                    <div style={{
                      margin: "2px",
                      height: "calc(100% - 4px)",
                      borderRadius: 6,
                      background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, transparent 60%)",
                    }} />
                  </div>

                  {/* Base bottom thickness strip */}
                  <div style={{
                    position: "absolute",
                    bottom: -6, left: 14, right: 14,
                    height: 6,
                    background: "linear-gradient(180deg,#1c1c1e,#101012)",
                    borderRadius: "0 0 10px 10px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.8)",
                  }} />

                  {/* Rubber feet hints */}
                  {[8, "calc(100% - 24px)"].map((x, i) => (
                    <div key={i} style={{
                      position: "absolute", bottom: -8, left: typeof x === "number" ? x : undefined, right: typeof x === "string" ? 8 : undefined,
                      width: 16, height: 4, background: "#0a0a0a", borderRadius: 999,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.9)",
                    }} />
                  ))}
                </div>

                {/* Desk shadow cast */}
                <div style={{
                  marginTop: 8,
                  height: 16,
                  background: "radial-gradient(ellipse 85% 100% at 50% 0%, rgba(0,0,0,0.55) 0%, transparent 80%)",
                  filter: "blur(6px)",
                  transform: "scaleY(0.6) scaleX(0.92)",
                  transformOrigin: "top center",
                }} />

              </div>
            </div>
          </div>


        </div>

      </section>

      {/* ── Stats Bar ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(17,17,17,0.6)" }}>
        <div className="mx-auto max-w-7xl py-10 px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={s.label} className="text-center space-y-1 reveal-on-scroll" style={{ transitionDelay: `${i * 75}ms` }}>
              <div className="text-3xl md:text-4xl font-black font-mono text-white">{s.value}</div>
              <div className="text-xs font-semibold tracking-wide" style={{ color: "#555555" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How It Works ── */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-12">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16 reveal-on-scroll">
          <span className="badge-white text-[10px] uppercase tracking-wider font-bold">Simple 3-Step Process</span>
          <h2 className="editorial-heading mt-3" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)" }}>
            How EduCompass AI Works
          </h2>
          <p style={{ color: "#888888", fontSize: "0.95rem" }}>
            From raw rank to a tailored college shortlist in less than 2 minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-7">
          {[
            {
              step: "01", icon: Shield, title: "Input Student Specs",
              description: "Enter your JEE Main rank, optional Advanced rank, category (GEN/OBC/SC/ST/EWS), budget ceiling, home state, and preferred engineering branches.",
            },
            {
              step: "02", icon: TrendingUp, title: "Deterministic Engine Execution",
              description: "Our algorithm scores colleges across 6 weighted dimensions (Safety, ROI, Branch, Placement, Hostel, Coding Culture) producing a unified 0-100 FIT score.",
            },
            {
              step: "03", icon: MessageSquareText, title: "AI Counsellor Deep Dive",
              description: "Chat with our AI counsellor to compare matched colleges, analyze ROI trade-offs, or generate exportable PDF decision reports.",
            },
          ].map((item, i) => (
            <div
              key={item.step}
              className="glass-card glass-card-hover relative overflow-hidden reveal-on-scroll"
              style={{ padding: "36px 28px", transitionDelay: `${i * 90}ms` }}
            >
              <div
                className="absolute top-4 right-6 text-5xl font-black font-mono select-none pointer-events-none"
                style={{ color: "rgba(255,255,255,0.03)" }}
              >
                {item.step}
              </div>
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <item.icon className="h-6 w-6" style={{ color: "#ffffff" }} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#888888" }}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section
        className="py-20 px-6 md:px-12"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(17,17,17,0.35)" }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16 reveal-on-scroll">
            <span className="badge-white text-[10px] uppercase tracking-wider font-bold">Architected for Precision</span>
            <h2 className="editorial-heading mt-3" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)" }}>
              Why Students &amp; Parents Trust EduCompass
            </h2>
            <p style={{ color: "#888888", fontSize: "0.95rem" }}>
              Unlike generic search portals, EduCompass provides personalised, transparent fit metrics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-7">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="glass-card glass-card-hover flex gap-5 items-start reveal-on-scroll"
                style={{ padding: "28px 24px", transitionDelay: `${i * 80}ms` }}
              >
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold text-base text-white">{f.title}</h3>
                    <span className="badge-white shrink-0" style={{ fontSize: "0.6rem", letterSpacing: "0.04em" }}>
                      {f.badge}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#888888" }}>{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-5xl px-6 py-24 md:px-12">
        <div
          className="glass-card glow-white relative overflow-hidden text-center reveal-on-scroll"
          style={{ padding: "64px 48px", borderColor: "rgba(255,255,255,0.12)" }}
        >
          <div
            className="absolute top-0 right-0 pointer-events-none"
            style={{ width: "320px", height: "320px", background: "radial-gradient(ellipse at top right, rgba(255,255,255,0.05) 0%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-0 left-0 pointer-events-none"
            style={{ width: "280px", height: "280px", background: "radial-gradient(ellipse at bottom left, rgba(255,255,255,0.03) 0%, transparent 70%)" }}
          />

          <div className="relative z-10 space-y-7">
            <span className="badge-white text-[10px] uppercase tracking-wider font-bold">
              <Building2 className="inline h-3 w-3 mr-1 -mt-0.5" /> Instant Access — 100% Free
            </span>

            <h2 className="editorial-heading" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
              Discover Your True Best-Fit Engineering College Today
            </h2>

            <p className="max-w-xl mx-auto text-base leading-relaxed" style={{ color: "#888888" }}>
              Take 2 minutes to fill out your rank and preferences. Unlock personalised match scores,
              side-by-side comparison tables, and AI counsellor insights.
            </p>

            <div>
              <Link href="/profile">
                <button className="btn-accent px-10 py-3.5 text-base cursor-pointer rounded-full">
                  Get Started Now
                  <ArrowRight className="inline ml-2 h-5 w-5 -mb-0.5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-8 md:px-12 text-xs"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(10,10,10,0.9)",
          color: "#444444",
        }}
      >
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Compass className="h-4 w-4" style={{ color: "#777777" }} />
            <span className="font-semibold" style={{ color: "#888888" }}>EduCompass AI</span>
            <span>| Hackathon Demo Version</span>
          </div>
          <p>
            ⚠️ Cutoffs and ratings are sample data for demonstration. Not for actual admission counseling decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
