"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="loading"></div>;
  }

  if (session) {
    return (
      <button className="btn" onClick={() => signOut()}>
        Sign out
      </button>
    );
  }

  return (
    <div className="login-container">
      <div className="card" style={{ textAlign: "center" }}>
        <h2 style={{ marginBottom: "1rem" }}>Welcome to K PLUS Extractor</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
          Please sign in with your Google account to analyze your transaction emails.
        </p>
        <button className="btn" onClick={() => signIn("google")}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
