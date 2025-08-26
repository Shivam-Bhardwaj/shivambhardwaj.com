import { CommunicationMessage, Vector2D } from '../types';
import { Robot } from '../Robot';

export class CommunicationSystem {
  private robot: Robot;
  private messageQueue: CommunicationMessage[] = [];
  private sentMessages: Map<string, CommunicationMessage> = new Map();
  private receivedMessages: Map<string, CommunicationMessage> = new Map();
  private maxQueueSize: number = 10;
  private messageLifetime: number = 5000; // 5 seconds
  private bandwidth: number = 10; // messages per second

  constructor(robot: Robot) {
    this.robot = robot;
  }

  broadcast(type: 'discovery' | 'help' | 'status' | 'command', data: any): void {
    const message: CommunicationMessage = {
      senderId: this.robot.id,
      receiverId: 'broadcast',
      type,
      data,
      timestamp: Date.now(),
      hops: 0
    };

    this.messageQueue.push(message);
    this.sentMessages.set(message.timestamp.toString(), message);
  }

  sendTo(receiverId: string, type: 'discovery' | 'help' | 'status' | 'command', data: any): void {
    const message: CommunicationMessage = {
      senderId: this.robot.id,
      receiverId,
      type,
      data,
      timestamp: Date.now(),
      hops: 0
    };

    this.messageQueue.push(message);
    this.sentMessages.set(message.timestamp.toString(), message);
  }

  receiveMessage(message: CommunicationMessage): void {
    // Check if message is for this robot or broadcast
    if (message.receiverId === this.robot.id || message.receiverId === 'broadcast') {
      // Avoid duplicate messages
      const messageKey = `${message.senderId}-${message.timestamp}`;
      if (!this.receivedMessages.has(messageKey)) {
        this.receivedMessages.set(messageKey, message);
        
        // Process message based on type
        this.processMessage(message);
        
        // If broadcast, potentially relay it (mesh network)
        if (message.receiverId === 'broadcast' && message.hops < 3) {
          this.relayMessage(message);
        }
      }
    }
  }

  private processMessage(message: CommunicationMessage): void {
    switch (message.type) {
      case 'discovery':
        // Handle resource discovery messages
        if (message.data.resourceFound) {
          // Update internal knowledge about resources
          console.log(`Robot ${this.robot.id} learned about resource at`, message.data.position);
        }
        break;
        
      case 'help':
        // Handle help requests
        if (message.data.lowBattery && this.robot.type === 'energy') {
          // Energy robot can respond to help
          this.sendTo(message.senderId, 'status', {
            canHelp: true,
            position: this.robot.position
          });
        }
        break;
        
      case 'status':
        // Handle status updates from other robots
        break;
        
      case 'command':
        // Handle command messages (for swarm coordination)
        if (message.data.formation) {
          // Adjust behavior for formation flying
        }
        break;
    }
  }

  private relayMessage(message: CommunicationMessage): void {
    // Relay broadcast messages to extend range (mesh network)
    const relayedMessage: CommunicationMessage = {
      ...message,
      hops: message.hops + 1
    };
    
    // Add to queue for transmission
    this.messageQueue.push(relayedMessage);
  }

  transmit(robots: Robot[]): CommunicationMessage[] {
    const transmitted: CommunicationMessage[] = [];
    
    // Transmit messages based on bandwidth limit
    const messagesToSend = Math.min(this.bandwidth, this.messageQueue.length);
    
    for (let i = 0; i < messagesToSend; i++) {
      const message = this.messageQueue.shift();
      if (!message) break;
      
      // Find robots in communication range
      for (const other of robots) {
        if (other.id === this.robot.id) continue;
        
        const dist = this.getDistance(other.position);
        if (dist <= this.robot.communicationRange) {
          // Simulate signal strength degradation
          const signalStrength = 1 - (dist / this.robot.communicationRange);
          
          // Random packet loss based on distance
          if (Math.random() < signalStrength) {
            other.communication.receiveMessage(message);
            transmitted.push(message);
          }
        }
      }
    }
    
    // Clean up old messages
    this.cleanupOldMessages();
    
    return transmitted;
  }

  private cleanupOldMessages(): void {
    const now = Date.now();
    
    // Clean received messages
    for (const [key, message] of this.receivedMessages) {
      if (now - message.timestamp > this.messageLifetime) {
        this.receivedMessages.delete(key);
      }
    }
    
    // Clean sent messages
    for (const [key, message] of this.sentMessages) {
      if (now - message.timestamp > this.messageLifetime) {
        this.sentMessages.delete(key);
      }
    }
    
    // Limit queue size
    if (this.messageQueue.length > this.maxQueueSize) {
      this.messageQueue = this.messageQueue.slice(-this.maxQueueSize);
    }
  }

  private getDistance(point: Vector2D): number {
    const dx = this.robot.position.x - point.x;
    const dy = this.robot.position.y - point.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getMessageCount(): { sent: number; received: number; queued: number } {
    return {
      sent: this.sentMessages.size,
      received: this.receivedMessages.size,
      queued: this.messageQueue.length
    };
  }

  drawCommunicationLinks(ctx: CanvasRenderingContext2D, robots: Robot[]): void {
    ctx.save();
    
    // Draw communication links
    for (const other of robots) {
      if (other.id === this.robot.id) continue;
      
      const dist = this.getDistance(other.position);
      if (dist <= this.robot.communicationRange) {
        const signalStrength = 1 - (dist / this.robot.communicationRange);
        
        ctx.strokeStyle = `rgba(147, 51, 234, ${signalStrength * 0.3})`;
        ctx.lineWidth = signalStrength * 2;
        ctx.beginPath();
        ctx.moveTo(this.robot.position.x, this.robot.position.y);
        ctx.lineTo(other.position.x, other.position.y);
        ctx.stroke();
        
        // Draw signal waves for active communication
        if (this.messageQueue.length > 0 || this.receivedMessages.size > 0) {
          const pulse = (Date.now() % 1000) / 1000;
          ctx.strokeStyle = `rgba(147, 51, 234, ${(1 - pulse) * 0.5})`;
          ctx.beginPath();
          ctx.arc(
            this.robot.position.x, 
            this.robot.position.y, 
            pulse * 30, 
            0, 
            Math.PI * 2
          );
          ctx.stroke();
        }
      }
    }
    
    ctx.restore();
  }
}