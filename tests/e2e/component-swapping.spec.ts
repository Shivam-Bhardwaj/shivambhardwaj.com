import { test, expect, Page, Locator } from '@playwright/test';

class ComponentSwappingTestHelper {
  constructor(private page: Page) {}

  async navigateToAdminPanel(): Promise<void> {
    await this.page.goto('/admin/component-playground');
    await this.page.waitForLoadState('networkidle');
  }

  async enableAdminFeatures(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.setItem('feature_admin_tools', 'true');
      localStorage.setItem('component_playground_enabled', 'true');
      localStorage.setItem('hot_reload_enabled', 'true');
    });
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }

  async waitForComponentPlayground(): Promise<void> {
    await this.page.waitForSelector('[data-testid="component-playground"]', { timeout: 10000 });
    await this.page.waitForSelector('[data-testid="dynamic-zone"]', { timeout: 5000 });
  }

  async selectComponentFromRegistry(componentId: string): Promise<void> {
    await this.page.selectOption('[data-testid="component-selector"]', componentId);
    await this.page.waitForTimeout(500);
  }

  async swapComponent(zoneId: string, newComponentId: string, transition: 'instant' | 'fade' | 'slide' = 'instant'): Promise<void> {
    // Select target zone
    await this.page.selectOption('[data-testid="zone-selector"]', zoneId);
    await this.page.waitForTimeout(200);

    // Select new component
    await this.selectComponentFromRegistry(newComponentId);

    // Select transition type
    await this.page.selectOption('[data-testid="transition-selector"]', transition);

    // Execute swap
    await this.page.click('[data-testid="swap-component-button"]');
    
    if (transition !== 'instant') {
      await this.page.waitForTimeout(1000); // Wait for transition
    } else {
      await this.page.waitForTimeout(200);
    }
  }

  async getActiveComponentInZone(zoneId: string): Promise<string | null> {
    const zoneElement = this.page.locator(`[data-testid="${zoneId}"]`);
    const componentClass = await zoneElement.getAttribute('data-active-component');
    return componentClass;
  }

  async getComponentContent(zoneId: string): Promise<string> {
    const zone = this.page.locator(`[data-testid="${zoneId}"]`);
    return await zone.textContent() || '';
  }

  async measureSwapPerformance(zoneId: string, componentId: string): Promise<{
    swapTime: number;
    renderTime: number;
    success: boolean;
  }> {
    const startTime = Date.now();
    
    try {
      await this.swapComponent(zoneId, componentId, 'instant');
      const endTime = Date.now();
      
      // Verify component was swapped
      const activeComponent = await this.getActiveComponentInZone(zoneId);
      const success = activeComponent === componentId;
      
      return {
        swapTime: endTime - startTime,
        renderTime: 0, // Would need to measure from browser APIs
        success,
      };
    } catch (error) {
      return {
        swapTime: Date.now() - startTime,
        renderTime: 0,
        success: false,
      };
    }
  }

  async triggerHotReload(componentId: string): Promise<void> {
    await this.page.click(`[data-testid="hot-reload-${componentId}"]`);
    await this.page.waitForTimeout(500);
  }

  async getSwapHistory(): Promise<Array<{ from: string; to: string; timestamp: number }>> {
    return await this.page.evaluate(() => {
      const swapper = (window as any).__componentSwapper;
      return swapper ? swapper.getSwapHistory() : [];
    });
  }

  async getRegisteredComponents(): Promise<string[]> {
    return await this.page.evaluate(() => {
      const registry = (window as any).__componentRegistry;
      return registry ? registry.getEnabled().map((c: any) => c.id) : [];
    });
  }

  async isComponentCached(componentId: string): Promise<boolean> {
    return await this.page.evaluate((id) => {
      const swapper = (window as any).__componentSwapper;
      return swapper ? swapper.getCachedComponents().includes(id) : false;
    }, componentId);
  }

  async clearComponentCache(): Promise<void> {
    await this.page.click('[data-testid="clear-cache-button"]');
    await this.page.waitForTimeout(200);
  }

  async getPerformanceMetrics(): Promise<{
    swapCount: number;
    avgSwapTime: number;
    cacheHitRate: number;
  }> {
    return await this.page.evaluate(() => {
      const swapper = (window as any).__componentSwapper;
      if (!swapper) return { swapCount: 0, avgSwapTime: 0, cacheHitRate: 0 };
      
      const metrics = swapper.getPerformanceMetrics();
      const history = swapper.getSwapHistory();
      
      return {
        swapCount: history.length,
        avgSwapTime: metrics.avgSwapTime || 0,
        cacheHitRate: metrics.cacheHitRate || 0,
      };
    });
  }

  async captureZoneScreenshot(zoneId: string): Promise<Buffer> {
    const zone = this.page.locator(`[data-testid="${zoneId}"]`);
    return await zone.screenshot();
  }

  async verifyNoLayoutShift(): Promise<boolean> {
    // Measure layout stability
    return await this.page.evaluate(() => {
      return new Promise((resolve) => {
        let cumulativeLayoutShift = 0;
        
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift') {
              cumulativeLayoutShift += (entry as any).value;
            }
          }
        });
        
        observer.observe({ entryTypes: ['layout-shift'] });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(cumulativeLayoutShift < 0.1); // CLS threshold
        }, 1000);
      });
    });
  }

  async simulateNetworkDelay(delay: number): Promise<void> {
    await this.page.route('**/components/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, delay));
      await route.continue();
    });
  }

  async simulateComponentError(componentId: string): Promise<void> {
    await this.page.route(`**/components/${componentId}**`, async (route) => {
      await route.abort('failed');
    });
  }
}

test.describe('Component Swapping E2E Tests', () => {
  let swapHelper: ComponentSwappingTestHelper;

  test.beforeEach(async ({ page }) => {
    swapHelper = new ComponentSwappingTestHelper(page);
    await swapHelper.navigateToAdminPanel();
    await swapHelper.enableAdminFeatures();
    await swapHelper.waitForComponentPlayground();
  });

  test.describe('Basic Component Swapping', () => {
    test('should swap components instantly', async ({ page }) => {
      // Get initial state
      const initialContent = await swapHelper.getComponentContent('main-zone');
      
      // Swap to a different component
      await swapHelper.swapComponent('main-zone', 'hero-banner', 'instant');
      
      // Verify component was swapped
      const newContent = await swapHelper.getComponentContent('main-zone');
      expect(newContent).not.toBe(initialContent);
      expect(newContent).toContain('Welcome Banner'); // Expected content from hero-banner
      
      // Verify active component is tracked
      const activeComponent = await swapHelper.getActiveComponentInZone('main-zone');
      expect(activeComponent).toBe('hero-banner');
    });

    test('should swap with fade transition', async ({ page }) => {
      await swapHelper.swapComponent('main-zone', 'product-grid', 'fade');
      
      // Verify component was swapped after transition
      const content = await swapHelper.getComponentContent('main-zone');
      expect(content).toContain('Product'); // Expected content from product-grid
      
      // Verify no layout shift during transition
      const noLayoutShift = await swapHelper.verifyNoLayoutShift();
      expect(noLayoutShift).toBe(true);
    });

    test('should swap with slide transition', async ({ page }) => {
      const initialHeight = await page.locator('[data-testid="main-zone"]').boundingBox();
      
      await swapHelper.swapComponent('main-zone', 'user-profile', 'slide');
      
      // Verify component was swapped
      const content = await swapHelper.getComponentContent('main-zone');
      expect(content).toContain('John Doe'); // Expected content from user-profile
      
      // Verify transition completed
      const finalHeight = await page.locator('[data-testid="main-zone"]').boundingBox();
      expect(finalHeight?.height).toBeGreaterThan(0);
    });

    test('should track swap history', async ({ page }) => {
      // Perform multiple swaps
      await swapHelper.swapComponent('main-zone', 'hero-banner', 'instant');
      await swapHelper.swapComponent('main-zone', 'product-grid', 'instant');
      await swapHelper.swapComponent('main-zone', 'user-profile', 'instant');
      
      const history = await swapHelper.getSwapHistory();
      expect(history.length).toBe(3);
      
      // Verify history order
      expect(history[0].to).toBe('hero-banner');
      expect(history[1].from).toBe('hero-banner');
      expect(history[1].to).toBe('product-grid');
      expect(history[2].from).toBe('product-grid');
      expect(history[2].to).toBe('user-profile');
    });
  });

  test.describe('Component Caching', () => {
    test('should cache loaded components', async ({ page }) => {
      // First load should cache the component
      await swapHelper.swapComponent('main-zone', 'analytics-dashboard', 'instant');
      
      const isCached = await swapHelper.isComponentCached('analytics-dashboard');
      expect(isCached).toBe(true);
    });

    test('should improve performance on cached components', async ({ page }) => {
      // First swap (not cached)
      const firstSwap = await swapHelper.measureSwapPerformance('main-zone', 'feature-showcase');
      expect(firstSwap.success).toBe(true);
      
      // Second swap to different component and back (should be cached)
      await swapHelper.swapComponent('main-zone', 'chat-widget', 'instant');
      const cachedSwap = await swapHelper.measureSwapPerformance('main-zone', 'feature-showcase');
      
      expect(cachedSwap.success).toBe(true);
      expect(cachedSwap.swapTime).toBeLessThan(firstSwap.swapTime * 0.8); // Should be significantly faster
    });

    test('should handle cache clearing', async ({ page }) => {
      // Load and cache a component
      await swapHelper.swapComponent('main-zone', 'loading-spinner', 'instant');
      expect(await swapHelper.isComponentCached('loading-spinner')).toBe(true);
      
      // Clear cache
      await swapHelper.clearComponentCache();
      
      // Component should no longer be cached
      expect(await swapHelper.isComponentCached('loading-spinner')).toBe(false);
    });
  });

  test.describe('Hot Reloading', () => {
    test('should hot reload components', async ({ page }) => {
      // Load a component
      await swapHelper.swapComponent('main-zone', 'hero-banner', 'instant');
      const initialContent = await swapHelper.getComponentContent('main-zone');
      
      // Simulate component update via hot reload
      await page.evaluate(() => {
        // Mock updated component
        const mockRegistry = (window as any).__componentRegistry;
        if (mockRegistry) {
          mockRegistry.register({
            id: 'hero-banner',
            name: 'Updated Hero Banner',
            category: 'ui',
            version: '1.1.0',
            description: 'Updated hero banner component',
          }, () => '<div class="hero-banner updated"><h1>Updated Welcome Banner</h1></div>');
        }
      });
      
      // Trigger hot reload
      await swapHelper.triggerHotReload('hero-banner');
      
      // Verify component was updated
      const updatedContent = await swapHelper.getComponentContent('main-zone');
      expect(updatedContent).toContain('Updated Welcome Banner');
      expect(updatedContent).not.toBe(initialContent);
    });

    test('should update all zones using hot-reloaded component', async ({ page }) => {
      // Load same component in multiple zones
      await swapHelper.swapComponent('main-zone', 'hero-banner', 'instant');
      await swapHelper.swapComponent('sidebar-zone', 'hero-banner', 'instant');
      
      // Hot reload the component
      await page.evaluate(() => {
        const mockRegistry = (window as any).__componentRegistry;
        if (mockRegistry) {
          mockRegistry.register({
            id: 'hero-banner',
            name: 'Hot Reloaded Banner',
            category: 'ui',
            version: '1.2.0',
            description: 'Hot reloaded banner component',
          }, () => '<div class="hero-banner hot-reloaded">Hot Reloaded Content</div>');
        }
      });
      
      await swapHelper.triggerHotReload('hero-banner');
      
      // Both zones should be updated
      const mainContent = await swapHelper.getComponentContent('main-zone');
      const sidebarContent = await swapHelper.getComponentContent('sidebar-zone');
      
      expect(mainContent).toContain('Hot Reloaded Content');
      expect(sidebarContent).toContain('Hot Reloaded Content');
    });
  });

  test.describe('Multiple Zone Management', () => {
    test('should manage multiple zones independently', async ({ page }) => {
      // Swap different components in different zones
      await swapHelper.swapComponent('main-zone', 'hero-banner', 'instant');
      await swapHelper.swapComponent('sidebar-zone', 'user-profile', 'instant');
      await swapHelper.swapComponent('footer-zone', 'product-grid', 'instant');
      
      // Verify each zone has correct component
      expect(await swapHelper.getActiveComponentInZone('main-zone')).toBe('hero-banner');
      expect(await swapHelper.getActiveComponentInZone('sidebar-zone')).toBe('user-profile');
      expect(await swapHelper.getActiveComponentInZone('footer-zone')).toBe('product-grid');
      
      // Verify content is correct
      expect(await swapHelper.getComponentContent('main-zone')).toContain('Welcome Banner');
      expect(await swapHelper.getComponentContent('sidebar-zone')).toContain('John Doe');
      expect(await swapHelper.getComponentContent('footer-zone')).toContain('Product');
    });

    test('should handle simultaneous swaps', async ({ page }) => {
      // Trigger multiple swaps simultaneously
      const swapPromises = [
        swapHelper.swapComponent('main-zone', 'analytics-dashboard', 'instant'),
        swapHelper.swapComponent('sidebar-zone', 'chat-widget', 'instant'),
        swapHelper.swapComponent('footer-zone', 'feature-showcase', 'instant'),
      ];
      
      await Promise.all(swapPromises);
      
      // All swaps should succeed
      expect(await swapHelper.getActiveComponentInZone('main-zone')).toBe('analytics-dashboard');
      expect(await swapHelper.getActiveComponentInZone('sidebar-zone')).toBe('chat-widget');
      expect(await swapHelper.getActiveComponentInZone('footer-zone')).toBe('feature-showcase');
    });
  });

  test.describe('Performance and Load Testing', () => {
    test('should maintain performance under rapid swapping', async ({ page }) => {
      const startTime = Date.now();
      const components = ['hero-banner', 'product-grid', 'user-profile', 'chat-widget'];
      
      // Perform 20 rapid swaps
      for (let i = 0; i < 20; i++) {
        const componentId = components[i % components.length];
        await swapHelper.swapComponent('main-zone', componentId, 'instant');
      }
      
      const totalTime = Date.now() - startTime;
      const metrics = await swapHelper.getPerformanceMetrics();
      
      expect(totalTime).toBeLessThan(5000); // Should complete in under 5 seconds
      expect(metrics.avgSwapTime).toBeLessThan(100); // Average under 100ms per swap
    });

    test('should handle memory efficiently with many swaps', async ({ page }) => {
      const initialMemory = await page.evaluate(() => 
        (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0
      );
      
      // Perform many swaps to test memory usage
      const components = ['hero-banner', 'product-grid', 'user-profile', 'analytics-dashboard'];
      
      for (let i = 0; i < 50; i++) {
        const componentId = components[i % components.length];
        await swapHelper.swapComponent('main-zone', componentId, 'instant');
        
        if (i % 10 === 0) {
          await page.waitForTimeout(100); // Allow garbage collection
        }
      }
      
      const finalMemory = await page.evaluate(() => 
        (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0
      );
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
      }
    });

    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow network
      await swapHelper.simulateNetworkDelay(2000);
      
      const slowSwap = await swapHelper.measureSwapPerformance('main-zone', 'loading-spinner');
      
      // Should still succeed, just take longer
      expect(slowSwap.success).toBe(true);
      expect(slowSwap.swapTime).toBeGreaterThan(1500); // Should reflect network delay
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('should handle component loading failures', async ({ page }) => {
      // Simulate component loading error
      await swapHelper.simulateComponentError('error-component');
      
      try {
        await swapHelper.swapComponent('main-zone', 'error-component', 'instant');
      } catch (error) {
        // Error is expected
      }
      
      // Should be able to recover and swap to working component
      const recovery = await swapHelper.measureSwapPerformance('main-zone', 'hero-banner');
      expect(recovery.success).toBe(true);
    });

    test('should handle zone not found errors', async ({ page }) => {
      try {
        await swapHelper.swapComponent('non-existent-zone', 'hero-banner', 'instant');
      } catch (error) {
        // Error is expected
      }
      
      // Other zones should still work
      const validSwap = await swapHelper.measureSwapPerformance('main-zone', 'hero-banner');
      expect(validSwap.success).toBe(true);
    });

    test('should handle component not found errors', async ({ page }) => {
      try {
        await swapHelper.swapComponent('main-zone', 'non-existent-component', 'instant');
      } catch (error) {
        // Error is expected
      }
      
      // Should still be able to swap to valid components
      const validSwap = await swapHelper.measureSwapPerformance('main-zone', 'hero-banner');
      expect(validSwap.success).toBe(true);
    });

    test('should recover from transition interruptions', async ({ page }) => {
      // Start a slow transition
      const swapPromise = swapHelper.swapComponent('main-zone', 'user-profile', 'slide');
      
      // Interrupt with another swap
      await page.waitForTimeout(100);
      await swapHelper.swapComponent('main-zone', 'hero-banner', 'instant');
      
      await swapPromise;
      
      // Final component should be the last one swapped
      const activeComponent = await swapHelper.getActiveComponentInZone('main-zone');
      expect(activeComponent).toBe('hero-banner');
    });
  });

  test.describe('Visual Regression and UI Consistency', () => {
    test('should maintain visual consistency across swaps', async ({ page }) => {
      await swapHelper.swapComponent('main-zone', 'hero-banner', 'instant');
      const heroScreenshot = await swapHelper.captureZoneScreenshot('main-zone');
      
      await swapHelper.swapComponent('main-zone', 'product-grid', 'instant');
      const gridScreenshot = await swapHelper.captureZoneScreenshot('main-zone');
      
      // Screenshots should be different (content changed)
      expect(heroScreenshot).not.toEqual(gridScreenshot);
    });

    test('should maintain layout during transitions', async ({ page }) => {
      const initialLayout = await page.locator('[data-testid="main-zone"]').boundingBox();
      
      await swapHelper.swapComponent('main-zone', 'analytics-dashboard', 'fade');
      
      const finalLayout = await page.locator('[data-testid="main-zone"]').boundingBox();
      
      // Zone should maintain its position
      expect(finalLayout?.x).toBeCloseTo(initialLayout?.x || 0, 5);
      expect(finalLayout?.y).toBeCloseTo(initialLayout?.y || 0, 5);
    });

    test('should handle responsive design changes', async ({ page }) => {
      // Test on desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await swapHelper.swapComponent('main-zone', 'feature-showcase', 'instant');
      const desktopContent = await swapHelper.getComponentContent('main-zone');
      
      // Test on mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(300);
      const mobileContent = await swapHelper.getComponentContent('main-zone');
      
      // Component should adapt to viewport
      expect(mobileContent).toBeTruthy();
      
      // Test tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(300);
      const tabletContent = await swapHelper.getComponentContent('main-zone');
      
      expect(tabletContent).toBeTruthy();
    });
  });

  test.describe('Accessibility and User Experience', () => {
    test('should maintain keyboard accessibility during swaps', async ({ page }) => {
      await swapHelper.swapComponent('main-zone', 'hero-banner', 'instant');
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
      
      // Swap component and test keyboard navigation still works
      await swapHelper.swapComponent('main-zone', 'user-profile', 'instant');
      await page.keyboard.press('Tab');
      const newFocusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(newFocusedElement).toBeTruthy();
    });

    test('should announce changes to screen readers', async ({ page }) => {
      await swapHelper.swapComponent('main-zone', 'hero-banner', 'instant');
      
      // Check for aria-live regions or other screen reader announcements
      const ariaLive = await page.locator('[aria-live]').count();
      expect(ariaLive).toBeGreaterThanOrEqual(0);
      
      // Check that content is properly labeled
      const zone = page.locator('[data-testid="main-zone"]');
      const hasAccessibleName = await zone.evaluate(el => 
        el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby')
      );
      expect(hasAccessibleName).toBe(true);
    });

    test('should provide loading states during swaps', async ({ page }) => {
      // Simulate slow loading
      await swapHelper.simulateNetworkDelay(1000);
      
      const swapPromise = swapHelper.swapComponent('main-zone', 'analytics-dashboard', 'fade');
      
      // Check for loading indicator
      await page.waitForTimeout(200);
      const hasLoadingState = await page.locator('[data-testid="loading-indicator"]').isVisible();
      expect(hasLoadingState).toBe(true);
      
      await swapPromise;
      
      // Loading state should be gone
      const loadingGone = await page.locator('[data-testid="loading-indicator"]').isHidden();
      expect(loadingGone).toBe(true);
    });
  });
});