import { NextRequest, NextResponse } from 'next/server';

const defaultFeatures = {
  'robotics_enabled': true,
  'admin_tools': process.env.NODE_ENV === 'development',
  'experimental_ui': false,
  'performance_mode': true,
  'debug_mode': process.env.NODE_ENV === 'development',
  'analytics_enabled': process.env.NODE_ENV === 'production',
  '3d_rendering': true,
  'real_time_updates': true,
  'advanced_animations': true,
  'mobile_optimizations': true,
  'collision_detection': true,
  'swarm_intelligence': true,
  'dynamic_theming': true,
  'hot_reload': process.env.NODE_ENV === 'development',
};

const featureDefinitions = {
  'robotics_enabled': {
    name: 'Robotics System',
    description: 'Enable robot swarm background and robotics components',
    category: 'core',
    impact: 'high',
    dependencies: ['3d_rendering', 'collision_detection'],
  },
  'admin_tools': {
    name: 'Admin Tools',
    description: 'Enable administrative interfaces and debugging tools',
    category: 'admin',
    impact: 'low',
    dependencies: ['debug_mode'],
  },
  'experimental_ui': {
    name: 'Experimental UI',
    description: 'Enable experimental user interface components',
    category: 'ui',
    impact: 'medium',
    dependencies: ['advanced_animations'],
  },
  'performance_mode': {
    name: 'Performance Mode',
    description: 'Optimize for performance over visual fidelity',
    category: 'performance',
    impact: 'high',
    dependencies: [],
  },
  'debug_mode': {
    name: 'Debug Mode',
    description: 'Enable debugging information and tools',
    category: 'development',
    impact: 'low',
    dependencies: [],
  },
  'analytics_enabled': {
    name: 'Analytics',
    description: 'Enable user analytics and tracking',
    category: 'tracking',
    impact: 'low',
    dependencies: [],
  },
  '3d_rendering': {
    name: '3D Rendering',
    description: 'Enable Three.js 3D rendering capabilities',
    category: 'graphics',
    impact: 'high',
    dependencies: [],
  },
  'real_time_updates': {
    name: 'Real-time Updates',
    description: 'Enable real-time content and component updates',
    category: 'performance',
    impact: 'medium',
    dependencies: [],
  },
  'advanced_animations': {
    name: 'Advanced Animations',
    description: 'Enable complex animations and transitions',
    category: 'ui',
    impact: 'medium',
    dependencies: [],
  },
  'mobile_optimizations': {
    name: 'Mobile Optimizations',
    description: 'Enable mobile-specific optimizations',
    category: 'performance',
    impact: 'medium',
    dependencies: ['performance_mode'],
  },
  'collision_detection': {
    name: 'Collision Detection',
    description: 'Enable physics-based collision detection',
    category: 'physics',
    impact: 'medium',
    dependencies: ['3d_rendering'],
  },
  'swarm_intelligence': {
    name: 'Swarm Intelligence',
    description: 'Enable advanced swarm AI behaviors',
    category: 'ai',
    impact: 'high',
    dependencies: ['robotics_enabled', 'collision_detection'],
  },
  'dynamic_theming': {
    name: 'Dynamic Theming',
    description: 'Enable real-time theme customization',
    category: 'ui',
    impact: 'low',
    dependencies: [],
  },
  'hot_reload': {
    name: 'Hot Reload',
    description: 'Enable hot reloading of components',
    category: 'development',
    impact: 'low',
    dependencies: ['debug_mode'],
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const enabled = searchParams.get('enabled');

    let features = { ...defaultFeatures };
    let definitions = { ...featureDefinitions };

    if (category) {
      const filteredDefinitions: typeof definitions = {};
      Object.entries(definitions).forEach(([key, def]) => {
        if (def.category === category) {
          filteredDefinitions[key] = def;
        }
      });
      definitions = filteredDefinitions;
      
      const filteredFeatures: typeof features = {};
      Object.keys(filteredDefinitions).forEach(key => {
        filteredFeatures[key] = features[key];
      });
      features = filteredFeatures;
    }

    if (enabled !== null) {
      const isEnabled = enabled === 'true';
      const filteredFeatures: typeof features = {};
      Object.entries(features).forEach(([key, value]) => {
        if (value === isEnabled) {
          filteredFeatures[key] = value;
        }
      });
      features = filteredFeatures;
      
      const filteredDefinitions: typeof definitions = {};
      Object.keys(features).forEach(key => {
        if (definitions[key]) {
          filteredDefinitions[key] = definitions[key];
        }
      });
      definitions = filteredDefinitions;
    }

    const response = Object.entries(features).map(([key, enabled]) => ({
      key,
      enabled,
      definition: definitions[key] || {
        name: key,
        description: `Feature flag: ${key}`,
        category: 'unknown',
        impact: 'low',
        dependencies: [],
      },
    }));

    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        total: response.length,
        enabled: response.filter(f => f.enabled).length,
        categories: Array.from(new Set(response.map(f => f.definition.category))),
      },
    });
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feature flags' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flag, enabled } = body;

    if (!flag || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Flag name and enabled state are required' },
        { status: 400 }
      );
    }

    if (!(flag in defaultFeatures)) {
      return NextResponse.json(
        { success: false, error: 'Feature flag not found' },
        { status: 404 }
      );
    }

    defaultFeatures[flag as keyof typeof defaultFeatures] = enabled;

    return NextResponse.json({
      success: true,
      data: {
        flag,
        enabled,
        definition: featureDefinitions[flag as keyof typeof featureDefinitions],
      },
    });
  } catch (error) {
    console.error('Error updating feature flag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update feature flag' },
      { status: 500 }
    );
  }
}