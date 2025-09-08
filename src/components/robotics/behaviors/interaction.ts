import { RobotConfig } from '../../../lib/components/types';

export interface MouseInteraction {
  position: { x: number; y: number };
  isPressed: boolean;
  timestamp: number;
}

export interface InteractionForce {
  x: number;
  y: number;
  magnitude: number;
}

export enum InteractionMode {
  FOLLOW = 'follow',
  FLEE = 'flee',
  CURIOUS = 'curious',
  PLAYFUL = 'playful',
  AGGRESSIVE = 'aggressive',
  NEUTRAL = 'neutral',
}

export interface InteractionSettings {
  mode: InteractionMode;
  influenceRadius: number;
  responseStrength: number;
  decayRate: number;
  clickResponseMultiplier: number;
  attentionSpan: number; // milliseconds
}

export class InteractionBehavior {
  private settings: InteractionSettings = {
    mode: InteractionMode.CURIOUS,
    influenceRadius: 150,
    responseStrength: 1.2,
    decayRate: 0.98,
    clickResponseMultiplier: 2.5,
    attentionSpan: 3000,
  };

  private lastMouseInteraction: MouseInteraction | null = null;
  private interactionHistory: MouseInteraction[] = [];
  private maxHistoryLength = 10;

  constructor(settings?: Partial<InteractionSettings>) {
    if (settings) {
      this.settings = { ...this.settings, ...settings };
    }
  }

  updateMouseInteraction(position: { x: number; y: number }, isPressed: boolean): void {
    const interaction: MouseInteraction = {
      position,
      isPressed,
      timestamp: Date.now(),
    };

    this.lastMouseInteraction = interaction;
    
    if (isPressed) {
      this.interactionHistory.push(interaction);
      if (this.interactionHistory.length > this.maxHistoryLength) {
        this.interactionHistory.shift();
      }
    }
  }

  calculateInteractionForce(robot: RobotConfig): InteractionForce {
    if (!this.lastMouseInteraction) {
      return { x: 0, y: 0, magnitude: 0 };
    }

    const timeSinceInteraction = Date.now() - this.lastMouseInteraction.timestamp;
    if (timeSinceInteraction > this.settings.attentionSpan) {
      return { x: 0, y: 0, magnitude: 0 };
    }

    const distance = this.calculateDistance(robot.position, this.lastMouseInteraction.position);
    
    if (distance > this.settings.influenceRadius) {
      return { x: 0, y: 0, magnitude: 0 };
    }

    const baseForce = this.calculateBaseForce(robot, this.lastMouseInteraction);
    const modeModifier = this.getModeModifier(robot, this.lastMouseInteraction);
    const decayFactor = Math.pow(this.settings.decayRate, timeSinceInteraction / 100);

    const force = {
      x: baseForce.x * modeModifier * decayFactor,
      y: baseForce.y * modeModifier * decayFactor,
      magnitude: 0,
    };

    force.magnitude = Math.sqrt(force.x * force.x + force.y * force.y);
    return force;
  }

  private calculateBaseForce(robot: RobotConfig, interaction: MouseInteraction): InteractionForce {
    const distance = this.calculateDistance(robot.position, interaction.position);
    
    if (distance === 0) {
      return { x: 0, y: 0, magnitude: 0 };
    }

    const direction = {
      x: (interaction.position.x - robot.position.x) / distance,
      y: (interaction.position.y - robot.position.y) / distance,
    };

    let strength = (this.settings.influenceRadius - distance) / this.settings.influenceRadius;
    strength *= this.settings.responseStrength;

    if (interaction.isPressed) {
      strength *= this.settings.clickResponseMultiplier;
    }

    return {
      x: direction.x * strength,
      y: direction.y * strength,
      magnitude: strength,
    };
  }

  private getModeModifier(robot: RobotConfig, interaction: MouseInteraction): number {
    const distance = this.calculateDistance(robot.position, interaction.position);
    const normalizedDistance = distance / this.settings.influenceRadius;

    switch (this.settings.mode) {
      case InteractionMode.FOLLOW:
        return 1.0; // Always positive (attractive)

      case InteractionMode.FLEE:
        return -1.5; // Always negative (repulsive), stronger than follow

      case InteractionMode.CURIOUS:
        // Curious from medium distance, slight avoidance when very close
        if (normalizedDistance < 0.2) {
          return -0.3; // Slight avoidance when too close
        }
        return 1.2; // Strong attraction otherwise

      case InteractionMode.PLAYFUL:
        // Oscillating behavior based on interaction history
        const recentInteractions = this.getRecentInteractions(1000);
        const oscillation = Math.sin(Date.now() / 500) * 0.5;
        const historyFactor = Math.min(recentInteractions.length / 5, 1);
        return (0.8 + oscillation) * (1 + historyFactor);

      case InteractionMode.AGGRESSIVE:
        if (interaction.isPressed) {
          return 2.0; // Strong attraction to clicks
        }
        return normalizedDistance > 0.5 ? 0.5 : -1.0; // Flee when close, approach from distance

      case InteractionMode.NEUTRAL:
        return 0.1; // Minimal response

      default:
        return 1.0;
    }
  }

  private getRecentInteractions(timeWindow: number): MouseInteraction[] {
    const cutoffTime = Date.now() - timeWindow;
    return this.interactionHistory.filter(interaction => interaction.timestamp > cutoffTime);
  }

  calculateGroupInteractionInfluence(
    robot: RobotConfig,
    nearbyRobots: RobotConfig[]
  ): InteractionForce {
    if (!this.lastMouseInteraction) {
      return { x: 0, y: 0, magnitude: 0 };
    }

    let totalInfluence = { x: 0, y: 0 };
    let influenceCount = 0;

    for (const other of nearbyRobots) {
      if (other.id === robot.id) continue;

      const otherDistance = this.calculateDistance(other.position, this.lastMouseInteraction.position);
      if (otherDistance < this.settings.influenceRadius / 2) {
        // Other robots near the mouse create a secondary attraction/repulsion
        const robotDistance = this.calculateDistance(robot.position, other.position);
        if (robotDistance < this.settings.influenceRadius && robotDistance > 0) {
          const strength = (this.settings.influenceRadius - robotDistance) / this.settings.influenceRadius;
          const direction = {
            x: (other.position.x - robot.position.x) / robotDistance,
            y: (other.position.y - robot.position.y) / robotDistance,
          };

          // Social following - robots tend to move towards areas where other robots are interacting
          totalInfluence.x += direction.x * strength * 0.3;
          totalInfluence.y += direction.y * strength * 0.3;
          influenceCount++;
        }
      }
    }

    if (influenceCount > 0) {
      totalInfluence.x /= influenceCount;
      totalInfluence.y /= influenceCount;
    }

    return {
      x: totalInfluence.x,
      y: totalInfluence.y,
      magnitude: Math.sqrt(totalInfluence.x * totalInfluence.x + totalInfluence.y * totalInfluence.y),
    };
  }

  private calculateDistance(
    pos1: { x: number; y: number },
    pos2: { x: number; y: number }
  ): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Configuration methods
  setMode(mode: InteractionMode): void {
    this.settings.mode = mode;
  }

  updateSettings(newSettings: Partial<InteractionSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  getSettings(): InteractionSettings {
    return { ...this.settings };
  }

  getInteractionHistory(): MouseInteraction[] {
    return [...this.interactionHistory];
  }

  clearHistory(): void {
    this.interactionHistory = [];
    this.lastMouseInteraction = null;
  }

  // Personality presets
  static createShy(): InteractionBehavior {
    return new InteractionBehavior({
      mode: InteractionMode.FLEE,
      influenceRadius: 200,
      responseStrength: 0.8,
      clickResponseMultiplier: 3.0,
      attentionSpan: 2000,
    });
  }

  static createFriendly(): InteractionBehavior {
    return new InteractionBehavior({
      mode: InteractionMode.FOLLOW,
      influenceRadius: 120,
      responseStrength: 1.5,
      clickResponseMultiplier: 1.8,
      attentionSpan: 5000,
    });
  }

  static createPlayful(): InteractionBehavior {
    return new InteractionBehavior({
      mode: InteractionMode.PLAYFUL,
      influenceRadius: 180,
      responseStrength: 1.8,
      clickResponseMultiplier: 2.2,
      attentionSpan: 4000,
      decayRate: 0.95,
    });
  }

  static createCurious(): InteractionBehavior {
    return new InteractionBehavior({
      mode: InteractionMode.CURIOUS,
      influenceRadius: 160,
      responseStrength: 1.3,
      clickResponseMultiplier: 2.0,
      attentionSpan: 6000,
    });
  }
}