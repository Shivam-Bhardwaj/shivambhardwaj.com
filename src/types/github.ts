export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  language: string | null;
  languages_url: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number;
  default_branch: string;
  topics: string[];
  visibility: 'public' | 'private';
  archived: boolean;
  disabled: boolean;
  pushed_at: string | null;
  created_at: string;
  updated_at: string;
  homepage: string | null;
  readme_url?: string;
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string | null;
  } | null;
}

export interface GitHubLanguage {
  [language: string]: number;
}

export interface GitHubCommit {
  sha: string;
  node_id: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree: {
      sha: string;
      url: string;
    };
    url: string;
    comment_count: number;
  };
  url: string;
  html_url: string;
  comments_url: string;
  author: {
    login: string;
    id: number;
    avatar_url: string;
    url: string;
    html_url: string;
  } | null;
  committer: {
    login: string;
    id: number;
    avatar_url: string;
    url: string;
    html_url: string;
  } | null;
  parents: Array<{
    sha: string;
    url: string;
    html_url: string;
  }>;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubReadme {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content: string;
  encoding: string;
}

export interface GitHubContributor {
  login: string;
  id: number;
  avatar_url: string;
  url: string;
  html_url: string;
  contributions: number;
  type: string;
}

// Processed/transformed types for our application
export interface ProcessedRepository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  language: string | null;
  languages: Record<string, number>;
  stars: number;
  forks: number;
  issues: number;
  topics: string[];
  lastUpdated: Date;
  created: Date;
  homepage: string | null;
  readme?: string;
  license: string | null;
  isArchived: boolean;
  size: number;
}

export interface CommitActivity {
  date: string;
  count: number;
  repository: string;
}

export interface LanguageStats {
  language: string;
  bytes: number;
  percentage: number;
  repositories: string[];
}

export interface GitHubStats {
  totalRepositories: number;
  totalStars: number;
  totalForks: number;
  totalCommits: number;
  languageStats: LanguageStats[];
  commitActivity: CommitActivity[];
  mostActiveRepository: string;
  lastActivityDate: Date;
}

// API Response wrapper with caching info
export interface CachedGitHubResponse<T> {
  data: T;
  timestamp: number;
  etag?: string;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

// Error types
export interface GitHubAPIError {
  message: string;
  documentation_url?: string;
  status: number;
  response?: Response;
}

// Contribution calendar types
export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

// Configuration
export interface GitHubConfig {
  username: string;
  token?: string;
  baseUrl?: string;
  cacheDurationMs?: number;
  maxRetries?: number;
  includePrivate?: boolean;
  includeArchived?: boolean;
}