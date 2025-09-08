import portfolioData from './data';
import type { Project, Experience, AboutSection } from '@/types/portfolio';

/**
 * Lightweight accessors for portfolio data (projects, experience & about)
 */
export const getProjects = (): Project[] => [...portfolioData.projects].sort((a, b) => (a.priority || 999) - (b.priority || 999));
export const getFeaturedProjects = (): Project[] => getProjects().filter(p => p.featured);
export const findProject = (slug: string): Project | undefined => portfolioData.projects.find(p => p.slug === slug);
export const getExperience = (): Experience[] => [...portfolioData.experience].sort((a, b) => (a.priority || 999) - (b.priority || 999));
export const getAbout = (): AboutSection | undefined => portfolioData.about;
export const portfolioGeneratedAt = portfolioData.generatedAt;
