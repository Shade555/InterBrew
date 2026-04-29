"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  id: number;
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  size: number;
  rotation: number; rotationSpeed: number;
  opacity: number;
  shape: "rect" | "circle" | "star";
}

interface Props {
  certTitle: string;
  onDone: () => void;
}

const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6", "#f97316", "#06b6d4", "#fbbf24"];

export default function CertUnlockAnimation({ certTitle, onDone }: Props) {
  const [phase, setPhase] = useState<"pop" | "hold" | "fly" | "done">("pop");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const [flyStyle, setFlyStyle] = useState<React.CSSProperties>({});

  // Play sound
  useEffect(() => {
    const audio = new Audio("/level-clear.mp3");
    audio.volume = 0.7;
    audio.play().catch(() => {});
  }, []);

  // Spawn confetti
  useEffect(() => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    particlesRef.current = Array.from({ length: 130 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 9;
      return {
        id: i,
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 9,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 14,
        opacity: 1,
        shape: (["rect", "circle", "star"] as const)[Math.floor(Math.random() * 3)],
      };
    });
  }, []);

  // Animate confetti
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current
        .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.28, vx: p.vx * 0.99, rotation: p.rotation + p.rotationSpeed, opacity: p.opacity - 0.011 }))
        .filter(p => p.opacity > 0);

      for (const p of particlesRef.current) {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === "circle") {
          ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const r = i % 2 === 0 ? p.size / 2 : p.size / 4;
            ctx[i === 0 ? "moveTo" : "lineTo"](Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      }
      if (particlesRef.current.length > 0) animFrameRef.current = requestAnimationFrame(draw);
    };
    animFrameRef.current = requestAnimationFrame(draw);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, []);

  // Phase transitions
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 700);
    const t2 = setTimeout(() => setPhase("fly"), 2400);
    const t3 = setTimeout(() => { setPhase("done"); onDone(); }, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  // Fly to profile button
  useEffect(() => {
    if (phase === "fly") {
      const targetX = window.innerWidth - 52;
      const targetY = 40;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setFlyStyle({
        transform: `translate(calc(-50% + ${targetX - cx}px), calc(-50% + ${targetY - cy}px)) scale(0.08)`,
        opacity: 0,
        transition: "transform 0.7s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease 0.3s",
      });
    }
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {(phase === "pop" || phase === "hold") && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      )}

      <div
        className="absolute left-1/2 top-1/2"
        style={phase === "fly" ? flyStyle : { transform: "translate(-50%, -50%)" }}
      >
        {/* Certificate card */}
        <div
          style={{
            animation: phase === "pop" ? "certPop 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards" : undefined,
          }}
          className="relative w-80 rounded-2xl border border-amber-400/40 bg-gradient-to-br from-[#1a1400] via-[#1c1a00] to-[#0f0f0f] p-6 shadow-2xl shadow-amber-500/30"
        >
          {/* Top glow */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center">
              <span className="text-amber-400 text-base">🎓</span>
            </div>
            <div>
              <div className="text-amber-300 text-[10px] font-semibold uppercase tracking-widest">Certificate Earned</div>
              <div className="text-white/50 text-[10px]">InterBrew</div>
            </div>
          </div>

          {/* Title */}
          <div className="text-white font-bold text-lg leading-snug mb-4">{certTitle}</div>

          {/* Decorative bar */}
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500"
              style={{ animation: "certBar 0.8s ease 0.4s both", width: "100%" }}
            />
          </div>

          <div className="text-white/40 text-xs">
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </div>

          {/* Bottom glow */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        </div>
      </div>

      <style>{`
        @keyframes certPop {
          0%   { transform: scale(0.3) translateY(40px); opacity: 0; }
          60%  { transform: scale(1.06) translateY(-4px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes certBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
