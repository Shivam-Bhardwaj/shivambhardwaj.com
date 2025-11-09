import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentDirectory = path.join(process.cwd(), 'content');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  tags: string[];
  readTime: string;
}

export interface Experiment {
  slug: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  tags: string[];
  github?: string;
  demo?: string;
  content: string;
  date: string;
}

export interface LearningResource {
  slug: string;
  title: string;
  description: string;
  type: 'tutorial' | 'guide' | 'course' | 'article';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  tags: string[];
  content: string;
  date: string;
}

// Get all blog posts
export function getBlogPosts(): BlogPost[] {
  const blogDir = path.join(contentDirectory, 'blog');
  
  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const files = fs.readdirSync(blogDir);
  const posts = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const filePath = path.join(blogDir, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug: file.replace('.md', ''),
        title: data.title || '',
        date: data.date || '',
        excerpt: data.excerpt || '',
        content,
        tags: data.tags || [],
        readTime: data.readTime || '5 min',
      };
    })
    .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));

  return posts;
}

// Get single blog post
export function getBlogPost(slug: string): BlogPost | null {
  const filePath = path.join(contentDirectory, 'blog', `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title || '',
    date: data.date || '',
    excerpt: data.excerpt || '',
    content,
    tags: data.tags || [],
    readTime: data.readTime || '5 min',
  };
}

// Get all experiments
export function getExperiments(): Experiment[] {
  const expDir = path.join(contentDirectory, 'experiments');
  
  if (!fs.existsSync(expDir)) {
    return [];
  }

  const files = fs.readdirSync(expDir);
  const experiments = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const filePath = path.join(expDir, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug: file.replace('.md', ''),
        title: data.title || '',
        description: data.description || '',
        status: data.status || 'active',
        tags: data.tags || [],
        github: data.github,
        demo: data.demo,
        content,
        date: data.date || '',
      };
    })
    .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));

  return experiments;
}

// Get single experiment
export function getExperiment(slug: string): Experiment | null {
  const filePath = path.join(contentDirectory, 'experiments', `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title || '',
    description: data.description || '',
    status: data.status || 'active',
    tags: data.tags || [],
    github: data.github,
    demo: data.demo,
    content,
    date: data.date || '',
  };
}

// Get all learning resources
export function getLearningResources(): LearningResource[] {
  const learnDir = path.join(contentDirectory, 'learning');
  
  if (!fs.existsSync(learnDir)) {
    return [];
  }

  const files = fs.readdirSync(learnDir);
  const resources = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const filePath = path.join(learnDir, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug: file.replace('.md', ''),
        title: data.title || '',
        description: data.description || '',
        type: data.type || 'tutorial',
        difficulty: data.difficulty || 'beginner',
        duration: data.duration || '30 min',
        tags: data.tags || [],
        content,
        date: data.date || '',
      };
    })
    .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));

  return resources;
}

// Get single learning resource
export function getLearningResource(slug: string): LearningResource | null {
  const filePath = path.join(contentDirectory, 'learning', `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title || '',
    description: data.description || '',
    type: data.type || 'tutorial',
    difficulty: data.difficulty || 'beginner',
    duration: data.duration || '30 min',
    tags: data.tags || [],
    content,
    date: data.date || '',
  };
}

// Convert markdown to HTML
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}

