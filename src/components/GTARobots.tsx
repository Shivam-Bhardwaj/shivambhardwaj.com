"use client";
import { useEffect, useRef } from "react";
import { useThemeColors } from "@/lib/theme/theme-colors";

// Advanced swarm robot constants
const NUM_ROBOTS = 8;
const ROBOT_SIZE = 12;
const MAX_SPEED = 3.5;
const SEEK_FORCE = 0.15;
const AVOID_FORCE = 2.0;
const OBSTACLE_AVOIDANCE_DISTANCE = 100;
const WALL_AVOIDANCE_DISTANCE = 80;

// DOM element avoidance constants - much tighter for squeezing through
const TEXT_AVOID_DISTANCE = 25;
const BUTTON_AVOID_DISTANCE = 35;
const LOGO_SIZE = 60;

// Advanced swarm intelligence constants
const SEPARATION_DISTANCE = 50;
const ALIGNMENT_DISTANCE = 80;
const COHESION_DISTANCE = 120;
const SEPARATION_FORCE = 0.8;
const ALIGNMENT_FORCE = 0.4;
const COHESION_FORCE = 0.3;
const LEADER_INFLUENCE = 0.5;
const WANDER_FORCE = 0.2;
const FORMATION_FORCE = 0.6;

// Advanced communication network constants
const COMMUNICATION_RANGE = 100;
const EXTENDED_LOCK_RANGE = 200;
const CONNECTION_OPACITY = 0.6;
const CONNECTION_PULSE_SPEED = 0.003;
const LOCK_DURATION = 3000; // ms
const MIN_LOCK_TIME = 500; // ms

interface Robot {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number; // acceleration
  ay: number;
  color: string;
  trail: { x: number; y: number }[];
  type: 'police' | 'civilian' | 'emergency';
  role: 'leader' | 'follower' | 'scout';
  energy: number;
  wanderAngle: number;
  formationTarget?: { x: number; y: number };
  lastCommunication?: number;
  connectedTo: number[];
  lockedConnections: Map<number, { until: number; strength: number }>;
  behavior: 'seeking' | 'flocking' | 'exploring' | 'forming';
  dataTransferred: number;
  messagesReceived: number;
}

interface City {
  name: string;
  x: number;
  y: number;
  discovered: boolean;
  discoveredAt?: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'logo' | 'text' | 'button' | 'interactive';
  logoName?: string;
  color?: string;
  avoidDistance?: number;
}

export default function GTARobots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const robotsRef = useRef<Robot[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const logoImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const citiesRef = useRef<City[]>([]);
  const themeColors = useThemeColors();

  // Initialize robots with GTA vehicle types
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    
    const robotTypes: ('police' | 'civilian' | 'emergency')[] = ['police', 'civilian', 'emergency'];
    const robotRoles: ('leader' | 'follower' | 'scout')[] = ['leader', 'follower', 'scout'];
    const colors = ["#0066ff", "#ff6600", "#ff0066"];
    
    robotsRef.current = Array.from({ length: NUM_ROBOTS }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      ax: 0,
      ay: 0,
      color: colors[i % colors.length],
      trail: [],
      type: robotTypes[i % robotTypes.length],
      role: i === 0 ? 'leader' : i < 3 ? 'scout' : 'follower',
      energy: 100,
      wanderAngle: Math.random() * Math.PI * 2,
      connectedTo: [],
      lockedConnections: new Map(),
      behavior: 'exploring',
      dataTransferred: 0,
      messagesReceived: 0
    }));

    // Create robotics company logos as obstacles - using CDN logos
    const availableLogos = [
      { name: 'Tesla', path: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tesla.svg', color: '#E82127' },
      { name: 'NVIDIA', path: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/nvidia.svg', color: '#76B900' },
      { name: 'Meta', path: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/meta.svg', color: '#0668E1' },
      { name: 'Google', path: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/google.svg', color: '#4285F4' },
      { name: 'Apple', path: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/apple.svg', color: '#000000' },
      { name: 'Microsoft', path: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoft.svg', color: '#5E5E5E' },
      { name: 'Amazon', path: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/amazon.svg', color: '#FF9900' },
      { name: 'OpenAI', path: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/openai.svg', color: '#412991' }
    ];
    
    // Preload logo images with CORS support
    availableLogos.forEach(logo => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = logo.path;
      img.onload = () => {
        logoImagesRef.current.set(logo.name, img);
      };
      img.onerror = () => {
        // console.log(`Failed to load logo for ${logo.name}, using fallback`); // Removed for production
      };
    });
    
    // Fewer logos on mobile for performance
    const logosToShow = isMobile ? availableLogos.slice(0, 4) : availableLogos.slice(0, 6);
    obstaclesRef.current = logosToShow.map((logo) => ({
      x: Math.random() * (width - LOGO_SIZE),
      y: Math.random() * (height - LOGO_SIZE),
      width: LOGO_SIZE,
      height: LOGO_SIZE,
      type: 'logo' as const,
      logoName: logo.name,
      color: logo.color,
      avoidDistance: isMobile ? 30 : 40
    }));

    // Initialize cities around the world (scaled to screen)
    const worldCities = [
      { name: "New York", x: width * 0.25, y: height * 0.35 },
      { name: "London", x: width * 0.52, y: height * 0.32 },
      { name: "Tokyo", x: width * 0.85, y: height * 0.38 },
      { name: "Sydney", x: width * 0.88, y: height * 0.75 },
      { name: "São Paulo", x: width * 0.32, y: height * 0.72 },
      { name: "Cairo", x: width * 0.58, y: height * 0.45 },
      { name: "Moscow", x: width * 0.62, y: height * 0.25 },
      { name: "Delhi", x: width * 0.72, y: height * 0.42 },
      { name: "Los Angeles", x: width * 0.18, y: height * 0.42 },
      { name: "Dubai", x: width * 0.67, y: height * 0.48 }
    ];

    citiesRef.current = worldCities.map(city => ({
      ...city,
      discovered: false
    }));

    mouseRef.current = { x: width / 2, y: height / 2 };
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Function to detect and categorize DOM elements as obstacles
  const updateDOMObstacles = () => {
    // Only consider semantic text and interactive elements, skip large containers
    const selector = "button, a, input, textarea, select, [role='button'], h1, h2, h3, h4, h5, h6, p, label";
    const allElements = Array.from(document.querySelectorAll(selector));

    const domObstacles: Obstacle[] = [];

    allElements.forEach(el => {
      if (el === canvasRef.current || el === document.body || el === document.documentElement || !document.body) return;
      
      const rect = el.getBoundingClientRect();
      
      // Skip tiny, hidden, or very large layout containers
      if (rect.width < 20 || rect.height < 20) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (rect.width > vw * 0.85 || rect.height > vh * 0.6) return;
      
      const style = window.getComputedStyle(el);
      if (style.visibility === 'hidden' || style.opacity === '0' || style.display === 'none') return;
      
      // Check if element has text content
      const hasText = el.textContent && el.textContent.trim().length > 2;
      if (!hasText) return;
      
      // Categorize element type with very tight padding for squeezing through
      let type: 'text' | 'button' | 'interactive' = 'text';
      let avoidDistance = TEXT_AVOID_DISTANCE;
      let padding = 8; // Much tighter padding
      
      const tagName = el.tagName.toLowerCase();
      const role = el.getAttribute('role');
      
      if (tagName === 'button' || role === 'button' || el.getAttribute('data-role') === 'button') {
        type = 'button';
        avoidDistance = BUTTON_AVOID_DISTANCE;
        padding = 12;
      } else if (tagName === 'a' && (el as HTMLAnchorElement).href) {
        type = 'button';
        avoidDistance = BUTTON_AVOID_DISTANCE;
        padding = 10;
      } else if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
        type = 'interactive';
        avoidDistance = BUTTON_AVOID_DISTANCE;
        padding = 10;
      } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        type = 'text';
        avoidDistance = TEXT_AVOID_DISTANCE;
        padding = 6;
      }
      
      domObstacles.push({
        x: rect.left - padding / 2,
        y: rect.top - padding / 2,
        width: rect.width + padding,
        height: rect.height + padding,
        type,
        avoidDistance
      });
    });

    return domObstacles;
  };

  // Swarm intelligence functions
  const getNeighbors = (robot: Robot, robots: Robot[], radius: number) => {
    return robots.filter(other => {
      if (other.id === robot.id) return false;
      const dx = other.x - robot.x;
      const dy = other.y - robot.y;
      return Math.sqrt(dx * dx + dy * dy) < radius;
    });
  };

  // Advanced communication with locking mechanism
  const updateCommunicationNetwork = (robots: Robot[]) => {
    const now = Date.now();
    
    robots.forEach(robot => {
      robot.connectedTo = [];
      
      // Clean up expired locks
      robot.lockedConnections.forEach((lock, otherId) => {
        if (now > lock.until) {
          robot.lockedConnections.delete(otherId);
        }
      });
      
      robots.forEach(other => {
        if (other.id !== robot.id) {
          const dx = other.x - robot.x;
          const dy = other.y - robot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Check for existing lock
          const existingLock = robot.lockedConnections.get(other.id);
          
          if (existingLock && distance < EXTENDED_LOCK_RANGE) {
            // Maintain locked connection at extended range
            robot.connectedTo.push(other.id);
            // Update lock strength based on distance
            existingLock.strength = 1 - (distance / EXTENDED_LOCK_RANGE);
            // Data transfer simulation
            robot.dataTransferred += existingLock.strength * 10;
            robot.messagesReceived++;
          } else if (distance < COMMUNICATION_RANGE) {
            // New connection within range
            robot.connectedTo.push(other.id);
            
            // Create new lock with duration inversely proportional to distance
            const lockStrength = 1 - (distance / COMMUNICATION_RANGE);
            const lockDuration = MIN_LOCK_TIME + (LOCK_DURATION * lockStrength);
            
            robot.lockedConnections.set(other.id, {
              until: now + lockDuration,
              strength: lockStrength
            });
            
            // Initial data burst
            robot.dataTransferred += lockStrength * 50;
          }
        }
      });
      
      robot.lastCommunication = now;
    });
  };

  // Draw communication connections as a web
  const drawCommunicationWeb = (ctx: CanvasRenderingContext2D, robots: Robot[]) => {
    const drawnConnections = new Set<string>();
    const pulsePhase = Math.sin(Date.now() * CONNECTION_PULSE_SPEED);
    
    robots.forEach(robot => {
      robot.connectedTo.forEach(otherId => {
        // Create unique connection key to avoid drawing duplicates
        const connectionKey = robot.id < otherId ? `${robot.id}-${otherId}` : `${otherId}-${robot.id}`;
        
        if (!drawnConnections.has(connectionKey)) {
          drawnConnections.add(connectionKey);
          
          const other = robots.find(r => r.id === otherId);
          if (other) {
            const dx = other.x - robot.x;
            const dy = other.y - robot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Calculate connection strength based on distance
            const strength = 1 - (distance / COMMUNICATION_RANGE);
            const opacity = CONNECTION_OPACITY * strength;
            
            // Draw connection line
            ctx.save();
            ctx.strokeStyle = themeColors.robot.communication.connection.replace('0.6', opacity.toString());
            ctx.lineWidth = 1 + strength * 2;
            ctx.setLineDash([5, 5]);
            ctx.lineDashOffset = -Date.now() * 0.01;
            
            ctx.beginPath();
            ctx.moveTo(robot.x, robot.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
            
            // Draw data packets animation
            if (robot.role === 'leader' || other.role === 'leader') {
              const packetProgress = ((Date.now() * 0.001) % 1);
              const packetX = robot.x + (other.x - robot.x) * packetProgress;
              const packetY = robot.y + (other.y - robot.y) * packetProgress;
              
              ctx.fillStyle = themeColors.robot.communication.packet.replace('0.9', (0.8 + pulsePhase * 0.2).toString());
              ctx.beginPath();
              ctx.arc(packetX, packetY, 3, 0, Math.PI * 2);
              ctx.fill();
            }
            
            ctx.restore();
            
            // Draw signal strength indicator at midpoint
            if (strength > 0.7) {
              const midX = (robot.x + other.x) / 2;
              const midY = (robot.y + other.y) / 2;
              
              ctx.save();
              ctx.fillStyle = themeColors.robot.communication.strong.replace('0.4', (0.3 + pulsePhase * 0.1).toString());
              ctx.beginPath();
              ctx.arc(midX, midY, 5 * strength, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          }
        }
      });
    });
  };

  const separation = (robot: Robot, neighbors: Robot[]) => {
    let steerX = 0, steerY = 0;
    let count = 0;
    
    neighbors.forEach(neighbor => {
      const dx = robot.x - neighbor.x;
      const dy = robot.y - neighbor.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0 && distance < SEPARATION_DISTANCE) {
        const force = (SEPARATION_DISTANCE - distance) / SEPARATION_DISTANCE;
        steerX += (dx / distance) * force;
        steerY += (dy / distance) * force;
        count++;
      }
    });
    
    if (count > 0) {
      steerX /= count;
      steerY /= count;
    }
    
    return { x: steerX * SEPARATION_FORCE, y: steerY * SEPARATION_FORCE };
  };

  const alignment = (robot: Robot, neighbors: Robot[]) => {
    if (neighbors.length === 0) return { x: 0, y: 0 };
    
    let avgVx = 0, avgVy = 0;
    let weightSum = 0;
    
    neighbors.forEach(neighbor => {
      // Weight by connection strength if locked
      const lock = robot.lockedConnections.get(neighbor.id);
      const weight = lock ? lock.strength : 0.5;
      
      avgVx += neighbor.vx * weight;
      avgVy += neighbor.vy * weight;
      weightSum += weight;
    });
    
    if (weightSum > 0) {
      avgVx /= weightSum;
      avgVy /= weightSum;
    }
    
    const dx = avgVx - robot.vx;
    const dy = avgVy - robot.vy;
    
    return { x: dx * ALIGNMENT_FORCE, y: dy * ALIGNMENT_FORCE };
  };

  const cohesion = (robot: Robot, neighbors: Robot[]) => {
    if (neighbors.length === 0) return { x: 0, y: 0 };
    
    let centerX = 0, centerY = 0;
    neighbors.forEach(neighbor => {
      centerX += neighbor.x;
      centerY += neighbor.y;
    });
    
    centerX /= neighbors.length;
    centerY /= neighbors.length;
    
    const dx = centerX - robot.x;
    const dy = centerY - robot.y;
    
    return { x: dx * COHESION_FORCE, y: dy * COHESION_FORCE };
  };

  const wander = (robot: Robot) => {
    // Lévy flight-inspired wandering for better exploration
    const levy = Math.random() < 0.1 ? 3 : 1; // Occasional long jumps
    robot.wanderAngle += (Math.random() - 0.5) * 0.3 * levy;
    
    const wanderRadius = 50;
    const wanderDistance = 80;
    const wanderJitter = 0.3;
    
    // Project wander circle ahead of robot
    const circleX = robot.vx * wanderDistance;
    const circleY = robot.vy * wanderDistance;
    
    // Random point on circle
    robot.wanderAngle += (Math.random() - 0.5) * wanderJitter;
    const wanderX = circleX + Math.cos(robot.wanderAngle) * wanderRadius;
    const wanderY = circleY + Math.sin(robot.wanderAngle) * wanderRadius;
    
    const mag = Math.sqrt(wanderX * wanderX + wanderY * wanderY);
    if (mag > 0) {
      return { x: (wanderX / mag) * WANDER_FORCE, y: (wanderY / mag) * WANDER_FORCE };
    }
    return { x: 0, y: 0 };
  };

  const leaderFollowing = (robot: Robot, robots: Robot[]) => {
    if (robot.role === 'leader') return { x: 0, y: 0 };
    
    const leader = robots.find(r => r.role === 'leader');
    if (!leader) return { x: 0, y: 0 };
    
    const dx = leader.x - robot.x;
    const dy = leader.y - robot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 80) { // Follow if too far from leader
      return { 
        x: (dx / distance) * LEADER_INFLUENCE, 
        y: (dy / distance) * LEADER_INFLUENCE 
      };
    }
    
    return { x: 0, y: 0 };
  };

  const emergentFormation = (robot: Robot, robots: Robot[]) => {
    // Create dynamic formations based on context
    const leader = robots.find(r => r.role === 'leader');
    if (!leader || robot.role === 'leader') return { x: 0, y: 0 };
    
    // V-formation when moving fast
    const leaderSpeed = Math.sqrt(leader.vx * leader.vx + leader.vy * leader.vy);
    if (leaderSpeed > 2) {
      const leaderAngle = Math.atan2(leader.vy, leader.vx);
      const followers = robots.filter(r => r.role === 'follower');
      const robotIndex = followers.findIndex(r => r.id === robot.id);
      
      if (robotIndex !== -1) {
        const side = robotIndex % 2 === 0 ? -1 : 1;
        const offsetAngle = leaderAngle + (Math.PI / 4) * side;
        const distance = 60 + robotIndex * 20;
        
        const targetX = leader.x - Math.cos(offsetAngle) * distance;
        const targetY = leader.y - Math.sin(offsetAngle) * distance;
        
        const dx = targetX - robot.x;
        const dy = targetY - robot.y;
        
        return { x: dx * 0.1, y: dy * 0.1 };
      }
    }
    
    return { x: 0, y: 0 };
  };

  // Draw simplified world map outline
  const drawWorldMap = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = themeColors.game.world.outline;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    
    // Draw simplified continent outlines
    ctx.beginPath();
    
    // North America outline (very simplified)
    ctx.moveTo(width * 0.15, height * 0.25);
    ctx.lineTo(width * 0.35, height * 0.20);
    ctx.lineTo(width * 0.38, height * 0.35);
    ctx.lineTo(width * 0.25, height * 0.55);
    ctx.lineTo(width * 0.15, height * 0.45);
    ctx.closePath();
    
    // Europe outline
    ctx.moveTo(width * 0.48, height * 0.25);
    ctx.lineTo(width * 0.58, height * 0.22);
    ctx.lineTo(width * 0.60, height * 0.35);
    ctx.lineTo(width * 0.50, height * 0.40);
    ctx.closePath();
    
    // Asia outline
    ctx.moveTo(width * 0.60, height * 0.20);
    ctx.lineTo(width * 0.90, height * 0.25);
    ctx.lineTo(width * 0.92, height * 0.50);
    ctx.lineTo(width * 0.65, height * 0.45);
    ctx.closePath();
    
    // Australia outline
    ctx.moveTo(width * 0.82, height * 0.70);
    ctx.lineTo(width * 0.92, height * 0.68);
    ctx.lineTo(width * 0.90, height * 0.78);
    ctx.lineTo(width * 0.80, height * 0.76);
    ctx.closePath();
    
    // South America outline
    ctx.moveTo(width * 0.28, height * 0.55);
    ctx.lineTo(width * 0.38, height * 0.52);
    ctx.lineTo(width * 0.35, height * 0.85);
    ctx.lineTo(width * 0.25, height * 0.82);
    ctx.closePath();
    
    ctx.stroke();
  };

  // Check for city discovery
  const checkCityDiscovery = (robot: Robot) => {
    citiesRef.current.forEach(city => {
      if (!city.discovered) {
        const dx = robot.x - city.x;
        const dy = robot.y - city.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 60) { // Discovery radius
          city.discovered = true;
          city.discoveredAt = Date.now();
        }
      }
    });
  };

  // Advanced obstacle avoidance using ray casting
  const getAvoidanceForce = (robot: Robot, allObstacles: Obstacle[]) => {
    let avoidX = 0;
    let avoidY = 0;

    // Check multiple rays for better avoidance
    const rayAngles = [-Math.PI/3, -Math.PI/6, 0, Math.PI/6, Math.PI/3];
    const robotAngle = Math.atan2(robot.vy, robot.vx);

    rayAngles.forEach(angleOffset => {
      const rayAngle = robotAngle + angleOffset;
      const rayDx = Math.cos(rayAngle);
      const rayDy = Math.sin(rayAngle);

      // Cast ray to check for obstacles
      for (let distance = ROBOT_SIZE; distance < OBSTACLE_AVOIDANCE_DISTANCE; distance += 10) {
        const rayX = robot.x + rayDx * distance;
        const rayY = robot.y + rayDy * distance;

        // Check collision with all obstacles (static + DOM)
        for (const obstacle of allObstacles) {
          if (rayX >= obstacle.x && rayX <= obstacle.x + obstacle.width &&
              rayY >= obstacle.y && rayY <= obstacle.y + obstacle.height) {
            
            // Calculate avoidance force based on distance and angle
            const avoidStrength = (OBSTACLE_AVOIDANCE_DISTANCE - distance) / OBSTACLE_AVOIDANCE_DISTANCE;
            const perpendicularX = -rayDy;
            const perpendicularY = rayDx;
            
            // Stronger avoidance for buttons and interactive elements
            const typeMultiplier = obstacle.type === 'button' || obstacle.type === 'interactive' ? 1.8 : 
                                 obstacle.type === 'text' ? 1.3 : 1.0;
            
            avoidX += perpendicularX * avoidStrength * AVOID_FORCE * typeMultiplier;
            avoidY += perpendicularY * avoidStrength * AVOID_FORCE * typeMultiplier;
            return; // Exit early if obstacle found
          }
        }

        // Check collision with screen boundaries
        const canvas = canvasRef.current;
        if (canvas && (rayX < 0 || rayX > canvas.width || rayY < 0 || rayY > canvas.height)) {
          const avoidStrength = (WALL_AVOIDANCE_DISTANCE - distance) / WALL_AVOIDANCE_DISTANCE;
          const perpendicularX = -rayDy;
          const perpendicularY = rayDx;
          
          avoidX += perpendicularX * avoidStrength * AVOID_FORCE;
          avoidY += perpendicularY * avoidStrength * AVOID_FORCE;
          break;
        }
      }
    });

    return { x: avoidX, y: avoidY };
  };

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = () => {
      // Clear with theme background
      ctx.fillStyle = themeColors.canvas.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw world map outline
      drawWorldMap(ctx, canvas.width, canvas.height);

      // Update and draw communication network
      updateCommunicationNetwork(robotsRef.current);
      drawCommunicationWeb(ctx, robotsRef.current);

      const mouse = mouseRef.current;

      // Get dynamic DOM obstacles
      const domObstacles = updateDOMObstacles();
      
      // Combine static and dynamic obstacles
      const allObstacles = [...obstaclesRef.current, ...domObstacles];

      // Update robots with sophisticated flocking behavior
      robotsRef.current.forEach(robot => {
        // Reset acceleration
        robot.ax = 0;
        robot.ay = 0;
        
        // Determine behavior based on context
        const distanceToTarget = Math.sqrt(
          Math.pow(mouse.x - robot.x, 2) + Math.pow(mouse.y - robot.y, 2)
        );
        
        const nearbyRobots = getNeighbors(robot, robotsRef.current, ALIGNMENT_DISTANCE);
        const closeRobots = getNeighbors(robot, robotsRef.current, SEPARATION_DISTANCE);
        const flockmates = getNeighbors(robot, robotsRef.current, COHESION_DISTANCE);
        
        // Update behavior state
        if (distanceToTarget < 100) {
          robot.behavior = 'forming';
        } else if (nearbyRobots.length > 3) {
          robot.behavior = 'flocking';
        } else if (robot.role === 'scout') {
          robot.behavior = 'exploring';
        } else {
          robot.behavior = 'seeking';
        }
        
        // Calculate forces based on behavior
        let forceX = 0, forceY = 0;
        
        // 1. Obstacle avoidance (highest priority)
        const avoidance = getAvoidanceForce(robot, allObstacles);
        forceX += avoidance.x * 2.0;
        forceY += avoidance.y * 2.0;
        
        // 2. Separation (high priority)
        if (closeRobots.length > 0) {
          const sep = separation(robot, closeRobots);
          forceX += sep.x;
          forceY += sep.y;
        }
        
        // 3. Behavior-specific forces
        switch (robot.behavior) {
          case 'flocking': {
            // Classic boids algorithm
            const align = alignment(robot, nearbyRobots);
            const coh = cohesion(robot, flockmates);
            
            forceX += align.x;
            forceY += align.y;
            forceX += coh.x;
            forceY += coh.y;
            
            // Weak target seeking
            const dx = mouse.x - robot.x;
            const dy = mouse.y - robot.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
              forceX += (dx / dist) * SEEK_FORCE * 0.3;
              forceY += (dy / dist) * SEEK_FORCE * 0.3;
            }
            break;
          }
          
          case 'forming': {
            // Formation around target
            const formation = emergentFormation(robot, robotsRef.current);
            forceX += formation.x;
            forceY += formation.y;
            
            // Strong cohesion when forming
            const coh = cohesion(robot, flockmates);
            forceX += coh.x * 2;
            forceY += coh.y * 2;
            break;
          }
          
          case 'exploring': {
            // Wander with occasional target checks
            const wanderForce = wander(robot);
            forceX += wanderForce.x;
            forceY += wanderForce.y;
            
            // Weak target influence
            const dx = mouse.x - robot.x;
            const dy = mouse.y - robot.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
              forceX += (dx / dist) * SEEK_FORCE * 0.1;
              forceY += (dy / dist) * SEEK_FORCE * 0.1;
            }
            break;
          }
          
          case 'seeking':
          default: {
            // Direct path to target with swarm coordination
            const dx = mouse.x - robot.x;
            const dy = mouse.y - robot.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
              forceX += (dx / dist) * SEEK_FORCE;
              forceY += (dy / dist) * SEEK_FORCE;
            }
            
            // Light flocking
            if (nearbyRobots.length > 0) {
              const align = alignment(robot, nearbyRobots);
              forceX += align.x * 0.5;
              forceY += align.y * 0.5;
            }
            
            // Leader influence
            if (robot.role !== 'leader') {
              const leader = leaderFollowing(robot, robotsRef.current);
              forceX += leader.x;
              forceY += leader.y;
            }
            break;
          }
        }
        
        // Apply forces as acceleration
        robot.ax = forceX;
        robot.ay = forceY;
        
        // Update velocity with acceleration
        robot.vx += robot.ax;
        robot.vy += robot.ay;

        // Limit speed based on robot type
        const typeSpeedMultiplier = robot.type === 'emergency' ? 1.3 : robot.type === 'police' ? 1.1 : 1.0;
        const maxSpeed = MAX_SPEED * typeSpeedMultiplier;
        const speed = Math.sqrt(robot.vx * robot.vx + robot.vy * robot.vy);
        if (speed > maxSpeed) {
          robot.vx = (robot.vx / speed) * maxSpeed;
          robot.vy = (robot.vy / speed) * maxSpeed;
        }

        // Update position
        robot.x += robot.vx;
        robot.y += robot.vy;

        // Screen boundaries with bounce
        if (robot.x < ROBOT_SIZE || robot.x > canvas.width - ROBOT_SIZE) {
          robot.vx *= -0.8;
          robot.x = Math.max(ROBOT_SIZE, Math.min(canvas.width - ROBOT_SIZE, robot.x));
        }
        if (robot.y < ROBOT_SIZE || robot.y > canvas.height - ROBOT_SIZE) {
          robot.vy *= -0.8;
          robot.y = Math.max(ROBOT_SIZE, Math.min(canvas.height - ROBOT_SIZE, robot.y));
        }

        // Update trail
        robot.trail.push({ x: robot.x, y: robot.y });
        if (robot.trail.length > 20) robot.trail.shift();

        // Check for city discovery
        checkCityDiscovery(robot);
      });

      // Draw only logo obstacles (no DOM visualization)
      obstaclesRef.current.forEach(obstacle => {
        if (obstacle.type === 'logo' && obstacle.logoName) {
          const logoImage = logoImagesRef.current.get(obstacle.logoName);
          
          // Draw background circle with company color
          ctx.save();
          const centerX = obstacle.x + obstacle.width/2;
          const centerY = obstacle.y + obstacle.height/2;
          const radius = obstacle.width/2;
          
          // Background with company color
          ctx.fillStyle = obstacle.color ? obstacle.color + '20' : 'rgba(255, 255, 255, 0.1)';
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fill();
          
          // Border with company color
          ctx.strokeStyle = obstacle.color ? obstacle.color + '80' : 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
          
          if (logoImage && logoImage.complete) {
            // Draw logo image with color filter
            ctx.globalAlpha = 0.9;
            
            // Create a smaller logo inside the circle
            const logoSize = obstacle.width * 0.6;
            const logoX = centerX - logoSize/2;
            const logoY = centerY - logoSize/2;
            
            // Draw white version of logo
            ctx.filter = 'brightness(0) invert(1)';
            ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
            ctx.filter = 'none';
          } else {
            // Fallback: Draw company initial
            ctx.fillStyle = themeColors.ui.text.primary;
            ctx.font = `bold ${obstacle.width * 0.4}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(obstacle.logoName.charAt(0), centerX, centerY);
          }
          
          // Company name below logo
          ctx.fillStyle = themeColors.ui.text.primary;
          ctx.font = "10px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(obstacle.logoName, centerX, obstacle.y + obstacle.height + 5);
          
          ctx.restore();
        }
      });

      // Draw communication nodes for each robot
      robotsRef.current.forEach(robot => {
        if (robot.connectedTo.length > 0) {
          // Draw communication aura
          const pulseScale = 1 + Math.sin((Date.now() + robot.id * 100) * 0.003) * 0.1;
          ctx.save();
          ctx.fillStyle = themeColors.robot.communication.node.replace(/[\d\.]+\)$/, (0.1 * pulseScale) + ')');
          ctx.beginPath();
          ctx.arc(robot.x, robot.y, ROBOT_SIZE * 2 * pulseScale, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // Draw robots as intelligent swarm vehicles
      robotsRef.current.forEach(robot => {
        // Enhanced trail with role-based styling
        if (robot.trail.length > 1) {
          const trailWidth = robot.role === 'leader' ? 4 : robot.role === 'scout' ? 2 : 3;
          
          ctx.strokeStyle = robot.role === 'leader' ? themeColors.robot.trail.leader : 
                           robot.role === 'scout' ? themeColors.robot.trail.scout : 
                           themeColors.robot.trail.follower;
          ctx.lineWidth = trailWidth;
          ctx.beginPath();
          robot.trail.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }

        // Vehicle body with role indicators
        ctx.save();
        ctx.translate(robot.x, robot.y);
        
        const angle = Math.atan2(robot.vy, robot.vx);
        ctx.rotate(angle);
        
        // Role-based vehicle modifications
        const roleSize = robot.role === 'leader' ? ROBOT_SIZE * 1.2 : 
                        robot.role === 'scout' ? ROBOT_SIZE * 0.8 : ROBOT_SIZE;
        
        // Vehicle shape based on type and role
        ctx.fillStyle = robot.color;
        if (robot.type === 'police') {
          // Police car - square with light bar
          ctx.fillRect(-roleSize, -roleSize/2, roleSize * 2, roleSize);
          ctx.fillStyle = "#ff0000";
          ctx.fillRect(-roleSize/2, -roleSize/2 - 5, roleSize, 3);
        } else if (robot.type === 'emergency') {
          // Ambulance - larger rectangle
          ctx.fillRect(-roleSize * 1.2, -roleSize/2, roleSize * 2.4, roleSize);
          ctx.fillStyle = themeColors.ui.text.primary;
          ctx.fillRect(-roleSize/2, -roleSize/4, roleSize/4, roleSize/2);
        } else {
          // Civilian car - normal rectangle
          ctx.fillRect(-roleSize, -roleSize/2, roleSize * 2, roleSize);
        }
        
        // Role-based indicators
        if (robot.role === 'leader') {
          // Leader crown/antenna
          ctx.fillStyle = themeColors.robot.indicators.leader;
          ctx.fillRect(-2, -roleSize/2 - 8, 4, 6);
          ctx.fillRect(-4, -roleSize/2 - 10, 8, 2);
        } else if (robot.role === 'scout') {
          // Scout radar dish
          ctx.strokeStyle = themeColors.robot.indicators.scout;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, -roleSize/2 - 4, 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Direction indicator (headlights)
        ctx.fillStyle = themeColors.robot.indicators.headlight;
        ctx.fillRect(roleSize - 2, -3, 4, 6);
        
        // Communication indicator
        if (robot.connectedTo.length > 0) {
          ctx.fillStyle = themeColors.robot.communication.node;
          ctx.beginPath();
          ctx.arc(0, 0, roleSize + 5, 0, Math.PI * 2);
          ctx.globalAlpha = 0.2;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        
        ctx.restore();

        // Debug: Show avoidance rays
        if (robot.id === 0) {
          const robotAngle = Math.atan2(robot.vy, robot.vx);
          const rayAngles = [-Math.PI/3, -Math.PI/6, 0, Math.PI/6, Math.PI/3];
          
          ctx.strokeStyle = themeColors.game.debug.ray;
          ctx.lineWidth = 1;
          rayAngles.forEach(angleOffset => {
            const rayAngle = robotAngle + angleOffset;
            const rayDx = Math.cos(rayAngle);
            const rayDy = Math.sin(rayAngle);
            
            ctx.beginPath();
            ctx.moveTo(robot.x, robot.y);
            ctx.lineTo(robot.x + rayDx * OBSTACLE_AVOIDANCE_DISTANCE, robot.y + rayDy * OBSTACLE_AVOIDANCE_DISTANCE);
            ctx.stroke();
          });
        }
      });

      // Draw cities
      citiesRef.current.forEach(city => {
        const centerX = city.x;
        const centerY = city.y;
        const radius = 8;
        
        if (city.discovered) {
          // Discovered city - bright and pulsing
          const pulseScale = 1 + Math.sin(Date.now() * 0.01) * 0.2;
          
          // City glow effect
          ctx.save();
          ctx.fillStyle = themeColors.game.city.discovered;
          ctx.shadowColor = themeColors.game.city.glow;
          ctx.shadowBlur = 20 * pulseScale;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius * pulseScale, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          
          // City name
          ctx.fillStyle = themeColors.ui.text.primary;
          ctx.font = "12px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(city.name, centerX, centerY + radius + 5);
          
          // Discovery animation
          if (city.discoveredAt && Date.now() - city.discoveredAt < 2000) {
            const elapsed = Date.now() - city.discoveredAt;
            const animRadius = (elapsed / 2000) * 50;
            const opacity = 1 - (elapsed / 2000);
            
            ctx.strokeStyle = themeColors.game.city.glow.replace(/[\d\.]+\)$/, opacity + ')');
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(centerX, centerY, animRadius, 0, Math.PI * 2);
            ctx.stroke();
          }
        } else {
          // Undiscovered city - dim gray dot
          ctx.fillStyle = themeColors.game.city.undiscovered;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw target (mouse position)
      ctx.fillStyle = themeColors.robot.indicators.target;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Target crosshairs
      ctx.strokeStyle = themeColors.robot.indicators.crosshair;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mouse.x - 20, mouse.y);
      ctx.lineTo(mouse.x + 20, mouse.y);
      ctx.moveTo(mouse.x, mouse.y - 20);
      ctx.lineTo(mouse.x, mouse.y + 20);
      ctx.stroke();

      // Telemetry Dashboard
      const leader = robotsRef.current.find(r => r.role === 'leader');
      const followers = robotsRef.current.filter(r => r.role === 'follower').length;
      const scouts = robotsRef.current.filter(r => r.role === 'scout').length;
      const discoveredCities = citiesRef.current.filter(c => c.discovered).length;
      const totalCities = citiesRef.current.length;
      
      // Calculate network statistics
      const totalConnections = robotsRef.current.reduce((sum, r) => sum + r.connectedTo.length, 0) / 2;
      const lockedConnections = robotsRef.current.reduce((sum, r) => sum + r.lockedConnections.size, 0) / 2;
      const avgConnections = (totalConnections * 2 / robotsRef.current.length).toFixed(1);
      const totalData = robotsRef.current.reduce((sum, r) => sum + r.dataTransferred, 0);
      const totalMessages = robotsRef.current.reduce((sum, r) => sum + r.messagesReceived, 0);
      
      // Behavior distribution
      const behaviors = {
        flocking: robotsRef.current.filter(r => r.behavior === 'flocking').length,
        seeking: robotsRef.current.filter(r => r.behavior === 'seeking').length,
        exploring: robotsRef.current.filter(r => r.behavior === 'exploring').length,
        forming: robotsRef.current.filter(r => r.behavior === 'forming').length
      };
      
      // Draw telemetry panel
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(5, 5, 320, 180);
      
      ctx.fillStyle = themeColors.ui.text.primary;
      ctx.font = "bold 14px monospace";
      ctx.fillText("🤖 SWARM TELEMETRY", 15, 25);
      
      ctx.font = "11px monospace";
      ctx.fillStyle = '#00ff00';
      
      // Swarm composition
      ctx.fillText(`SWARM COMPOSITION`, 15, 45);
      ctx.fillStyle = themeColors.ui.text.primary;
      ctx.fillText(`├─ Leader: 1 | Followers: ${followers} | Scouts: ${scouts}`, 15, 60);
      
      // Network stats
      ctx.fillStyle = '#00ff00';
      ctx.fillText(`NETWORK STATUS`, 15, 80);
      ctx.fillStyle = themeColors.ui.text.primary;
      ctx.fillText(`├─ Active Links: ${totalConnections} | Locked: ${lockedConnections}`, 15, 95);
      ctx.fillText(`├─ Avg Connections: ${avgConnections}/robot`, 15, 110);
      ctx.fillText(`├─ Data Transfer: ${(totalData/1000).toFixed(1)}KB | Messages: ${totalMessages}`, 15, 125);
      
      // Behavior analysis
      ctx.fillStyle = '#00ff00';
      ctx.fillText(`BEHAVIOR STATES`, 15, 145);
      ctx.fillStyle = themeColors.ui.text.primary;
      ctx.fillText(`├─ Flocking: ${behaviors.flocking} | Seeking: ${behaviors.seeking}`, 15, 160);
      ctx.fillText(`└─ Exploring: ${behaviors.exploring} | Forming: ${behaviors.forming}`, 15, 175);
      
      ctx.restore();
      
      // Technical description
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(canvas.width - 405, 5, 400, 120);
      
      ctx.fillStyle = '#00ff00';
      ctx.font = "bold 12px monospace";
      ctx.fillText("ALGORITHM INFO", canvas.width - 395, 25);
      
      ctx.fillStyle = themeColors.ui.text.primary;
      ctx.font = "10px monospace";
      ctx.fillText("• Reynolds Boids with adaptive behavior states", canvas.width - 395, 45);
      ctx.fillText("• Distance-based connection locking (inverse time)", canvas.width - 395, 60);
      ctx.fillText("• Weighted flocking forces by connection strength", canvas.width - 395, 75);
      ctx.fillText("• Lévy flight exploration patterns", canvas.width - 395, 90);
      ctx.fillText("• Ray-casting obstacle avoidance", canvas.width - 395, 105);
      ctx.fillText("• Emergent V-formation at high speeds", canvas.width - 395, 120);
      
      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 bg-gray-900"
      style={{ cursor: "crosshair" }}
    />
  );
}