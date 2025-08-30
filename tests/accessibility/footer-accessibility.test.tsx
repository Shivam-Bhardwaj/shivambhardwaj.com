import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import Footer from '@/components/Footer'

// Add jest-axe matchers
expect.extend(toHaveNoViolations)

describe('Accessibility Tests - Footer', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Footer />)

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper semantic structure', () => {
    render(<Footer />)

    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()

    // Check for social media links
    const linkedinLink = screen.getByRole('link', { name: /linkedin/i })
    const githubLink = screen.getByRole('link', { name: /github/i })

    expect(linkedinLink).toBeInTheDocument()
    expect(githubLink).toBeInTheDocument()
    expect(linkedinLink).toHaveAttribute('target', '_blank')
    expect(githubLink).toHaveAttribute('target', '_blank')
  })

  it('should have proper security attributes on external links', () => {
    render(<Footer />)

    const externalLinks = screen.getAllByRole('link').filter(link =>
      link.getAttribute('href')?.startsWith('http')
    )

    externalLinks.forEach(link => {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})
