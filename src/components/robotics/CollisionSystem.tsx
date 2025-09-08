'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { CollisionZone } from '../../lib/components/types';

interface CollisionSystemProps {
  onZonesUpdate: (zones: CollisionZone[]) => void;
  scanInterval?: number;
  defaultPadding?: number;
  children?: React.ReactNode;
}

export default function CollisionSystem({
  onZonesUpdate,
  scanInterval = 500,
  defaultPadding = 20,
  children,
}: CollisionSystemProps) {
  const [collisionZones, setCollisionZones] = useState<CollisionZone[]>([]);
  const observerRef = useRef<MutationObserver | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const scanForInteractiveElements = useCallback(() => {
    const zones: CollisionZone[] = [];
    let idCounter = 0;

    // Define selectors for elements to avoid
    const selectors = [
      'button',
      'a[href]',
      'input',
      'select',
      'textarea',
      '[role="button"]',
      '[onclick]',
      '[tabindex]:not([tabindex="-1"])',
      '.interactive',
      '.clickable',
      '[data-interactive]',
      // Navigation and menu elements
      'nav',
      'nav *',
      '.navigation',
      '.menu',
      '.dropdown',
      // Form elements
      'form',
      'label',
      // Text content that should not be obscured
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      '.text-content',
      // Special UI elements
      '.card',
      '.modal',
      '.popup',
      '.tooltip',
      // Admin and control elements
      '.feature-flag-admin',
      '.component-playground',
      '.admin-panel',
    ];

    selectors.forEach((selector, index) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          const htmlElement = element as HTMLElement;
          
          // Skip if element is not visible
          const rect = htmlElement.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          
          // Skip if element is off-screen
          if (rect.bottom < 0 || rect.right < 0 || 
              rect.top > window.innerHeight || rect.left > window.innerWidth) return;

          let zoneType: CollisionZone['type'] = 'custom';
          let priority = 1;

          // Determine zone type and priority
          if (selector.includes('button') || selector.includes('[role="button"]')) {
            zoneType = 'button';
            priority = 3;
          } else if (selector.includes('a[href]')) {
            zoneType = 'interactive';
            priority = 3;
          } else if (selector.match(/^h[1-6]$/) || selector === 'p') {
            zoneType = 'text';
            priority = 2;
          } else if (selector.includes('input') || selector.includes('form')) {
            zoneType = 'interactive';
            priority = 4;
          } else {
            zoneType = 'interactive';
            priority = 2;
          }

          // Calculate padding based on element type and size
          let padding = defaultPadding;
          
          if (zoneType === 'button' || zoneType === 'interactive') {
            padding = Math.max(defaultPadding, Math.min(rect.width, rect.height) * 0.3);
          } else if (zoneType === 'text') {
            padding = defaultPadding * 0.7;
          }

          // Check for custom padding in data attributes
          const customPadding = htmlElement.dataset.robotPadding;
          if (customPadding) {
            padding = parseInt(customPadding, 10) || padding;
          }

          // Check for custom priority
          const customPriority = htmlElement.dataset.robotPriority;
          if (customPriority) {
            priority = parseInt(customPriority, 10) || priority;
          }

          zones.push({
            id: `zone-${idCounter++}`,
            type: zoneType,
            element: htmlElement,
            padding,
            priority,
          });
        });
      } catch (error) {
        console.warn(`Error scanning selector "${selector}":`, error);
      }
    });

    // Add custom zones from data attributes
    const customZones = document.querySelectorAll('[data-robot-avoid]');
    customZones.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const rect = htmlElement.getBoundingClientRect();
      
      if (rect.width === 0 || rect.height === 0) return;

      const customType = htmlElement.dataset.robotAvoid as CollisionZone['type'] || 'custom';
      const customPadding = parseInt(htmlElement.dataset.robotPadding || String(defaultPadding), 10);
      const customPriority = parseInt(htmlElement.dataset.robotPriority || '1', 10);

      zones.push({
        id: `custom-zone-${idCounter++}`,
        type: customType,
        element: htmlElement,
        padding: customPadding,
        priority: customPriority,
      });
    });

    setCollisionZones(zones);
    onZonesUpdate(zones);
  }, [defaultPadding, onZonesUpdate]);

  useEffect(() => {
    // Initial scan
    scanForInteractiveElements();

    // Set up periodic scanning
    intervalRef.current = setInterval(scanForInteractiveElements, scanInterval);

    // Set up mutation observer for DOM changes
    observerRef.current = new MutationObserver((mutations) => {
      let shouldRescan = false;

      mutations.forEach((mutation) => {
        // Check if new nodes were added or removed
        if (mutation.type === 'childList') {
          if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
            shouldRescan = true;
          }
        }
        
        // Check for attribute changes that might affect collision detection
        if (mutation.type === 'attributes') {
          const attributeName = mutation.attributeName;
          if (attributeName && (
            attributeName.startsWith('data-robot') ||
            attributeName === 'class' ||
            attributeName === 'style' ||
            attributeName === 'hidden'
          )) {
            shouldRescan = true;
          }
        }
      });

      if (shouldRescan) {
        // Debounce rescanning to avoid excessive updates
        setTimeout(scanForInteractiveElements, 100);
      }
    });

    // Start observing the entire document
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden', 'data-robot-avoid', 'data-robot-padding', 'data-robot-priority'],
    });

    // Handle window resize
    const handleResize = () => {
      setTimeout(scanForInteractiveElements, 250);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [scanForInteractiveElements, scanInterval]);

  return (
    <>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <CollisionZoneVisualizer zones={collisionZones} />
      )}
    </>
  );
}

// Development helper component to visualize collision zones
function CollisionZoneVisualizer({ zones }: { zones: CollisionZone[] }) {
  const [showZones, setShowZones] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'z' && e.ctrlKey && e.shiftKey) {
        setShowZones(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!showZones) {
    return (
      <div 
        className="fixed top-4 left-4 bg-black bg-opacity-50 text-white text-xs p-2 rounded z-50"
        style={{ pointerEvents: 'none' }}
      >
        Ctrl+Shift+Z to toggle collision zones ({zones.length} zones)
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {zones.map((zone) => {
        const rect = zone.element.getBoundingClientRect();
        const color = {
          button: 'rgba(255, 0, 0, 0.3)',
          text: 'rgba(0, 255, 0, 0.2)',
          interactive: 'rgba(0, 0, 255, 0.3)',
          custom: 'rgba(255, 255, 0, 0.3)',
        }[zone.type];

        return (
          <div
            key={zone.id}
            className="absolute border-2 border-dashed"
            style={{
              left: rect.left - zone.padding + window.scrollX,
              top: rect.top - zone.padding + window.scrollY,
              width: rect.width + zone.padding * 2,
              height: rect.height + zone.padding * 2,
              backgroundColor: color,
              borderColor: color?.replace('0.3', '1').replace('0.2', '1'),
              borderWidth: zone.priority,
            }}
          >
            <div 
              className="absolute -top-5 left-0 text-xs bg-black text-white px-1 rounded"
              style={{ fontSize: '10px' }}
            >
              {zone.type} (p:{zone.priority})
            </div>
          </div>
        );
      })}
    </div>
  );
}