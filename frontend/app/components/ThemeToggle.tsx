"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: 40, height: 40, borderRadius: 12, background: "transparent" }} />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      id="theme-toggle-btn"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        cursor: "pointer",
        transition: "all 0.25s ease",
        background: isDark ? "#1e293b" : "#f1f5f9",
        color: isDark ? "#e2e8f0" : "#64748b",
        flexShrink: 0,
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isDark ? "#334155" : "#e2e8f0";
        e.currentTarget.style.transform = "scale(1.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isDark ? "#1e293b" : "#f1f5f9";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <span style={{ display: "flex", transition: "transform 0.3s ease" }}>
        {isDark ? <Moon size={20} /> : <Sun size={20} />}
      </span>
    </button>
  );
}
