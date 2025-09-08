import { NextRequest, NextResponse } from 'next/server';

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

const mockContent: ContentItem[] = [
  {
    id: 'home-hero',
    type: 'zone',
    title: 'Homepage Hero Section',
    content: {
      title: 'Robotics Engineer & Autonomous Systems Developer',
      subtitle: 'Building the future of intelligent machines',
      backgroundComponent: 'robot-swarm',
    },
    components: ['animated-text', 'robot-swarm', 'magnetic-button'],
    metadata: {
      priority: 1,
      location: 'homepage',
    },
    version: 1,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'projects-showcase',
    type: 'section',
    title: 'Projects Showcase',
    content: {
      layout: 'grid',
      columns: 3,
      projects: [
        {
          id: 'autonomous-drone',
          title: 'Autonomous Drone System',
          description: 'AI-powered navigation and obstacle avoidance',
          image: '/projects/drone.jpg',
        },
        {
          id: 'robot-arm',
          title: 'Precision Robot Arm',
          description: 'Sub-millimeter precision manufacturing',
          image: '/projects/arm.jpg',
        },
      ],
    },
    components: ['interactive-card', 'scroll-reveal', 'particle-background'],
    metadata: {
      section: 'projects',
      showInNav: true,
    },
    version: 2,
    isPublished: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const published = searchParams.get('published') === 'true';
    const id = searchParams.get('id');

    let content = [...mockContent];

    if (id) {
      const item = content.find(c => c.id === id);
      if (!item) {
        return NextResponse.json(
          { success: false, error: 'Content not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: item,
      });
    }

    if (type) {
      content = content.filter(c => c.type === type);
    }

    if (published) {
      content = content.filter(c => c.isPublished);
    }

    return NextResponse.json({
      success: true,
      data: content,
      meta: {
        total: content.length,
        types: Array.from(new Set(content.map(c => c.type))),
        published: content.filter(c => c.isPublished).length,
      },
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newContent: ContentItem = {
      id: body.id || `content-${Date.now()}`,
      type: body.type || 'section',
      title: body.title || 'Untitled',
      content: body.content || {},
      components: body.components || [],
      metadata: body.metadata || {},
      version: 1,
      isPublished: body.isPublished || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockContent.push(newContent);

    return NextResponse.json({
      success: true,
      data: newContent,
    });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create content' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    const index = mockContent.findIndex(c => c.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }

    mockContent[index] = {
      ...mockContent[index],
      ...body,
      version: mockContent[index].version + 1,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockContent[index],
    });
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Content ID is required' },
        { status: 400 }
      );
    }

    const index = mockContent.findIndex(c => c.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }

    const deleted = mockContent.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      data: deleted,
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}