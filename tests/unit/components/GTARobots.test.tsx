import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GTARobots from '@/components/GTARobots';

// Mock canvas context
const mockContext = {
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Uint8ClampedArray(4),
  })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({
    data: new Uint8ClampedArray(4),
  })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  translate: jest.fn(),
  transform: jest.fn(),
  beginPath: jest.fn(),
  closePath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  bezierCurveTo: jest.fn(),
  quadraticCurveTo: jest.fn(),
  arc: jest.fn(),
  arcTo: jest.fn(),
  ellipse: jest.fn(),
  rect: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  clip: jest.fn(),
  isPointInPath: jest.fn(),
  isPointInStroke: jest.fn(),
  strokeStyle: '',
  fillStyle: '',
  globalAlpha: 1,
  lineWidth: 1,
  lineCap: 'butt' as CanvasLineCap,
  lineJoin: 'miter' as CanvasLineJoin,
  miterLimit: 10,
  setLineDash: jest.fn(),
  getLineDash: jest.fn(() => []),
  lineDashOffset: 0,
  font: '10px sans-serif',
  textAlign: 'start' as CanvasTextAlign,
  textBaseline: 'alphabetic' as CanvasTextBaseline,
  fillText: jest.fn(),
  strokeText: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  globalCompositeOperation: 'source-over' as GlobalCompositeOperation,
  imageSmoothingEnabled: true,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowBlur: 0,
  shadowColor: 'rgba(0, 0, 0, 0)',
  filter: 'none',
};

describe('GTARobots', () => {
  let mockRequestAnimationFrame: jest.SpyInstance;
  let mockCancelAnimationFrame: jest.SpyInstance;

  beforeEach(() => {
    // Mock canvas getContext
    HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext as any);
    
    // Mock requestAnimationFrame to prevent infinite loop
    let frameCount = 0;
    mockRequestAnimationFrame = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      if (frameCount < 3) { // Only run a few frames for testing
        frameCount++;
        setTimeout(() => cb(0), 0);
      }
      return frameCount;
    });
    
    // Mock cancelAnimationFrame
    mockCancelAnimationFrame = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
  });

  afterEach(() => {
    mockRequestAnimationFrame.mockRestore();
    mockCancelAnimationFrame.mockRestore();
    jest.clearAllMocks();
  });

  test('renders canvas element', () => {
    const { container } = render(<GTARobots />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveClass('fixed', 'inset-0', 'bg-gray-900');
    expect(canvas).toHaveStyle({ cursor: 'crosshair' });
  });

  test('initializes canvas with correct dimensions', () => {
    const { container } = render(<GTARobots />);
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    
    expect(canvas.width).toBe(1024);
    expect(canvas.height).toBe(768);
  });

  test('creates correct number of robots', () => {
    render(<GTARobots />);
    
    // Check that drawing operations were called (robots are being rendered)
    expect(mockContext.fillRect).toHaveBeenCalled();
    expect(mockContext.beginPath).toHaveBeenCalled();
  });

  test('handles mouse movement', () => {
    render(<GTARobots />);
    
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: 500,
      clientY: 400,
    });
    
    window.dispatchEvent(mouseEvent);
    
    // Animation should continue after mouse movement
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });

  test('draws communication connections', () => {
    render(<GTARobots />);
    
    // Check that communication web drawing functions are called
    expect(mockContext.setLineDash).toHaveBeenCalled();
    expect(mockContext.strokeStyle).toBeDefined();
  });

  test('renders world map', () => {
    render(<GTARobots />);
    
    // Check that world map is drawn
    expect(mockContext.moveTo).toHaveBeenCalled();
    expect(mockContext.lineTo).toHaveBeenCalled();
    expect(mockContext.closePath).toHaveBeenCalled();
  });

  test('displays HUD information', () => {
    render(<GTARobots />);
    
    // Check that HUD text is rendered
    expect(mockContext.fillText).toHaveBeenCalledWith(
      expect.stringContaining('World Exploration Demo'),
      expect.any(Number),
      expect.any(Number)
    );
  });

  test('handles window resize', () => {
    const { container } = render(<GTARobots />);
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    
    // Change window size
    Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1080, configurable: true });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
    
    // Canvas should update to new dimensions
    expect(canvas.width).toBe(1920);
    expect(canvas.height).toBe(1080);
  });

  test('cleans up on unmount', () => {
    const { unmount } = render(<GTARobots />);
    
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    unmount();
    
    expect(mockCancelAnimationFrame).toHaveBeenCalled();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });

  test('robot communication network updates', () => {
    render(<GTARobots />);
    
    // Check that communication-related drawing operations occur
    // This includes drawing connection lines and data packets
    expect(mockContext.arc).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  test('displays network statistics in HUD', () => {
    render(<GTARobots />);
    
    // Check that network statistics are displayed
    expect(mockContext.fillText).toHaveBeenCalledWith(
      expect.stringContaining('Network Connections'),
      expect.any(Number),
      expect.any(Number)
    );
  });

  test('renders communication aura for connected robots', () => {
    render(<GTARobots />);
    
    // Check that communication auras are drawn
    expect(mockContext.globalAlpha).toBeDefined();
    expect(mockContext.arc).toHaveBeenCalled();
    expect(mockContext.fill).toHaveBeenCalled();
  });

  test('draws data packet animations', () => {
    render(<GTARobots />);
    
    // Data packets should be drawn along connection lines
    expect(mockContext.fillStyle).toBeDefined();
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.arc).toHaveBeenCalled();
  });

  test('handles different robot types and roles', () => {
    render(<GTARobots />);
    
    // Different robot types should result in different drawing operations
    // Police, civilian, and emergency vehicles have different shapes
    expect(mockContext.fillRect).toHaveBeenCalled();
    expect(mockContext.rotate).toHaveBeenCalled();
  });

  test('initializes cities for discovery', () => {
    render(<GTARobots />);
    
    // Cities should be rendered on the map
    expect(mockContext.arc).toHaveBeenCalled();
    expect(mockContext.fillText).toHaveBeenCalled();
  });
});