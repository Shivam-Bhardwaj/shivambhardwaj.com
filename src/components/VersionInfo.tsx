'use client';

import { useState, useEffect } from 'react';

interface VersionData {
  version: string;
  buildTime: string;
  gitHash: string;
  gitBranch: string;
  buildNumber: string;
}

const VersionInfo = ({ className = '' }: { className?: string }) => {
  const [versionData, setVersionData] = useState<VersionData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Try to load version data
    const loadVersionData = async () => {
      try {
        const response = await fetch('/data/version.json');
        if (response.ok) {
          const data = await response.json();
          setVersionData(data);
        }
      } catch {
        // Fallback to package.json version if version.json not available
        console.warn('Version data not available');
      }
    };

    loadVersionData();
  }, []);

  if (!versionData) {
    return null;
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`version-info ${className}`}>
      <div className="flex items-center space-x-2">
        <span 
          className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
          onClick={() => setShowDetails(!showDetails)}
          title="Click for deployment details"
        >
          v{versionData.version}
        </span>
        <span className="text-xs text-gray-400">•</span>
        <span className="text-xs text-gray-500">
          {formatDate(versionData.buildTime)}
        </span>
      </div>
      
      {showDetails && (
        <div className="absolute bg-white shadow-lg border rounded-lg p-3 mt-2 text-xs z-50 min-w-[200px]">
          <div className="space-y-1">
            <div>
              <span className="font-semibold text-gray-700">Version:</span>{' '}
              <span className="text-gray-600">{versionData.version}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Build:</span>{' '}
              <span className="text-gray-600 font-mono text-[10px]">{versionData.buildNumber}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Git:</span>{' '}
              <span className="text-gray-600 font-mono">{versionData.gitHash}</span>
              <span className="text-gray-500"> ({versionData.gitBranch})</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Deployed:</span>{' '}
              <span className="text-gray-600">{formatDate(versionData.buildTime)}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t">
            <span className="text-gray-400 text-[10px]">
              Click outside to close
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionInfo;