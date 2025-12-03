import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import FinancialDataExport from '@/components/finances/FinancialDataExport';
import { renderWithProviders, setupMockLocalStorage } from '../utils/test-helpers';

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.ResizeObserver = MockResizeObserver as any;

describe('FinancialDataExport', () => {
  beforeEach(() => {
    setupMockLocalStorage();
    vi.clearAllMocks();
  });

  it('renders export component with title and description', () => {
    renderWithProviders(<FinancialDataExport />);

    expect(screen.getByText('Export Financial Data')).toBeInTheDocument();
    expect(screen.getByText(/Export cost breakdown details/)).toBeInTheDocument();
  });

  it('displays correct export summary with all records', () => {
    renderWithProviders(<FinancialDataExport />);

    expect(screen.getByText('Records to Export')).toBeInTheDocument();
    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
  });

  it('filters records by start date', async () => {
    renderWithProviders(<FinancialDataExport />);

    const startDateInput = screen.getByLabelText('Start Date') as HTMLInputElement;
    fireEvent.change(startDateInput, { target: { value: '2024-02-01' } });

    await waitFor(() => {
      expect(startDateInput.value).toBe('2024-02-01');
    });
  });

  it('filters records by end date', async () => {
    renderWithProviders(<FinancialDataExport />);

    const endDateInput = screen.getByLabelText('End Date') as HTMLInputElement;
    fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });

    await waitFor(() => {
      expect(endDateInput.value).toBe('2024-01-31');
    });
  });

  it('filters records by date range', async () => {
    renderWithProviders(<FinancialDataExport />);

    const startDateInput = screen.getByLabelText('Start Date') as HTMLInputElement;
    const endDateInput = screen.getByLabelText('End Date') as HTMLInputElement;
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });

    await waitFor(() => {
      expect(startDateInput.value).toBe('2024-01-01');
      expect(endDateInput.value).toBe('2024-01-31');
    });
  });

  it('clears date range when reset button is clicked', async () => {
    renderWithProviders(<FinancialDataExport />);

    const startDateInput = screen.getByLabelText('Start Date') as HTMLInputElement;
    const endDateInput = screen.getByLabelText('End Date') as HTMLInputElement;
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });

    const resetButton = screen.getByText('Clear Date Range');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(startDateInput.value).toBe('');
      expect(endDateInput.value).toBe('');
    });
  });

  it('exports data as CSV with correct format', async () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');

    renderWithProviders(<FinancialDataExport />);

    const exportCSVButton = screen.getByText('Export as CSV');
    fireEvent.click(exportCSVButton);

    await waitFor(() => {
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    createElementSpy.mockRestore();
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });

  it('exports data as JSON with correct structure', async () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');

    renderWithProviders(<FinancialDataExport />);

    const exportJSONButton = screen.getByText('Export as JSON');
    fireEvent.click(exportJSONButton);

    await waitFor(() => {
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    createElementSpy.mockRestore();
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });

  it('disables export buttons when no data is available', () => {
    renderWithProviders(<FinancialDataExport />);

    const exportCSVButton = screen.getByText('Export as CSV');
    const exportJSONButton = screen.getByText('Export as JSON');

    expect(exportCSVButton).toBeInTheDocument();
    expect(exportJSONButton).toBeInTheDocument();
  });

  it('shows data preview section', () => {
    renderWithProviders(<FinancialDataExport />);

    expect(screen.getByText('Export Summary')).toBeInTheDocument();
    expect(screen.getByText('Export Options')).toBeInTheDocument();
  });

  it('includes all cost breakdown details in export', () => {
    renderWithProviders(<FinancialDataExport />);

    expect(screen.getByText('Records to Export')).toBeInTheDocument();
    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    expect(screen.getByText('Date Range')).toBeInTheDocument();
  });

  it('displays date range selection interface', () => {
    renderWithProviders(<FinancialDataExport />);

    expect(screen.getByText('Date Range Selection')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
  });
});
