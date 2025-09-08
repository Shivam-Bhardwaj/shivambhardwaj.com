'use client';

import { useRef, useState, useEffect, ReactNode } from 'react';

interface MagneticButtonProps {
  children: ReactNode;
  strength?: number;
  distance?: number;
  speed?: number;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  onHover?: (isHovered: boolean) => void;
}

export default function MagneticButton({
  children,
  strength = 0.3,
  distance = 100,
  speed = 0.15,
  className = '',
  disabled = false,
  onClick,
  onHover,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  // Update button position based on mouse proximity
  const updateButtonPosition = () => {
    const button = buttonRef.current;
    if (!button || disabled) return;

    const rect = button.getBoundingClientRect();
    const buttonCenterX = rect.left + rect.width / 2;
    const buttonCenterY = rect.top + rect.height / 2;

    const deltaX = mousePosition.x - buttonCenterX;
    const deltaY = mousePosition.y - buttonCenterY;
    const distanceFromCenter = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distanceFromCenter < distance) {
      // Calculate magnetic force
      const force = (distance - distanceFromCenter) / distance;
      const magneticX = deltaX * force * strength;
      const magneticY = deltaY * force * strength;

      // Smooth transition
      setButtonPosition(prev => ({
        x: prev.x + (magneticX - prev.x) * speed,
        y: prev.y + (magneticY - prev.y) * speed,
      }));
    } else {
      // Return to center
      setButtonPosition(prev => ({
        x: prev.x * (1 - speed),
        y: prev.y * (1 - speed),
      }));
    }
  };

  // Animation loop
  useEffect(() => {
    const animate = () => {
      updateButtonPosition();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePosition, strength, distance, speed, disabled]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled && onClick) {
      // Add click animation
      const button = buttonRef.current;
      if (button) {
        button.style.transform = `translate(${buttonPosition.x}px, ${buttonPosition.y}px) scale(0.95)`;
        setTimeout(() => {
          if (button) {
            button.style.transform = `translate(${buttonPosition.x}px, ${buttonPosition.y}px) scale(1)`;
          }
        }, 150);
      }
      onClick();
    }
  };

  return (
    <button
      ref={buttonRef}
      className={`
        magnetic-button
        relative
        transition-all
        duration-300
        ease-out
        transform-gpu
        ${isHovered ? 'z-10' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        transform: `translate(${buttonPosition.x}px, ${buttonPosition.y}px)`,
        transformOrigin: 'center',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled}
    >
      <div
        className={`
          relative
          overflow-hidden
          transition-all
          duration-300
          ${isHovered ? 'shadow-lg shadow-blue-500/25' : ''}
        `}
      >
        {children}
        
        {/* Magnetic field visualization (development only) */}
        {process.env.NODE_ENV === 'development' && isHovered && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)`,
              transform: `scale(${distance / 50})`,
            }}
          />
        )}

        {/* Ripple effect on click */}
        <div
          className={`
            absolute
            inset-0
            rounded-full
            pointer-events-none
            transition-transform
            duration-500
            ease-out
            ${isHovered ? 'animate-ping' : ''}
          `}
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            transform: 'scale(0)',
          }}
        />
      </div>

      <style jsx>{`
        .magnetic-button {
          will-change: transform;
        }
        
        .magnetic-button:hover {
          filter: brightness(1.1);
        }
        
        .magnetic-button:active {
          transition-duration: 0.1s;
        }
        
        @keyframes magnetic-pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.1;
            transform: scale(1.2);
          }
        }
        
        .magnetic-button:hover::before {
          content: '';
          position: absolute;
          inset: -10px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
          animation: magnetic-pulse 2s infinite;
          pointer-events: none;
          z-index: -1;
        }
      `}</style>
    </button>
  );
}