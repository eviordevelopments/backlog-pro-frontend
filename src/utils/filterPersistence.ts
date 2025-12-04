import { FilterState } from '@/types';

const FILTER_STATE_KEY = 'calendar_filter_state';

export const getDefaultFilterState = (teamMemberIds: string[] = []): FilterState => ({
  categories: {
    tasks: true,
    sprints: true,
    meetings: true,
    deadlines: true,
  },
  teamMembers: teamMemberIds,
  viewMode: 'month',
});

export const saveFilterState = (state: FilterState): void => {
  try {
    localStorage.setItem(FILTER_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save filter state to localStorage:', error);
  }
};

export const loadFilterState = (teamMemberIds: string[] = []): FilterState => {
  try {
    const stored = localStorage.getItem(FILTER_STATE_KEY);
    if (!stored) {
      return getDefaultFilterState(teamMemberIds);
    }

    const parsed = JSON.parse(stored);
    const defaultState = getDefaultFilterState(teamMemberIds);

    return {
      categories: {
        tasks: parsed.categories?.tasks ?? defaultState.categories.tasks,
        sprints: parsed.categories?.sprints ?? defaultState.categories.sprints,
        meetings: parsed.categories?.meetings ?? defaultState.categories.meetings,
        deadlines: parsed.categories?.deadlines ?? defaultState.categories.deadlines,
      },
      teamMembers: Array.isArray(parsed.teamMembers) ? parsed.teamMembers : defaultState.teamMembers,
      viewMode: parsed.viewMode === 'week' || parsed.viewMode === 'month' ? parsed.viewMode : defaultState.viewMode,
    };
  } catch (error) {
    console.error('Failed to load filter state from localStorage:', error);
    return getDefaultFilterState(teamMemberIds);
  }
};

export const clearFilterState = (): void => {
  try {
    localStorage.removeItem(FILTER_STATE_KEY);
  } catch (error) {
    console.error('Failed to clear filter state from localStorage:', error);
  }
};
