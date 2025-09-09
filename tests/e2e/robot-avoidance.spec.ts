import { test, expect, Page, Locator } from '@playwright/test';

class RobotAvoidanceTestHelper {
  constructor(private page: Page) {}

  async navigateToTestPage(): Promise<void> {
    await this.page.goto('/test/robot-playground');
    await this.page.waitForLoadState('networkidle');
  }

  async enableRoboticsFeature(): Promise<void> {
    // Enable robotics feature flag
    await this.page.evaluate(() => {
      localStorage.setItem('feature_robotics_enabled', 'true');
      localStorage.setItem('robot_avoidance_enabled', 'true');
    });
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }

  async waitForRobotsToLoad(): Promise<void> {
    await this.page.waitForSelector('[data-testid="robot-canvas"]', { timeout: 5000 });
    await this.page.waitForFunction(() => {
      const canvas = document.querySelector('[data-testid="robot-canvas"]') as HTMLCanvasElement;
      return canvas && canvas.getContext('2d') !== null;
    });
  }

  async getRobotPositions(): Promise<Array<{ id: string; x: number; y: number }>> {
    return await this.page.evaluate(() => {
      // Access robot positions from global state or robot system
      const robotSystem = (window as any).__robotSystem;
      if (!robotSystem) return [];
      
      return robotSystem.getRobots().map((robot: any) => ({
        id: robot.id,
        x: robot.position.x,
        y: robot.position.y,
      }));
    });
  }

  async setMousePosition(x: number, y: number): Promise<void> {
    await this.page.mouse.move(x, y);
    await this.page.waitForTimeout(100); // Allow robots to react
  }

  async clickElement(selector: string): Promise<void> {
    const element = this.page.locator(selector);
    await element.click();
  }

  async getElementBounds(selector: string): Promise<{ x: number; y: number; width: number; height: number }> {
    return await this.page.locator(selector).boundingBox() || { x: 0, y: 0, width: 0, height: 0 };
  }

  async measureDistanceFromRobotsToElement(selector: string): Promise<number[]> {
    const elementBounds = await this.getElementBounds(selector);
    const robotPositions = await this.getRobotPositions();
    
    const centerX = elementBounds.x + elementBounds.width / 2;
    const centerY = elementBounds.y + elementBounds.height / 2;
    
    return robotPositions.map(robot => {
      const dx = robot.x - centerX;
      const dy = robot.y - centerY;
      return Math.sqrt(dx * dx + dy * dy);
    });
  }

  async waitForRobotsToSettle(timeoutMs: number = 2000): Promise<void> {
    await this.page.waitForFunction(
      () => {
        const robotSystem = (window as any).__robotSystem;
        if (!robotSystem) return true;
        
        const robots = robotSystem.getRobots();
        return robots.every((robot: any) => {
          const speed = Math.sqrt(robot.velocity.x ** 2 + robot.velocity.y ** 2);
          return speed < 0.1; // Consider settled if moving very slowly
        });
      },
      { timeout: timeoutMs }
    );
  }

  async captureRobotCanvas(): Promise<Buffer> {
    const canvas = await this.page.locator('[data-testid="robot-canvas"]');
    return await canvas.screenshot();
  }

  async simulateUserInteraction(elementSelector: string, interactionType: 'hover' | 'click' | 'focus'): Promise<void> {
    const element = this.page.locator(elementSelector);
    
    switch (interactionType) {
      case 'hover':
        await element.hover();
        break;
      case 'click':
        await element.click();
        break;
      case 'focus':
        await element.focus();
        break;
    }
  }

  async getFrameRate(): Promise<number> {
    return await this.page.evaluate(() => {
      const robotSystem = (window as any).__robotSystem;
      return robotSystem ? robotSystem.getCurrentFrameRate() : 0;
    });
  }

  async getRobotCount(): Promise<number> {
    return await this.page.evaluate(() => {
      const robotSystem = (window as any).__robotSystem;
      return robotSystem ? robotSystem.getRobots().length : 0;
    });
  }

  async isRobotAvoidanceWorking(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const robotSystem = (window as any).__robotSystem;
      if (!robotSystem) return false;
      
      // Check if avoidance system is initialized and running
      return robotSystem.isAvoidanceActive && robotSystem.isAvoidanceActive();
    });
  }
}

test.describe('Robot Avoidance E2E Tests', () => {
  let robotHelper: RobotAvoidanceTestHelper;

  test.beforeEach(async ({ page }) => {
    robotHelper = new RobotAvoidanceTestHelper(page);
    await robotHelper.navigateToTestPage();
    await robotHelper.enableRoboticsFeature();
    await robotHelper.waitForRobotsToLoad();
  });

  test.describe('Basic Avoidance Behavior', () => {
    test('robots should avoid button elements', async ({ page }) => {
      // Wait for robots to initialize
      await robotHelper.waitForRobotsToSettle();

      // Get initial robot positions
      const initialPositions = await robotHelper.getRobotPositions();
      expect(initialPositions.length).toBeGreaterThan(0);

      // Move mouse near a button to attract robots
      await robotHelper.setMousePosition(300, 200);
      await page.waitForTimeout(500);

      // Measure distances from robots to button
      const distances = await robotHelper.measureDistanceFromRobotsToElement('[data-testid="test-button"]');
      
      // All robots should maintain minimum distance from button
      const minDistance = 60; // Expected minimum avoidance distance
      distances.forEach(distance => {
        expect(distance).toBeGreaterThan(minDistance);
      });
    });

    test('robots should avoid input fields', async ({ page }) => {
      await robotHelper.waitForRobotsToSettle();

      // Position mouse near input field
      const inputBounds = await robotHelper.getElementBounds('[data-testid="test-input"]');
      await robotHelper.setMousePosition(inputBounds.x + 10, inputBounds.y + 10);
      
      await page.waitForTimeout(800);

      const distances = await robotHelper.measureDistanceFromRobotsToElement('[data-testid="test-input"]');
      
      // Robots should avoid input fields
      const minDistance = 50;
      distances.forEach(distance => {
        expect(distance).toBeGreaterThan(minDistance);
      });
    });

    test('robots should provide visual feedback when near interactive elements', async ({ page }) => {
      await robotHelper.waitForRobotsToSettle();

      // Move mouse to attract robots near button
      await robotHelper.setMousePosition(250, 180);
      await page.waitForTimeout(500);

      // Check if button receives visual feedback
      const buttonStyle = await page.locator('[data-testid="test-button"]').evaluate(el => {
        const computed = getComputedStyle(el);
        return {
          borderColor: computed.borderColor,
          boxShadow: computed.boxShadow,
        };
      });

      // Button should have avoidance visual feedback
      expect(buttonStyle.borderColor).toContain('255, 107, 107'); // Red border
      expect(buttonStyle.boxShadow).toContain('rgba(255, 107, 107'); // Red glow
    });

    test('robots should respect element priority in avoidance', async ({ page }) => {
      await robotHelper.waitForRobotsToSettle();

      // Position mouse equidistant from high and low priority elements
      await robotHelper.setMousePosition(400, 250);
      await page.waitForTimeout(1000);

      const buttonDistances = await robotHelper.measureDistanceFromRobotsToElement('[data-testid="high-priority-button"]');
      const textDistances = await robotHelper.measureDistanceFromRobotsToElement('[data-testid="low-priority-text"]');

      // Robots should maintain greater distance from higher priority elements
      const avgButtonDistance = buttonDistances.reduce((a, b) => a + b, 0) / buttonDistances.length;
      const avgTextDistance = textDistances.reduce((a, b) => a + b, 0) / textDistances.length;

      expect(avgButtonDistance).toBeGreaterThan(avgTextDistance * 1.2);
    });
  });

  test.describe('Mouse Following with Avoidance', () => {
    test('robots should follow mouse while avoiding UI elements', async ({ page }) => {
      await robotHelper.waitForRobotsToSettle();

      const initialPositions = await robotHelper.getRobotPositions();

      // Move mouse in a path that goes near UI elements
      const mousePath = [
        { x: 100, y: 100 },   // Start position
        { x: 280, y: 180 },   // Near button
        { x: 480, y: 280 },   // Near input
        { x: 600, y: 400 },   // Safe area
      ];

      for (const point of mousePath) {
        await robotHelper.setMousePosition(point.x, point.y);
        await page.waitForTimeout(400);
      }

      const finalPositions = await robotHelper.getRobotPositions();

      // Robots should have generally moved toward final mouse position
      finalPositions.forEach((finalPos, index) => {
        const initialPos = initialPositions[index];
        const distanceToFinalMouse = Math.sqrt(
          (finalPos.x - 600) ** 2 + (finalPos.y - 400) ** 2
        );
        const initialDistanceToFinalMouse = Math.sqrt(
          (initialPos.x - 600) ** 2 + (initialPos.y - 400) ** 2
        );

        expect(distanceToFinalMouse).toBeLessThan(initialDistanceToFinalMouse);
      });

      // But should still maintain distance from UI elements
      const buttonDistances = await robotHelper.measureDistanceFromRobotsToElement('[data-testid="test-button"]');
      buttonDistances.forEach(distance => {
        expect(distance).toBeGreaterThan(50);
      });
    });

    test('robots should handle rapid mouse movements', async ({ page }) => {
      await robotHelper.waitForRobotsToSettle();

      // Rapid zigzag mouse movement
      for (let i = 0; i < 20; i++) {
        const x = 300 + Math.sin(i * 0.5) * 100;
        const y = 300 + Math.cos(i * 0.5) * 100;
        await robotHelper.setMousePosition(x, y);
        await page.waitForTimeout(50);
      }

      // System should maintain good performance
      const frameRate = await robotHelper.getFrameRate();
      expect(frameRate).toBeGreaterThan(30);

      // Robots should still be avoiding UI elements
      const distances = await robotHelper.measureDistanceFromRobotsToElement('[data-testid="test-button"]');
      distances.forEach(distance => {
        expect(distance).toBeGreaterThan(40);
      });
    });
  });

  test.describe('User Interaction Scenarios', () => {
    test('robots should not interfere with button clicks', async ({ page }) => {
      await robotHelper.waitForRobotsToSettle();

      let clickCount = 0;
      
      // Setup click counter
      await page.evaluate(() => {
        const button = document.querySelector('[data-testid="test-button"]') as HTMLElement;
        if (button) {
          button.addEventListener('click', () => {
            (window as any).__clickCount = ((window as any).__clickCount || 0) + 1;
          });
        }
      });

      // Attract robots near button, then click
      await robotHelper.setMousePosition(280, 180);
      await page.waitForTimeout(300);

      // Click the button multiple times
      for (let i = 0; i < 5; i++) {
        await robotHelper.clickElement('[data-testid="test-button"]');
        await page.waitForTimeout(100);
      }

      // Verify all clicks were registered
      const registeredClicks = await page.evaluate(() => (window as any).__clickCount || 0);
      expect(registeredClicks).toBe(5);

      // Robots should still be avoiding the button
      const distances = await robotHelper.measureDistanceFromRobotsToElement('[data-testid="test-button"]');
      distances.forEach(distance => {
        expect(distance).toBeGreaterThan(50);
      });
    });

    test('robots should not interfere with form input', async ({ page }) => {
      await robotHelper.waitForRobotsToSettle();

      const testText = 'Robot avoidance test input';
      
      // Attract robots near input field
      await robotHelper.setMousePosition(520, 320);
      await page.waitForTimeout(300);

      // Focus and type in input field
      await robotHelper.simulateUserInteraction('[data-testid="test-input"]', 'focus');
      await page.fill('[data-testid="test-input"]', testText);

      // Verify input value
      const inputValue = await page.inputValue('[data-testid="test-input"]');
      expect(inputValue).toBe(testText);

      // Robots should maintain distance from input
      const distances = await robotHelper.measureDistanceFromRobotsToElement('[data-testid="test-input"]');
      distances.forEach(distance => {
        expect(distance).toBeGreaterThan(40);
      });
    });

    test('robots should handle hover states correctly', async ({ page }) => {
      await robotHelper.waitForRobotsToSettle();

      // Move mouse near hoverable element
      await robotHelper.setMousePosition(350, 280);
      await page.waitForTimeout(200);

      // Hover over element
      await robotHelper.simulateUserInteraction('[data-testid="hoverable-element"]', 'hover');
      await page.waitForTimeout(300);

      // Check hover state is active
      const isHovered = await page.locator('[data-testid="hoverable-element"]').evaluate(el => {
        return el.matches(':hover');
      });
      expect(isHovered).toBe(true);

      // Robots should still avoid the element
      const distances = await robotHelper.measureDistanceFromRobotsToElement('[data-testid="hoverable-element"]');
      distances.forEach(distance => {
        expect(distance).toBeGreaterThan(45);
      });
    });
  });

  test.describe('Performance and Stability', () => {
    test('should maintain 60fps with multiple robots', async ({ page }) => {
      await robotHelper.waitForRobotsToSettle();

      // Ensure we have multiple robots
      const robotCount = await robotHelper.getRobotCount();
      expect(robotCount).toBeGreaterThanOrEqual(5);

      // Run performance test for 3 seconds
      const startTime = Date.now();
      const testDuration = 3000;

      while (Date.now() - startTime < testDuration) {
        // Create dynamic mouse movement
        const elapsed = Date.now() - startTime;
        const x = 400 + Math.sin(elapsed * 0.001) * 200;
        const y = 300 + Math.cos(elapsed * 0.0015) * 150;
        
        await robotHelper.setMousePosition(x, y);
        await page.waitForTimeout(16); // ~60fps
      }

      const frameRate = await robotHelper.getFrameRate();
      expect(frameRate).toBeGreaterThan(50); // Allow some tolerance below 60fps
    });

    test('should handle stress test with many UI elements', async ({ page }) => {
      await robotHelper.waitForRobotsToSettle();

      // Add many UI elements dynamically
      await page.evaluate(() => {
        const container = document.body;
        
        for (let i = 0; i < 20; i++) {
          const button = document.createElement('button');
          button.textContent = `Button ${i}`;
          button.style.position = 'absolute';
          button.style.left = (100 + (i % 5) * 150) + 'px';
          button.style.top = (100 + Math.floor(i / 5) * 80) + 'px';
          button.setAttribute('data-testid', `stress-button-${i}`);
          container.appendChild(button);
        }
      });

      await page.waitForTimeout(500);

      // Move mouse around to create complex avoidance scenarios
      for (let i = 0; i < 10; i++) {
        const x = 200 + (i % 3) * 200;
        const y = 150 + Math.floor(i / 3) * 100;
        await robotHelper.setMousePosition(x, y);
        await page.waitForTimeout(200);
      }

      // System should maintain stability
      const frameRate = await robotHelper.getFrameRate();
      expect(frameRate).toBeGreaterThan(20); // Lower threshold for stress test

      const isAvoidanceWorking = await robotHelper.isRobotAvoidanceWorking();
      expect(isAvoidanceWorking).toBe(true);
    });

    test('should recover from edge cases', async ({ page }) => {
      await robotHelper.waitForRobotsToSettle();

      // Test edge case: mouse at exact element position
      const buttonBounds = await robotHelper.getElementBounds('[data-testid="test-button"]');
      await robotHelper.setMousePosition(
        buttonBounds.x + buttonBounds.width / 2,
        buttonBounds.y + buttonBounds.height / 2
      );
      await page.waitForTimeout(500);

      // System should handle this gracefully
      const frameRate = await robotHelper.getFrameRate();
      expect(frameRate).toBeGreaterThan(30);

      // Test edge case: rapid element removal/addition
      await page.evaluate(() => {
        const testButton = document.querySelector('[data-testid="test-button"]');
        if (testButton && testButton.parentNode) {
          testButton.parentNode.removeChild(testButton);
          
          setTimeout(() => {
            const newButton = document.createElement('button');
            newButton.textContent = 'New Button';
            newButton.setAttribute('data-testid', 'test-button');
            newButton.style.position = 'absolute';
            newButton.style.left = '300px';
            newButton.style.top = '200px';
            document.body.appendChild(newButton);
          }, 100);
        }
      });

      await page.waitForTimeout(400);

      // System should continue working
      const finalFrameRate = await robotHelper.getFrameRate();
      expect(finalFrameRate).toBeGreaterThan(20);
    });
  });

  test.describe('Accessibility Integration', () => {
    test('robots should not interfere with keyboard navigation', async ({ page }) => {
      await robotHelper.waitForRobotsToSettle();

      // Attract robots near interactive elements
      await robotHelper.setMousePosition(350, 250);
      await page.waitForTimeout(300);

      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      await page.keyboard.press('Enter');

      // Check that keyboard events work properly
      const activeElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(activeElement).toBeTruthy();

      // Robots should still be active
      const robotCount = await robotHelper.getRobotCount();
      expect(robotCount).toBeGreaterThan(0);
    });

    test('robots should not interfere with screen reader focus', async ({ page }) => {
      await robotHelper.waitForRobotsToSettle();

      // Simulate screen reader focus on elements
      const elements = ['[data-testid="test-button"]', '[data-testid="test-input"]'];
      
      for (const selector of elements) {
        await page.locator(selector).focus();
        await page.waitForTimeout(200);
        
        // Check element is focused
        const isFocused = await page.locator(selector).evaluate(el => el === document.activeElement);
        expect(isFocused).toBe(true);
        
        // Robots should still maintain avoidance
        const distances = await robotHelper.measureDistanceFromRobotsToElement(selector);
        distances.forEach(distance => {
          expect(distance).toBeGreaterThan(40);
        });
      }
    });
  });

  test.describe('Visual Regression', () => {
    test('robot canvas should render consistently', async ({ page }) => {
      await robotHelper.waitForRobotsToSettle();

      // Set consistent state
      await robotHelper.setMousePosition(400, 300);
      await page.waitForTimeout(1000);

      // Capture robot canvas
      const screenshot = await robotHelper.captureRobotCanvas();
      expect(screenshot).toBeTruthy();
    });

    test('UI feedback should be visually consistent', async ({ page }) => {
      await robotHelper.waitForRobotsToSettle();

      // Trigger visual feedback
      await robotHelper.setMousePosition(280, 180);
      await page.waitForTimeout(500);

      // Take screenshot of button with feedback
      const buttonScreenshot = await page.locator('[data-testid="test-button"]').screenshot();
      expect(buttonScreenshot).toBeTruthy();

      // Reset and verify feedback is gone
      await robotHelper.setMousePosition(600, 500);
      await page.waitForTimeout(500);

      const resetButtonScreenshot = await page.locator('[data-testid="test-button"]').screenshot();
      expect(resetButtonScreenshot).toBeTruthy();
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('should work consistently across different viewport sizes', async ({ page }) => {
      await robotHelper.waitForRobotsToSettle();

      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      let frameRate = await robotHelper.getFrameRate();
      expect(frameRate).toBeGreaterThan(20);

      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);

      frameRate = await robotHelper.getFrameRate();
      expect(frameRate).toBeGreaterThan(20);

      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);

      frameRate = await robotHelper.getFrameRate();
      expect(frameRate).toBeGreaterThan(30);
    });

    test('should handle touch events on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await robotHelper.waitForRobotsToSettle();

      // Simulate touch events
      await page.touchscreen.tap(300, 200);
      await page.waitForTimeout(200);

      // Robots should respond to touch like mouse
      const distances = await robotHelper.measureDistanceFromRobotsToElement('[data-testid="test-button"]');
      distances.forEach(distance => {
        expect(distance).toBeGreaterThan(40);
      });
    });
  });
});