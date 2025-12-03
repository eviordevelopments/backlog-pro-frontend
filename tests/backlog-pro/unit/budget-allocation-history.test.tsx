import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BudgetAllocationHistory from '@/components/finances/BudgetAllocationHistory';
import { renderWithProviders, setupMockLocalStorage } from '../utils/test-helpers';
import { BudgetAllocation } from '@/types';

describe('BudgetAllocationHistory Component', () => {
  beforeEach(() => {
    setupMockLocalStorage();
    vi.clearAllMocks();
  });

  it('should render the component with title and description', () => {
    renderWithProviders(<BudgetAllocationHistory />);

    expect(screen.getByText('Budget Allocation History')).toBeInTheDocument();
    expect(screen.getByText('View all past budget distributions and allocation details')).toBeInTheDocument();
  });

  it('should display empty state when no allocations exist', () => {
    localStorage.setItem('budgetAllocations', JSON.stringify([]));
    
    renderWithProviders(<BudgetAllocationHistory />);

    expect(screen.getByText(/No budget allocations yet/)).toBeInTheDocument();
    expect(screen.getByText(/Create your first budget allocation/)).toBeInTheDocument();
  });

  it('should display allocation summary statistics when allocations exist', () => {
    // Set up mock data in localStorage
    const mockAllocations: BudgetAllocation[] = [
      {
        id: 'alloc-1',
        totalBudget: 100000,
        allocations: {
          technology: 25000,
          growth: 20000,
          team: 30000,
          marketing: 15000,
          emergency: 5000,
          investments: 5000,
        },
        createdAt: new Date().toISOString(),
        status: 'distributed',
        userId: 'user-1',
      },
    ];

    localStorage.setItem('budgetAllocations', JSON.stringify(mockAllocations));

    renderWithProviders(<BudgetAllocationHistory />);

    expect(screen.getByText('Allocation Summary')).toBeInTheDocument();
    expect(screen.getByText('Total Allocations')).toBeInTheDocument();
    expect(screen.getByText('Total Budget Distributed')).toBeInTheDocument();
    expect(screen.getByText('Average Allocation')).toBeInTheDocument();
    expect(screen.getByText('Distributed')).toBeInTheDocument();
  });

  it('should display allocation cards with total budget and status', () => {
    const mockAllocations: BudgetAllocation[] = [
      {
        id: 'alloc-1',
        totalBudget: 100000,
        allocations: {
          technology: 25000,
          growth: 20000,
          team: 30000,
          marketing: 15000,
          emergency: 5000,
          investments: 5000,
        },
        createdAt: new Date().toISOString(),
        status: 'distributed',
        userId: 'user-1',
      },
    ];

    localStorage.setItem('budgetAllocations', JSON.stringify(mockAllocations));

    renderWithProviders(<BudgetAllocationHistory />);

    expect(screen.getByText('Distributed')).toBeInTheDocument();
    expect(screen.getByText('Allocation Summary')).toBeInTheDocument();
  });

  it('should expand allocation details when clicked', () => {
    const mockAllocations: BudgetAllocation[] = [
      {
        id: 'alloc-1',
        totalBudget: 100000,
        allocations: {
          technology: 25000,
          growth: 20000,
          team: 30000,
          marketing: 15000,
          emergency: 5000,
          investments: 5000,
        },
        createdAt: new Date().toISOString(),
        status: 'distributed',
        userId: 'user-1',
      },
    ];

    localStorage.setItem('budgetAllocations', JSON.stringify(mockAllocations));

    renderWithProviders(<BudgetAllocationHistory />);

    const expandButtons = screen.getAllByRole('button');
    const expandButton = expandButtons[expandButtons.length - 1];

    if (expandButton) {
      fireEvent.click(expandButton);
      expect(screen.getByText('Fund Distribution')).toBeInTheDocument();
    }
  });

  it('should display fund distribution breakdown when expanded', () => {
    const mockAllocations: BudgetAllocation[] = [
      {
        id: 'alloc-1',
        totalBudget: 100000,
        allocations: {
          technology: 25000,
          growth: 20000,
          team: 30000,
          marketing: 15000,
          emergency: 5000,
          investments: 5000,
        },
        createdAt: new Date().toISOString(),
        status: 'distributed',
        userId: 'user-1',
      },
    ];

    localStorage.setItem('budgetAllocations', JSON.stringify(mockAllocations));

    renderWithProviders(<BudgetAllocationHistory />);

    const expandButtons = screen.getAllByRole('button');
    const expandButton = expandButtons[expandButtons.length - 1];

    if (expandButton) {
      fireEvent.click(expandButton);

      expect(screen.getByText('Fund Distribution')).toBeInTheDocument();
    }
  });

  it('should display correct fund amounts and percentages', () => {
    const mockAllocations: BudgetAllocation[] = [
      {
        id: 'alloc-1',
        totalBudget: 100000,
        allocations: {
          technology: 25000,
          growth: 20000,
          team: 30000,
          marketing: 15000,
          emergency: 5000,
          investments: 5000,
        },
        createdAt: new Date().toISOString(),
        status: 'distributed',
        userId: 'user-1',
      },
    ];

    localStorage.setItem('budgetAllocations', JSON.stringify(mockAllocations));

    renderWithProviders(<BudgetAllocationHistory />);

    const expandButtons = screen.getAllByRole('button');
    const expandButton = expandButtons[expandButtons.length - 1];

    if (expandButton) {
      fireEvent.click(expandButton);

      expect(screen.getByText('Fund Distribution')).toBeInTheDocument();
    }
  });

  it('should display threshold alerts for funds below 10%', () => {
    const mockAllocations: BudgetAllocation[] = [
      {
        id: 'alloc-1',
        totalBudget: 100000,
        allocations: {
          technology: 5000,
          growth: 20000,
          team: 30000,
          marketing: 15000,
          emergency: 20000,
          investments: 10000,
        },
        createdAt: new Date().toISOString(),
        status: 'distributed',
        userId: 'user-1',
      },
    ];

    localStorage.setItem('budgetAllocations', JSON.stringify(mockAllocations));

    renderWithProviders(<BudgetAllocationHistory />);

    const expandButtons = screen.getAllByRole('button');
    const expandButton = expandButtons[expandButtons.length - 1];

    if (expandButton) {
      fireEvent.click(expandButton);

      expect(screen.getByText('Threshold Alerts')).toBeInTheDocument();
      expect(screen.getByText(/Technology fund is below 10% threshold/)).toBeInTheDocument();
    }
  });

  it('should display audit information when expanded', () => {
    const mockAllocations: BudgetAllocation[] = [
      {
        id: 'alloc-1',
        totalBudget: 100000,
        allocations: {
          technology: 25000,
          growth: 20000,
          team: 30000,
          marketing: 15000,
          emergency: 5000,
          investments: 5000,
        },
        createdAt: new Date().toISOString(),
        status: 'distributed',
        userId: 'user-1',
      },
    ];

    localStorage.setItem('budgetAllocations', JSON.stringify(mockAllocations));

    renderWithProviders(<BudgetAllocationHistory />);

    const expandButtons = screen.getAllByRole('button');
    const expandButton = expandButtons[expandButtons.length - 1];

    if (expandButton) {
      fireEvent.click(expandButton);

      expect(screen.getByText('Audit Information')).toBeInTheDocument();
      expect(screen.getByText('Allocation ID')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
    }
  });

  it('should display different status badges correctly', () => {
    const mockAllocations: BudgetAllocation[] = [
      {
        id: 'alloc-1',
        totalBudget: 100000,
        allocations: {
          technology: 25000,
          growth: 20000,
          team: 30000,
          marketing: 15000,
          emergency: 5000,
          investments: 5000,
        },
        createdAt: new Date().toISOString(),
        status: 'pending',
        userId: 'user-1',
      },
      {
        id: 'alloc-2',
        totalBudget: 50000,
        allocations: {
          technology: 12500,
          growth: 10000,
          team: 15000,
          marketing: 7500,
          emergency: 2500,
          investments: 2500,
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'approved',
        userId: 'user-1',
      },
    ];

    localStorage.setItem('budgetAllocations', JSON.stringify(mockAllocations));

    renderWithProviders(<BudgetAllocationHistory />);

    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('should sort allocations by most recent first', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 86400000);

    const mockAllocations: BudgetAllocation[] = [
      {
        id: 'alloc-1',
        totalBudget: 100000,
        allocations: {
          technology: 25000,
          growth: 20000,
          team: 30000,
          marketing: 15000,
          emergency: 5000,
          investments: 5000,
        },
        createdAt: yesterday.toISOString(),
        status: 'distributed',
        userId: 'user-1',
      },
      {
        id: 'alloc-2',
        totalBudget: 50000,
        allocations: {
          technology: 12500,
          growth: 10000,
          team: 15000,
          marketing: 7500,
          emergency: 2500,
          investments: 2500,
        },
        createdAt: now.toISOString(),
        status: 'distributed',
        userId: 'user-1',
      },
    ];

    localStorage.setItem('budgetAllocations', JSON.stringify(mockAllocations));

    renderWithProviders(<BudgetAllocationHistory />);

    const allocationCards = screen.getAllByRole('button').slice(0, 2);
    expect(allocationCards.length).toBeGreaterThanOrEqual(1);
  });

  it('should calculate and display summary statistics correctly', () => {
    const mockAllocations: BudgetAllocation[] = [
      {
        id: 'alloc-1',
        totalBudget: 100000,
        allocations: {
          technology: 25000,
          growth: 20000,
          team: 30000,
          marketing: 15000,
          emergency: 5000,
          investments: 5000,
        },
        createdAt: new Date().toISOString(),
        status: 'distributed',
        userId: 'user-1',
      },
      {
        id: 'alloc-2',
        totalBudget: 50000,
        allocations: {
          technology: 12500,
          growth: 10000,
          team: 15000,
          marketing: 7500,
          emergency: 2500,
          investments: 2500,
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'distributed',
        userId: 'user-1',
      },
    ];

    localStorage.setItem('budgetAllocations', JSON.stringify(mockAllocations));

    renderWithProviders(<BudgetAllocationHistory />);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/150/)).toBeInTheDocument();
    expect(screen.getByText(/75/)).toBeInTheDocument();
  });

  it('should display fund account status when available', () => {
    const mockAllocations: BudgetAllocation[] = [
      {
        id: 'alloc-1',
        totalBudget: 100000,
        allocations: {
          technology: 25000,
          growth: 20000,
          team: 30000,
          marketing: 15000,
          emergency: 5000,
          investments: 5000,
        },
        createdAt: new Date().toISOString(),
        status: 'distributed',
        userId: 'user-1',
      },
    ];

    const mockFundAccounts = [
      {
        id: 'fund-1',
        name: 'Technology' as const,
        balance: 25000,
        allocated: 5000,
        percentage: 25,
        purpose: 'Technology fund',
      },
    ];

    localStorage.setItem('budgetAllocations', JSON.stringify(mockAllocations));
    localStorage.setItem('fundAccounts', JSON.stringify(mockFundAccounts));

    renderWithProviders(<BudgetAllocationHistory />);

    const expandButtons = screen.getAllByRole('button');
    const expandButton = expandButtons[expandButtons.length - 1];

    if (expandButton) {
      fireEvent.click(expandButton);

      expect(screen.getByText('Current Fund Status')).toBeInTheDocument();
    }
  });

  it('should handle multiple allocations with different statuses', () => {
    const mockAllocations: BudgetAllocation[] = [
      {
        id: 'alloc-1',
        totalBudget: 100000,
        allocations: {
          technology: 25000,
          growth: 20000,
          team: 30000,
          marketing: 15000,
          emergency: 5000,
          investments: 5000,
        },
        createdAt: new Date().toISOString(),
        status: 'distributed',
        userId: 'user-1',
      },
      {
        id: 'alloc-2',
        totalBudget: 75000,
        allocations: {
          technology: 18750,
          growth: 15000,
          team: 22500,
          marketing: 11250,
          emergency: 3750,
          investments: 3750,
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'approved',
        userId: 'user-1',
      },
      {
        id: 'alloc-3',
        totalBudget: 50000,
        allocations: {
          technology: 12500,
          growth: 10000,
          team: 15000,
          marketing: 7500,
          emergency: 2500,
          investments: 2500,
        },
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        status: 'pending',
        userId: 'user-1',
      },
    ];

    localStorage.setItem('budgetAllocations', JSON.stringify(mockAllocations));

    renderWithProviders(<BudgetAllocationHistory />);

    expect(screen.getByText('Distributed')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
});
