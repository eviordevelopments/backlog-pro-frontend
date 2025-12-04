import { CalendarEvent, FilterState, TeamMember } from './generators';

export const getWeekDays = (startDate: Date): Date[] => {
  const days: Date[] = [];
  const start = new Date(startDate);
  const dayOfWeek = start.getDay();
  start.setDate(start.getDate() - dayOfWeek);

  for (let i = 0; i < 7; i++) {
    days.push(new Date(start));
    start.setDate(start.getDate() + 1);
  }

  return days;
};

export const getMonthDays = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days: Date[] = [];
  const currentDate = new Date(startDate);

  while (days.length < 42) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const getEventsForDay = (events: CalendarEvent[], day: Date): CalendarEvent[] => {
  return events.filter(event => isSameDay(event.date, day));
};

export const getEventsForWeek = (events: CalendarEvent[], weekStart: Date): CalendarEvent[] => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return events.filter(event => {
    return event.date >= weekStart && event.date < weekEnd;
  });
};

export const getEventsForMonth = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  return events.filter(event => {
    return event.date >= monthStart && event.date <= monthEnd;
  });
};

export const serializeFilterState = (state: FilterState): string => {
  return JSON.stringify(state);
};

export const deserializeFilterState = (json: string): FilterState => {
  return JSON.parse(json);
};

export const areFilterStatesEqual = (state1: FilterState, state2: FilterState): boolean => {
  return (
    state1.categories.tasks === state2.categories.tasks &&
    state1.categories.sprints === state2.categories.sprints &&
    state1.categories.meetings === state2.categories.meetings &&
    state1.categories.deadlines === state2.categories.deadlines &&
    JSON.stringify(state1.teamMembers.sort()) === JSON.stringify(state2.teamMembers.sort()) &&
    state1.viewMode === state2.viewMode
  );
};

export const getDistinctColors = (events: CalendarEvent[]): Set<string> => {
  return new Set(events.map(e => e.color));
};

export const hasEventInfo = (event: CalendarEvent, rendered: string): boolean => {
  return rendered.includes(event.title) && (event.assignee ? rendered.includes(event.assignee) : true);
};

export const getEventCountForDay = (events: CalendarEvent[], day: Date): number => {
  return getEventsForDay(events, day).length;
};
