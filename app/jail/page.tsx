"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type JailState = "locked" | "escaped" | "failed";

export default function Jail() {
  const [state, setState] = useState<JailState>("locked");
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (state !== "locked") return;

    if (timeLeft <= 0) {
      setState("failed");
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, state]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui",
        textAlign: "center",
        padding: "24px",
      }}
    >
      {state === "locked" && (
        <>
          <h1 style={{ fontSize: "2rem", marginBottom: "12px" }}>
            You are in jail
          </h1>
          <p style={{ opacity: 0.8, marginBottom: "24px" }}>
            Escape before the timer hits zero.
          </p>

          <p style={{ fontSize: "1.5rem", marginBottom: "24px" }}>
            ⏳ {timeLeft}s
          </p>

          <button
            onClick={() => setState("escaped")}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              background: "#ffffff",
              color: "#000000",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Escape
          </button>
        </>
      )}

      {state === "escaped" && (
        <>
          <h1 style={{ fontSize: "2rem", marginBottom: "12px" }}>
            You escaped 🏃‍♀️
          </h1>
          <p style={{ opacity: 0.8, marginBottom: "24px" }}>
            Welcome back to the feed.
          </p>
        </>
      )}

      {state === "failed" && (
        <>
          <h1 style={{ fontSize: "2rem", marginBottom: "12px" }}>
            You failed 💀
          </h1>
          <p style={{ opacity: 0.8, marginBottom: "24px" }}>
            Time ran out.
          </p>
        </>
      )}

      <Link
        href="/feed"
        style={{
          marginTop: "32px",
          textDecoration: "none",
          color: "#ffffff",
          opacity: 0.7,
          fontSize: "0.9rem",
        }}
      >
        ← Back to Feed
      </Link>
    </main>
  );
}
