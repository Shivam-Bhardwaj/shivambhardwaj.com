'use client';

import { useState, useEffect, Suspense, ReactNode } from 'react';
import { componentRegistry } from '../../lib/components/registry';
import { DynamicComponentProps } from '../../lib/components/types';

interface DynamicZoneProps extends DynamicComponentProps {
  className?: string;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
}

export default function DynamicZone({
  componentId,
  props = {},
  fallback,
  onError,
  className = '',
  loadingComponent,
  errorComponent
}: DynamicZoneProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadComponent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const config = componentRegistry.getConfig(componentId);
        if (!config) {
          throw new Error(`Component "${componentId}" not found in registry`);
        }

        if (config.isEnabled === false) {
          throw new Error(`Component "${componentId}" is disabled`);
        }

        const loadedComponent = await componentRegistry.getComponent(componentId);
        
        if (isMounted) {
          setComponent(() => loadedComponent);
          setIsLoading(false);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load component');
        
        if (isMounted) {
          setError(error);
          setIsLoading(false);
          onError?.(error);
        }
      }
    };

    loadComponent();

    return () => {
      isMounted = false;
    };
  }, [componentId, onError]);

  if (isLoading) {
    return (
      <div className={`dynamic-zone dynamic-zone--loading ${className}`}>
        {loadingComponent || (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            <span className="ml-2 text-sm text-gray-600">Loading {componentId}...</span>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`dynamic-zone dynamic-zone--error ${className}`}>
        {errorComponent || fallback || (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-sm font-medium text-red-800">Component Error</h3>
            <p className="text-sm text-red-600 mt-1">{error.message}</p>
            <details className="mt-2">
              <summary className="text-xs text-red-500 cursor-pointer">Stack trace</summary>
              <pre className="text-xs text-red-400 mt-1 overflow-x-auto">{error.stack}</pre>
            </details>
          </div>
        )}
      </div>
    );
  }

  if (!Component) {
    return (
      <div className={`dynamic-zone dynamic-zone--empty ${className}`}>
        {fallback || (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">Component not available</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`dynamic-zone dynamic-zone--loaded ${className}`}>
      <Suspense fallback={loadingComponent || <div>Loading...</div>}>
        <Component {...props} />
      </Suspense>
    </div>
  );
}