import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';
import { CalendarEvent } from '@/types';
import WeekView from './WeekView';
import MonthView from './MonthView';

interface CalendarGridProps {
  view: 'week' | 'month';
  currentDate: Date;
  events: CalendarEvent[];
  onDateChange: (date: Date) => void;
}

export default function CalendarGrid({
  view,
  currentDate,
  events,
  onDateChange,
}: CalendarGridProps) {
  const handlePreviousPeriod = () => {
    if (view === 'week') {
      onDateChange(subWeeks(currentDate, 1));
    } else {
      onDateChange(subMonths(currentDate, 1));
    }
  };

  const handleNextPeriod = () => {
    if (view === 'week') {
      onDateChange(addWeeks(currentDate, 1));
    } else {
      onDateChange(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const getHeaderTitle = () => {
    if (view === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    }
    return format(currentDate, 'MMMM yyyy');
  };

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{getHeaderTitle()}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPeriod}
              aria-label={view === 'week' ? 'Previous week' : 'Previous month'}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPeriod}
              aria-label={view === 'week' ? 'Next week' : 'Next month'}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span>Tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500"></div>
              <span>Sprints</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span>Meetings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span>Deadlines</span>
            </div>
          </div>

          {/* Calendar View */}
          {view === 'week' ? (
            <WeekView currentDate={currentDate} events={events} />
          ) : (
            <MonthView currentDate={currentDate} events={events} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
