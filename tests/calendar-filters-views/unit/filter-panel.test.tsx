import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterPanel from '@/components/calendar/FilterPanel';
import { FilterState, TeamMember } from '@/types';

describe('FilterPanel Component', () => {
  const mockTeamMembers: TeamMember[] = [
    { id: '1', name: 'Pedro' },
    { id: '2', name: 'David' },
    { id: '3', name: 'Morena' },
  ];

  const mockFilterState: FilterState = {
    categories: {
      tasks: true,
      sprints: true,
      meetings: true,
      deadlines: true,
    },
    teamMembers: ['1', '2', '3'],
    viewMode: 'month',
  };

  const mockHandlers = {
    onCategoryChange: vi.fn(),
    onTeamMemberChange: vi.fn(),
    onResetFilters: vi.fn(),
  };

  it('should render filter panel with title', () => {
    render(
      <FilterPanel
        filterState={mockFilterState}
        teamMembers={mockTeamMembers}
        visibleEventCount={10}
        totalEventCount={15}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('should display category filter checkboxes', () => {
    render(
      <FilterPanel
        filterState={mockFilterState}
        teamMembers={mockTeamMembers}
        visibleEventCount={10}
        totalEventCount={15}
        {...mockHandlers}
      />
    );

    expect(screen.getByLabelText('Tasks')).toBeInTheDocument();
    expect(screen.getByLabelText('Sprints')).toBeInTheDocument();
    expect(screen.getByLabelText('Meetings')).toBeInTheDocument();
    expect(screen.getByLabelText('Deadlines')).toBeInTheDocument();
  });

  it('should display team member checkboxes', () => {
    render(
      <FilterPanel
        filterState={mockFilterState}
        teamMembers={mockTeamMembers}
        visibleEventCount={10}
        totalEventCount={15}
        {...mockHandlers}
      />
    );

    expect(screen.getByLabelText('Pedro')).toBeInTheDocument();
    expect(screen.getByLabelText('David')).toBeInTheDocument();
    expect(screen.getByLabelText('Morena')).toBeInTheDocument();
  });

  it('should call onCategoryChange when category checkbox is toggled', () => {
    render(
      <FilterPanel
        filterState={mockFilterState}
        teamMembers={mockTeamMembers}
        visibleEventCount={10}
        totalEventCount={15}
        {...mockHandlers}
      />
    );

    const tasksCheckbox = screen.getByLabelText('Tasks') as HTMLInputElement;
    fireEvent.click(tasksCheckbox);

    expect(mockHandlers.onCategoryChange).toHaveBeenCalledWith('tasks', false);
  });

  it('should call onTeamMemberChange when team member checkbox is toggled', () => {
    render(
      <FilterPanel
        filterState={mockFilterState}
        teamMembers={mockTeamMembers}
        visibleEventCount={10}
        totalEventCount={15}
        {...mockHandlers}
      />
    );

    const pedroCheckbox = screen.getByLabelText('Pedro') as HTMLInputElement;
    fireEvent.click(pedroCheckbox);

    expect(mockHandlers.onTeamMemberChange).toHaveBeenCalledWith('1', false);
  });

  it('should display event counter with visible and total counts', () => {
    render(
      <FilterPanel
        filterState={mockFilterState}
        teamMembers={mockTeamMembers}
        visibleEventCount={8}
        totalEventCount={15}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('8 of 15')).toBeInTheDocument();
  });

  it('should display reset button', () => {
    render(
      <FilterPanel
        filterState={mockFilterState}
        teamMembers={mockTeamMembers}
        visibleEventCount={10}
        totalEventCount={15}
        {...mockHandlers}
      />
    );

    const resetButton = screen.getByRole('button', { name: /reset filters/i });
    expect(resetButton).toBeInTheDocument();
  });

  it('should call onResetFilters when reset button is clicked', () => {
    const filteredState: FilterState = {
      categories: {
        tasks: true,
        sprints: false,
        meetings: true,
        deadlines: true,
      },
      teamMembers: ['1'],
      viewMode: 'month',
    };

    render(
      <FilterPanel
        filterState={filteredState}
        teamMembers={mockTeamMembers}
        visibleEventCount={5}
        totalEventCount={15}
        {...mockHandlers}
      />
    );

    const resetButton = screen.getByRole('button', { name: /reset filters/i });
    fireEvent.click(resetButton);

    expect(mockHandlers.onResetFilters).toHaveBeenCalled();
  });

  it('should show active filter indicator when filters are applied', () => {
    const filteredState: FilterState = {
      categories: {
        tasks: true,
        sprints: false,
        meetings: true,
        deadlines: true,
      },
      teamMembers: ['1'],
      viewMode: 'month',
    };

    render(
      <FilterPanel
        filterState={filteredState}
        teamMembers={mockTeamMembers}
        visibleEventCount={5}
        totalEventCount={15}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should disable reset button when no filters are active', () => {
    render(
      <FilterPanel
        filterState={mockFilterState}
        teamMembers={mockTeamMembers}
        visibleEventCount={15}
        totalEventCount={15}
        {...mockHandlers}
      />
    );

    const resetButton = screen.getByRole('button', { name: /reset filters/i });
    expect(resetButton).toBeDisabled();
  });

  it('should open drawer on mobile when filter button is clicked', () => {
    render(
      <FilterPanel
        filterState={mockFilterState}
        teamMembers={mockTeamMembers}
        visibleEventCount={10}
        totalEventCount={15}
        isMobile={true}
        {...mockHandlers}
      />
    );

    const filterButton = screen.getByRole('button', { name: /filters/i });
    expect(filterButton).toBeInTheDocument();

    fireEvent.click(filterButton);

    const drawerTitle = screen.getByText('Filter Events');
    expect(drawerTitle).toBeInTheDocument();
  });

  it('should display progress bar with correct width based on event count', () => {
    const { container } = render(
      <FilterPanel
        filterState={mockFilterState}
        teamMembers={mockTeamMembers}
        visibleEventCount={5}
        totalEventCount={10}
        {...mockHandlers}
      />
    );

    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toHaveStyle('width: 50%');
  });

  it('should handle zero total events gracefully', () => {
    render(
      <FilterPanel
        filterState={mockFilterState}
        teamMembers={mockTeamMembers}
        visibleEventCount={0}
        totalEventCount={0}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('0 of 0')).toBeInTheDocument();
  });

  it('should check category checkboxes based on filter state', () => {
    render(
      <FilterPanel
        filterState={mockFilterState}
        teamMembers={mockTeamMembers}
        visibleEventCount={10}
        totalEventCount={15}
        {...mockHandlers}
      />
    );

    const tasksCheckbox = screen.getByRole('checkbox', { name: /tasks/i });
    const sprintsCheckbox = screen.getByRole('checkbox', { name: /sprints/i });

    expect(tasksCheckbox).toHaveAttribute('data-state', 'checked');
    expect(sprintsCheckbox).toHaveAttribute('data-state', 'checked');
  });

  it('should check team member checkboxes based on selected members', () => {
    render(
      <FilterPanel
        filterState={mockFilterState}
        teamMembers={mockTeamMembers}
        visibleEventCount={10}
        totalEventCount={15}
        {...mockHandlers}
      />
    );

    const pedroCheckbox = screen.getByRole('checkbox', { name: /pedro/i });
    const davidCheckbox = screen.getByRole('checkbox', { name: /david/i });

    expect(pedroCheckbox).toHaveAttribute('data-state', 'checked');
    expect(davidCheckbox).toHaveAttribute('data-state', 'checked');
  });

  it('should uncheck team member checkbox when not in selected members', () => {
    const partialSelectionState: FilterState = {
      categories: mockFilterState.categories,
      teamMembers: ['1'],
      viewMode: 'month',
    };

    render(
      <FilterPanel
        filterState={partialSelectionState}
        teamMembers={mockTeamMembers}
        visibleEventCount={5}
        totalEventCount={15}
        {...mockHandlers}
      />
    );

    const pedroCheckbox = screen.getByRole('checkbox', { name: /pedro/i });
    const davidCheckbox = screen.getByRole('checkbox', { name: /david/i });

    expect(pedroCheckbox).toHaveAttribute('data-state', 'checked');
    expect(davidCheckbox).toHaveAttribute('data-state', 'unchecked');
  });
});
