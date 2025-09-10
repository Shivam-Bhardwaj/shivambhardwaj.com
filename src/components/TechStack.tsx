'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { technologies, TechnologyVersionMap, TechnologyMeta } from '@/lib/tech/registry';

interface TechStackProps {
  detailed?: boolean;
  categories?: string[];
  showInfrastructure?: boolean;
}

export default function TechStack({ 
  detailed = false, 
  categories = [], 
  showInfrastructure = false 
}: TechStackProps) {
  const [versions, setVersions] = useState<TechnologyVersionMap>({});
  const [selectedTech, setSelectedTech] = useState<TechnologyMeta | null>(null);

  useEffect(() => {
    fetch('/api/tech-versions')
      .then(r => r.json())
      .then(data => setVersions(data))
      .catch(() => setVersions({}));
  }, []);

  const filteredTechnologies = technologies.filter(tech => {
    if (categories.length === 0) return true;
    return categories.includes(tech.category);
  });

  const groupedTechnologies = filteredTechnologies.reduce((acc, tech) => {
    if (!acc[tech.category]) {
      acc[tech.category] = [];
    }
    acc[tech.category]!.push(tech);
    return acc;
  }, {} as Record<string, TechnologyMeta[]>);

  const categoryOrder = ['framework', 'language', 'ui', 'testing', 'tooling', 'runtime', 'infrastructure', 'deployment', 'monitoring', 'devops'];
  const sortedCategories = Object.keys(groupedTechnologies).sort((a, b) => {
    return categoryOrder.indexOf(a) - categoryOrder.indexOf(b);
  });

  if (detailed) {
    return (
      <div className="space-y-8">
        {sortedCategories.map(category => (
          <div key={category} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
              {category === 'ui' ? 'UI & Styling' : 
               category === 'devops' ? 'DevOps' :
               category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedTechnologies[category]?.map(tech => {
                const Icon = tech.icon as ComponentType<{ className?: string }>;
                const version = versions[tech.name] ?? undefined;
                return (
                  <div
                    key={tech.slug}
                    className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors cursor-pointer"
                    onClick={() => setSelectedTech(selectedTech?.slug === tech.slug ? null : tech)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                          {Icon && <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {tech.name}
                          </h4>
                          {version && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              v{version}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {tech.description}
                        </p>
                        {selectedTech?.slug === tech.slug && tech.details && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="space-y-2">
                              <div>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Purpose:</span>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  {tech.details.purpose}
                                </p>
                              </div>
                              {tech.details.configuration && (
                                <div>
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Configuration:</span>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {tech.details.configuration}
                                  </p>
                                </div>
                              )}
                              {tech.details.features && (
                                <div>
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Key Features:</span>
                                  <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1 list-disc list-inside">
                                    {tech.details.features.slice(0, 3).map((feature, index) => (
                                      <li key={index}>{feature}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Simple view (original)
  return (
    <div className="flex flex-wrap justify-center items-center gap-4">
      {filteredTechnologies.map(tech => {
        const Icon = tech.icon as ComponentType<{ className?: string }>;
        const version = versions[tech.name] ?? undefined;
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