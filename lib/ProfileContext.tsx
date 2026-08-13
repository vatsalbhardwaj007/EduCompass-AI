"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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

const DEFAULT_DEMO_PROFILE: StudentProfile = {
  jeeMainRank: 5000,
  jeeAdvancedRank: 500,
  category: "general",
  gender: "male",
  homeState: "Delhi",
  budget: 1500000,
  hostelNeeded: true,
  preferredBranches: [],
  careerGoal: "high_package",
};

const getInitialProfile = (): StudentProfile => {
  if (typeof window === "undefined") return DEFAULT_DEMO_PROFILE;
  try {
    const saved = localStorage.getItem("educompass_profile");
    if (saved) {
      return JSON.parse(saved) as StudentProfile;
    }
  } catch {
    // fallback
  }
  return DEFAULT_DEMO_PROFILE;
};

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<StudentProfile>(getInitialProfile);
  const [recommendations, setRecommendations] = useState<RecommendedCollege[]>(() => 
    getRecommendations(getInitialProfile(), colleges, DEFAULT_WEIGHTS)
  );
  const [selectedCollegeIds, setSelectedCollegeIds] = useState<string[]>([]);
  const [weights, setWeightsState] = useState<ScoringWeights>(DEFAULT_WEIGHTS);

  const calculateRecommendations = useCallback(
    (p: StudentProfile, w: ScoringWeights) => {
      const results = getRecommendations(p, colleges, w);
      setRecommendations(results);
    },
    []
  );

  // Sync profile & recommendations on mount / change
  useEffect(() => {
    const initial = getInitialProfile();
    setProfileState(initial);
    calculateRecommendations(initial, weights);
  }, [calculateRecommendations, weights]);

  const setProfile = useCallback(
    (p: StudentProfile) => {
      setProfileState(p);
      try {
        localStorage.setItem("educompass_profile", JSON.stringify(p));
      } catch {
        // ignore quota errors
      }
      calculateRecommendations(p, weights);
    },
    [weights, calculateRecommendations]
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
      if (profile) calculateRecommendations(profile, w);
    },
    [profile, calculateRecommendations]
  );

  const recalculate = useCallback(() => {
    if (profile) calculateRecommendations(profile, weights);
  }, [profile, weights, calculateRecommendations]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
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
