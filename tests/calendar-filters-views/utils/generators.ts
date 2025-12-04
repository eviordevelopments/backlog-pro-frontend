import * as fc from 'fast-check';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'task' | 'sprint' | 'meeting' | 'deadline';
  color: string;
  assignee?: string;
  assigneeId?: string;
}

export interface FilterState {
  categories: {
    tasks: boolean;
    sprints: boolean;
    meetings: boolean;
    deadlines: boolean;
  };
  teamMembers: string[];
  viewMode: 'week' | 'month';
}

export interface TeamMember {
  id: string;
  name: string;
}

const EVENT_TYPES = ['task', 'sprint', 'meeting', 'deadline'] as const;
const CATEGORY_COLORS = {
  task: '#3b82f6',
  sprint: '#8b5cf6',
  meeting: '#10b981',
  deadline: '#ef4444',
};

export const generateTeamMember = (): fc.Arbitrary<TeamMember> => {
  return fc.tuple(fc.uuid(), fc.string({ minLength: 1, maxLength: 20 })).map(([id, name]) => ({
    id,
    name,
  }));
};

export const generateTeamMembers = (minLength = 1, maxLength = 5): fc.Arbitrary<TeamMember[]> => {
  return fc.array(generateTeamMember(), { minLength, maxLength });
};

export const generateCalendarEvent = (
  teamMembers: TeamMember[] = []
): fc.Arbitrary<CalendarEvent> => {
  return fc
    .tuple(
      fc.uuid(),
      fc.string({ minLength: 1, maxLength: 50 }),
      fc.date({ min: new Date(2024, 0, 1), max: new Date(2024, 11, 31) }),
      fc.constantFrom(...EVENT_TYPES),
      fc.constantFrom(...Object.values(CATEGORY_COLORS))
    )
    .map(([id, title, date, type, color]) => {
      const assigneeId = teamMembers.length > 0 ? fc.sample(fc.constantFrom(...teamMembers.map(m => m.id)), 1)[0] : undefined;
      const assignee = teamMembers.find(m => m.id === assigneeId)?.name;

      return {
        id,
        title,
        date,
        type,
        color,
        assignee,
        assigneeId,
      };
    });
};

export const generateCalendarEvents = (
  teamMembers: TeamMember[] = [],
  minLength = 0,
  maxLength = 20
): fc.Arbitrary<CalendarEvent[]> => {
  return fc.array(generateCalendarEvent(teamMembers), { minLength, maxLength });
};

export const generateFilterState = (teamMembers: TeamMember[] = []): fc.Arbitrary<FilterState> => {
  return fc
    .tuple(
      fc.boolean(),
      fc.boolean(),
      fc.boolean(),
      fc.boolean(),
      fc.subarray(teamMembers.map(m => m.id)),
      fc.constantFrom('week', 'month')
    )
    .map(([tasks, sprints, meetings, deadlines, selectedMembers, viewMode]) => ({
      categories: {
        tasks,
        sprints,
        meetings,
        deadlines,
      },
      teamMembers: selectedMembers,
      viewMode,
    }));
};

export const getDefaultFilterState = (teamMembers: TeamMember[] = []): FilterState => ({
  categories: {
    tasks: true,
    sprints: true,
    meetings: true,
    deadlines: true,
  },
  teamMembers: teamMembers.map(m => m.id),
  viewMode: 'month',
});

export const getCategoryColor = (type: string): string => {
  return CATEGORY_COLORS[type as keyof typeof CATEGORY_COLORS] || '#6b7280';
};

export const filterEventsByCategory = (
  events: CalendarEvent[],
  categoryFilters: Record<string, boolean>
): CalendarEvent[] => {
  return events.filter(event => categoryFilters[event.type] !== false);
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
