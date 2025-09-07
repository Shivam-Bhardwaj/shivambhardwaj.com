import { NextRequest, NextResponse } from 'next/server';
import { ContributionCalendar } from '@/types/github';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

const CONTRIBUTION_QUERY = `
  query($userName: String!) {
    user(login: $userName) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || 'Shivam-Bhardwaj';

  try {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'antimony-labs-portfolio/1.0.0'
      },
      body: JSON.stringify({
        query: CONTRIBUTION_QUERY,
        variables: { userName: username }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub GraphQL API error:', errorData);

      return NextResponse.json(
        { error: 'Failed to fetch contribution data', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return NextResponse.json(
        { error: 'GraphQL query failed', details: data.errors },
        { status: 500 }
      );
    }

    const calendar = data.data?.user?.contributionsCollection?.contributionCalendar;

    if (!calendar) {
      return NextResponse.json(
        { error: 'No contribution data found for user' },
        { status: 404 }
      );
    }

    // Transform the data to match our interface
    const transformedCalendar: ContributionCalendar = {
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks.map((week: any) => ({
        contributionDays: week.contributionDays.map((day: any) => ({
          date: day.date,
          count: day.contributionCount,
          level: day.contributionLevel
        }))
      }))
    };

    return NextResponse.json(transformedCalendar);

  } catch (error: any) {
    console.error('Error fetching GitHub contributions:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}