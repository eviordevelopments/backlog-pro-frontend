import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { CalendarEvent } from '@/types';
import EventCell from './EventCell';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

export default function WeekView({ currentDate, events, onEventClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  const isToday = (day: Date) => isSameDay(day, new Date());

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      {/* Week days header */}
      <div className="grid grid-cols-7 bg-muted/50">
        {dayLabels.map((label, idx) => {
          const day = weekDays[idx];
          const today = isToday(day);
          return (
            <div
              key={label}
              className={`p-3 text-center border-b border-border/50 ${
                today ? 'bg-primary/10 border-primary' : ''
              }`}
            >
              <div className="text-xs font-semibold text-muted-foreground">{label}</div>
              <div
                className={`text-sm font-bold mt-1 ${
                  today ? 'text-primary' : 'text-foreground'
                }`}
              >
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Week view grid */}
      <div className="grid grid-cols-7">
        {weekDays.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const today = isToday(day);

          return (
            <div
              key={idx}
              className={`min-h-[200px] p-2 border-b border-r border-border/50 ${
                today ? 'bg-primary/5' : 'bg-background'
              }`}
            >
              <div className="space-y-1">
                {dayEvents.map(event => (
                  <EventCell
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                  />
                ))}
                {dayEvents.length === 0 && (
                  <div className="text-xs text-muted-foreground p-1">No events</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
