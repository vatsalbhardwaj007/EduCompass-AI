"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductHeader from "@/components/ProductHeader";
import {
  Sparkles, Loader2,
  IndianRupee, TrendingUp, Home, Code2, Star,
  Award, Bot, MapPin, Trophy,
} from "lucide-react";
import { useProfile } from "@/lib/ProfileContext";

export default function ComparePage() {
  const router = useRouter();
  const { profile, isProfileReady, recommendations, selectedCollegeIds } = useProfile();
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    if (!isProfileReady) return;
    if (!profile) {
      router.replace("/profile");
      return;
    }
    if (selectedCollegeIds.length < 2) router.replace("/dashboard");
  }, [isProfileReady, profile, selectedCollegeIds, router]);

  if (!isProfileReady || !profile || selectedCollegeIds.length < 2) return null;

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
    <main className="compare-v2">
      <ProductHeader active="compare" returnHref="/dashboard" returnLabel="Back to matches" />

      <div className="compare-v2-shell">
        {/* Header */}
        <header className="compare-v2-intro">
          <div>
            <div className="compare-v2-kicker">
              <Trophy size={17} aria-hidden="true" />
              <span>{selected.length} colleges selected</span>
            </div>
            <h1>
              Head-to-Head Specification Matrix
            </h1>
            <p>
              Side-by-side comparison across overall fit score, fees, placements, and ratings.
            </p>
          </div>
          <button
            onClick={generateAISummary} disabled={loadingSummary}
            className="compare-v2-primary-action"
          >
            {loadingSummary ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate AI Verdict
          </button>
        </header>

        {/* AI Summary */}
        {aiSummary && (
          <section className="compare-v2-summary">
            <div className="compare-v2-summary-heading">
              <div>
                <Bot size={16} aria-hidden="true" />
              </div>
              <h2>AI Counsellor Comparative Verdict</h2>
            </div>
            <div className="compare-v2-summary-copy">
              {aiSummary}
            </div>
          </section>
        )}

        {/* College header columns */}
        <div className="compare-v2-table-scroll">
          <div className="compare-v2-column-headings" style={{ gridTemplateColumns: `180px repeat(${cols}, minmax(220px, 1fr))` }}>
            <div className="compare-v2-column-label">Comparison factor</div>
            {selected.map((r) => (
              <article key={r.college.id} className="compare-v2-college-card">
                <span>{r.college.type}</span>
                <h2>{r.college.name}</h2>
                <p>{r.matchedBranch.name}</p>
                <small><MapPin size={13} aria-hidden="true" /> {r.college.city}</small>
              </article>
            ))}
          </div>
        </div>

        {/* Spec table */}
        <div className="compare-v2-table-scroll">
          <div className="compare-v2-matrix" style={{ gridTemplateColumns: `180px repeat(${cols}, minmax(220px, 1fr))` }}>
          {metrics.map((metric, mIdx) => (
            <div
              key={metric.label}
              className="compare-v2-matrix-row"
              data-striped={mIdx % 2 === 0}
            >
              <div className="compare-v2-metric-label">
                <metric.icon size={16} aria-hidden="true" />
                {metric.label}
              </div>
              {metric.values.map((val, idx) => {
                const isBest = getBestClass(metric.values, idx, metric.higher);
                return (
                  <div key={idx} className="compare-v2-metric-value">
                    {isBest ? (
                      <span className="compare-v2-best">
                        {metric.format(val)}
                      </span>
                    ) : (
                      <span>{metric.format(val)}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Score breakdown header */}
          <div className="compare-v2-breakdown-heading">
            <span>Factor breakdown ratings (0 — 100)</span>
          </div>

          {scoreMetrics.map((metric, mIdx) => {
            const values = selected.map((r) => r.breakdown[metric.key]);
            return (
              <div
                key={metric.label}
                className="compare-v2-matrix-row"
                data-striped={mIdx % 2 === 0}
              >
                <div className="compare-v2-metric-label">{metric.label}</div>
                {values.map((val, idx) => {
                  const isBest = getBestClass(values, idx, true);
                  return (
                    <div key={idx} className="compare-v2-metric-value">
                      {isBest ? (
                        <span className="compare-v2-best">
                          {Math.round(val)} / 100
                        </span>
                      ) : (
                        <span>{Math.round(val)} / 100</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
          </div>
        </div>

        <p className="compare-v2-disclaimer">
          ⚠️ Data shown is illustrative sample data for demo purposes only.
        </p>
      </div>
    </main>
  );
}
