"use client";
import { useEffect, useRef, useState } from "react";
import { SwarmManager } from "@/lib/swarm/SwarmManager";
import { GameConfig } from "@/lib/swarm/types";

export default function AdvancedSwarmCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const swarmManagerRef = useRef<SwarmManager | null>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const [isEnabled, setIsEnabled] = useState(true);
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setIsEnabled(false);
      return;
    }

    // Initialize swarm manager with config
    const config: GameConfig = {
      robotCount: 30,
      initialBattery: 100,
      batteryConsumptionRate: 0.1,
      communicationRange: 200,
      sensorNoise: 0.05,
      pheromoneEvaporationRate: 0.02,
      resourceSpawnRate: 0.1,
      missionDifficulty: 1,
      enableEvolution: false,
      enableLearning: false
    };

    swarmManagerRef.current = new SwarmManager(config);
  }, []);

  useEffect(() => {
    if (!isEnabled || !swarmManagerRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      swarmManagerRef.current?.initialize(canvas.width, canvas.height);
      swarmManagerRef.current?.handleResize(canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = (timestamp: number) => {
      animationRef.current = requestAnimationFrame(animate);

      // Calculate delta time in seconds
      const deltaTime = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = timestamp;

      // Limit delta time to prevent large jumps
      const clampedDelta = Math.min(deltaTime, 0.1);

      if (swarmManagerRef.current && ctx) {
        // Update simulation
        swarmManagerRef.current.update(clampedDelta);
        
        // Render
        swarmManagerRef.current.render(ctx);
      }
    };

    const startAnimation = () => {
      if (!animationRef.current) {
        lastTimeRef.current = 0;
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    const stopAnimation = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAnimation();
      } else {
        startAnimation();
      }
    };

    // Start animation after a short delay
    const timeoutId = setTimeout(startAnimation, 500);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Keyboard controls
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 's' || e.key === 'S') {
        setShowStats(prev => !prev);
      }
    };
    window.addEventListener("keypress", handleKeyPress);

    return () => {
      stopAnimation();
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("keypress", handleKeyPress);
      clearTimeout(timeoutId);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -1 }}
        aria-hidden="true"
      />
      {showStats && (
        <div className="fixed bottom-4 right-4 text-xs text-gray-400 pointer-events-none" style={{ zIndex: 10 }}>
          Press 'S' to toggle stats
        </div>
      )}
    </>
  );
}