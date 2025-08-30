import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import Navbar from '@/components/Navbar'

// Add jest-axe matchers
expect.extend(toHaveNoViolations)

describe('Accessibility Tests - Navbar', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Navbar />)

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper ARIA labels', () => {
    render(<Navbar />)

    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()

    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)

    links.forEach(link => {
      expect(link).toHaveAttribute('href')
    })
  })

  it('should support keyboard navigation', () => {
    render(<Navbar />)

    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toBeVisible()
      expect(link.tabIndex).not.toBe(-1)
    })
  })
})
