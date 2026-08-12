"use client";

import Link from "next/link";
import { Compass } from "lucide-react";

interface EduCompassLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function EduCompassLogo({
  className = "",
  size = "md",
}: EduCompassLogoProps) {
  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  };

  const containerSizes = {
    sm: "h-7 w-7 rounded-lg",
    md: "h-9 w-9 rounded-xl",
    lg: "h-12 w-12 rounded-2xl",
  };

  const titleSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <Link href="/" className={`flex items-center gap-3 group shrink-0 ${className}`}>
      {/* Glowing Compass Emblem */}
      <div
        className={`relative ${containerSizes[size]} flex items-center justify-center transition-all duration-500 group-hover:scale-105`}
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #e0c068 100%)",
          boxShadow: "0 0 20px -2px rgba(224, 192, 104, 0.4)",
        }}
      >
        <Compass
          className={`${iconSizes[size]} text-black transition-transform duration-700 group-hover:rotate-180`}
        />
      </div>

      {/* Brand Wordmark */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-2">
          <span className={`${titleSizes[size]} font-extrabold tracking-tight text-white`}>
            EduCompass
          </span>
          <span
            className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(212,175,55,0.25) 100%)",
              border: "1px solid rgba(212,175,55,0.4)",
              color: "#ffffff",
              boxShadow: "0 0 10px rgba(212,175,55,0.2)",
            }}
          >
            AI 2.0
          </span>
        </div>
        {size !== "sm" && (
          <span className="text-[10px] font-medium tracking-wide mt-0.5" style={{ color: "#777777" }}>
            Smart Engineering Admission Engine
          </span>
        )}
      </div>
    </Link>
  );
}
