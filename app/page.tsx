"use client";

import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const GAME_SECONDS = 30;

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [running, setRunning] = useState(false);
  const [best, setBest] = useState(0);

  // load best score
  useEffect(() => {
    const saved = Number(localStorage.getItem("delulu_best") || 0);
    setBest(saved);
  }, []);

  // timer
  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) {
      setRunning(false);
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [running, timeLeft]);

  // save best
  useEffect(() => {
    if (score > best) {
      setBest(score);
      localStorage.setItem("delulu_best", String(score));
    }
  }, [score, best]);

  const status = useMemo(() => {
    if (running) return "GO GO GO 💅✨";
    if (timeLeft === 0) return "TIME 😭💖";
    return "READY? 😈";
  }, [running, timeLeft]);

  function start() {
    setScore(0);
    setTimeLeft(GAME_SECONDS);
    setRunning(true);
  }

  function tap() {
    if (!running) return;
    setScore((s) => s + 1);
  }

  return (
    <main style={{ minHeight: "100vh", padding: 24, display: "grid", placeItems: "center" }}>
      <div style={{ width: "min(520px, 92vw)", textAlign: "center" }}>
        <h1 style={{ fontSize: 36, marginBottom: 8 }}>Delulu Clicker 💖</h1>
        <p style={{ opacity: 0.8, marginBottom: 18 }}>
           Click the button as many times as you can in  {GAME_SECONDS}s. {status}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
            fontSize: 16,
            opacity: 0.9,
          }}
        >
          <div>⏳ Time: <b>{timeLeft}s</b></div>
          <div>💗 Score: <b>{score}</b></div>
          <div>👑 Best: <b>{best}</b></div>
        </div>

        <button
          onClick={tap}
          style={{
            width: "100%",
            padding: "22px 16px",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            fontSize: 20,
            cursor: running ? "pointer" : "not-allowed",
            userSelect: "none",
          }}
        >
          {running ? "TAP FOR DELUSION 💅✨" : "Start first 😭"}
        </button>

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button
            onClick={start}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.10)",
              color: "white",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            Start 🥳
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("delulu_best");
              setBest(0);
            }}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.04)",
              color: "white",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            Reset Best 🧼
          </button>
        </div>

        <p style={{ marginTop: 14, opacity: 0.7, fontSize: 13 }}>
          Next upgrade: Levels, combos, powerups, shop, sound 😈💖
        </p>
      </div>
    </main>
  );
}
