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
    { href: "/learning", label: "LEARNING" },
    { href: "/contact", label: "CONTACT" }
  ];
  return (
    <nav className="nav" style={{
      background: 'rgb(var(--bg) / 0.8)',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="nav-content">
        <Link href="/" className="text-small font-semibold pl-4" style={{ fontWeight: 'normal' }}>
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
          className="md:hidden flex flex-col justify-center items-center"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            width: '30px',
            height: '30px',
            position: 'relative'
          }}
        >
          <span className={`block h-0.5 w-5 bg-current transform transition duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block h-0.5 w-5 bg-current my-1 transition duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block h-0.5 w-5 bg-current transform transition duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>
      </div>
      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0 overflow-hidden'}`} style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        background: 'rgb(var(--bg) / 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: isOpen ? '1px solid rgb(var(--border))' : 'none'
      }}>
        <div className="py-4 px-6">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-small py-3 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              style={{
                borderLeft: pathname === link.href ? '3px solid rgb(59, 130, 246)' : '3px solid transparent',
                paddingLeft: '12px'
              }}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
