import { CalendarEvent, FilterState } from '@/types';

const getCategoryKey = (eventType: string): keyof FilterState['categories'] => {
  const typeMap: Record<string, keyof FilterState['categories']> = {
    task: 'tasks',
    sprint: 'sprints',
    meeting: 'meetings',
    deadline: 'deadlines',
  };
  return typeMap[eventType] || ('tasks' as keyof FilterState['categories']);
};

export const filterEventsByCategory = (
  events: CalendarEvent[],
  categoryFilters: FilterState['categories']
): CalendarEvent[] => {
  return events.filter(event => {
    const categoryKey = getCategoryKey(event.type);
    return categoryFilters[categoryKey] === true;
  });
};

export const filterEventsByTeamMembers = (
  events: CalendarEvent[],
  selectedMembers: string[]
): CalendarEvent[] => {
  if (selectedMembers.length === 0) {
    return events;
  }
  return events.filter(event => !event.assigneeId || selectedMembers.includes(event.assigneeId));
};

export const applyAllFilters = (
  events: CalendarEvent[],
  filterState: FilterState
): CalendarEvent[] => {
  let filtered = filterEventsByCategory(events, filterState.categories);
  filtered = filterEventsByTeamMembers(filtered, filterState.teamMembers);
  return filtered;
};
