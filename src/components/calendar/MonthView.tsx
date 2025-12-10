import { format, startOfMonth, isSameMonth, isSameDay } from 'date-fns';
import { CalendarEvent } from '@/types';
import EventCell from './EventCell';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

export default function MonthView({ currentDate, events, onEventClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());

  const calendarDays: Date[] = [];
  const currentDay = new Date(startDate);
  while (calendarDays.length < 42) {
    calendarDays.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  const isToday = (day: Date) => isSameDay(day, new Date());
  const isCurrentMonth = (day: Date) => isSameMonth(day, currentDate);

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      {/* Week days header */}
      <div className="grid grid-cols-7 bg-muted/50">
        {dayLabels.map(day => (
          <div key={day} className="p-3 text-center font-semibold text-sm border-b border-border/50">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const today = isToday(day);
          const currentMonth = isCurrentMonth(day);

          return (
            <div
              key={idx}
              className={`min-h-[140px] p-2 border-b border-r border-border/50 ${
                !currentMonth ? 'bg-muted/20' : 'bg-background'
              } ${today ? 'bg-primary/10 border-primary' : ''}`}
            >
              <div
                className={`text-sm font-semibold mb-2 ${
                  today ? 'text-primary' : currentMonth ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 4).map(event => (
                  <EventCell
                    key={event.id}
                    event={event}
                    compact
                    onClick={onEventClick}
                  />
                ))}
                {dayEvents.length > 4 && (
                  <div className="text-xs text-muted-foreground px-1 font-semibold">
                    +{dayEvents.length - 4}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
