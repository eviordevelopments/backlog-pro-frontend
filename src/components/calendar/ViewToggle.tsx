import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays } from 'lucide-react';

interface ViewToggleProps {
  currentView: 'week' | 'month';
  onViewChange: (view: 'week' | 'month') => void;
}

export default function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex gap-2 bg-muted/50 p-1 rounded-lg w-fit">
      <Button
        variant={currentView === 'week' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('week')}
        className="gap-2"
        aria-pressed={currentView === 'week'}
      >
        <Calendar className="h-4 w-4" />
        Week
      </Button>
      <Button
        variant={currentView === 'month' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('month')}
        className="gap-2"
        aria-pressed={currentView === 'month'}
      >
        <CalendarDays className="h-4 w-4" />
        Month
      </Button>
    </div>
  );
}
