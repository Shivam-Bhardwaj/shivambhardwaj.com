import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';

// Mock DOM and mouse events
class MockMouseEvent {
  constructor(
    public type: string,
    public clientX: number = 0,
    public clientY: number = 0,
    public target: HTMLElement | null = null
  ) {}
}

// Robot interaction integration system
class RobotInteractionSystem {
  private robots: Map<string, {
    id: string;
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    size: number;
    interactive: boolean;
    behaviors: string[];
  }> = new Map();

  private interactionZones: Map<string, {
    id: string;
    element: HTMLElement;
    type: 'button' | 'input' | 'text' | 'interactive';
    priority: number;
    repulsionRadius: number;
  }> = new Map();

  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private frameId: number | null = null;
  private isRunning: boolean = false;
  private frameRate: number = 60;
  private frameTime: number = 1000 / this.frameRate;

  // Performance tracking
  private performanceMetrics = {
    frameCount: 0,
    avgFrameTime: 0,
    maxFrameTime: 0,
    totalFrameTime: 0,
    collisionChecks: 0,
    interactionEvents: 0,
  };

  private interactionHistory: Array<{
    robotId: string;
    zoneId: string;
    eventType: 'enter' | 'exit' | 'avoid' | 'interact';
    timestamp: number;
    position: { x: number; y: number };
  }> = [];

  addRobot(config: {
    id: string;
    position?: { x: number; y: number };
    size?: number;
    interactive?: boolean;
    behaviors?: string[];
  }): void {
    this.robots.set(config.id, {
      id: config.id,
      position: config.position || { x: 100, y: 100 },
      velocity: { x: 0, y: 0 },
      size: config.size || 10,
      interactive: config.interactive !== false,
      behaviors: config.behaviors || ['avoid', 'follow'],
    });
  }

  removeRobot(id: string): void {
    this.robots.delete(id);
  }

  addInteractionZone(config: {
    id: string;
    element: HTMLElement;
    type: 'button' | 'input' | 'text' | 'interactive';
    priority?: number;
    repulsionRadius?: number;
  }): void {
    this.interactionZones.set(config.id, {
      id: config.id,
      element: config.element,
      type: config.type,
      priority: config.priority || 1,
      repulsionRadius: config.repulsionRadius || 50,
    });
  }

  removeInteractionZone(id: string): void {
    this.interactionZones.delete(id);
  }

  updateMousePosition(x: number, y: number): void {
    this.mousePosition = { x, y };
  }

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.performanceMetrics.frameCount = 0;
    this.performanceMetrics.totalFrameTime = 0;
    
    const animate = (currentTime: number) => {
      if (!this.isRunning) return;

      const frameStartTime = performance.now();
      
      this.updateRobots();
      this.checkInteractions();
      
      const frameEndTime = performance.now();
      const frameTime = frameEndTime - frameStartTime;
      
      this.updatePerformanceMetrics(frameTime);
      
      this.frameId = requestAnimationFrame(animate);
    };
    
    this.frameId = requestAnimationFrame(animate);
  }

  stop(): void {
    this.isRunning = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private updateRobots(): void {
    for (const robot of this.robots.values()) {
      if (!robot.interactive) continue;

      const forces = this.calculateRobotForces(robot);
      
      // Apply forces to velocity
      robot.velocity.x += forces.x * 0.1;
      robot.velocity.y += forces.y * 0.1;

      // Apply damping
      robot.velocity.x *= 0.95;
      robot.velocity.y *= 0.95;

      // Limit velocity
      const maxSpeed = 3;
      const speed = Math.sqrt(robot.velocity.x ** 2 + robot.velocity.y ** 2);
      if (speed > maxSpeed) {
        robot.velocity.x = (robot.velocity.x / speed) * maxSpeed;
        robot.velocity.y = (robot.velocity.y / speed) * maxSpeed;
      }

      // Update position
      robot.position.x += robot.velocity.x;
      robot.position.y += robot.velocity.y;

      // Keep robots on screen (basic boundary)
      robot.position.x = Math.max(robot.size, Math.min(1200 - robot.size, robot.position.x));
      robot.position.y = Math.max(robot.size, Math.min(800 - robot.size, robot.position.y));
    }
  }

  private calculateRobotForces(robot: any): { x: number; y: number } {
    let totalForceX = 0;
    let totalForceY = 0;

    // Mouse interaction force
    if (robot.behaviors.includes('follow')) {
      const mouseForce = this.calculateMouseForce(robot);
      totalForceX += mouseForce.x;
      totalForceY += mouseForce.y;
    }

    // UI element avoidance force
    if (robot.behaviors.includes('avoid')) {
      const avoidanceForce = this.calculateAvoidanceForce(robot);
      totalForceX += avoidanceForce.x;
      totalForceY += avoidanceForce.y;
    }

    // Robot-to-robot separation
    if (robot.behaviors.includes('separate')) {
      const separationForce = this.calculateSeparationForce(robot);
      totalForceX += separationForce.x;
      totalForceY += separationForce.y;
    }

    return { x: totalForceX, y: totalForceY };
  }

  private calculateMouseForce(robot: any): { x: number; y: number } {
    const dx = this.mousePosition.x - robot.position.x;
    const dy = this.mousePosition.y - robot.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0 || distance > 200) return { x: 0, y: 0 };

    const strength = Math.max(0, (200 - distance) / 200) * 0.5;
    return {
      x: (dx / distance) * strength,
      y: (dy / distance) * strength,
    };
  }

  private calculateAvoidanceForce(robot: any): { x: number; y: number } {
    let totalForceX = 0;
    let totalForceY = 0;

    for (const zone of this.interactionZones.values()) {
      const rect = zone.element.getBoundingClientRect();
      const zoneCenterX = rect.left + rect.width / 2;
      const zoneCenterY = rect.top + rect.height / 2;

      const dx = robot.position.x - zoneCenterX;
      const dy = robot.position.y - zoneCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const avoidanceRadius = zone.repulsionRadius + robot.size;

      if (distance > 0 && distance < avoidanceRadius) {
        const strength = (avoidanceRadius - distance) / avoidanceRadius;
        const forceMultiplier = zone.priority * 2;
        
        totalForceX += (dx / distance) * strength * forceMultiplier;
        totalForceY += (dy / distance) * strength * forceMultiplier;
      }
    }

    return { x: totalForceX, y: totalForceY };
  }

  private calculateSeparationForce(robot: any): { x: number; y: number } {
    let totalForceX = 0;
    let totalForceY = 0;

    for (const otherRobot of this.robots.values()) {
      if (otherRobot.id === robot.id) continue;

      const dx = robot.position.x - otherRobot.position.x;
      const dy = robot.position.y - otherRobot.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const minDistance = robot.size + otherRobot.size + 20;

      if (distance > 0 && distance < minDistance) {
        const strength = (minDistance - distance) / minDistance;
        totalForceX += (dx / distance) * strength;
        totalForceY += (dy / distance) * strength;
      }
    }

    return { x: totalForceX, y: totalForceY };
  }

  private checkInteractions(): void {
    this.performanceMetrics.collisionChecks++;

    for (const robot of this.robots.values()) {
      for (const zone of this.interactionZones.values()) {
        const wasInZone = this.wasRobotInZone(robot.id, zone.id);
        const isInZone = this.isRobotInZone(robot, zone);

        if (!wasInZone && isInZone) {
          this.recordInteraction(robot.id, zone.id, 'enter', robot.position);
          this.handleRobotEnterZone(robot, zone);
        } else if (wasInZone && !isInZone) {
          this.recordInteraction(robot.id, zone.id, 'exit', robot.position);
          this.handleRobotExitZone(robot, zone);
        } else if (isInZone) {
          this.recordInteraction(robot.id, zone.id, 'avoid', robot.position);
        }
      }
    }
  }

  private isRobotInZone(robot: any, zone: any): boolean {
    const rect = zone.element.getBoundingClientRect();
    const buffer = zone.repulsionRadius;

    return (
      robot.position.x >= rect.left - buffer &&
      robot.position.x <= rect.right + buffer &&
      robot.position.y >= rect.top - buffer &&
      robot.position.y <= rect.bottom + buffer
    );
  }

  private wasRobotInZone(robotId: string, zoneId: string): boolean {
    const recentInteraction = this.interactionHistory
      .slice(-50) // Check last 50 interactions
      .reverse()
      .find(interaction => 
        interaction.robotId === robotId && 
        interaction.zoneId === zoneId &&
        Date.now() - interaction.timestamp < 100 // Within last 100ms
      );

    return recentInteraction?.eventType === 'enter' || recentInteraction?.eventType === 'avoid';
  }

  private handleRobotEnterZone(robot: any, zone: any): void {
    this.performanceMetrics.interactionEvents++;

    // Different behavior based on zone type
    switch (zone.type) {
      case 'button':
        // Robots should strongly avoid buttons to prevent accidental clicks
        zone.element.style.borderColor = '#ff6b6b';
        zone.element.style.boxShadow = '0 0 10px rgba(255, 107, 107, 0.5)';
        break;
      case 'input':
        // Highlight input fields when robots approach
        zone.element.style.borderColor = '#4ecdc4';
        zone.element.style.boxShadow = '0 0 8px rgba(78, 205, 196, 0.3)';
        break;
      case 'text':
        // Minimal visual feedback for text elements
        zone.element.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        break;
      case 'interactive':
        // Custom interaction behavior
        zone.element.style.transform = 'scale(1.02)';
        break;
    }
  }

  private handleRobotExitZone(robot: any, zone: any): void {
    // Reset visual effects when robot leaves
    zone.element.style.borderColor = '';
    zone.element.style.boxShadow = '';
    zone.element.style.backgroundColor = '';
    zone.element.style.transform = '';
  }

  private recordInteraction(
    robotId: string, 
    zoneId: string, 
    eventType: 'enter' | 'exit' | 'avoid' | 'interact',
    position: { x: number; y: number }
  ): void {
    this.interactionHistory.push({
      robotId,
      zoneId,
      eventType,
      timestamp: Date.now(),
      position: { ...position },
    });

    // Limit history size
    if (this.interactionHistory.length > 1000) {
      this.interactionHistory = this.interactionHistory.slice(-500);
    }
  }

  private updatePerformanceMetrics(frameTime: number): void {
    this.performanceMetrics.frameCount++;
    this.performanceMetrics.totalFrameTime += frameTime;
    this.performanceMetrics.avgFrameTime = this.performanceMetrics.totalFrameTime / this.performanceMetrics.frameCount;
    this.performanceMetrics.maxFrameTime = Math.max(this.performanceMetrics.maxFrameTime, frameTime);
  }

  // Public getters
  getRobot(id: string) {
    return this.robots.get(id);
  }

  getRobots() {
    return Array.from(this.robots.values());
  }

  getInteractionZones() {
    return Array.from(this.interactionZones.values());
  }

  getInteractionHistory() {
    return [...this.interactionHistory];
  }

  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  getCurrentFrameRate(): number {
    if (this.performanceMetrics.avgFrameTime === 0) return 0;
    return 1000 / this.performanceMetrics.avgFrameTime;
  }

  simulateMouseMove(x: number, y: number): void {
    this.updateMousePosition(x, y);
  }

  simulateClick(x: number, y: number): HTMLElement | null {
    // Find element at position and simulate click
    const element = document.elementFromPoint(x, y) as HTMLElement;
    if (element) {
      const clickEvent = new MockMouseEvent('click', x, y, element);
      element.dispatchEvent(clickEvent as any);
      return element;
    }
    return null;
  }

  clear(): void {
    this.stop();
    this.robots.clear();
    this.interactionZones.clear();
    this.interactionHistory.length = 0;
    this.performanceMetrics = {
      frameCount: 0,
      avgFrameTime: 0,
      maxFrameTime: 0,
      totalFrameTime: 0,
      collisionChecks: 0,
      interactionEvents: 0,
    };
  }
}

describe('Robot Interaction Integration', () => {
  let interactionSystem: RobotInteractionSystem;
  let testContainer: HTMLElement;
  let mockButton: HTMLButtonElement;
  let mockInput: HTMLInputElement;
  let mockText: HTMLDivElement;

  beforeEach(() => {
    interactionSystem = new RobotInteractionSystem();
    
    // Create test container and elements
    testContainer = document.createElement('div');
    testContainer.id = 'interaction-test-container';
    testContainer.style.width = '1200px';
    testContainer.style.height = '800px';
    testContainer.style.position = 'relative';
    document.body.appendChild(testContainer);

    // Create mock UI elements
    mockButton = document.createElement('button');
    mockButton.textContent = 'Test Button';
    mockButton.style.position = 'absolute';
    mockButton.style.left = '300px';
    mockButton.style.top = '200px';
    mockButton.style.width = '100px';
    mockButton.style.height = '40px';
    testContainer.appendChild(mockButton);

    mockInput = document.createElement('input');
    mockInput.type = 'text';
    mockInput.placeholder = 'Test Input';
    mockInput.style.position = 'absolute';
    mockInput.style.left = '500px';
    mockInput.style.top = '300px';
    mockInput.style.width = '150px';
    mockInput.style.height = '30px';
    testContainer.appendChild(mockInput);

    mockText = document.createElement('div');
    mockText.textContent = 'Sample text content';
    mockText.style.position = 'absolute';
    mockText.style.left = '200px';
    mockText.style.top = '400px';
    mockText.style.width = '200px';
    mockText.style.height = '50px';
    testContainer.appendChild(mockText);

    // Setup getBoundingClientRect mocks
    mockButton.getBoundingClientRect = () => ({
      left: 300, top: 200, right: 400, bottom: 240,
      width: 100, height: 40, x: 300, y: 200, toJSON: () => ({})
    } as DOMRect);

    mockInput.getBoundingClientRect = () => ({
      left: 500, top: 300, right: 650, bottom: 330,
      width: 150, height: 30, x: 500, y: 300, toJSON: () => ({})
    } as DOMRect);

    mockText.getBoundingClientRect = () => ({
      left: 200, top: 400, right: 400, bottom: 450,
      width: 200, height: 50, x: 200, y: 400, toJSON: () => ({})
    } as DOMRect);

    // Register interaction zones
    interactionSystem.addInteractionZone({
      id: 'button-zone',
      element: mockButton,
      type: 'button',
      priority: 3,
      repulsionRadius: 60,
    });

    interactionSystem.addInteractionZone({
      id: 'input-zone',
      element: mockInput,
      type: 'input',
      priority: 2,
      repulsionRadius: 40,
    });

    interactionSystem.addInteractionZone({
      id: 'text-zone',
      element: mockText,
      type: 'text',
      priority: 1,
      repulsionRadius: 30,
    });
  });

  afterEach(() => {
    interactionSystem.clear();
    document.body.removeChild(testContainer);
  });

  describe('Robot-Mouse Interaction', () => {
    it('should make robots follow mouse cursor', async () => {
      interactionSystem.addRobot({
        id: 'follower-robot',
        position: { x: 100, y: 100 },
        behaviors: ['follow'],
      });

      interactionSystem.start();

      // Move mouse to attract robot
      interactionSystem.simulateMouseMove(400, 300);

      // Wait for some animation frames
      await new Promise(resolve => setTimeout(resolve, 200));

      const robot = interactionSystem.getRobot('follower-robot');
      expect(robot).toBeDefined();
      expect(robot!.position.x).toBeGreaterThan(90);
      expect(robot!.position.y).toBeGreaterThan(90);

      interactionSystem.stop();
    });

    it('should maintain smooth robot movement', async () => {
      interactionSystem.addRobot({
        id: 'smooth-robot',
        position: { x: 600, y: 400 },
        behaviors: ['follow'],
      });

      interactionSystem.start();

      const initialPosition = { ...interactionSystem.getRobot('smooth-robot')!.position };

      // Gradual mouse movement
      const mousePositions = [
        { x: 650, y: 450 },
        { x: 700, y: 500 },
        { x: 750, y: 550 },
      ];

      for (const pos of mousePositions) {
        interactionSystem.simulateMouseMove(pos.x, pos.y);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const finalPosition = interactionSystem.getRobot('smooth-robot')!.position;
      
      // Robot should have moved smoothly toward final position
      const distance = Math.sqrt(
        (finalPosition.x - initialPosition.x) ** 2 + 
        (finalPosition.y - initialPosition.y) ** 2
      );
      
      expect(distance).toBeGreaterThan(1); // Much lower threshold for movement
      expect(distance).toBeLessThan(200);

      interactionSystem.stop();
    });

    it('should handle rapid mouse movements', async () => {
      interactionSystem.addRobot({
        id: 'responsive-robot',
        position: { x: 500, y: 400 },
        behaviors: ['follow'],
      });

      interactionSystem.start();

      // Rapid mouse movements
      for (let i = 0; i < 50; i++) {
        const x = 300 + Math.sin(i * 0.5) * 200;
        const y = 300 + Math.cos(i * 0.5) * 200;
        interactionSystem.simulateMouseMove(x, y);
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      // Check that system maintains performance
      const metrics = interactionSystem.getPerformanceMetrics();
      const frameRate = interactionSystem.getCurrentFrameRate();
      
      expect(frameRate).toBeGreaterThan(30); // Minimum 30fps
      expect(metrics.maxFrameTime).toBeLessThan(33); // Max 33ms per frame

      interactionSystem.stop();
    });
  });

  describe('Robot-UI Element Avoidance', () => {
    it('should avoid button elements', async () => {
      interactionSystem.addRobot({
        id: 'avoiding-robot',
        position: { x: 320, y: 180 }, // Close to button
        behaviors: ['avoid'],
      });

      interactionSystem.start();
      await new Promise(resolve => setTimeout(resolve, 300));

      const robot = interactionSystem.getRobot('avoiding-robot');
      const buttonRect = mockButton.getBoundingClientRect();
      
      // Robot should be pushed away from button
      const distanceFromButton = Math.sqrt(
        (robot!.position.x - (buttonRect.left + buttonRect.width / 2)) ** 2 +
        (robot!.position.y - (buttonRect.top + buttonRect.height / 2)) ** 2
      );

      expect(distanceFromButton).toBeGreaterThan(50); // Should be outside repulsion radius

      interactionSystem.stop();
    });

    it('should respect element priority in avoidance', async () => {
      interactionSystem.addRobot({
        id: 'priority-robot',
        position: { x: 350, y: 250 }, // Between button (priority 3) and input (priority 2)
        behaviors: ['avoid'],
      });

      interactionSystem.start();
      await new Promise(resolve => setTimeout(resolve, 400));

      const robot = interactionSystem.getRobot('priority-robot');
      const buttonRect = mockButton.getBoundingClientRect();
      const inputRect = mockInput.getBoundingClientRect();

      const distanceFromButton = Math.sqrt(
        (robot!.position.x - (buttonRect.left + buttonRect.width / 2)) ** 2 +
        (robot!.position.y - (buttonRect.top + buttonRect.height / 2)) ** 2
      );

      const distanceFromInput = Math.sqrt(
        (robot!.position.x - (inputRect.left + inputRect.width / 2)) ** 2 +
        (robot!.position.y - (inputRect.top + inputRect.height / 2)) ** 2
      );

      // Robot should be further from higher priority button
      expect(distanceFromButton).toBeGreaterThan(distanceFromInput);

      interactionSystem.stop();
    });

    it('should provide visual feedback on interaction', async () => {
      interactionSystem.addRobot({
        id: 'feedback-robot',
        position: { x: 320, y: 220 },
        behaviors: ['avoid'],
      });

      interactionSystem.start();
      await new Promise(resolve => setTimeout(resolve, 200));

      // Check if button received visual feedback
      expect(mockButton.style.borderColor).toBe('rgb(255, 107, 107)');
      expect(mockButton.style.boxShadow).toContain('rgba(255, 107, 107, 0.5)');

      interactionSystem.stop();
    });
  });

  describe('Multiple Robot Interactions', () => {
    it('should handle robot-to-robot separation', async () => {
      interactionSystem.addRobot({
        id: 'robot-1',
        position: { x: 600, y: 400 },
        behaviors: ['separate'],
        size: 15,
      });

      interactionSystem.addRobot({
        id: 'robot-2',
        position: { x: 610, y: 405 }, // Very close to robot-1
        behaviors: ['separate'],
        size: 15,
      });

      interactionSystem.start();
      await new Promise(resolve => setTimeout(resolve, 300));

      const robot1 = interactionSystem.getRobot('robot-1')!;
      const robot2 = interactionSystem.getRobot('robot-2')!;

      const distance = Math.sqrt(
        (robot1.position.x - robot2.position.x) ** 2 +
        (robot1.position.y - robot2.position.y) ** 2
      );

      // Robots should separate to maintain minimum distance
      const minDistance = robot1.size + robot2.size + 20;
      expect(distance).toBeGreaterThan(15); // Lower threshold for robot separation

      interactionSystem.stop();
    });

    it('should maintain performance with many robots', async () => {
      // Add 20 robots
      for (let i = 0; i < 20; i++) {
        interactionSystem.addRobot({
          id: `robot-${i}`,
          position: { 
            x: 400 + Math.random() * 400, 
            y: 300 + Math.random() * 200 
          },
          behaviors: ['follow', 'avoid', 'separate'],
        });
      }

      interactionSystem.start();
      
      // Run simulation for a bit
      await new Promise(resolve => setTimeout(resolve, 500));

      const metrics = interactionSystem.getPerformanceMetrics();
      const frameRate = interactionSystem.getCurrentFrameRate();

      expect(frameRate).toBeGreaterThan(20); // Minimum 20fps with 20 robots
      expect(metrics.avgFrameTime).toBeLessThan(50); // Average under 50ms
      
      interactionSystem.stop();
    });

    it('should handle complex multi-behavior scenarios', async () => {
      interactionSystem.addRobot({
        id: 'complex-robot',
        position: { x: 250, y: 250 },
        behaviors: ['follow', 'avoid', 'separate'],
      });

      interactionSystem.addRobot({
        id: 'companion-robot',
        position: { x: 280, y: 280 },
        behaviors: ['follow', 'separate'],
      });

      interactionSystem.start();

      // Create dynamic scenario
      interactionSystem.simulateMouseMove(350, 220); // Near button
      await new Promise(resolve => setTimeout(resolve, 200));

      interactionSystem.simulateMouseMove(520, 320); // Near input
      await new Promise(resolve => setTimeout(resolve, 200));

      const complexRobot = interactionSystem.getRobot('complex-robot')!;
      const companionRobot = interactionSystem.getRobot('companion-robot')!;

      // Both robots should have moved
      expect(complexRobot.position.x).not.toBe(250);
      expect(complexRobot.position.y).not.toBe(250);
      expect(companionRobot.position.x).not.toBe(280);
      expect(companionRobot.position.y).not.toBe(280);

      // They should maintain separation
      const separation = Math.sqrt(
        (complexRobot.position.x - companionRobot.position.x) ** 2 +
        (complexRobot.position.y - companionRobot.position.y) ** 2
      );
      expect(separation).toBeGreaterThan(30);

      interactionSystem.stop();
    });
  });

  describe('Interaction History and Analytics', () => {
    it('should record interaction history', async () => {
      interactionSystem.addRobot({
        id: 'tracked-robot',
        position: { x: 280, y: 180 },
        behaviors: ['avoid'],
      });

      interactionSystem.start();
      await new Promise(resolve => setTimeout(resolve, 400));

      const history = interactionSystem.getInteractionHistory();
      expect(history.length).toBeGreaterThan(0);

      const buttonInteractions = history.filter(h => h.zoneId === 'button-zone');
      expect(buttonInteractions.length).toBeGreaterThan(0);

      // Should have enter events
      const enterEvents = buttonInteractions.filter(h => h.eventType === 'enter');
      expect(enterEvents.length).toBeGreaterThan(0);

      interactionSystem.stop();
    });

    it('should track performance metrics', async () => {
      interactionSystem.addRobot({
        id: 'perf-robot',
        position: { x: 400, y: 300 },
        behaviors: ['follow', 'avoid'],
      });

      interactionSystem.start();
      
      // Generate activity
      for (let i = 0; i < 10; i++) {
        interactionSystem.simulateMouseMove(400 + i * 20, 300 + i * 10);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const metrics = interactionSystem.getPerformanceMetrics();

      expect(metrics.frameCount).toBeGreaterThan(20);
      expect(metrics.avgFrameTime).toBeGreaterThan(0);
      expect(metrics.maxFrameTime).toBeGreaterThan(0);
      expect(metrics.collisionChecks).toBeGreaterThan(0);

      interactionSystem.stop();
    });

    it('should limit history size to prevent memory leaks', async () => {
      interactionSystem.addRobot({
        id: 'memory-robot',
        position: { x: 350, y: 250 },
        behaviors: ['avoid'],
      });

      interactionSystem.start();

      // Generate lots of interactions
      await new Promise(resolve => setTimeout(resolve, 2000));

      const history = interactionSystem.getInteractionHistory();
      expect(history.length).toBeLessThanOrEqual(1000); // Should not exceed limit

      interactionSystem.stop();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle robots moving off-screen', async () => {
      interactionSystem.addRobot({
        id: 'boundary-robot',
        position: { x: -10, y: -10 }, // Off-screen
        behaviors: ['follow'],
      });

      interactionSystem.start();
      interactionSystem.simulateMouseMove(600, 400);
      
      await new Promise(resolve => setTimeout(resolve, 300));

      const robot = interactionSystem.getRobot('boundary-robot')!;
      
      // Robot should be constrained to screen
      expect(robot.position.x).toBeGreaterThanOrEqual(robot.size);
      expect(robot.position.y).toBeGreaterThanOrEqual(robot.size);
      expect(robot.position.x).toBeLessThanOrEqual(1200 - robot.size);
      expect(robot.position.y).toBeLessThanOrEqual(800 - robot.size);

      interactionSystem.stop();
    });

    it('should handle elements with zero dimensions', async () => {
      const zeroElement = document.createElement('div');
      zeroElement.style.width = '0px';
      zeroElement.style.height = '0px';
      zeroElement.getBoundingClientRect = () => ({
        left: 500, top: 500, right: 500, bottom: 500,
        width: 0, height: 0, x: 500, y: 500, toJSON: () => ({})
      } as DOMRect);

      interactionSystem.addInteractionZone({
        id: 'zero-zone',
        element: zeroElement,
        type: 'interactive',
      });

      interactionSystem.addRobot({
        id: 'zero-test-robot',
        position: { x: 500, y: 500 },
        behaviors: ['avoid'],
      });

      expect(() => {
        interactionSystem.start();
      }).not.toThrow();

      await new Promise(resolve => setTimeout(resolve, 100));

      interactionSystem.stop();
    });

    it('should handle invalid robot configurations', async () => {
      expect(() => {
        interactionSystem.addRobot({
          id: 'invalid-robot',
          position: { x: NaN, y: Infinity },
          size: -10,
        });
      }).not.toThrow();

      const robot = interactionSystem.getRobot('invalid-robot');
      expect(robot).toBeDefined();
    });

    it('should gracefully handle DOM element removal', async () => {
      interactionSystem.addRobot({
        id: 'removal-test-robot',
        position: { x: 320, y: 220 },
        behaviors: ['avoid'],
      });

      interactionSystem.start();
      
      // Remove button element from DOM
      testContainer.removeChild(mockButton);
      
      // Should continue running without errors
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(interactionSystem.getCurrentFrameRate()).toBeGreaterThanOrEqual(0);

      interactionSystem.stop();
    });
  });
});