import { ContributionDay, ContributionWeek, MonthLabel } from '@/types/github';

// Define contribution level colors matching the site's blue theme
export const CONTRIBUTION_LEVEL_COLORS: { [key: number]: string } = {
  0: '#0d1117', // No contributions
  1: '#1e3a5f', // 1-3 contributions
  2: '#2563eb', // 4-6 contributions
  3: '#3b82f6', // 7-9 contributions
  4: '#60a5fa', // 10+ contributions
};

/**
 * Determines the color for a contribution square based on the count.
 * @param count - The number of contributions.
 * @returns The corresponding color class.
 */
export const getContributionColor = (count: number): string => {
  if (count === 0) return CONTRIBUTION_LEVEL_COLORS[0] ?? '#0d1117';
  if (count >= 1 && count <= 3) return CONTRIBUTION_LEVEL_COLORS[1] ?? '#1e3a5f';
  if (count >= 4 && count <= 6) return CONTRIBUTION_LEVEL_COLORS[2] ?? '#2563eb';
  if (count >= 7 && count <= 9) return CONTRIBUTION_LEVEL_COLORS[3] ?? '#3b82f6';
  if (count >= 10) return CONTRIBUTION_LEVEL_COLORS[4] ?? '#60a5fa';
  return CONTRIBUTION_LEVEL_COLORS[0] ?? '#0d1117';
};

/**
 * Generates month labels for the contribution graph.
 * @param weeks - The array of weeks from the contribution data.
 * @returns An array of month labels with their positions.
 */
export const getMonthLabels = (weeks: ContributionWeek[]): MonthLabel[] => {
  const monthLabels: MonthLabel[] = [];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstDay = week.contributionDays[0];
    if (!firstDay) return;

    const date = new Date(firstDay.date);
    const month = date.getMonth();

    if (month !== lastMonth) {
      monthLabels.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        weekIndex,
      });
      lastMonth = month;
    }
  });

  return monthLabels;
};

/**
 * Generates a year range string from the contribution data.
 * @param weeks - The array of weeks from the contribution data.
 * @returns A string representing the year or year range (e.g., "2024" or "2023-2024").
 */
export const getYearRange = (weeks: ContributionWeek[]): string => {
  if (!weeks || weeks.length === 0) return '';

  const firstWeek = weeks[0];
  const lastWeek = weeks[weeks.length - 1];

  if (!firstWeek || !lastWeek) return '';

  const firstDay = firstWeek.contributionDays[0];
  const lastDay = lastWeek.contributionDays[lastWeek.contributionDays.length - 1];

  if (!firstDay || !lastDay) return '';

  const startYear = new Date(firstDay.date).getFullYear();
  const endYear = new Date(lastDay.date).getFullYear();

  if (startYear === endYear) {
    return `${startYear}`;
  }

  return `${startYear} - ${endYear}`;
};

/**
 * Fills in missing dates to ensure a full 371-day (53-week) grid.
 * @param contributions - The contributions data.
 * @returns A full list of contributions with missing days filled.
 */
export const fillMissingDates = (weeks: ContributionWeek[]): ContributionWeek[] => {
  const allDays = new Map<string, ContributionDay>();
  weeks.forEach(week => {
    week.contributionDays.forEach((day: ContributionDay) => {
      allDays.set(day.date, day);
    });
  });

  const today = new Date();
  const filledDays: ContributionDay[] = [];
  for (let i = 0; i < 371; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    if (dateString) {
      if (allDays.has(dateString)) {
        const day = allDays.get(dateString);
        if (day) {
          filledDays.push(day);
        }
      } else {
        filledDays.push({
          date: dateString,
          count: 0,
          level: 0,
        });
      }
    }
  }

  filledDays.reverse(); // Sort from oldest to newest

  const filledWeeks: ContributionWeek[] = [];
  for (let i = 0; i < filledDays.length; i += 7) {
    const weekSlice = filledDays.slice(i, i + 7);
    if(weekSlice.length > 0) {
      filledWeeks.push({ contributionDays: weekSlice });
    }
  }

  return filledWeeks;
};