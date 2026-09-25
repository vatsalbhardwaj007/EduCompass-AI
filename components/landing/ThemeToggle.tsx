"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useRef } from "react";

const THEME_STORAGE_KEY = "educompass-theme";

function readPreferredTheme(): "light" | "dark" {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export default function ThemeToggle() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const syncButton = (theme: "light" | "dark") => {
    const button = buttonRef.current;
    if (!button) return;
    button.setAttribute("aria-pressed", String(theme === "dark"));
    button.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
  };

  useEffect(() => {
    const theme = readPreferredTheme();
    applyTheme(theme);
    syncButton(theme);
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      className="landing-theme-toggle"
      aria-label="Toggle color theme"
      aria-pressed={false}
      onClick={() => {
        const nextTheme = document.documentElement.classList.contains("dark")
          ? "light"
          : "dark";
        applyTheme(nextTheme);
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        syncButton(nextTheme);
      }}
    >
      <Sun className="landing-theme-sun" aria-hidden="true" size={17} />
      <Moon className="landing-theme-moon" aria-hidden="true" size={17} />
      <span className="sr-only">Toggle color theme</span>
    </button>
  );
}
