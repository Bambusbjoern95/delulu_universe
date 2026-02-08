"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type JailState = "locked" | "noise" | "escaped" | "failed";

export default function Jail() {
  const [state, setState] = useState<JailState>("locked");
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (state === "escaped" || state === "failed") return;

    if (timeLeft <= 0) {
      setState("failed");
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, state]);

  const page: React.CSSProperties = {
    minHeight: "100vh",
    padding: 40,
    background: "radial-gradient(circle at top, #151515 0%, #070707 60%, #000 100%)",
    color: "#fff",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  };

  const card: React.CSSProperties = {
    maxWidth: 720,
    margin: "0 auto",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 24,
    background: "rgba(255,255,255,0.03)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
  };

  const h1: React.CSSProperties = { margin: 0, letterSpacing: 2, fontSize: 40 };
  const sub: React.CSSProperties = { marginTop: 10, opacity: 0.85, lineHeight: 1.5 };

  const hud: React.CSSProperties = {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginTop: 18,
    opacity: 0.9,
    fontSize: 14,
  };

  const pill: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.35)",
  };

  const btn: React.CSSProperties = {
    marginTop: 18,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    letterSpacing: 0.2,
    width: "100%",
    textAlign: "left",
  };

  const btnDanger: React.CSSProperties = {
    ...btn,
    background: "rgba(255, 60, 60, 0.08)",
    border: "1px solid rgba(255, 80, 80, 0.25)",
  };

  const linkStyle: React.CSSProperties = {
    display: "inline-block",
    marginTop: 18,
    color: "#fff",
    textDecoration: "none",
    opacity: 0.85,
  };

  const flavorLine =
    state === "locked"
      ? "Cold concrete. A flickering light. You count your breaths."
      : state === "noise"
      ? "Footsteps. Metal keys. Someone stops… right outside."
      : state === "escaped"
      ? "Air. Freedom. And a feeling that you were NOT alone in here."
      : "The light dies. The lock clicks. You’re staying.";

  return (
    <main style={page}>
      <div style={card}>
        <h1 style={h1}>JAIL</h1>
        <p style={sub}>{flavorLine}</p>

        <div style={hud}>
          <span style={pill}>Time: {timeLeft}s</span>
          <span style={pill}>State: {state.toUpperCase()}</span>
        </div>

        {state === "locked" && (
          <>
            <button style={btn} onClick={() => setState("noise")}>
              👁️ Investigate the noise
              <div style={{ opacity: 0.75, fontWeight: 500, marginTop: 6 }}>
                You only get one clean moment…
              </div>
            </button>

            <button style={btnDanger} onClick={() => setState("failed")}>
              🧍 Freeze and do nothing
              <div style={{ opacity: 0.75, fontWeight: 500, marginTop: 6 }}>
                Sometimes “safe” is the trap.
              </div>
            </button>
          </>
        )}

        {state === "noise" && (
          <>
            <button style={btn} onClick={() => setState("escaped")}>
              🔓 Make your move (escape attempt)
              <div style={{ opacity: 0.75, fontWeight: 500, marginTop: 6 }}>
                If you hesitate, you lose.
              </div>
            </button>

            <button style={btnDanger} onClick={() => setState("locked")}>
              ↩️ Back away quietly
              <div style={{ opacity: 0.75, fontWeight: 500, marginTop: 6 }}>
                Reset your nerve… but time keeps running.
              </div>
            </button>
          </>
        )}

        {state === "escaped" && (
          <>
            <h2 style={{ marginTop: 22 }}>🗝️ You escaped.</h2>
            <p style={{ opacity: 0.85, lineHeight: 1.6 }}>
              You sprint down the corridor. The air tastes like rust.  
              Behind you — a soft laugh. You don’t look back.
            </p>

            <button
              style={btn}
              onClick={() => {
                setTimeLeft(30);
                setState("locked");
              }}
            >
              🔁 Restart jail scene
              <div style={{ opacity: 0.75, fontWeight: 500, marginTop: 6 }}>
                Same place, different outcome.
              </div>
            </button>
          </>
        )}

        {state === "failed" && (
          <>
            <h2 style={{ marginTop: 22 }}>⛓️ You failed.</h2>
            <p style={{ opacity: 0.85, lineHeight: 1.6 }}>
              A key turns. The cell door stays shut.  
              Someone whispers your name — wrong pronunciation.
            </p>

            <button
              style={btn}
              onClick={() => {
                setTimeLeft(30);
                setState("locked");
              }}
            >
              🔁 Try again
              <div style={{ opacity: 0.75, fontWeight: 500, marginTop: 6 }}>
                Don’t waste the first 5 seconds.
              </div>
            </button>
          </>
        )}

        <Link href="/feed" style={linkStyle}>
          ← Back to Feed 🧠✨
        </Link>
      </div>
    </main>
  );
}
