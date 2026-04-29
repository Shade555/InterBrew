"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: "rect" | "circle" | "star";
}

interface Props {
  badgeIcon: string;
  badgeName: string;
  onDone: () => void;
}

const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6", "#f97316", "#06b6d4", "#84cc16"];

export default function BadgeUnlockAnimation({ badgeIcon, badgeName, onDone }: Props) {
  const [phase, setPhase] = useState<"pop" | "hold" | "fly" | "done">("pop");
  const [particles, setParticles] = useState<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const [badgeStyle, setBadgeStyle] = useState<React.CSSProperties>({});

  // Play sound on mount
  useEffect(() => {
    const audio = new Audio("/correct.mp3");
    audio.volume = 0.7;
    audio.play().catch(() => {});
  }, []);

  // Spawn confetti particles
  useEffect(() => {
    const count = 120;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      return {
        id: i,
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        shape: (["rect", "circle", "star"] as const)[Math.floor(Math.random() * 3)],
      };
    });
    particlesRef.current = newParticles;
    setParticles(newParticles);
  }, []);

  // Animate confetti on canvas
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
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.25,
          vx: p.vx * 0.99,
          rotation: p.rotation + p.rotationSpeed,
          opacity: p.opacity - 0.012,
        }))
        .filter((p) => p.opacity > 0);

      for (const p of particlesRef.current) {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // star
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const r = i % 2 === 0 ? p.size / 2 : p.size / 4;
            ctx[i === 0 ? "moveTo" : "lineTo"](Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      if (particlesRef.current.length > 0) {
        animFrameRef.current = requestAnimationFrame(draw);
      }
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, []);

  // Phase transitions
  useEffect(() => {
    // pop → hold after 600ms
    const t1 = setTimeout(() => setPhase("hold"), 600);
    // hold → fly after 2s
    const t2 = setTimeout(() => setPhase("fly"), 2200);
    // fly → done after animation completes
    const t3 = setTimeout(() => { setPhase("done"); onDone(); }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  // Compute fly-to target (profile button top-right)
  useEffect(() => {
    if (phase === "fly") {
      // Profile button is roughly at top-right: ~48px from right, ~40px from top
      const targetX = window.innerWidth - 52;
      const targetY = 40;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setBadgeStyle({
        transform: `translate(${targetX - centerX}px, ${targetY - centerY}px) scale(0.15)`,
        opacity: 0,
        transition: "transform 0.7s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease 0.4s",
      });
    }
  }, [phase]);

  if (phase === "done") return null;

  const badgeVisible = phase === "pop" || phase === "hold" || phase === "fly";

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Confetti canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Backdrop */}
      {(phase === "pop" || phase === "hold") && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      )}

      {/* Badge */}
      {badgeVisible && (
        <div
          ref={badgeRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3"
          style={phase === "fly" ? badgeStyle : undefined}
        >
          <div
            className="relative"
            style={{
              animation: phase === "pop" ? "badgePop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards" : undefined,
            }}
          >
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-2xl scale-150" />
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-amber-400/20 to-yellow-600/20 border-2 border-amber-400/60 flex items-center justify-center shadow-2xl shadow-amber-500/40">
              <img src={badgeIcon} alt={badgeName} className="w-20 h-20 object-contain drop-shadow-lg" />
            </div>
          </div>

          {phase !== "fly" && (
            <div className="text-center" style={{ animation: "fadeInUp 0.4s ease 0.3s both" }}>
              <div className="text-amber-300 text-xs font-semibold uppercase tracking-widest mb-1">Badge Unlocked!</div>
              <div className="text-white text-lg font-bold">{badgeName}</div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes badgePop {
          0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
