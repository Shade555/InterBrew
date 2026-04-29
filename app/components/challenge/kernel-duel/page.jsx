"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Zap, Trophy, Globe, Server, ShieldCheck, Activity, AlertCircle, Users, Loader2, Plus, Wifi } from "lucide-react";

const MONO = "'JetBrains Mono', 'Fira Mono', monospace";
const XP_REWARD = 150;

const KEYMAP = {
  P1: { A: "1", B: "2", C: "3" },
  P2: { A: "8", B: "9", C: "0" },
};

function generateHostName() {
  return `Node_${Math.floor(Math.random() * 9000) + 1000}`;
}

function generatePresenceKey() {
  return `u-${Math.random().toString(36).slice(2)}`;
}

function HostNameChip({ label, value, icon, accent }) {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 14px",
      borderRadius: 999,
      background: "rgba(255,255,255,.04)",
      border: "1px solid rgba(255,255,255,.08)",
      color: accent || "#FFF",
      fontFamily: MONO,
      fontSize: 10,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: ".18em",
    }}>
      {icon}
      <span>{label}</span>
      <span style={{ color: "rgba(255,255,255,.6)" }}>{value}</span>
    </div>
  );
}

function LobbyScreen({ rooms, onCreate, onJoin }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at 20% 20%, rgba(59,130,246,.12), transparent 18%), radial-gradient(circle at 80% 15%, rgba(34,197,94,.1), transparent 20%), #080808",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "34px 20px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* BACKGROUND DECOR (non-blocking) */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ width: "100%", maxWidth: 760, zIndex: 10, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,.25)", letterSpacing: ".4em", textTransform: "uppercase", marginBottom: 12 }}>
            {"// kernel-duel protocol"}
          </p>
          <h1 style={{ fontFamily: MONO, fontSize: 42, fontWeight: 700, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "-.02em", margin: 0 }}>
            Net_Duel Arena
          </h1>
          <p style={{ fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,.45)", marginTop: 10, maxWidth: 560, marginInline: "auto", lineHeight: 1.7 }}>
            Establish a secure connection and battle a rival node in a fast-paced command duel.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginBottom: 24 }}>
          <HostNameChip label="Active nodes" value={`${rooms.length}`} icon={<Wifi size={14} />} accent="#38bdf8" />
          <HostNameChip label="Protocol" value="UDP-Proxy" icon={<Globe size={14} />} accent="#22c55e" />
          <HostNameChip label="Latency" value="24ms" icon={<Server size={14} />} accent="#7c3aed" />
          <HostNameChip label="Match type" value="1v1" icon={<Users size={14} />} accent="#f97316" />
        </div>

        <div style={{ background: "#0e0e0e", border: "1px solid rgba(255,255,255,.07)", borderRadius: 26, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <p style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,.35)", letterSpacing: ".3em", textTransform: "uppercase" }}>
              available hubs
            </p>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); onCreate(); }} 
              style={{ 
                zIndex: 50,
                position: "relative",
                pointerEvents: "auto",
                display: "inline-flex", 
                alignItems: "center", 
                gap: 8, 
                padding: "10px 18px", 
                borderRadius: 14, 
                border: "none", 
                background: "#fff", 
                color: "#000", 
                fontFamily: MONO, 
                fontSize: 10, 
                fontWeight: 700, 
                textTransform: "uppercase", 
                letterSpacing: ".15em", 
                cursor: "pointer" 
              }}>
              <Plus size={14} /> create node
            </button>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {rooms.length === 0 ? (
              <div style={{ padding: "32px 0", textAlign: "center", color: "rgba(255,255,255,.3)", fontFamily: MONO, textTransform: "uppercase", letterSpacing: ".3em", fontSize: 10 }}>
                no active nodes found
              </div>
            ) : rooms.map(room => (
              <div key={room.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: 18, background: "rgba(255,255,255,.02)" }}>
                <div>
                  <p style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: "#e5e7eb", textTransform: "uppercase", marginBottom: 4 }}>{room.host_name}</p>
                  <p style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,.35)", textTransform: "uppercase" }}>stable // 24ms</p>
                </div>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onJoin(room.id); }} 
                  style={{ 
                    zIndex: 50,
                    position: "relative",
                    pointerEvents: "auto",
                    padding: "10px 22px", 
                    borderRadius: 12, 
                    border: "none", 
                    background: "#1d4ed8", 
                    color: "#fff", 
                    fontFamily: MONO, 
                    fontSize: 9, 
                    fontWeight: 700, 
                    textTransform: "uppercase", 
                    letterSpacing: ".1em", 
                    cursor: "pointer" 
                  }}>
                  connect
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RopeRibbon({ position }) {
  const danger = position < 20 || position > 80;
  return (
    <div style={{ width: "100%", maxWidth: 760, position: "relative", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
        <div>
          <p style={{ fontFamily: MONO, fontSize: 9, color: "#3b82f6", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".2em", marginBottom: 5 }}>P2 — Guest</p>
          <p style={{ fontFamily: MONO, fontSize: 32, fontWeight: 700, color: "#fff" }}>{String(Math.round(position / 10)).padStart(2, "0")}<span style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginLeft: 6 }}>pts</span></p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: MONO, fontSize: 9, color: "#22c55e", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".2em", marginBottom: 5 }}>P1 — Master</p>
          <p style={{ fontFamily: MONO, fontSize: 32, fontWeight: 700, color: "#fff" }}>{String(Math.round((100 - position) / 10)).padStart(2, "0")}<span style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginLeft: 6 }}>pts</span></p>
        </div>
      </div>

      <div style={{ position: "relative", height: 72, display: "flex", alignItems: "center" }}>
        <div style={{ width: "100%", height: 18, borderRadius: 999, background: "#06070a", border: "1px solid rgba(255,255,255,.12)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${position}%`, background: "linear-gradient(90deg, rgba(34,197,94,.95), rgba(59,130,246,.95))", transition: "width .25s ease" }} />
        </div>
        <div style={{ position: "absolute", left: `${position}%`, top: "50%", transform: "translate(-50%, -50%)", transition: "left .25s ease", zIndex: 10 }}>
          <div style={{ width: 50, height: 50, borderRadius: 18, background: "rgba(15,23,42,.98)", border: danger ? "1px solid rgba(248,113,113,.3)" : "1px solid rgba(255,255,255,.14)", display: "grid", placeItems: "center" }}>
            <Zap size={20} color="#e2e8f0" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionTerminal({ question, currentQ, role, onAnswer }) {
  const keys = KEYMAP[role] || KEYMAP.P1;
  return (
    <div style={{ width: "100%", maxWidth: 760, background: "#0e0e0e", border: "1px solid rgba(255,255,255,.08)", borderRadius: 30, padding: 28, position: "relative" }}>
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,.25)", textTransform: "uppercase", letterSpacing: ".3em", marginBottom: 10 }}>
          {`// challenge_${String(currentQ + 1).padStart(2, "0")}`}
        </p>
        <h2 style={{ fontFamily: MONO, fontSize: 18, color: "#f8fafc", lineHeight: 1.55, margin: 0 }}>
          {question?.q || "Syncing buffer..."}
        </h2>
        <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,.44)", marginTop: 12, letterSpacing: ".18em", textTransform: "uppercase" }}>
          Tap an option below to send your move.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
        {question && Object.entries(question.options).map(([key, value]) => (
          <button
            key={key}
            type="button"
            onClick={() => onAnswer(key)}
            style={{
              background: "#161616",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 20,
              padding: 20,
              minHeight: 120,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              color: "#fff",
              cursor: "pointer",
              textAlign: "center",
              transition: "transform .15s ease, border-color .15s ease, background .15s ease",
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(165,180,252,1)", textTransform: "uppercase", letterSpacing: ".18em", background: "rgba(165,180,252,.08)", padding: "6px 12px", borderRadius: 999 }}>{`KEY_${keys[key]}`}</span>
            <span style={{ fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,.9)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>{value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EndOverlay({ won, syncing, onRestart }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.92)", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      {won ? (
        <>
          <Trophy size={88} color="#facc15" style={{ marginBottom: 26 }} />
          <h1 style={{ fontFamily: MONO, fontSize: 62, color: "#fff", fontWeight: 800, textTransform: "uppercase", letterSpacing: "-.03em", margin: 0 }}>Winner</h1>
          <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".35em", marginTop: 12 }}>{syncing ? "syncing_xp..." : "secure link established"}</p>
        </>
      ) : (
        <>
          <AlertCircle size={88} color="#ef4444" style={{ marginBottom: 26 }} />
          <h1 style={{ fontFamily: MONO, fontSize: 62, color: "#fff", fontWeight: 800, textTransform: "uppercase", letterSpacing: "-.03em", margin: 0 }}>Failed</h1>
          <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".35em", marginTop: 12 }}>{syncing ? "reconnecting..." : "signal disconnected"}</p>
        </>
      )}
      <button 
        type="button"
        onClick={(e) => { e.stopPropagation(); onRestart(); }} 
        style={{ 
          zIndex: 110,
          position: "relative",
          marginTop: 38, 
          padding: "14px 44px", 
          borderRadius: 14, 
          border: "none", 
          background: "#fff", 
          color: "#000", 
          fontFamily: MONO, 
          fontWeight: 700, 
          textTransform: "uppercase", 
          letterSpacing: ".2em", 
          cursor: "pointer" 
        }}>
        Return_To_Lobby
      </button>
    </div>
  );
}

export default function KernelDuel() {
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [bufferPos, setBufferPos] = useState(50);
  const [gameState, setGameState] = useState("browser");
  const [activeRooms, setActiveRooms] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [winner, setWinner] = useState(null);
  const [syncingXP, setSyncingXP] = useState(false);

  const bufferRef = useRef(50);
  const qRef = useRef(0);
  const questionsRef = useRef([]);
  const channelRef = useRef(null);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  async function fetchRooms() {
    const { data } = await supabase.from("duel_rooms").select("*").eq("status", "waiting").order("created_at", { ascending: false });
    if (data) setActiveRooms(data);
  }

  useEffect(() => {
    const loadData = async () => {
      const { data } = await supabase.from("os_challenges_tasks").select("*").eq("category", "protocol-fall");
      if (data) setQuestions(data.map(item => ({ q: item.task_description, options: item.options_json, ans: item.correct_command })));
      setLoading(false);
    };

    const initialize = async () => {
      await loadData();
      await fetchRooms();
    };

    initialize();
    const interval = setInterval(fetchRooms, 3000);
    return () => clearInterval(interval);
  }, []);

  async function createServer() {
    const { data, error } = await supabase.from("duel_rooms").insert([{ host_name: generateHostName(), status: "waiting" }]).select();
    if (error) return alert(error.message);
    if (data?.[0]) {
      setRole("P1");
      setGameState("lobby");
      initializeRealtime(data[0].id, "P1");
    }
  }

  async function joinServer(roomId) {
    setRole("P2");
    setGameState("playing");
    await supabase.from("duel_rooms").update({ status: "playing" }).eq("id", roomId);
    initializeRealtime(roomId, "P2");
  }

  function submitAnswer(optionKey) {
    if (gameState !== "playing") return;
    const currentQuestion = questionsRef.current[qRef.current];
    if (!currentQuestion) return;

    const mapping = role === "P1" ? KEYMAP.P1 : KEYMAP.P2;
    const answer = mapping[optionKey];
    if (!answer) return;

    const delta = answer === currentQuestion.ans ? (role === "P1" ? -8 : 8) : (role === "P1" ? 6 : -6);
    const nextPos = Math.max(0, Math.min(100, bufferRef.current + delta));

    if (channelRef.current?.channel) {
      channelRef.current.channel.send({
        type: "broadcast",
        event: "MOVE_SIGNAL",
        payload: { newPos: nextPos, nextQ: (qRef.current + 1) % questionsRef.current.length },
      });
    }
  }

  function initializeRealtime(roomId, playerRole) {
    const channel = supabase.channel(`room_${roomId}`, { config: { presence: { key: generatePresenceKey() }, broadcast: { self: true } } });

    channel.on("presence", { event: "sync" }, () => {
      const users = Object.values(channel.presenceState()).flat();
      if (users.length >= 2 && playerRole === "P1" && gameState !== "playing") {
        setGameState("playing");
      }
    });

    channel.on("broadcast", { event: "MOVE_SIGNAL" }, ({ payload }) => {
      setBufferPos(payload.newPos);
      setCurrentQ(payload.nextQ);
      bufferRef.current = payload.newPos;
      qRef.current = payload.nextQ;
      if (payload.newPos >= 100) handleWin("PLAYER_1");
      if (payload.newPos <= 0) handleWin("PLAYER_2");
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") await channel.track({ online_at: new Date().toISOString() });
    });

    const keyHandler = (e) => {
      const currentQuestion = questionsRef.current[qRef.current];
      if (!currentQuestion) return;
      const mapping = playerRole === "P1" ? KEYMAP.P1 : KEYMAP.P2;
      const answer = mapping[e.key];
      if (!answer) return;
      const delta = answer === currentQuestion.ans ? (playerRole === "P1" ? -8 : 8) : (playerRole === "P1" ? 6 : -6);
      const nextPos = Math.max(0, Math.min(100, bufferRef.current + delta));
      channel.send({ type: "broadcast", event: "MOVE_SIGNAL", payload: { newPos: nextPos, nextQ: (qRef.current + 1) % questionsRef.current.length } });
    };

    window.addEventListener("keydown", keyHandler);
    channelRef.current = { channel, keyHandler };
  }

  useEffect(() => {
    return () => {
      if (channelRef.current) {
        const { channel, keyHandler } = channelRef.current;
        window.removeEventListener("keydown", keyHandler);
        channel.unsubscribe();
      }
    };
  }, []);

  const handleWin = async (winnerId) => {
    setWinner(winnerId);
    setGameState("ended");
    const won = (winnerId === "PLAYER_1" && role === "P1") || (winnerId === "PLAYER_2" && role === "P2");
    if (!won) return;
    setSyncingXP(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("leaderboard").select("xp").eq("user_id", user.id).single();
      const newXp = (profile?.xp || 0) + XP_REWARD;
      await supabase.from("leaderboard").upsert(
        { user_id: user.id, xp: newXp, updated_at: new Date().toISOString() },
        { onConflict: ["user_id"] }
      );
    }
    setSyncingXP(false);
  };

  if (loading) return <div style={{ height: "100vh", background: "#080808" }} />;

  if (gameState === "browser") {
    return <LobbyScreen rooms={activeRooms} onCreate={createServer} onJoin={joinServer} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#fff", fontFamily: MONO, padding: "24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 18% 18%, rgba(59,130,246,.14), transparent 18%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 28, padding: "16px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ShieldCheck size={16} color={role === "P1" ? "#22c55e" : "#3b82f6"} />
            <div style={{ fontSize: 12, fontWeight: 800 }}>{role === "P1" ? "MASTER NODE" : "GUEST NODE"}</div>
          </div>
          <Activity size={16} color="#f97316" className="animate-pulse" />
        </div>
        <RopeRibbon position={bufferPos} />
        <QuestionTerminal question={questions[currentQ]} currentQ={currentQ} role={role} onAnswer={submitAnswer} />
      </div>

      {gameState === "lobby" && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.92)", zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <Loader2 size={64} color="#3b82f6" className="animate-spin" />
          <h2 style={{ fontSize: 40, marginTop: 20 }}>BROADCASTING...</h2>
        </div>
      )}

      {gameState === "ended" && <EndOverlay won={winner === (role === "P1" ? "PLAYER_1" : "PLAYER_2")} syncing={syncingXP} onRestart={() => window.location.reload()} />}
    </div>
  );
}