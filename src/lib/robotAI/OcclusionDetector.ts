/**
 * OcclusionDetector.ts
 * Detects obstacles and occlusion zones by analyzing DOM elements and pixel data
 * Creates collision maps for robot navigation
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OcclusionZone {
  bounds: BoundingBox;
  type: 'text' | 'button' | 'image' | 'container' | 'interactive';
  priority: number; // Higher priority = more important to avoid
  padding: number; // Extra space around the element
}

export interface CollisionMap {
  grid: boolean[][]; // true = obstacle, false = clear
  gridSize: number;
  width: number;
  height: number;
  zones: OcclusionZone[];
}

export class OcclusionDetector {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private screenWidth: number;
  private screenHeight: number;
  private gridSize: number;
  private excludeSelectors: string[];

  constructor(
    screenWidth: number, 
    screenHeight: number, 
    gridSize: number = 20
  ) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.gridSize = gridSize;
    this.excludeSelectors = [
      '.robot', // Don't treat robots as obstacles
      '.robot-trail',
      '.debug-overlay',
      '.cursor-trail'
    ];
    this.initializeCanvas();
  }

  private initializeCanvas(): void {
    // Create off-screen canvas for pixel sampling
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.screenWidth;
    this.canvas.height = this.screenHeight;
    this.ctx = this.canvas.getContext('2d');
  }

  /**
   * Main detection method - analyzes current page and returns collision map
   */
  public detectOcclusions(): CollisionMap {
    const zones = this.detectDOMElements();
    const grid = this.createCollisionGrid(zones);

    return {
      grid,
      gridSize: this.gridSize,
      width: Math.ceil(this.screenWidth / this.gridSize),
      height: Math.ceil(this.screenHeight / this.gridSize),
      zones
    };
  }

  /**
   * Detects DOM elements that should be treated as obstacles
   */
  private detectDOMElements(): OcclusionZone[] {
    const zones: OcclusionZone[] = [];
    
    // Get all visible elements
    const elements = this.getVisibleElements();
    
    for (const element of elements) {
      const rect = element.getBoundingClientRect();
      
      // Skip if element is too small or outside viewport
      if (rect.width < 10 || rect.height < 10 || 
          rect.right < 0 || rect.left > this.screenWidth ||
          rect.bottom < 0 || rect.top > this.screenHeight) {
        continue;
      }

      // Skip if element is excluded
      if (this.isExcludedElement(element)) {
        continue;
      }

      const zone = this.createOcclusionZone(element, rect);
      if (zone) {
        zones.push(zone);
      }
    }

    return zones;
  }

  private getVisibleElements(): Element[] {
    const elements: Element[] = [];
    
    // Get all elements in the document
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          const element = node as Element;
          const style = window.getComputedStyle(element);
          
          // Only include visible elements
          if (style.display === 'none' || 
              style.visibility === 'hidden' || 
              style.opacity === '0') {
            return NodeFilter.FILTER_REJECT;
          }
          
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      elements.push(node as Element);
    }

    return elements;
  }

  private isExcludedElement(element: Element): boolean {
    // Check if element matches any exclude selector
    for (const selector of this.excludeSelectors) {
      if (element.matches(selector)) {
        return true;
      }
    }

    // Check if element is inside an excluded container
    for (const selector of this.excludeSelectors) {
      if (element.closest(selector)) {
        return true;
      }
    }

    // Skip HTML, BODY, and other structural elements
    if (['HTML', 'BODY', 'HEAD', 'SCRIPT', 'STYLE', 'META', 'LINK'].includes(element.tagName)) {
      return true;
    }

    return false;
  }

  private createOcclusionZone(element: Element, rect: DOMRect): OcclusionZone | null {
    const tagName = element.tagName.toLowerCase();
    const style = window.getComputedStyle(element);
    
    // Determine zone type and properties
    let type: OcclusionZone['type'] = 'container';
    let priority = 1;
    let padding = 10;

    // Interactive elements get high priority
    if (this.isInteractiveElement(element)) {
      type = 'interactive';
      priority = 3;
      padding = 20;
    }
    // Buttons and inputs
    else if (['button', 'input', 'select', 'textarea'].includes(tagName) ||
             element.hasAttribute('onclick') ||
             element.classList.contains('btn') ||
             element.classList.contains('button')) {
      type = 'button';
      priority = 3;
      padding = 15;
    }
    // Text content
    else if (this.hasSignificantText(element)) {
      type = 'text';
      priority = 2;
      padding = 8;
    }
    // Images
    else if (['img', 'svg', 'canvas', 'video'].includes(tagName)) {
      type = 'image';
      priority = 2;
      padding = 5;
    }
    // Containers with background or border
    else if (this.hasVisualBackground(style)) {
      type = 'container';
      priority = 1;
      padding = 5;
    }
    else {
      // Skip elements that don't create visual obstacles
      return null;
    }

    return {
      bounds: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      },
      type,
      priority,
      padding
    };
  }

  private isInteractiveElement(element: Element): boolean {
    const interactiveSelectors = [
      'a[href]',
      'button',
      'input',
      'select',
      'textarea',
      '[tabindex]',
      '[role="button"]',
      '[role="link"]',
      '[onclick]',
      '.clickable',
      '.interactive'
    ];

    return interactiveSelectors.some(selector => element.matches(selector));
  }

  private hasSignificantText(element: Element): boolean {
    const text = element.textContent?.trim() || '';
    
    // Must have substantial text content
    if (text.length < 5) return false;

    // Check if element primarily contains text
    const childElements = element.children.length;
    const textLength = text.length;
    
    // If it has few child elements and significant text, it's likely a text element
    return childElements < 3 && textLength > 10;
  }

  private hasVisualBackground(style: CSSStyleDeclaration): boolean {
    const backgroundColor = style.backgroundColor;
    const backgroundImage = style.backgroundImage;
    const border = style.border;
    const boxShadow = style.boxShadow;

    // Check for visible background
    if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
      return true;
    }

    if (backgroundImage && backgroundImage !== 'none') {
      return true;
    }

    if (border && border !== 'none' && !border.includes('0px')) {
      return true;
    }

    if (boxShadow && boxShadow !== 'none') {
      return true;
    }

    return false;
  }

  /**
   * Creates a grid-based collision map from occlusion zones
   */
  private createCollisionGrid(zones: OcclusionZone[]): boolean[][] {
    const gridWidth = Math.ceil(this.screenWidth / this.gridSize);
    const gridHeight = Math.ceil(this.screenHeight / this.gridSize);
    
    // Initialize grid as all walkable
    const grid: boolean[][] = [];
    for (let y = 0; y < gridHeight; y++) {
      grid[y] = new Array(gridWidth).fill(false);
    }

    // Mark obstacle cells
    for (const zone of zones) {
      this.markZoneInGrid(grid, zone, gridWidth, gridHeight);
    }

    return grid;
  }

  private markZoneInGrid(
    grid: boolean[][],
    zone: OcclusionZone,
    gridWidth: number,
    gridHeight: number
  ): void {
    // Calculate expanded bounds with padding
    const expandedBounds = {
      x: Math.max(0, zone.bounds.x - zone.padding),
      y: Math.max(0, zone.bounds.y - zone.padding),
      width: zone.bounds.width + (zone.padding * 2),
      height: zone.bounds.height + (zone.padding * 2)
    };

    // Convert to grid coordinates
    const startX = Math.floor(expandedBounds.x / this.gridSize);
    const endX = Math.min(gridWidth - 1, Math.ceil((expandedBounds.x + expandedBounds.width) / this.gridSize));
    const startY = Math.floor(expandedBounds.y / this.gridSize);
    const endY = Math.min(gridHeight - 1, Math.ceil((expandedBounds.y + expandedBounds.height) / this.gridSize));

    // Mark cells as obstacles
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        if (y >= 0 && y < gridHeight && x >= 0 && x < gridWidth) {
          grid[y][x] = true; // true = obstacle
        }
      }
    }
  }

  /**
   * Advanced pixel-based obstacle detection (more accurate but slower)
   */
  public detectPixelObstacles(): CollisionMap {
    if (!this.ctx) {
      return this.detectOcclusions(); // Fallback to DOM detection
    }

    // Capture current screen state
    this.captureScreen();

    // Analyze pixels for obstacles
    const zones = this.analyzePixelData();
    const grid = this.createCollisionGrid(zones);

    return {
      grid,
      gridSize: this.gridSize,
      width: Math.ceil(this.screenWidth / this.gridSize),
      height: Math.ceil(this.screenHeight / this.gridSize),
      zones
    };
  }

  private captureScreen(): void {
    if (!this.ctx) return;

    // This is a simplified version - in practice, you might use html2canvas
    // or similar library for accurate screen capture
    this.ctx.clearRect(0, 0, this.screenWidth, this.screenHeight);
    
    // For now, we'll use DOM-based detection
    // In a real implementation, you'd capture the actual rendered pixels
  }

  private analyzePixelData(): OcclusionZone[] {
    if (!this.ctx) return [];

    const zones: OcclusionZone[] = [];
    const imageData = this.ctx.getImageData(0, 0, this.screenWidth, this.screenHeight);
    const data = imageData.data;

    // Sample pixels at grid intervals to detect edges and contrasts
    const sampleSize = this.gridSize;
    
    for (let y = 0; y < this.screenHeight; y += sampleSize) {
      for (let x = 0; x < this.screenWidth; x += sampleSize) {
        const hasObstacle = this.detectObstacleAtPixel(data, x, y);
        
        if (hasObstacle) {
          zones.push({
            bounds: {
              x: x,
              y: y,
              width: sampleSize,
              height: sampleSize
            },
            type: 'container',
            priority: 1,
            padding: 5
          });
        }
      }
    }

    return zones;
  }

  private detectObstacleAtPixel(data: Uint8ClampedArray, x: number, y: number): boolean {
    const index = (y * this.screenWidth + x) * 4;
    
    if (index >= data.length) return false;

    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    // const a = data[index + 3]; // Alpha channel not used

    // Simple edge detection - look for significant color differences
    const neighbors = [
      { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
      { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
    ];

    for (const neighbor of neighbors) {
      const nx = x + neighbor.dx;
      const ny = y + neighbor.dy;
      
      if (nx >= 0 && nx < this.screenWidth && ny >= 0 && ny < this.screenHeight) {
        const nIndex = (ny * this.screenWidth + nx) * 4;
        const nr = data[nIndex];
        const ng = data[nIndex + 1];
        const nb = data[nIndex + 2];

        // Calculate color difference
        const colorDiff = Math.abs(r - nr) + Math.abs(g - ng) + Math.abs(b - nb);
        
        if (colorDiff > 100) { // Significant edge detected
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Real-time obstacle detection for dynamic content
   */
  public detectMovingObstacles(previousMap: CollisionMap): CollisionMap {
    const currentMap = this.detectOcclusions();
    
    // Compare with previous map to identify newly appeared obstacles
    const dynamicZones: OcclusionZone[] = [];
    
    for (const zone of currentMap.zones) {
      const wasPresent = this.findSimilarZone(zone, previousMap.zones);
      if (!wasPresent) {
        // This is a new or moved obstacle
        zone.priority = Math.max(zone.priority, 2); // Increase priority for dynamic obstacles
        dynamicZones.push(zone);
      }
    }

    // Merge with static zones
    const allZones = [...currentMap.zones, ...dynamicZones];
    const grid = this.createCollisionGrid(allZones);

    return {
      grid,
      gridSize: this.gridSize,
      width: currentMap.width,
      height: currentMap.height,
      zones: allZones
    };
  }

  private findSimilarZone(zone: OcclusionZone, zones: OcclusionZone[]): boolean {
    const threshold = 20; // pixels

    return zones.some(existingZone => {
      const dx = Math.abs(zone.bounds.x - existingZone.bounds.x);
      const dy = Math.abs(zone.bounds.y - existingZone.bounds.y);
      const dw = Math.abs(zone.bounds.width - existingZone.bounds.width);
      const dh = Math.abs(zone.bounds.height - existingZone.bounds.height);

      return dx < threshold && dy < threshold && dw < threshold && dh < threshold;
    });
  }

  /**
   * Update screen dimensions when window resizes
   */
  public updateScreenSize(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
    
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  /**
   * Add custom exclude selectors
   */
  public addExcludeSelector(selector: string): void {
    if (!this.excludeSelectors.includes(selector)) {
      this.excludeSelectors.push(selector);
    }
  }

  /**
   * Get debug visualization of detected obstacles
   */
  public getDebugVisualization(): { zones: OcclusionZone[]; grid: boolean[][] } {
    const collisionMap = this.detectOcclusions();
    return {
      zones: collisionMap.zones,
      grid: collisionMap.grid
    };
  }
}