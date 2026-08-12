"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EduCompassLogo from "@/components/EduCompassLogo";
import {
  Compass, ArrowLeft, Sparkles, Loader2,
  IndianRupee, TrendingUp, Home, Code2, Star,
  BookOpen, Award, Bot, MapPin, Trophy,
} from "lucide-react";
import { useProfile } from "@/lib/ProfileContext";

export default function ComparePage() {
  const router = useRouter();
  const { profile, recommendations, selectedCollegeIds } = useProfile();
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    if (!profile || selectedCollegeIds.length < 2) router.push("/dashboard");
  }, [profile, selectedCollegeIds, router]);

  if (!profile || selectedCollegeIds.length < 2) return null;

  const selected = recommendations.filter((r) => selectedCollegeIds.includes(r.college.id));

  const generateAISummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch("/api/counsellor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `Compare these ${selected.length} colleges in detail. Which one is the absolute best fit overall for my JEE Main Rank #${profile.jeeMainRank} and why? Highlight clear trade-offs between tuition fees, placements, and coding culture.`,
          compareMode: true,
          colleges: selected.map((r) => ({
            name: r.college.name, type: r.college.type, city: r.college.city,
            branch: r.matchedBranch.name, overallScore: r.overallScore, fees: r.college.fees,
            avgPackageLPA: r.college.avgPackageLPA, hostelRating: r.college.hostelRating,
            codingCultureRating: r.college.codingCultureRating, placementRating: r.college.placementRating,
            researchRating: r.college.researchRating, breakdown: r.breakdown, topReasons: r.topReasons,
          })),
        }),
      });
      const data = await res.json();
      setAiSummary(data.answer);
    } catch {
      setAiSummary("Failed to generate AI comparison summary. Please check your API key.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const getBestClass = (values: number[], index: number, higher = true) => {
    const best = higher ? Math.max(...values) : Math.min(...values);
    return values[index] === best;
  };

  const metrics = [
    { label: "Overall FIT Score", icon: Award, values: selected.map((r) => r.overallScore), format: (v: number) => `${Math.round(v)} / 100`, higher: true },
    { label: "Total Tuition Fees", icon: IndianRupee, values: selected.map((r) => r.college.fees), format: (v: number) => `₹${(v / 100000).toFixed(1)}L`, higher: false },
    { label: "Average Package (CTC)", icon: TrendingUp, values: selected.map((r) => r.college.avgPackageLPA), format: (v: number) => `₹${v} LPA`, higher: true },
    { label: "ROI Multiplier (CTC/Fees)", icon: TrendingUp, values: selected.map((r) => parseFloat(((r.college.avgPackageLPA * 100000) / r.college.fees).toFixed(1))), format: (v: number) => `${v}x`, higher: true },
    { label: "Hostel Rating", icon: Home, values: selected.map((r) => r.college.hostelRating), format: (v: number) => `${v} / 5`, higher: true },
    { label: "Coding Culture", icon: Code2, values: selected.map((r) => r.college.codingCultureRating), format: (v: number) => `${v} / 5`, higher: true },
    { label: "Placement Rating", icon: Star, values: selected.map((r) => r.college.placementRating), format: (v: number) => `${v} / 5`, higher: true },
  ];

  const scoreMetrics = [
    { label: "Admission Cutoff Safety", key: "admissionSafety" as const },
    { label: "Financial ROI Score", key: "roi" as const },
    { label: "Branch Preference Match", key: "branchMatch" as const },
    { label: "Placement Statistics Score", key: "placement" as const },
    { label: "Hostel Facilities Score", key: "hostel" as const },
    { label: "Coding Culture Score", key: "codingCulture" as const },
  ];

  const cols = selected.length;

  return (
    <div className="relative min-h-screen pb-20" style={{ backgroundColor: "#0a0a0a", color: "#ffffff" }}>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grid-pattern" style={{ opacity: 0.35 }} />
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: "radial-gradient(ellipse 80% 40% at 50% -5%, rgba(255,255,255,0.05) 0%, transparent 70%)" }} />

      {/* Nav */}
      <nav className="sticky top-0 z-40 glass-nav px-6 py-4 md:px-12 flex items-center justify-between">
        <EduCompassLogo />
        <Link href="/dashboard">
          <button className="btn-outline px-4 py-2 text-sm cursor-pointer flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
        </Link>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-8 md:py-12 space-y-8">
        {/* Header */}
        <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 reveal-on-scroll">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-5 w-5 text-white" />
              <span className="badge-white">{selected.length} Colleges Selected</span>
            </div>
            <h1 className="editorial-heading" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
              Head-to-Head Specification Matrix
            </h1>
            <p className="text-xs mt-1" style={{ color: "#888888" }}>
              Side-by-side comparison across overall fit score, fees, placements, and ratings.
            </p>
          </div>
          <button
            onClick={generateAISummary} disabled={loadingSummary}
            className="btn-accent flex items-center gap-2 px-5 py-2.5 text-xs cursor-pointer rounded-full"
          >
            {loadingSummary ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate AI Verdict
          </button>
        </div>

        {/* AI Summary */}
        {aiSummary && (
          <div className="glass-card p-6 space-y-3 reveal-on-scroll" style={{ borderColor: "rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.03)" }}>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}>
                <Bot className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-bold text-sm text-white">AI Counsellor Comparative Verdict</h3>
            </div>
            <div
              className="text-xs leading-relaxed whitespace-pre-line rounded-xl p-4"
              style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", color: "#888888" }}
            >
              {aiSummary}
            </div>
          </div>
        )}

        {/* College header columns */}
        <div className="grid gap-4 reveal-on-scroll" style={{ gridTemplateColumns: `180px repeat(${cols}, 1fr)` }}>
          <div className="flex items-end px-2 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#444444" }}>Comparison Factor</span>
          </div>
          {selected.map((r) => (
            <div key={r.college.id} className="glass-card p-5 text-center space-y-2">
              <span className="badge-white inline-block">{r.college.type}</span>
              <h3 className="font-extrabold text-sm leading-tight text-white">{r.college.name}</h3>
              <p className="text-[11px] font-semibold" style={{ color: "#888888" }}>{r.matchedBranch.name}</p>
              <span className="text-[10px] flex items-center justify-center gap-1" style={{ color: "#555555" }}>
                <MapPin className="h-3 w-3" /> {r.college.city}
              </span>
            </div>
          ))}
        </div>

        {/* Spec table */}
        <div className="glass-card overflow-hidden reveal-on-scroll">
          {metrics.map((metric, mIdx) => (
            <div
              key={metric.label}
              className="grid items-center px-4 py-3.5 text-xs"
              style={{
                gridTemplateColumns: `180px repeat(${cols}, 1fr)`,
                background: mIdx % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
                borderTop: mIdx > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}
            >
              <div className="flex items-center gap-2 font-semibold" style={{ color: "#777777" }}>
                <metric.icon className="h-4 w-4 flex-shrink-0 text-white" />
                {metric.label}
              </div>
              {metric.values.map((val, idx) => {
                const isBest = getBestClass(metric.values, idx, metric.higher);
                return (
                  <div key={idx} className="text-center font-mono">
                    {isBest ? (
                      <span className="inline-block px-2.5 py-1 rounded-lg font-extrabold text-black" style={{ background: "#ffffff" }}>
                        {metric.format(val)}
                      </span>
                    ) : (
                      <span style={{ color: "#666666", fontWeight: 500 }}>{metric.format(val)}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Score breakdown header */}
          <div className="px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#888888" }}>Factor Breakdown Ratings (0 — 100)</span>
          </div>

          {scoreMetrics.map((metric, mIdx) => {
            const values = selected.map((r) => r.breakdown[metric.key]);
            return (
              <div
                key={metric.label}
                className="grid items-center px-4 py-3.5 text-xs"
                style={{
                  gridTemplateColumns: `180px repeat(${cols}, 1fr)`,
                  background: mIdx % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div className="font-medium" style={{ color: "#777777" }}>{metric.label}</div>
                {values.map((val, idx) => {
                  const isBest = getBestClass(values, idx, true);
                  return (
                    <div key={idx} className="text-center font-mono">
                      {isBest ? (
                        <span className="inline-block px-2.5 py-1 rounded-lg font-extrabold text-black" style={{ background: "#ffffff" }}>
                          {Math.round(val)} / 100
                        </span>
                      ) : (
                        <span style={{ color: "#666666", fontWeight: 500 }}>{Math.round(val)} / 100</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs" style={{ color: "#444444" }}>
          ⚠️ Data shown is illustrative sample data for demo purposes only.
        </p>
      </div>
    </div>
  );
}
