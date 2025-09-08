import { IconType } from 'react-icons';
import { 
  SiNextdotjs, SiReact, SiTailwindcss, SiTypescript, SiThreedotjs, SiVitest, SiEslint, SiGooglecloud, SiNodedotjs,
  SiFramer, SiLucide, SiVite, SiGoogle, SiTestinglibrary
} from 'react-icons/si';

export interface TechnologyMeta {
  name: string;
  slug: string;
  icon: IconType;
  url: string;
  package?: string; // package.json lookup key
  category: 'framework' | 'language' | 'testing' | 'infrastructure' | 'tooling' | 'runtime' | 'ui' | 'deployment' | 'monitoring' | 'devops';
  description?: string;
  details?: {
    purpose: string;
    configuration?: string;
    features?: string[];
  };
}

export const technologies: TechnologyMeta[] = [
  // Frontend Framework & Libraries
  {
    name: 'Next.js',
    slug: 'nextjs',
    icon: SiNextdotjs,
    url: 'https://nextjs.org',
    package: 'next',
    category: 'framework',
    description: 'React framework for production web apps.',
    details: {
      purpose: 'Full-stack React framework with SSR, SSG, and API routes',
      configuration: 'App Router, TypeScript, optimized builds',
      features: ['Server-side rendering', 'Static generation', 'API routes', 'Image optimization', 'Automatic code splitting']
    }
  },
  {
    name: 'React',
    slug: 'react',
    icon: SiReact,
    url: 'https://react.dev',
    package: 'react',
    category: 'framework',
    description: 'Declarative UI library.',
    details: {
      purpose: 'Component-based UI library for building interactive interfaces',
      features: ['Virtual DOM', 'Component lifecycle', 'Hooks', 'State management', 'Event handling']
    }
  },
  {
    name: 'TypeScript',
    slug: 'typescript',
    icon: SiTypescript,
    url: 'https://typescriptlang.org',
    package: 'typescript',
    category: 'language',
    description: 'Typed superset of JavaScript.',
    details: {
      purpose: 'Static type checking for JavaScript with enhanced developer experience',
      configuration: 'Strict mode, ES2022 target, enhanced type safety',
      features: ['Static type checking', 'IntelliSense', 'Refactoring', 'Interface definitions', 'Generics']
    }
  },

  // UI & Styling
  {
    name: 'Tailwind CSS',
    slug: 'tailwind',
    icon: SiTailwindcss,
    url: 'https://tailwindcss.com',
    package: 'tailwindcss',
    category: 'ui',
    description: 'Utility-first CSS framework.',
    details: {
      purpose: 'Utility-first CSS framework for rapid UI development',
      configuration: 'Custom design system, dark mode, responsive breakpoints',
      features: ['Utility classes', 'Responsive design', 'Dark mode', 'Custom components', 'JIT compilation']
    }
  },
  {
    name: 'Three.js',
    slug: 'threejs',
    icon: SiThreedotjs,
    url: 'https://threejs.org',
    package: 'three',
    category: 'ui',
    description: '3D library for WebGL.',
    details: {
      purpose: 'WebGL 3D graphics library for interactive visualizations',
      features: ['3D rendering', 'WebGL abstraction', 'Scene graph', 'Materials & textures', 'Animation system']
    }
  },
  {
    name: 'React Three Fiber',
    slug: 'r3f',
    icon: SiReact,
    url: 'https://docs.pmnd.rs/react-three-fiber',
    package: '@react-three/fiber',
    category: 'ui',
    description: 'React renderer for Three.js.',
    details: {
      purpose: 'Declarative React components for Three.js 3D scenes',
      features: ['React components', 'Hooks', 'Automatic disposal', 'Suspense support', 'Performance optimizations']
    }
  },
  {
    name: 'Framer Motion',
    slug: 'framer',
    icon: SiFramer,
    url: 'https://framer.com/motion',
    package: 'framer-motion',
    category: 'ui',
    description: 'Production-ready motion library for React.',
    details: {
      purpose: 'Advanced animations and interactions for React components',
      features: ['Declarative animations', 'Gesture recognition', 'Layout animations', 'SVG animations', 'Scroll-triggered animations']
    }
  },
  {
    name: 'Lucide React',
    slug: 'lucide',
    icon: SiLucide,
    url: 'https://lucide.dev',
    package: 'lucide-react',
    category: 'ui',
    description: 'Beautiful & consistent icon toolkit.',
    details: {
      purpose: 'Consistent icon system with React components',
      features: ['SVG icons', 'Tree-shaking', 'Customizable', 'TypeScript support', '1000+ icons']
    }
  },

  // Testing & Quality Assurance
  {
    name: 'Vitest',
    slug: 'vitest',
    icon: SiVitest,
    url: 'https://vitest.dev',
    package: 'vitest',
    category: 'testing',
    description: 'Blazing fast unit testing framework.',
    details: {
      purpose: 'Modern testing framework with native ES modules support',
      configuration: 'jsdom environment, coverage reports, TypeScript support',
      features: ['Hot reload', 'Coverage reports', 'Snapshot testing', 'Mocking', 'Parallel execution']
    }
  },
  {
    name: 'Playwright',
    slug: 'playwright',
    icon: SiTestinglibrary,
    url: 'https://playwright.dev',
    package: '@playwright/test',
    category: 'testing',
    description: 'End-to-end testing for modern web apps.',
    details: {
      purpose: 'Cross-browser automated testing and web scraping',
      features: ['Multi-browser support', 'Auto-wait', 'Screenshots', 'Video recording', 'Network interception']
    }
  },
  {
    name: 'Testing Library',
    slug: 'testing-library',
    icon: SiReact,
    url: 'https://testing-library.com',
    package: '@testing-library/react',
    category: 'testing',
    description: 'Simple and complete testing utilities.',
    details: {
      purpose: 'User-centric testing utilities for React components',
      features: ['User-focused queries', 'Accessibility testing', 'Event simulation', 'Async utilities', 'Jest-DOM matchers']
    }
  },

  // Development Tools
  {
    name: 'ESLint',
    slug: 'eslint',
    icon: SiEslint,
    url: 'https://eslint.org',
    package: 'eslint',
    category: 'tooling',
    description: 'Pluggable linting utility.',
    details: {
      purpose: 'Static analysis tool for identifying and fixing code quality issues',
      configuration: 'Next.js config, strict rules, TypeScript integration',
      features: ['Code quality rules', 'Style consistency', 'Error prevention', 'Custom rules', 'IDE integration']
    }
  },
  {
    name: 'Vite',
    slug: 'vite',
    icon: SiVite,
    url: 'https://vitejs.dev',
    package: 'vite',
    category: 'tooling',
    description: 'Next generation frontend tooling.',
    details: {
      purpose: 'Fast build tool and development server for modern web projects',
      features: ['Hot module replacement', 'ES modules', 'Tree shaking', 'Plugin ecosystem', 'Optimized builds']
    }
  },

  // Runtime & Infrastructure
  {
    name: 'Node.js',
    slug: 'nodejs',
    icon: SiNodedotjs,
    url: 'https://nodejs.org',
    category: 'runtime',
    description: 'JavaScript runtime environment.',
    details: {
      purpose: 'Server-side JavaScript runtime for building scalable applications',
      configuration: 'Version 18+, ES modules support, performance optimizations',
      features: ['V8 engine', 'Event-driven', 'Non-blocking I/O', 'NPM ecosystem', 'Cross-platform']
    }
  },

  // Google Cloud Infrastructure
  {
    name: 'Google Cloud Platform',
    slug: 'gcp',
    icon: SiGooglecloud,
    url: 'https://cloud.google.com',
    category: 'infrastructure',
    description: 'Comprehensive cloud platform hosting & services.',
    details: {
      purpose: 'Cloud infrastructure platform providing compute, storage, and application services',
      configuration: 'App Engine F2 instances, us-central1 region, automatic scaling',
      features: ['Global infrastructure', 'Managed services', 'Security', 'Monitoring', 'CI/CD integration']
    }
  },
  {
    name: 'App Engine',
    slug: 'app-engine',
    icon: SiGoogle,
    url: 'https://cloud.google.com/appengine',
    category: 'deployment',
    description: 'Serverless application platform.',
    details: {
      purpose: 'Managed serverless platform for hosting web applications',
      configuration: 'Node.js 20 runtime, F2 instance class, 0-10 auto-scaling',
      features: ['Zero server management', 'Automatic scaling', 'Integrated monitoring', 'Version management', 'Traffic splitting']
    }
  },
  {
    name: 'Cloud Build',
    slug: 'cloud-build',
    icon: SiGoogle,
    url: 'https://cloud.google.com/build',
    category: 'devops',
    description: 'Continuous integration and delivery platform.',
    details: {
      purpose: 'Automated build, test, and deployment pipeline',
      features: ['Docker builds', 'Git integration', 'Parallel builds', 'Custom build steps', 'Artifact storage']
    }
  },
  {
    name: 'Cloud Logging',
    slug: 'cloud-logging',
    icon: SiGoogle,
    url: 'https://cloud.google.com/logging',
    category: 'monitoring',
    description: 'Centralized logging service.',
    details: {
      purpose: 'Real-time log management and analysis platform',
      features: ['Structured logging', 'Log search', 'Real-time streaming', 'Error reporting', 'Log-based metrics']
    }
  },
  {
    name: 'Cloud Monitoring',
    slug: 'cloud-monitoring',
    icon: SiGoogle,
    url: 'https://cloud.google.com/monitoring',
    category: 'monitoring',
    description: 'Infrastructure and application monitoring.',
    details: {
      purpose: 'Comprehensive monitoring solution for applications and infrastructure',
      features: ['Custom dashboards', 'Alerting', 'SLA monitoring', 'Performance insights', 'Integration with GCP services']
    }
  }
];

export type TechnologyVersionMap = Record<string, string | undefined>;

export function normalizeVersion(raw?: string): string | undefined {
  if (!raw) return undefined;
  return raw.replace(/^[-^~]/g, '').replace(/\s+/g, '');
}

interface PackageJsonLike {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export function mapVersions(pkgJson: PackageJsonLike | null | undefined): TechnologyVersionMap {
  const out: TechnologyVersionMap = {};
  const { dependencies = {}, devDependencies = {} } = pkgJson || {};
  technologies.forEach(t => {
    if (t.package) {
      const v = dependencies[t.package] || devDependencies[t.package];
      out[t.name] = normalizeVersion(v);
    }
  });
  return out;
}
