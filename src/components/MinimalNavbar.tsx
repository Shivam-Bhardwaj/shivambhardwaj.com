"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function MinimalNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "HOME" },
    { href: "/projects", label: "PROJECTS" },
    { href: "/experience", label: "EXPERIENCE" },
    { href: "/skills", label: "SKILLS" },
    { href: "/learning", label: "LEARNING" },
    { href: "/contact", label: "CONTACT" }
  ];

  return (
    <nav className="nav" style={{
      background: 'rgb(var(--bg) / 0.8)',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="nav-content">
        <Link href="/" className="text-small" style={{ fontWeight: 'normal' }}>
          SHIVAM BHARDWAJ
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-4">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-small"
              style={{
                borderBottom: pathname === link.href ? '1px solid currentColor' : '1px solid transparent',
                paddingBottom: '2px',
                transition: 'border-color 0.2s'
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          {isOpen ? '×' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'rgb(var(--bg))',
          borderBottom: '1px solid rgb(var(--border))',
          padding: '1rem 2rem'
        }}>
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-small"
              style={{
                padding: '0.5rem 0',
                borderBottom: pathname === link.href ? '1px solid currentColor' : 'none'
              }}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}