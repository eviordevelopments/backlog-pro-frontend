import { format, isSameDay } from 'date-fns';
import { CalendarEvent } from '@/types';
import EventCell from './EventCell';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MEXICO_TIMEZONE_OFFSET = -3; // Mexico is 3 hours behind Argentina

export default function DayView({ currentDate, events, onEventClick }: DayViewProps) {
  const getEventsForHour = (hour: number) => {
    return events.filter(event => {
      if (!isSameDay(event.date, currentDate)) return false;
      const eventHour = event.date.getHours();
      return eventHour === hour;
    });
  };

  const formatHour = (hour: number) => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return format(date, 'ha');
  };

  const getMexicoHour = (hour: number) => {
    let mexicoHour = hour + MEXICO_TIMEZONE_OFFSET;
    if (mexicoHour < 0) {
      mexicoHour += 24;
    } else if (mexicoHour >= 24) {
      mexicoHour -= 24;
    }
    const date = new Date();
    date.setHours(mexicoHour, 0, 0, 0);
    return format(date, 'ha');
  };

  const isCurrentHour = (hour: number) => {
    const now = new Date();
    return (
      isSameDay(currentDate, now) &&
      now.getHours() === hour
    );
  };

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-muted/50 border-b border-border/50 p-4 z-10">
        <h3 className="text-lg font-semibold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h3>
        <p className="text-sm text-muted-foreground">{events.length} event(s) today</p>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {HOURS.map(hour => {
          const hourEvents = getEventsForHour(hour);
          const current = isCurrentHour(hour);

          return (
            <div
              key={hour}
              className={`flex border-b border-border/50 ${
                current ? 'bg-primary/5 border-primary' : ''
              }`}
            >
              {/* Argentina Time - Fixed Width */}
              <div
                className={`w-32 p-3 text-sm font-semibold border-r border-border/50 flex flex-col gap-1 ${
                  current ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className="text-xs font-medium text-muted-foreground">Argentina</div>
                <div>{formatHour(hour)}</div>
              </div>

              {/* Mexico Time - Fixed Width */}
              <div
                className={`w-32 p-3 text-sm font-semibold border-r border-border/50 flex flex-col gap-1 text-muted-foreground`}
              >
                <div className="text-xs font-medium text-muted-foreground">Mexico (GMT-3)</div>
                <div>{getMexicoHour(hour)}</div>
              </div>

              {/* Events Container - Flexible */}
              <div className="flex-1 p-3 space-y-2 min-h-[80px]">
                {hourEvents.length > 0 ? (
                  hourEvents.map(event => (
                    <EventCell
                      key={event.id}
                      event={event}
                      onClick={onEventClick}
                    />
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground/50">No events</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
