import portfolioData from './data';
import type { Project, Experience } from '@/types/portfolio';

/**
 * Lightweight accessors for portfolio data (projects & experience)
 */
export const getProjects = (): Project[] => [...portfolioData.projects].sort((a, b) => (a.priority || 999) - (b.priority || 999));
export const getFeaturedProjects = (): Project[] => getProjects().filter(p => p.featured);
export const findProject = (slug: string): Project | undefined => portfolioData.projects.find(p => p.slug === slug);
export const getExperience = (): Experience[] => [...portfolioData.experience].sort((a, b) => (a.priority || 999) - (b.priority || 999));
export const portfolioGeneratedAt = portfolioData.generatedAt;
