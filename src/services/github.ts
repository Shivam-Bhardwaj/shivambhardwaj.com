import {
  GitHubRepository,
  GitHubLanguage,
  GitHubCommit,
  GitHubUser,
  GitHubReadme,
  ProcessedRepository,
  CommitActivity,
  LanguageStats,
  GitHubStats,
  CachedGitHubResponse,
  GitHubAPIError,
  GitHubConfig
} from '@/types/github';

class GitHubService {
  private baseUrl = 'https://api.github.com';
  private cache = new Map<string, CachedGitHubResponse<any>>();
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = {
      cacheDurationMs: 5 * 60 * 1000, // 5 minutes default
      maxRetries: 3,
      includePrivate: false,
      includeArchived: false,
      ...config
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<CachedGitHubResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = `${endpoint}:${JSON.stringify(options)}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < (this.config.cacheDurationMs || 300000)) {
      return cached as CachedGitHubResponse<T>;
    }

    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'antimony-labs-portfolio/1.0.0',
      ...options.headers
    };

    // Add authentication if token is provided
    if (this.config.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.config.token}`;
    }

    let lastError: GitHubAPIError | null = null;
    
    // Retry logic
    for (let attempt = 0; attempt < (this.config.maxRetries || 3); attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers
        });

        if (!response.ok) {
          const error: GitHubAPIError = {
            message: `GitHub API error: ${response.status} ${response.statusText}`,
            status: response.status,
            response
          };

          if (response.status === 403) {
            const rateLimitReset = response.headers.get('X-RateLimit-Reset');
            if (rateLimitReset) {
              const resetTime = new Date(parseInt(rateLimitReset) * 1000);
              error.message += ` (Rate limit reset at ${resetTime.toLocaleString()})`;
            }
          }

          throw error;
        }

        const data: T = await response.json();
        
        // Extract rate limit info
        const rateLimit = {
          limit: parseInt(response.headers.get('X-RateLimit-Limit') || '5000'),
          remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '5000'),
          reset: parseInt(response.headers.get('X-RateLimit-Reset') || '0')
        };

        const etag = response.headers.get('ETag');
        const result: CachedGitHubResponse<T> = {
          data,
          timestamp: Date.now(),
          ...(etag && { etag }),
          rateLimit
        };

        // Cache the result
        this.cache.set(cacheKey, result);
        
        return result;
      } catch (error) {
        lastError = error as GitHubAPIError;
        
        // Don't retry on client errors (4xx), only on server errors (5xx) or network issues
        if (lastError.status && lastError.status >= 400 && lastError.status < 500) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < (this.config.maxRetries || 3) - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Unknown error occurred');
  }

  async getUserRepositories(page = 1, perPage = 100): Promise<ProcessedRepository[]> {
    const endpoint = `/users/${this.config.username}/repos`;
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      sort: 'updated',
      direction: 'desc',
      type: this.config.includePrivate ? 'all' : 'public'
    });

    const response = await this.makeRequest<GitHubRepository[]>(`${endpoint}?${params}`);
    
    let repositories = response.data;
    
    // Filter out archived repos if not included
    if (!this.config.includeArchived) {
      repositories = repositories.filter(repo => !repo.archived);
    }

    // Process repositories with language data
    const processedRepos = await Promise.allSettled(
      repositories.map(repo => this.processRepository(repo))
    );

    return processedRepos
      .filter((result): result is PromiseFulfilledResult<ProcessedRepository> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }

  private async processRepository(repo: GitHubRepository): Promise<ProcessedRepository> {
    // Fetch languages for this repository
    let languages: Record<string, number> = {};
    try {
      const languageResponse = await this.makeRequest<GitHubLanguage>(
        `/repos/${repo.full_name}/languages`
      );
      languages = languageResponse.data;
    } catch (error) {
      console.warn(`Failed to fetch languages for ${repo.name}:`, error);
    }

    // Fetch README if available
    let readme: string | undefined;
    try {
      const readmeResponse = await this.makeRequest<GitHubReadme>(
        `/repos/${repo.full_name}/readme`
      );
      if (readmeResponse.data.content) {
        readme = atob(readmeResponse.data.content);
      }
    } catch (error) {
      // README not found or not accessible, that's OK
      readme = undefined;
    }

    return {
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      languages,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      issues: repo.open_issues_count,
      topics: repo.topics || [],
      lastUpdated: new Date(repo.updated_at),
      created: new Date(repo.created_at),
      homepage: repo.homepage,
      ...(readme && { readme }),
      license: repo.license?.name || null,
      isArchived: repo.archived,
      size: repo.size
    };
  }

  async getRepositoryCommits(
    repoName: string, 
    since?: Date, 
    until?: Date
  ): Promise<GitHubCommit[]> {
    const params = new URLSearchParams({
      per_page: '100'
    });
    
    if (since) {
      params.set('since', since.toISOString());
    }
    
    if (until) {
      params.set('until', until.toISOString());
    }

    const response = await this.makeRequest<GitHubCommit[]>(
      `/repos/${this.config.username}/${repoName}/commits?${params}`
    );
    
    return response.data;
  }

  async getCommitActivity(repositories: ProcessedRepository[]): Promise<CommitActivity[]> {
    const activities: CommitActivity[] = [];
    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);

    await Promise.allSettled(
      repositories.slice(0, 20).map(async (repo) => { // Limit to prevent API overuse
        try {
          const commits = await this.getRepositoryCommits(repo.name, sixMonthsAgo);
          
          const commitsByDate = new Map<string, number>();
          
          commits.forEach(commit => {
            const authorDate = commit.commit.author?.date;
            if (authorDate) {
              const date = authorDate.split('T')[0];
              if (date) {
                commitsByDate.set(date, (commitsByDate.get(date) || 0) + 1);
              }
            }
          });

          commitsByDate.forEach((count, date) => {
            activities.push({
              date,
              count,
              repository: repo.name
            });
          });
        } catch (error) {
          console.warn(`Failed to fetch commits for ${repo.name}:`, error);
        }
      })
    );

    return activities.sort((a, b) => a.date.localeCompare(b.date));
  }

  async getLanguageStats(repositories: ProcessedRepository[]): Promise<LanguageStats[]> {
    const languageMap = new Map<string, { bytes: number; repos: Set<string> }>();
    let totalBytes = 0;

    repositories.forEach(repo => {
      Object.entries(repo.languages).forEach(([language, bytes]) => {
        const current = languageMap.get(language) || { bytes: 0, repos: new Set() };
        current.bytes += bytes;
        current.repos.add(repo.name);
        languageMap.set(language, current);
        totalBytes += bytes;
      });
    });

    return Array.from(languageMap.entries())
      .map(([language, data]) => ({
        language,
        bytes: data.bytes,
        percentage: (data.bytes / totalBytes) * 100,
        repositories: Array.from(data.repos)
      }))
      .sort((a, b) => b.bytes - a.bytes);
  }

  async getGitHubStats(): Promise<GitHubStats> {
    const repositories = await this.getUserRepositories();
    const [commitActivity, languageStats] = await Promise.all([
      this.getCommitActivity(repositories),
      this.getLanguageStats(repositories)
    ]);

    const totalStars = repositories.reduce((sum, repo) => sum + repo.stars, 0);
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forks, 0);
    const totalCommits = commitActivity.reduce((sum, activity) => sum + activity.count, 0);

    const mostActiveRepo = repositories
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())[0];

    const lastActivity = repositories.length > 0 
      ? repositories.reduce((latest, repo) => 
          repo.lastUpdated > latest ? repo.lastUpdated : latest, 
          repositories[0]!.lastUpdated
        )
      : new Date();

    return {
      totalRepositories: repositories.length,
      totalStars,
      totalForks,
      totalCommits,
      languageStats,
      commitActivity,
      mostActiveRepository: mostActiveRepo?.name || '',
      lastActivityDate: lastActivity
    };
  }

  async getUserProfile(): Promise<GitHubUser> {
    const response = await this.makeRequest<GitHubUser>(`/users/${this.config.username}`);
    return response.data;
  }

  // Clear cache - useful for development or manual refresh
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache stats for debugging
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Check rate limit status
  async getRateLimit(): Promise<any> {
    const response = await this.makeRequest<any>('/rate_limit');
    return response.data;
  }
}

// Default instance for the portfolio
const githubService = new GitHubService({
  username: 'Shivam-Bhardwaj',
  // Token would be set via environment variable in production
  ...(process.env.GITHUB_TOKEN && { token: process.env.GITHUB_TOKEN }),
  cacheDurationMs: 10 * 60 * 1000, // 10 minutes for portfolio use
  includeArchived: false,
  includePrivate: false
});

export default githubService;
export { GitHubService };