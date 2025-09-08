interface ContentItem {
  id: string;
  type: 'zone' | 'page' | 'section';
  title: string;
  content: any;
  components: string[];
  metadata: Record<string, any>;
  version: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ContentQuery {
  type?: string;
  published?: boolean;
  tags?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

class ContentManager {
  private content = new Map<string, ContentItem>();
  private contentVersions = new Map<string, ContentItem[]>();

  constructor() {
    this.seedInitialContent();
  }

  async create(item: Omit<ContentItem, 'id' | 'version' | 'createdAt' | 'updatedAt'>): Promise<ContentItem> {
    const newItem: ContentItem = {
      ...item,
      id: item.id || `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.content.set(newItem.id, newItem);
    this.contentVersions.set(newItem.id, [newItem]);

    return newItem;
  }

  async update(id: string, updates: Partial<ContentItem>): Promise<ContentItem | null> {
    const existing = this.content.get(id);
    if (!existing) {
      return null;
    }

    const updated: ContentItem = {
      ...existing,
      ...updates,
      id: existing.id, // Preserve ID
      version: existing.version + 1,
      createdAt: existing.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    this.content.set(id, updated);
    
    const versions = this.contentVersions.get(id) || [];
    versions.push(updated);
    this.contentVersions.set(id, versions);

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = this.content.delete(id);
    if (deleted) {
      this.contentVersions.delete(id);
    }
    return deleted;
  }

  async findById(id: string): Promise<ContentItem | null> {
    return this.content.get(id) || null;
  }

  async find(query: ContentQuery = {}): Promise<{
    items: ContentItem[];
    total: number;
    pagination: { limit: number; offset: number; hasMore: boolean };
  }> {
    let items = Array.from(this.content.values());

    // Apply filters
    if (query.type) {
      items = items.filter(item => item.type === query.type);
    }

    if (query.published !== undefined) {
      items = items.filter(item => item.isPublished === query.published);
    }

    if (query.tags && query.tags.length > 0) {
      items = items.filter(item => 
        query.tags!.some(tag => 
          item.metadata.tags && item.metadata.tags.includes(tag)
        )
      );
    }

    // Apply sorting
    const sortBy = query.sortBy || 'updatedAt';
    const sortOrder = query.sortOrder || 'desc';

    items.sort((a, b) => {
      let aValue: any = a[sortBy as keyof ContentItem];
      let bValue: any = b[sortBy as keyof ContentItem];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    const total = items.length;
    const limit = query.limit || 10;
    const offset = query.offset || 0;

    const paginatedItems = items.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      items: paginatedItems,
      total,
      pagination: {
        limit,
        offset,
        hasMore,
      },
    };
  }

  async getVersions(id: string): Promise<ContentItem[]> {
    return this.contentVersions.get(id) || [];
  }

  async restoreVersion(id: string, version: number): Promise<ContentItem | null> {
    const versions = this.contentVersions.get(id);
    if (!versions) {
      return null;
    }

    const targetVersion = versions.find(v => v.version === version);
    if (!targetVersion) {
      return null;
    }

    const restored = await this.update(id, {
      ...targetVersion,
      version: undefined, // Will be incremented by update method
    });

    return restored;
  }

  async publish(id: string): Promise<ContentItem | null> {
    return this.update(id, { isPublished: true });
  }

  async unpublish(id: string): Promise<ContentItem | null> {
    return this.update(id, { isPublished: false });
  }

  async getStats(): Promise<{
    total: number;
    published: number;
    types: Record<string, number>;
    recentUpdates: ContentItem[];
  }> {
    const items = Array.from(this.content.values());
    
    const types: Record<string, number> = {};
    items.forEach(item => {
      types[item.type] = (types[item.type] || 0) + 1;
    });

    const recentUpdates = items
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);

    return {
      total: items.length,
      published: items.filter(item => item.isPublished).length,
      types,
      recentUpdates,
    };
  }

  private seedInitialContent(): void {
    const initialContent: ContentItem[] = [
      {
        id: 'home-hero',
        type: 'zone',
        title: 'Homepage Hero Section',
        content: {
          title: 'Robotics Engineer & Systems Developer',
          subtitle: 'Building autonomous systems and intelligent machines',
          ctaText: 'Explore Projects',
          ctaLink: '/projects',
        },
        components: ['animated-text', 'robot-swarm', 'particle-background'],
        metadata: {
          priority: 1,
          location: 'homepage',
          tags: ['hero', 'landing'],
        },
        version: 1,
        isPublished: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'projects-grid',
        type: 'section',
        title: 'Featured Projects',
        content: {
          layout: 'masonry',
          columns: { desktop: 3, tablet: 2, mobile: 1 },
          showFilters: true,
          sortBy: 'featured',
        },
        components: ['interactive-card', 'scroll-reveal', 'magnetic-button'],
        metadata: {
          section: 'projects',
          showInNav: true,
          tags: ['projects', 'portfolio'],
        },
        version: 2,
        isPublished: true,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
      },
      {
        id: 'tech-showcase',
        type: 'section',
        title: 'Technology Stack',
        content: {
          categories: ['robotics', 'ai', 'web', 'cloud'],
          displayMode: 'interactive',
          showLogos: true,
        },
        components: ['glitch-effect', 'fluid-grid', '3d-tech-display'],
        metadata: {
          section: 'about',
          priority: 2,
          tags: ['technology', 'skills'],
        },
        version: 1,
        isPublished: true,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z',
      },
    ];

    initialContent.forEach(item => {
      this.content.set(item.id, item);
      this.contentVersions.set(item.id, [item]);
    });
  }
}

export const contentManager = new ContentManager();