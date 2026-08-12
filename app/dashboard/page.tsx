"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EduCompassLogo from "@/components/EduCompassLogo";
import {
  Compass, ArrowLeft, GitCompareArrows, Download, MessageSquareText,
  MapPin, IndianRupee, TrendingUp, Building2, CheckCircle2, Star,
  Code2, Home, X, Send, Bot, User, Loader2, Sliders, Search, ChevronRight,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProfile } from "@/lib/ProfileContext";
import { RecommendedCollege, ScoringWeights, DEFAULT_WEIGHTS } from "@/lib/types";
import { generatePDF } from "@/lib/generatePDF";

/* ── Score Ring ── */
function ScoreRing({ score, size = 68 }: { score: number; size?: number }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const strokeColor = score >= 75 ? "#ffffff" : score >= 50 ? "#aaaaaa" : "#555555";

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="rotate-[-90deg]" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={5} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={5}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ stroke: strokeColor, transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-extrabold font-mono text-white">{Math.round(score)}</span>
        <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: "#444444" }}>FIT</span>
      </div>
    </div>
  );
}

/* ── College Detail Modal ── */
function CollegeDetailModal({ rec, onClose }: { rec: RecommendedCollege | null; onClose: () => void }) {
  if (!rec) return null;
  const { college, matchedBranch, topReasons } = rec;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)" }}>
      <div className="glass-card w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" style={{ boxShadow: "0 32px 80px -12px rgba(0,0,0,0.9)" }}>
        {/* Header */}
        <div className="p-6 flex items-start justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(10,10,10,0.7)" }}>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="badge-white">{college.type}</span>
              {college.nirfRank && <span className="badge-white">NIRF #{college.nirfRank}</span>}
              <span className="text-xs flex items-center gap-1" style={{ color: "#555555" }}>
                <MapPin className="h-3 w-3" /> {college.city}, {college.state}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">{college.name}</h2>
            <p className="text-xs mt-1 font-semibold" style={{ color: "#888888" }}>Matched Program: {matchedBranch.name}</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer"
            style={{ color: "#666666" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#666666"; e.currentTarget.style.background = "transparent"; }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ScrollArea className="flex-1 p-6 space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Tuition", val: `₹${(college.fees / 100000).toFixed(1)}L` },
              { label: "Avg Package", val: `₹${college.avgPackageLPA} LPA` },
              { label: "Hostel Rating", val: `${college.hostelRating} / 5` },
              { label: "Coding Culture", val: `${college.codingCultureRating} / 5` },
            ].map((m) => (
              <div key={m.label} className="p-3 rounded-xl" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-[10px] mb-1" style={{ color: "#444444" }}>{m.label}</div>
                <div className="text-lg font-bold font-mono text-white">{m.val}</div>
              </div>
            ))}
          </div>

          {/* Match reasons */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "#444444" }}>Match Reasons</h3>
            {topReasons.map((r, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-lg text-sm" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#888888" }}>
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#aaaaaa" }} />
                {r}
              </div>
            ))}
          </div>

          {/* Recruiters */}
          {college.topRecruiters && college.topRecruiters.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "#444444" }}>Top Recruiters</h3>
              <div className="flex flex-wrap gap-2">
                {college.topRecruiters.map((c) => (
                  <span key={c} className="text-xs px-3 py-1 rounded-full" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.07)", color: "#888888" }}>{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Cutoff table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "#444444" }}>All Branches Cutoff Ranks</h3>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <table className="w-full text-xs text-left">
                <thead style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <tr>
                    {["Branch", "GEN", "OBC", "SC", "ST", "EWS"].map((h) => (
                      <th key={h} className="p-3 font-semibold uppercase tracking-wider" style={{ color: "#444444" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {college.branches.map((b) => (
                    <tr
                      key={b.name}
                      style={{
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        background: b.name === matchedBranch.name ? "rgba(255,255,255,0.05)" : "transparent",
                        color: b.name === matchedBranch.name ? "#ffffff" : "#777777",
                        fontWeight: b.name === matchedBranch.name ? 600 : 400,
                      }}
                    >
                      <td className="p-3 font-sans">{b.name}</td>
                      {["general","obc","sc","st","ews"].map((cat) => (
                        <td key={cat} className="p-3 font-mono">#{b.closingRank[cat as keyof typeof b.closingRank]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 flex justify-end" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(10,10,10,0.6)" }}>
          <button onClick={onClose} className="btn-accent px-6 py-2 text-xs cursor-pointer rounded-full">Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── Weight Tuner Modal ── */
function WeightTunerModal({
  isOpen, onClose, weights, onSave,
}: { isOpen: boolean; onClose: () => void; weights: ScoringWeights; onSave: (w: ScoringWeights) => void; }) {
  const [local, setLocal] = useState<ScoringWeights>(weights);
  useEffect(() => setLocal(weights), [weights]);
  if (!isOpen) return null;

  const applyPreset = (preset: "balanced" | "placement" | "roi" | "coding") => {
    const p: Record<string, ScoringWeights> = {
      balanced: DEFAULT_WEIGHTS,
      placement: { admissionSafety: 0.1, roi: 0.1, branchMatch: 0.1, placement: 0.5, hostel: 0.1, codingCulture: 0.1 },
      roi: { admissionSafety: 0.15, roi: 0.45, branchMatch: 0.15, placement: 0.15, hostel: 0.05, codingCulture: 0.05 },
      coding: { admissionSafety: 0.1, roi: 0.1, branchMatch: 0.1, placement: 0.2, hostel: 0.1, codingCulture: 0.4 },
    };
    setLocal(p[preset]);
    onSave(p[preset]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)" }}>
      <div className="glass-card w-full max-w-lg p-7 space-y-6" style={{ boxShadow: "0 32px 80px -12px rgba(0,0,0,0.9)" }}>
        <div className="flex items-center justify-between pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-white" />
            <h2 className="font-bold text-base text-white">Live Factor Weight Customizer</h2>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer" style={{ color: "#666666" }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#444444" }}>Quick Presets</span>
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { key: "balanced", label: "Balanced (Default)" },
              { key: "placement", label: "High Placement" },
              { key: "roi", label: "Max ROI" },
              { key: "coding", label: "Coding Culture" },
            ].map(({ key, label }) => (
              <button
                key={key} onClick={() => applyPreset(key as any)}
                className="text-xs px-3.5 py-1.5 rounded-full border font-medium cursor-pointer transition-all"
                style={{ background: "#1a1a1a", borderColor: "rgba(255,255,255,0.08)", color: "#888888" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#888888"; }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          {[
            { key: "admissionSafety", label: "Admission Safety" },
            { key: "placement", label: "Placement Package & Quality" },
            { key: "roi", label: "ROI (Salary vs Tuition)" },
            { key: "branchMatch", label: "Preferred Branch Alignment" },
            { key: "codingCulture", label: "Coding Culture & Tech Clubs" },
            { key: "hostel", label: "Hostel & Campus Facilities" },
          ].map((item) => (
            <div key={item.key} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span style={{ color: "#888888" }}>{item.label}</span>
                <span className="font-mono text-white">{Math.round(local[item.key as keyof ScoringWeights] * 100)}%</span>
              </div>
              <input
                type="range" min="0" max="60" step="5"
                value={Math.round(local[item.key as keyof ScoringWeights] * 100)}
                onChange={(e) => {
                  const updated = { ...local, [item.key]: Number(e.target.value) / 100 };
                  setLocal(updated);
                  onSave(updated);
                }}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: "#ffffff", background: "#1a1a1a" }}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="btn-accent px-6 py-2 text-xs cursor-pointer rounded-full">Done &amp; Recalculate</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function DashboardPage() {
  const router = useRouter();
  const { profile, recommendations, selectedCollegeIds, toggleCollegeSelection, clearSelections, weights, setWeights } = useProfile();
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [detailCollege, setDetailCollege] = useState<RecommendedCollege | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"fit" | "package" | "fees" | "safety">("fit");

  useEffect(() => { if (!profile) router.push("/profile"); }, [profile, router]);
  if (!profile) return null;

  const filteredRecs = recommendations
    .filter((r) => {
      const q = r.college.name.toLowerCase() + r.college.city.toLowerCase();
      return q.includes(searchQuery.toLowerCase()) && (selectedType === "ALL" || r.college.type === selectedType);
    })
    .sort((a, b) => {
      if (sortBy === "package") return b.college.avgPackageLPA - a.college.avgPackageLPA;
      if (sortBy === "fees") return a.college.fees - b.college.fees;
      if (sortBy === "safety") return b.breakdown.admissionSafety - a.breakdown.admissionSafety;
      return b.overallScore - a.overallScore;
    });

  return (
    <div className="relative min-h-screen pb-24" style={{ backgroundColor: "#0a0a0a", color: "#ffffff" }}>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grid-pattern" style={{ opacity: 0.35 }} />
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: "radial-gradient(ellipse 80% 40% at 50% -5%, rgba(255,255,255,0.05) 0%, transparent 70%)" }} />

      {/* Nav */}
      <nav className="sticky top-0 z-40 glass-nav px-6 py-4 md:px-12 flex items-center justify-between">
        <EduCompassLogo />
        <Link href="/profile">
          <button className="btn-outline px-4 py-2 text-sm cursor-pointer flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Edit Profile
          </button>
        </Link>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-8 md:py-12 space-y-7">
        {/* Header card */}
        <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 reveal-on-scroll">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge-white">{profile.category.toUpperCase()} Category</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full border" style={{ color: "#666666", borderColor: "rgba(255,255,255,0.08)", background: "#1a1a1a" }}>{profile.homeState}</span>
            </div>
            <h1 className="editorial-heading" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>Best-Fit College Recommendations</h1>
            <p className="text-xs" style={{ color: "#888888" }}>
              Matched for Main Rank <strong className="font-mono text-white">#{profile.jeeMainRank.toLocaleString()}</strong>
              {profile.jeeAdvancedRank && <> &amp; Advanced Rank <strong className="font-mono text-white">#{profile.jeeAdvancedRank.toLocaleString()}</strong></>}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setWeightModalOpen(true)} className="btn-outline flex items-center gap-1.5 px-4 py-2 text-xs cursor-pointer rounded-full">
              <Sliders className="h-4 w-4" /> Tune Weights
            </button>
            <button onClick={() => generatePDF(filteredRecs.slice(0, 10), profile)} className="btn-outline flex items-center gap-1.5 px-4 py-2 text-xs cursor-pointer rounded-full">
              <Download className="h-4 w-4" /> PDF Report
            </button>
            {selectedCollegeIds.length >= 2 && (
              <Link href="/compare">
                <button className="btn-accent flex items-center gap-1.5 px-5 py-2 text-xs cursor-pointer rounded-full">
                  <GitCompareArrows className="h-4 w-4" /> Compare ({selectedCollegeIds.length})
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="glass-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 reveal-on-scroll">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4" style={{ color: "#444444" }} />
            <Input placeholder="Search by college name or city…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-[#1a1a1a] border-[rgba(255,255,255,0.07)] text-xs text-white pl-9 h-9 rounded-xl placeholder:text-[#444]" />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)" }}>
            {["ALL", "IIT", "NIT", "IIIT", "GFTI"].map((tier) => (
              <button
                key={tier} onClick={() => setSelectedType(tier)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                style={{
                  background: selectedType === tier ? "#ffffff" : "transparent",
                  color: selectedType === tier ? "#0a0a0a" : "#555555",
                  boxShadow: selectedType === tier ? "0 2px 12px -3px rgba(255,255,255,0.15)" : "none",
                }}
              >
                {tier}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold shrink-0" style={{ color: "#444444" }}>Sort:</span>
            <select
              value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs rounded-xl px-2 py-1.5 cursor-pointer border"
              style={{ background: "#1a1a1a", borderColor: "rgba(255,255,255,0.08)", color: "#888888" }}
            >
              <option value="fit">FIT Score</option>
              <option value="package">Avg CTC</option>
              <option value="fees">Lowest Fees</option>
              <option value="safety">Admission Safety</option>
            </select>
          </div>
        </div>

        {/* Compare banner */}
        {selectedCollegeIds.length > 0 && (
          <div className="p-3 rounded-xl flex items-center justify-between text-xs font-semibold reveal-on-scroll" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "#aaaaaa" }}>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" style={{ color: "#ffffff" }} />
              {selectedCollegeIds.length} / 3 colleges selected for comparison matrix
            </div>
            <div className="flex items-center gap-4">
              {selectedCollegeIds.length >= 2 && (
                <Link href="/compare"><span className="underline font-bold cursor-pointer text-white">Compare Now →</span></Link>
              )}
              <button onClick={clearSelections} className="cursor-pointer" style={{ color: "#555555" }}>Clear</button>
            </div>
          </div>
        )}

        {/* College cards */}
        {filteredRecs.length === 0 ? (
          <div className="glass-card p-16 text-center space-y-4 reveal-on-scroll">
            <Building2 className="h-12 w-12 mx-auto" style={{ color: "#333333" }} />
            <h3 className="font-bold text-lg text-white">No colleges match your filter criteria</h3>
            <p className="text-xs" style={{ color: "#666666" }}>Try clearing your search query or selecting a different tier tab.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecs.map((rec, i) => {
              const { college, matchedBranch, overallScore, breakdown, topReasons } = rec;
              const isSel = selectedCollegeIds.includes(college.id);

              return (
                <div
                  key={college.id}
                  className="glass-card glass-card-hover reveal-on-scroll"
                  style={{
                    padding: "24px",
                    transitionDelay: `${Math.min(i * 50, 300)}ms`,
                    borderColor: isSel ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.07)",
                    background: isSel ? "rgba(255,255,255,0.04)" : undefined,
                  }}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-xs font-mono font-bold w-6 text-center" style={{ color: "#444444" }}>#{i + 1}</div>
                      <ScoreRing score={overallScore} />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-white">{college.name}</h3>
                            <span className="badge-white text-[10px]">{college.type}</span>
                            {college.nirfRank && <span className="badge-white text-[10px]">NIRF #{college.nirfRank}</span>}
                          </div>
                          <div className="flex items-center gap-3 text-xs mt-1 flex-wrap" style={{ color: "#555555" }}>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {college.city}, {college.state}</span>
                            <span className="font-semibold px-2 py-0.5 rounded border text-[11px]" style={{ background: "rgba(255,255,255,0.05)", color: "#aaaaaa", borderColor: "rgba(255,255,255,0.1)" }}>
                              {matchedBranch.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <label className="text-xs hidden sm:inline cursor-pointer" style={{ color: "#444444" }}>Compare</label>
                          <Checkbox
                            checked={isSel}
                            onCheckedChange={() => toggleCollegeSelection(college.id)}
                            className="border-[rgba(255,255,255,0.2)] data-[state=checked]:bg-white data-[state=checked]:border-white"
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { label: "Total Fees", val: `₹${(college.fees / 100000).toFixed(1)}L` },
                          { label: "Average CTC", val: `₹${college.avgPackageLPA} LPA` },
                          { label: "Hostel", val: `${college.hostelRating} / 5` },
                          { label: "Coding", val: `${college.codingCultureRating} / 5` },
                        ].map((m) => (
                          <div key={m.label} className="p-2 rounded-lg" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "#444444" }}>{m.label}</div>
                            <div className="text-xs font-bold font-mono text-white">{m.val}</div>
                          </div>
                        ))}
                      </div>

                      {topReasons.slice(0, 2).map((r, ri) => (
                        <div key={ri} className="flex items-center gap-1.5 text-xs" style={{ color: "#777777" }}>
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: "#aaaaaa" }} />
                          {r}
                        </div>
                      ))}

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => setDetailCollege(rec)}
                          className="flex items-center gap-1 text-xs font-semibold cursor-pointer transition-all"
                          style={{ color: "#555555" }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "#555555"; }}
                        >
                          Full Specifications &amp; Cutoffs
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <WeightTunerModal isOpen={weightModalOpen} onClose={() => setWeightModalOpen(false)} weights={weights} onSave={setWeights} />
      <CollegeDetailModal rec={detailCollege} onClose={() => setDetailCollege(null)} />
    </div>
  );
}
