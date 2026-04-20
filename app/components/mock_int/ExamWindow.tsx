"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSpeech } from "./useSpeech";
import { supabase } from "../../../lib/supabaseClient";
import tryIncrementStreak from "../../../lib/streak";
import OrbVisualization from "./OrbVisualization";

function logTtsError(e: any) {
  try {
    const msg = e?.message ?? String(e);
    if (/interrupt|interrupted|cancel|aborted?/i.test(msg)) return;
    console.error("TTS error:", msg);
  } catch (err) {
    console.error("TTS error:", err);
  }
}

// Spherical speech visualization component with advanced animation
function SpeechVisualization({ isListening, isThinking }: { isListening: boolean; isThinking: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const audioDataRef = useRef<number[]>(Array(24).fill(0));
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; size: number }>>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = 65;

    const animate = () => {
      timeRef.current += 0.016; // ~60fps

      // Clear canvas with subtle trail
      ctx.fillStyle = "rgba(10, 10, 10, 0.15)";
      ctx.fillRect(0, 0, width, height);

      // Update audio data
      if (isListening || isThinking) {
        audioDataRef.current = audioDataRef.current.map((v, i) => {
          const target = isListening ? Math.random() * 0.85 + 0.15 : Math.sin(timeRef.current * 2 + i * 0.3) * 0.3 + 0.3;
          return v + (target - v) * 0.12;
        });

        // Add particles when active
        if (Math.random() > 0.6) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 2;
          particlesRef.current.push({
            x: centerX + Math.cos(angle) * baseRadius,
            y: centerY + Math.sin(angle) * baseRadius,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            size: Math.random() * 2 + 1,
          });
        }
      } else {
        audioDataRef.current = audioDataRef.current.map(v => v * 0.93);
      }

      // Limit particles
      if (particlesRef.current.length > 80) {
        particlesRef.current = particlesRef.current.slice(-60);
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life *= 0.96;
        p.vx *= 0.98;
        p.vy *= 0.98;

        const color = isListening ? `rgba(16, 185, 129, ${p.life * 0.6})` : `rgba(59, 130, 246, ${p.life * 0.5})`;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw multiple concentric rings
      const ringCount = 3;
      for (let ring = 0; ring < ringCount; ring++) {
        const ringRadius = baseRadius + ring * 25;
        const rotation = timeRef.current * (0.3 - ring * 0.05);
        const segments = 24;

        // Pulsing rings
        const pulseFactor = Math.sin(timeRef.current * 2 + ring * 0.5) * 0.15 + 0.85;
        const ringOpacity = (1 - ring * 0.3) * (isListening || isThinking ? 0.4 : 0.2) * pulseFactor;

        ctx.strokeStyle = isListening 
          ? `rgba(16, 185, 129, ${ringOpacity})` 
          : isThinking 
            ? `rgba(59, 130, 246, ${ringOpacity})` 
            : `rgba(107, 114, 128, ${ringOpacity})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI * 2 + rotation;
          const x = centerX + Math.cos(angle) * ringRadius;
          const y = centerY + Math.sin(angle) * ringRadius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Draw outer glow with enhanced effect
      const glowGradient = ctx.createRadialGradient(centerX, centerY, baseRadius - 15, centerX, centerY, baseRadius + 60);
      if (isListening) {
        glowGradient.addColorStop(0, "rgba(16, 185, 129, 0.6)");
        glowGradient.addColorStop(0.5, "rgba(16, 185, 129, 0.15)");
        glowGradient.addColorStop(1, "rgba(16, 185, 129, 0)");
      } else if (isThinking) {
        glowGradient.addColorStop(0, "rgba(59, 130, 246, 0.5)");
        glowGradient.addColorStop(0.5, "rgba(59, 130, 246, 0.1)");
        glowGradient.addColorStop(1, "rgba(59, 130, 246, 0)");
      } else {
        glowGradient.addColorStop(0, "rgba(107, 114, 128, 0.3)");
        glowGradient.addColorStop(0.5, "rgba(107, 114, 128, 0.08)");
        glowGradient.addColorStop(1, "rgba(107, 114, 128, 0)");
      }
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 60, 0, Math.PI * 2);
      ctx.fill();

      // Draw main sphere as a ring (stroke only) with green gradient
      const ringGradient = ctx.createLinearGradient(centerX - baseRadius, centerY, centerX + baseRadius, centerY);
      if (isListening) {
        ringGradient.addColorStop(0, "#10b981");
        ringGradient.addColorStop(0.5, "#34d399");
        ringGradient.addColorStop(1, "#6ee7b7");
      } else if (isThinking) {
        ringGradient.addColorStop(0, "#059669");
        ringGradient.addColorStop(0.5, "#10b981");
        ringGradient.addColorStop(1, "#34d399");
      } else {
        ringGradient.addColorStop(0, "#6ee7b7");
        ringGradient.addColorStop(0.5, "#10b981");
        ringGradient.addColorStop(1, "#047857");
      }
      ctx.strokeStyle = ringGradient;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw vibration waves around sphere
      const numWaves = 24;
      for (let i = 0; i < numWaves; i++) {
        const angle = (i / numWaves) * Math.PI * 2;
        const distance = baseRadius + 20 + audioDataRef.current[i] * 40;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        const waveSize = 3 + audioDataRef.current[i] * 5;
        if (isListening || isThinking) {
          const waveColor = isListening
            ? `rgba(16, 185, 129, ${Math.max(0.2, audioDataRef.current[i] * 0.7)})`
            : `rgba(59, 130, 246, ${Math.max(0.15, audioDataRef.current[i] * 0.6)})`;
          ctx.fillStyle = waveColor;
          ctx.beginPath();
          ctx.arc(x, y, waveSize, 0, Math.PI * 2);
          ctx.fill();

          // Add glow to particles
          ctx.fillStyle = waveColor.replace('0.', '0.') || 'rgba(16, 185, 129, 0.1)';
          ctx.beginPath();
          ctx.arc(x, y, waveSize * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw inner highlights (3D effect)
      const highlight1 = ctx.createRadialGradient(centerX - 22, centerY - 22, 0, centerX - 22, centerY - 22, baseRadius * 0.5);
      highlight1.addColorStop(0, "rgba(255, 255, 255, 0.25)");
      highlight1.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = highlight1;
      ctx.beginPath();
      ctx.arc(centerX - 22, centerY - 22, baseRadius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Subtle rotating ring
      const innerRing = Math.sin(timeRef.current * 1.5) * 0.2 + 0.8;
      ctx.strokeStyle = isListening 
        ? `rgba(16, 185, 129, ${0.3 * innerRing})` 
        : `rgba(107, 114, 128, ${0.2 * innerRing})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.7, 0, Math.PI * 2);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isListening, isThinking]);

  return (
    <canvas
      ref={canvasRef}
      width={350}
      height={350}
      className="w-96 h-96 drop-shadow-2xl"
      style={{
        filter: isListening ? 'drop-shadow(0 0 40px rgba(16, 185, 129, 0.4))' : 'drop-shadow(0 0 30px rgba(107, 114, 128, 0.2))',
      }}
    />
  );
}

export default function ExamWindow({
  difficulty,
  onClose,
  topic,
  moduleId,
}: {
  difficulty: string;
  onClose: () => void;
  topic: string;
  moduleId?: string;
}) {
  const [history, setHistory] = useState<Array<{ role: string; content: string }>>([]);
  const historyRef = useRef<Array<{ role: string; content: string }>>([]);
  const [status, setStatus] = useState("Ready");
  const [questionIndex, setQuestionIndex] = useState(0);
  const finishedRef = useRef(false);
  const systemPromptRef = useRef<string | null>(null);
  const [started, setStarted] = useState(false);
  const [favAdded, setFavAdded] = useState<string[]>([]);
  const awaitingCloseRef = useRef(false);
  const [isThinking, setIsThinking] = useState(false);
  const lastMessageRef = useRef("");
  const preventCloseRef = useRef(true);
  const listeningToggleRef = useRef(false);

  // Tab leave detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && started && !finishedRef.current) {
        // User left tab - end session
        finishedRef.current = true;
        setStatus("Session ended - you left the tab");
        setTimeout(() => {
          onClose?.();
        }, 2000);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (started && !finishedRef.current && preventCloseRef.current) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [started, onClose]);

  const { isListening, startListening, stopListening, speak, stopSpeaking } =
    useSpeech(async (userText: string) => {
      setStatus("Processing...");
      setIsThinking(true);

      try {
        const res = await fetch("/api/mock_int", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userText,
            history: historyRef.current,
            system: systemPromptRef.current,
          }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          console.error("API error:", data.error || res.statusText);
          setStatus("Error: API failed");
          setIsThinking(false);
          setHistory((prev) => {
            const next = [
              ...prev,
              { role: "user", content: userText },
              {
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again.",
              },
            ];
            historyRef.current = next;
            return next;
          });
          return;
        }

        let assistantReplyRaw = data.reply || "";
        let assistantMessage = assistantReplyRaw;
        let isEnd = false || data.isComplete;

        try {
          const parsed = JSON.parse(assistantReplyRaw);
          if (
            parsed &&
            typeof parsed.message === "string" &&
            parsed.message.trim().length > 0
          ) {
            assistantMessage = parsed.message;
            isEnd = !!parsed.end || isEnd;
          }
        } catch (e) {
          const jsonMatch = assistantReplyRaw.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0]);
              if (
                parsed &&
                typeof parsed.message === "string" &&
                parsed.message.trim().length > 20
              ) {
                assistantMessage = parsed.message;
                isEnd = !!parsed.end || isEnd;
              } else {
                const textBeforeJson = assistantReplyRaw
                  .substring(0, jsonMatch.index)
                  .trim();
                if (textBeforeJson.length > 0) {
                  assistantMessage = textBeforeJson;
                } else {
                  assistantMessage = assistantReplyRaw
                    .replace(jsonMatch[0], "")
                    .trim();
                }
                isEnd = parsed && !!parsed.end ? true : isEnd;
              }
            } catch (e2) {}
          }
        }

        if (!assistantMessage || assistantMessage.trim() === "") {
          assistantMessage = "I'm thinking... could you rephrase that?";
        }

        if (!isEnd) {
          const questionMarks = (assistantMessage.match(/\?/g) || []).length;
          if (questionMarks > 1) {
            const firstQ = assistantMessage.indexOf("?");
            assistantMessage = assistantMessage.slice(0, firstQ + 1).trim();
          }
        }

const closingRegex =
          /that concludes the interview|do you have any questions for me|any questions for me|do you have any questions\?/i;
        if (closingRegex.test(assistantMessage)) {
          if (/that concludes the interview/i.test(assistantMessage)) {
            isEnd = true;
          } else {
            awaitingCloseRef.current = true;
          }
        }

        setHistory((prev) => {
          const next = [
            ...prev,
            { role: "user", content: userText },
            { role: "assistant", content: assistantMessage },
          ];
          historyRef.current = next;
          return next;
        });
        lastMessageRef.current = assistantMessage;
        setStatus("Ready");
        setIsThinking(false);

        if (isEnd && !finishedRef.current) {
          if (
            awaitingCloseRef.current &&
            closingRegex.test(assistantMessage)
          ) {
            try {
              speak(assistantMessage).catch((e) => logTtsError(e));
            } catch (e) {
              logTtsError(e);
            }
          } else {
            finishedRef.current = true;
            preventCloseRef.current = false;
            try {
              await speak(assistantMessage);
            } catch (e) {
              logTtsError(e);
            }
            try {
              await tryIncrementStreak();
            } catch (e) {}
            try {
              stopSpeaking?.();
            } catch (e) {}
            
            setStatus("Interview Complete");
            // Show message for 2 seconds before closing
            setTimeout(() => {
              onClose?.();
            }, 2000);
          }
        } else {
          speak(assistantMessage).catch((e) => logTtsError(e));
          if (/\?/m.test(assistantMessage)) setQuestionIndex((q) => q + 1);
        }
      } catch (error) {
        console.error(error);
        setStatus("Error fetching response.");
        setIsThinking(false);
      }
    });

  async function startInterview() {
    setStatus("Starting...");
    setStarted(true);
    preventCloseRef.current = true;
    const sessionToken = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const systemPrompt = `You are a professional Operating Systems interviewer conducting a structured mock interview.

Topic context: ${topic || "Operating Systems"}
Difficulty context: ${difficulty || "Intermediate"}
Interview session token: ${sessionToken}

Opening Rule:
- Start with exactly this sentence: "Hello, lets begin the interview."
- Immediately follow with the first question in the same message.

Core Behavior:
- Maintain a cold, professional, neutral tone.
- Keep interaction natural and human-like, not robotic.
- After each relevant answer, acknowledge briefly with a neutral phrase like "Okay.", "Alright.", or "Great." then move to the next question.
- Keep acknowledgments short and restrained: no strong praise, no sarcasm, no rude wording.

Question Flow Rules:
- Ask one question per turn.
- If interview is based on a single OS section, ask 7 to 10 questions total.
- If interview covers the entire OS syllabus, ask exactly 15 questions total.
- Infer whether this is section-based or full-syllabus from the topic context.
- For every new session, randomize question selection and order within the relevant OS section.
- Do not follow a fixed sequence across sessions for the same section.
- Do not ask the same question twice in one interview.
- Never exceed the selected question limit.
- If the user's reply is irrelevant, state a brief correction and ask the same current question again.
- Only move to the next question after a relevant answer.

Adaptive Behavior:
- If the answer is correct or strong, maintain or slightly increase difficulty.
- If the answer is weak or incorrect, continue without criticism.
- If the user cannot answer, reduce difficulty of the next question.
- If an answer needs an example but lacks one, ask a follow-up specifically requesting an example.

Handling Off-Topic or Useless Input:
- Do not ignore it.
- Use a brief corrective line, varied naturally, such as:
  "Please stay relevant to the question."
  "That response is not related to the question."
  "Focus on the topic being discussed."
- Then repeat the same current question (do not advance).

Interaction Constraints:
- Do not use generic prompts like "Can you elaborate?" or "Tell me more."
- Ask follow-ups only when logically required (for example, missing example).
- Do not entertain irrelevant conversation.

Closing Behavior:
- After the final answer to the last question, respond normally to that answer.
- Then conclude naturally with: "That concludes the interview."
- If the user says something before you send the closing message, respond briefly, then end the interview.

Output Format:
- Return plain conversational text only. Do not output JSON.`;
    systemPromptRef.current = systemPrompt;

    try {
      const res = await fetch("/api/mock_int", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "__start__",
          history: historyRef.current,
          system: systemPromptRef.current,
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        console.error("API error:", data.error || res.statusText);
        setStatus("Error: Failed to start interview");
        return;
      }

      let assistantReplyRaw = data.reply || "";
      let assistantMessage = assistantReplyRaw;
      let isEnd = false || data.isComplete;
      try {
        const parsed = JSON.parse(assistantReplyRaw);
        if (
          parsed &&
          typeof parsed.message === "string" &&
          parsed.message.trim().length > 0
        ) {
          assistantMessage = parsed.message;
          isEnd = !!parsed.end || isEnd;
        }
      } catch (e) {
        const jsonMatch = assistantReplyRaw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (
              parsed &&
              typeof parsed.message === "string" &&
              parsed.message.trim().length > 20
            ) {
              assistantMessage = parsed.message;
              isEnd = !!parsed.end || isEnd;
            } else {
              const textBeforeJson = assistantReplyRaw
                .substring(0, jsonMatch.index)
                .trim();
              if (textBeforeJson.length > 0) {
                assistantMessage = textBeforeJson;
              } else {
                assistantMessage = assistantReplyRaw
                  .replace(jsonMatch[0], "")
                  .trim();
              }
              isEnd = parsed && !!parsed.end ? true : isEnd;
            }
          } catch (e2) {}
        }
      }

      if (!assistantMessage || assistantMessage.trim() === "") {
        assistantMessage = "Hello, and thanks for joining. How are you today?";
      }

      if (!isEnd) {
        const questionMarks = (assistantMessage.match(/\?/g) || []).length;
        if (questionMarks > 1) {
          const firstQ = assistantMessage.indexOf("?");
          assistantMessage = assistantMessage.slice(0, firstQ + 1).trim();
        }
      }
      const closingRegex =
        /that concludes the interview|do you have any questions for me|any questions for me|do you have any questions\?/i;
      if (closingRegex.test(assistantMessage)) {
        if (/that concludes the interview/i.test(assistantMessage)) {
          isEnd = true;
        } else {
          awaitingCloseRef.current = true;
        }
      }

      setHistory((h) => {
        const next = [
          { role: "user", content: "__greeting_request__" },
          { role: "assistant", content: assistantMessage },
        ];
        historyRef.current = next;
        return next;
      });
      lastMessageRef.current = assistantMessage;
      setStatus("Ready");
      if (isEnd && !finishedRef.current) {
        if (
          awaitingCloseRef.current &&
          closingRegex.test(assistantMessage)
        ) {
          try {
            speak(assistantMessage).catch((e) => logTtsError(e));
          } catch (e) {
            logTtsError(e);
          }
        } else {
          finishedRef.current = true;
          preventCloseRef.current = false;
          try {
            await speak(assistantMessage);
          } catch (e) {
            logTtsError(e);
          }
          try {
            await tryIncrementStreak();
          } catch (e) {}
          try {
            stopSpeaking?.();
          } catch (e) {}
          setStatus("Interview Complete");
          setTimeout(() => {
            onClose?.();
          }, 2000);
        }
      } else {
        speak(assistantMessage).catch((e) => logTtsError(e));
      }
    } catch (err) {
      console.error(err);
      setStatus("Error starting interview");
    }
  }

  useEffect(() => {
    return () => {
      try {
        stopSpeaking?.();
      } catch (e) {}
      try {
        stopListening();
      } catch (e) {}
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#0a0a0a] flex flex-col overflow-hidden">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {/* Animated background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-32 w-72 h-72 bg-green-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 left-20 w-96 h-96 bg-emerald-500/3 rounded-full blur-3xl" />
      </div>

      {/* Prevent accidental navigation */}
      <div
        onClick={(e) => e.preventDefault()}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Header */}
      <div className="px-8 py-6 border-b border-emerald-500/20 bg-gradient-to-r from-black/80 via-black/60 to-black/80 backdrop-blur-lg flex items-center justify-between z-10 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Interview Session</h1>
          <p className="text-sm text-emerald-300/70 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            {topic} • {difficulty}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border transition-all ${
            status === "Ready" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50" :
            status === "Processing..." ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50" :
            status === "Interview Complete" ? "bg-emerald-500/30 text-emerald-200 border-emerald-500/60" :
            "bg-red-500/20 text-red-300 border-red-500/50"
          }`}>
            {status}
          </div>
        </div>
      </div>

      {/* Main content with Footer */}
      <div className="flex-1 flex flex-col relative z-5 min-h-0">
        {/* Content area */}
        <div className="flex-1 flex w-full gap-6 p-8 overflow-hidden">
          {/* Left side - Captions panel */}
          <div className="w-1/2 flex flex-col">
            <div className="flex-1 bg-gradient-to-br from-emerald-950/40 to-slate-900/50 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-8 overflow-y-auto hide-scrollbar shadow-2xl flex flex-col">
              <h2 className="text-lg font-semibold text-emerald-300 mb-6 flex-shrink-0">Transcript</h2>
              <div className="space-y-6 flex-1">
                {history.length === 0 ? (
                  <p className="text-emerald-300/50 text-center italic py-12">
                    Waiting to start...
                  </p>
                ) : (
                  history
                    .filter((msg) => msg.content !== "__greeting_request__")
                    .map((msg, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">
                            {msg.role === "user" ? "Your Answer" : "Question"}
                          </p>
                          {msg.role === "assistant" && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                              }}
                              className={`text-lg px-1 py-0.5 rounded transition-colors ${
                                favAdded.includes(msg.content)
                                  ? "text-amber-400"
                                  : "text-emerald-500/40 hover:text-amber-400"
                              }`}
                              aria-label="Add to favourites"
                            >
                              {favAdded.includes(msg.content) ? "★" : "☆"}
                            </button>
                          )}
                        </div>
                        <p className={`text-sm leading-relaxed rounded-lg px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-emerald-500/10 text-emerald-100/90 border border-emerald-500/20"
                            : "bg-slate-500/10 text-slate-100/90 border border-slate-500/20"
                        }`}>
                          {msg.content}
                        </p>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Right side - Sphere & Button */}
          <div className="w-1/2 flex flex-col items-center justify-center gap-12">
            <div className="flex-shrink-0">
              <OrbVisualization isListening={isListening} isThinking={isThinking} />
            </div>

            {!started ? (
              <button
                onClick={() => startInterview()}
                className="px-10 py-4 rounded-full text-white font-bold text-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg shadow-emerald-500/40 transform hover:scale-105 active:scale-95 flex-shrink-0"
              >
                Start Interview
              </button>
            ) : (
              <button
                onClick={() => {
                  if (isListening) {
                    stopListening();
                    return;
                  }
                  try {
                    stopSpeaking?.();
                  } catch (e) {}
                  startListening();
                }}
                className={`px-10 py-4 rounded-full text-white font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg select-none flex-shrink-0 ${
                  isListening
                    ? "bg-red-600 hover:bg-red-700 animate-pulse shadow-red-500/40"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/40"
                }`}
              >
                {isListening ? "Stop Speaking" : "Start Speaking"}
              </button>
            )}
          </div>
        </div>

        {/* Footer - Instructions */}
        <div className="px-8 py-5 border-t border-emerald-500/20 bg-gradient-to-r from-black/80 via-black/60 to-black/80 backdrop-blur-lg text-center flex-shrink-0">
          <p className="text-sm text-emerald-300/70 flex items-center justify-center gap-2">
            {started && !finishedRef.current ? (
              <>
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span>Do not leave this tab. Click the button and speak naturally.</span>
              </>
            ) : !started ? (
              <>
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span>Click "Start Interview" to begin</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span>Interview Complete. You can close this window.</span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
