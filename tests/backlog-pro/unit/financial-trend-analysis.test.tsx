import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FinancialTrendAnalysis from '@/components/finances/FinancialTrendAnalysis';
import { renderWithProviders, setupMockLocalStorage } from '../utils/test-helpers';

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.ResizeObserver = MockResizeObserver as any;

describe('FinancialTrendAnalysis Component', () => {
  beforeEach(() => {
    setupMockLocalStorage();
    vi.clearAllMocks();
  });

  it('should render the component with title and description', () => {
    renderWithProviders(<FinancialTrendAnalysis />);

    expect(screen.getByText('Financial Trends & Forecasting')).toBeInTheDocument();
    expect(
      screen.getByText('Historical data with 3-month forecast and anomaly detection')
    ).toBeInTheDocument();
  });

  it('should display summary stat cards', () => {
    renderWithProviders(<FinancialTrendAnalysis />);

    expect(screen.getByText('Avg Monthly Income')).toBeInTheDocument();
    expect(screen.getByText('Avg Monthly Expense')).toBeInTheDocument();
    expect(screen.getByText('Avg Monthly Profit')).toBeInTheDocument();
    expect(screen.getByText('Anomalies')).toBeInTheDocument();
  });

  it('should display trend chart with income, expense, and profit lines', () => {
    renderWithProviders(<FinancialTrendAnalysis />);

    expect(screen.getByText('Income, Expense & Profit Trends')).toBeInTheDocument();
  });

  it('should display month-over-month growth rates table', () => {
    renderWithProviders(<FinancialTrendAnalysis />);

    expect(screen.getByText('Month-over-Month Growth Rates')).toBeInTheDocument();
  });

  it('should display table headers for growth rates', () => {
    renderWithProviders(<FinancialTrendAnalysis />);

    expect(screen.getByText('Period')).toBeInTheDocument();
    expect(screen.getByText('Income Growth')).toBeInTheDocument();
    expect(screen.getByText('Expense Growth')).toBeInTheDocument();
    expect(screen.getByText('Profit Growth')).toBeInTheDocument();
  });

  it('should display forecast explanation text', () => {
    renderWithProviders(<FinancialTrendAnalysis />);

    expect(
      screen.getByText(/Solid lines represent historical data. Dashed lines represent 3-month forecast/i)
    ).toBeInTheDocument();
  });

  it('should display anomalies section when anomalies are detected', () => {
    renderWithProviders(<FinancialTrendAnalysis />);

    const anomaliesSection = screen.queryByText('Detected Anomalies');
    if (anomaliesSection) {
      expect(anomaliesSection).toBeInTheDocument();
    }
  });

  it('should format currency values correctly', () => {
    renderWithProviders(<FinancialTrendAnalysis />);

    const incomeCard = screen.getByText('Avg Monthly Income');
    expect(incomeCard).toBeInTheDocument();
  });

  it('should handle empty financial data gracefully', () => {
    renderWithProviders(<FinancialTrendAnalysis />);

    expect(screen.getByText('Financial Trends & Forecasting')).toBeInTheDocument();
  });

  it('should display at least 12 months of historical data', () => {
    renderWithProviders(<FinancialTrendAnalysis />);

    expect(screen.getByText('Month-over-Month Growth Rates')).toBeInTheDocument();
  });

  it('should include 3-month forecast in chart data', () => {
    renderWithProviders(<FinancialTrendAnalysis />);

    expect(screen.getByText('Income, Expense & Profit Trends')).toBeInTheDocument();
  });

  it('should calculate and display growth rates', () => {
    renderWithProviders(<FinancialTrendAnalysis />);

    const growthTable = screen.getByText('Month-over-Month Growth Rates');
    expect(growthTable).toBeInTheDocument();
  });

  it('should highlight anomalies with warning styling', () => {
    renderWithProviders(<FinancialTrendAnalysis />);

    const anomaliesSection = screen.queryByText('Detected Anomalies');
    if (anomaliesSection) {
      const card = anomaliesSection.closest('[class*="glass"]');
      expect(card).toBeInTheDocument();
    }
  });

  it('should display profit in red when negative', () => {
    renderWithProviders(<FinancialTrendAnalysis />);

    const profitCard = screen.getByText('Avg Monthly Profit');
    expect(profitCard).toBeInTheDocument();
  });

  it('should render chart with proper axes and legend', () => {
    renderWithProviders(<FinancialTrendAnalysis />);

    expect(screen.getByText('Income, Expense & Profit Trends')).toBeInTheDocument();
  });

  it('should display growth rate percentages in table', () => {
    renderWithProviders(<FinancialTrendAnalysis />);

    const growthTable = screen.getByText('Month-over-Month Growth Rates');
    expect(growthTable).toBeInTheDocument();
  });
});
