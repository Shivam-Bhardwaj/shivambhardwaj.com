import type { Meta, StoryObj } from '@storybook/react';
import { GitHubContributionGraph } from '../src/components/GitHubContributionGraph';

// Mock data for the contribution graph
const mockContributions = Array.from({ length: 365 }, (_, i) => ({
  date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  count: Math.floor(Math.random() * 10),
  level: Math.floor(Math.random() * 5)
})).reverse();

const meta: Meta<typeof GitHubContributionGraph> = {
  title: 'Components/GitHubContributionGraph',
  component: GitHubContributionGraph,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Interactive GitHub contribution graph displaying daily commit activity with tooltips and color-coded intensity levels.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '900px', padding: '2rem', backgroundColor: '#ffffff' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    username: {
      control: { type: 'text' },
      description: 'GitHub username to fetch contributions for',
    },
    showTooltips: {
      control: { type: 'boolean' },
      description: 'Enable hover tooltips showing contribution details',
    },
    colorScheme: {
      control: { type: 'select' },
      options: ['green', 'blue', 'purple', 'orange'],
      description: 'Color scheme for the contribution squares',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default contribution graph
export const Default: Story = {
  args: {
    username: 'Shivam-Bhardwaj',
    showTooltips: true,
    colorScheme: 'green',
  },
};

// High activity simulation
export const HighActivity: Story = {
  args: {
    username: 'Shivam-Bhardwaj',
    showTooltips: true,
    colorScheme: 'green',
  },
  // This would require component to accept mock data
  // parameters: {
  //   mockData: mockContributions.map(c => ({ ...c, count: Math.min(c.count + 5, 15) }))
  // }
};

// Low activity simulation
export const LowActivity: Story = {
  args: {
    username: 'Shivam-Bhardwaj',
    showTooltips: true,
    colorScheme: 'green',
  },
};

// Different color schemes
export const BlueScheme: Story = {
  args: {
    username: 'Shivam-Bhardwaj',
    showTooltips: true,
    colorScheme: 'blue',
  },
};

export const PurpleScheme: Story = {
  args: {
    username: 'Shivam-Bhardwaj',
    showTooltips: true,
    colorScheme: 'purple',
  },
};

export const OrangeScheme: Story = {
  args: {
    username: 'Shivam-Bhardwaj',
    showTooltips: true,
    colorScheme: 'orange',
  },
};

// Without tooltips
export const NoTooltips: Story = {
  args: {
    username: 'Shivam-Bhardwaj',
    showTooltips: false,
    colorScheme: 'green',
  },
};

// Mobile responsive
export const Mobile: Story = {
  args: {
    username: 'Shivam-Bhardwaj',
    showTooltips: true,
    colorScheme: 'green',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', padding: '1rem', backgroundColor: '#ffffff' }}>
        <Story />
      </div>
    ),
  ],
};

// Dark theme
export const DarkTheme: Story = {
  args: {
    username: 'Shivam-Bhardwaj',
    showTooltips: true,
    colorScheme: 'green',
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '900px', padding: '2rem', backgroundColor: '#1a1a1a' }}>
        <Story />
      </div>
    ),
  ],
};

// Loading state
export const Loading: Story = {
  args: {
    username: 'Shivam-Bhardwaj',
    showTooltips: true,
    colorScheme: 'green',
  },
  // This would require the component to have a loading prop
  // args: { loading: true },
};

// Error state
export const ErrorState: Story = {
  args: {
    username: 'invalid-username-12345',
    showTooltips: true,
    colorScheme: 'green',
  },
};