"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  GitCompareArrows,
  GraduationCap,
  MapPin,
  Menu,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import ThemeToggle from "@/components/landing/ThemeToggle";
import { useProfile } from "@/lib/ProfileContext";
import {
  DEFAULT_WEIGHTS,
  RecommendedCollege,
  ScoringWeights,
} from "@/lib/types";
import { generatePDF } from "@/lib/generatePDF";

type SortKey = "fit" | "package" | "fees" | "safety";

const INSTITUTE_TYPES = ["ALL", "IIT", "NIT", "IIIT", "GFTI"] as const;

function formatLakhs(value: number) {
  return "₹" + (value / 100000).toFixed(1) + "L";
}

function safetyLabel(score: number) {
  if (score >= 75) return "Strong rank alignment";
  if (score >= 50) return "Moderate rank alignment";
  return "Limited rank alignment";
}

function normalizeWeights(weights: ScoringWeights): ScoringWeights {
  const total = (Object.values(weights) as number[]).reduce((sum, value) => sum + value, 0) || 1;
  return {
    admissionSafety: weights.admissionSafety / total,
    roi: weights.roi / total,
    branchMatch: weights.branchMatch / total,
    placement: weights.placement / total,
    hostel: weights.hostel / total,
    codingCulture: weights.codingCulture / total,
  };
}

function FitRing({ score }: { score: number }) {
  const size = 74;
  const radius = 31;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(score, 100)) / 100) * circumference;

  return (
    <div className="dashboard-fit-ring" role="img" aria-label={Math.round(score) + " FIT score"}>
      <svg aria-hidden="true" className="dashboard-fit-ring-svg" viewBox={"0 0 " + size + " " + size}>
        <circle className="dashboard-fit-ring-track" cx={size / 2} cy={size / 2} r={radius} />
        <circle
          className="dashboard-fit-ring-value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span>{Math.round(score)}</span>
      <small>FIT</small>
    </div>
  );
}

function WeightTunerModal({
  isOpen,
  onClose,
  weights,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  weights: ScoringWeights;
  onSave: (weights: ScoringWeights) => void;
}) {
  const [localWeights, setLocalWeights] = useState<ScoringWeights>(weights);

  if (!isOpen) return null;

  const updateWeights = (next: ScoringWeights) => {
    const normalized = normalizeWeights(next);
    setLocalWeights(normalized);
    onSave(normalized);
  };

  const presets: { label: string; values: ScoringWeights }[] = [
    { label: "Balanced", values: DEFAULT_WEIGHTS },
    { label: "Placement", values: { admissionSafety: 0.1, roi: 0.1, branchMatch: 0.1, placement: 0.5, hostel: 0.1, codingCulture: 0.1 } },
    { label: "ROI", values: { admissionSafety: 0.15, roi: 0.45, branchMatch: 0.15, placement: 0.15, hostel: 0.05, codingCulture: 0.05 } },
    { label: "Coding", values: { admissionSafety: 0.1, roi: 0.1, branchMatch: 0.1, placement: 0.2, hostel: 0.1, codingCulture: 0.4 } },
  ];

  const factors: { key: keyof ScoringWeights; label: string }[] = [
    { key: "admissionSafety", label: "Admission safety" },
    { key: "placement", label: "Placement package & quality" },
    { key: "roi", label: "ROI (salary vs tuition)" },
    { key: "branchMatch", label: "Preferred branch alignment" },
    { key: "codingCulture", label: "Coding culture & tech clubs" },
    { key: "hostel", label: "Hostel & campus facilities" },
  ];

  return (
    <div className="dashboard-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="dashboard-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tune-weights-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="dashboard-modal-header">
          <div>
            <p className="dashboard-eyebrow">Recommendation inputs</p>
            <h2 id="tune-weights-title">Tune what matters most.</h2>
          </div>
          <button className="dashboard-icon-button" type="button" onClick={onClose} aria-label="Close tune weights">
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <p className="dashboard-modal-copy">Adjusting one factor recalculates the same deterministic FIT score using your existing preferences.</p>

        <div className="dashboard-preset-row" aria-label="Weight presets">
          {presets.map((preset) => (
            <button key={preset.label} type="button" className="dashboard-small-button" onClick={() => updateWeights(preset.values)}>
              {preset.label}
            </button>
          ))}
        </div>

        <div className="dashboard-weight-list">
          {factors.map((factor) => (
            <label key={factor.key} className="dashboard-weight-control">
              <span>
                {factor.label}
                <strong>{Math.round(localWeights[factor.key] * 100)}%</strong>
              </span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={Math.round(localWeights[factor.key] * 100)}
                onChange={(event) => updateWeights({ ...localWeights, [factor.key]: Number(event.target.value) / 100 })}
              />
            </label>
          ))}
        </div>

        <footer className="dashboard-modal-footer">
          <button type="button" className="dashboard-primary-button" onClick={onClose}>Done</button>
        </footer>
      </section>
    </div>
  );
}

function CollegeDetailModal({ rec, onClose }: { rec: RecommendedCollege | null; onClose: () => void }) {
  if (!rec) return null;

  const { college, matchedBranch, topReasons, overallScore, breakdown } = rec;
  const metrics = [
    { label: "Total tuition", value: formatLakhs(college.fees) },
    { label: "Average package", value: "₹" + college.avgPackageLPA + "L" },
    { label: "Admission safety", value: safetyLabel(breakdown.admissionSafety) },
    { label: "FIT", value: Math.round(overallScore) + " / 100" },
  ];

  return (
    <div className="dashboard-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="dashboard-modal dashboard-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="college-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="dashboard-modal-header">
          <div>
            <p className="dashboard-eyebrow">{college.type} · {college.city}, {college.state}</p>
            <h2 id="college-detail-title">{college.name}</h2>
            <p className="dashboard-detail-program">Matched program: {matchedBranch.name}</p>
          </div>
          <button className="dashboard-icon-button" type="button" onClick={onClose} aria-label="Close college details">
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="dashboard-detail-scroll">
          <dl className="dashboard-detail-metrics">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>{metric.value}</dd>
              </div>
            ))}
          </dl>

          <section className="dashboard-detail-section">
            <h3>Why it fits</h3>
            <ul>
              {topReasons.map((reason) => <li key={reason}>{reason}</li>)}
            </ul>
          </section>

          <section className="dashboard-detail-section">
            <h3>Branch cutoffs</h3>
            <div className="dashboard-cutoff-table-wrap">
              <table className="dashboard-cutoff-table">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>GEN</th>
                    <th>OBC</th>
                    <th>SC</th>
                    <th>ST</th>
                    <th>EWS</th>
                  </tr>
                </thead>
                <tbody>
                  {college.branches.map((branch) => (
                    <tr key={branch.name} data-matched={branch.name === matchedBranch.name}>
                      <td>{branch.name}</td>
                      <td>{branch.closingRank.general}</td>
                      <td>{branch.closingRank.obc}</td>
                      <td>{branch.closingRank.sc}</td>
                      <td>{branch.closingRank.st}</td>
                      <td>{branch.closingRank.ews}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <footer className="dashboard-modal-footer">
          <button type="button" className="dashboard-primary-button" onClick={onClose}>Close details</button>
        </footer>
      </section>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const {
    profile,
    recommendations,
    selectedCollegeIds,
    toggleCollegeSelection,
    clearSelections,
    weights,
    setWeights,
  } = useProfile();
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [detailCollege, setDetailCollege] = useState<RecommendedCollege | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<(typeof INSTITUTE_TYPES)[number]>("ALL");
  const [sortBy, setSortBy] = useState<SortKey>("fit");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!profile) router.push("/profile");
  }, [profile, router]);

  const filteredRecs = useMemo(() => recommendations
    .filter((rec) => {
      const searchable = rec.college.name + " " + rec.college.city;
      return searchable.toLowerCase().includes(searchQuery.toLowerCase())
        && (selectedType === "ALL" || rec.college.type === selectedType);
    })
    .sort((left, right) => {
      if (sortBy === "package") return right.college.avgPackageLPA - left.college.avgPackageLPA;
      if (sortBy === "fees") return left.college.fees - right.college.fees;
      if (sortBy === "safety") return right.breakdown.admissionSafety - left.breakdown.admissionSafety;
      return right.overallScore - left.overallScore;
    }), [recommendations, searchQuery, selectedType, sortBy]);

  if (!profile) return null;

  const topRecommendation = recommendations[0];
  const preferredBranches = profile.preferredBranches.length
    ? profile.preferredBranches.slice(0, 2).join(" · ")
    : "All branches";
  const resultLabel = filteredRecs.length + " college" + (filteredRecs.length === 1 ? "" : "s") + " worth a closer look";

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="dashboard-v2">
      <nav className="dashboard-nav" aria-label="Dashboard navigation">
        <div className="dashboard-nav-inner">
          <Link className="dashboard-brand" href="/" aria-label="EduCompass home">
            <span className="dashboard-brand-mark" aria-hidden="true"><GraduationCap size={17} /></span>
            <span>EduCompass</span>
          </Link>

          <div className="dashboard-desktop-links">
            <a href="#overview">Overview</a>
            <a href="#matches" aria-current="page">Matches</a>
            <Link href="/compare">Compare{selectedCollegeIds.length ? " · " + selectedCollegeIds.length : ""}</Link>
          </div>

          <div className="dashboard-nav-actions">
            <span className="dashboard-theme-label">Theme</span>
            <ThemeToggle />
            <Link className="dashboard-profile-link" href="/profile">Edit profile <ArrowUpRight size={14} aria-hidden="true" /></Link>
            <button
              className="dashboard-menu-button"
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="dashboard-mobile-menu"
            >
              {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
              <span>Menu</span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div id="dashboard-mobile-menu" className="dashboard-mobile-menu">
            <a href="#overview" onClick={closeMenu}>Overview</a>
            <a href="#matches" onClick={closeMenu}>Matches</a>
            <Link href="/compare" onClick={closeMenu}>Compare{selectedCollegeIds.length ? " · " + selectedCollegeIds.length : ""}</Link>
            <Link href="/profile" onClick={closeMenu}>Edit profile</Link>
            <div><span>Theme</span><ThemeToggle /></div>
          </div>
        )}
      </nav>

      <div className="dashboard-shell">
        <header id="matches" className="dashboard-intro">
          <div>
            <p className="dashboard-eyebrow">Matches</p>
            <h1>Your college <em>matches.</em></h1>
            <p className="dashboard-lede">Based on your rank, priorities, budget, and career goals.</p>
          </div>
          <aside className="dashboard-context-note">
            <p className="dashboard-eyebrow">Recommendation context</p>
            <p>Rank, branch preferences, budget and career goal are shaping these matches.</p>
            <Link href="/profile">Edit profile <ArrowRight size={14} aria-hidden="true" /></Link>
          </aside>
        </header>

        <section id="overview" className="dashboard-context" aria-labelledby="profile-context-title">
          <h2 id="profile-context-title" className="sr-only">Your profile and match overview</h2>
          <dl className="dashboard-profile-strip">
            <div>
              <dt>JEE Main</dt>
              <dd>{profile.jeeMainRank.toLocaleString()}</dd>
            </div>
            {profile.jeeAdvancedRank ? (
              <div>
                <dt>JEE Advanced</dt>
                <dd>{profile.jeeAdvancedRank.toLocaleString()}</dd>
              </div>
            ) : null}
            <div>
              <dt>Category</dt>
              <dd>{profile.category}</dd>
            </div>
            <div>
              <dt>Budget</dt>
              <dd>{formatLakhs(profile.budget)}</dd>
            </div>
            <div>
              <dt>Preferred</dt>
              <dd>{preferredBranches}</dd>
            </div>
          </dl>

          <div className="dashboard-overview-line">
            <span><b>Your profile</b> JEE Main {profile.jeeMainRank.toLocaleString()} · {profile.category}</span>
            {topRecommendation ? <span><b>Top match</b> {topRecommendation.college.name} · FIT {Math.round(topRecommendation.overallScore)}</span> : null}
            <span><b>Comparison</b> {selectedCollegeIds.length ? selectedCollegeIds.length + " selected" : "None selected"}</span>
          </div>
        </section>

        <section className="dashboard-controls" aria-label="Match controls">
          <label className="dashboard-search-control">
            <span className="sr-only">Search colleges or cities</span>
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search colleges or cities"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>

          <label className="dashboard-select-control">
            <span className="sr-only">Institute filter</span>
            <select value={selectedType} onChange={(event) => setSelectedType(event.target.value as (typeof INSTITUTE_TYPES)[number])}>
              {INSTITUTE_TYPES.map((type) => <option key={type} value={type}>{type === "ALL" ? "All institutes" : type}</option>)}
            </select>
            <ChevronDown size={15} aria-hidden="true" />
          </label>

          <label className="dashboard-select-control">
            <span className="sr-only">Sort matches</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortKey)}>
              <option value="fit">Best FIT</option>
              <option value="package">Highest Average Package</option>
              <option value="fees">Lowest Fees</option>
              <option value="safety">Strongest Admission Safety</option>
            </select>
            <ChevronDown size={15} aria-hidden="true" />
          </label>

          <button type="button" className="dashboard-control-button" onClick={() => setWeightModalOpen(true)}>
            <SlidersHorizontal size={17} aria-hidden="true" /> Tune weights
          </button>
          <button type="button" className="dashboard-quiet-button" onClick={() => generatePDF(filteredRecs.slice(0, 10), profile)}>
            <Download size={16} aria-hidden="true" /><span>PDF report</span>
          </button>
        </section>

        {selectedCollegeIds.length > 0 && (
          <div className="dashboard-selection-bar" role="status">
            <span>{selectedCollegeIds.length} of 3 colleges selected for comparison</span>
            <div>
              {selectedCollegeIds.length >= 2 && <Link href="/compare">Open comparison <ArrowRight size={14} aria-hidden="true" /></Link>}
              <button type="button" onClick={clearSelections}>Clear</button>
            </div>
          </div>
        )}

        <section className="dashboard-ranking" aria-labelledby="match-ranking-title">
          <div className="dashboard-ranking-heading">
            <p className="dashboard-eyebrow">Match ranking</p>
            <h2 id="match-ranking-title">{resultLabel}</h2>
          </div>

          {filteredRecs.length === 0 ? (
            <div className="dashboard-empty-state">
              <GraduationCap size={25} aria-hidden="true" />
              <h3>No colleges match this filter.</h3>
              <p>Try another search, institute filter, or sort order.</p>
            </div>
          ) : (
            <div className="dashboard-recommendations">
              {filteredRecs.map((rec, index) => {
                const { college, matchedBranch, overallScore, breakdown, topReasons } = rec;
                const selected = selectedCollegeIds.includes(college.id);
                const compareAtLimit = !selected && selectedCollegeIds.length >= 3;

                return (
                  <article className="dashboard-recommendation" data-selected={selected} key={college.id}>
                    <header className="dashboard-recommendation-header">
                      <div className="dashboard-rank">
                        <strong>{String(index + 1).padStart(2, "0")}</strong>
                        <span>Match order</span>
                      </div>

                      <div className="dashboard-college-identity">
                        <div className="dashboard-college-title-row">
                          <h3>{college.name}</h3>
                          {college.nirfRank ? <span>NIRF #{college.nirfRank}</span> : null}
                        </div>
                        <p>{matchedBranch.name}</p>
                        <small><MapPin size={14} aria-hidden="true" /> {college.city}, {college.state} <i aria-hidden="true">·</i> {college.type}</small>
                      </div>

                      <FitRing score={overallScore} />
                    </header>

                    <dl className="dashboard-recommendation-metrics">
                      <div>
                        <dt>Total tuition</dt>
                        <dd>{formatLakhs(college.fees)}</dd>
                      </div>
                      <div>
                        <dt>Average package</dt>
                        <dd>₹{college.avgPackageLPA}L</dd>
                      </div>
                      <div>
                        <dt>Admission safety</dt>
                        <dd>{safetyLabel(breakdown.admissionSafety)}</dd>
                      </div>
                    </dl>

                    <section className="dashboard-why-it-fits" aria-labelledby={"why-" + college.id}>
                      <h4 id={"why-" + college.id}>Why it fits</h4>
                      <ul>
                        {topReasons.map((reason) => <li key={reason}>{reason}</li>)}
                      </ul>
                    </section>

                    <footer className="dashboard-recommendation-actions">
                      <button type="button" onClick={() => setDetailCollege(rec)}>View details <ChevronRight size={15} aria-hidden="true" /></button>
                      <button
                        type="button"
                        className="dashboard-compare-action"
                        data-selected={selected}
                        disabled={compareAtLimit}
                        onClick={() => toggleCollegeSelection(college.id)}
                      >
                        {selected ? <Check size={15} aria-hidden="true" /> : <GitCompareArrows size={15} aria-hidden="true" />}
                        {selected ? "Added to compare" : compareAtLimit ? "Compare limit reached" : "Add to compare"}
                      </button>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <WeightTunerModal isOpen={weightModalOpen} onClose={() => setWeightModalOpen(false)} weights={weights} onSave={setWeights} />
      <CollegeDetailModal rec={detailCollege} onClose={() => setDetailCollege(null)} />
    </main>
  );
}
