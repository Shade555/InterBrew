"use client";
import React, { useEffect, useRef, useState } from "react";

export default function OrbVisualization({
  isListening,
  isThinking,
}: {
  isListening: boolean;
  isThinking: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const audioDataRef = useRef<number>(0);

  useEffect(() => {
    let animationFrame: number;
    let targetScale = 1;

    const animate = () => {
      if (isListening || isThinking) {
        // Pulsing effect for listening
        targetScale = isListening 
          ? 1 + Math.sin(Date.now() / 200) * 0.15 
          : 1 + Math.sin(Date.now() / 300) * 0.1;
      } else {
        // Return to normal when idle
        targetScale = 1;
      }

      setScale((prev) => prev + (targetScale - prev) * 0.1);
      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [isListening, isThinking]);

  return (
    <>
      <style>{`
        .orb-container {
          position: relative;
          width: 200px;
          height: 200px;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          border-radius: 50%;
          rotate: 90deg;
          cursor: pointer;
          filter: ${
            isListening
              ? "drop-shadow(0 0 12px #10b98188) drop-shadow(0 0 20px #34d39988)"
              : isThinking
              ? "drop-shadow(0 0 10px #10b98166) drop-shadow(0 0 15px #6ee7b766)"
              : "drop-shadow(0 0 6px #10b98144) drop-shadow(0 0 6px #6ee7b744)"
          };
          transition: all 0.3s ease;
          transform: scale(${scale});
        }

        .orb {
          position: absolute;
          width: 200px;
          aspect-ratio: 1;
          border-radius: 50%;
          background: #060606;
          filter: blur(24px);
          transition: all 0.3s ease;
        }

        .orb-container.listening .orb {
          width: 220px;
          animation: rotate 6s infinite;
        }

        .orb-container.thinking .orb {
          width: 210px;
          animation: rotate 8s infinite;
        }

        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .orb-inner {
          position: absolute;
          left: -120%;
          top: -25%;
          width: 160%;
          aspect-ratio: 1;
          border-radius: 50%;
          animation: rotate 6s linear infinite;
          transition: all 0.3s ease;
          clip-path: polygon(
            50% 0%,
            61% 35%,
            98% 35%,
            68% 57%,
            79% 91%,
            50% 70%,
            21% 91%,
            32% 57%,
            2% 35%,
            39% 35%
          );
        }

        .orb-inner:nth-child(1) {
          background: linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%);
        }

        .orb-inner:nth-child(2) {
          left: auto;
          right: -120%;
          top: auto;
          bottom: -25%;
          background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
          animation-duration: 8s;
          clip-path: polygon(
            20% 0%,
            0% 20%,
            30% 50%,
            0% 80%,
            20% 100%,
            50% 70%,
            80% 100%,
            100% 80%,
            70% 50%,
            100% 20%,
            80% 0%,
            50% 30%
          );
        }

        .orb-container.listening .orb-inner,
        .orb-container.thinking .orb-inner {
          width: 170%;
        }

        .orb-container.listening::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%);
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>

      <div
        ref={containerRef}
        className={`orb-container ${isListening ? "listening" : ""} ${
          isThinking ? "thinking" : ""
        }`}
      >
        <div className="orb">
          <div className="orb-inner"></div>
          <div className="orb-inner"></div>
        </div>
      </div>
    </>
  );
}
