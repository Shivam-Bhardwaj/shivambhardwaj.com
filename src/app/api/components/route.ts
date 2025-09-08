import { NextRequest, NextResponse } from 'next/server';
import { componentRegistry } from '../../../lib/components/registry';
import { registerAllComponents } from '../../../lib/components/loader';

registerAllComponents();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const enabled = searchParams.get('enabled') === 'true';

    let components = componentRegistry.getAll();

    if (category) {
      components = componentRegistry.getByCategory(category as any);
    }

    if (enabled) {
      components = components.filter(config => config.isEnabled !== false);
    }

    return NextResponse.json({
      success: true,
      data: components,
      meta: {
        total: components.length,
        categories: Array.from(new Set(components.map(c => c.category))),
      },
    });
  } catch (error) {
    console.error('Error fetching components:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch components' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Component ID is required' },
        { status: 400 }
      );
    }

    if (!componentRegistry.exists(id)) {
      return NextResponse.json(
        { success: false, error: 'Component not found' },
        { status: 404 }
      );
    }

    componentRegistry.update(id, updates);

    return NextResponse.json({
      success: true,
      data: componentRegistry.getConfig(id),
    });
  } catch (error) {
    console.error('Error updating component:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update component' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { components } = body;

    if (!Array.isArray(components)) {
      return NextResponse.json(
        { success: false, error: 'Components array is required' },
        { status: 400 }
      );
    }

    const results = [];
    for (const { id, updates } of components) {
      if (componentRegistry.exists(id)) {
        componentRegistry.update(id, updates);
        results.push({
          id,
          success: true,
          config: componentRegistry.getConfig(id),
        });
      } else {
        results.push({
          id,
          success: false,
          error: 'Component not found',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error batch updating components:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to batch update components' },
      { status: 500 }
    );
  }
}