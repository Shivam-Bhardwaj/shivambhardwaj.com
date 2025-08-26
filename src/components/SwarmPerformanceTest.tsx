"use client";
import { useEffect, useRef, useState } from "react";

interface TestResult {
  testName: string;
  avgFps: number;
  minFps: number;
  maxFps: number;
  droppedFrames: number;
  renderTime: number;
}

export default function SwarmPerformanceTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  
  // Performance metrics
  const frameTimesRef = useRef<number[]>([]);
  const lastTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  
  // Test configurations
  const tests = [
    {
      name: "Baseline (Empty Canvas)",
      robots: 0,
      render: (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 600, 400);
      }
    },
    {
      name: "10 Static Circles",
      robots: 10,
      render: (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 600, 400);
        ctx.fillStyle = "#4ecdc4";
        for (let i = 0; i < 10; i++) {
          ctx.beginPath();
          ctx.arc(60 * i + 30, 200, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    {
      name: "20 Static Circles",
      robots: 20,
      render: (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 600, 400);
        ctx.fillStyle = "#4ecdc4";
        for (let i = 0; i < 20; i++) {
          ctx.beginPath();
          ctx.arc((i % 10) * 60 + 30, Math.floor(i / 10) * 100 + 100, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    {
      name: "20 Moving Circles (Simple Math)",
      robots: 20,
      render: (ctx: CanvasRenderingContext2D, time: number) => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 600, 400);
        ctx.fillStyle = "#4ecdc4";
        for (let i = 0; i < 20; i++) {
          const x = 300 + Math.sin(time * 0.001 + i) * 200;
          const y = 200 + Math.cos(time * 0.001 + i) * 100;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    {
      name: "20 Circles with Distance Calc",
      robots: 20,
      positions: Array.from({ length: 20 }, () => ({ x: Math.random() * 600, y: Math.random() * 400 })),
      render: (ctx: CanvasRenderingContext2D, time: number, test: any) => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 600, 400);
        
        const targetX = 300;
        const targetY = 200;
        
        for (let i = 0; i < 20; i++) {
          const dx = targetX - test.positions[i].x;
          const dy = targetY - test.positions[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 15) {
            test.positions[i].x += (dx / dist) * 2;
            test.positions[i].y += (dy / dist) * 2;
          }
          
          ctx.fillStyle = dist < 15 ? "#16a34a" : "#4ecdc4";
          ctx.beginPath();
          ctx.arc(test.positions[i].x, test.positions[i].y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 15, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
    {
      name: "50 Moving Circles",
      robots: 50,
      render: (ctx: CanvasRenderingContext2D, time: number) => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 600, 400);
        ctx.fillStyle = "#4ecdc4";
        for (let i = 0; i < 50; i++) {
          const x = 300 + Math.sin(time * 0.001 + i * 0.5) * 250;
          const y = 200 + Math.cos(time * 0.001 + i * 0.3) * 150;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    {
      name: "100 Static Circles",
      robots: 100,
      render: (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 600, 400);
        ctx.fillStyle = "#4ecdc4";
        for (let i = 0; i < 100; i++) {
          ctx.beginPath();
          ctx.arc((i % 20) * 30 + 15, Math.floor(i / 20) * 80 + 40, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    {
      name: "Canvas Save/Restore Test",
      robots: 20,
      render: (ctx: CanvasRenderingContext2D, time: number) => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 600, 400);
        
        for (let i = 0; i < 20; i++) {
          ctx.save();
          ctx.fillStyle = `hsl(${i * 18}, 70%, 50%)`;
          ctx.beginPath();
          ctx.arc(300 + Math.sin(time * 0.001 + i) * 200, 200 + Math.cos(time * 0.001 + i) * 100, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    },
    {
      name: "Single Path Batch Draw",
      robots: 20,
      render: (ctx: CanvasRenderingContext2D, time: number) => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 600, 400);
        ctx.fillStyle = "#4ecdc4";
        
        ctx.beginPath();
        for (let i = 0; i < 20; i++) {
          const x = 300 + Math.sin(time * 0.001 + i) * 200;
          const y = 200 + Math.cos(time * 0.001 + i) * 100;
          ctx.moveTo(x + 5, y);
          ctx.arc(x, y, 5, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    }
  ];
  
  const runTest = async (testIndex: number) => {
    if (testIndex >= tests.length) {
      setIsRunning(false);
      setCurrentTest("");
      return;
    }
    
    const test = tests[testIndex];
    setCurrentTest(test.name);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    
    // Reset metrics
    frameTimesRef.current = [];
    frameCountRef.current = 0;
    lastTimeRef.current = performance.now();
    
    let animationId: number;
    const testDuration = 3000; // 3 seconds per test
    const startTime = performance.now();
    
    const animate = () => {
      const now = performance.now();
      const deltaTime = now - lastTimeRef.current;
      
      // Track frame times
      if (deltaTime > 0) {
        frameTimesRef.current.push(1000 / deltaTime);
        frameCountRef.current++;
      }
      lastTimeRef.current = now;
      
      // Measure render time
      const renderStart = performance.now();
      test.render(ctx, now, test);
      const renderTime = performance.now() - renderStart;
      
      // Continue test
      if (now - startTime < testDuration) {
        animationId = requestAnimationFrame(animate);
      } else {
        // Calculate results
        const fps = frameTimesRef.current;
        const avgFps = fps.reduce((a, b) => a + b, 0) / fps.length;
        const minFps = Math.min(...fps);
        const maxFps = Math.max(...fps);
        const droppedFrames = fps.filter(f => f < 55).length;
        
        setResults(prev => [...prev, {
          testName: test.name,
          avgFps: Math.round(avgFps),
          minFps: Math.round(minFps),
          maxFps: Math.round(maxFps),
          droppedFrames,
          renderTime: Math.round(renderTime * 100) / 100
        }]);
        
        // Run next test
        setTimeout(() => runTest(testIndex + 1), 500);
      }
    };
    
    animationId = requestAnimationFrame(animate);
  };
  
  const startTests = () => {
    setResults([]);
    setIsRunning(true);
    runTest(0);
  };
  
  const exportResults = () => {
    const csv = "Test,Avg FPS,Min FPS,Max FPS,Dropped Frames,Render Time\n" +
      results.map(r => `${r.testName},${r.avgFps},${r.minFps},${r.maxFps},${r.droppedFrames},${r.renderTime}`).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "swarm-performance-results.csv";
    a.click();
  };
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-2xl font-bold">Swarm Performance Testing</h2>
      
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="border border-gray-300 bg-white shadow-lg"
      />
      
      <div className="flex gap-4">
        <button
          onClick={startTests}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {isRunning ? `Running: ${currentTest}` : "Start Performance Tests"}
        </button>
        
        {results.length > 0 && (
          <button
            onClick={exportResults}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Export Results
          </button>
        )}
      </div>
      
      {results.length > 0 && (
        <div className="w-full max-w-4xl">
          <h3 className="text-lg font-bold mb-2">Test Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Test</th>
                  <th className="border p-2">Avg FPS</th>
                  <th className="border p-2">Min FPS</th>
                  <th className="border p-2">Max FPS</th>
                  <th className="border p-2">Dropped</th>
                  <th className="border p-2">Render (ms)</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className={r.avgFps < 30 ? "bg-red-50" : r.avgFps < 55 ? "bg-yellow-50" : "bg-green-50"}>
                    <td className="border p-2">{r.testName}</td>
                    <td className="border p-2 text-center font-mono">{r.avgFps}</td>
                    <td className="border p-2 text-center font-mono">{r.minFps}</td>
                    <td className="border p-2 text-center font-mono">{r.maxFps}</td>
                    <td className="border p-2 text-center">{r.droppedFrames}</td>
                    <td className="border p-2 text-center font-mono">{r.renderTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h4 className="font-bold">Performance Analysis:</h4>
            <ul className="text-sm mt-2 space-y-1">
              {results.length > 0 && (
                <>
                  <li>• Baseline FPS: {results[0]?.avgFps || "N/A"}</li>
                  <li>• 20 Circles Static: {results.find(r => r.testName.includes("20 Static"))?.avgFps || "N/A"} FPS</li>
                  <li>• 20 Circles Moving: {results.find(r => r.testName.includes("20 Moving"))?.avgFps || "N/A"} FPS</li>
                  <li>• Worst performer: {results.reduce((min, r) => r.avgFps < min.avgFps ? r : min).testName}</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
      
      <div className="text-center text-xs text-gray-500 max-w-2xl">
        <p>This tool tests various rendering scenarios to identify performance bottlenecks.</p>
        <p>Each test runs for 3 seconds and measures FPS, frame drops, and render time.</p>
      </div>
    </div>
  );
}