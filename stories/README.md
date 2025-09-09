# Storybook Component Showcase

## Overview

This Storybook instance showcases all components in the Antimony Labs portfolio, providing an interactive development environment for UI components, 3D robotics demonstrations, and design system elements.

## Running Storybook

```bash
# Start Storybook development server
npm run storybook

# Build static Storybook for deployment
npm run build-storybook
```

## Available Stories

### UI Components

#### Navigation Components
- **Navigation.stories.tsx**: Primary site navigation with responsive behavior
- **Footer.stories.tsx**: Site footer with contact and social links

#### Data Display
- **GitHubContributionGraph.stories.tsx**: Interactive contribution calendar
- **TechStack.stories.tsx**: Technology showcase with animations

#### Layout & Content
- **Card.stories.tsx**: Content cards with various configurations
- **Modal.stories.tsx**: Accessible modal dialogs
- **Button.stories.tsx**: Interactive buttons with states

### 3D Robotics Components

#### Robot Demonstrations
- **Robotics.stories.tsx**: Interactive 3D robot simulations
  - Single Robot Arm
  - Multiple Robot Coordination
  - Industrial Workspace
  - Laboratory Setting
  - Mobile Platform Demo
  - Performance Testing

#### Interaction Systems
- **RobotControls.stories.tsx**: Robot control interfaces
- **PhysicsDemo.stories.tsx**: Physics simulation examples
- **CollisionDetection.stories.tsx**: Collision system demonstrations

### Design System

#### Typography
- **Typography.stories.tsx**: Font scales and text styles
- **ColorPalette.stories.tsx**: Color system and themes

#### Layout Patterns
- **Grid.stories.tsx**: Grid system variations
- **Spacing.stories.tsx**: Spacing scale demonstrations
- **Containers.stories.tsx**: Layout container patterns

## Story Organization

### File Structure
```
stories/
├── README.md                          # This file
├── Navigation.stories.tsx             # Site navigation
├── Footer.stories.tsx                 # Site footer
├── GitHubContributionGraph.stories.tsx # GitHub integration
├── TechStack.stories.tsx              # Technology showcase
├── Robotics.stories.tsx               # 3D robotics demos
└── design-system/                     # Design system stories
    ├── Typography.stories.tsx
    ├── Colors.stories.tsx
    └── Layout.stories.tsx
```

### Story Naming Convention
- **Component Stories**: `ComponentName.stories.tsx`
- **Feature Stories**: `FeatureName.stories.tsx`
- **System Stories**: `SystemName.stories.tsx`

## Story Categories

### Component Documentation
Each story includes:
- **Default States**: Basic component configurations
- **Variants**: Different visual and functional variations
- **Responsive**: Mobile, tablet, and desktop layouts
- **Themes**: Light and dark theme demonstrations
- **Accessibility**: Screen reader and keyboard navigation
- **Error States**: Error handling and validation

### Interactive Features
- **Controls Panel**: Real-time prop manipulation
- **Actions Logger**: Event interaction tracking
- **Accessibility Checker**: Automated a11y testing
- **Viewport Selector**: Responsive design testing
- **Theme Switcher**: Light/dark theme toggling

## Development Workflow

### Adding New Stories

1. **Create Story File**
   ```typescript
   // stories/NewComponent.stories.tsx
   import type { Meta, StoryObj } from '@storybook/react';
   import { NewComponent } from '../src/components/NewComponent';

   const meta: Meta<typeof NewComponent> = {
     title: 'Components/NewComponent',
     component: NewComponent,
     parameters: {
       docs: {
         description: {
           component: 'Component description here.',
         },
       },
     },
     tags: ['autodocs'],
   };

   export default meta;
   type Story = StoryObj<typeof meta>;

   export const Default: Story = {
     args: {
       // Default props
     },
   };
   ```

2. **Add Story Variations**
   ```typescript
   export const Mobile: Story = {
     args: { ...Default.args },
     parameters: {
       viewport: { defaultViewport: 'mobile' },
     },
   };

   export const DarkTheme: Story = {
     args: { ...Default.args },
     parameters: {
       backgrounds: { default: 'dark' },
     },
   };
   ```

3. **Include Accessibility Testing**
   ```typescript
   export const AccessibilityTest: Story = {
     args: { ...Default.args },
     play: async ({ canvasElement }) => {
       // Accessibility testing with @storybook/testing-library
     },
   };
   ```

### 3D Component Stories

For Three.js components, use Canvas wrapper:

```typescript
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

export const RobotDemo: Story = {
  render: (args) => (
    <div style={{ width: '100%', height: '600px' }}>
      <Canvas camera={{ position: [5, 5, 5] }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} />
          <RobotComponent {...args} />
        </Suspense>
      </Canvas>
    </div>
  ),
};
```

## Testing Integration

### Visual Regression Testing
Storybook stories automatically serve as visual regression tests:

```bash
# Run visual tests with Chromatic
npm run chromatic

# Run local visual tests
npm run test:visual
```

### Accessibility Testing
Built-in accessibility testing with `@storybook/addon-a11y`:

```typescript
// Automatically tests all stories for:
// - Color contrast ratios
// - ARIA attributes
// - Keyboard navigation
// - Focus management
```

### Interaction Testing
Test user interactions with `@storybook/addon-interactions`:

```typescript
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

export const InteractionTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    await userEvent.click(button);
    await expect(button).toHaveTextContent('Clicked!');
  },
};
```

## Performance Optimization

### Story Performance
- Use `parameters.chromatic.disable` for expensive 3D stories
- Implement loading states for heavy components
- Use `args` for prop variations instead of multiple components

### 3D Story Optimization
```typescript
export const OptimizedRobotDemo: Story = {
  parameters: {
    // Disable in visual regression testing
    chromatic: { disable: true },
  },
  render: (args) => (
    <Canvas
      gl={{ antialias: false }} // Disable for performance
      camera={{ position: [3, 3, 3] }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <RobotComponent {...args} lodLevel="medium" />
      </Suspense>
    </Canvas>
  ),
};
```

## Deployment

### Static Build
```bash
# Build static Storybook
npm run build-storybook

# Preview built Storybook
npx http-server storybook-static
```

### Chromatic Integration
```bash
# Deploy to Chromatic for visual testing
npx chromatic --project-token=<project-token>
```

## Configuration

### Storybook Configuration
- **`.storybook/main.ts`**: Core configuration and addons
- **`.storybook/preview.ts`**: Global decorators and parameters

### Custom Addons
- **Accessibility**: `@storybook/addon-a11y`
- **Interactions**: `@storybook/addon-interactions`
- **Docs**: `@storybook/addon-docs`
- **Vitest**: `@storybook/addon-vitest`

This Storybook setup provides comprehensive component documentation, interactive development environment, and automated testing integration for the Antimony Labs portfolio.