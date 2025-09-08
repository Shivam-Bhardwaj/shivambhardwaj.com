import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '@/services/github';

// Initialize GitHub service for API routes
const githubService = new GitHubService({
  username: 'Shivam-Bhardwaj',
  ...(process.env.GITHUB_TOKEN && { token: process.env.GITHUB_TOKEN }),
  cacheDurationMs: 15 * 60 * 1000, // 15 minutes cache for API routes
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const repo = searchParams.get('repo');

  try {
    switch (endpoint) {
      case 'repositories':
        const repositories = await githubService.getUserRepositories();
        return NextResponse.json(repositories);

      case 'stats':
        const stats = await githubService.getGitHubStats();
        return NextResponse.json(stats);

      case 'user':
        const user = await githubService.getUserProfile();
        return NextResponse.json(user);

      case 'commits':
        if (!repo) {
          return NextResponse.json(
            { error: 'Repository name is required for commits endpoint' }, 
            { status: 400 }
          );
        }
        const since = searchParams.get('since');
        const until = searchParams.get('until');
        
        const sinceDate = since ? new Date(since) : undefined;
        const untilDate = until ? new Date(until) : undefined;
        
        const commits = await githubService.getRepositoryCommits(repo, sinceDate, untilDate);
        return NextResponse.json(commits);

      case 'rate-limit':
        const rateLimit = await githubService.getRateLimit();
        return NextResponse.json(rateLimit);

      case 'cache-stats':
        const cacheStats = githubService.getCacheStats();
        return NextResponse.json(cacheStats);

      default:
        return NextResponse.json(
          { error: 'Invalid endpoint. Available: repositories, stats, user, commits, rate-limit, cache-stats' }, 
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('GitHub API error:', error);
    
    // Return appropriate error response
    const statusCode = error.status || 500;
    const message = error.message || 'Internal server error';
    
    return NextResponse.json(
      { 
        error: message,
        status: statusCode,
        timestamp: new Date().toISOString()
      }, 
      { status: statusCode }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'clear-cache':
        githubService.clearCache();
        return NextResponse.json({ success: true, message: 'Cache cleared' });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available: clear-cache' }, 
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('GitHub API action error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' }, 
      { status: 500 }
    );
  }
}