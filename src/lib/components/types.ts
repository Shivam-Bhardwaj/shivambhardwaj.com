import { ComponentType, ReactNode } from 'react';

export interface ComponentConfig {
  id: string;
  name: string;
  category: 'ui' | 'robotics' | 'layout' | 'interactive' | 'admin';
  version: string;
  description: string;
  props?: Record<string, any>;
  dependencies?: string[];
  tags?: string[];
  preview?: string;
  isEnabled?: boolean;
  featureFlag?: string;
}

export interface ComponentRegistryItem {
  config: ComponentConfig;
  component: ComponentType<any>;
  loader?: () => Promise<ComponentType<any>>;
}

export interface DynamicComponentProps {
  componentId: string;
  props?: Record<string, any>;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

export interface ComponentPlaygroundProps {
  componentId: string;
  initialProps?: Record<string, any>;
  showCode?: boolean;
  showPreview?: boolean;
}

export interface FeatureFlagProps {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export interface RobotBehavior {
  type: 'follow' | 'flee' | 'wander' | 'flock' | 'avoid';
  intensity: number;
  radius: number;
  enabled: boolean;
}

export interface RobotConfig {
  id: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  behaviors: RobotBehavior[];
  size: number;
  color: string;
  interactive: boolean;
}

export interface CollisionZone {
  id: string;
  type: 'button' | 'text' | 'interactive' | 'custom';
  element: HTMLElement;
  padding: number;
  priority: number;
}

export type ComponentCategory = ComponentConfig['category'];
export type ComponentStatus = 'loading' | 'loaded' | 'error' | 'disabled';