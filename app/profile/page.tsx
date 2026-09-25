"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Search } from "lucide-react";
import ProductHeader from "@/components/ProductHeader";
import { useProfile } from "@/lib/ProfileContext";
import {
  CAREER_GOAL_LABELS,
  ENGINEERING_BRANCHES,
  INDIAN_STATES,
  type CareerGoal,
  type Category,
  type StudentProfile,
} from "@/lib/types";

function ProfileSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="profile-section" aria-labelledby={`profile-section-${number}`}>
      <div className="profile-section-heading">
        <span aria-hidden="true">{number}</span>
        <div>
          <h2 id={`profile-section-${number}`}>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="profile-section-content">{children}</div>
    </section>
  );
}

const profileSteps = [
  ["01", "Exam details"],
  ["02", "Preferences"],
  ["03", "About you"],
  ["04", "Career goal"],
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const { setProfile, profile: existingProfile } = useProfile();

  const [jeeMainRank, setJeeMainRank] = useState(existingProfile?.jeeMainRank ? String(existingProfile.jeeMainRank) : "5000");
  const [jeeAdvancedRank, setJeeAdvancedRank] = useState(existingProfile?.jeeAdvancedRank ? String(existingProfile.jeeAdvancedRank) : "500");
  const [category, setCategory] = useState<Category>(existingProfile?.category || "general");
  const [gender, setGender] = useState<StudentProfile["gender"]>(existingProfile?.gender || "male");
  const [homeState, setHomeState] = useState(existingProfile?.homeState || "Delhi");
  const [budget, setBudget] = useState(existingProfile?.budget ? String(existingProfile.budget) : "1200000");
  const [hostelNeeded, setHostelNeeded] = useState(existingProfile?.hostelNeeded !== undefined ? existingProfile.hostelNeeded : true);
  const [preferredBranches, setPreferredBranches] = useState<string[]>(existingProfile?.preferredBranches || []);
  const [careerGoal, setCareerGoal] = useState<CareerGoal>(existingProfile?.careerGoal || "high_package");
  const [branchSearch, setBranchSearch] = useState("");

  const toggleBranch = (branch: string) => {
    setPreferredBranches((previous) =>
      previous.includes(branch)
        ? previous.filter((item) => item !== branch)
        : [...previous, branch]
    );
  };

  const filteredBranches = ENGINEERING_BRANCHES.filter((branch) =>
    branch.toLowerCase().includes(branchSearch.toLowerCase())
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const profile: StudentProfile = {
      jeeMainRank: parseInt(jeeMainRank),
      jeeAdvancedRank: jeeAdvancedRank ? parseInt(jeeAdvancedRank) : null,
      category,
      gender,
      homeState,
      budget: parseInt(budget),
      hostelNeeded,
      preferredBranches,
      careerGoal,
    };

    setProfile(profile);
    router.push("/dashboard");
  };

  const isValid = Boolean(
    jeeMainRank && parseInt(jeeMainRank) > 0 && budget && parseInt(budget) > 0 && homeState
  );
  const budgetInLakhs = parseInt(budget) / 100000;

  return (
    <main className="profile-v2">
      <ProductHeader returnHref="/" returnLabel="Back to home" />

      <div className="profile-shell">
        <section className="profile-intro" aria-labelledby="profile-title">
          <div>
            <p className="profile-eyebrow">Your profile</p>
            <h1 id="profile-title">Build your admission profile.</h1>
            <p className="profile-intro-copy">
              Start with the details that shape the college options worth considering.
            </p>
          </div>

          <ol className="profile-progress" aria-label="Profile sections">
            {profileSteps.map(([number, label]) => (
              <li key={number}>
                <span>{number}</span>
                <span>{label}</span>
              </li>
            ))}
          </ol>
        </section>

        <form className="profile-form" onSubmit={handleSubmit}>
          <ProfileSection
            number="01"
            title="Exam details"
            description="Your rank and category help us assess admissions alignment."
          >
            <div className="profile-field-grid">
              <div className="profile-field-group">
                <div className="profile-label-row">
                  <label htmlFor="jeeMainRank">JEE Main overall CRL rank</label>
                  <span className="profile-field-status">Required</span>
                </div>
                <input
                  id="jeeMainRank"
                  className="profile-field"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  required
                  placeholder="e.g. 8500"
                  value={jeeMainRank}
                  onChange={(event) => setJeeMainRank(event.target.value)}
                  aria-describedby="jee-main-help"
                />
                <p id="jee-main-help" className="profile-field-help">Evaluated for NITs, IIITs, and GFTIs.</p>
              </div>

              <div className="profile-field-group">
                <div className="profile-label-row">
                  <label htmlFor="jeeAdvancedRank">JEE Advanced rank</label>
                  <span className="profile-field-status profile-field-status--quiet">Optional</span>
                </div>
                <input
                  id="jeeAdvancedRank"
                  className="profile-field"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  placeholder="e.g. 1400"
                  value={jeeAdvancedRank}
                  onChange={(event) => setJeeAdvancedRank(event.target.value)}
                  aria-describedby="jee-advanced-help"
                />
                <p id="jee-advanced-help" className="profile-field-help">Used to calculate IIT match scores when provided.</p>
              </div>
            </div>

            <div className="profile-field-group">
              <label htmlFor="category">Reservation category</label>
              <select
                id="category"
                className="profile-field"
                value={category}
                onChange={(event) => setCategory(event.target.value as Category)}
              >
                <option value="general">General (OPEN)</option>
                <option value="obc">OBC-NCL</option>
                <option value="sc">Scheduled Caste (SC)</option>
                <option value="st">Scheduled Tribe (ST)</option>
                <option value="ews">Gen-EWS</option>
              </select>
            </div>
          </ProfileSection>

          <ProfileSection
            number="02"
            title="Preferences"
            description="Set the practical and academic preferences behind your shortlist."
          >
            <div className="profile-field-grid">
              <div className="profile-field-group">
                <div className="profile-label-row">
                  <label htmlFor="budget">Total four-year tuition budget (₹ INR)</label>
                  {Number.isFinite(budgetInLakhs) && budgetInLakhs > 0 && (
                    <span className="profile-budget-value">₹{budgetInLakhs.toFixed(1)}L</span>
                  )}
                </div>
                <input
                  id="budget"
                  className="profile-field"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={50000}
                  required
                  placeholder="e.g. 1000000"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                />
                <p className="profile-field-help">A total tuition ceiling used when matching colleges.</p>
              </div>

              <fieldset className="profile-field-group">
                <legend>Hostel preference</legend>
                <div className="profile-choice-row">
                  <label className="profile-choice">
                    <input
                      type="radio"
                      name="hostelNeeded"
                      checked={hostelNeeded}
                      onChange={() => setHostelNeeded(true)}
                    />
                    <span>Require hostel</span>
                  </label>
                  <label className="profile-choice">
                    <input
                      type="radio"
                      name="hostelNeeded"
                      checked={!hostelNeeded}
                      onChange={() => setHostelNeeded(false)}
                    />
                    <span>Day scholar</span>
                  </label>
                </div>
                <p className="profile-field-help">Hostel quality is weighted when accommodation is needed.</p>
              </fieldset>
            </div>

            <div className="profile-field-group">
              <label htmlFor="branchSearch">Preferred engineering branches</label>
              <div className="profile-search-control">
                <Search size={16} aria-hidden="true" />
                <input
                  id="branchSearch"
                  type="search"
                  placeholder="Search branches"
                  value={branchSearch}
                  onChange={(event) => setBranchSearch(event.target.value)}
                />
              </div>
              <div className="profile-branch-meta">
                <p>Choose one or more, or leave blank to consider all branches.</p>
                <span aria-live="polite">{preferredBranches.length} selected</span>
              </div>
              <div className="profile-branch-list" aria-label="Engineering branch preferences">
                {filteredBranches.map((branch) => {
                  const selected = preferredBranches.includes(branch);
                  return (
                    <button
                      key={branch}
                      type="button"
                      className="profile-branch-chip"
                      data-selected={selected}
                      aria-pressed={selected}
                      onClick={() => toggleBranch(branch)}
                    >
                      {selected && <Check size={14} aria-hidden="true" />}
                      {branch}
                    </button>
                  );
                })}
              </div>
            </div>
          </ProfileSection>

          <ProfileSection
            number="03"
            title="About you"
            description="Saved with your profile for future quota-aware recommendation support."
          >
            <div className="profile-field-grid">
              <div className="profile-field-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  className="profile-field"
                  value={gender}
                  onChange={(event) => setGender(event.target.value as StudentProfile["gender"])}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="profile-field-group">
                <label htmlFor="homeState">Home domicile state</label>
                <select
                  id="homeState"
                  className="profile-field"
                  required
                  value={homeState}
                  onChange={(event) => setHomeState(event.target.value)}
                >
                  <option value="" disabled>Select state</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
          </ProfileSection>

          <ProfileSection
            number="04"
            title="Career goal"
            description="Choose the outcome you would like the shortlist to prioritise."
          >
            <fieldset className="profile-career-options">
              <legend className="sr-only">Primary career goal</legend>
              {(Object.entries(CAREER_GOAL_LABELS) as [CareerGoal, string][]).map(([goal, label]) => {
                const selected = careerGoal === goal;
                return (
                  <label key={goal} className="profile-career-option" data-selected={selected}>
                    <input
                      type="radio"
                      name="careerGoal"
                      value={goal}
                      checked={selected}
                      onChange={() => setCareerGoal(goal)}
                    />
                    <span>{label}</span>
                    {selected && <Check size={16} aria-hidden="true" />}
                  </label>
                );
              })}
            </fieldset>
          </ProfileSection>

          <div className="profile-submit">
            <button type="submit" className="profile-submit-button" disabled={!isValid}>
              Calculate my FIT matches <ArrowRight size={18} aria-hidden="true" />
            </button>
            {!isValid && (
              <p role="status">Enter a JEE Main rank, budget, and home state to continue.</p>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
