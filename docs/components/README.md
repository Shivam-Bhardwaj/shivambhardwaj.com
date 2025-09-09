# Component Library Documentation

## Overview

The Antimony Labs Component Library provides a comprehensive collection of reusable UI components, 3D robotics components, and interactive elements designed specifically for robotics engineering showcases. This library ensures consistency, performance, and accessibility across the portfolio.

## Component Categories

### UI Components

#### Navigation & Layout
- **Navigation**: Primary site navigation with theme toggle
- **Footer**: Site footer with contact information and social links  
- **PageHeader**: Consistent page headers with breadcrumbs
- **Sidebar**: Collapsible sidebar for content navigation
- **GridLayout**: Responsive grid system for content organization

#### Interactive Elements
- **Button**: Customizable button component with variants
- **Card**: Content card with hover effects and actions
- **Modal**: Accessible modal dialogs with backdrop
- **Tooltip**: Context-sensitive help tooltips
- **Tabs**: Tabbed interface for content organization

#### Data Display
- **GitHubContributionGraph**: Live GitHub activity visualization
- **TechStack**: Technology showcase with interactive elements  
- **ExperienceTimeline**: Professional experience timeline
- **MetricsCard**: Key performance indicators display
- **Chart**: Various chart types for data visualization

#### Feedback & States
- **LoadingSpinner**: Animated loading indicators
- **ErrorBoundary**: Error handling and fallback UI
- **Notification**: Toast notifications and alerts
- **ProgressBar**: Progress indication for long operations
- **Skeleton**: Loading skeleton for content placeholders

### 3D Components

#### Robot Models
- **RobotArm**: 6-DOF articulated manipulator
- **MobileRobot**: Wheeled mobile platform
- **DroneModel**: Multi-rotor aerial vehicle
- **HumanoidRobot**: Full-body articulated humanoid
- **ModularRobot**: Reconfigurable robot system

#### Environment & Scene
- **RoboticsScene**: Complete 3D scene setup
- **EnvironmentLighting**: Dynamic lighting system
- **WorkspaceVisualization**: Robot workspace boundaries
- **CollisionVisualization**: Collision detection feedback
- **TrajectoryPath**: Motion path visualization

#### Interaction Controls
- **JointController**: Individual joint manipulation
- **EndEffectorController**: Cartesian position control
- **CameraController**: 3D scene navigation
- **TouchController**: Mobile touch interaction
- **VirtualJoystick**: On-screen control interface

### Specialized Components

#### GitHub Integration
- **RepositoryCard**: Individual repository showcase
- **CommitHistory**: Recent commit activity
- **CodeStats**: Programming language statistics
- **IssueTracker**: GitHub issues integration
- **ContributionHeatmap**: Activity heatmap visualization

#### Infrastructure Monitoring
- **SystemMetrics**: Real-time system performance
- **DeploymentStatus**: Deployment pipeline status
- **ErrorLog**: Error tracking and reporting
- **PerformanceChart**: Performance metrics visualization
- **HealthCheck**: System health indicators

#### Blog & Content
- **BlogPost**: Markdown blog post rendering
- **CodeBlock**: Syntax-highlighted code display
- **ImageGallery**: Responsive image galleries
- **VideoPlayer**: Custom video player component
- **SocialShare**: Social media sharing buttons

## Component Usage

### Basic Component Usage

```typescript
import { Button, Card, Modal } from '@/components/ui';
import { RobotArm, RoboticsScene } from '@/components/3d';

// UI Component Example
const ExamplePage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div>
      <Card title="Robot Control Panel">
        <Button 
          variant="primary" 
          onClick={() => setShowModal(true)}
        >
          Open Controls
        </Button>
      </Card>
      
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title="Robot Controls"
      >
        <RobotControlInterface />
      </Modal>
    </div>
  );
};

// 3D Component Example  
const RoboticsDemo: React.FC = () => {
  return (
    <RoboticsScene
      camera={{ position: [5, 5, 5] }}
      lighting="dynamic"
      physics={true}
    >
      <RobotArm 
        model="/models/robot-arm.gltf"
        position={[0, 0, 0]}
        interactive={true}
        onJointChange={handleJointChange}
      />
    </RoboticsScene>
  );
};
```

### Component Registry Usage

```typescript
// Register component for dynamic loading
registry.register('robot-showcase', {
  component: RobotShowcase,
  props: RobotShowcasePropsSchema,
  dependencies: ['three-fiber', 'physics'],
  loading: 'lazy',
  metadata: {
    name: 'Robot Showcase',
    category: '3d',
    description: 'Interactive robotics demonstration',
    version: '2.1.0'
  }
});

// Use registered component
const DynamicRobotShowcase = createRegisteredComponent<RobotShowcaseProps>('robot-showcase');

// Component with feature flag
const ConditionalFeature: React.FC = () => {
  return (
    <FeatureGate flagId="robotics-showcase">
      <DynamicRobotShowcase />
    </FeatureGate>
  );
};
```

### Theme Integration

```typescript
// Theme-aware component
const ThemedComponent: React.FC<ThemedProps> = ({ theme }) => {
  const { colors, spacing, typography } = useTheme();
  
  return (
    <div 
      style={{
        backgroundColor: colors.surface,
        padding: spacing.medium,
        fontFamily: typography.fontFamily
      }}
    >
      <h2 style={{ color: colors.primary }}>
        Themed Content
      </h2>
    </div>
  );
};

// Theme preset selector
const ThemeDemo: React.FC = () => {
  const { setPreset } = useTheme();
  
  return (
    <div>
      <button onClick={() => setPreset('oceanic')}>
        Oceanic Theme
      </button>
      <button onClick={() => setPreset('forest')}>
        Forest Theme
      </button>
      <button onClick={() => setPreset('sunset')}>
        Sunset Theme
      </button>
    </div>
  );
};
```

## Component API Reference

### Button Component

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: (event: React.MouseEvent) => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onClick,
  children 
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${disabled ? 'disabled' : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <LoadingSpinner size="small" />}
      {leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
      <span className="btn-content">{children}</span>
      {rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
    </button>
  );
};
```

### Card Component

```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  image?: string;
  actions?: React.ReactNode;
  hoverable?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  image,
  actions,
  hoverable = false,
  loading = false,
  className = '',
  onClick,
  children
}) => {
  if (loading) {
    return <CardSkeleton />;
  }
  
  return (
    <div 
      className={`card ${hoverable ? 'card-hoverable' : ''} ${className}`}
      onClick={onClick}
    >
      {image && (
        <div className="card-image">
          <img src={image} alt={title} loading="lazy" />
        </div>
      )}
      
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      
      <div className="card-content">
        {children}
      </div>
      
      {actions && (
        <div className="card-actions">
          {actions}
        </div>
      )}
    </div>
  );
};
```

### RobotArm Component

```typescript
interface RobotArmProps {
  model: string; // Path to GLTF model
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  interactive?: boolean;
  physics?: boolean;
  jointLimits?: JointLimits[];
  onJointChange?: (jointIndex: number, value: number) => void;
  onEndEffectorMove?: (position: Vector3, orientation: Quaternion) => void;
  className?: string;
}

const RobotArm: React.FC<RobotArmProps> = ({
  model,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  interactive = true,
  physics = false,
  jointLimits = [],
  onJointChange,
  onEndEffectorMove,
  className
}) => {
  const groupRef = useRef<THREE.Group>();
  const { scene } = useGLTF(model);
  const { joints, endEffector } = useRobotKinematics(scene, jointLimits);
  
  // Setup interaction handlers
  const handleJointControl = useCallback((jointIndex: number, delta: number) => {
    const joint = joints[jointIndex];
    if (joint && joint.limits) {
      const newValue = Math.max(
        joint.limits.min,
        Math.min(joint.limits.max, joint.currentValue + delta)
      );
      
      joint.setTarget(newValue);
      onJointChange?.(jointIndex, newValue);
    }
  }, [joints, onJointChange]);
  
  return (
    <group 
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      className={className}
    >
      <primitive object={scene} />
      
      {interactive && (
        <JointControls
          joints={joints}
          onJointChange={handleJointControl}
        />
      )}
      
      {physics && (
        <PhysicsWrapper
          geometry={scene}
          onCollision={handleCollision}
        />
      )}
    </group>
  );
};
```

## Component Testing

### Unit Testing Example

```typescript
// tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  test('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  test('shows loading state', () => {
    render(<Button loading>Loading...</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
  
  test('applies correct variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-secondary');
  });
});
```

### Integration Testing

```typescript
// tests/integration/RobotShowcase.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { RobotShowcase } from '@/components/3d/RobotShowcase';

describe('Robot Showcase Integration', () => {
  test('loads and displays robot models', async () => {
    render(
      <Canvas>
        <RobotShowcase models={testRobotModels} />
      </Canvas>
    );
    
    // Wait for models to load
    await waitFor(() => {
      expect(screen.getByTestId('robot-showcase')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Verify robot models are rendered
    testRobotModels.forEach(model => {
      expect(screen.getByTestId(`robot-${model.id}`)).toBeInTheDocument();
    });
  });
  
  test('handles user interaction', async () => {
    const onInteraction = jest.fn();
    
    render(
      <Canvas>
        <RobotShowcase 
          models={testRobotModels}
          onInteraction={onInteraction}
        />
      </Canvas>
    );
    
    // Simulate mouse interaction
    const robotElement = await screen.findByTestId('robot-arm-1');
    fireEvent.click(robotElement);
    
    expect(onInteraction).toHaveBeenCalledWith({
      type: 'select',
      robotId: 'arm-1'
    });
  });
});
```

### Performance Testing

```typescript
// tests/performance/ComponentPerformance.test.tsx
describe('Component Performance', () => {
  test('Button renders within performance budget', () => {
    const startTime = performance.now();
    
    render(<Button>Performance Test</Button>);
    
    const renderTime = performance.now() - startTime;
    expect(renderTime).toBeLessThan(16); // 60fps budget
  });
  
  test('RobotArm maintains 60fps during animation', async () => {
    const performanceMonitor = new PerformanceMonitor();
    
    render(
      <Canvas>
        <RobotArm 
          model="/models/test-robot.gltf"
          interactive={true}
          onPerformanceUpdate={performanceMonitor.update}
        />
      </Canvas>
    );
    
    // Simulate 5 seconds of animation
    const animationDuration = 5000;
    const frameCount = Math.floor(animationDuration / 16.67); // 60fps
    
    for (let i = 0; i < frameCount; i++) {
      performanceMonitor.recordFrame();
      await new Promise(resolve => setTimeout(resolve, 16.67));
    }
    
    expect(performanceMonitor.getAverageFPS()).toBeGreaterThan(55);
  });
});
```

## Accessibility Guidelines

### ARIA Implementation

```typescript
// Accessible button with proper ARIA attributes
const AccessibleButton: React.FC<ButtonProps> = ({
  children,
  loading,
  disabled,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      aria-disabled={disabled}
    >
      {children}
      {loading && (
        <span className="sr-only">
          Loading, please wait...
        </span>
      )}
    </button>
  );
};
```

### Keyboard Navigation

```typescript
// 3D component with keyboard controls
const KeyboardNavigable3D: React.FC = () => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        moveCamera('forward');
        break;
      case 'ArrowDown':
        moveCamera('backward');
        break;
      case 'ArrowLeft':
        rotateCamera('left');
        break;
      case 'ArrowRight':
        rotateCamera('right');
        break;
      case 'Enter':
      case ' ':
        selectRobot();
        break;
    }
  }, []);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  return (
    <div
      tabIndex={0}
      role="application"
      aria-label="3D Robot Showcase - Use arrow keys to navigate, Enter to select"
    >
      {/* 3D content */}
    </div>
  );
};
```

## Best Practices

### Component Development

1. **Single Responsibility**: Each component should have one clear purpose
2. **Props Interface**: Use TypeScript interfaces with clear documentation
3. **Error Boundaries**: Wrap components that might fail with error boundaries
4. **Performance**: Use React.memo, useMemo, and useCallback appropriately
5. **Accessibility**: Include proper ARIA attributes and keyboard support

### 3D Component Guidelines

1. **Performance**: Implement LOD system for complex models
2. **Memory Management**: Dispose of geometries and materials properly
3. **User Experience**: Provide loading states and fallbacks
4. **Interaction**: Support multiple input methods (mouse, touch, keyboard)
5. **Physics**: Use physics simulation judiciously to avoid performance issues

### Testing Strategy

1. **Unit Tests**: Test individual component functionality
2. **Integration Tests**: Test component interactions and data flow
3. **Performance Tests**: Verify components meet performance requirements
4. **Accessibility Tests**: Ensure WCAG 2.1 AA compliance
5. **Visual Regression**: Catch unintended visual changes

This component library documentation provides comprehensive guidance for using, testing, and maintaining the Antimony Labs component ecosystem.