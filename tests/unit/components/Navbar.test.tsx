import React from 'react'
import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

// Avoid relying on full Jest type defs; we only need mockReturnValue for this test
const mockUsePathname = usePathname as unknown as {
  mockReturnValue: (v: ReturnType<typeof usePathname>) => void
}

describe('Navbar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the navbar with site name', () => {
    render(<Navbar />)
    
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('displays all navigation links', () => {
    render(<Navbar />)
    
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Experience' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Skills' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Calculators' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Swarm' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument()
  })

  it('highlights active page based on pathname', () => {
    mockUsePathname.mockReturnValue('/projects')
    render(<Navbar />)
    
    const projectsLink = screen.getByRole('link', { name: 'Projects' })
    expect(projectsLink).toHaveClass('text-brand-primary', 'bg-brand-primary/10')
  })

  it('applies default styling to non-active links', () => {
    mockUsePathname.mockReturnValue('/projects')
    render(<Navbar />)
    
    const homeLink = screen.getByRole('link', { name: 'Home' })
    expect(homeLink).toHaveClass('text-gray-700')
    expect(homeLink).not.toHaveClass('text-brand-primary', 'bg-brand-primary/10')
  })

  it('has correct link hrefs', () => {
    render(<Navbar />)
    
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects')
    expect(screen.getByRole('link', { name: 'Experience' })).toHaveAttribute('href', '/experience')
    expect(screen.getByRole('link', { name: 'Skills' })).toHaveAttribute('href', '/skills')
    expect(screen.getByRole('link', { name: 'Calculators' })).toHaveAttribute('href', '/calculators')
    expect(screen.getByRole('link', { name: 'Swarm' })).toHaveAttribute('href', '/swarm')
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact')
  })

  it('has proper responsive layout classes', () => {
    render(<Navbar />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('bg-white/90', 'backdrop-blur-lg', 'border-b', 'shadow-sm')
    
    const container = nav.firstChild as HTMLElement
    expect(container).toHaveClass('container', 'mx-auto', 'px-4')
    
    const inner = container.querySelector('div.flex.justify-between.items-center')
    expect(inner).toBeInTheDocument()
  })

  it('renders site logo/name as link to home', () => {
    render(<Navbar />)
    
    const logoLinks = screen.getAllByRole('link')
    const logoLink = logoLinks.find(link => link.getAttribute('href') === '/' && link.classList.contains('text-2xl'))
    
    expect(logoLink).toBeInTheDocument()
    expect(logoLink).toHaveClass('text-2xl', 'font-bold')
  })

  describe('Different pathname scenarios', () => {
    const testCases = [
      { pathname: '/', activeLink: 'Home' },
      { pathname: '/projects', activeLink: 'Projects' },
      { pathname: '/experience', activeLink: 'Experience' },
      { pathname: '/skills', activeLink: 'Skills' },
      { pathname: '/swarm', activeLink: 'Swarm' },
      { pathname: '/contact', activeLink: 'Contact' },
    ]

    testCases.forEach(({ pathname, activeLink }) => {
      it(`highlights ${activeLink} when pathname is ${pathname}`, () => {
        mockUsePathname.mockReturnValue(pathname)
        render(<Navbar />)
        
        const activeLinkElement = screen.getByRole('link', { name: activeLink })
        expect(activeLinkElement).toHaveClass('text-brand-primary', 'bg-brand-primary/10')
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper semantic navigation element', () => {
      render(<Navbar />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    it('uses proper list structure for navigation items', () => {
      render(<Navbar />)
      
      const list = screen.getByRole('list')
      expect(list).toBeInTheDocument()
      
      const listItems = screen.getAllByRole('listitem')
      expect(listItems.length).toBeGreaterThanOrEqual(6)
    })

    it('all links are keyboard accessible', () => {
      render(<Navbar />)
      
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toBeVisible()
        expect(link).not.toHaveAttribute('tabindex', '-1')
      })
    })
  })

  describe('Hover states', () => {
    it('applies hover classes to navigation links', () => {
      render(<Navbar />)
      
      const homeLink = screen.getByRole('link', { name: 'Home' })
      expect(homeLink).toHaveClass('hover:text-brand-primary')
    })
  })

  describe('Edge cases', () => {
    it('handles undefined pathname gracefully', () => {
      mockUsePathname.mockReturnValue(undefined as any)
      
      expect(() => render(<Navbar />)).not.toThrow()
    })

    it('handles non-matching pathname', () => {
      mockUsePathname.mockReturnValue('/non-existent-page')
      render(<Navbar />)
      
      // All links should have default styling
      const links = ['Home', 'Projects', 'Experience', 'Skills', 'Swarm', 'Contact']
      links.forEach(linkName => {
        const link = screen.getByRole('link', { name: linkName })
        expect(link).toHaveClass('text-gray-700')
        expect(link).not.toHaveClass('text-brand-primary', 'bg-brand-primary/10')
      })
    })
  })
})