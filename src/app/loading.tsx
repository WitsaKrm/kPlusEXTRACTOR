"use client";

import { useEffect, useMemo, useState } from "react";

const loadingStages = [
  { label: "Checking Google access", progress: 25, reason: "Verifying your session and Gmail permission" },
  { label: "Listing K PLUS emails", progress: 60, reason: "Fetching unique K PLUS messages from Gmail" },
  { label: "Parsing transactions", progress: 88, reason: "Converting email data into transaction totals" },
];

export default function Loading() {
  const [progress, setProgress] = useState(8);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + 5, 95);
        if (next >= 95) {
          return 95;
        }
        return next;
      });
    }, 350);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const nextStage = loadingStages.findIndex((stage) => progress < stage.progress);
    setStageIndex(nextStage >= 0 ? nextStage : loadingStages.length - 1);
  }, [progress]);

  const statusText = useMemo(() => {
    if (progress < 30) return loadingStages[0].label;
    if (progress < 70) return loadingStages[1].label;
    return loadingStages[2].label;
  }, [progress]);

  const statusReason = useMemo(() => {
    if (progress < 30) return loadingStages[0].reason;
    if (progress < 70) return loadingStages[1].reason;
    return loadingStages[2].reason;
  }, [progress]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: "var(--background-color)",
      color: "var(--text-primary)",
      gap: "0.9rem",
      padding: "2rem",
    }}>
      <div className="spinner"></div>

      <div style={{ textAlign: "center" }}>
        <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>
          Fetching your K PLUS transactions...
        </p>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          {statusText}
        </p>
        <p style={{ margin: "0.35rem 0 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          {statusReason}
        </p>
      </div>

      <div style={{ width: "min(420px, 80vw)", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
        <div style={{
          width: "100%",
          height: "10px",
          background: "rgba(15, 23, 42, 0.08)",
          borderRadius: "999px",
          overflow: "hidden",
          border: "1px solid rgba(15, 23, 42, 0.06)",
        }}>
          <div style={{
            width: `${progress}%`,
            height: "100%",
            borderRadius: "999px",
            background: "linear-gradient(90deg, #22c55e 0%, #14b8a6 100%)",
            transition: "width 0.35s ease",
          }} />
        </div>

        <div style={{
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
        }}>
          <span>{stageIndex + 1}/3 stages</span>
          <span>{progress}%</span>
        </div>
      </div>

      <style>{`
        .spinner {
          width: 52px;
          height: 52px;
          border: 4px solid rgba(15, 23, 42, 0.12);
          border-left-color: var(--sidebar-active);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
