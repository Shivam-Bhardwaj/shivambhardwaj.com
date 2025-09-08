'use client';

import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

interface ParticleBackgroundProps {
  particleCount?: number;
  colors?: string[];
  speed?: number;
  size?: number;
  opacity?: number;
  interactive?: boolean;
  connectionDistance?: number;
  mouseInfluence?: boolean;
  className?: string;
  style?: 'floating' | 'connected' | 'flowing' | 'galaxy' | 'matrix';
}

export default function ParticleBackground({
  particleCount = 100,
  colors = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981'],
  speed = 0.5,
  size = 2,
  opacity = 0.6,
  interactive = true,
  connectionDistance = 150,
  mouseInfluence = true,
  className = '',
  style = 'floating',
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Initialize particles
  const initializeParticles = (width: number, height: number) => {
    const particles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * size + 1,
        opacity: Math.random() * opacity + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: Math.random() * 100,
        maxLife: 100 + Math.random() * 100,
      });
    }
    
    particlesRef.current = particles;
  };

  // Update particles based on style
  const updateParticles = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    particlesRef.current.forEach((particle, index) => {
      // Update position based on style
      switch (style) {
        case 'floating':
          updateFloatingParticle(particle, width, height);
          break;
        case 'flowing':
          updateFlowingParticle(particle, width, height);
          break;
        case 'galaxy':
          updateGalaxyParticle(particle, width, height);
          break;
        case 'matrix':
          updateMatrixParticle(particle, width, height);
          break;
        default:
          updateFloatingParticle(particle, width, height);
      }

      // Mouse influence
      if (mouseInfluence && interactive) {
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100 * 0.5;
          particle.vx += (dx / distance) * force * 0.01;
          particle.vy += (dy / distance) * force * 0.01;
        }
      }

      // Update life cycle
      particle.life += 1;
      if (particle.life > particle.maxLife) {
        particle.life = 0;
        particle.x = Math.random() * width;
        particle.y = Math.random() * height;
        particle.opacity = Math.random() * opacity + 0.1;
      }

      // Render particle
      renderParticle(ctx, particle);
    });

    // Draw connections for connected style
    if (style === 'connected') {
      drawConnections(ctx);
    }
  };

  const updateFloatingParticle = (particle: Particle, width: number, height: number) => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    // Bounce off edges
    if (particle.x < 0 || particle.x > width) particle.vx *= -1;
    if (particle.y < 0 || particle.y > height) particle.vy *= -1;

    // Keep particles in bounds
    particle.x = Math.max(0, Math.min(width, particle.x));
    particle.y = Math.max(0, Math.min(height, particle.y));
  };

  const updateFlowingParticle = (particle: Particle, width: number, height: number) => {
    particle.x += particle.vx;
    particle.y += particle.vy + Math.sin(particle.x * 0.01) * 0.5;

    // Reset when out of bounds
    if (particle.x > width + 10) {
      particle.x = -10;
      particle.y = Math.random() * height;
    }
    if (particle.y > height + 10) {
      particle.y = -10;
      particle.x = Math.random() * width;
    }
  };

  const updateGalaxyParticle = (particle: Particle, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const angle = Math.atan2(particle.y - centerY, particle.x - centerX);
    const distance = Math.sqrt((particle.x - centerX) ** 2 + (particle.y - centerY) ** 2);
    
    const rotationSpeed = 0.01 / (distance * 0.01 + 1);
    const newAngle = angle + rotationSpeed;
    
    particle.x = centerX + Math.cos(newAngle) * distance;
    particle.y = centerY + Math.sin(newAngle) * distance;
    
    // Spiral effect
    const spiral = Math.sin(particle.life * 0.1) * 0.5;
    particle.x += spiral;
    particle.y += spiral;
  };

  const updateMatrixParticle = (particle: Particle, width: number, height: number) => {
    particle.y += particle.vy * 2;
    particle.x += Math.sin(particle.y * 0.01) * 0.5;

    // Reset when reaching bottom
    if (particle.y > height + 10) {
      particle.y = -10;
      particle.x = Math.random() * width;
      particle.opacity = Math.random() * opacity + 0.2;
    }

    // Fade effect
    particle.opacity = Math.max(0.1, particle.opacity - 0.005);
  };

  const renderParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    ctx.globalAlpha = particle.opacity;
    ctx.fillStyle = particle.color;
    
    if (style === 'matrix') {
      // Render as rectangle for matrix effect
      ctx.fillRect(particle.x, particle.y, 2, particle.size * 3);
    } else if (style === 'galaxy') {
      // Render with glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Standard circle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  };

  const drawConnections = (ctx: CanvasRenderingContext2D) => {
    const particles = particlesRef.current;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < connectionDistance) {
          ctx.save();
          ctx.strokeStyle = particles[i].color;
          ctx.globalAlpha = (1 - distance / connectionDistance) * 0.3;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  };

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      updateParticles(ctx, canvas.width, canvas.height);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, style, particleCount, speed, interactive]);

  // Handle mouse movement
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setDimensions({ width, height });
      
      if (canvasRef.current) {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        initializeParticles(width, height);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize particles when dimensions change
  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      initializeParticles(dimensions.width, dimensions.height);
    }
  }, [dimensions, particleCount, colors, size, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        background: style === 'galaxy' 
          ? 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
          : 'transparent'
      }}
    />
  );
}