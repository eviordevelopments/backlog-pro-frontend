import { format } from 'date-fns';
import { CalendarEvent } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface EventDetailsModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EventDetailsModal({
  event,
  open,
  onOpenChange,
}: EventDetailsModalProps) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>
            {format(event.date, 'EEEE, MMMM d, yyyy - ha')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Type */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Type</p>
            <p className="text-sm capitalize mt-1">{event.type}</p>
          </div>

          {/* Event Color */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Category</p>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: event.color }}
              />
              <span className="text-sm capitalize">{event.type}</span>
            </div>
          </div>

          {/* Assignee */}
          {event.assignee && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Assigned to</p>
              <p className="text-sm mt-1">{event.assignee}</p>
            </div>
          )}

          {/* Date and Time */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
            <p className="text-sm mt-1">
              {format(event.date, 'MMMM d, yyyy')}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(event.date, 'ha')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
