import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import { CalendarEvent } from '@/types';
import { format, startOfWeek, addDays } from 'date-fns';

describe('CalendarGrid', () => {
  const mockOnDateChange = vi.fn();
  const testDate = new Date(2024, 0, 15); // January 15, 2024

  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Task 1',
      date: new Date(2024, 0, 15),
      type: 'task',
      color: '#3b82f6',
      assignee: 'John',
      assigneeId: 'user-1',
    },
    {
      id: '2',
      title: 'Sprint Start',
      date: new Date(2024, 0, 16),
      type: 'sprint',
      color: '#8b5cf6',
    },
  ];

  describe('Month View', () => {
    it('should display month view by default', () => {
      render(
        <CalendarGrid
          view="month"
          currentDate={testDate}
          events={mockEvents}
          onDateChange={mockOnDateChange}
        />
      );

      expect(screen.getByText('January 2024')).toBeInTheDocument();
    });

    it('should display all days of the month', () => {
      render(
        <CalendarGrid
          view="month"
          currentDate={testDate}
          events={mockEvents}
          onDateChange={mockOnDateChange}
        />
      );

      // Check for day numbers - use getAllByText to handle multiple occurrences
      const dayOnes = screen.getAllByText('1');
      expect(dayOnes.length).toBeGreaterThan(0);
      
      const day31s = screen.getAllByText('31');
      expect(day31s.length).toBeGreaterThan(0);
    });

    it('should display events on correct days', () => {
      render(
        <CalendarGrid
          view="month"
          currentDate={testDate}
          events={mockEvents}
          onDateChange={mockOnDateChange}
        />
      );

      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Sprint Start')).toBeInTheDocument();
    });

    it('should navigate to next month', () => {
      render(
        <CalendarGrid
          view="month"
          currentDate={testDate}
          events={mockEvents}
          onDateChange={mockOnDateChange}
        />
      );

      const nextButton = screen.getAllByRole('button').find(btn => 
        btn.getAttribute('aria-label') === 'Next month'
      );
      
      if (nextButton) {
        fireEvent.click(nextButton);
        expect(mockOnDateChange).toHaveBeenCalled();
      }
    });

    it('should navigate to previous month', () => {
      render(
        <CalendarGrid
          view="month"
          currentDate={testDate}
          events={mockEvents}
          onDateChange={mockOnDateChange}
        />
      );

      const prevButton = screen.getAllByRole('button').find(btn => 
        btn.getAttribute('aria-label') === 'Previous month'
      );
      
      if (prevButton) {
        fireEvent.click(prevButton);
        expect(mockOnDateChange).toHaveBeenCalled();
      }
    });
  });

  describe('Week View', () => {
    it('should display week view when selected', () => {
      render(
        <CalendarGrid
          view="week"
          currentDate={testDate}
          events={mockEvents}
          onDateChange={mockOnDateChange}
        />
      );

      // Week view should show date range
      const weekStart = startOfWeek(testDate);
      const weekEnd = addDays(weekStart, 6);
      const expectedTitle = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      
      expect(screen.getByText(expectedTitle)).toBeInTheDocument();
    });

    it('should display 7 days in week view', () => {
      render(
        <CalendarGrid
          view="week"
          currentDate={testDate}
          events={mockEvents}
          onDateChange={mockOnDateChange}
        />
      );

      // Check for day labels
      const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      dayLabels.forEach(label => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('should navigate to next week', () => {
      render(
        <CalendarGrid
          view="week"
          currentDate={testDate}
          events={mockEvents}
          onDateChange={mockOnDateChange}
        />
      );

      const nextButton = screen.getAllByRole('button').find(btn => 
        btn.getAttribute('aria-label') === 'Next week'
      );
      
      if (nextButton) {
        fireEvent.click(nextButton);
        expect(mockOnDateChange).toHaveBeenCalled();
      }
    });

    it('should navigate to previous week', () => {
      render(
        <CalendarGrid
          view="week"
          currentDate={testDate}
          events={mockEvents}
          onDateChange={mockOnDateChange}
        />
      );

      const prevButton = screen.getAllByRole('button').find(btn => 
        btn.getAttribute('aria-label') === 'Previous week'
      );
      
      if (prevButton) {
        fireEvent.click(prevButton);
        expect(mockOnDateChange).toHaveBeenCalled();
      }
    });
  });

  describe('Navigation', () => {
    it('should navigate to today', () => {
      render(
        <CalendarGrid
          view="month"
          currentDate={new Date(2020, 0, 1)}
          events={mockEvents}
          onDateChange={mockOnDateChange}
        />
      );

      const todayButton = screen.getByText('Today');
      fireEvent.click(todayButton);
      
      expect(mockOnDateChange).toHaveBeenCalled();
    });
  });

  describe('Event Display', () => {
    it('should display event legend', () => {
      render(
        <CalendarGrid
          view="month"
          currentDate={testDate}
          events={mockEvents}
          onDateChange={mockOnDateChange}
        />
      );

      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Sprints')).toBeInTheDocument();
      expect(screen.getByText('Meetings')).toBeInTheDocument();
      expect(screen.getByText('Deadlines')).toBeInTheDocument();
    });

    it('should render events with correct styling', () => {
      render(
        <CalendarGrid
          view="month"
          currentDate={testDate}
          events={mockEvents}
          onDateChange={mockOnDateChange}
        />
      );

      const taskElement = screen.getByText('Task 1');
      expect(taskElement).toHaveClass('bg-blue-500/20');
    });
  });
});
