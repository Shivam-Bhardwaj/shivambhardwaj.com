# Component Registry System

## Overview

The Component Registry System provides centralized management, dynamic loading, and hot swapping capabilities for all UI and 3D components in the Antimony Labs portfolio. This system ensures type safety, performance optimization, and development-time flexibility.

## Core Concepts

### Registry Architecture

The component registry operates as a singleton service that manages:
- **Component Metadata**: Type definitions, props, and dependencies
- **Loading Strategies**: Lazy loading, preloading, and hot swapping
- **Validation Layer**: Runtime type checking and error boundaries
- **Performance Monitoring**: Component render metrics and optimization

### Component Categories

#### UI Components
- **Navigation**: Headers, footers, menus, breadcrumbs
- **Layout**: Grids, containers, sidebars, responsive wrappers
- **Interactive**: Buttons, forms, modals, tooltips
- **Data Display**: Charts, tables, cards, timelines
- **Feedback**: Loading states, error messages, notifications

#### 3D Components
- **Robots**: Articulated models with physics properties
- **Environment**: Scenes, lighting, backgrounds, effects
- **Interactions**: Controllers, collision handlers, gesture recognition
- **UI Overlays**: 3D text, HUD elements, spatial interfaces

#### Specialized Components
- **GitHub Integration**: Contribution graphs, repository displays
- **Infrastructure**: Monitoring dashboards, metrics visualization
- **Blog**: Markdown renderers, syntax highlighting, social sharing
- **Theme System**: Color pickers, preset selectors, mode toggles

## Implementation Details

### Registry Structure

```typescript
interface ComponentRegistry {
  // Component registration and retrieval
  register<T>(name: string, component: ComponentDefinition<T>): void;
  get<T>(name: string): ComponentDefinition<T> | null;
  has(name: string): boolean;
  
  // Dynamic loading
  load<T>(name: string): Promise<ComponentDefinition<T>>;
  preload(names: string[]): Promise<void>;
  
  // Hot swapping (development)
  swap<T>(name: string, newComponent: ComponentDefinition<T>): void;
  
  // Performance monitoring
  getMetrics(name: string): ComponentMetrics;
  getGlobalMetrics(): GlobalMetrics;
}

interface ComponentDefinition<T> {
  component: React.ComponentType<T>;
  props: PropTypeDefinition<T>;
  dependencies: string[];
  loading: LoadingStrategy;
  metadata: ComponentMetadata;
}

interface ComponentMetadata {
  name: string;
  category: ComponentCategory;
  description: string;
  version: string;
  author: string;
  tags: string[];
  performance: PerformanceHints;
}
```

### Registration Process

#### Static Registration
Components are registered at application startup through module imports:

```typescript
// src/lib/registry/component-registry.ts
import { registry } from './registry-core';
import { NavigationComponent } from '@/components/Navigation';
import { GitHubGraph } from '@/components/GitHubContributionGraph';
import { RobotModel } from '@/components/3d/RobotModel';

// UI Component Registration
registry.register('navigation', {
  component: NavigationComponent,
  props: NavigationPropsSchema,
  dependencies: ['theme', 'router'],
  loading: 'immediate',
  metadata: {
    name: 'Navigation',
    category: 'ui',
    description: 'Primary site navigation with theme toggle',
    version: '2.1.0',
    author: 'antimony-labs',
    tags: ['navigation', 'responsive', 'accessibility'],
    performance: { renderCost: 'low', memoryUsage: 'minimal' }
  }
});

// 3D Component Registration
registry.register('robot-arm', {
  component: RobotModel,
  props: RobotModelPropsSchema,
  dependencies: ['three-fiber', 'physics-engine'],
  loading: 'lazy',
  metadata: {
    name: 'Robot Arm Model',
    category: '3d',
    description: 'Interactive 6-DOF robotic arm with physics',
    version: '1.5.2',
    author: 'antimony-labs',
    tags: ['robotics', 'interactive', 'physics'],
    performance: { renderCost: 'high', memoryUsage: 'moderate' }
  }
});
```

#### Dynamic Registration
Components can be registered at runtime for plugin-like functionality:

```typescript
// Dynamic component loading
const loadCustomComponent = async (componentConfig: ComponentConfig) => {
  const module = await import(componentConfig.modulePath);
  const component = module[componentConfig.exportName];
  
  registry.register(componentConfig.name, {
    component,
    props: componentConfig.propSchema,
    dependencies: componentConfig.dependencies,
    loading: 'on-demand',
    metadata: componentConfig.metadata
  });
};
```

### Loading Strategies

#### Immediate Loading
Components loaded at application startup:
- Critical UI components (Navigation, Footer)
- Core layout components
- Error boundaries and loading states

#### Lazy Loading
Components loaded when first requested:
- Page-specific components
- Heavy 3D models
- Admin-only features

#### Preloading
Components loaded during idle time:
- Anticipated user interactions
- Next likely page components
- Background 3D assets

#### On-Demand Loading
Components loaded based on runtime conditions:
- Feature flag enabled components
- A/B test variants
- Progressive enhancement features

### Type Safety Implementation

#### Runtime Validation
```typescript
import { z } from 'zod';

const NavigationPropsSchema = z.object({
  currentPath: z.string(),
  theme: z.enum(['light', 'dark', 'system']),
  showSearch: z.boolean().optional(),
  onThemeChange: z.function().args(z.string()).returns(z.void())
});

type NavigationProps = z.infer<typeof NavigationPropsSchema>;

const validateProps = <T>(schema: z.ZodSchema<T>, props: unknown): T => {
  const result = schema.safeParse(props);
  if (!result.success) {
    throw new ComponentValidationError(result.error.issues);
  }
  return result.data;
};
```

#### Component Wrapper
```typescript
const createRegisteredComponent = <T>(name: string) => {
  return React.forwardRef<HTMLElement, T>((props, ref) => {
    const definition = registry.get<T>(name);
    
    if (!definition) {
      return <ComponentNotFound name={name} />;
    }
    
    // Validate props at runtime in development
    if (process.env.NODE_ENV === 'development') {
      validateProps(definition.props, props);
    }
    
    const Component = definition.component;
    
    return (
      <ComponentErrorBoundary name={name}>
        <PerformanceMonitor componentName={name}>
          <Component ref={ref} {...props} />
        </PerformanceMonitor>
      </ComponentErrorBoundary>
    );
  });
};
```

### Hot Swapping (Development)

#### Component Replacement
```typescript
// Development-only hot swapping
if (process.env.NODE_ENV === 'development') {
  const swapComponent = (name: string, newComponent: React.ComponentType) => {
    const existing = registry.get(name);
    if (existing) {
      registry.swap(name, {
        ...existing,
        component: newComponent,
        metadata: {
          ...existing.metadata,
          version: incrementVersion(existing.metadata.version),
          lastModified: new Date().toISOString()
        }
      });
      
      // Trigger re-render of all instances
      componentInstanceManager.refreshInstances(name);
    }
  };
  
  // Watch for file changes
  if (module.hot) {
    module.hot.accept('./components/**/*.tsx', () => {
      // Automatic component replacement on file change
    });
  }
}
```

### Performance Monitoring

#### Metrics Collection
```typescript
interface ComponentMetrics {
  renderCount: number;
  averageRenderTime: number;
  memoryUsage: number;
  errorCount: number;
  lastRender: Date;
  performanceScore: number;
}

class ComponentPerformanceMonitor {
  private metrics = new Map<string, ComponentMetrics>();
  
  recordRender(componentName: string, renderTime: number) {
    const existing = this.metrics.get(componentName) || {
      renderCount: 0,
      averageRenderTime: 0,
      memoryUsage: 0,
      errorCount: 0,
      lastRender: new Date(),
      performanceScore: 100
    };
    
    existing.renderCount++;
    existing.averageRenderTime = (
      (existing.averageRenderTime * (existing.renderCount - 1) + renderTime) 
      / existing.renderCount
    );
    existing.lastRender = new Date();
    
    this.metrics.set(componentName, existing);
    this.updatePerformanceScore(componentName);
  }
  
  private updatePerformanceScore(componentName: string) {
    const metrics = this.metrics.get(componentName);
    if (!metrics) return;
    
    // Calculate performance score based on render time and error rate
    const baseScore = 100;
    const renderTimePenalty = Math.min(metrics.averageRenderTime * 0.1, 50);
    const errorPenalty = (metrics.errorCount / metrics.renderCount) * 30;
    
    metrics.performanceScore = Math.max(0, baseScore - renderTimePenalty - errorPenalty);
  }
}
```

## Usage Patterns

### Basic Component Usage
```typescript
// Get component directly
const Navigation = registry.get('navigation');
if (Navigation) {
  return <Navigation.component currentPath="/projects" theme="dark" />;
}

// Use registry wrapper (recommended)
const NavigationComponent = createRegisteredComponent<NavigationProps>('navigation');
return <NavigationComponent currentPath="/projects" theme="dark" />;
```

### Conditional Component Loading
```typescript
const ConditionalFeature: React.FC<{ featureFlag: boolean }> = ({ featureFlag }) => {
  const [component, setComponent] = useState(null);
  
  useEffect(() => {
    if (featureFlag) {
      registry.load('advanced-feature').then(setComponent);
    }
  }, [featureFlag]);
  
  if (!featureFlag || !component) return null;
  
  const Component = component.component;
  return <Component {...props} />;
};
```

### 3D Component Integration
```typescript
const RoboticsShowcase: React.FC = () => {
  const { scene } = useThree();
  const robotModels = useMemo(() => [
    'robot-arm',
    'mobile-platform',
    'gripper-assembly'
  ], []);
  
  return (
    <group>
      {robotModels.map((modelName, index) => {
        const ModelComponent = createRegisteredComponent(modelName);
        return (
          <ModelComponent
            key={modelName}
            position={[index * 2, 0, 0]}
            physics={true}
            interactive={true}
          />
        );
      })}
    </group>
  );
};
```

## Development Workflow

### Adding New Components

1. **Create Component File**
   ```typescript
   // src/components/NewFeature.tsx
   export const NewFeature: React.FC<NewFeatureProps> = (props) => {
     return <div>New Feature Content</div>;
   };
   ```

2. **Define Props Schema**
   ```typescript
   const NewFeaturePropsSchema = z.object({
     title: z.string(),
     enabled: z.boolean().default(true)
   });
   ```

3. **Register Component**
   ```typescript
   registry.register('new-feature', {
     component: NewFeature,
     props: NewFeaturePropsSchema,
     dependencies: [],
     loading: 'lazy',
     metadata: {
       name: 'New Feature',
       category: 'ui',
       description: 'Description of new feature',
       version: '1.0.0',
       author: 'antimony-labs',
       tags: ['new', 'feature'],
       performance: { renderCost: 'low', memoryUsage: 'minimal' }
     }
   });
   ```

### Testing Registry Components

```typescript
describe('Component Registry', () => {
  test('should register and retrieve components', () => {
    const mockComponent = () => <div>Test</div>;
    
    registry.register('test-component', {
      component: mockComponent,
      props: z.object({}),
      dependencies: [],
      loading: 'immediate',
      metadata: testMetadata
    });
    
    const retrieved = registry.get('test-component');
    expect(retrieved?.component).toBe(mockComponent);
  });
  
  test('should validate props correctly', () => {
    const invalidProps = { title: 123 }; // should be string
    
    expect(() => {
      validateProps(NewFeaturePropsSchema, invalidProps);
    }).toThrow(ComponentValidationError);
  });
});
```

## Best Practices

### Component Design
- **Single Responsibility**: Each component should have one clear purpose
- **Props Interface**: Well-defined, typed props with validation
- **Error Handling**: Graceful degradation and error boundaries
- **Performance**: Memoization for expensive computations
- **Accessibility**: ARIA labels and keyboard navigation

### Registry Usage
- **Lazy Loading**: Use for non-critical components
- **Preloading**: Strategic loading for better UX
- **Caching**: Avoid re-registering components
- **Cleanup**: Unregister components when no longer needed

### Development
- **Hot Swapping**: Test component changes instantly
- **Type Safety**: Always use TypeScript with strict mode
- **Testing**: Unit tests for all registered components
- **Documentation**: Clear component descriptions and examples

## Error Handling

### Component Load Failures
```typescript
const ComponentErrorBoundary: React.FC<{ name: string; children: React.ReactNode }> = 
  ({ name, children }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (error: Error) => {
      console.error(`Component ${name} failed to load:`, error);
      setHasError(true);
    };
    
    window.addEventListener('unhandledrejection', handleError);
    return () => window.removeEventListener('unhandledrejection', handleError);
  }, [name]);
  
  if (hasError) {
    return <ComponentFallback name={name} />;
  }
  
  return <>{children}</>;
};
```

### Runtime Validation Errors
```typescript
class ComponentValidationError extends Error {
  constructor(public issues: z.ZodIssue[]) {
    super(`Component validation failed: ${issues.map(i => i.message).join(', ')}`);
    this.name = 'ComponentValidationError';
  }
}
```

This component registry system provides the foundation for scalable, maintainable, and performant component management in the Antimony Labs portfolio.