"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  StudentProfile,
  RecommendedCollege,
  ScoringWeights,
  DEFAULT_WEIGHTS,
} from "@/lib/types";
import { getRecommendations } from "@/lib/recommend";
import { colleges } from "@/data/colleges";

interface ProfileContextType {
  profile: StudentProfile | null;
  isProfileReady: boolean;
  setProfile: (profile: StudentProfile) => void;
  recommendations: RecommendedCollege[];
  selectedCollegeIds: string[];
  toggleCollegeSelection: (id: string) => void;
  clearSelections: () => void;
  weights: ScoringWeights;
  setWeights: (weights: ScoringWeights) => void;
  recalculate: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const PROFILE_STORAGE_KEY = "educompass_profile";
const CATEGORIES = ["general", "obc", "sc", "st", "ews"] as const;
const GENDERS = ["male", "female", "other"] as const;
const CAREER_GOALS = ["high_package", "research", "entrepreneurship", "govt_job", "core_engineering"] as const;

const isValidSavedProfile = (value: unknown): value is StudentProfile => {
  if (!value || typeof value !== "object") return false;

  const profile = value as Partial<StudentProfile>;
  const hasValidAdvancedRank = profile.jeeAdvancedRank == null
    || (typeof profile.jeeAdvancedRank === "number" && Number.isFinite(profile.jeeAdvancedRank) && profile.jeeAdvancedRank > 0);

  return (
    typeof profile.jeeMainRank === "number" && Number.isFinite(profile.jeeMainRank) && profile.jeeMainRank > 0
    && hasValidAdvancedRank
    && CATEGORIES.includes(profile.category as StudentProfile["category"])
    && GENDERS.includes(profile.gender as StudentProfile["gender"])
    && typeof profile.homeState === "string" && profile.homeState.trim().length > 0
    && typeof profile.budget === "number" && Number.isFinite(profile.budget) && profile.budget > 0
    && typeof profile.hostelNeeded === "boolean"
    && Array.isArray(profile.preferredBranches) && profile.preferredBranches.every((branch) => typeof branch === "string")
    && CAREER_GOALS.includes(profile.careerGoal as StudentProfile["careerGoal"])
  );
};

const getStoredProfile = (): StudentProfile | null => {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) as unknown : null;
    return isValidSavedProfile(parsed) ? parsed : null;
  } catch {
    // Treat unreadable or malformed storage as an empty profile.
    return null;
  }
};

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<StudentProfile | null>(null);
  const [isProfileReady, setIsProfileReady] = useState(false);
  const [selectedCollegeIds, setSelectedCollegeIds] = useState<string[]>([]);
  const [weights, setWeightsState] = useState<ScoringWeights>(DEFAULT_WEIGHTS);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProfileState(getStoredProfile());
      setIsProfileReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const recommendations = useMemo(
    () => (profile ? getRecommendations(profile, colleges, weights) : []),
    [profile, weights]
  );

  const setProfile = useCallback(
    (p: StudentProfile) => {
      setProfileState(p);
      try {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(p));
      } catch {
        // ignore quota errors
      }
    },
    []
  );

  const toggleCollegeSelection = useCallback((id: string) => {
    setSelectedCollegeIds((prev) => {
      if (prev.includes(id)) return prev.filter((cid) => cid !== id);
      if (prev.length >= 3) return prev; // Max 3 for comparison
      return [...prev, id];
    });
  }, []);

  const clearSelections = useCallback(() => {
    setSelectedCollegeIds([]);
  }, []);

  const setWeights = useCallback(
    (w: ScoringWeights) => {
      setWeightsState(w);
    },
    []
  );

  const recalculate = useCallback(() => {
    setWeightsState((current) => ({ ...current }));
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isProfileReady,
        setProfile,
        recommendations,
        selectedCollegeIds,
        toggleCollegeSelection,
        clearSelections,
        weights,
        setWeights,
        recalculate,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextType {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
