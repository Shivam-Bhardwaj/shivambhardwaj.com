"use client";
import { useEffect, useRef, useState } from "react";

// Constants for robot behavior
const NUM_ROBOTS = 10;
const ROBOT_SPEED = 2.0;
const ROBOT_RADIUS = 8;
const OBSTACLE_PADDING = 40;
const VECTOR_FIELD_RESOLUTION = 30;
const DEBUG_MODE = false; // Set to true to see debug visualization

// Physics and navigation parameters
const ATTRACTION_STRENGTH = 0.8;
const REPULSION_STRENGTH = 2.5;
const REPULSION_RADIUS = 80;
const WALL_FOLLOW_DISTANCE = 60;
const EXPLORATION_CHANCE = 0.02;
const MAX_VELOCITY = 3.0;
const VELOCITY_DAMPING = 0.85;
const STUCK_THRESHOLD = 0.1;
const STUCK_TIMEOUT = 60; // frames

interface Vector2D {
  x: number;
  y: number;
}

interface Obstacle {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface Robot {
  id: number;
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  target: Vector2D;
  color: string;
  trail: Vector2D[];
  stuckTimer: number;
  wallFollowMode: boolean;
  wallFollowDirection: number; // 1 for clockwise, -1 for counterclockwise
  explorationTarget: Vector2D | null;
  lastMoveDistance: number;
}

interface VectorField {
  vectors: Vector2D[][];
  obstacles: Obstacle[];
  width: number;
  height: number;
  cellSize: number;
}

// Vector math utilities
const vec2 = {
  add: (a: Vector2D, b: Vector2D): Vector2D => ({ x: a.x + b.x, y: a.y + b.y }),
  subtract: (a: Vector2D, b: Vector2D): Vector2D => ({ x: a.x - b.x, y: a.y - b.y }),
  multiply: (v: Vector2D, scalar: number): Vector2D => ({ x: v.x * scalar, y: v.y * scalar }),
  normalize: (v: Vector2D): Vector2D => {
    const mag = Math.sqrt(v.x * v.x + v.y * v.y);
    return mag > 0 ? { x: v.x / mag, y: v.y / mag } : { x: 0, y: 0 };
  },
  magnitude: (v: Vector2D): number => Math.sqrt(v.x * v.x + v.y * v.y),
  distance: (a: Vector2D, b: Vector2D): number => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  },
  dot: (a: Vector2D, b: Vector2D): number => a.x * b.x + a.y * b.y,
  perpendicular: (v: Vector2D): Vector2D => ({ x: -v.y, y: v.x }),
  lerp: (a: Vector2D, b: Vector2D, t: number): Vector2D => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t
  }),
  limit: (v: Vector2D, maxMag: number): Vector2D => {
    const mag = vec2.magnitude(v);
    return mag > maxMag ? vec2.multiply(vec2.normalize(v), maxMag) : v;
  }
};

export default function AdvancedRobots() {
  const [isClient, setIsClient] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const robotsRef = useRef<Robot[]>([]);
  const vectorFieldRef = useRef<VectorField | null>(null);
  const mouseRef = useRef<Vector2D>({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const obstaclesRef = useRef<Obstacle[]>([]);
  
  // Initialize client state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Detect all DOM obstacles with padding
  const detectObstacles = (): Obstacle[] => {
    if (!canvasRef.current || typeof document === 'undefined') return [];
    
    const canvasEl = canvasRef.current;
    const elements = Array.from(document.body.querySelectorAll("*")) as HTMLElement[];
    
    return elements
      .filter(el => {
        if (el === canvasEl || el.contains(canvasEl)) return false;
        
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        
        // Filter for meaningful UI elements
        return (
          rect.width > 20 ||
          rect.height > 20 ||
          parseFloat(style.fontSize || '0') > 14 ||
          style.position === 'fixed' ||
          style.position === 'absolute'
        );
      })
      .map(el => {
        const rect = el.getBoundingClientRect();
        return {
          left: rect.left - OBSTACLE_PADDING,
          top: rect.top - OBSTACLE_PADDING,
          right: rect.right + OBSTACLE_PADDING,
          bottom: rect.bottom + OBSTACLE_PADDING,
          width: rect.width + 2 * OBSTACLE_PADDING,
          height: rect.height + 2 * OBSTACLE_PADDING
        };
      })
      .filter(obs => obs.width > 0 && obs.height > 0);
  };

  // Check if a point is inside any obstacle
  const isInsideObstacle = (point: Vector2D, obstacles: Obstacle[]): boolean => {
    return obstacles.some(obs => 
      point.x >= obs.left && 
      point.x <= obs.right && 
      point.y >= obs.top && 
      point.y <= obs.bottom
    );
  };

  // Calculate distance to nearest obstacle
  const distanceToNearestObstacle = (point: Vector2D, obstacles: Obstacle[]): number => {
    let minDistance = Infinity;
    
    for (const obs of obstacles) {
      // Calculate distance to rectangle edges
      const dx = Math.max(obs.left - point.x, 0, point.x - obs.right);
      const dy = Math.max(obs.top - point.y, 0, point.y - obs.bottom);
      const distance = Math.sqrt(dx * dx + dy * dy);
      minDistance = Math.min(minDistance, distance);
    }
    
    return minDistance;
  };

  // Calculate repulsion force from obstacles
  const calculateObstacleRepulsion = (point: Vector2D, obstacles: Obstacle[]): Vector2D => {
    let totalForce = { x: 0, y: 0 };
    
    for (const obs of obstacles) {
      // Find closest point on obstacle to current point
      const closestX = Math.max(obs.left, Math.min(point.x, obs.right));
      const closestY = Math.max(obs.top, Math.min(point.y, obs.bottom));
      const closest = { x: closestX, y: closestY };
      
      const distance = vec2.distance(point, closest);
      
      if (distance < REPULSION_RADIUS && distance > 0) {
        const direction = vec2.normalize(vec2.subtract(point, closest));
        const strength = REPULSION_STRENGTH * (REPULSION_RADIUS - distance) / REPULSION_RADIUS;
        const force = vec2.multiply(direction, strength);
        totalForce = vec2.add(totalForce, force);
      }
    }
    
    return totalForce;
  };

  // Generate vector field for navigation
  const generateVectorField = (target: Vector2D, obstacles: Obstacle[], width: number, height: number): VectorField => {
    const cellSize = VECTOR_FIELD_RESOLUTION;
    const cols = Math.ceil(width / cellSize);
    const rows = Math.ceil(height / cellSize);
    const vectors: Vector2D[][] = [];
    
    for (let y = 0; y < rows; y++) {
      vectors[y] = [];
      for (let x = 0; x < cols; x++) {
        const worldX = x * cellSize + cellSize / 2;
        const worldY = y * cellSize + cellSize / 2;
        const point = { x: worldX, y: worldY };
        
        // Skip if inside obstacle
        if (isInsideObstacle(point, obstacles)) {
          vectors[y][x] = { x: 0, y: 0 };
          continue;
        }
        
        // Attractive force toward target
        const attractiveForce = vec2.normalize(vec2.subtract(target, point));
        const scaledAttractiveForce = vec2.multiply(attractiveForce, ATTRACTION_STRENGTH);
        
        // Repulsive force from obstacles
        const repulsiveForce = calculateObstacleRepulsion(point, obstacles);
        
        // Combine forces
        const totalForce = vec2.add(scaledAttractiveForce, repulsiveForce);
        vectors[y][x] = vec2.normalize(totalForce);
      }
    }
    
    return { vectors, obstacles, width, height, cellSize };
  };

  // Get vector field direction at a specific point
  const getVectorFieldDirection = (point: Vector2D, vectorField: VectorField): Vector2D => {
    const { vectors, cellSize } = vectorField;
    const x = Math.floor(point.x / cellSize);
    const y = Math.floor(point.y / cellSize);
    
    if (y >= 0 && y < vectors.length && x >= 0 && x < vectors[0].length) {
      return vectors[y][x];
    }
    
    return { x: 0, y: 0 };
  };

  // Wall following behavior for stuck robots
  const wallFollowBehavior = (robot: Robot, obstacles: Obstacle[]): Vector2D => {
    const { position } = robot;
    let wallDirection = { x: 0, y: 0 };
    
    // Find nearest wall
    let nearestObstacle: Obstacle | null = null;
    let minDistance = Infinity;
    
    for (const obs of obstacles) {
      const distance = distanceToNearestObstacle(position, [obs]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestObstacle = obs;
      }
    }
    
    if (nearestObstacle && minDistance < WALL_FOLLOW_DISTANCE) {
      // Calculate tangent to wall
      const obs = nearestObstacle;
      const center = { x: (obs.left + obs.right) / 2, y: (obs.top + obs.bottom) / 2 };
      const toCenter = vec2.subtract(center, position);
      const tangent = vec2.perpendicular(vec2.normalize(toCenter));
      
      // Apply wall following direction
      wallDirection = vec2.multiply(tangent, robot.wallFollowDirection);
      
      // Add slight outward bias to avoid getting too close
      const outward = vec2.normalize(vec2.subtract(position, center));
      wallDirection = vec2.add(wallDirection, vec2.multiply(outward, 0.3));
    }
    
    return vec2.normalize(wallDirection);
  };

  // Random exploration behavior
  const explorationBehavior = (robot: Robot, width: number, height: number): Vector2D => {
    if (!robot.explorationTarget || vec2.distance(robot.position, robot.explorationTarget) < 50) {
      // Generate new exploration target
      robot.explorationTarget = {
        x: Math.random() * width,
        y: Math.random() * height
      };
    }
    
    return vec2.normalize(vec2.subtract(robot.explorationTarget, robot.position));
  };

  // Update robot physics and AI
  const updateRobot = (robot: Robot, vectorField: VectorField, width: number, height: number) => {
    const oldPosition = { ...robot.position };
    
    // Determine behavior based on state
    let desiredDirection = { x: 0, y: 0 };
    
    if (robot.wallFollowMode) {
      // Wall following mode
      desiredDirection = wallFollowBehavior(robot, vectorField.obstacles);
      
      // Exit wall follow mode if we've moved away from walls
      const wallDistance = distanceToNearestObstacle(robot.position, vectorField.obstacles);
      if (wallDistance > WALL_FOLLOW_DISTANCE * 1.5) {
        robot.wallFollowMode = false;
      }
    } else if (Math.random() < EXPLORATION_CHANCE) {
      // Random exploration
      desiredDirection = explorationBehavior(robot, width, height);
    } else {
      // Normal vector field following
      desiredDirection = getVectorFieldDirection(robot.position, vectorField);
      
      // Check if stuck
      robot.lastMoveDistance = vec2.distance(robot.position, oldPosition);
      if (robot.lastMoveDistance < STUCK_THRESHOLD) {
        robot.stuckTimer++;
        if (robot.stuckTimer > STUCK_TIMEOUT) {
          robot.wallFollowMode = true;
          robot.wallFollowDirection = Math.random() > 0.5 ? 1 : -1;
          robot.stuckTimer = 0;
        }
      } else {
        robot.stuckTimer = 0;
      }
    }
    
    // Apply steering force
    const steeringForce = vec2.subtract(desiredDirection, vec2.normalize(robot.velocity));
    robot.acceleration = vec2.add(robot.acceleration, steeringForce);
    
    // Update velocity with acceleration
    robot.velocity = vec2.add(robot.velocity, robot.acceleration);
    robot.velocity = vec2.limit(robot.velocity, MAX_VELOCITY);
    robot.velocity = vec2.multiply(robot.velocity, VELOCITY_DAMPING);
    
    // Update position
    robot.position = vec2.add(robot.position, robot.velocity);
    
    // Boundary handling with bounce
    if (robot.position.x < ROBOT_RADIUS) {
      robot.position.x = ROBOT_RADIUS;
      robot.velocity.x = Math.abs(robot.velocity.x);
    }
    if (robot.position.x > width - ROBOT_RADIUS) {
      robot.position.x = width - ROBOT_RADIUS;
      robot.velocity.x = -Math.abs(robot.velocity.x);
    }
    if (robot.position.y < ROBOT_RADIUS) {
      robot.position.y = ROBOT_RADIUS;
      robot.velocity.y = Math.abs(robot.velocity.y);
    }
    if (robot.position.y > height - ROBOT_RADIUS) {
      robot.position.y = height - ROBOT_RADIUS;
      robot.velocity.y = -Math.abs(robot.velocity.y);
    }
    
    // Reset acceleration for next frame
    robot.acceleration = { x: 0, y: 0 };
    
    // Update trail
    if (vec2.distance(robot.position, oldPosition) > 2) {
      robot.trail.push({ ...robot.position });
      if (robot.trail.length > 50) {
        robot.trail.shift();
      }
    }
  };

  // Initialize robots
  const initializeRobots = (width: number, height: number): Robot[] => {
    const colors = [
      "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7",
      "#dda0dd", "#98d8c8", "#fad5a5", "#ffb7c5", "#c8e6c9"
    ];
    
    return Array.from({ length: NUM_ROBOTS }, (_, i) => ({
      id: i,
      position: {
        x: Math.random() * (width - 2 * ROBOT_RADIUS) + ROBOT_RADIUS,
        y: Math.random() * (height - 2 * ROBOT_RADIUS) + ROBOT_RADIUS
      },
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      target: { x: width / 2, y: height / 2 },
      color: colors[i % colors.length],
      trail: [],
      stuckTimer: 0,
      wallFollowMode: false,
      wallFollowDirection: 1,
      explorationTarget: null,
      lastMoveDistance: 0
    }));
  };

  // Draw debug visualization
  const drawDebugInfo = (ctx: CanvasRenderingContext2D, vectorField: VectorField) => {
    if (!DEBUG_MODE) return;
    
    // Draw vector field
    ctx.strokeStyle = "rgba(100, 100, 100, 0.3)";
    ctx.lineWidth = 1;
    
    const { vectors, cellSize } = vectorField;
    for (let y = 0; y < vectors.length; y++) {
      for (let x = 0; x < vectors[0].length; x++) {
        const worldX = x * cellSize + cellSize / 2;
        const worldY = y * cellSize + cellSize / 2;
        const vector = vectors[y][x];
        
        if (vec2.magnitude(vector) > 0) {
          ctx.beginPath();
          ctx.moveTo(worldX, worldY);
          ctx.lineTo(
            worldX + vector.x * cellSize * 0.4,
            worldY + vector.y * cellSize * 0.4
          );
          ctx.stroke();
        }
      }
    }
    
    // Draw obstacle boundaries
    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    ctx.lineWidth = 2;
    obstaclesRef.current.forEach(obs => {
      ctx.strokeRect(obs.left, obs.top, obs.width, obs.height);
    });
  };

  // Main animation loop
  useEffect(() => {
    if (!isClient) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    
    // Initialize robots
    robotsRef.current = initializeRobots(canvas.width, canvas.height);
    
    // Performance optimization: cache obstacle detection
    let obstacleUpdateCounter = 0;
    const OBSTACLE_UPDATE_FREQUENCY = 30; // Update obstacles every 30 frames
    
    const animate = () => {
      // Update obstacles less frequently for better performance
      if (obstacleUpdateCounter % OBSTACLE_UPDATE_FREQUENCY === 0) {
        obstaclesRef.current = detectObstacles();
      }
      obstacleUpdateCounter++;
      
      // Generate vector field
      vectorFieldRef.current = generateVectorField(
        mouseRef.current,
        obstaclesRef.current,
        canvas.width,
        canvas.height
      );
      
      // Clear canvas
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw debug info
      drawDebugInfo(ctx, vectorFieldRef.current);
      
      // Update and draw robots
      robotsRef.current.forEach(robot => {
        robot.target = mouseRef.current;
        updateRobot(robot, vectorFieldRef.current!, canvas.width, canvas.height);
        
        // Draw trail
        if (robot.trail.length > 1) {
          ctx.strokeStyle = robot.color + "33";
          ctx.lineWidth = 2;
          ctx.beginPath();
          robot.trail.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
        
        // Draw robot with enhanced visuals
        ctx.save();
        ctx.translate(robot.position.x, robot.position.y);
        
        // Glow effect
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, ROBOT_RADIUS * 2);
        gradient.addColorStop(0, robot.color + "40");
        gradient.addColorStop(1, robot.color + "00");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, ROBOT_RADIUS * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Robot body with gradient
        const bodyGradient = ctx.createRadialGradient(-2, -2, 0, 0, 0, ROBOT_RADIUS);
        bodyGradient.addColorStop(0, robot.color + "ff");
        bodyGradient.addColorStop(0.8, robot.color + "dd");
        bodyGradient.addColorStop(1, robot.color + "aa");
        
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.arc(0, 0, ROBOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        // Robot outline
        ctx.strokeStyle = "#ffffff40";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Direction indicator with animation
        const angle = Math.atan2(robot.velocity.y, robot.velocity.x);
        const speed = vec2.magnitude(robot.velocity);
        const pulseScale = 1 + Math.sin(Date.now() * 0.01 + robot.id) * 0.2 * (speed / MAX_VELOCITY);
        
        ctx.rotate(angle);
        ctx.scale(pulseScale, pulseScale);
        
        // Direction arrow
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(ROBOT_RADIUS * 0.4, 0);
        ctx.lineTo(-ROBOT_RADIUS * 0.2, -ROBOT_RADIUS * 0.2);
        ctx.lineTo(-ROBOT_RADIUS * 0.2, ROBOT_RADIUS * 0.2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
        
        // Wall following mode indicator with animation
        if (robot.wallFollowMode) {
          const pulseIntensity = Math.sin(Date.now() * 0.008) * 0.5 + 0.5;
          ctx.strokeStyle = `rgba(255, 255, 0, ${0.6 + pulseIntensity * 0.4})`;
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.lineDashOffset = Date.now() * 0.01;
          ctx.beginPath();
          ctx.arc(robot.position.x, robot.position.y, ROBOT_RADIUS + 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
      
      // Draw target
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(mouseRef.current.x, mouseRef.current.y, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Event listeners
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleResize = () => {
      updateSize();
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isClient]);
  
  if (!isClient) {
    return null;
  }
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10"
      style={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        mixBlendMode: "multiply",
        opacity: 0.8
      }}
    />
  );
}