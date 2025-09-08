  'use client';

import { useState, useEffect } from 'react';
import { ContributionCalendar } from '@/types/github';
import { fillMissingDates } from '@/lib/github-utils';

interface UseGitHubContributionsResult {
  data: ContributionCalendar | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useGitHubContributions = (username: string = 'Shivam-Bhardwaj'): UseGitHubContributionsResult => {
  const [data, setData] = useState<ContributionCalendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/github/contributions?username=${encodeURIComponent(username)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const contributionData: ContributionCalendar = await response.json();

      if (!contributionData) {
        throw new Error('No contribution data received');
      }

      const filledWeeks = fillMissingDates(contributionData.weeks);
      const processedData: ContributionCalendar = {
        ...contributionData,
        weeks: filledWeeks,
      };

      setData(processedData);
    } catch (err: any) {
      console.error('Error fetching GitHub contributions:', err);
      setError(err.message || 'Failed to fetch contribution data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [username]);

  const refetch = () => {
    fetchContributions();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};