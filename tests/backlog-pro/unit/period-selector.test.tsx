import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PeriodSelector from '@/components/finances/PeriodSelector';

describe('PeriodSelector Component', () => {
  it('should render all period options', () => {
    const handleChange = vi.fn();
    render(
      <PeriodSelector selectedPeriod="monthly" onPeriodChange={handleChange} />
    );

    expect(screen.getByRole('button', { name: /monthly/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /quarterly/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /annual/i })).toBeInTheDocument();
  });

  it('should highlight the selected period', () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <PeriodSelector selectedPeriod="monthly" onPeriodChange={handleChange} />
    );

    const monthlyButton = screen.getByRole('button', { name: /monthly/i });
    // Check that the monthly button has the 'default' variant (selected)
    expect(monthlyButton.className).toContain('bg-primary');

    rerender(
      <PeriodSelector selectedPeriod="quarterly" onPeriodChange={handleChange} />
    );

    const quarterlyButton = screen.getByRole('button', { name: /quarterly/i });
    // Check that the quarterly button now has the 'default' variant (selected)
    expect(quarterlyButton.className).toContain('bg-primary');
  });

  it('should call onPeriodChange when a period is clicked', () => {
    const handleChange = vi.fn();
    render(
      <PeriodSelector selectedPeriod="monthly" onPeriodChange={handleChange} />
    );

    const quarterlyButton = screen.getByRole('button', { name: /quarterly/i });
    fireEvent.click(quarterlyButton);

    expect(handleChange).toHaveBeenCalledWith('quarterly');
  });

  it('should call onPeriodChange with correct period value for each button', () => {
    const handleChange = vi.fn();
    render(
      <PeriodSelector selectedPeriod="monthly" onPeriodChange={handleChange} />
    );

    const annualButton = screen.getByRole('button', { name: /annual/i });
    fireEvent.click(annualButton);

    expect(handleChange).toHaveBeenCalledWith('annual');
  });

  it('should handle multiple period changes', () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <PeriodSelector selectedPeriod="monthly" onPeriodChange={handleChange} />
    );

    const quarterlyButton = screen.getByRole('button', { name: /quarterly/i });
    fireEvent.click(quarterlyButton);
    expect(handleChange).toHaveBeenCalledWith('quarterly');

    rerender(
      <PeriodSelector selectedPeriod="quarterly" onPeriodChange={handleChange} />
    );

    const annualButton = screen.getByRole('button', { name: /annual/i });
    fireEvent.click(annualButton);
    expect(handleChange).toHaveBeenCalledWith('annual');

    expect(handleChange).toHaveBeenCalledTimes(2);
  });
});
