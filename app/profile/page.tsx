"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Compass, ArrowLeft, ArrowRight, Hash, Wallet, Home,
  Code2, Target, User, Search, Check, Sparkles, Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/lib/ProfileContext";
import EduCompassLogo from "@/components/EduCompassLogo";
import {
  StudentProfile, Category, CareerGoal,
  INDIAN_STATES, ENGINEERING_BRANCHES, CAREER_GOAL_LABELS,
} from "@/lib/types";

/* ── Styled section card ── */
function FormSection({
  icon: Icon, title, subtitle, children,
}: {
  icon: React.ElementType; title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div className="glass-card" style={{ padding: "28px 28px 32px" }}>
      <div className="flex items-center gap-3 mb-6 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-base text-white">{title}</h2>
          <p className="text-xs mt-0.5" style={{ color: "#555555" }}>{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { setProfile, profile: existingProfile } = useProfile();

  const [jeeMainRank, setJeeMainRank] = useState(existingProfile?.jeeMainRank ? String(existingProfile.jeeMainRank) : "5000");
  const [jeeAdvancedRank, setJeeAdvancedRank] = useState(existingProfile?.jeeAdvancedRank ? String(existingProfile.jeeAdvancedRank) : "500");
  const [category, setCategory] = useState<Category>(existingProfile?.category || "general");
  const [gender, setGender] = useState<"male" | "female" | "other">(existingProfile?.gender || "male");
  const [homeState, setHomeState] = useState(existingProfile?.homeState || "Delhi");
  const [budget, setBudget] = useState(existingProfile?.budget ? String(existingProfile.budget) : "1200000");
  const [hostelNeeded, setHostelNeeded] = useState(existingProfile?.hostelNeeded !== undefined ? existingProfile.hostelNeeded : true);
  const [preferredBranches, setPreferredBranches] = useState<string[]>(existingProfile?.preferredBranches || []);
  const [careerGoal, setCareerGoal] = useState<CareerGoal>(existingProfile?.careerGoal || "high_package");
  const [branchSearch, setBranchSearch] = useState("");

  const toggleBranch = (branch: string) => {
    setPreferredBranches((prev) =>
      prev.includes(branch) ? prev.filter((b) => b !== branch) : [...prev, branch]
    );
  };

  const filteredBranches = ENGINEERING_BRANCHES.filter((b) =>
    b.toLowerCase().includes(branchSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: StudentProfile = {
      jeeMainRank: parseInt(jeeMainRank),
      jeeAdvancedRank: jeeAdvancedRank ? parseInt(jeeAdvancedRank) : null,
      category, gender, homeState,
      budget: parseInt(budget),
      hostelNeeded, preferredBranches, careerGoal,
    };
    setProfile(profile);
    router.push("/dashboard");
  };

  const isValid = jeeMainRank && parseInt(jeeMainRank) > 0 && budget && parseInt(budget) > 0 && homeState;

  const inputCls = "bg-[#1a1a1a] border-[rgba(255,255,255,0.08)] text-white font-mono h-11 rounded-xl focus:border-[rgba(255,255,255,0.35)] focus:ring-0 placeholder:text-[#444]";
  const selectTriggerCls = "bg-[#1a1a1a] border-[rgba(255,255,255,0.08)] text-white h-11 rounded-xl";

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: "#0a0a0a", color: "#ffffff" }}>
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grid-pattern" style={{ opacity: 0.4 }} />
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: "radial-gradient(ellipse 80% 40% at 50% -8%, rgba(255,255,255,0.05) 0%, transparent 70%)" }}
      />

      {/* Nav */}
      <nav className="sticky top-0 z-40 glass-nav px-6 py-4 md:px-12 flex items-center justify-between">
        <EduCompassLogo />
        <Link href="/">
          <button className="btn-outline px-4 py-2 text-sm cursor-pointer flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </button>
        </Link>
      </nav>

      <div className="mx-auto max-w-2xl px-6 py-12 md:py-16">
        {/* Page header */}
        <div className="text-center space-y-4 mb-10 animate-reveal-up">
          <span className="badge-white text-[10px] uppercase tracking-wider font-bold">
            <Sparkles className="inline h-3 w-3 mr-1 -mt-0.5" />
            Step 1 of 2: Student Specification Profile
          </span>
          <h1 className="editorial-heading mt-3" style={{ fontSize: "clamp(1.9rem, 4vw, 2.6rem)" }}>
            Build Your Admission Profile
          </h1>
          <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: "#888888" }}>
            Input your ranks, category, and career priorities to compute personalised 0-100 FIT scores.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Ranks */}
          <div className="animate-reveal-up delay-75">
            <FormSection icon={Hash} title="1. Ranks & Admission Category" subtitle="Used for JoSAA / CSAB cutoff safety calculations">
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold" style={{ color: "#888888" }}>JEE Main Overall CRL Rank</Label>
                      <span className="badge-white" style={{ fontSize: "0.6rem" }}>Required</span>
                    </div>
                    <Input id="jeeMainRank" type="number" placeholder="e.g. 8500" value={jeeMainRank} onChange={(e) => setJeeMainRank(e.target.value)} min={1} className={inputCls} />
                    <p className="text-[11px]" style={{ color: "#444444" }}>Evaluated for NITs, IIITs &amp; GFTIs</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold" style={{ color: "#888888" }}>JEE Advanced Rank</Label>
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border" style={{ color: "#555555", background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>Optional</span>
                    </div>
                    <Input id="jeeAdvancedRank" type="number" placeholder="e.g. 1400 (if qualified)" value={jeeAdvancedRank} onChange={(e) => setJeeAdvancedRank(e.target.value)} min={1} className={inputCls} />
                    <p className="text-[11px]" style={{ color: "#444444" }}>Required to calculate IIT match scores</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold" style={{ color: "#888888" }}>Reservation Category</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] text-white h-11 rounded-xl px-3.5 text-sm outline-none focus:border-[rgba(255,255,255,0.35)] cursor-pointer"
                  >
                    <option value="general" className="bg-[#111111] text-white">General (OPEN)</option>
                    <option value="obc" className="bg-[#111111] text-white">OBC-NCL</option>
                    <option value="sc" className="bg-[#111111] text-white">Scheduled Caste (SC)</option>
                    <option value="st" className="bg-[#111111] text-white">Scheduled Tribe (ST)</option>
                    <option value="ews" className="bg-[#111111] text-white">Gen-EWS</option>
                  </select>
                </div>
              </div>
            </FormSection>
          </div>

          {/* 2. Personal */}
          <div className="animate-reveal-up delay-150">
            <FormSection icon={User} title="2. Personal & Domicile" subtitle="Used for Home State Quota eligibility">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold" style={{ color: "#888888" }}>Gender</Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] text-white h-11 rounded-xl px-3.5 text-sm outline-none focus:border-[rgba(255,255,255,0.35)] cursor-pointer"
                  >
                    <option value="male" className="bg-[#111111] text-white">Male</option>
                    <option value="female" className="bg-[#111111] text-white">Female (Supernumerary Quota)</option>
                    <option value="other" className="bg-[#111111] text-white">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold" style={{ color: "#888888" }}>Home Domicile State</Label>
                  <select
                    id="homeState"
                    value={homeState}
                    onChange={(e) => setHomeState(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] text-white h-11 rounded-xl px-3.5 text-sm outline-none focus:border-[rgba(255,255,255,0.35)] cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#111111] text-gray-500">Select state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s} className="bg-[#111111] text-white">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </FormSection>
          </div>

          {/* 3. Budget */}
          <div className="animate-reveal-up delay-225">
            <FormSection icon={Wallet} title="3. Budget & Living Preferences" subtitle="Total 4-year tuition fee ceiling">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-semibold" style={{ color: "#888888" }}>Total 4-Year Tuition Budget (₹ INR)</Label>
                    {budget && <span className="text-xs font-bold font-mono text-white">≈ ₹{(parseInt(budget) / 100000).toFixed(1)} Lakhs</span>}
                  </div>
                  <Input id="budget" type="number" placeholder="e.g. 1000000" value={budget} onChange={(e) => setBudget(e.target.value)} min={0} step={50000} className={inputCls} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold" style={{ color: "#888888" }}>Hostel Requirement</Label>
                  <div className="flex items-center gap-3 pt-1">
                    {[
                      { val: true, label: "Require Hostel", icon: Home },
                      { val: false, label: "Day Scholar", icon: null },
                    ].map(({ val, label, icon: Icon }) => (
                      <button
                        key={String(val)} type="button" onClick={() => setHostelNeeded(val)}
                        className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border text-sm font-semibold transition-all cursor-pointer"
                        style={{
                          background: hostelNeeded === val ? "rgba(255,255,255,0.1)" : "#1a1a1a",
                          borderColor: hostelNeeded === val ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)",
                          color: hostelNeeded === val ? "#ffffff" : "#666666",
                        }}
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </FormSection>
          </div>

          {/* 4. Branches */}
          <div className="animate-reveal-up delay-300">
            <FormSection icon={Code2} title="4. Engineering Branch Preferences" subtitle="Select preferred branches or leave blank to consider all">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-4 w-4" style={{ color: "#444444" }} />
                <Input placeholder="Search branches..." value={branchSearch} onChange={(e) => setBranchSearch(e.target.value)} className="bg-[#1a1a1a] border-[rgba(255,255,255,0.08)] text-white pl-9 text-sm rounded-xl h-10 placeholder:text-[#444]" />
              </div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs" style={{ color: "#555555" }}>Select one or more (or leave blank for all)</p>
                <span className="badge-white text-[10px] font-mono">{preferredBranches.length} Selected</span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
                {filteredBranches.map((branch) => {
                  const selected = preferredBranches.includes(branch);
                  return (
                    <button
                      key={branch} type="button" onClick={() => toggleBranch(branch)}
                      className="text-xs flex items-center gap-1.5 px-3 py-2 rounded-xl border font-medium transition-all cursor-pointer"
                      style={{
                        background: selected ? "rgba(255,255,255,0.1)" : "#1a1a1a",
                        borderColor: selected ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)",
                        color: selected ? "#ffffff" : "#666666",
                        fontWeight: selected ? 600 : 400,
                        boxShadow: selected ? "0 0 12px -4px rgba(255,255,255,0.1)" : "none",
                      }}
                    >
                      {selected && <Check className="h-3 w-3 flex-shrink-0" />}
                      {branch}
                    </button>
                  );
                })}
              </div>
            </FormSection>
          </div>

          {/* 5. Career Goal */}
          <div className="animate-reveal-up delay-450">
            <FormSection icon={Target} title="5. Primary Career Goal" subtitle="Boosts colleges aligned with your career aspirations">
              <div className="grid gap-3 sm:grid-cols-2">
                {(Object.entries(CAREER_GOAL_LABELS) as [CareerGoal, string][]).map(([key, label]) => {
                  const isSel = careerGoal === key;
                  return (
                    <button
                      key={key} type="button" onClick={() => setCareerGoal(key)}
                      className="p-4 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 text-xs font-medium"
                      style={{
                        background: isSel ? "rgba(255,255,255,0.08)" : "#1a1a1a",
                        borderColor: isSel ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.07)",
                        color: isSel ? "#ffffff" : "#666666",
                        fontWeight: isSel ? 600 : 400,
                      }}
                    >
                      <span>{label}</span>
                      {isSel && <Check className="h-4 w-4 flex-shrink-0 text-white" />}
                    </button>
                  );
                })}
              </div>
            </FormSection>
          </div>

          {/* Submit */}
          <div className="pt-2 space-y-3 animate-reveal-up delay-600">
            <button
              type="submit" disabled={!isValid}
              className="btn-accent w-full h-14 text-base font-bold cursor-pointer rounded-2xl flex items-center justify-center gap-2"
            >
              Calculate My FIT Matches
              <ArrowRight className="h-5 w-5" />
            </button>
            {!isValid && (
              <div className="flex items-center justify-center gap-1.5 text-xs font-medium" style={{ color: "#666666" }}>
                <Info className="h-4 w-4 flex-shrink-0" />
                Please enter your JEE Main rank, budget, and home state to generate recommendations
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
