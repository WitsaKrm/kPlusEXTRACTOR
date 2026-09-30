"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b1120",
        color: "#e2e8f0",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          textAlign: "center",
          padding: 32,
          borderRadius: 20,
          background: "rgba(15, 23, 42, 0.9)",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          boxShadow: "0 20px 40px rgba(15, 23, 42, 0.35)",
        }}
      >
        <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ margin: "0 0 12px", fontSize: 32 }}>Something went wrong</h2>
        <p style={{ margin: "0 0 22px", color: "#cbd5e1", lineHeight: 1.6 }}>
          We hit a runtime error while loading the app. Please retry or sign in again.
        </p>

        <button
          onClick={() => reset()}
          style={{
            background: "#22c55e",
            color: "#052e16",
            border: "none",
            borderRadius: 10,
            padding: "12px 18px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    </div>
  );
}
