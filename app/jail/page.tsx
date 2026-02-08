"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type JailState = "locked" | "noise" | "panic" | "failed";

export default function Jail() {
  const [timeLeft, setTimeLeft] = useState(30);
  const [state, setState] = useState<JailState>("locked");
  const [message, setMessage] = useState(
    "You wake up in a cold jail cell. The door is locked."
  );

  // countdown
  useEffect(() => {
    if (state === "failed") return;
    if (timeLeft <= 0) {
      setState("failed");
      setMessage("Time’s up. The guards are coming.");
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, state]);

  function makeNoise() {
    setState("noise");
    setMessage(
      "You scream and bang the door. Footsteps echo down the hallway."
    );
  }

  function panic() {
    setState("panic");
    setMessage(
      "You panic. Your heart races. Breathing gets harder. Bad choice."
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: "system-ui",
        padding: "24px",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "12px" }}>JAIL</h1>

      <p style={{ opacity: 0.8, marginBottom: "16px" }}>{message}</p>

      <p style={{ fontSize: "1.2rem", marginBottom: "24px" }}>
        ⏳ {timeLeft}s
      </p>

      {state !== "failed" ? (
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={makeNoise}
            style={{
              padding: "10px 16px",
              background: "#111",
              border: "1px solid #555",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Bang the door
          </button>

          <button
            onClick={panic}
            style={{
              padding: "10px 16px",
              background: "#300",
              border: "1px solid #900",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Panic
          </button>
        </div>
      ) : (
        <p style={{ color: "#f55", fontWeight: 700 }}>
          🚨 YOU FAILED 🚨
        </p>
      )}

      <Link
        href="/feed"
        style={{
          marginTop: "32px",
          textDecoration: "none",
          color: "#fff",
          opacity: 0.7,
          fontSize: "0.9rem",
        }}
      >
        ← Back to Feed
      </Link>
    </main>
  );
}
