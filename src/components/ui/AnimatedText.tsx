'use client';

import { useState, useEffect, useMemo } from 'react';

interface AnimatedTextProps {
  text: string;
  animation?: 'typewriter' | 'fadeIn' | 'slideUp' | 'glitch' | 'wave' | 'matrix';
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
  loop?: boolean;
  cursor?: boolean;
}

export default function AnimatedText({
  text,
  animation = 'typewriter',
  speed = 50,
  delay = 0,
  className = '',
  onComplete,
  loop = false,
  cursor = true,
}: AnimatedTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  // Cursor blinking effect
  useEffect(() => {
    if (!cursor) return;

    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, [cursor]);

  // Main animation logic
  useEffect(() => {
    if (!text) return;

    const timeout = setTimeout(() => {
      if (animation === 'typewriter') {
        handleTypewriter();
      } else if (animation === 'fadeIn') {
        handleFadeIn();
      } else if (animation === 'slideUp') {
        handleSlideUp();
      } else if (animation === 'glitch') {
        handleGlitch();
      } else if (animation === 'wave') {
        handleWave();
      } else if (animation === 'matrix') {
        handleMatrix();
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, animation, delay, currentIndex, isComplete, loop]);

  const handleTypewriter = () => {
    if (currentIndex < text.length) {
      setDisplayText(text.slice(0, currentIndex + 1));
      setCurrentIndex(prev => prev + 1);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
      
      if (loop) {
        setTimeout(() => {
          setCurrentIndex(0);
          setDisplayText('');
          setIsComplete(false);
        }, 2000);
      }
    }
  };

  const handleFadeIn = () => {
    if (!isComplete) {
      setDisplayText(text);
      setIsComplete(true);
      onComplete?.();
      
      if (loop) {
        setTimeout(() => {
          setIsComplete(false);
        }, 3000);
      }
    }
  };

  const handleSlideUp = () => {
    if (!isComplete) {
      setDisplayText(text);
      setIsComplete(true);
      onComplete?.();
      
      if (loop) {
        setTimeout(() => {
          setIsComplete(false);
        }, 3000);
      }
    }
  };

  const handleGlitch = () => {
    if (currentIndex < text.length * 3) {
      const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const targetChar = text[Math.floor(currentIndex / 3)];
      
      if (currentIndex % 3 === 2) {
        setDisplayText(text.slice(0, Math.floor(currentIndex / 3) + 1));
      } else {
        const glitchChar = chars[Math.floor(Math.random() * chars.length)];
        setDisplayText(
          text.slice(0, Math.floor(currentIndex / 3)) + 
          glitchChar + 
          text.slice(Math.floor(currentIndex / 3) + 1)
        );
      }
      
      setCurrentIndex(prev => prev + 1);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
      
      if (loop) {
        setTimeout(() => {
          setCurrentIndex(0);
          setDisplayText('');
          setIsComplete(false);
        }, 2000);
      }
    }
  };

  const handleWave = () => {
    if (!isComplete) {
      setDisplayText(text);
      setIsComplete(true);
      onComplete?.();
    }
  };

  const handleMatrix = () => {
    if (currentIndex < text.length * 5) {
      const matrixChars = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';
      
      if (currentIndex % 5 === 4) {
        setDisplayText(text.slice(0, Math.floor(currentIndex / 5) + 1));
      } else {
        const randomChar = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        setDisplayText(
          text.slice(0, Math.floor(currentIndex / 5)) + 
          randomChar + 
          ''.repeat(Math.max(0, text.length - Math.floor(currentIndex / 5) - 1))
        );
      }
      
      setCurrentIndex(prev => prev + 1);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
      
      if (loop) {
        setTimeout(() => {
          setCurrentIndex(0);
          setDisplayText('');
          setIsComplete(false);
        }, 2000);
      }
    }
  };

  // Generate wave animation styles
  const waveStyles = useMemo(() => {
    if (animation !== 'wave' || !isComplete) return {};
    
    return Array.from(text).reduce((acc, _, index) => ({
      ...acc,
      [`--wave-delay-${index}`]: `${index * 0.1}s`,
    }), {});
  }, [text, animation, isComplete]);

  const getAnimationClass = () => {
    const baseClass = 'animated-text';
    
    switch (animation) {
      case 'fadeIn':
        return `${baseClass} ${isComplete ? 'animate-fade-in' : 'opacity-0'}`;
      case 'slideUp':
        return `${baseClass} ${isComplete ? 'animate-slide-up' : 'translate-y-4 opacity-0'}`;
      case 'glitch':
        return `${baseClass} ${currentIndex > 0 ? 'animate-glitch' : ''}`;
      case 'wave':
        return `${baseClass} ${isComplete ? 'animate-wave' : ''}`;
      case 'matrix':
        return `${baseClass} font-mono ${currentIndex > 0 ? 'text-green-500' : ''}`;
      default:
        return baseClass;
    }
  };

  const renderWaveText = () => {
    if (animation !== 'wave') return displayText;
    
    return Array.from(displayText).map((char, index) => (
      <span
        key={index}
        className="inline-block"
        style={{
          animation: isComplete ? `wave 2s ease-in-out infinite` : 'none',
          animationDelay: `${index * 0.1}s`,
        }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <span 
      className={`${getAnimationClass()} ${className}`}
      style={waveStyles}
    >
      {animation === 'wave' ? renderWaveText() : displayText}
      {cursor && animation === 'typewriter' && showCursor && (
        <span className="animate-pulse">|</span>
      )}
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(1rem);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes glitch {
          0%, 100% { 
            text-shadow: 0 0 0 transparent;
            transform: translate(0);
          }
          20% { 
            text-shadow: -2px 0 #ff0000, 2px 0 #0000ff;
            transform: translate(-1px);
          }
          40% { 
            text-shadow: -2px 0 #ff0000, 2px 0 #0000ff;
            transform: translate(1px);
          }
          60% { 
            text-shadow: -2px 0 #ff0000, 2px 0 #0000ff;
            transform: translate(-1px);
          }
          80% { 
            text-shadow: -2px 0 #ff0000, 2px 0 #0000ff;
            transform: translate(1px);
          }
        }
        
        @keyframes wave {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
        
        .animate-glitch {
          animation: glitch 0.1s infinite;
        }
        
        .animate-wave span {
          display: inline-block;
          animation: wave 2s ease-in-out infinite;
        }
      `}</style>
    </span>
  );
}