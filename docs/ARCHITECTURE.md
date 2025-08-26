# Architecture Documentation

This document outlines the technical architecture and design decisions for the Robotics Portfolio website.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Routing Strategy](#routing-strategy)
- [Styling Architecture](#styling-architecture)
- [Performance Considerations](#performance-considerations)
- [Security Considerations](#security-considerations)

## Overview

The Robotics Portfolio is a modern, interactive web application built with Next.js 15, showcasing professional robotics engineering work. The architecture follows React and Next.js best practices, emphasizing performance, maintainability, and user experience.

### Key Architectural Principles

1. **Component-Based Architecture** - Modular, reusable components
2. **Static Generation** - Pre-rendered pages for optimal performance
3. **Mobile-First Design** - Responsive layout with progressive enhancement
4. **Type Safety** - Full TypeScript implementation
5. **Performance First** - Optimized loading and smooth animations

## Technology Stack

### Core Framework
- **Next.js 15.4.5** - React framework with App Router
- **React 19.1.0** - UI library with concurrent features
- **TypeScript 5.0** - Type-safe development

### Styling & Animation
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Framer Motion 12.23.12** - Advanced animation library
- **CSS Grid & Flexbox** - Modern layout systems

### Development Tools
- **ESLint** - Code quality enforcement
- **PostCSS** - CSS processing pipeline
- **TypeScript Compiler** - Type checking and transpilation

### Deployment
- **Firebase Hosting** - Static site hosting with global CDN

## Project Structure

```
robotics-portfolio/
├── public/                     # Static assets
│   ├── logos/                 # Company and technology logos
│   ├── *.svg                  # Icon files and graphics
│   └── *.json                 # Static data files
├── src/
│   ├── app/                   # Next.js App Router structure
│   │   ├── (routes)/         # Route groups
│   │   │   ├── contact/      # Contact page
│   │   │   ├── experience/   # Professional experience
│   │   │   ├── projects/     # Project portfolio
│   │   │   ├── skills/       # Technical skills
│   │   │   └── swarm/        # Interactive swarm game
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout component
│   │   └── page.tsx          # Homepage
│   ├── components/           # Reusable React components
│   │   ├── ExperienceCard.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── RoombaSimulation.tsx
│   │   ├── SkillBadge.tsx
│   │   ├── SwarmGame.tsx
│   │   └── Typewriter.tsx
│   └── data/                 # Application data layer
│       ├── experience.ts     # Professional experience data
│       └── site.ts           # Site configuration
├── docs/                     # Documentation
├── *.config.*               # Configuration files
└── package.json             # Project metadata and dependencies
```

### Directory Responsibilities

- **`public/`** - Static assets served directly by the CDN
- **`src/app/`** - Next.js App Router pages and layouts
- **`src/components/`** - Reusable UI components
- **`src/data/`** - Static data and configuration
- **`docs/`** - Project documentation

## Component Architecture

### Component Hierarchy

```
App Layout (layout.tsx)
├── Navigation (Navbar.tsx)
├── Page Content
│   ├── Homepage (page.tsx)
│   │   └── Typewriter (Typewriter.tsx)
│   ├── Experience Page
│   │   └── ExperienceCard.tsx
│   ├── Projects Page
│   │   └── ProjectCard.tsx
│   ├── Skills Page
│   │   └── SkillBadge.tsx
│   ├── Swarm Game Page
│   │   ├── SwarmGame.tsx
│   │   └── RoombaSimulation.tsx
│   └── Contact Page
└── Footer (Footer.tsx)
```

### Component Design Patterns

#### 1. Functional Components with Hooks
All components use modern React functional component pattern with hooks for state management.

```typescript
// Example component structure
interface ComponentProps {
  // Type-safe props
}

export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks for state and effects
  const [state, setState] = useState<StateType>(initialState);
  
  // Event handlers
  const handleEvent = useCallback(() => {
    // Handler logic
  }, [dependencies]);
  
  // Render
  return (
    <div className="tailwind-classes">
      {/* Component content */}
    </div>
  );
};
```

#### 2. Composition Over Inheritance
Components are designed to be composable and reusable rather than extending base classes.

#### 3. Single Responsibility Principle
Each component has a single, well-defined purpose:
- **ExperienceCard** - Displays professional experience data
- **ProjectCard** - Showcases individual projects
- **SkillBadge** - Represents technical skills
- **Typewriter** - Animated text display

## Data Flow

### Static Data Architecture

```
Data Sources → TypeScript Modules → React Components → UI
```

1. **Data Sources** - Static TypeScript files in `src/data/`
2. **Type Definitions** - Strong typing for all data structures
3. **Component Import** - Direct import of typed data
4. **UI Rendering** - Type-safe rendering in components

### Example Data Flow

```typescript
// 1. Define data structure
export const experiences = [
  {
    company: "Design Visionaries",
    role: "Project Manager - Mechatronics",
    period: "Apr 2023 - Present",
    // ...
  }
] as const;

// 2. Type derivation
export type Experience = typeof experiences[number];

// 3. Component usage
export const ExperienceCard: React.FC<{ experience: Experience }> = ({ experience }) => {
  return <div>{experience.company}</div>;
};
```

## Routing Strategy

### App Router Structure

The application uses Next.js 15 App Router with the following structure:

```
app/
├── layout.tsx              # Root layout (applied to all pages)
├── page.tsx               # Homepage (/)
├── contact/
│   └── page.tsx          # Contact page (/contact)
├── experience/
│   └── page.tsx          # Experience page (/experience)
├── projects/
│   └── page.tsx          # Projects page (/projects)
├── skills/
│   └── page.tsx          # Skills page (/skills)
└── swarm/
    └── page.tsx          # Swarm game (/swarm)
```

### Navigation Implementation

- **Client-side routing** - Instant navigation with `next/link`
- **Progressive enhancement** - Works with JavaScript disabled
- **Active state management** - Visual feedback for current page

## Styling Architecture

### Tailwind CSS Implementation

The project uses Tailwind CSS 4.0 with the following approach:

#### 1. Utility-First Approach
```tsx
<div className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
```

#### 2. Responsive Design
```tsx
<h1 className="text-4xl md:text-6xl font-extrabold">
```

#### 3. Component-Level Styling
```tsx
<div className="pointer-events-none absolute inset-0 -z-10">
  <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-400/30 blur-3xl" />
</div>
```

### Animation Strategy

#### Framer Motion Integration
- **Page transitions** - Smooth navigation animations
- **Component animations** - Entrance and hover effects
- **Interactive elements** - Swarm game physics simulation

#### Performance Considerations
- **Hardware acceleration** - Transform and opacity animations
- **Reduced motion support** - Respects user accessibility preferences
- **Lazy loading** - Animations initialize on viewport entry

## Performance Considerations

### Next.js Optimizations

1. **Static Site Generation (SSG)**
   - All pages pre-rendered at build time
   - Optimal loading performance
   - SEO-friendly content delivery

2. **Image Optimization**
   - Next.js Image component for automatic optimization
   - WebP format support
   - Responsive image loading

3. **Code Splitting**
   - Automatic route-based code splitting
   - Dynamic imports for large components
   - Tree shaking for unused code elimination

### Bundle Optimization

- **Framer Motion** - Tree-shaken imports for minimal bundle size
- **Tailwind CSS** - Purged unused styles in production
- **TypeScript** - Zero runtime overhead

### Runtime Performance

- **Memoization** - React.memo and useMemo for expensive operations
- **Callback optimization** - useCallback for stable function references
- **Virtual DOM efficiency** - Minimal re-renders through proper key usage

## Security Considerations

### Content Security

- **Static content** - No server-side vulnerabilities
- **XSS prevention** - React's built-in XSS protection
- **Safe external links** - `rel="noopener noreferrer"` for security

### Dependency Management

- **Regular updates** - Automated dependency updates
- **Vulnerability scanning** - npm audit for security issues
- **Minimal dependencies** - Reduced attack surface

### Deployment Security

- **HTTPS enforcement** - All traffic encrypted
- **CSP headers** - Content Security Policy implementation
- **Static hosting** - No server-side attack vectors

## Future Considerations

### Scalability

- **Component library** - Extract reusable components
- **CMS integration** - Dynamic content management
- **Multi-language support** - Internationalization framework

### Performance Enhancements

- **Service workers** - Offline functionality
- **Progressive Web App** - Enhanced mobile experience
- **Analytics integration** - User behavior tracking

### Feature Additions

- **Dark mode** - Theme switching capability
- **Blog system** - Technical article publishing
- **Contact forms** - Interactive communication
- **Search functionality** - Content discovery

---

This architecture provides a solid foundation for the Robotics Portfolio while remaining flexible for future enhancements and scaling needs.