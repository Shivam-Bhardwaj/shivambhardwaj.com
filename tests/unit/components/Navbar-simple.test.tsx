import React from 'react'
import { render, screen } from '@testing-library/react'
import Navbar from '@/components/Navbar'

const mockUsePathname = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

describe('Navbar Component - Basic Functionality', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/')
  })

  it('renders without crashing', () => {
    expect(() => render(<Navbar />)).not.toThrow()
  })

  it('displays the navbar element', () => {
    render(<Navbar />)
    const nav = document.querySelector('nav')
    expect(nav).toBeInTheDocument()
  })

  it('shows Home link', () => {
    render(<Navbar />)
    expect(screen.getByText('Home')).toBeInTheDocument()
  })
})
