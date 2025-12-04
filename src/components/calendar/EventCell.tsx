import { format } from 'date-fns';
import { CalendarEvent } from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EventCellProps {
  event: CalendarEvent;
  compact?: boolean;
}

const EVENT_TYPE_COLORS = {
  task: 'bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30',
  sprint: 'bg-purple-500/20 text-purple-700 border-purple-500/30 hover:bg-purple-500/30',
  meeting: 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30',
  deadline: 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30',
};

const EVENT_TYPE_LABELS = {
  task: 'Task',
  sprint: 'Sprint',
  meeting: 'Meeting',
  deadline: 'Deadline',
};

export default function EventCell({ event, compact = false }: EventCellProps) {
  const colorClass = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.task;

  const tooltipContent = (
    <div className="space-y-1">
      <p className="font-semibold">{event.title}</p>
      <p className="text-xs">{format(event.date, 'MMM d, yyyy')}</p>
      {event.assignee && <p className="text-xs">Assignee: {event.assignee}</p>}
      <p className="text-xs capitalize">{EVENT_TYPE_LABELS[event.type]}</p>
    </div>
  );

  const eventElement = (
    <div
      className={`${colorClass} border rounded p-1.5 cursor-pointer transition-colors font-medium ${
        compact ? 'text-xs truncate' : 'text-xs'
      }`}
      title={event.title}
    >
      {event.title}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{eventElement}</TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
