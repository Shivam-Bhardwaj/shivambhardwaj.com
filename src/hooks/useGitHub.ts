'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ProcessedRepository, 
  GitHubStats, 
  CommitActivity, 
  LanguageStats,
  GitHubUser
} from '@/types/github';

interface UseGitHubState {
  repositories: ProcessedRepository[];
  stats: GitHubStats | null;
  user: GitHubUser | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface UseGitHubReturn extends UseGitHubState {
  refetch: () => Promise<void>;
  clearError: () => void;
}

export function useGitHub(): UseGitHubReturn {
  const [state, setState] = useState<UseGitHubState>({
    repositories: [],
    stats: null,
    user: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Fetch data from our API routes
      const [repositoriesRes, statsRes, userRes] = await Promise.all([
        fetch('/api/github?endpoint=repositories'),
        fetch('/api/github?endpoint=stats'),
        fetch('/api/github?endpoint=user')
      ]);

      if (!repositoriesRes.ok) {
        const error = await repositoriesRes.json();
        throw new Error(error.error || `HTTP ${repositoriesRes.status}`);
      }

      if (!statsRes.ok) {
        const error = await statsRes.json();
        throw new Error(error.error || `HTTP ${statsRes.status}`);
      }

      if (!userRes.ok) {
        const error = await userRes.json();
        throw new Error(error.error || `HTTP ${userRes.status}`);
      }

      const [repositories, stats, user] = await Promise.all([
        repositoriesRes.json(),
        statsRes.json(),
        userRes.json()
      ]);

      // Convert date strings back to Date objects
      const processedRepositories = repositories.map((repo: any) => ({
        ...repo,
        lastUpdated: new Date(repo.lastUpdated),
        created: new Date(repo.created)
      }));

      const processedStats = {
        ...stats,
        lastActivityDate: new Date(stats.lastActivityDate)
      };

      setState({
        repositories: processedRepositories,
        stats: processedStats,
        user,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (error: any) {
      console.error('Failed to fetch GitHub data:', error);
      
      let errorMessage = 'Failed to load GitHub data';
      if (error.message.includes('403')) {
        errorMessage = 'GitHub API rate limit exceeded. Please try again later.';
      } else if (error.message.includes('404')) {
        errorMessage = 'GitHub user not found.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, []);

  const refetch = useCallback(async () => {
    // Clear cache via API and refetch
    try {
      await fetch('/api/github?action=clear-cache', { method: 'POST' });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
    await fetchData();
  }, [fetchData]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch,
    clearError
  };
}

// Hook specifically for repository data with filtering
interface UseGitHubRepositoriesOptions {
  featured?: boolean;
  language?: string;
  minStars?: number;
  sortBy?: 'updated' | 'stars' | 'name' | 'created';
  limit?: number;
}

export function useGitHubRepositories(options: UseGitHubRepositoriesOptions = {}) {
  const { repositories, loading, error } = useGitHub();

  const filteredRepositories = repositories
    .filter(repo => {
      if (options.language && repo.language !== options.language) {
        return false;
      }
      if (options.minStars && repo.stars < options.minStars) {
        return false;
      }
      if (options.featured && repo.stars < 5 && !repo.topics.includes('featured')) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (options.sortBy) {
        case 'stars':
          return b.stars - a.stars;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return b.created.getTime() - a.created.getTime();
        case 'updated':
        default:
          return b.lastUpdated.getTime() - a.lastUpdated.getTime();
      }
    })
    .slice(0, options.limit);

  return {
    repositories: filteredRepositories,
    loading,
    error,
    totalCount: repositories.length
  };
}