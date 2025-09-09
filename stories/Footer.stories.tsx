import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from '../src/components/Footer';

const meta: Meta<typeof Footer> = {
  title: 'Components/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Site footer with contact information, social links, and copyright notice.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default footer
export const Default: Story = {};

// Mobile layout
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};

// Tablet layout
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

// Dark theme
export const DarkTheme: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};

// Footer at bottom of page context
export const PageContext: Story = {
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, padding: '2rem' }}>
          <h1>Page Content</h1>
          <p>This demonstrates how the footer appears at the bottom of a page.</p>
          <div style={{ height: '400px', backgroundColor: '#f3f4f6', borderRadius: '8px', marginTop: '1rem' }}>
            Content Area
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
};