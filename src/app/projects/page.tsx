'use client';

import { useState, useMemo } from 'react';
import { getProjects } from '@/lib/portfolio';
import { useGitHub, useGitHubRepositories } from '@/hooks/useGitHub';
import { GitHubCommitChart, GitHubLanguageChart, GitHubStatsOverview } from '@/components/GitHubCommitChart';
import { 
  SiDocker, 
  SiKubernetes, 
  SiAmazonec2, 
  SiNodedotjs, 
  SiThreedotjs, 
  SiNextdotjs, 
  SiTailwindcss, 
  SiTypescript,
  SiJavascript,
  SiPython,
  SiReact,
  SiHtml5,
  SiCss3,
  SiGit
} from 'react-icons/si';
import { ExternalLink, Star, GitFork, Eye, Calendar, RefreshCw } from 'lucide-react';

const techIconMap: Record<string, JSX.Element> = {
  Docker: <SiDocker className="w-4 h-4" />,
  Kubernetes: <SiKubernetes className="w-4 h-4" />,
  'AWS EKS': <SiAmazonec2 className="w-4 h-4" />,
  'Node.js': <SiNodedotjs className="w-4 h-4" />,
  'Three.js': <SiThreedotjs className="w-4 h-4" />,
  'Next.js': <SiNextdotjs className="w-4 h-4" />,
  'Tailwind CSS': <SiTailwindcss className="w-4 h-4" />,
  TypeScript: <SiTypescript className="w-4 h-4" />,
  JavaScript: <SiJavascript className="w-4 h-4" />,
  Python: <SiPython className="w-4 h-4" />,
  React: <SiReact className="w-4 h-4" />,
  HTML: <SiHtml5 className="w-4 h-4" />,
  CSS: <SiCss3 className="w-4 h-4" />,
  Git: <SiGit className="w-4 h-4" />,
};

const getLanguageIcon = (language: string | null): JSX.Element | null => {
  if (!language) return null;
  return techIconMap[language] || <div className="w-4 h-4 bg-gray-400 rounded-full" />;
};

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<'curated' | 'github' | 'analytics'>('curated');
  const [githubFilter, setGithubFilter] = useState<'all' | 'featured' | 'recent'>('featured');
  
  const projects = getProjects();
  const { stats, loading: githubLoading, error: githubError, refetch } = useGitHub();
  
  const githubOptions = useMemo(() => {
    switch (githubFilter) {
      case 'featured':
        return { featured: true, limit: 12, sortBy: 'stars' as const };
      case 'recent':
        return { limit: 12, sortBy: 'updated' as const };
      default:
        return { limit: 20, sortBy: 'updated' as const };
    }
  }, [githubFilter]);
  
  const { repositories: githubRepos } = useGitHubRepositories(githubOptions);

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-10">
          <div>
            <h1 className="heading-1 mb-4">Projects</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              Engineering and research work spanning robotics, cloud deployment, and interactive simulation.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-4 border-b border-gray-200 dark:border-gray-700">
            {[
              { key: 'curated', label: 'Curated Projects', count: projects.length },
              { key: 'github', label: 'GitHub Repositories', count: githubRepos.length },
              { key: 'analytics', label: 'Development Analytics', count: null }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Curated Projects Tab */}
          {activeTab === 'curated' && (
            <div className="grid gap-8 md:grid-cols-2">
              {projects.map(p => (
                <div key={p.id} className="card p-6 flex flex-col gap-4 group hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-semibold leading-tight">{p.name}</h2>
                    {p.featured && (
                      <span className="text-xs rounded bg-secondary-600/10 text-secondary-700 dark:text-secondary-300 px-2 py-1 font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">{p.shortDescription}</p>
                  <ul className="flex flex-wrap gap-2 text-xs">
                    {p.technologies.map(t => (
                      <li key={t.name} className="px-2 py-1 rounded bg-primary-100 dark:bg-primary-800/40 flex items-center gap-1">
                        {techIconMap[t.name]}
                        <span>{t.name}</span>
                      </li>
                    ))}
                  </ul>
                  {p.highlights && (
                    <ul className="text-xs space-y-1 border-t pt-2">
                      {p.highlights.slice(0,3).map(h => <li key={h} className="text-gray-500 dark:text-gray-400">• {h}</li>)}
                    </ul>
                  )}
                  <div className="flex flex-wrap gap-3 pt-1">
                    {p.links.map(l => (
                      <a key={l.url} href={l.url} target="_blank" rel="noopener" className="text-xs text-primary-600 dark:text-primary-300 hover:underline">
                        {l.label || l.type}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* GitHub Repositories Tab */}
          {activeTab === 'github' && (
            <div className="space-y-6">
              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex gap-2">
                  {[
                    { key: 'featured', label: 'Featured' },
                    { key: 'recent', label: 'Recent' },
                    { key: 'all', label: 'All' }
                  ].map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => setGithubFilter(filter.key as any)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        githubFilter === filter.key
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={refetch}
                  disabled={githubLoading}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${githubLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {/* Error State */}
              {githubError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-700 dark:text-red-400">{githubError}</p>
                </div>
              )}

              {/* Loading State */}
              {githubLoading && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="card p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                      <div className="flex gap-2 mb-4">
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              )}

              {/* GitHub Repositories */}
              {!githubLoading && !githubError && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {githubRepos.map(repo => (
                    <div key={repo.id} className="card p-6 flex flex-col gap-4 group hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {getLanguageIcon(repo.language)}
                          <h3 className="font-semibold truncate">{repo.name}</h3>
                        </div>
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {repo.description || 'No description available'}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {repo.stars > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            <span>{repo.stars}</span>
                          </div>
                        )}
                        {repo.forks > 0 && (
                          <div className="flex items-center gap-1">
                            <GitFork className="w-4 h-4" />
                            <span>{repo.forks}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(repo.lastUpdated)}</span>
                        </div>
                      </div>
                      
                      {repo.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {repo.topics.slice(0, 3).map(topic => (
                            <span
                              key={topic}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                            >
                              {topic}
                            </span>
                          ))}
                          {repo.topics.length > 3 && (
                            <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                              +{repo.topics.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      {repo.language && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <div className={`w-3 h-3 rounded-full bg-blue-500`}></div>
                          {repo.language}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {githubError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-700 dark:text-red-400">{githubError}</p>
                </div>
              )}
              
              {githubLoading && (
                <div className="grid gap-6 lg:grid-cols-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="card p-6 animate-pulse">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              )}
              
              {!githubLoading && !githubError && stats && (
                <div className="grid gap-8">
                  <GitHubStatsOverview stats={stats} />
                  <div className="grid gap-8 lg:grid-cols-2">
                    <GitHubCommitChart commitActivity={stats.commitActivity} />
                    <GitHubLanguageChart languageStats={stats.languageStats} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}