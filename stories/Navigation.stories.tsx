import type { Meta, StoryObj } from '@storybook/react';
import { Navigation } from '../src/components/Navigation';

const meta: Meta<typeof Navigation> = {
  title: 'Components/Navigation',
  component: Navigation,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Primary navigation component with responsive behavior and theme toggle functionality.',
      },
    },
  },
  argTypes: {
    currentPath: {
      control: { type: 'select' },
      options: ['/', '/projects', '/about', '/infrastructure', '/blog'],
      description: 'Current page path for active state indication',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default navigation state
export const Default: Story = {
  args: {
    currentPath: '/',
  },
};

// Projects page active
export const ProjectsActive: Story = {
  args: {
    currentPath: '/projects',
  },
};

// About page active
export const AboutActive: Story = {
  args: {
    currentPath: '/about',
  },
};

// Infrastructure page active
export const InfrastructureActive: Story = {
  args: {
    currentPath: '/infrastructure',
  },
};

// Blog page active
export const BlogActive: Story = {
  args: {
    currentPath: '/blog',
  },
};

// Mobile viewport demonstration
export const Mobile: Story = {
  args: {
    currentPath: '/',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};

// Tablet viewport demonstration
export const Tablet: Story = {
  args: {
    currentPath: '/projects',
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

// Dark theme demonstration
export const DarkTheme: Story = {
  args: {
    currentPath: '/',
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};