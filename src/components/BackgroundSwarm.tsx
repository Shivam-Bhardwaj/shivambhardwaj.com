"use client";
import { useEffect, useRef } from "react";

// Ultra-lightweight background swarm
// Uses CSS animations instead of canvas for better performance
export default function BackgroundSwarm() {
  const containerRef = useRef<HTMLDivElement>(null);
  const robotsRef = useRef<HTMLDivElement[]>([]);
  const animationRef = useRef<number>();
  
  // Configuration for minimal performance impact
  const ROBOT_COUNT = 8; // Very few robots
  const UPDATE_INTERVAL = 100; // Update every 100ms (10 FPS)
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Create robots as DOM elements with CSS transitions
    robotsRef.current = [];
    for (let i = 0; i < ROBOT_COUNT; i++) {
      const robot = document.createElement("div");
      robot.className = "swarm-robot";
      robot.style.cssText = `
        position: fixed;
        width: 6px;
        height: 6px;
        background: radial-gradient(circle, rgba(78, 205, 196, 0.8), rgba(78, 205, 196, 0.2));
        border-radius: 50%;
        pointer-events: none;
        z-index: 0;
        transition: transform 3s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
      `;
      container.appendChild(robot);
      robotsRef.current.push(robot);
    }
    
    // Simple movement using CSS transforms (GPU accelerated)
    let frame = 0;
    const animate = () => {
      frame++;
      
      // Update positions infrequently
      if (frame % 6 === 0) { // Every 600ms at 60fps
        robotsRef.current.forEach((robot, i) => {
          const time = Date.now() * 0.0001;
          const x = Math.sin(time + i * 2) * 30;
          const y = Math.cos(time * 0.7 + i * 3) * 30;
          robot.style.transform = `translate(${x}px, ${y}px)`;
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Pause when page is not visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      } else {
        animate();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Clean up DOM elements
      robotsRef.current.forEach(robot => robot.remove());
    };
  }, []);
  
  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0" aria-hidden="true" />;
}