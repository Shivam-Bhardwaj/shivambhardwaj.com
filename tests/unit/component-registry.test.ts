import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentType } from 'react';
import { componentRegistry } from '../../src/lib/components/registry';
import { ComponentConfig } from '../../src/lib/components/types';

// Mock React lazy for testing
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    lazy: vi.fn((loader: () => Promise<ComponentType<any>>) => {
      return loader;
    }),
  };
});

describe('ComponentRegistry', () => {
  // Test component mock
  const MockComponent: ComponentType<any> = () => null;
  
  const mockConfig: ComponentConfig = {
    id: 'test-component',
    name: 'Test Component',
    category: 'ui',
    version: '1.0.0',
    description: 'A test component',
    isEnabled: true,
    tags: ['test'],
  };

  beforeEach(() => {
    // Clear registry before each test
    const registry = componentRegistry as any;
    registry.components.clear();
    registry.categories.clear();
    registry.loadingComponents.clear();
  });

  describe('Component Registration', () => {
    it('should register a component successfully', () => {
      componentRegistry.register(mockConfig, MockComponent);
      
      expect(componentRegistry.exists('test-component')).toBe(true);
      expect(componentRegistry.getConfig('test-component')).toEqual(mockConfig);
    });

    it('should register a lazy component successfully', () => {
      const mockLoader = vi.fn().mockResolvedValue(MockComponent);
      
      componentRegistry.registerLazy(mockConfig, mockLoader);
      
      expect(componentRegistry.exists('test-component')).toBe(true);
      expect(componentRegistry.getConfig('test-component')).toEqual(mockConfig);
    });

    it('should add component to correct category', () => {
      componentRegistry.register(mockConfig, MockComponent);
      
      const uiComponents = componentRegistry.getByCategory('ui');
      expect(uiComponents).toHaveLength(1);
      expect(uiComponents[0].id).toBe('test-component');
    });

    it('should not duplicate component IDs in categories', () => {
      componentRegistry.register(mockConfig, MockComponent);
      componentRegistry.register(mockConfig, MockComponent); // Register again
      
      const uiComponents = componentRegistry.getByCategory('ui');
      expect(uiComponents).toHaveLength(1);
    });
  });

  describe('Component Retrieval', () => {
    beforeEach(() => {
      componentRegistry.register(mockConfig, MockComponent);
    });

    it('should retrieve component by ID', async () => {
      const component = await componentRegistry.getComponent('test-component');
      expect(component).toBe(MockComponent);
    });

    it('should return null for non-existent component', async () => {
      const component = await componentRegistry.getComponent('non-existent');
      expect(component).toBeNull();
    });

    it('should retrieve component config by ID', () => {
      const config = componentRegistry.getConfig('test-component');
      expect(config).toEqual(mockConfig);
    });

    it('should return null for non-existent config', () => {
      const config = componentRegistry.getConfig('non-existent');
      expect(config).toBeNull();
    });
  });

  describe('Category Management', () => {
    it('should return components by category', () => {
      const uiConfig = { ...mockConfig, id: 'ui-component', category: 'ui' as const };
      const roboticsConfig = { ...mockConfig, id: 'robotics-component', category: 'robotics' as const };
      
      componentRegistry.register(uiConfig, MockComponent);
      componentRegistry.register(roboticsConfig, MockComponent);
      
      const uiComponents = componentRegistry.getByCategory('ui');
      const roboticsComponents = componentRegistry.getByCategory('robotics');
      
      expect(uiComponents).toHaveLength(1);
      expect(roboticsComponents).toHaveLength(1);
      expect(uiComponents[0].id).toBe('ui-component');
      expect(roboticsComponents[0].id).toBe('robotics-component');
    });

    it('should return empty array for empty category', () => {
      const components = componentRegistry.getByCategory('admin');
      expect(components).toEqual([]);
    });
  });

  describe('Component States', () => {
    it('should track loading state for lazy components', async () => {
      const mockLoader = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(MockComponent), 100))
      );
      
      componentRegistry.registerLazy(mockConfig, mockLoader);
      
      expect(componentRegistry.isLoading('test-component')).toBe(false);
      
      const componentPromise = componentRegistry.getComponent('test-component');
      expect(componentRegistry.isLoading('test-component')).toBe(true);
      
      await componentPromise;
      expect(componentRegistry.isLoading('test-component')).toBe(false);
    });

    it('should handle loader errors gracefully', async () => {
      const mockError = new Error('Component loading failed');
      const mockLoader = vi.fn().mockRejectedValue(mockError);
      
      componentRegistry.registerLazy(mockConfig, mockLoader);
      
      await expect(componentRegistry.getComponent('test-component')).rejects.toThrow(mockError);
      expect(componentRegistry.isLoading('test-component')).toBe(false);
    });
  });

  describe('Component Filtering', () => {
    beforeEach(() => {
      const enabledConfig = { ...mockConfig, id: 'enabled-component', isEnabled: true };
      const disabledConfig = { ...mockConfig, id: 'disabled-component', isEnabled: false };
      const undefinedConfig = { ...mockConfig, id: 'undefined-component' };
      
      componentRegistry.register(enabledConfig, MockComponent);
      componentRegistry.register(disabledConfig, MockComponent);
      componentRegistry.register(undefinedConfig, MockComponent);
    });

    it('should return all components', () => {
      const allComponents = componentRegistry.getAll();
      expect(allComponents).toHaveLength(3);
    });

    it('should return only enabled components', () => {
      const enabledComponents = componentRegistry.getEnabled();
      expect(enabledComponents).toHaveLength(2); // enabled and undefined (default enabled)
      
      const ids = enabledComponents.map(c => c.id);
      expect(ids).toContain('enabled-component');
      expect(ids).toContain('undefined-component');
      expect(ids).not.toContain('disabled-component');
    });
  });

  describe('Component Updates', () => {
    beforeEach(() => {
      componentRegistry.register(mockConfig, MockComponent);
    });

    it('should update component config', () => {
      componentRegistry.update('test-component', { 
        name: 'Updated Test Component',
        isEnabled: false 
      });
      
      const updatedConfig = componentRegistry.getConfig('test-component');
      expect(updatedConfig?.name).toBe('Updated Test Component');
      expect(updatedConfig?.isEnabled).toBe(false);
      expect(updatedConfig?.id).toBe('test-component'); // Original properties preserved
    });

    it('should handle updates for non-existent components', () => {
      expect(() => {
        componentRegistry.update('non-existent', { name: 'Updated' });
      }).not.toThrow();
      
      expect(componentRegistry.getConfig('non-existent')).toBeNull();
    });
  });

  describe('Component Removal', () => {
    beforeEach(() => {
      componentRegistry.register(mockConfig, MockComponent);
    });

    it('should remove component successfully', () => {
      expect(componentRegistry.exists('test-component')).toBe(true);
      
      componentRegistry.remove('test-component');
      
      expect(componentRegistry.exists('test-component')).toBe(false);
      expect(componentRegistry.getConfig('test-component')).toBeNull();
    });

    it('should remove component from category', () => {
      componentRegistry.remove('test-component');
      
      const uiComponents = componentRegistry.getByCategory('ui');
      expect(uiComponents).toHaveLength(0);
    });

    it('should handle removal of non-existent components', () => {
      expect(() => {
        componentRegistry.remove('non-existent');
      }).not.toThrow();
    });
  });

  describe('Performance and Memory Management', () => {
    it('should not load component multiple times simultaneously', async () => {
      const mockLoader = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(MockComponent), 50))
      );
      
      componentRegistry.registerLazy(mockConfig, mockLoader);
      
      // Start multiple loads simultaneously
      const promises = [
        componentRegistry.getComponent('test-component'),
        componentRegistry.getComponent('test-component'),
        componentRegistry.getComponent('test-component'),
      ];
      
      await Promise.all(promises);
      
      // Loader should only be called once
      expect(mockLoader).toHaveBeenCalledTimes(1);
    });

    it('should cache loaded components', async () => {
      const mockLoader = vi.fn().mockResolvedValue(MockComponent);
      
      componentRegistry.registerLazy(mockConfig, mockLoader);
      
      // Load component twice
      await componentRegistry.getComponent('test-component');
      await componentRegistry.getComponent('test-component');
      
      // Loader should only be called once, second call uses cache
      expect(mockLoader).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle components with special characters in IDs', () => {
      const specialConfig = { 
        ...mockConfig, 
        id: 'test-component_123!@#' 
      };
      
      componentRegistry.register(specialConfig, MockComponent);
      
      expect(componentRegistry.exists('test-component_123!@#')).toBe(true);
      expect(componentRegistry.getConfig('test-component_123!@#')).toEqual(specialConfig);
    });

    it('should handle empty component props', () => {
      const configWithEmptyProps = { 
        ...mockConfig, 
        props: {} 
      };
      
      componentRegistry.register(configWithEmptyProps, MockComponent);
      
      const retrievedConfig = componentRegistry.getConfig('test-component');
      expect(retrievedConfig?.props).toEqual({});
    });

    it('should handle components without optional fields', () => {
      const minimalConfig: ComponentConfig = {
        id: 'minimal-component',
        name: 'Minimal Component',
        category: 'ui',
        version: '1.0.0',
        description: 'Minimal test component',
      };
      
      componentRegistry.register(minimalConfig, MockComponent);
      
      const retrievedConfig = componentRegistry.getConfig('minimal-component');
      expect(retrievedConfig).toEqual(minimalConfig);
    });
  });
});