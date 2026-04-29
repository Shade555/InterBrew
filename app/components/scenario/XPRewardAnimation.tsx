"use client";

import { useEffect, useRef, useState } from "react";
import { Zap } from "lucide-react";

interface Props {
  xpAmount: number;
  onDone: () => void;
}

const COLORS = ["#10b981", "#059669", "#047857", "#34d399", "#6ee7b7", "#10b981"];

export default function XPRewardAnimation({ xpAmount, onDone }: Props) {
  const [phase, setPhase] = useState<"pop" | "hold" | "fade">("pop");
  const [particles, setParticles] = useState<any[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const xpRef = useRef<HTMLDivElement>(null);

  // Play success sound
  useEffect(() => {
    const audio = new Audio("/correct.mp3");
    audio.volume = 0.7;
    audio.play().catch(() => {});
  }, []);

  // Spawn particles
  useEffect(() => {
    const count = 80;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const newParticles = Array.from({ length: count }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 6;
      return {
        id: i,
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 5 + Math.random() * 6,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      };
    });
    particlesRef.current = newParticles;
    setParticles(newParticles);
  }, []);

  // Canvas animation
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
          vy: p.vy + 0.2,
          vx: p.vx * 0.98,
          rotation: p.rotation + p.rotationSpeed,
          opacity: p.opacity - 0.015,
        }))
        .filter((p) => p.opacity > 0);

      for (const p of particlesRef.current) {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }

      if (particlesRef.current.length > 0) {
        animFrameRef.current = requestAnimationFrame(draw);
      }
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Phase transitions
  useEffect(() => {
    const timings = [
      { phase: "pop" as const, duration: 400 },
      { phase: "hold" as const, duration: 1200 },
      { phase: "fade" as const, duration: 600 },
    ];

    let elapsed = 0;
    let currentPhaseIdx = 0;

    const interval = setInterval(() => {
      elapsed += 50;
      while (
        currentPhaseIdx < timings.length &&
        elapsed >= timings.slice(0, currentPhaseIdx + 1).reduce((a, b) => a + b.duration, 0)
      ) {
        currentPhaseIdx++;
      }

      if (currentPhaseIdx < timings.length) {
        setPhase(timings[currentPhaseIdx].phase);
      } else {
        clearInterval(interval);
        onDone();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          ref={xpRef}
          className={`flex flex-col items-center gap-3 transition-all duration-500 transform ${
            phase === "pop"
              ? "scale-100 opacity-100"
              : phase === "hold"
                ? "scale-100 opacity-100"
                : "scale-110 opacity-0"
          }`}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400/30 blur-xl rounded-full scale-150" />
            <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full p-6 border-4 border-emerald-200 shadow-2xl shadow-emerald-500/50">
              <Zap className="w-16 h-16 text-white drop-shadow-lg" />
            </div>
          </div>

          <div className="text-center">
            <div className="text-6xl font-black text-emerald-300 drop-shadow-lg">
              +{xpAmount}
            </div>
            <div className="text-xl font-bold text-emerald-200 drop-shadow-lg mt-2">
              XP Earned!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
