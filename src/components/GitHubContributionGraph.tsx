// Add error boundary class
import React, { ErrorInfo, ReactNode, Component, useState } from 'react';
import { FiSettings } from 'react-icons/fi';
import { useGitHubContributions } from '@/hooks/useGitHubContributions';
import { getContributionColor, getMonthLabels, getYearRange } from '@/lib/github-utils';
import { ContributionDay, ContributionWeek } from '@/types/github';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-red-400 dark:text-red-300 mb-4">Error in contribution graph</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{this.state.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

interface GitHubContributionGraphProps {
  username?: string;
}

const GitHubContributionGraph: React.FC<GitHubContributionGraphProps> = ({
  username = 'Shivam-Bhardwaj',
}) => {
  const { data, loading, error, refetch } = useGitHubContributions(username);
  const [showSettings, setShowSettings] = useState(false);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-48"></div>
          <div className="grid grid-cols-53 gap-1">
            {Array.from({ length: 371 }).map((_, i) => (
              <div key={i} className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <p className="text-red-400 dark:text-red-300 mb-4">Failed to load contribution data</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Error: {error}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Please check your GitHub token configuration or try again later.
          </p>
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
    return (
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            GitHub Contributions
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Unable to load contribution data or contributions are private.
          </p>
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

  if (!data?.weeks) {
    return null;
  }
  const weeks = data.weeks.slice(-53);
  const monthLabels = getMonthLabels(weeks);
  const yearRange = getYearRange(weeks);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {data.totalContributions.toLocaleString()} contributions in {yearRange}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            Production Data
          </span>
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              aria-label="Contribution settings"
            >
              <FiSettings className="w-5 h-5" />
            </button>
            {showSettings && (
              <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-3 w-48 z-10 shadow-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">Contribution settings</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Live data shown</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div className="flex mb-2" style={{ marginLeft: '2rem' }}>
            {monthLabels.map(({ month, weekIndex }) => (
              <div
                key={`${month}-${weekIndex}`}
                className="text-xs text-gray-500 dark:text-gray-400"
                style={{ minWidth: `${(12 / monthLabels.length) * 4}%` }}
              >
                {month}
              </div>
            ))}
          </div>

          <div className="flex">
            <div className="flex flex-col pr-2 text-xs text-gray-500 dark:text-gray-400">
              {weekDays.map((day, i) => (
                <div key={day} className="h-3 flex items-center" style={{ marginTop: i > 0 ? '0.25rem' : 0 }}>
                  {i % 2 !== 0 ? day : ''}
                </div>
              ))}
            </div>

            <div className="flex gap-1">
              {weeks.map((week: ContributionWeek, weekIndex: number) => (
                <div key={weekIndex} className="flex flex-col gap-1 flex-shrink-0">
                  {week.contributionDays.map((day: ContributionDay, dayIndex: number) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="w-3 h-3 rounded-sm hover:ring-2 hover:ring-gray-400 dark:hover:ring-gray-500 transition-all cursor-pointer"
                      style={{ backgroundColor: getContributionColor(day.count) }}
                      title={`${day.count} contributions on ${new Date(day.date).toLocaleDateString()}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span>Less</span>
              <div className="flex gap-1 ml-2">
                {[0, 1, 2, 3, 4].map((level: number) => (
                  <div
                    key={level}
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: getContributionColor(level > 0 ? (level * 2) : 0) }}
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

const WrappedGitHubContributionGraph = ({ ...props }: { username?: string }) => (
  <ErrorBoundary>
    <GitHubContributionGraph {...props} />
  </ErrorBoundary>
);

export default WrappedGitHubContributionGraph;