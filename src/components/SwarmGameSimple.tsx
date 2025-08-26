"use client";
import { useEffect, useRef, useState } from "react";

const ROBOT_COUNT = 20;
const SPEED = 3;
const TARGET_RADIUS = 15;
const KEYBOARD_SPEED = 5;

export default function SwarmGameSimple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [time, setTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  
  const robotsX = useRef<Float32Array>(new Float32Array(ROBOT_COUNT));
  const robotsY = useRef<Float32Array>(new Float32Array(ROBOT_COUNT));
  const robotsReached = useRef<Uint8Array>(new Uint8Array(ROBOT_COUNT));
  const targetX = useRef(300);
  const targetY = useRef(200);
  const running = useRef(false);
  const startTime = useRef(0);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    for (let i = 0; i < ROBOT_COUNT; i++) {
      robotsX.current[i] = Math.random() * 600;
      robotsY.current[i] = Math.random() * 400;
      robotsReached.current[i] = 0;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
      if (!running.current) {
        running.current = true;
        startTime.current = Date.now();
        setTime(0);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const bgColor = theme === 'dark' ? '#000' : '#FFF';
    const robotColor = theme === 'dark' ? '#8b5cf6' : '#4ecdc4';
    const robotReachedColor = theme === 'dark' ? '#22c55e' : '#16a34a';
    const targetColor = theme === 'dark' ? '#f87171' : '#ef4444';
    const glowColor = theme === 'dark' ? 'rgba(139, 92, 246, 0.7)' : 'rgba(78, 205, 196, 0.7)';

    const animate = () => {
      if (keysPressed.current["ArrowUp"]) targetY.current -= KEYBOARD_SPEED;
      if (keysPressed.current["ArrowDown"]) targetY.current += KEYBOARD_SPEED;
      if (keysPressed.current["ArrowLeft"]) targetX.current -= KEYBOARD_SPEED;
      if (keysPressed.current["ArrowRight"]) targetX.current += KEYBOARD_SPEED;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 600, 400);
      
      let allReached = true;
      
      for (let i = 0; i < ROBOT_COUNT; i++) {
        if (robotsReached.current[i] === 0) {
          const dx = targetX.current - robotsX.current[i];
          const dy = targetY.current - robotsY.current[i];
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < TARGET_RADIUS) {
            robotsReached.current[i] = 1;
          } else {
            allReached = false;
            robotsX.current[i] += (dx / dist) * SPEED;
            robotsY.current[i] += (dy / dist) * SPEED;
          }
        }
      }
      
      ctx.shadowBlur = 15;
      for (let i = 0; i < ROBOT_COUNT; i++) {
        ctx.fillStyle = robotsReached.current[i] === 1 ? robotReachedColor : robotColor;
        ctx.shadowColor = robotsReached.current[i] === 1 ? 'rgba(34, 197, 94, 0.7)' : glowColor;
        ctx.beginPath();
        ctx.arc(robotsX.current[i], robotsY.current[i], 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      
      ctx.strokeStyle = targetColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(targetX.current, targetY.current, TARGET_RADIUS, 0, Math.PI * 2);
      ctx.stroke();
      
      if (running.current) {
        if (allReached) {
          running.current = false;
          const finalTime = (Date.now() - startTime.current) / 1000;
          setTime(finalTime);
          setBestTime(prev => prev === null || finalTime < prev ? finalTime : prev);
        } else {
          setTime((Date.now() - startTime.current) / 1000);
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    targetX.current = e.clientX - rect.left;
    targetY.current = e.clientY - rect.top;
    
    for (let i = 0; i < ROBOT_COUNT; i++) {
      robotsReached.current[i] = 0;
    }
    
    if (!running.current) {
      running.current = true;
      startTime.current = Date.now();
      setTime(0);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        onClick={handleClick}
        className="border border-gray-300 dark:border-gray-700 shadow-lg cursor-crosshair rounded-lg"
      />
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg w-full max-w-md">
        <div className="text-center">
          <div className="text-lg font-bold">Time: {time.toFixed(1)}s</div>
          {bestTime && <div className="text-sm text-green-500">Best Time: {bestTime.toFixed(1)}s</div>}
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-600 dark:text-gray-400 max-w-md">
        <p className="font-bold text-base">How to Play:</p>
        <p>Use the <strong>Arrow Keys</strong> to move the target. You can also <strong>Click</strong> on the canvas to set a new target. The goal is to get all the robots to the target area as quickly as possible. Your time is recorded, so try to beat your best score!</p>
      </div>
    </div>
  );
}