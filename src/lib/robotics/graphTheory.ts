/**
 * Graph Theory Implementation
 * 
 * Demonstrates graph theory concepts through robot communication network:
 * - Connectivity analysis
 * - Shortest path algorithms (Dijkstra's)
 * - Spanning trees
 * - Graph centrality measures
 * 
 * References:
 * - Introduction to Algorithms (Cormen et al., 2009)
 * - Graph Theory (Bondy & Murty, 2008)
 */

import { Robot } from './robot';

export interface GraphNode {
  id: number;
  robot: Robot;
  neighbors: Set<number>;
  distance: number; // For shortest path algorithms
  predecessor: number | null;
}

export interface GraphEdge {
  from: number;
  to: number;
  weight: number; // Distance between robots
  signalStrength: number;
}

export class CommunicationGraph {
  private nodes: Map<number, GraphNode>;
  private edges: GraphEdge[];
  private adjacencyList: Map<number, Set<number>>;

  constructor() {
    this.nodes = new Map();
    this.edges = [];
    this.adjacencyList = new Map();
  }

  /**
   * Build graph from robot communication network
   */
  buildGraph(robots: Robot[]): void {
    this.nodes.clear();
    this.edges = [];
    this.adjacencyList.clear();

    // Create nodes
    for (const robot of robots) {
      if (!robot.isOperational()) continue;

      const node: GraphNode = {
        id: robot.state.id,
        robot,
        neighbors: new Set(),
        distance: Infinity,
        predecessor: null
      };

      this.nodes.set(robot.state.id, node);
      this.adjacencyList.set(robot.state.id, new Set());
    }

    // Create edges based on communication
    for (let i = 0; i < robots.length; i++) {
      for (let j = i + 1; j < robots.length; j++) {
        const robot1 = robots[i];
        const robot2 = robots[j];

        if (!robot1.isOperational() || !robot2.isOperational()) continue;

        if (robot1.canCommunicateWith(robot2)) {
          const distance = robot1.state.position.distanceTo(robot2.state.position);
          const signalStrength = this.calculateSignalStrength(robot1, robot2, distance);

          const edge: GraphEdge = {
            from: robot1.state.id,
            to: robot2.state.id,
            weight: distance,
            signalStrength
          };

          this.edges.push(edge);

          // Update adjacency list
          this.adjacencyList.get(robot1.state.id)?.add(robot2.state.id);
          this.adjacencyList.get(robot2.state.id)?.add(robot1.state.id);

          // Update nodes
          this.nodes.get(robot1.state.id)?.neighbors.add(robot2.state.id);
          this.nodes.get(robot2.state.id)?.neighbors.add(robot1.state.id);
        }
      }
    }
  }

  /**
   * Calculate signal strength between two robots
   */
  private calculateSignalStrength(robot1: Robot, robot2: Robot, distance: number): number {
    const maxRange = Math.min(robot1.state.type.commRange, robot2.state.type.commRange);
    const distanceFactor = 1 - (distance / maxRange);
    const batteryFactor = (robot1.state.battery / robot1.state.type.batteryCapacity +
                          robot2.state.battery / robot2.state.type.batteryCapacity) / 2;

    return Math.max(0, Math.min(100, distanceFactor * batteryFactor * 100));
  }

  /**
   * Dijkstra's algorithm for shortest path
   */
  shortestPath(startId: number, endId: number): number[] | null {
    if (!this.nodes.has(startId) || !this.nodes.has(endId)) return null;

    // Initialize distances
    for (const node of this.nodes.values()) {
      node.distance = Infinity;
      node.predecessor = null;
    }

    const startNode = this.nodes.get(startId)!;
    startNode.distance = 0;

    const unvisited = new Set(this.nodes.keys());
    const visited = new Set<number>();

    while (unvisited.size > 0) {
      // Find node with minimum distance
      let minDistance = Infinity;
      let currentNodeId: number | null = null;

      for (const id of unvisited) {
        const node = this.nodes.get(id)!;
        if (node.distance < minDistance) {
          minDistance = node.distance;
          currentNodeId = id;
        }
      }

      if (currentNodeId === null || minDistance === Infinity) break;

      const currentNode = this.nodes.get(currentNodeId)!;
      unvisited.delete(currentNodeId);
      visited.add(currentNodeId);

      if (currentNodeId === endId) break;

      // Update neighbors
      const neighbors = this.adjacencyList.get(currentNodeId);
      if (neighbors) {
        for (const neighborId of neighbors) {
          if (visited.has(neighborId)) continue;

          const edge = this.edges.find(
            e => (e.from === currentNodeId && e.to === neighborId) ||
                 (e.from === neighborId && e.to === currentNodeId)
          );

          if (edge) {
            const neighborNode = this.nodes.get(neighborId)!;
            const altDistance = currentNode.distance + edge.weight;

            if (altDistance < neighborNode.distance) {
              neighborNode.distance = altDistance;
              neighborNode.predecessor = currentNodeId;
            }
          }
        }
      }
    }

    // Reconstruct path
    const path: number[] = [];
    let currentId: number | null = endId;

    while (currentId !== null) {
      path.unshift(currentId);
      const node = this.nodes.get(currentId);
      currentId = node?.predecessor ?? null;
    }

    return path.length > 1 && path[0] === startId ? path : null;
  }

  /**
   * Check if graph is connected
   */
  isConnected(): boolean {
    if (this.nodes.size === 0) return false;
    if (this.nodes.size === 1) return true;

    const startId = Array.from(this.nodes.keys())[0];
    const visited = new Set<number>();

    const dfs = (id: number) => {
      visited.add(id);
      const neighbors = this.adjacencyList.get(id);
      if (neighbors) {
        for (const neighborId of neighbors) {
          if (!visited.has(neighborId)) {
            dfs(neighborId);
          }
        }
      }
    };

    dfs(startId);
    return visited.size === this.nodes.size;
  }

  /**
   * Calculate node degree (number of connections)
   */
  getNodeDegree(nodeId: number): number {
    return this.adjacencyList.get(nodeId)?.size ?? 0;
  }

  /**
   * Find most connected node (highest degree)
   */
  getMostConnectedNode(): number | null {
    let maxDegree = -1;
    let mostConnectedId: number | null = null;

    for (const [id, neighbors] of this.adjacencyList) {
      const degree = neighbors.size;
      if (degree > maxDegree) {
        maxDegree = degree;
        mostConnectedId = id;
      }
    }

    return mostConnectedId;
  }

  /**
   * Get graph statistics
   */
  getStatistics(): {
    nodeCount: number;
    edgeCount: number;
    isConnected: boolean;
    averageDegree: number;
    density: number;
  } {
    const nodeCount = this.nodes.size;
    const edgeCount = this.edges.length;
    const totalPossibleEdges = (nodeCount * (nodeCount - 1)) / 2;
    const density = totalPossibleEdges > 0 ? edgeCount / totalPossibleEdges : 0;

    let totalDegree = 0;
    for (const neighbors of this.adjacencyList.values()) {
      totalDegree += neighbors.size;
    }
    const averageDegree = nodeCount > 0 ? totalDegree / nodeCount : 0;

    return {
      nodeCount,
      edgeCount,
      isConnected: this.isConnected(),
      averageDegree,
      density
    };
  }

  /**
   * Render graph with graph theory visualizations
   */
  render(ctx: CanvasRenderingContext2D, highlightPath?: number[]): void {
    // Render edges
    for (const edge of this.edges) {
      const fromNode = this.nodes.get(edge.from);
      const toNode = this.nodes.get(edge.to);

      if (!fromNode || !toNode) continue;

      const fromPos = fromNode.robot.state.position;
      const toPos = toNode.robot.state.position;

      // Highlight shortest path if provided
      const isInPath = highlightPath && (
        (highlightPath.includes(edge.from) && highlightPath.includes(edge.to)) &&
        Math.abs(highlightPath.indexOf(edge.from) - highlightPath.indexOf(edge.to)) === 1
      );

      // Color based on signal strength
      let color: string;
      if (isInPath) {
        color = '#10b981'; // Green for path
      } else if (edge.signalStrength > 70) {
        color = '#3b82f6'; // Blue for strong signal
      } else if (edge.signalStrength > 40) {
        color = '#f59e0b'; // Yellow for medium signal
      } else {
        color = '#ef4444'; // Red for weak signal
      }

      const opacity = isInPath ? 0.8 : edge.signalStrength / 100 * 0.4;
      const lineWidth = isInPath ? 3 : 1 + (edge.signalStrength / 100);

      ctx.strokeStyle = color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = lineWidth;

      ctx.beginPath();
      ctx.moveTo(fromPos.x, fromPos.y);
      ctx.lineTo(toPos.x, toPos.y);
      ctx.stroke();
    }

    // Highlight most connected node
    const mostConnectedId = this.getMostConnectedNode();
    if (mostConnectedId !== null) {
      const node = this.nodes.get(mostConnectedId);
      if (node) {
        const pos = node.robot.state.position;
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  /**
   * Get all nodes
   */
  getNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get all edges
   */
  getEdges(): GraphEdge[] {
    return this.edges;
  }
}

