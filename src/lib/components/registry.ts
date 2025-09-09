import { ComponentType, lazy } from 'react';
import { ComponentConfig, ComponentRegistryItem, ComponentCategory } from './types';

class ComponentRegistry {
  private components = new Map<string, ComponentRegistryItem>();
  private categories = new Map<ComponentCategory, string[]>();
  private loadingComponents = new Set<string>();

  register(config: ComponentConfig, component: ComponentType<any>) {
    const item: ComponentRegistryItem = {
      config,
      component,
    };

    this.components.set(config.id, item);
    this.addToCategory(config.category, config.id);
  }

  registerLazy(config: ComponentConfig, loader: () => Promise<ComponentType<any>>) {
    const item: ComponentRegistryItem = {
      config,
      component: lazy(loader),
      loader,
    };

    this.components.set(config.id, item);
    this.addToCategory(config.category, config.id);
  }

  async getComponent(id: string): Promise<ComponentType<any> | null> {
    const item = this.components.get(id);
    if (!item) return null;

    if (item.loader && !this.loadingComponents.has(id)) {
      this.loadingComponents.add(id);
      try {
        const component = await item.loader();
        item.component = component;
        delete item.loader; // Remove loader to prevent duplicate loading
        this.loadingComponents.delete(id);
      } catch (error) {
        this.loadingComponents.delete(id);
        throw error;
      }
    }

    return item.component;
  }

  getConfig(id: string): ComponentConfig | null {
    const item = this.components.get(id);
    return item ? item.config : null;
  }

  getByCategory(category: ComponentCategory): ComponentConfig[] {
    const ids = this.categories.get(category) || [];
    return ids
      .map(id => this.getConfig(id))
      .filter(Boolean) as ComponentConfig[];
  }

  getAll(): ComponentConfig[] {
    return Array.from(this.components.values()).map(item => item.config);
  }

  getEnabled(): ComponentConfig[] {
    return this.getAll().filter(config => config.isEnabled !== false);
  }

  isLoading(id: string): boolean {
    return this.loadingComponents.has(id);
  }

  exists(id: string): boolean {
    return this.components.has(id);
  }

  update(id: string, updates: Partial<ComponentConfig>) {
    const item = this.components.get(id);
    if (item) {
      item.config = { ...item.config, ...updates };
    }
  }

  remove(id: string) {
    const item = this.components.get(id);
    if (item) {
      this.components.delete(id);
      this.removeFromCategory(item.config.category, id);
    }
  }

  private addToCategory(category: ComponentCategory, id: string) {
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    const categoryItems = this.categories.get(category)!;
    if (!categoryItems.includes(id)) {
      categoryItems.push(id);
    }
  }

  private removeFromCategory(category: ComponentCategory, id: string) {
    const categoryItems = this.categories.get(category);
    if (categoryItems) {
      const index = categoryItems.indexOf(id);
      if (index > -1) {
        categoryItems.splice(index, 1);
      }
    }
  }
}

export const componentRegistry = new ComponentRegistry();