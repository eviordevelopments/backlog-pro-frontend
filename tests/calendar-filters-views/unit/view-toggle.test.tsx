import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewToggle from '@/components/calendar/ViewToggle';

describe('ViewToggle Component', () => {
  it('renders week and month toggle buttons', () => {
    const mockOnViewChange = vi.fn();
    render(
      <ViewToggle currentView="month" onViewChange={mockOnViewChange} />
    );

    expect(screen.getByRole('button', { name: /week/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /month/i })).toBeInTheDocument();
  });

  it('highlights the active view button with default variant', () => {
    const mockOnViewChange = vi.fn();
    const { rerender } = render(
      <ViewToggle currentView="month" onViewChange={mockOnViewChange} />
    );

    const monthButton = screen.getByRole('button', { name: /month/i });
    const weekButton = screen.getByRole('button', { name: /week/i });
    
    expect(monthButton).toHaveClass('bg-primary');
    expect(weekButton).not.toHaveClass('bg-primary');

    rerender(
      <ViewToggle currentView="week" onViewChange={mockOnViewChange} />
    );

    const updatedMonthButton = screen.getByRole('button', { name: /month/i });
    const updatedWeekButton = screen.getByRole('button', { name: /week/i });
    
    expect(updatedWeekButton).toHaveClass('bg-primary');
    expect(updatedMonthButton).not.toHaveClass('bg-primary');
  });

  it('calls onViewChange when week button is clicked', () => {
    const mockOnViewChange = vi.fn();
    render(
      <ViewToggle currentView="month" onViewChange={mockOnViewChange} />
    );

    const weekButton = screen.getByRole('button', { name: /week/i });
    fireEvent.click(weekButton);

    expect(mockOnViewChange).toHaveBeenCalledWith('week');
  });

  it('calls onViewChange when month button is clicked', () => {
    const mockOnViewChange = vi.fn();
    render(
      <ViewToggle currentView="week" onViewChange={mockOnViewChange} />
    );

    const monthButton = screen.getByRole('button', { name: /month/i });
    fireEvent.click(monthButton);

    expect(mockOnViewChange).toHaveBeenCalledWith('month');
  });

  it('sets aria-pressed attribute correctly for active view', () => {
    const mockOnViewChange = vi.fn();
    const { rerender } = render(
      <ViewToggle currentView="month" onViewChange={mockOnViewChange} />
    );

    let monthButton = screen.getByRole('button', { name: /month/i });
    let weekButton = screen.getByRole('button', { name: /week/i });

    expect(monthButton).toHaveAttribute('aria-pressed', 'true');
    expect(weekButton).toHaveAttribute('aria-pressed', 'false');

    rerender(
      <ViewToggle currentView="week" onViewChange={mockOnViewChange} />
    );

    monthButton = screen.getByRole('button', { name: /month/i });
    weekButton = screen.getByRole('button', { name: /week/i });

    expect(weekButton).toHaveAttribute('aria-pressed', 'true');
    expect(monthButton).toHaveAttribute('aria-pressed', 'false');
  });
});
