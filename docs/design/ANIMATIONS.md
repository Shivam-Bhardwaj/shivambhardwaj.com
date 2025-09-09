# Animation Guidelines

## Animation Philosophy

### Purpose-Driven Motion

Every animation in the Antimony Labs portfolio serves a specific purpose:

#### Functional Animations
- **Feedback**: Confirm user actions and system responses
- **Guidance**: Direct attention to important elements or actions
- **Spatial Relationships**: Show how elements relate in space and time
- **State Changes**: Communicate transitions between different states

#### Emotional Animations  
- **Delight**: Create moments of surprise and satisfaction
- **Personality**: Express brand character through motion
- **Trust**: Build confidence through smooth, predictable motion
- **Engagement**: Maintain user interest and attention

### Physics-Based Motion

All animations follow real-world physics principles to create natural, intuitive experiences that users can predict and understand.

#### Core Physics Principles
- **Gravity**: Objects accelerate downward naturally
- **Inertia**: Objects in motion tend to stay in motion
- **Friction**: Motion gradually slows without external force
- **Elasticity**: Objects can compress, stretch, and bounce back

#### Mathematical Foundations
```typescript
// Standard easing functions based on physics
const easingFunctions = {
  // Linear motion (no physics)
  linear: (t: number) => t,
  
  // Gravity-inspired motion
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 2),
  easeInOut: (t: number) => t < 0.5 
    ? 2 * t * t 
    : 1 - Math.pow(-2 * t + 2, 2) / 2,
  
  // Spring physics
  spring: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : 
      -Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  
  // Bounce physics
  bounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }
};
```

## Animation Categories

### Micro-Interactions

Small, focused animations that provide immediate feedback for user actions.

#### Button Interactions
```typescript
const ButtonAnimation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.button
      className="btn btn-primary"
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
        transition: { duration: 0.2, ease: 'easeOut' }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1, ease: 'easeInOut' }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      <motion.span
        animate={{
          y: isPressed ? 1 : 0,
          opacity: isHovered ? 1 : 0.9
        }}
        transition={{ duration: 0.1 }}
      >
        {children}
      </motion.span>
      
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-white"
        initial={{ scale: 0, opacity: 0.3 }}
        animate={{
          scale: isPressed ? 1 : 0,
          opacity: isPressed ? 0 : 0.3
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </motion.button>
  );
};
```

#### Input Field Focus
```typescript
const AnimatedInput: React.FC<InputProps> = ({ 
  label, 
  error, 
  ...inputProps 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  
  return (
    <div className="relative">
      <motion.label
        className="absolute left-3 text-gray-500 pointer-events-none"
        animate={{
          y: isFocused || hasValue ? -24 : 0,
          scale: isFocused || hasValue ? 0.85 : 1,
          color: isFocused ? '#3b82f6' : '#6b7280'
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {label}
      </motion.label>
      
      <motion.input
        {...inputProps}
        className={`input ${error ? 'input-error' : ''}`}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false);
          setHasValue(e.target.value.length > 0);
        }}
        animate={{
          borderColor: isFocused ? '#3b82f6' : error ? '#ef4444' : '#d1d5db'
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Focus ring */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        initial={{ boxShadow: '0 0 0 0px rgba(59, 130, 246, 0)' }}
        animate={{
          boxShadow: isFocused 
            ? '0 0 0 3px rgba(59, 130, 246, 0.1)' 
            : '0 0 0 0px rgba(59, 130, 246, 0)'
        }}
        transition={{ duration: 0.2 }}
      />
    </div>
  );
};
```

### Page Transitions

Smooth transitions between different pages and application states.

#### Route Transitions
```typescript
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.3,
            ease: 'easeOut',
            staggerChildren: 0.1
          }
        }}
        exit={{ 
          opacity: 0, 
          y: -20,
          transition: {
            duration: 0.2,
            ease: 'easeIn'
          }
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Staggered content animation
const StaggeredContent: React.FC<{ children: React.ReactNode[] }> = ({ children }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: {
                duration: 0.5,
                ease: 'easeOut'
              }
            }
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
```

#### Modal Transitions
```typescript
const AnimatedModal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  ...props 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            
            {/* Modal content */}
            <motion.div
              className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4"
              initial={{ 
                opacity: 0, 
                scale: 0.9,
                y: 20
              }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: 0
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.9,
                y: 20
              }}
              transition={{
                type: 'spring',
                damping: 20,
                stiffness: 300
              }}
            >
              {children}
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
};
```

### Loading States

Engaging loading animations that communicate progress and maintain user attention.

#### Skeleton Loading
```typescript
const SkeletonLoader: React.FC<{
  width?: string | number;
  height?: string | number;
  className?: string;
}> = ({ width = '100%', height = '1rem', className = '' }) => {
  return (
    <motion.div
      className={`bg-gray-200 rounded ${className}`}
      style={{ width, height }}
      animate={{
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
};

const ContentSkeleton: React.FC = () => (
  <div className="space-y-4">
    <SkeletonLoader height="2rem" width="60%" />
    <SkeletonLoader height="1rem" width="100%" />
    <SkeletonLoader height="1rem" width="80%" />
    <SkeletonLoader height="1rem" width="90%" />
    <div className="flex space-x-2">
      <SkeletonLoader height="2rem" width="5rem" />
      <SkeletonLoader height="2rem" width="6rem" />
    </div>
  </div>
);
```

#### Progress Indicators
```typescript
const AnimatedProgressBar: React.FC<{
  progress: number; // 0-100
  color?: string;
  height?: string;
}> = ({ progress, color = '#3b82f6', height = '0.5rem' }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color, height }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{
          duration: 0.5,
          ease: 'easeOut'
        }}
      />
    </div>
  );
};

const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}> = ({ size = 'md', color = '#3b82f6' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-gray-200 rounded-full`}
      style={{ borderTopColor: color }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  );
};
```

### 3D Robot Animations

Specialized animations for robotics demonstrations that showcase realistic movement and physics.

#### Joint Movement Animation
```typescript
const AnimatedRobotJoint: React.FC<{
  targetAngle: number;
  currentAngle: number;
  onAngleChange: (angle: number) => void;
  maxSpeed?: number;
  acceleration?: number;
}> = ({ 
  targetAngle, 
  currentAngle, 
  onAngleChange, 
  maxSpeed = 90, // degrees per second
  acceleration = 180 // degrees per second squared
}) => {
  const animationRef = useRef<number>();
  const velocityRef = useRef(0);
  
  useEffect(() => {
    const animate = (timestamp: number) => {
      const deltaTime = timestamp - (animationRef.current || timestamp);
      animationRef.current = timestamp;
      
      const angleDifference = targetAngle - currentAngle;
      const direction = Math.sign(angleDifference);
      
      // Apply acceleration
      const targetVelocity = Math.min(
        maxSpeed,
        Math.abs(angleDifference) * 2 // Slow down as we approach target
      ) * direction;
      
      const velocityDifference = targetVelocity - velocityRef.current;
      const velocityChange = Math.sign(velocityDifference) * 
        Math.min(Math.abs(velocityDifference), acceleration * deltaTime / 1000);
      
      velocityRef.current += velocityChange;
      
      // Apply velocity to angle
      const newAngle = currentAngle + velocityRef.current * deltaTime / 1000;
      
      // Check if we've reached the target
      if (Math.abs(targetAngle - newAngle) < 0.1) {
        onAngleChange(targetAngle);
        velocityRef.current = 0;
      } else {
        onAngleChange(newAngle);
        requestAnimationFrame(animate);
      }
    };
    
    if (Math.abs(targetAngle - currentAngle) > 0.1) {
      requestAnimationFrame(animate);
    }
  }, [targetAngle, currentAngle, maxSpeed, acceleration, onAngleChange]);
  
  return null; // This is a logic component, no render
};
```

#### Robot Path Animation
```typescript
const AnimatedRobotPath: React.FC<{
  waypoints: Vector3[];
  duration?: number;
  onComplete?: () => void;
  onUpdate?: (position: Vector3, progress: number) => void;
}> = ({ waypoints, duration = 5000, onComplete, onUpdate }) => {
  const [progress, setProgress] = useState(0);
  
  // Calculate path segments and distances
  const pathData = useMemo(() => {
    const segments = [];
    let totalDistance = 0;
    
    for (let i = 1; i < waypoints.length; i++) {
      const distance = waypoints[i].distanceTo(waypoints[i - 1]);
      segments.push({
        start: waypoints[i - 1],
        end: waypoints[i],
        distance,
        startProgress: totalDistance
      });
      totalDistance += distance;
    }
    
    return { segments, totalDistance };
  }, [waypoints]);
  
  // Animate progress
  useEffect(() => {
    const animation = {
      from: 0,
      to: 1,
      duration,
      ease: 'easeInOut',
      onUpdate: (value: number) => {
        setProgress(value);
        
        // Calculate current position
        const currentDistance = value * pathData.totalDistance;
        let currentSegment = pathData.segments.find(
          segment => currentDistance >= segment.startProgress && 
                    currentDistance <= segment.startProgress + segment.distance
        );
        
        if (currentSegment) {
          const segmentProgress = (currentDistance - currentSegment.startProgress) / 
                                  currentSegment.distance;
          const position = new Vector3().lerpVectors(
            currentSegment.start,
            currentSegment.end,
            segmentProgress
          );
          
          onUpdate?.(position, value);
        }
      },
      onComplete: () => {
        setProgress(1);
        onComplete?.();
      }
    };
    
    // Use GSAP or similar animation library
    gsap.to(animation, animation);
  }, [waypoints, duration, pathData, onUpdate, onComplete]);
  
  return null; // Logic component
};
```

### Gesture Animations

Animations that respond to user gestures and provide tactile feedback.

#### Swipe Gestures
```typescript
const SwipeableCard: React.FC<{
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}> = ({ children, onSwipeLeft, onSwipeRight, threshold = 150 }) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }
    
    setDragX(0);
  };
  
  return (
    <motion.div
      className="relative cursor-grab active:cursor-grabbing"
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      onDrag={(event, info) => setDragX(info.offset.x)}
      animate={{
        x: dragX,
        rotate: dragX * 0.1,
        scale: isDragging ? 1.05 : 1
      }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30
      }}
    >
      {children}
      
      {/* Swipe indicators */}
      <AnimatePresence>
        {Math.abs(dragX) > threshold / 2 && (
          <motion.div
            className={`absolute inset-0 flex items-center justify-center
              ${dragX > 0 ? 'bg-green-500' : 'bg-red-500'} bg-opacity-20 rounded-lg`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-white font-bold"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              {dragX > 0 ? '👍' : '👎'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
```

#### Pinch to Zoom
```typescript
const PinchableImage: React.FC<{
  src: string;
  alt: string;
  maxZoom?: number;
}> = ({ src, alt, maxZoom = 3 }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handlePinch = useCallback((event: any, info: any) => {
    const newScale = Math.max(1, Math.min(maxZoom, scale * info.scale));
    setScale(newScale);
  }, [scale, maxZoom]);
  
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  
  return (
    <div className="overflow-hidden relative">
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-auto cursor-grab active:cursor-grabbing"
        drag={scale > 1}
        dragConstraints={{
          left: -(scale - 1) * 100,
          right: (scale - 1) * 100,
          top: -(scale - 1) * 100,
          bottom: (scale - 1) * 100
        }}
        animate={{
          scale,
          x: position.x,
          y: position.y
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
        onPinch={handlePinch}
        onDoubleClick={scale > 1 ? resetZoom : () => setScale(2)}
      />
      
      {scale > 1 && (
        <motion.button
          className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded"
          onClick={resetZoom}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          Reset Zoom
        </motion.button>
      )}
    </div>
  );
};
```

## Performance Optimization

### Animation Performance Best Practices

#### GPU Acceleration
- Use `transform` and `opacity` properties for animations
- Avoid animating layout properties (`width`, `height`, `top`, `left`)
- Apply `will-change` property strategically

```css
/* Optimized animation properties */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0); /* Force GPU acceleration */
}

/* Avoid these expensive properties */
.bad-animation {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { left: -100px; } /* Triggers layout recalculation */
  to { left: 0; }
}

/* Better approach */
.good-animation {
  animation: slideInOptimized 0.3s ease-out;
}

@keyframes slideInOptimized {
  from { transform: translateX(-100px); } /* GPU accelerated */
  to { transform: translateX(0); }
}
```

#### Frame Rate Monitoring
```typescript
const useAnimationPerformance = () => {
  const [fps, setFps] = useState(60);
  const frameTimestamp = useRef(performance.now());
  const frameCount = useRef(0);
  
  useEffect(() => {
    let animationFrame: number;
    
    const measureFPS = () => {
      const now = performance.now();
      frameCount.current++;
      
      if (now - frameTimestamp.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        frameTimestamp.current = now;
      }
      
      animationFrame = requestAnimationFrame(measureFPS);
    };
    
    measureFPS();
    
    return () => cancelAnimationFrame(animationFrame);
  }, []);
  
  // Reduce animation complexity if performance is poor
  const shouldReduceAnimations = fps < 45;
  
  return { fps, shouldReduceAnimations };
};
```

#### Reduced Motion Support
```typescript
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReducedMotion;
};

const AccessibleAnimation: React.FC<{
  children: React.ReactNode;
  animation: any;
  reducedAnimation?: any;
}> = ({ children, animation, reducedAnimation }) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      {...(prefersReducedMotion ? (reducedAnimation || {}) : animation)}
    >
      {children}
    </motion.div>
  );
};
```

These animation guidelines ensure that motion enhances the user experience while maintaining excellent performance and accessibility across all devices and user preferences.