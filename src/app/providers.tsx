"use client";

import { SessionProvider } from "next-auth/react";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Toast = {
  id: number;
  message: string;
  type: "info" | "success" | "error";
};

const ToastContext = createContext<{
  showToast: (message: string, type?: "info" | "success" | "error") => void;
} | null>(null);

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within Providers");
  }

  return context;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "info" | "success" | "error" = "info") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, type }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  };

  const value = useMemo(() => ({ showToast }), []);

  return (
    <SessionProvider>
      <ToastContext.Provider value={value}>
        {children}
        <div style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>
          {toasts.map((toast) => (
            <div
              key={toast.id}
              style={{
                minWidth: 260,
                maxWidth: 360,
                padding: "12px 14px",
                borderRadius: 10,
                boxShadow: "0 8px 24px rgba(15,23,42,0.18)",
                background: toast.type === "error" ? "#7f1d1d" : toast.type === "success" ? "#166534" : "#0f172a",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {toast.message}
            </div>
          ))}
        </div>
      </ToastContext.Provider>
    </SessionProvider>
  );
}
