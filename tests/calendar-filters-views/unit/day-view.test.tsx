import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DayView from '@/components/calendar/DayView';
import { CalendarEvent } from '@/types';

describe('DayView', () => {
  const testDate = new Date(2024, 0, 15); // January 15, 2024

  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Morning Task',
      date: new Date(2024, 0, 15, 9, 0),
      type: 'task',
      color: '#3b82f6',
      assignee: 'John',
      assigneeId: 'user-1',
    },
    {
      id: '2',
      title: 'Midday Meeting',
      date: new Date(2024, 0, 15, 12, 0),
      type: 'meeting',
      color: '#10b981',
      assignee: 'Jane',
      assigneeId: 'user-2',
    },
    {
      id: '3',
      title: 'Afternoon Sprint',
      date: new Date(2024, 0, 15, 14, 0),
      type: 'sprint',
      color: '#8b5cf6',
    },
    {
      id: '4',
      title: 'Evening Deadline',
      date: new Date(2024, 0, 15, 17, 0),
      type: 'deadline',
      color: '#ef4444',
    },
    {
      id: '5',
      title: 'Different Day Event',
      date: new Date(2024, 0, 16, 10, 0),
      type: 'task',
      color: '#3b82f6',
    },
  ];

  describe('Rendering', () => {
    it('should display the correct date in header', () => {
      render(<DayView currentDate={testDate} events={mockEvents} />);

      expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
    });

    it('should display event count in header', () => {
      render(<DayView currentDate={testDate} events={mockEvents} />);

      const header = screen.getByText(/event.*today/);
      expect(header).toBeInTheDocument();
    });

    it('should display all 24 hours', () => {
      render(<DayView currentDate={testDate} events={mockEvents} />);

      expect(screen.getAllByText('12AM').length).toBeGreaterThan(0);
      expect(screen.getAllByText('12PM').length).toBeGreaterThan(0);
      expect(screen.getAllByText('11PM').length).toBeGreaterThan(0);
    });

    it('should display events at correct hours', () => {
      render(<DayView currentDate={testDate} events={mockEvents} />);

      expect(screen.getByText('Morning Task')).toBeInTheDocument();
      expect(screen.getByText('Midday Meeting')).toBeInTheDocument();
      expect(screen.getByText('Afternoon Sprint')).toBeInTheDocument();
      expect(screen.getByText('Evening Deadline')).toBeInTheDocument();
    });

    it('should not display events from different days', () => {
      render(<DayView currentDate={testDate} events={mockEvents} />);

      expect(screen.queryByText('Different Day Event')).not.toBeInTheDocument();
    });
  });

  describe('Event Grouping', () => {
    it('should group events by hour', () => {
      render(<DayView currentDate={testDate} events={mockEvents} />);

      const morningTask = screen.getByText('Morning Task');
      const middayMeeting = screen.getByText('Midday Meeting');

      expect(morningTask).toBeInTheDocument();
      expect(middayMeeting).toBeInTheDocument();
    });

    it('should display multiple events in same hour', () => {
      const eventsInSameHour: CalendarEvent[] = [
        {
          id: '1',
          title: 'Event 1',
          date: new Date(2024, 0, 15, 10, 0),
          type: 'task',
          color: '#3b82f6',
        },
        {
          id: '2',
          title: 'Event 2',
          date: new Date(2024, 0, 15, 10, 30),
          type: 'meeting',
          color: '#10b981',
        },
      ];

      render(<DayView currentDate={testDate} events={eventsInSameHour} />);

      expect(screen.getByText('Event 1')).toBeInTheDocument();
      expect(screen.getByText('Event 2')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should display "No events" for empty hours', () => {
      render(<DayView currentDate={testDate} events={[]} />);

      const noEventsElements = screen.getAllByText('No events');
      expect(noEventsElements.length).toBeGreaterThan(0);
    });

    it('should handle day with no events', () => {
      render(<DayView currentDate={testDate} events={[]} />);

      expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
      const noEventsElements = screen.getAllByText('No events');
      expect(noEventsElements.length).toBeGreaterThan(0);
    });
  });

  describe('Event Types', () => {
    it('should display different event types', () => {
      render(<DayView currentDate={testDate} events={mockEvents} />);

      expect(screen.getByText('Morning Task')).toBeInTheDocument();
      expect(screen.getByText('Midday Meeting')).toBeInTheDocument();
      expect(screen.getByText('Afternoon Sprint')).toBeInTheDocument();
      expect(screen.getByText('Evening Deadline')).toBeInTheDocument();
    });
  });

  describe('Time Display', () => {
    it('should format hours correctly', () => {
      render(<DayView currentDate={testDate} events={mockEvents} />);

      expect(screen.getAllByText('9AM').length).toBeGreaterThan(0);
      expect(screen.getAllByText('12PM').length).toBeGreaterThan(0);
      expect(screen.getAllByText('2PM').length).toBeGreaterThan(0);
      expect(screen.getAllByText('5PM').length).toBeGreaterThan(0);
    });

    it('should display Mexico timezone (GMT-3)', () => {
      render(<DayView currentDate={testDate} events={mockEvents} />);

      expect(screen.getAllByText(/Mexico \(GMT-3\)/).length).toBeGreaterThan(0);
    });

    it('should display Argentina timezone label', () => {
      render(<DayView currentDate={testDate} events={mockEvents} />);

      expect(screen.getAllByText('Argentina').length).toBeGreaterThan(0);
    });
  });
});
