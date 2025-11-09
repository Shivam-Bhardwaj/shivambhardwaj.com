// Aggregated Metrics API
// Combines data from multiple sources

import { getGitHubStats, GitHubStats } from './github'
import { getDockerStats, DockerStats } from './docker'

export interface PortfolioMetrics {
  github: GitHubStats
  docker: DockerStats
  learning: {
    technologiesLearned: number
    projectsCompleted: number
    tutorialsPublished: number
    hoursInvested: number
  }
  portfolio: {
    monthlyVisitors: number
    githubStars: number
    newsletterSubscribers: number
  }
}

export async function getPortfolioMetrics(): Promise<PortfolioMetrics> {
  const [github, docker] = await Promise.all([
    getGitHubStats(),
    getDockerStats(),
  ])

  return {
    github,
    docker,
    learning: {
      technologiesLearned: 0,
      projectsCompleted: 0,
      tutorialsPublished: 0,
      hoursInvested: 0,
    },
    portfolio: {
      monthlyVisitors: 0,
      githubStars: 0,
      newsletterSubscribers: 0,
    },
  }
}

