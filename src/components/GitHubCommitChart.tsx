'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { CommitActivity, LanguageStats, GitHubStats } from '@/types/github';

interface GitHubCommitChartProps {
  commitActivity: CommitActivity[];
  className?: string;
}

interface GitHubLanguageChartProps {
  languageStats: LanguageStats[];
  className?: string;
}

interface GitHubStatsOverviewProps {
  stats: GitHubStats;
  className?: string;
}

export function GitHubCommitChart({ commitActivity, className = '' }: GitHubCommitChartProps) {
  // Group commits by date and aggregate across all repositories
  const chartData = useMemo(() => {
    const dateMap = new Map<string, number>();
    
    commitActivity.forEach(activity => {
      const current = dateMap.get(activity.date) || 0;
      dateMap.set(activity.date, current + activity.count);
    });

    return Array.from(dateMap.entries())
      .map(([date, commits]) => ({
        date: new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        commits,
        fullDate: date
      }))
      .sort((a, b) => a.fullDate.localeCompare(b.fullDate))
      .slice(-90); // Show last 90 days
  }, [commitActivity]);

  const maxCommits = Math.max(...chartData.map(d => d.commits));

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Commit Activity (Last 90 Days)
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <Tooltip
              labelStyle={{ color: 'var(--tw-colors-gray-900)' }}
              contentStyle={{
                backgroundColor: 'var(--tw-colors-white)',
                border: '1px solid var(--tw-colors-gray-200)',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              formatter={(value: number) => [value, 'Commits']}
            />
            <Line 
              type="monotone" 
              dataKey="commits" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ r: 4, fill: '#3B82F6' }}
              activeDot={{ r: 6, fill: '#3B82F6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {chartData.length === 0 && (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No commit data available
        </div>
      )}
    </div>
  );
}

export function GitHubLanguageChart({ languageStats, className = '' }: GitHubLanguageChartProps) {
  // Take top 8 languages and group the rest as "Others"
  const chartData = useMemo(() => {
    const topLanguages = languageStats.slice(0, 7);
    const otherLanguages = languageStats.slice(7);
    
    const data = topLanguages.map(lang => ({
      name: lang.language,
      value: lang.percentage,
      bytes: lang.bytes,
      repos: lang.repositories.length
    }));

    if (otherLanguages.length > 0) {
      const othersPercentage = otherLanguages.reduce((sum, lang) => sum + lang.percentage, 0);
      const othersBytes = otherLanguages.reduce((sum, lang) => sum + lang.bytes, 0);
      const othersRepos = new Set(otherLanguages.flatMap(lang => lang.repositories)).size;
      
      data.push({
        name: 'Others',
        value: othersPercentage,
        bytes: othersBytes,
        repos: othersRepos
      });
    }

    return data;
  }, [languageStats]);

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'
  ];

  const formatBytes = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Languages Used
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, _name, props) => [
                `${value.toFixed(1)}%`,
                `${formatBytes(props.payload.bytes)} across ${props.payload.repos} repos`
              ]}
              labelFormatter={(label) => `${label}`}
              contentStyle={{
                backgroundColor: 'var(--tw-colors-white)',
                border: '1px solid var(--tw-colors-gray-200)',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {chartData.length === 0 && (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No language data available
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {chartData.slice(0, 6).map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-gray-700 dark:text-gray-300">
              {item.name} ({item.value.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GitHubStatsOverview({ stats, className = '' }: GitHubStatsOverviewProps) {
  const statCards = [
    { label: 'Repositories', value: stats.totalRepositories, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Total Stars', value: stats.totalStars, color: 'text-yellow-600 dark:text-yellow-400' },
    { label: 'Total Forks', value: stats.totalForks, color: 'text-green-600 dark:text-green-400' },
    { label: 'Total Commits', value: stats.totalCommits, color: 'text-purple-600 dark:text-purple-400' },
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        GitHub Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t pt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <span className="font-medium">Most Active Repository:</span> {stats.mostActiveRepository}
        </div>
        <div>
          <span className="font-medium">Last Activity:</span> {' '}
          {stats.lastActivityDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
        <div>
          <span className="font-medium">Primary Language:</span> {' '}
          {stats.languageStats[0]?.language || 'N/A'}
        </div>
      </div>
    </div>
  );
}