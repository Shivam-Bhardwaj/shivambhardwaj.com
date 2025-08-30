import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}))

// Mock site config to match current implementation
jest.mock('@/data/site', () => ({
  siteConfig: {
    name: 'Shivam Bhardwaj',
    role: 'Project Manager & Robotics Engineer',
    links: {
      github: 'https://github.com/Shivam-Bhardwaj',
      linkedin: 'https://www.linkedin.com/in/shivambdj/',
    },
  },
}))

describe('Home Page', () => {
  it('renders the main heading with gradient text', () => {
    render(<Home />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Shivam Bhardwaj')
    expect(heading).toHaveClass('bg-clip-text', 'text-transparent', 'bg-gradient-to-r')
  })

  it('displays the correct role', () => {
    render(<Home />)

    expect(screen.getByText('Senior Robotics Engineer')).toBeInTheDocument()
  })

  it('displays professional description', () => {
    render(<Home />)

    const description = screen.getByText(/Turning prototypes into production systems/)
    expect(description).toBeInTheDocument()
    expect(description).toHaveTextContent(/autonomous systems/)
  })

  it('renders hero images section', () => {
    render(<Home />)

    // Check for hero images placeholder content
    expect(screen.getByText('Robotics Lab')).toBeInTheDocument()
    expect(screen.getByText('Autonomous System')).toBeInTheDocument()
    expect(screen.getByText('Medical Device')).toBeInTheDocument()
    expect(screen.getByText('Production Line')).toBeInTheDocument()
  })

  it('displays company logos section', () => {
    render(<Home />)

    expect(screen.getByText('Trusted by')).toBeInTheDocument()
    expect(screen.getByText('Applied Materials')).toBeInTheDocument()
    expect(screen.getByText('Meta')).toBeInTheDocument()
    expect(screen.getByText('Saildrone')).toBeInTheDocument()
    expect(screen.getByText('Tesla')).toBeInTheDocument()
  })

  it('has responsive text sizing', () => {
    render(<Home />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('text-4xl', 'md:text-5xl', 'lg:text-6xl')

    const subtitle = screen.getByText('Senior Robotics Engineer')
    expect(subtitle).toHaveClass('text-xl', 'md:text-2xl')
  })

  it('uses correct gradient colors', () => {
    render(<Home />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'to-cyan-600')
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<Home />)

      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toBeInTheDocument()
    })

    it('no links found should not fail test', () => {
      render(<Home />)

      // Current Home component has no links, so this should pass
      const links = screen.queryAllByRole('link')
      expect(links.length).toBe(0) // No links in current implementation
    })
  })

  describe('Content Structure', () => {
    it('displays content in logical order', () => {
      render(<Home />)

      const container = screen.getByRole('heading', { level: 1 }).closest('div')
      const children = Array.from(container?.children || [])

      // Should have heading, subtitle, description, hero images, and companies
      expect(children.length).toBeGreaterThan(3)
    })
  })

  describe('Visual Design', () => {
    it('uses gradient colors consistently', () => {
      render(<Home />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'to-cyan-600')
    })

    it('has proper layout structure', () => {
      render(<Home />)

      const container = screen.getByRole('heading', { level: 1 }).closest('div')
      expect(container).toHaveClass('w-full', 'max-w-4xl', 'mx-auto')
    })
  })
})