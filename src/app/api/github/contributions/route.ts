import { NextRequest, NextResponse } from 'next/server';
import { ContributionCalendar, ContributionDay, ContributionWeek } from '@/types/github';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

const CONTRIBUTION_QUERY = `
  query($userName: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $userName) {
      login
      contributionsCollection(from: $from, to: $to) {
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

    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 371);

    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'antimony-labs-portfolio/1.0.0'
      },
      body: JSON.stringify({
        query: CONTRIBUTION_QUERY,
        variables: {
          userName: username,
          from: from.toISOString(),
          to: to.toISOString(),
        }
      })
    });

    console.log('GitHub API Response Status:', response.status);
    // console.log('GitHub API Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API Error Response:', errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      return NextResponse.json(
        { error: 'Failed to fetch contribution data', details: errorData, status: response.status },
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
      console.error('No contribution calendar found in response:', {
        userExists: !!data.data?.user,
        userLogin: data.data?.user?.login,
        hasContributionsCollection: !!data.data?.user?.contributionsCollection
        // Removed fullResponse to keep logs clean
      });
      return NextResponse.json(
        { error: 'No contribution data found for user', details: { userExists: !!data.data?.user, userLogin: data.data?.user?.login } },
        { status: 404 }
      );
    }

    // Debug logging
    console.log('GitHub API Response Debug:', {
      totalContributions: calendar.totalContributions,
      weeksCount: calendar.weeks?.length
      // Removed detailed week data to keep logs clean
    });

    // Transform the data to match our interface
    const transformedCalendar: ContributionCalendar = {
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks.map((week: any) => ({
        contributionDays: week.contributionDays.map((day: any) => ({
          date: day.date,
          count: day.contributionCount,
          level: day.contributionLevel,
        })),
      })),
    };

    console.log('Transformed calendar:', {
      totalContributions: transformedCalendar.totalContributions,
      weeksCount: transformedCalendar.weeks.length
      // Removed sample week data to keep logs clean
    });

    return NextResponse.json(transformedCalendar, {
      headers: {
        'Cache-Control': 'public, max-age=3600'
      }
    });

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