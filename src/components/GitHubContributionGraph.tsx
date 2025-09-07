'use client';

import { useState } from 'react';
import { useGitHubContributions } from '@/hooks/useGitHubContributions';
import { FiSettings } from 'react-icons/fi';

interface GitHubContributionGraphProps {
  username?: string;
}

const GitHubContributionGraph: React.FC<GitHubContributionGraphProps> = ({
  username = 'Shivam-Bhardwaj'
}) => {
  const { data, loading, error, refetch } = useGitHubContributions(username);
  const [showSettings, setShowSettings] = useState(false);

  if (loading) {
    return (
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4 w-48"></div>
          <div className="grid grid-cols-53 gap-1">
            {Array.from({ length: 371 }).map((_, i) => (
              <div key={i} className="w-3 h-3 bg-gray-700 rounded-sm"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">Failed to load contribution data</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Generate month labels for the past year
  const getMonthLabels = () => {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toLocaleDateString('en-US', { month: 'short' }));
    }
    return months;
  };

  const monthLabels = getMonthLabels();

  // Get color class based on contribution level
  const getColorClass = (level: number) => {
    switch (level) {
      case 0: return 'bg-gray-800';
      case 1: return 'bg-green-900';
      case 2: return 'bg-green-700';
      case 3: return 'bg-green-500';
      case 4: return 'bg-green-300';
      default: return 'bg-gray-800';
    }
  };

  // Group days by week for rendering
  const weeks = data.weeks.slice(-53); // Last 53 weeks for full year view

  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          {data.totalContributions.toLocaleString()} contributions in the last year
        </h3>
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Contribution settings"
          >
            <FiSettings className="w-5 h-5" />
          </button>
          {showSettings && (
            <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-md p-3 w-48 z-10">
              <p className="text-sm text-gray-300">Contribution settings</p>
              <p className="text-xs text-gray-500 mt-1">Coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Graph Container */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Month Labels */}
          <div className="flex mb-2">
            <div className="w-8"></div> {/* Space for day labels */}
            {monthLabels.map((month, index) => (
              <div key={month} className="text-xs text-gray-400 w-12 text-center">
                {index % 2 === 0 ? month : ''}
              </div>
            ))}
          </div>

          {/* Graph Grid */}
          <div className="flex">
            {/* Day Labels */}
            <div className="flex flex-col justify-between pr-2 text-xs text-gray-400">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Contribution Grid */}
            <div className="grid grid-cols-53 gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-rows-7 gap-1">
                  {week.contributionDays.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-sm ${getColorClass(day.level)} hover:ring-2 hover:ring-gray-500 transition-all cursor-pointer`}
                      title={`${day.count} contributions on ${new Date(day.date).toLocaleDateString()}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>Less</span>
              <div className="flex gap-1 ml-2">
                {[0, 1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    className={`w-3 h-3 rounded-sm ${getColorClass(level)}`}
                  />
                ))}
              </div>
              <span className="ml-2">More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubContributionGraph;