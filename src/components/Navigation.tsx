import Link from "next/link";
import { siteConfig } from "@/data/site";

export default function Navigation() {
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Portfolio" },
    { href: "/experiments", label: "Experiments" },
    { href: "/blog", label: "Blog" },
    { href: "/learning", label: "Learning" },
    { href: "/work", label: "Work Arena" },
    { href: "/experience", label: "Experience" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="flex items-center gap-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm font-medium hover:text-primary transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

