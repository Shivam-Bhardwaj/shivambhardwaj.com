'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface MousePosition {
  x: number;
  y: number;
  timestamp: number;
}

interface MouseState {
  position: MousePosition;
  velocity: { x: number; y: number };
  isPressed: boolean;
  isMoving: boolean;
  trail: MousePosition[];
}

interface MouseTrackerProps {
  onMouseUpdate: (state: MouseState) => void;
  trackVelocity?: boolean;
  trackTrail?: boolean;
  trailLength?: number;
  updateThreshold?: number; // Minimum movement to trigger update
  throttleMs?: number; // Throttle updates to improve performance
  children?: React.ReactNode;
}

export default function MouseTracker({
  onMouseUpdate,
  trackVelocity = true,
  trackTrail = true,
  trailLength = 20,
  updateThreshold = 1,
  throttleMs = 16, // ~60fps
  children,
}: MouseTrackerProps) {
  const [mouseState, setMouseState] = useState<MouseState>({
    position: { x: 0, y: 0, timestamp: Date.now() },
    velocity: { x: 0, y: 0 },
    isPressed: false,
    isMoving: false,
    trail: [],
  });

  const lastUpdateRef = useRef(0);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const velocityHistoryRef = useRef<{ x: number; y: number; timestamp: number }[]>([]);
  const isMovingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculateVelocity = useCallback((
    currentPos: { x: number; y: number },
    timestamp: number
  ): { x: number; y: number } => {
    if (!trackVelocity) return { x: 0, y: 0 };

    const history = velocityHistoryRef.current;
    
    // Add current position to history
    history.push({ ...currentPos, timestamp });
    
    // Keep only recent history (last 100ms)
    const cutoffTime = timestamp - 100;
    velocityHistoryRef.current = history.filter(entry => entry.timestamp > cutoffTime);
    
    if (history.length < 2) return { x: 0, y: 0 };
    
    // Calculate average velocity over recent history
    const oldest = history[0];
    const newest = history[history.length - 1];
    const timeDiff = newest.timestamp - oldest.timestamp;
    
    if (timeDiff === 0) return { x: 0, y: 0 };
    
    const velocity = {
      x: (newest.x - oldest.x) / timeDiff * 1000, // pixels per second
      y: (newest.y - oldest.y) / timeDiff * 1000,
    };
    
    // Smooth velocity to reduce noise
    const smoothingFactor = 0.3;
    return {
      x: mouseState.velocity.x * (1 - smoothingFactor) + velocity.x * smoothingFactor,
      y: mouseState.velocity.y * (1 - smoothingFactor) + velocity.y * smoothingFactor,
    };
  }, [trackVelocity, mouseState.velocity]);

  const updateMouseState = useCallback((
    x: number,
    y: number,
    isPressed: boolean,
    forceUpdate = false
  ) => {
    const now = Date.now();
    
    // Throttle updates
    if (!forceUpdate && now - lastUpdateRef.current < throttleMs) {
      return;
    }

    const lastPos = lastPositionRef.current;
    const distance = Math.sqrt(
      Math.pow(x - lastPos.x, 2) + Math.pow(y - lastPos.y, 2)
    );

    // Skip update if movement is too small
    if (!forceUpdate && distance < updateThreshold) {
      return;
    }

    lastUpdateRef.current = now;
    lastPositionRef.current = { x, y };

    const newPosition: MousePosition = { x, y, timestamp: now };
    const velocity = calculateVelocity({ x, y }, now);

    // Update trail
    let newTrail = [...mouseState.trail];
    if (trackTrail) {
      newTrail.push(newPosition);
      if (newTrail.length > trailLength) {
        newTrail = newTrail.slice(-trailLength);
      }
    }

    // Determine if mouse is moving
    const isMoving = distance > updateThreshold;
    
    // Reset moving timeout
    if (isMovingTimeoutRef.current) {
      clearTimeout(isMovingTimeoutRef.current);
    }
    
    isMovingTimeoutRef.current = setTimeout(() => {
      setMouseState(prev => ({ ...prev, isMoving: false }));
    }, 100);

    const newState: MouseState = {
      position: newPosition,
      velocity,
      isPressed,
      isMoving,
      trail: newTrail,
    };

    setMouseState(newState);
    onMouseUpdate(newState);
  }, [
    calculateVelocity,
    mouseState.trail,
    onMouseUpdate,
    throttleMs,
    trackTrail,
    trailLength,
    updateThreshold,
  ]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      updateMouseState(e.clientX, e.clientY, mouseState.isPressed);
    };

    const handleMouseDown = (e: MouseEvent) => {
      updateMouseState(e.clientX, e.clientY, true, true);
    };

    const handleMouseUp = (e: MouseEvent) => {
      updateMouseState(e.clientX, e.clientY, false, true);
    };

    const handleMouseEnter = (e: MouseEvent) => {
      updateMouseState(e.clientX, e.clientY, mouseState.isPressed, true);
    };

    const handleMouseLeave = () => {
      // When mouse leaves, we could either keep tracking or stop
      // For now, we'll just mark as not pressed but keep position
      if (mouseState.isPressed) {
        setMouseState(prev => ({ ...prev, isPressed: false }));
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updateMouseState(touch.clientX, touch.clientY, true, true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updateMouseState(touch.clientX, touch.clientY, true);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        updateMouseState(touch.clientX, touch.clientY, false, true);
      }
    };

    // Mouse events
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // Touch events for mobile support
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);

      if (isMovingTimeoutRef.current) {
        clearTimeout(isMovingTimeoutRef.current);
      }
    };
  }, [updateMouseState, mouseState.isPressed]);

  return (
    <>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <MouseTrackerDebug mouseState={mouseState} />
      )}
    </>
  );
}

// Development helper component
function MouseTrackerDebug({ mouseState }: { mouseState: MouseState }) {
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'm' && e.ctrlKey && e.shiftKey) {
        setShowDebug(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!showDebug) return null;

  return (
    <div className="fixed top-20 left-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded z-50 font-mono">
      <div>Ctrl+Shift+M to toggle mouse debug</div>
      <div>Position: ({Math.round(mouseState.position.x)}, {Math.round(mouseState.position.y)})</div>
      <div>
        Velocity: ({Math.round(mouseState.velocity.x)}, {Math.round(mouseState.velocity.y)}) px/s
      </div>
      <div>Pressed: {mouseState.isPressed ? 'Yes' : 'No'}</div>
      <div>Moving: {mouseState.isMoving ? 'Yes' : 'No'}</div>
      <div>Trail Points: {mouseState.trail.length}</div>
      
      {/* Visual trail */}
      <div className="fixed inset-0 pointer-events-none z-40">
        {mouseState.trail.map((point, index) => {
          const opacity = (index + 1) / mouseState.trail.length * 0.5;
          const size = 2 + (index / mouseState.trail.length) * 6;
          
          return (
            <div
              key={`${point.x}-${point.y}-${point.timestamp}`}
              className="absolute rounded-full bg-red-500"
              style={{
                left: point.x - size / 2,
                top: point.y - size / 2,
                width: size,
                height: size,
                opacity,
                transform: 'translate(-50%, -50%)',
              }}
            />
          );
        })}
        
        {/* Current position indicator */}
        <div
          className="absolute w-4 h-4 bg-yellow-400 rounded-full border-2 border-yellow-600"
          style={{
            left: mouseState.position.x,
            top: mouseState.position.y,
            transform: 'translate(-50%, -50%)',
            opacity: mouseState.isPressed ? 1 : 0.7,
          }}
        />
        
        {/* Velocity vector */}
        {(Math.abs(mouseState.velocity.x) > 10 || Math.abs(mouseState.velocity.y) > 10) && (
          <div
            className="absolute bg-blue-400"
            style={{
              left: mouseState.position.x,
              top: mouseState.position.y,
              width: Math.max(2, Math.abs(mouseState.velocity.x) / 10),
              height: 2,
              transformOrigin: '0 50%',
              transform: `translate(-50%, -50%) rotate(${Math.atan2(
                mouseState.velocity.y,
                mouseState.velocity.x
              )}rad)`,
              opacity: 0.8,
            }}
          />
        )}
      </div>
    </div>
  );
}