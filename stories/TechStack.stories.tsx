import type { Meta, StoryObj } from '@storybook/react';
import { TechStack } from '../src/components/TechStack';

const meta: Meta<typeof TechStack> = {
  title: 'Components/TechStack',
  component: TechStack,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Interactive technology stack showcase with animated icons and descriptions for each technology used in the portfolio.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px', padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default tech stack display
export const Default: Story = {};

// Mobile layout
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
};

// Tablet layout
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', padding: '1.5rem' }}>
        <Story />
      </div>
    ),
  ],
};

// Dark theme
export const DarkTheme: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};

// Minimal variant (if available in component)
export const Minimal: Story = {
  // This would require the component to have a minimal prop
  // args: { variant: 'minimal' },
};

// Grid layout showcase
export const GridLayout: Story = {
  decorators: [
    (Story) => (
      <div style={{ 
        width: '1200px', 
        padding: '2rem',
        display: 'grid',
        gap: '2rem'
      }}>
        <Story />
      </div>
    ),
  ],
};