// ============================================================
// EduCompass AI — Shared TypeScript interfaces
// ============================================================

export interface BranchCutoff {
  general: number;
  obc: number;
  sc: number;
  st: number;
  ews: number;
}

export interface Branch {
  name: string;
  closingRank: BranchCutoff;
}

export interface College {
  id: string;
  name: string;
  type: "IIT" | "NIT" | "IIIT" | "GFTI";
  city: string;
  state: string;
  branches: Branch[];
  fees: number; // total program fees in INR
  avgPackageLPA: number;
  hostelRating: number; // 1-5
  codingCultureRating: number; // 1-5
  researchRating: number; // 1-5
  placementRating: number; // 1-5
  // Extended NIRF / dataset metrics (optional)
  nirfRank?: number;
  openingRank?: number;
  medianPackageLPA?: number;
  highestPackageLPA?: number;
  placementPercentage?: number;
  roiScore?: number;
  campusAreaAcres?: number;
  campusLifeScore?: number;
  topRecruiters?: string[];
  officialWebsite?: string;
}

export type Category = "general" | "obc" | "sc" | "st" | "ews";

export type CareerGoal =
  | "high_package"
  | "research"
  | "entrepreneurship"
  | "govt_job"
  | "core_engineering";

export interface StudentProfile {
  jeeMainRank: number;
  jeeAdvancedRank?: number | null;
  category: Category;
  gender: "male" | "female" | "other";
  homeState: string;
  budget: number; // INR
  hostelNeeded: boolean;
  preferredBranches: string[];
  careerGoal: CareerGoal;
}

export interface ScoreBreakdown {
  admissionSafety: number; // 0-100
  roi: number; // 0-100
  branchMatch: number; // 0-100
  placement: number; // 0-100
  hostel: number; // 0-100
  codingCulture: number; // 0-100
}

export interface ScoringWeights {
  admissionSafety: number;
  roi: number;
  branchMatch: number;
  placement: number;
  hostel: number;
  codingCulture: number;
}

export interface RecommendedCollege {
  college: College;
  matchedBranch: Branch;
  overallScore: number; // 0-100
  breakdown: ScoreBreakdown;
  topReasons: string[];
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  admissionSafety: 0.2,
  roi: 0.2,
  branchMatch: 0.2,
  placement: 0.2,
  hostel: 0.1,
  codingCulture: 0.1,
};

// List of Indian states for the profile form
export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi",
  "Jammu & Kashmir", "Ladakh", "Chandigarh", "Puducherry",
] as const;

// Common engineering branches
export const ENGINEERING_BRANCHES = [
  "Computer Science and Engineering",
  "Electrical Engineering",
  "Electronics and Communication Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Aerospace Engineering",
  "Metallurgical and Materials Engineering",
  "Biotechnology",
  "Mathematics and Computing",
  "Engineering Physics",
  "Industrial and Production Engineering",
  "Mining Engineering",
  "Textile Engineering",
  "Ocean Engineering",
] as const;

// Career goal labels for UI
export const CAREER_GOAL_LABELS: Record<CareerGoal, string> = {
  high_package: "High Package (₹20L+ CTC)",
  research: "Research / Higher Studies",
  entrepreneurship: "Entrepreneurship / Startups",
  govt_job: "Government Job (UPSC / PSU)",
  core_engineering: "Core Engineering Role",
};
