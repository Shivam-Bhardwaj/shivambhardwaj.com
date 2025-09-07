'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { technologies, TechnologyVersionMap } from '@/lib/tech/registry';

export default function TechStack() {
  const [versions, setVersions] = useState<TechnologyVersionMap>({});

  useEffect(() => {
    fetch('/api/tech-versions')
      .then(r => r.json())
      .then(data => setVersions(data));
  }, []);

  return (
    <div className="flex flex-wrap justify-center items-center gap-4">
      {technologies.map(tech => {
  const Icon = tech.icon as ComponentType<{ className?: string }>;
        const version = versions[tech.name];
        return (
          <a
            key={tech.slug}
            href={tech.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative focus:outline-none"
            aria-label={`${tech.name}${version ? ' version ' + version : ''}`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 shadow-sm ring-1 ring-gray-300/40 dark:ring-gray-600/40 transition-colors group-hover:from-indigo-100 group-hover:to-indigo-200 dark:group-hover:from-indigo-700 dark:group-hover:to-indigo-800">
              {Icon && <Icon className="h-6 w-6 text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300" />}
            </span>
            <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-black/10 transition group-hover:opacity-100 group-focus:opacity-100">
              <div className="flex flex-col items-start">
                <span>{tech.name}</span>
                {version && <span className="text-[10px] text-gray-300">v{version}</span>}
              </div>
              <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900" />
            </div>
          </a>
        );
      })}
    </div>
  );
}