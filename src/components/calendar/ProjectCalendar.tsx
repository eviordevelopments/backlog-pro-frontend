import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useProjectContext } from '@/context/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'task' | 'sprint' | 'meeting' | 'deadline' | 'deliverable';
  color: string;
  assignee?: string;
}

export default function ProjectCalendar() {
  const { tasks, sprints } = useApp();
  const { selectedProject: currentProject } = useProjectContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Generate calendar events from tasks, sprints, and meetings
  useEffect(() => {
    const calendarEvents: CalendarEvent[] = [];

    // Filter by current project or show all if no project selected
    const projectTasks = currentProject 
      ? tasks.filter(t => t.projectId === currentProject.id)
      : tasks;
    const projectSprints = currentProject 
      ? sprints.filter(s => s.projectId === currentProject.id)
      : sprints;

    // Add tasks
    projectTasks.forEach(task => {
      if (task.estimatedDate) {
        calendarEvents.push({
          id: `task-${task.id}`,
          title: task.title,
          date: new Date(task.estimatedDate),
          type: 'task',
          color: getTaskColor(task.status),
          assignee: task.assignedTo,
        });
      }
    });

    // Add sprints
    projectSprints.forEach(sprint => {
      if (sprint.startDate) {
        calendarEvents.push({
          id: `sprint-start-${sprint.id}`,
          title: `${sprint.name} (Start)`,
          date: new Date(sprint.startDate),
          type: 'sprint',
          color: '#8b5cf6',
        });
      }
      if (sprint.endDate) {
        calendarEvents.push({
          id: `sprint-end-${sprint.id}`,
          title: `${sprint.name} (End)`,
          date: new Date(sprint.endDate),
          type: 'sprint',
          color: '#8b5cf6',
        });
      }
    });

    // Add sample events for demonstration if no events exist
    if (calendarEvents.length === 0) {
      const today = new Date();
      calendarEvents.push(
        {
          id: 'sample-task-1',
          title: 'Sample Task',
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
          type: 'task',
          color: '#3b82f6',
        },
        {
          id: 'sample-sprint-1',
          title: 'Sprint Start',
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
          type: 'sprint',
          color: '#8b5cf6',
        }
      );
    }

    setEvents(calendarEvents);
  }, [tasks, sprints, currentProject]);

  const getTaskColor = (status: string): string => {
    switch (status) {
      case 'done':
        return '#10b981';
      case 'in-progress':
        return '#3b82f6';
      case 'review':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getEventTypeColor = (type: string): string => {
    switch (type) {
      case 'task':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'sprint':
        return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      case 'meeting':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'deadline':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'deliverable':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());
  
  const calendarDays: Date[] = [];
  const currentDay = new Date(startDate);
  while (calendarDays.length < 42) {
    calendarDays.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <div>
        <h1 className="text-4xl font-bold text-gradient">Calendar</h1>
        <p className="text-muted-foreground mt-2">
          {currentProject 
            ? `Calendar for ${currentProject.name}` 
            : "Project calendar with tasks, sprints, and meetings"}
        </p>
      </div>

      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextMonth}
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

            {/* Calendar Grid */}
            <div className="border border-border/50 rounded-lg overflow-hidden">
              {/* Week days header */}
              <div className="grid grid-cols-7 bg-muted/50">
                {weekDays.map(day => (
                  <div key={day} className="p-3 text-center font-semibold text-sm border-b border-border/50">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, idx) => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth = isSameMonth(day, currentDate);

                  return (
                    <div
                      key={idx}
                      className={`min-h-[140px] p-2 border-b border-r border-border/50 ${
                        !isCurrentMonth ? 'bg-muted/20' : 'bg-background'
                      } ${isToday ? 'bg-primary/10 border-primary' : ''}`}
                    >
                      <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-primary' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 4).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs p-1.5 rounded border truncate cursor-pointer hover:opacity-90 transition-opacity font-medium ${getEventTypeColor(event.type)}`}
                            title={event.title}
                          >
                            {event.title}
                          </div>
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

            {/* Events List */}
            {events.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Upcoming Events</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {events
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .slice(0, 10)
                    .map(event => (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg border ${getEventTypeColor(event.type)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{event.title}</p>
                            <p className="text-xs opacity-75">
                              {format(event.date, 'MMM d, yyyy')}
                            </p>
                          </div>
                          <span className="text-xs font-semibold capitalize">
                            {event.type}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
