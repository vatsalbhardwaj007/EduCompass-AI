"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sliders,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
} from "lucide-react";
import EduCompassLogo from "@/components/EduCompassLogo";
import { useProfile } from "@/lib/ProfileContext";
import { ScoringWeights, DEFAULT_WEIGHTS, RecommendedCollege } from "@/lib/types";
import { colleges } from "@/data/colleges";
import { getRecommendations } from "@/lib/recommend";

function normalizeWeights(weights: ScoringWeights): ScoringWeights {
  const total = (Object.values(weights) as number[]).reduce((a, b) => a + b, 0) || 1;
  return {
    admissionSafety: weights.admissionSafety / total,
    roi: weights.roi / total,
    branchMatch: weights.branchMatch / total,
    placement: weights.placement / total,
    hostel: weights.hostel / total,
    codingCulture: weights.codingCulture / total,
  };
}

export default function TuneWeightsPage() {
  const router = useRouter();
  const { profile, weights, setWeights } = useProfile();
  const [localWeights, setLocalWeights] = useState<ScoringWeights>(weights);
  const [activePreset, setActivePreset] = useState<string>("custom");

  useEffect(() => {
    setLocalWeights(weights);
  }, [weights]);

  // Compute live preview recommendations based on current local weights
  const previewRecs: RecommendedCollege[] = React.useMemo(() => {
    if (!profile) return [];
    return getRecommendations(profile, colleges, localWeights).slice(0, 5);
  }, [profile, localWeights]);

  const presets: { id: string; label: string; desc: string; weights: ScoringWeights }[] = [
    {
      id: "balanced",
      label: "Balanced",
      desc: "Equalized distribution across all 6 parameters (Default)",
      weights: DEFAULT_WEIGHTS,
    },
    {
      id: "placement",
      label: "High Placement",
      desc: "Max weight on placement stats, average CTC, and recruitments",
      weights: { admissionSafety: 0.1, roi: 0.1, branchMatch: 0.1, placement: 0.5, hostel: 0.1, codingCulture: 0.1 },
    },
    {
      id: "roi",
      label: "Maximum ROI",
      desc: "Favors lower tuition fees and higher package multipliers",
      weights: { admissionSafety: 0.15, roi: 0.45, branchMatch: 0.15, placement: 0.15, hostel: 0.05, codingCulture: 0.05 },
    },
    {
      id: "coding",
      label: "Tech & Coding Culture",
      desc: "Boosts colleges known for competitive programming & tech clubs",
      weights: { admissionSafety: 0.1, roi: 0.1, branchMatch: 0.1, placement: 0.2, hostel: 0.1, codingCulture: 0.4 },
    },
    {
      id: "safety",
      label: "Safe Admission",
      desc: "Prioritizes closing rank feasibility to maximize admission security",
      weights: { admissionSafety: 0.5, roi: 0.1, branchMatch: 0.15, placement: 0.1, hostel: 0.05, codingCulture: 0.1 },
    },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    const normalized = normalizeWeights(preset.weights);
    setLocalWeights(normalized);
    setActivePreset(preset.id);
  };

  const handleSliderChange = (key: keyof ScoringWeights, value: number) => {
    setActivePreset("custom");
    const updated = normalizeWeights({
      ...localWeights,
      [key]: value / 100,
    });
    setLocalWeights(updated);
  };

  const handleSave = () => {
    setWeights(localWeights);
    router.push("/dashboard");
  };

  const handleReset = () => {
    applyPreset(presets[0]);
  };

  const factorItems = [
    {
      key: "admissionSafety" as const,
      label: "Admission Cutoff Safety",
      description: "How comfortably your rank beats historic cutoff thresholds.",
    },
    {
      key: "placement" as const,
      label: "Placement Package & Quality",
      description: "Average CTC, top recruiters, and verified institutional placement rate.",
    },
    {
      key: "roi" as const,
      label: "Financial Return on Investment (ROI)",
      description: "Salary multiplier relative to 4-year tuition expenditure.",
    },
    {
      key: "branchMatch" as const,
      label: "Preferred Branch Alignment",
      description: "Matching with your selected engineering disciplines.",
    },
    {
      key: "codingCulture" as const,
      label: "Coding Culture & Tech Ecosystem",
      description: "Hackathons, ICPC standings, student developer clubs, open source.",
    },
    {
      key: "hostel" as const,
      label: "Hostel & Campus Infrastructure",
      description: "Accommodation quality, mess food, sports, and campus life ratings.",
    },
  ];

  return (
    <div className="relative min-h-screen pb-24" style={{ backgroundColor: "#0a0a0a", color: "#ffffff" }}>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grid-pattern" style={{ opacity: 0.35 }} />
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% -5%, rgba(255,255,255,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Nav */}
      <nav className="sticky top-0 z-40 glass-nav px-6 py-4 md:px-12 flex items-center justify-between">
        <EduCompassLogo />
        <Link href="/dashboard">
          <button className="btn-outline px-4 py-2 text-sm cursor-pointer flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
        </Link>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-8 md:py-12 space-y-8">
        {/* Header */}
        <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white">
              <Sliders className="h-3.5 w-3.5" />
              Weight Tuning Studio
            </div>
            <h1 className="editorial-heading text-2xl md:text-3xl font-bold">
              Customize Your Scoring Formula
            </h1>
            <p className="text-xs md:text-sm text-neutral-400 max-w-2xl">
              Every student prioritizes differently. Adjust the weights below to tailor how the 0–100 FIT score calculates colleges for your specific rank and career targets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="btn-outline flex items-center gap-1.5 px-4 py-2 text-xs rounded-full cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
            <button
              onClick={handleSave}
              className="btn-accent flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold rounded-full cursor-pointer shadow-lg shadow-white/5"
            >
              <CheckCircle2 className="h-4 w-4" /> Apply &amp; View Dashboard
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
              Quick Strategy Presets
            </h2>
            {activePreset === "custom" && (
              <span className="text-xs text-amber-400 font-mono">Customized Weights</span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {presets.map((preset) => {
              const isSelected = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-white text-black border-white shadow-md"
                      : "bg-[#141414] border-white/10 hover:border-white/30 text-white"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-xs mb-1 flex items-center justify-between">
                      {preset.label}
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-black" />}
                    </div>
                    <p
                      className={`text-[11px] leading-relaxed ${
                        isSelected ? "text-neutral-700" : "text-neutral-400"
                      }`}
                    >
                      {preset.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sliders & Live Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Factor Sliders Column */}
          <div className="lg:col-span-7 glass-card p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-bold text-base text-white">Scoring Weight Distribution</h3>
                <p className="text-xs text-neutral-400">Weights automatically normalize to total 100%.</p>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-white/10 text-white font-bold">
                Total: 100%
              </span>
            </div>

            <div className="space-y-6">
              {factorItems.map((item) => {
                const percent = Math.round((localWeights[item.key] || 0) * 100);
                return (
                  <div key={item.key} className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <div className="font-semibold text-xs text-white">{item.label}</div>
                        <div className="text-[11px] text-neutral-400">{item.description}</div>
                      </div>
                      <span className="font-mono text-sm font-bold text-white ml-4">
                        {percent}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={percent}
                      onChange={(e) => handleSliderChange(item.key, Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: "#ffffff", background: "#222222" }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-5 glass-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Live Re-Ranking Preview</h3>
              </div>
              <span className="text-[11px] text-neutral-400">Top 5 Matches</span>
            </div>

            <p className="text-xs text-neutral-400">
              See how your customized weights reshape your college recommendations in real time:
            </p>

            <div className="space-y-3">
              {previewRecs.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500">
                  No colleges matched the current criteria. Try loosening budget or rank filters.
                </div>
              ) : (
                previewRecs.map((rec, idx) => (
                  <div
                    key={rec.college.id}
                    className="p-3.5 rounded-xl border border-white/5 bg-[#141414] hover:border-white/20 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-neutral-500">#{idx + 1}</span>
                        <span className="font-bold text-xs text-white truncate">
                          {rec.college.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-neutral-300">
                          {rec.college.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate">
                        {rec.matchedBranch.name} • ₹{(rec.college.fees / 100000).toFixed(1)}L
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="font-mono text-sm font-bold text-emerald-400">
                        {Math.round(rec.overallScore)}
                      </div>
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider">
                        Fit Score
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={handleSave}
                className="w-full btn-accent py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                Apply Weights to Dashboard <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
