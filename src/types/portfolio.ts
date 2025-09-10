export interface ProjectTechnology {
  name: string;
  version?: string;
  category?: 'language' | 'framework' | 'library' | 'infrastructure' | 'tool' | 'service';
}

export interface ProjectLink {
  type: 'repo' | 'demo' | 'docs' | 'article' | 'package';
  url: string;
  label?: string;
}

export interface Project {
  id: string;              // stable identifier
  slug: string;            // URL slug
  name: string;            // display name
  shortDescription: string;
  description: string;     // markdown allowed
  status: 'active' | 'archived' | 'wip';
  startDate?: string;      // ISO date
  endDate?: string;        // ISO date
  technologies: ProjectTechnology[];
  tags: string[];
  links: ProjectLink[];
  highlights?: string[];   // bullet points
  metrics?: { label: string; value: string }[];
  featured?: boolean;
  priority?: number;       // for ordering
}

export interface ExperienceRole {
  title: string;
  startDate: string; // ISO
  endDate?: string;  // ISO or undefined for current
  achievements?: string[]; // bullet points
  technologies?: string[];
  description?: string; // longer form description
  metrics?: { label: string; value: string }[]; // quantifiable achievements
}

export interface Experience {
  id: string;
  organization: string;
  location?: string;
  roles: ExperienceRole[];
  website?: string;
  industry?: string;
  summary?: string;
  tags?: string[];
  priority?: number;
}

export interface Education {
  institution: string;
  period: string;
  degree: string;
  focus: string[];
}

export interface Language {
  name: string;
  level: 'Native' | 'Professional' | 'Limited working proficiency' | 'Elementary';
}

export interface Skills {
  robotics: string[];
  programming: string[];
  frameworks: string[];
  platforms: string[];
  specialties: string[];
}

export interface AboutSection {
  summary: string;
  education: Education[];
  skills: Skills;
  achievements: string[];
  languages: Language[];
}

export interface PortfolioData {
  generatedAt: string; // ISO timestamp of last update
  projects: Project[];
  about?: AboutSection;
  experience: Experience[];
}

// Utility: create empty portfolio skeleton
export const emptyPortfolio = (): PortfolioData => ({
  generatedAt: new Date().toISOString(),
  projects: [],
  experience: [],
});
