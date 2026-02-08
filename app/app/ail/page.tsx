"use client";

import Link from "next/link";

export default function Jail() {
  return (
    <main style={{ minHeight: "100vh", padding: 24, display: "grid", placeItems: "center" }}>
      <div style={{ width: "min(720px, 94vw)", textAlign: "center" }}>
        <h1 style={{ fontSize: 40, marginBottom: 10 }}>JAILED 😭🚔</h1>
        <p style={{ opacity: 0.8, marginBottom: 18 }}>
          Prototype consequence. Later: escape attempts, headhunts, coins, and lottery picks. 😈💅
        </p>

        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            textDecoration: "none",
          }}
        >
          Back to Feed 🧠✨
        </Link>
      </div>
    </main>
  );
}
