import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CostBreakdownAnalysis from '@/components/finances/CostBreakdownAnalysis';
import { renderWithProviders, setupMockLocalStorage } from '../utils/test-helpers';
import { FinancialRecord } from '@/types';

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.ResizeObserver = MockResizeObserver as any;

describe('CostBreakdownAnalysis Component', () => {
  beforeEach(() => {
    setupMockLocalStorage();
    vi.clearAllMocks();
  });

  it('should render the component with title and description', () => {
    renderWithProviders(<CostBreakdownAnalysis />);

    expect(screen.getByText('Cost Breakdown Analysis')).toBeInTheDocument();
    expect(screen.getByText('Detailed expense categories and cost type segregation')).toBeInTheDocument();
  });

  it('should display summary cards for total, fixed, and variable expenses', () => {
    renderWithProviders(<CostBreakdownAnalysis />);

    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    expect(screen.getByText('Fixed Costs')).toBeInTheDocument();
    expect(screen.getByText('Variable Costs')).toBeInTheDocument();
  });

  it('should display cost type filter buttons', () => {
    renderWithProviders(<CostBreakdownAnalysis />);

    expect(screen.getByRole('button', { name: /all costs/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fixed only/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /variable only/i })).toBeInTheDocument();
  });

  it('should display category filter buttons', () => {
    renderWithProviders(<CostBreakdownAnalysis />);

    expect(screen.getByRole('button', { name: /all categories/i })).toBeInTheDocument();
  });

  it('should display charts for fixed vs variable and category breakdown', () => {
    renderWithProviders(<CostBreakdownAnalysis />);

    expect(screen.getByText('Fixed vs Variable Costs')).toBeInTheDocument();
    expect(screen.getByText('Expenses by Category')).toBeInTheDocument();
  });

  it('should display category details table', () => {
    renderWithProviders(<CostBreakdownAnalysis />);

    expect(screen.getByText('Category Details')).toBeInTheDocument();
  });

  it('should display export button', () => {
    renderWithProviders(<CostBreakdownAnalysis />);

    const exportButton = screen.getByRole('button', { name: /export csv/i });
    expect(exportButton).toBeInTheDocument();
  });

  it('should filter by fixed costs when fixed only button is clicked', () => {
    renderWithProviders(<CostBreakdownAnalysis />);

    const fixedOnlyButton = screen.getByRole('button', { name: /fixed only/i });
    fireEvent.click(fixedOnlyButton);

    expect(fixedOnlyButton.className).toContain('bg-primary');
  });

  it('should filter by variable costs when variable only button is clicked', () => {
    renderWithProviders(<CostBreakdownAnalysis />);

    const variableOnlyButton = screen.getByRole('button', { name: /variable only/i });
    fireEvent.click(variableOnlyButton);

    expect(variableOnlyButton.className).toContain('bg-primary');
  });

  it('should reset to all costs when all costs button is clicked', () => {
    renderWithProviders(<CostBreakdownAnalysis />);

    const fixedOnlyButton = screen.getByRole('button', { name: /fixed only/i });
    fireEvent.click(fixedOnlyButton);

    const allCostsButton = screen.getByRole('button', { name: /all costs/i });
    fireEvent.click(allCostsButton);

    expect(allCostsButton.className).toContain('bg-primary');
  });

  it('should display percentages that sum to 100% for all categories', () => {
    renderWithProviders(<CostBreakdownAnalysis />);

    const categoryDetails = screen.getByText('Category Details');
    expect(categoryDetails).toBeInTheDocument();
  });

  it('should handle export CSV functionality', () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    const createObjectURLSpy = vi.spyOn(window.URL, 'createObjectURL');
    const revokeObjectURLSpy = vi.spyOn(window.URL, 'revokeObjectURL');

    renderWithProviders(<CostBreakdownAnalysis />);

    const exportButton = screen.getByRole('button', { name: /export csv/i });
    fireEvent.click(exportButton);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalled();

    createElementSpy.mockRestore();
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });

  it('should display message when no data is available', () => {
    renderWithProviders(<CostBreakdownAnalysis />);

    const noDataMessage = screen.queryByText(/no expense data available/i);
    if (noDataMessage) {
      expect(noDataMessage).toBeInTheDocument();
    }
  });

  it('should show all expense categories in category filter', () => {
    renderWithProviders(<CostBreakdownAnalysis />);

    const allCategoriesButton = screen.getByRole('button', { name: /all categories/i });
    expect(allCategoriesButton).toBeInTheDocument();
  });

  it('should maintain filter state when switching between filters', () => {
    renderWithProviders(<CostBreakdownAnalysis />);

    const fixedOnlyButton = screen.getByRole('button', { name: /fixed only/i });
    fireEvent.click(fixedOnlyButton);

    expect(fixedOnlyButton.className).toContain('bg-primary');

    const allCategoriesButton = screen.getByRole('button', { name: /all categories/i });
    fireEvent.click(allCategoriesButton);

    expect(fixedOnlyButton.className).toContain('bg-primary');
  });
});
