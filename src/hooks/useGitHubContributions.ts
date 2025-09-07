import { useState, useEffect } from 'react';
import { ContributionCalendar } from '@/types/github';

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
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const contributionData: ContributionCalendar = await response.json();
      setData(contributionData);
    } catch (err: any) {
      console.error('Error fetching GitHub contributions:', err);
      setError(err.message || 'Failed to fetch contribution data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [username]); // eslint-disable-line react-hooks/exhaustive-deps

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