import { ComponentConfig } from '../components/types';
import { componentRegistry } from '../components/registry';

export interface RenderContext {
  isServer: boolean;
  userAgent?: string;
  theme?: string;
  featureFlags?: Record<string, boolean>;
  viewport?: {
    width: number;
    height: number;
    isMobile: boolean;
  };
}

export interface ComponentRenderResult {
  success: boolean;
  html?: string;
  css?: string;
  js?: string;
  dependencies?: string[];
  error?: string;
  metadata?: Record<string, any>;
}

class ServerComponentRenderer {
  private cache = new Map<string, ComponentRenderResult>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async renderComponent(
    componentId: string,
    props: Record<string, any> = {},
    context: RenderContext
  ): Promise<ComponentRenderResult> {
    const cacheKey = this.getCacheKey(componentId, props, context);
    
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cacheKey)) {
      return cached;
    }

    try {
      const config = componentRegistry.getConfig(componentId);
      if (!config) {
        throw new Error(`Component "${componentId}" not found`);
      }

      if (config.isEnabled === false) {
        throw new Error(`Component "${componentId}" is disabled`);
      }

      if (config.featureFlag && !context.featureFlags?.[config.featureFlag]) {
        throw new Error(`Component "${componentId}" requires feature flag "${config.featureFlag}"`);
      }

      const component = await componentRegistry.getComponent(componentId);
      if (!component) {
        throw new Error(`Failed to load component "${componentId}"`);
      }

      const result = await this.performRender(component, config, props, context);
      this.cache.set(cacheKey, result);
      
      setTimeout(() => {
        this.cache.delete(cacheKey);
      }, this.cacheTimeout);

      return result;
    } catch (error) {
      const errorResult: ComponentRenderResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      
      return errorResult;
    }
  }

  async renderZone(
    components: Array<{ id: string; props?: Record<string, any> }>,
    context: RenderContext
  ): Promise<ComponentRenderResult[]> {
    const results = await Promise.all(
      components.map(({ id, props = {} }) => 
        this.renderComponent(id, props, context)
      )
    );

    return results;
  }

  private async performRender(
    Component: React.ComponentType<any>,
    config: ComponentConfig,
    props: Record<string, any>,
    context: RenderContext
  ): Promise<ComponentRenderResult> {
    // Server-side rendering would go here
    // For now, return metadata about the component
    
    const mergedProps = {
      ...config.props,
      ...props,
    };

    const dependencies = [
      ...(config.dependencies || []),
      ...this.extractPropDependencies(mergedProps),
    ];

    return {
      success: true,
      html: `<!-- Server-rendered ${config.name} -->`,
      css: this.generateCSS(config, context),
      dependencies,
      metadata: {
        componentId: config.id,
        version: config.version,
        category: config.category,
        renderTime: Date.now(),
        context: {
          isServer: context.isServer,
          isMobile: context.viewport?.isMobile || false,
        },
      },
    };
  }

  private generateCSS(config: ComponentConfig, context: RenderContext): string {
    const baseCSS = `
      .component-${config.id} {
        position: relative;
      }
    `;

    if (context.viewport?.isMobile) {
      return baseCSS + `
        .component-${config.id} {
          font-size: 0.9em;
        }
      `;
    }

    return baseCSS;
  }

  private extractPropDependencies(props: Record<string, any>): string[] {
    const dependencies: string[] = [];
    
    Object.values(props).forEach(value => {
      if (typeof value === 'string' && value.startsWith('component:')) {
        dependencies.push(value.replace('component:', ''));
      }
    });

    return dependencies;
  }

  private getCacheKey(
    componentId: string,
    props: Record<string, any>,
    context: RenderContext
  ): string {
    const key = JSON.stringify({
      componentId,
      props,
      context: {
        isServer: context.isServer,
        theme: context.theme,
        isMobile: context.viewport?.isMobile,
      },
    });
    
    return Buffer.from(key).toString('base64');
  }

  private isCacheValid(cacheKey: string): boolean {
    return this.cache.has(cacheKey);
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const serverRenderer = new ServerComponentRenderer();