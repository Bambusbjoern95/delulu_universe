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

  const escape = () => {
    if (state === "locked") {
      setState("escaped");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #1a1a1a, #000)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        textAlign: "center",
        padding: "24px",
      }}
    >
      {state === "locked" && (
        <>
          <h1>JAIL</h1>
          <p>Time left: {timeLeft}s</p>

          <button
            onClick={escape}
            style={{
              marginTop: "20px",
              padding: "14px 24px",
              background: "#ff0055",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            ESCAPE
          </button>
        </>
      )}

      {state === "escaped" && (
        <>
          <h1>ESCAPED</h1>
          <p>You got out.</p>

          <Link href="/feed" style={linkStyle}>
            → Back to Feed
          </Link>
        </>
      )}

      {state === "failed" && (
        <>
          <h1>FAILED</h1>
          <p>You waited too long.</p>

          <Link href="/feed" style={linkStyle}>
            → Back to Feed
          </Link>
        </>
      )}
    </main>
  );
}

const linkStyle = {
  marginTop: "32px",
  textDecoration: "none",
  color: "#aaa",
  fontSize: "14px",
};
