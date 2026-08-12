// ============================================================
// EduCompass AI — Deterministic Recommendation Engine
// ============================================================
// HARD RULE: This file is 100% deterministic plain TypeScript.
// NO AI/LLM is involved in scoring or ranking. AI is only used
// afterwards in the counsellor chat to explain results.
// ============================================================

import {
  College,
  Branch,
  StudentProfile,
  RecommendedCollege,
  ScoreBreakdown,
  ScoringWeights,
  DEFAULT_WEIGHTS,
  Category,
  CareerGoal,
} from "@/lib/types";

// ── Helpers ──────────────────────────────────────────────────

/** Get the closing rank for the student's category */
function getCategoryRank(branch: Branch, category: Category): number {
  return branch.closingRank[category];
}

/** Clamp a number between 0 and 100 */
function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

// ── Eligibility Filters ──────────────────────────────────────

const RANK_BUFFER = 1.2; // 20% buffer on closing rank
const BUDGET_TOLERANCE = 1.1; // 10% budget tolerance

/**
 * Check if a student is eligible for a specific branch at a college.
 * Eligible = student's rank is within (closingRank * RANK_BUFFER)
 */
function isEligibleForBranch(
  rank: number,
  branch: Branch,
  category: Category
): boolean {
  const cutoff = getCategoryRank(branch, category);
  return rank <= cutoff * RANK_BUFFER;
}

/**
 * Check if a college is within the student's budget (with tolerance).
 */
function isWithinBudget(collegeFees: number, budget: number): boolean {
  return collegeFees <= budget * BUDGET_TOLERANCE;
}

// ── Scoring Functions (each returns 0-100) ───────────────────

/**
 * Admission Safety Score: How safe is the student's rank relative
 * to the closing rank? Lower rank relative to cutoff = safer.
 */
function scoreAdmissionSafety(
  rank: number,
  branch: Branch,
  category: Category
): number {
  const cutoff = getCategoryRank(branch, category);
  if (rank > cutoff) {
    // Still within buffer zone (20%), give partial score
    const overshoot = (rank - cutoff) / (cutoff * (RANK_BUFFER - 1));
    return clamp(30 * (1 - overshoot)); // 0-30 for buffer zone
  }
  // Within cutoff — ratio determines safety
  const ratio = rank / cutoff;
  if (ratio <= 0.3) return 100; // Top 30% of cutoff = maximum safety
  if (ratio <= 0.5) return 90;
  if (ratio <= 0.7) return 75;
  if (ratio <= 0.85) return 60;
  if (ratio <= 0.95) return 45;
  return 35; // Just barely making it
}

/**
 * ROI Score: Average package relative to total fees.
 * Higher ROI = better score.
 */
function scoreROI(avgPackageLPA: number, fees: number): number {
  // ROI = (package in INR) / fees
  const packageINR = avgPackageLPA * 100000;
  const roi = packageINR / fees;

  // ROI of 3+ is excellent, 1 or less is poor
  if (roi >= 4) return 100;
  if (roi >= 3) return 90;
  if (roi >= 2.5) return 80;
  if (roi >= 2) return 70;
  if (roi >= 1.5) return 55;
  if (roi >= 1) return 40;
  return 25;
}

/**
 * Branch Match Score: How well does the branch match
 * the student's preferred branches?
 */
function scoreBranchMatch(
  branch: Branch,
  preferredBranches: string[],
  careerGoal: CareerGoal
): number {
  // Exact match with preferred branches
  if (preferredBranches.length === 0) return 70; // No preference = neutral

  const branchLower = branch.name.toLowerCase();

  // Check for exact match
  const exactMatch = preferredBranches.some(
    (pref) => pref.toLowerCase() === branchLower
  );
  if (exactMatch) return 100;

  // Check for partial match (e.g., "Computer Science" matches "Computer Science and Engineering")
  const partialMatch = preferredBranches.some(
    (pref) =>
      branchLower.includes(pref.toLowerCase()) ||
      pref.toLowerCase().includes(branchLower)
  );
  if (partialMatch) return 80;

  // Career goal alignment bonus
  const goalBranchMap: Record<CareerGoal, string[]> = {
    high_package: ["computer science", "mathematics and computing", "electronics"],
    research: ["engineering physics", "mathematics", "biotechnology"],
    entrepreneurship: ["computer science", "electrical", "electronics"],
    govt_job: ["civil", "mechanical", "electrical"],
    core_engineering: ["mechanical", "civil", "chemical", "metallurgical"],
  };

  const goalBranches = goalBranchMap[careerGoal] || [];
  const goalMatch = goalBranches.some((g) => branchLower.includes(g));
  if (goalMatch) return 60;

  return 30; // No match at all
}

/**
 * Placement Score: Derived from the college's placement rating (1-5).
 * Adjusted based on career goal.
 */
function scorePlacement(
  placementRating: number,
  avgPackageLPA: number,
  careerGoal: CareerGoal
): number {
  let base = (placementRating / 5) * 80; // 0-80 from rating

  // Package bonus
  if (avgPackageLPA >= 20) base += 20;
  else if (avgPackageLPA >= 15) base += 15;
  else if (avgPackageLPA >= 10) base += 10;
  else base += 5;

  // Career goal adjustment
  if (careerGoal === "high_package" && avgPackageLPA >= 18) base += 10;
  if (careerGoal === "research") base -= 10; // Placement less relevant
  if (careerGoal === "govt_job") base -= 5;

  return clamp(base);
}

/**
 * Hostel Score: Based on hostel rating, weighted more if hostel is needed.
 */
function scoreHostel(hostelRating: number, hostelNeeded: boolean): number {
  if (!hostelNeeded) return 70; // Neutral if not needed
  return (hostelRating / 5) * 100;
}

/**
 * Coding Culture Score: Based on coding culture rating.
 * Weighted more for tech-oriented career goals.
 */
function scoreCodingCulture(
  codingCultureRating: number,
  careerGoal: CareerGoal
): number {
  let base = (codingCultureRating / 5) * 85;

  // Boost for tech-focused goals
  if (
    careerGoal === "high_package" ||
    careerGoal === "entrepreneurship"
  ) {
    base += 15;
  }

  return clamp(base);
}

// ── Top Reasons Generator ────────────────────────────────────

function generateTopReasons(
  college: College,
  branch: Branch,
  breakdown: ScoreBreakdown,
  profile: StudentProfile
): string[] {
  const reasons: { text: string; score: number }[] = [];

  if (breakdown.admissionSafety >= 70) {
    reasons.push({
      text: `Safe admission — your rank is well within the cutoff for ${branch.name}`,
      score: breakdown.admissionSafety,
    });
  } else if (breakdown.admissionSafety >= 40) {
    reasons.push({
      text: `Moderate admission chance for ${branch.name}`,
      score: breakdown.admissionSafety,
    });
  }

  if (breakdown.roi >= 75) {
    const roi = ((college.avgPackageLPA * 100000) / college.fees).toFixed(1);
    reasons.push({
      text: `Excellent ROI — ${roi}x return on investment (₹${college.avgPackageLPA}L avg package)`,
      score: breakdown.roi,
    });
  }

  if (breakdown.branchMatch >= 80) {
    reasons.push({
      text: `Strong branch match — ${branch.name} aligns with your preferences`,
      score: breakdown.branchMatch,
    });
  }

  if (breakdown.placement >= 80) {
    reasons.push({
      text: `Top-tier placements — ₹${college.avgPackageLPA}L average package`,
      score: breakdown.placement,
    });
  }

  if (breakdown.hostel >= 80 && profile.hostelNeeded) {
    reasons.push({
      text: `Great hostel facilities — rated ${college.hostelRating}/5`,
      score: breakdown.hostel,
    });
  }

  if (breakdown.codingCulture >= 80) {
    reasons.push({
      text: `Vibrant coding culture — rated ${college.codingCultureRating}/5`,
      score: breakdown.codingCulture,
    });
  }

  if (college.fees <= profile.budget * 0.7) {
    reasons.push({
      text: `Well within budget — ₹${(college.fees / 100000).toFixed(1)}L total fees`,
      score: 75,
    });
  }

  // Sort by score and return top 3
  return reasons
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.text);
}

// ── Main Recommendation Function ─────────────────────────────

/**
 * Pure, deterministic function that:
 * 1. Filters colleges by eligibility (rank + budget)
 * 2. Scores each college-branch combo on 6 factors
 * 3. Returns sorted recommendations with breakdown
 *
 * NO side effects. NO AI/LLM calls.
 */
export function getRecommendations(
  profile: StudentProfile,
  colleges: College[],
  weights: ScoringWeights = DEFAULT_WEIGHTS
): RecommendedCollege[] {
  const results: RecommendedCollege[] = [];

  for (const college of colleges) {
    // Determine rank for this college type
    const isIIT = college.type === "IIT";
    if (isIIT && (!profile.jeeAdvancedRank || profile.jeeAdvancedRank <= 0)) {
      // Exclude IIT if student has no JEE Advanced rank
      continue;
    }

    const studentRank = isIIT
      ? (profile.jeeAdvancedRank as number)
      : profile.jeeMainRank;

    if (!studentRank || studentRank <= 0) continue;

    // Budget filter
    if (!isWithinBudget(college.fees, profile.budget)) continue;

    // Find the best eligible branch for this college
    let bestMatch: { branch: Branch; score: number; breakdown: ScoreBreakdown } | null = null;

    for (const branch of college.branches) {
      // Eligibility filter
      if (!isEligibleForBranch(studentRank, branch, profile.category)) continue;

      // Calculate individual factor scores
      const breakdown: ScoreBreakdown = {
        admissionSafety: scoreAdmissionSafety(studentRank, branch, profile.category),
        roi: scoreROI(college.avgPackageLPA, college.fees),
        branchMatch: scoreBranchMatch(branch, profile.preferredBranches, profile.careerGoal),
        placement: scorePlacement(college.placementRating, college.avgPackageLPA, profile.careerGoal),
        hostel: scoreHostel(college.hostelRating, profile.hostelNeeded),
        codingCulture: scoreCodingCulture(college.codingCultureRating, profile.careerGoal),
      };

      // Weighted overall score
      const overallScore =
        breakdown.admissionSafety * weights.admissionSafety +
        breakdown.roi * weights.roi +
        breakdown.branchMatch * weights.branchMatch +
        breakdown.placement * weights.placement +
        breakdown.hostel * weights.hostel +
        breakdown.codingCulture * weights.codingCulture;

      if (!bestMatch || overallScore > bestMatch.score) {
        bestMatch = { branch, score: overallScore, breakdown };
      }
    }

    if (bestMatch) {
      results.push({
        college,
        matchedBranch: bestMatch.branch,
        overallScore: Math.round(bestMatch.score * 10) / 10,
        breakdown: bestMatch.breakdown,
        topReasons: generateTopReasons(
          college,
          bestMatch.branch,
          bestMatch.breakdown,
          profile
        ),
      });
    }
  }

  // Sort by overall score descending
  return results.sort((a, b) => b.overallScore - a.overallScore);
}
