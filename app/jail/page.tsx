"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type RunState = "ready" | "running" | "won" | "caught" | "timeout";

type EventCard = {
  id: string;
  title: string;
  desc: string;
  effect: (s: GameSnapshot) => GameSnapshot;
};

type GameSnapshot = {
  timeLeft: number; // seconds
  stamina: number; // 0-100
  hp: number; // 0-100
  suspicion: number; // 0-100 (guards)
  keys: number;
  shiv: number;
  coin: number;
  xp: number;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function fmt2(n: number) {
  return n.toString().padStart(2, "0");
}

export default function Jail() {
  const [runState, setRunState] = useState<RunState>("ready");

  const [snap, setSnap] = useState<GameSnapshot>({
    timeLeft: 30,
    stamina: 80,
    hp: 100,
    suspicion: 15,
    keys: 0,
    shiv: 0,
    coin: 0,
    xp: 0,
  });

  const [log, setLog] = useState<string[]>([
    "You wake up in a cell. The lights flicker. Someone whispers: 'MOVE.'",
  ]);

  const [currentEvent, setCurrentEvent] = useState<EventCard | null>(null);

  const tickRef = useRef<number | null>(null);

  // -------- Events (random)
  const events: EventCard[] = useMemo(
    () => [
      {
        id: "contraband",
        title: "Contraband Drop",
        desc: "A sock slides under your door. Something sharp inside.",
        effect: (s) => ({
          ...s,
          shiv: s.shiv + 1,
          suspicion: clamp(s.suspicion + 8, 0, 100),
          xp: s.xp + 10,
        }),
      },
      {
        id: "guard-shift",
        title: "Guard Shift Change",
        desc: "Footsteps change rhythm. A tiny timing window opens.",
        effect: (s) => ({
          ...s,
          suspicion: clamp(s.suspicion - 12, 0, 100),
          stamina: clamp(s.stamina + 6, 0, 100),
          xp: s.xp + 8,
        }),
      },
      {
        id: "rat",
        title: "Tunnel Rat",
        desc: "A rat carries a ring of keys... you can try to grab it.",
        effect: (s) => ({
          ...s,
          keys: s.keys + 1,
          stamina: clamp(s.stamina - 10, 0, 100),
          suspicion: clamp(s.suspicion + 6, 0, 100),
          xp: s.xp + 12,
        }),
      },
      {
        id: "fight",
        title: "Yard Fight",
        desc: "Someone bumps you. Chaos. You can slip through… or get hit.",
        effect: (s) => ({
          ...s,
          hp: clamp(s.hp - 18, 0, 100),
          suspicion: clamp(s.suspicion + 10, 0, 100),
          coin: s.coin + 1,
          xp: s.xp + 14,
        }),
      },
      {
        id: "camera",
        title: "Camera Glitch",
        desc: "A camera loops for a second. Perfect cover.",
        effect: (s) => ({
          ...s,
          suspicion: clamp(s.suspicion - 18, 0, 100),
          xp: s.xp + 9,
        }),
      },
    ],
    []
  );

  function pushLog(line: string) {
    setLog((prev) => [line, ...prev].slice(0, 8));
  }

  function hardReset() {
    setRunState("ready");
    setSnap({
      timeLeft: 30,
      stamina: 80,
      hp: 100,
      suspicion: 15,
      keys: 0,
      shiv: 0,
      coin: 0,
      xp: 0,
    });
    setCurrentEvent(null);
    setLog(["You wake up in a cell. The lights flicker. Someone whispers: 'MOVE.'"]);
  }

  function startRun() {
    hardReset();
    setRunState("running");
    pushLog("RUN STARTED: 30 seconds. Get a key and escape.");
  }

  function stopTick() {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  // -------- core tick loop
  useEffect(() => {
    stopTick();

    if (runState !== "running") return;

    tickRef.current = window.setInterval(() => {
      setSnap((s) => {
        // passive drain + guard pressure
        const nextTime = s.timeLeft - 1;

        const suspicionRise = 3 + (s.shiv > 0 ? 1 : 0); // contraband makes you hotter
        const staminaDrain = 4;

        const next: GameSnapshot = {
          ...s,
          timeLeft: nextTime,
          stamina: clamp(s.stamina - staminaDrain, 0, 100),
          suspicion: clamp(s.suspicion + suspicionRise, 0, 100),
        };

        return next;
      });
    }, 1000);

    return () => stopTick();
  }, [runState]);

  // -------- state transitions
  useEffect(() => {
    if (runState !== "running") return;

    // lose conditions
    if (snap.hp <= 0) {
      setRunState("caught");
      pushLog("You went down. Guards drag you back.");
      return;
    }
    if (snap.suspicion >= 100) {
      setRunState("caught");
      pushLog("ALERT. Spotlights. You're caught.");
      return;
    }
    if (snap.timeLeft <= 0) {
      setRunState("timeout");
      pushLog("TIME OUT. You missed the window.");
      return;
    }

    // win condition: have a key + choose escape action
  }, [snap, runState]);

  // -------- random events while running
  useEffect(() => {
    if (runState !== "running") return;
    if (currentEvent) return;

    // 30% chance each second to trigger an event (tunable)
    const roll = Math.random();
    if (roll < 0.3) {
      const e = events[Math.floor(Math.random() * events.length)];
      setCurrentEvent(e);
      pushLog(`EVENT: ${e.title}`);
    }
  }, [snap.timeLeft, runState, currentEvent, events]);

  function resolveEvent() {
    if (!currentEvent) return;

    setSnap((s) => {
      const after = currentEvent.effect(s);
      return {
        ...after,
        // small “breathing” reward for making decisions
        xp: after.xp + 2,
      };
    });

    pushLog(`You take it: ${currentEvent.title}.`);
    setCurrentEvent(null);
  }

  // -------- player actions
  function actionSneak() {
    if (runState !== "running") return;
    setSnap((s) => {
      const cost = 8;
      const gain = 14;
      const fail = Math.random() < 0.25;

      const nextSusp = fail ? s.suspicion + 14 : s.suspicion - gain;

      return {
        ...s,
        stamina: clamp(s.stamina - cost, 0, 100),
        suspicion: clamp(nextSusp, 0, 100),
        xp: s.xp + (fail ? 3 : 10),
      };
    });
    pushLog("You move in the shadows…");
  }

  function actionSearch() {
    if (runState !== "running") return;
    setSnap((s) => {
      const cost = 10;
      const foundKey = Math.random() < 0.22;
      const foundCoin = Math.random() < 0.35;

      return {
        ...s,
        stamina: clamp(s.stamina - cost, 0, 100),
        suspicion: clamp(s.suspicion + 8, 0, 100),
        keys: s.keys + (foundKey ? 1 : 0),
        coin: s.coin + (foundCoin ? 1 : 0),
        xp: s.xp + (foundKey ? 20 : 6),
      };
    });
    pushLog("You search fast. Quietly.");
  }

  function actionFight() {
    if (runState !== "running") return;
    setSnap((s) => {
      const hasShiv = s.shiv > 0;
      const dmg = hasShiv ? 8 : 14; // you still get hurt either way
      const heat = hasShiv ? 18 : 12;

      return {
        ...s,
        hp: clamp(s.hp - dmg, 0, 100),
        suspicion: clamp(s.suspicion + heat, 0, 100),
        coin: s.coin + 1,
        xp: s.xp + (hasShiv ? 12 : 8),
      };
    });
    pushLog("Hands. Noise. Risk.");
  }

  function actionEscape() {
    if (runState !== "running") return;

    setSnap((s) => {
      const hasKey = s.keys > 0;
      if (!hasKey) {
        pushLog("No key. The door doesn't move.");
        return { ...s, suspicion: clamp(s.suspicion + 10, 0, 100), xp: s.xp + 1 };
      }

      const chance = 0.55 + (s.suspicion < 40 ? 0.15 : 0) + (s.stamina > 40 ? 0.1 : 0);
      const ok = Math.random() < chance;

      if (ok) {
        setRunState("won");
        pushLog("ESCAPE SUCCESS. You're out.");
        return { ...s, xp: s.xp + 50 };
      } else {
        setRunState("caught");
        pushLog("Door opens—alarm screams. Caught.");
        return { ...s, suspicion: 100, xp: s.xp + 10 };
      }
    });
  }

  const mm = Math.floor(snap.timeLeft / 60);
  const ss = snap.timeLeft % 60;

  const statusLabel =
    runState === "ready"
      ? "Ready"
      : runState === "running"
      ? "RUNNING"
      : runState === "won"
      ? "ESCAPED"
      : runState === "caught"
      ? "CAUGHT"
      : "TIME OUT";

  const canAct = runState === "running" && !currentEvent;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "radial-gradient(circle at 20% 10%, #222 0%, #0b0b0b 55%, #000 100%)",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: 0.2 }}>JAIL ⛓️</h1>
          <div style={{ opacity: 0.9 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>STATUS</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{statusLabel}</div>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 14,
          }}
        >
          {/* Left: main */}
          <section
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              padding: 16,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>TIME WINDOW</div>
                <div style={{ fontSize: 34, fontWeight: 800 }}>
                  {mm}:{fmt2(ss)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {runState === "ready" && (
                  <button
                    onClick={startRun}
                    style={btnPrimary}
                  >
                    Start Escape Run
                  </button>
                )}
                {(runState === "won" || runState === "caught" || runState === "timeout") && (
                  <button
                    onClick={hardReset}
                    style={btnPrimary}
                  >
                    Restart
                  </button>
                )}
                <Link href="/" style={btnGhost}>
                  Home
                </Link>
              </div>
            </div>

            {/* bars */}
            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <Bar label="HP" value={snap.hp} />
              <Bar label="Stamina" value={snap.stamina} />
              <Bar label="Suspicion" value={snap.suspicion} danger />
            </div>

            {/* inventory */}
            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Pill label="Keys" value={snap.keys} />
              <Pill label="Shiv" value={snap.shiv} />
              <Pill label="Coin" value={snap.coin} />
              <Pill label="XP" value={snap.xp} />
            </div>

            {/* event modal-ish */}
            {currentEvent && runState === "running" && (
              <div
                style={{
                  marginTop: 14,
                  borderRadius: 14,
                  padding: 14,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(0,0,0,0.55)",
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.8 }}>EVENT</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{currentEvent.title}</div>
                <p style={{ marginTop: 6, marginBottom: 12, opacity: 0.9 }}>{currentEvent.desc}</p>
                <button onClick={resolveEvent} style={btnPrimary}>
                  Take it
                </button>
              </div>
            )}

            {/* actions */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>ACTIONS</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button disabled={!canAct} onClick={actionSneak} style={btnSecondary(canAct)}>
                  Sneak
                </button>
                <button disabled={!canAct} onClick={actionSearch} style={btnSecondary(canAct)}>
                  Search
                </button>
                <button disabled={!canAct} onClick={actionFight} style={btnSecondary(canAct)}>
                  Fight
                </button>
                <button disabled={runState !== "running"} onClick={actionEscape} style={btnDanger(runState === "running")}>
                  Escape
                </button>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                Win condition: <b>get a key</b> + hit <b>Escape</b> before time runs out.
              </div>
            </div>
          </section>

          {/* Right: log */}
          <aside
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              padding: 16,
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>Jail Log</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>latest first</div>
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {log.map((l, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 10,
                    padding: 10,
                    background: "rgba(0,0,0,0.35)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontSize: 13,
                    lineHeight: 1.3,
                  }}
                >
                  {l}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, fontSize: 12, opacity: 0.75 }}>
              Next we’ll add: guard patrols, loot tiers, “Michael Jackson horror” vibe events, and a real escape route map.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Bar({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.85 }}>
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 999,
          overflow: "hidden",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${clamp(value, 0, 100)}%`,
            background: danger ? "linear-gradient(90deg, #ff2d55, #ff8a00)" : "linear-gradient(90deg, #2dd4ff, #22c55e)",
          }}
        />
      </div>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: "8px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(0,0,0,0.35)",
        fontSize: 12,
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}
    >
      <span style={{ opacity: 0.75 }}>{label}</span>
      <span style={{ fontWeight: 800 }}>{value}</span>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.14)",
  color: "#fff",
  padding: "10px 12px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 800,
};

const btnGhost: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  background: "transparent",
  color: "#fff",
  padding: "10px 12px",
  borderRadius: 12,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  opacity: 0.9,
};

const btnSecondary = (enabled: boolean): React.CSSProperties => ({
  border: "1px solid rgba(255,255,255,0.14)",
  background: enabled ? "rgba(0,0,0,0.28)" : "rgba(0,0,0,0.18)",
  color: "#fff",
  padding: "10px 12px",
  borderRadius: 12,
  cursor: enabled ? "pointer" : "not-allowed",
  fontWeight: 800,
  opacity: enabled ? 1 : 0.55,
});

const btnDanger = (enabled: boolean): React.CSSProperties => ({
  border: "1px solid rgba(255,45,85,0.35)",
  background: enabled ? "rgba(255,45,85,0.18)" : "rgba(255,45,85,0.10)",
  color: "#fff",
  padding: "10px 12px",
  borderRadius: 12,
  cursor: enabled ? "pointer" : "not-allowed",
  fontWeight: 900,
  opacity: enabled ? 1 : 0.55,
});
