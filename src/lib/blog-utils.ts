import { BlogPost } from './blog-data';

export interface BlogPostStats {
  totalPosts: number;
  totalTags: number;
  averageReadTime: number;
  mostRecentPost: BlogPost | null;
  mostPopularTags: Array<{ tag: string; count: number }>;
  postsByMonth: Array<{ month: string; count: number }>;
}

export class BlogManager {
  private posts: BlogPost[];

  constructor(posts: BlogPost[]) {
    this.posts = posts;
  }

  /**
   * Get blog statistics
   */
  getStats(): BlogPostStats {
    if (this.posts.length === 0) {
      return {
        totalPosts: 0,
        totalTags: 0,
        averageReadTime: 0,
        mostRecentPost: null,
        mostPopularTags: [],
        postsByMonth: [],
      };
    }

    // Calculate average read time
    const readTimes = this.posts.map(post => {
      const timeStr = post.readTime.replace(' min read', '');
      return parseInt(timeStr, 10) || 0;
    });
    const averageReadTime = Math.round(
      readTimes.reduce((sum, time) => sum + time, 0) / readTimes.length
    );

    // Get most recent post
    const sortedPosts = [...this.posts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const mostRecentPost = sortedPosts[0] || null;

    // Calculate tag frequency
    const tagCounts = new Map<string, number>();
    this.posts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    const mostPopularTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Posts by month
    const monthCounts = new Map<string, number>();
    this.posts.forEach(post => {
      const date = new Date(post.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
    });

    const postsByMonth = Array.from(monthCounts.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12);

    return {
      totalPosts: this.posts.length,
      totalTags: tagCounts.size,
      averageReadTime,
      mostRecentPost,
      mostPopularTags,
      postsByMonth,
    };
  }

  /**
   * Search posts by title, content, or tags
   */
  searchPosts(query: string): BlogPost[] {
    const lowercaseQuery = query.toLowerCase();
    
    return this.posts.filter(post => 
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.excerpt.toLowerCase().includes(lowercaseQuery) ||
      post.content.toLowerCase().includes(lowercaseQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Filter posts by tag
   */
  getPostsByTag(tag: string): BlogPost[] {
    return this.posts.filter(post => 
      post.tags.some(postTag => 
        postTag.toLowerCase() === tag.toLowerCase()
      )
    );
  }

  /**
   * Get posts by date range
   */
  getPostsByDateRange(startDate: Date, endDate: Date): BlogPost[] {
    return this.posts.filter(post => {
      const postDate = new Date(post.date);
      return postDate >= startDate && postDate <= endDate;
    });
  }

  /**
   * Get related posts based on shared tags
   */
  getRelatedPosts(targetPost: BlogPost, limit: number = 3): BlogPost[] {
    const relatedPosts = this.posts
      .filter(post => post.slug !== targetPost.slug)
      .map(post => {
        const sharedTags = post.tags.filter(tag => 
          targetPost.tags.includes(tag)
        );
        return {
          post,
          relevanceScore: sharedTags.length,
        };
      })
      .filter(item => item.relevanceScore > 0)
      .sort((a, b) => {
        // Sort by relevance score first, then by date
        if (a.relevanceScore !== b.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
      })
      .slice(0, limit)
      .map(item => item.post);

    return relatedPosts;
  }

  /**
   * Generate reading time estimate
   */
  static estimateReadingTime(content: string): string {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  }

  /**
   * Generate blog post excerpt from content
   */
  static generateExcerpt(content: string, maxLength: number = 160): string {
    // Remove markdown syntax for excerpt
    const plainText = content
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .trim();

    if (plainText.length <= maxLength) {
      return plainText;
    }

    // Find the last complete sentence within the limit
    const truncated = plainText.substring(0, maxLength);
    const lastSentence = truncated.lastIndexOf('.');
    
    if (lastSentence > maxLength * 0.7) {
      return truncated.substring(0, lastSentence + 1);
    }

    // If no good sentence break, find last space
    const lastSpace = truncated.lastIndexOf(' ');
    return truncated.substring(0, lastSpace) + '...';
  }

  /**
   * Validate blog post structure
   */
  static validatePost(post: Partial<BlogPost>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!post.title?.trim()) {
      errors.push('Title is required');
    }

    if (!post.slug?.trim()) {
      errors.push('Slug is required');
    } else if (!/^[a-z0-9-]+$/.test(post.slug)) {
      errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
    }

    if (!post.date?.trim()) {
      errors.push('Date is required');
    } else if (isNaN(new Date(post.date).getTime())) {
      errors.push('Date must be a valid date');
    }

    if (!post.excerpt?.trim()) {
      errors.push('Excerpt is required');
    }

    if (!post.content?.trim()) {
      errors.push('Content is required');
    }

    if (!post.author?.trim()) {
      errors.push('Author is required');
    }

    if (!Array.isArray(post.tags) || post.tags.length === 0) {
      errors.push('At least one tag is required');
    }

    if (!post.readTime?.trim()) {
      errors.push('Read time is required');
    } else if (!/^\d+ min read$/.test(post.readTime)) {
      errors.push('Read time must be in format "X min read"');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate a URL-friendly slug from a title
   */
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Get all unique tags across all posts
   */
  getAllTags(): string[] {
    const tags = new Set<string>();
    this.posts.forEach(post => {
      post.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }

  /**
   * Get posts sorted by date (newest first)
   */
  getPostsByDate(): BlogPost[] {
    return [...this.posts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  /**
   * Get a specific post by slug
   */
  getPostBySlug(slug: string): BlogPost | null {
    return this.posts.find(post => post.slug === slug) || null;
  }
}

/**
 * Utility functions for blog operations
 */
export const blogUtils = {
  estimateReadingTime: BlogManager.estimateReadingTime,
  generateExcerpt: BlogManager.generateExcerpt,
  validatePost: BlogManager.validatePost,
  generateSlug: BlogManager.generateSlug,
};