import { IconType } from 'react-icons';
import { 
  SiNextdotjs, SiReact, SiTailwindcss, SiTypescript, SiThreedotjs, SiVitest, SiEslint, SiGooglecloud, SiNodedotjs 
} from 'react-icons/si';

export interface TechnologyMeta {
  name: string;
  slug: string;
  icon: IconType;
  url: string;
  package?: string; // package.json lookup key
  category: 'framework' | 'language' | 'testing' | 'infrastructure' | 'tooling' | 'runtime' | 'ui';
  description?: string;
}

export const technologies: TechnologyMeta[] = [
  {
    name: 'Next.js',
    slug: 'nextjs',
    icon: SiNextdotjs,
    url: 'https://nextjs.org',
    package: 'next',
    category: 'framework',
    description: 'React framework for production web apps.'
  },
  {
    name: 'React',
    slug: 'react',
    icon: SiReact,
    url: 'https://react.dev',
    package: 'react',
    category: 'framework',
    description: 'Declarative UI library.'
  },
  {
    name: 'TypeScript',
    slug: 'typescript',
    icon: SiTypescript,
    url: 'https://typescriptlang.org',
    package: 'typescript',
    category: 'language',
    description: 'Typed superset of JavaScript.'
  },
  {
    name: 'Tailwind CSS',
    slug: 'tailwind',
    icon: SiTailwindcss,
    url: 'https://tailwindcss.com',
    package: 'tailwindcss',
    category: 'ui',
    description: 'Utility-first CSS framework.'
  },
  {
    name: 'Three.js',
    slug: 'threejs',
    icon: SiThreedotjs,
    url: 'https://threejs.org',
    package: 'three',
    category: 'ui',
    description: '3D library for WebGL.'
  },
  {
    name: 'Vitest',
    slug: 'vitest',
    icon: SiVitest,
    url: 'https://vitest.dev',
    package: 'vitest',
    category: 'testing',
    description: 'Blazing fast unit testing.'
  },
  {
    name: 'ESLint',
    slug: 'eslint',
    icon: SiEslint,
    url: 'https://eslint.org',
    package: 'eslint',
    category: 'tooling',
    description: 'Pluggable linting utility.'
  },
  {
    name: 'Node.js',
    slug: 'nodejs',
    icon: SiNodedotjs,
    url: 'https://nodejs.org',
    package: 'node',
    category: 'runtime',
    description: 'JavaScript runtime.'
  },
  {
    name: 'Google Cloud',
    slug: 'gcp',
    icon: SiGooglecloud,
    url: 'https://cloud.google.com',
    category: 'infrastructure',
    description: 'Cloud platform hosting & services.'
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
