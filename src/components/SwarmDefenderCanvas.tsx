"use client";
import { useEffect, useRef, useState } from "react";
import { SwarmDefender } from "@/lib/swarm/SwarmDefender";
import { TelemetryCollector } from "@/lib/telemetry/TelemetryCollector";
import TelemetryDashboard from "@/components/TelemetryDashboard";

export default function SwarmDefenderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<SwarmDefender | null>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const [telemetryCollector] = useState(() => new TelemetryCollector());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize game
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameRef.current = new SwarmDefender(canvas, telemetryCollector);

    // Handle resize
    const handleResize = () => {
      if (canvas && gameRef.current) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gameRef.current.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    // Game loop
    const gameLoop = (timestamp: number) => {
      animationRef.current = requestAnimationFrame(gameLoop);

      const deltaTime = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = timestamp;

      if (gameRef.current) {
        gameRef.current.update(Math.min(deltaTime, 0.1)); // Cap delta time
        gameRef.current.render();
        telemetryCollector.updateFrameRate();
      }
    };

    // Start game loop
    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [telemetryCollector]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          cursor: 'crosshair'
        }}
      />
      
      {/* Minimized Game Info - Bottom Center */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '0.5rem 1rem',
        fontSize: '10px',
        fontFamily: 'JetBrains Mono, monospace',
        color: '#fff',
        zIndex: 5,
        display: 'flex',
        gap: '2rem',
        alignItems: 'center',
        borderRadius: '4px',
        pointerEvents: 'none'
      }}>
        <div style={{ fontWeight: 'bold' }}>SWARM DEFENDER</div>
        <div style={{ opacity: 0.7 }}>
          Click: Select • Right-Click: Rally All • Space: Pause
        </div>
        <div style={{ opacity: 0.7 }}>
          <span style={{ color: '#22c55e' }}>●</span> Scout
          <span style={{ color: '#a855f7', marginLeft: '0.5rem' }}>●</span> Defender
          <span style={{ color: '#3b82f6', marginLeft: '0.5rem' }}>●</span> Collector
        </div>
      </div>
      
      {/* Telemetry Dashboard */}
      <TelemetryDashboard telemetryCollector={telemetryCollector} />
    </>
  );
}