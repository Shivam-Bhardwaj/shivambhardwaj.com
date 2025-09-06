import { logger } from '@/lib/logging';
import { config } from '@/config';

// Core portfolio types
export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: ProjectCategory;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  technologies: Technology[];
  skills: Skill[];
  media: ProjectMedia[];
  links: ProjectLink[];
  metrics: ProjectMetrics;
  challenges: string[];
  achievements: string[];
  lessons: string[];
  tags: string[];
  featured: boolean;
  visible: boolean;
  order: number;
  client?: string;
  team?: TeamMember[];
  budget?: ProjectBudget;
  timeline?: ProjectTimeline[];
}

export interface Technology {
  id: string;
  name: string;
  category: TechCategory;
  proficiencyLevel: 1 | 2 | 3 | 4 | 5;
  yearsOfExperience: number;
  lastUsed: string;
  icon?: string;
  color?: string;
  description?: string;
  certifications?: string[];
  projects?: string[]; // Project IDs
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  description?: string;
  endorsements?: number;
  verifications?: SkillVerification[];
  relatedSkills?: string[];
  projects?: string[];
}

export interface ProjectMedia {
  id: string;
  type: 'image' | 'video' | 'document' | 'demo' | 'code';
  url: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  caption?: string;
  order: number;
  metadata?: Record<string, any>;
}

export interface ProjectLink {
  type: 'github' | 'demo' | 'documentation' | 'article' | 'video' | 'other';
  url: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface ProjectMetrics {
  complexity: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  innovation: 1 | 2 | 3 | 4 | 5;
  teamSize: number;
  duration: number; // days
  linesOfCode?: number;
  commits?: number;
  contributors?: number;
  issues?: number;
  pullRequests?: number;
  stars?: number;
  forks?: number;
  downloads?: number;
  users?: number;
  revenue?: number;
  costSavings?: number;
  performanceGain?: number;
  userSatisfaction?: number;
  businessValue?: number;
  technicalDebt?: number;
  testCoverage?: number;
  accessibility?: number;
  security?: number;
}

export interface TeamMember {
  name: string;
  role: string;
  avatar?: string;
  linkedin?: string;
  github?: string;
  contribution?: string;
}

export interface ProjectBudget {
  total: number;
  currency: string;
  breakdown: {
    development: number;
    design: number;
    testing: number;
    deployment: number;
    maintenance: number;
    other: number;
  };
}

export interface ProjectTimeline {
  phase: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'in-progress' | 'delayed' | 'cancelled';
  milestones: string[];
  deliverables: string[];
}

export interface SkillVerification {
  type: 'certification' | 'project' | 'endorsement' | 'test';
  title: string;
  issuer: string;
  date: string;
  url?: string;
  score?: number;
}

// Enums
export type ProjectCategory = 
  | 'robotics' 
  | 'ai-ml' 
  | 'web-development' 
  | 'mobile-development'
  | 'embedded-systems'
  | 'data-science'
  | 'devops'
  | 'research'
  | 'automation'
  | 'iot'
  | 'blockchain'
  | 'game-development'
  | 'other';

export type ProjectStatus = 
  | 'planning'
  | 'in-progress' 
  | 'completed' 
  | 'on-hold' 
  | 'cancelled'
  | 'maintenance';

export type TechCategory = 
  | 'programming-language'
  | 'framework'
  | 'library'
  | 'database'
  | 'cloud-service'
  | 'tool'
  | 'platform'
  | 'hardware'
  | 'protocol'
  | 'methodology';

export type SkillCategory = 
  | 'technical'
  | 'soft-skills'
  | 'leadership'
  | 'communication'
  | 'analytical'
  | 'creative'
  | 'management'
  | 'domain-knowledge';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

/**
 * Portfolio Management System
 */
export class PortfolioManager {
  private projects: Map<string, Project> = new Map();
  private technologies: Map<string, Technology> = new Map();
  private skills: Map<string, Skill> = new Map();
  private analytics: PortfolioAnalytics;

  constructor() {
    this.analytics = new PortfolioAnalytics();
    this.loadDefaultData();
    logger.info('PortfolioManager initialized');
  }

  // Project Management
  addProject(project: Omit<Project, 'id'>): Project {
    const id = this.generateId();
    const newProject: Project = { ...project, id };
    this.projects.set(id, newProject);
    
    logger.info('Project added', { projectId: id, title: project.title });
    return newProject;
  }

  updateProject(id: string, updates: Partial<Project>): Project | null {
    const project = this.projects.get(id);
    if (!project) {
      logger.warn('Project not found for update', { projectId: id });
      return null;
    }

    const updatedProject = { ...project, ...updates };
    this.projects.set(id, updatedProject);
    
    logger.info('Project updated', { projectId: id });
    return updatedProject;
  }

  deleteProject(id: string): boolean {
    const deleted = this.projects.delete(id);
    if (deleted) {
      logger.info('Project deleted', { projectId: id });
    }
    return deleted;
  }

  getProject(id: string): Project | null {
    return this.projects.get(id) || null;
  }

  getAllProjects(): Project[] {
    return Array.from(this.projects.values()).sort((a, b) => a.order - b.order);
  }

  getFeaturedProjects(): Project[] {
    return this.getAllProjects().filter(project => project.featured && project.visible);
  }

  getProjectsByCategory(category: ProjectCategory): Project[] {
    return this.getAllProjects().filter(project => project.category === category && project.visible);
  }

  getProjectsByStatus(status: ProjectStatus): Project[] {
    return this.getAllProjects().filter(project => project.status === status);
  }

  getProjectsByTechnology(technologyId: string): Project[] {
    return this.getAllProjects().filter(project => 
      project.technologies.some(tech => tech.id === technologyId) && project.visible
    );
  }

  // Technology Management
  addTechnology(technology: Omit<Technology, 'id'>): Technology {
    const id = this.generateId();
    const newTechnology: Technology = { ...technology, id };
    this.technologies.set(id, newTechnology);
    
    logger.info('Technology added', { technologyId: id, name: technology.name });
    return newTechnology;
  }

  updateTechnology(id: string, updates: Partial<Technology>): Technology | null {
    const technology = this.technologies.get(id);
    if (!technology) return null;

    const updatedTechnology = { ...technology, ...updates };
    this.technologies.set(id, updatedTechnology);
    
    return updatedTechnology;
  }

  getAllTechnologies(): Technology[] {
    return Array.from(this.technologies.values());
  }

  getTechnologiesByCategory(category: TechCategory): Technology[] {
    return this.getAllTechnologies().filter(tech => tech.category === category);
  }

  getTopTechnologies(limit: number = 10): Technology[] {
    return this.getAllTechnologies()
      .sort((a, b) => {
        // Sort by proficiency level, years of experience, and project count
        const scoreA = a.proficiencyLevel * 10 + a.yearsOfExperience + (a.projects?.length || 0);
        const scoreB = b.proficiencyLevel * 10 + b.yearsOfExperience + (b.projects?.length || 0);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  // Skill Management
  addSkill(skill: Omit<Skill, 'id'>): Skill {
    const id = this.generateId();
    const newSkill: Skill = { ...skill, id };
    this.skills.set(id, newSkill);
    
    return newSkill;
  }

  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  getSkillsByCategory(category: SkillCategory): Skill[] {
    return this.getAllSkills().filter(skill => skill.category === category);
  }

  // Analytics and Metrics
  getPortfolioMetrics(): PortfolioMetrics {
    const projects = this.getAllProjects();
    const technologies = this.getAllTechnologies();
    const skills = this.getAllSkills();

    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const inProgressProjects = projects.filter(p => p.status === 'in-progress').length;
    
    const totalLinesOfCode = projects.reduce((sum, p) => sum + (p.metrics.linesOfCode || 0), 0);
    const totalCommits = projects.reduce((sum, p) => sum + (p.metrics.commits || 0), 0);
    
    const avgComplexity = projects.reduce((sum, p) => sum + p.metrics.complexity, 0) / totalProjects;
    const avgImpact = projects.reduce((sum, p) => sum + p.metrics.impact, 0) / totalProjects;
    
    const categories = this.getProjectCategoryDistribution();
    const techStack = this.getTechnologyDistribution();
    
    return {
      totalProjects,
      completedProjects,
      inProgressProjects,
      totalLinesOfCode,
      totalCommits,
      avgComplexity,
      avgImpact,
      categories,
      techStack,
      skills: skills.length,
      technologies: technologies.length,
      yearsOfExperience: this.calculateYearsOfExperience(),
      completionRate: (completedProjects / totalProjects) * 100
    };
  }

  getProjectCategoryDistribution(): Record<ProjectCategory, number> {
    const distribution: Record<string, number> = {};
    
    this.getAllProjects().forEach(project => {
      distribution[project.category] = (distribution[project.category] || 0) + 1;
    });
    
    return distribution as Record<ProjectCategory, number>;
  }

  getTechnologyDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    this.getAllProjects().forEach(project => {
      project.technologies.forEach(tech => {
        distribution[tech.name] = (distribution[tech.name] || 0) + 1;
      });
    });
    
    return distribution;
  }

  // Search and Filter
  searchProjects(query: string): Project[] {
    const lowercaseQuery = query.toLowerCase();
    
    return this.getAllProjects().filter(project => {
      return project.title.toLowerCase().includes(lowercaseQuery) ||
             project.description.toLowerCase().includes(lowercaseQuery) ||
             project.technologies.some(tech => tech.name.toLowerCase().includes(lowercaseQuery)) ||
             project.skills.some(skill => skill.name.toLowerCase().includes(lowercaseQuery)) ||
             project.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery));
    });
  }

  filterProjects(filters: ProjectFilter): Project[] {
    return this.getAllProjects().filter(project => {
      if (filters.categories && !filters.categories.includes(project.category)) return false;
      if (filters.statuses && !filters.statuses.includes(project.status)) return false;
      if (filters.technologies && !filters.technologies.some(tech => 
        project.technologies.some(pTech => pTech.id === tech))) return false;
      if (filters.minComplexity && project.metrics.complexity < filters.minComplexity) return false;
      if (filters.maxComplexity && project.metrics.complexity > filters.maxComplexity) return false;
      if (filters.minImpact && project.metrics.impact < filters.minImpact) return false;
      if (filters.maxImpact && project.metrics.impact > filters.maxImpact) return false;
      if (filters.featured !== undefined && project.featured !== filters.featured) return false;
      
      return true;
    });
  }

  // Utility Methods
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private calculateYearsOfExperience(): number {
    const projects = this.getAllProjects();
    if (projects.length === 0) return 0;
    
    const earliestProject = projects.reduce((earliest, project) => {
      return new Date(project.startDate) < new Date(earliest.startDate) ? project : earliest;
    });
    
    const startYear = new Date(earliestProject.startDate).getFullYear();
    const currentYear = new Date().getFullYear();
    
    return currentYear - startYear + 1;
  }

  private loadDefaultData(): void {
    // Load sample projects, technologies, and skills
    this.loadSampleProjects();
    this.loadSampleTechnologies();
    this.loadSampleSkills();
  }

  private loadSampleProjects(): void {
    const sampleProjects: Omit<Project, 'id'>[] = [
      {
        title: 'Advanced Robotics Control System',
        description: 'Real-time control system for 6-DOF robotic manipulator with advanced kinematics',
        longDescription: 'Developed a comprehensive control system for industrial robotic arms featuring forward and inverse kinematics calculations, trajectory planning, and collision avoidance. The system processes sensor data in real-time and provides smooth, accurate motion control.',
        category: 'robotics',
        status: 'completed',
        startDate: '2024-01-15',
        endDate: '2024-06-30',
        technologies: [],
        skills: [],
        media: [],
        links: [
          { type: 'github', url: 'https://github.com/example/robotics-control', title: 'Source Code' },
          { type: 'demo', url: 'https://demo.example.com', title: 'Live Demo' }
        ],
        metrics: {
          complexity: 5,
          impact: 4,
          innovation: 5,
          teamSize: 3,
          duration: 167,
          linesOfCode: 15000,
          commits: 245,
          contributors: 3,
          testCoverage: 85,
          performanceGain: 40
        },
        challenges: [
          'Real-time constraint satisfaction',
          'Complex inverse kinematics calculations',
          'Sensor fusion and noise filtering'
        ],
        achievements: [
          'Achieved sub-millisecond response times',
          'Implemented advanced trajectory optimization',
          'Reduced positioning errors by 60%'
        ],
        lessons: [
          'Importance of thorough testing in robotics systems',
          'Value of modular architecture for complex systems'
        ],
        tags: ['robotics', 'real-time', 'control-systems', 'kinematics'],
        featured: true,
        visible: true,
        order: 1
      },
      {
        title: 'Swarm Intelligence Simulation Platform',
        description: 'Interactive web platform for simulating and analyzing swarm behavior algorithms',
        longDescription: 'Built a comprehensive simulation platform for studying swarm intelligence algorithms including boids flocking, particle swarm optimization, and ant colony optimization. Features real-time visualization, parameter tuning, and performance analysis.',
        category: 'ai-ml',
        status: 'completed',
        startDate: '2023-08-01',
        endDate: '2023-12-15',
        technologies: [],
        skills: [],
        media: [],
        links: [
          { type: 'demo', url: 'https://swarm-sim.example.com', title: 'Live Simulation' },
          { type: 'github', url: 'https://github.com/example/swarm-sim', title: 'Source Code' }
        ],
        metrics: {
          complexity: 4,
          impact: 3,
          innovation: 4,
          teamSize: 2,
          duration: 137,
          linesOfCode: 12000,
          commits: 189,
          contributors: 2,
          users: 500,
          testCoverage: 78
        },
        challenges: [
          'Performance optimization for large swarms',
          'Real-time rendering of thousands of agents',
          'Intuitive user interface design'
        ],
        achievements: [
          'Support for 1000+ simultaneous agents',
          'Published research paper on findings',
          'Used in educational institutions'
        ],
        lessons: [
          'Importance of performance profiling',
          'User experience crucial for educational tools'
        ],
        tags: ['swarm-intelligence', 'simulation', 'visualization', 'ai'],
        featured: true,
        visible: true,
        order: 2
      }
    ];

    sampleProjects.forEach(project => this.addProject(project));
  }

  private loadSampleTechnologies(): void {
    const sampleTechnologies: Omit<Technology, 'id'>[] = [
      {
        name: 'TypeScript',
        category: 'programming-language',
        proficiencyLevel: 5,
        yearsOfExperience: 4,
        lastUsed: '2024-12-01',
        description: 'Strongly typed JavaScript for scalable applications'
      },
      {
        name: 'React',
        category: 'framework',
        proficiencyLevel: 5,
        yearsOfExperience: 5,
        lastUsed: '2024-12-01',
        description: 'Component-based UI library for web applications'
      },
      {
        name: 'Next.js',
        category: 'framework',
        proficiencyLevel: 4,
        yearsOfExperience: 3,
        lastUsed: '2024-12-01',
        description: 'Full-stack React framework with SSR and optimization'
      },
      {
        name: 'Python',
        category: 'programming-language',
        proficiencyLevel: 5,
        yearsOfExperience: 6,
        lastUsed: '2024-11-15',
        description: 'Versatile programming language for AI, web, and automation'
      },
      {
        name: 'ROS (Robot Operating System)',
        category: 'platform',
        proficiencyLevel: 4,
        yearsOfExperience: 3,
        lastUsed: '2024-10-30',
        description: 'Robotics middleware for distributed computing'
      }
    ];

    sampleTechnologies.forEach(technology => this.addTechnology(technology));
  }

  private loadSampleSkills(): void {
    const sampleSkills: Omit<Skill, 'id'>[] = [
      {
        name: 'System Architecture',
        category: 'technical',
        level: 'expert',
        description: 'Designing scalable and maintainable software architectures'
      },
      {
        name: 'Team Leadership',
        category: 'leadership',
        level: 'advanced',
        description: 'Leading technical teams and managing project delivery'
      },
      {
        name: 'Algorithm Design',
        category: 'analytical',
        level: 'expert',
        description: 'Creating efficient algorithms for complex problems'
      }
    ];

    sampleSkills.forEach(skill => this.addSkill(skill));
  }
}

// Supporting interfaces
export interface PortfolioMetrics {
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  totalLinesOfCode: number;
  totalCommits: number;
  avgComplexity: number;
  avgImpact: number;
  categories: Record<ProjectCategory, number>;
  techStack: Record<string, number>;
  skills: number;
  technologies: number;
  yearsOfExperience: number;
  completionRate: number;
}

export interface ProjectFilter {
  categories?: ProjectCategory[];
  statuses?: ProjectStatus[];
  technologies?: string[];
  minComplexity?: number;
  maxComplexity?: number;
  minImpact?: number;
  maxImpact?: number;
  featured?: boolean;
}

/**
 * Analytics system for portfolio insights
 */
export class PortfolioAnalytics {
  private events: AnalyticsEvent[] = [];

  trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): void {
    const analyticsEvent: AnalyticsEvent = {
      id: Math.random().toString(36).substring(2),
      timestamp: new Date().toISOString(),
      ...event
    };

    this.events.push(analyticsEvent);
    
    // Keep only last 1000 events to prevent memory issues
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    if (config.features.analytics) {
      logger.info('Analytics event tracked', { event: analyticsEvent });
    }
  }

  getEventsByType(type: string): AnalyticsEvent[] {
    return this.events.filter(event => event.type === type);
  }

  getEventsInTimeRange(startDate: string, endDate: string): AnalyticsEvent[] {
    return this.events.filter(event => 
      event.timestamp >= startDate && event.timestamp <= endDate
    );
  }

  getMostViewedProjects(limit: number = 10): { projectId: string; views: number }[] {
    const viewCounts: Record<string, number> = {};
    
    this.events
      .filter(event => event.type === 'project_view' && event.projectId)
      .forEach(event => {
        if (event.projectId) {
          viewCounts[event.projectId] = (viewCounts[event.projectId] || 0) + 1;
        }
      });

    return Object.entries(viewCounts)
      .map(([projectId, views]) => ({ projectId, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  getEngagementMetrics(): EngagementMetrics {
    const totalEvents = this.events.length;
    const uniqueUsers = new Set(this.events.map(e => e.userId).filter(Boolean)).size;
    const avgSessionLength = this.calculateAverageSessionLength();
    const bounceRate = this.calculateBounceRate();

    return {
      totalEvents,
      uniqueUsers,
      avgSessionLength,
      bounceRate,
      mostActiveHour: this.getMostActiveHour(),
      topPages: this.getTopPages()
    };
  }

  private calculateAverageSessionLength(): number {
    // Simplified calculation - would be more complex in a real implementation
    const sessions = this.groupEventsBySession();
    if (sessions.length === 0) return 0;

    const totalDuration = sessions.reduce((sum, session) => {
      const start = new Date(session[0].timestamp).getTime();
      const end = new Date(session[session.length - 1].timestamp).getTime();
      return sum + (end - start);
    }, 0);

    return totalDuration / sessions.length;
  }

  private calculateBounceRate(): number {
    const sessions = this.groupEventsBySession();
    const singleEventSessions = sessions.filter(session => session.length === 1).length;
    return sessions.length > 0 ? (singleEventSessions / sessions.length) * 100 : 0;
  }

  private getMostActiveHour(): number {
    const hourCounts: Record<number, number> = {};
    
    this.events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    let maxHour = 0;
    let maxCount = 0;
    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxHour = parseInt(hour);
      }
    });

    return maxHour;
  }

  private getTopPages(): { page: string; views: number }[] {
    const pageCounts: Record<string, number> = {};
    
    this.events
      .filter(event => event.page)
      .forEach(event => {
        if (event.page) {
          pageCounts[event.page] = (pageCounts[event.page] || 0) + 1;
        }
      });

    return Object.entries(pageCounts)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }

  private groupEventsBySession(): AnalyticsEvent[][] {
    // Simplified session grouping by userId - would be more sophisticated in practice
    const sessionMap: Record<string, AnalyticsEvent[]> = {};
    
    this.events.forEach(event => {
      const sessionKey = event.userId || event.sessionId || 'anonymous';
      if (!sessionMap[sessionKey]) {
        sessionMap[sessionKey] = [];
      }
      sessionMap[sessionKey].push(event);
    });

    return Object.values(sessionMap);
  }
}

export interface AnalyticsEvent {
  id: string;
  type: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  projectId?: string;
  page?: string;
  metadata?: Record<string, any>;
}

export interface EngagementMetrics {
  totalEvents: number;
  uniqueUsers: number;
  avgSessionLength: number;
  bounceRate: number;
  mostActiveHour: number;
  topPages: { page: string; views: number }[];
}

// Export singleton instance
export const portfolioManager = new PortfolioManager();