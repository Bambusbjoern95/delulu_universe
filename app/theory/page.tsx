"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const THEORY_DATA: Record<string, any> = {
  "001": {
    title: "THEORY #001 — 3:27 IS NOT A TIME, IT’S A TRIGGER",
    premise:
      "3:27 isn’t mystical. It’s a system intervention marker. When a narrative gets too stable, the universe pokes it.",
    endsInSeconds: 120,
    evidence: [
      { id: "e1", label: "Screenshots keep appearing at 3:27", votes: 12 },
      { id: "e2", label: "Players report the same phrase, different context", votes: 7 },
      { id: "e3", label: "The “too perfect” theory collapses first", votes: 4 },
    ],
  },
  "002": {
    title: "THEORY #002 — THE ESCAPE ECONOMY",
    premise:
      "Escapes aren’t bugs. They’re content. A jailbreak triggers a feed event and turns the community into bounty hunters.",
    endsInSeconds: 180,
    evidence: [
      { id: "e1", label: "Feed announces escape → frenzy starts", votes: 9 },
      { id: "e2", label: "Coins move based on headhunts", votes: 5 },
      { id: "e3", label: "Lottery picks a new Architect", votes: 3 },
    ],
  },
};

export default function TheoryRoom() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id || "001";

  const data = THEORY_DATA[id] || THEORY_DATA["001"];

  const [timeLeft, setTimeLeft] = useState<number>(data.endsInSeconds);
  const [votes, setVotes] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem(`votes_${id}`);
    return saved ? JSON.parse(saved) : {};
  });

  // timer
  useEffect(() => {
    setTimeLeft(data.endsInSeconds);
  }, [id, data.endsInSeconds]);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft((x) => x - 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      // prototype consequence = jail
      router.push("/jail");
    }
  }, [timeLeft, router]);

  useEffect(() => {
    localStorage.setItem(`votes_${id}`, JSON.stringify(votes));
  }, [votes, id]);

  const evidence = useMemo(() => {
    return data.evidence.map((e: any) => {
      const local = votes[e.id] || 0;
      return { ...e, total: e.votes + local };
    });
  }, [data.evidence, votes]);

  return (
    <main style={{ minHeight: "100vh", padding: 24, display: "grid", placeItems: "center" }}>
      <div style={{ width: "min(820px, 94vw)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{data.title}</div>
          <div style={{ opacity: 0.8 }}>⏳ {Math.max(timeLeft, 0)}s</div>
        </div>

        <div
          style={{
            padding: 16,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.06)",
            marginBottom: 12,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Premise</div>
          <div style={{ opacity: 0.85 }}>{data.premise}</div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {evidence.map((e: any) => (
            <div
              key={e.id}
              style={{
                padding: 14,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.04)",
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div style={{ maxWidth: 520 }}>
                <div style={{ fontWeight: 700 }}>{e.label}</div>
                <div style={{ opacity: 0.75, fontSize: 13 }}>Score: {e.total}</div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setVotes((v) => ({ ...v, [e.id]: (v[e.id] || 0) + 1 }))}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(255,255,255,0.10)",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Upvote 💖
                </button>
                <button
                  onClick={() => setVotes((v) => ({ ...v, [e.id]: (v[e.id] || 0) - 1 }))}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.03)",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Down 👀
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, opacity: 0.65, fontSize: 12 }}>
          Prototype rule: when the timer hits 0 → jail. Later this becomes 10/20 day cycles + lottery. 💅
        </div>
      </div>
    </main>
  );
}
