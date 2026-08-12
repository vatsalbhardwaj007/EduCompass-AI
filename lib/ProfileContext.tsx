"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
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

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<StudentProfile | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedCollege[]>([]);
  const [selectedCollegeIds, setSelectedCollegeIds] = useState<string[]>([]);
  const [weights, setWeightsState] = useState<ScoringWeights>(DEFAULT_WEIGHTS);

  const calculateRecommendations = useCallback(
    (p: StudentProfile, w: ScoringWeights) => {
      const results = getRecommendations(p, colleges, w);
      setRecommendations(results);
    },
    []
  );

  const setProfile = useCallback(
    (p: StudentProfile) => {
      setProfileState(p);
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
