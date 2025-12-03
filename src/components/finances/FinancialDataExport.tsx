import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, FileText } from 'lucide-react';

interface ExportData {
  category: string;
  costType: 'fixed' | 'variable';
  amount: number;
  percentage: number;
  date: string;
}

export default function FinancialDataExport() {
  const { financialRecords } = useApp();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const filteredRecords = useMemo(() => {
    return financialRecords.filter(record => {
      if (!startDate && !endDate) return true;
      const recordDate = new Date(record.date);
      if (startDate && recordDate < new Date(startDate)) return false;
      if (endDate && recordDate > new Date(endDate)) return false;
      return true;
    });
  }, [financialRecords, startDate, endDate]);

  const exportData = useMemo(() => {
    const expenses = filteredRecords.filter(r => r.type === 'expense');
    const totalExpenses = expenses.reduce((sum, r) => sum + r.amount, 0);

    return expenses.map(record => ({
      category: record.category,
      costType: record.costType || 'variable',
      amount: record.amount,
      percentage: totalExpenses > 0 ? (record.amount / totalExpenses) * 100 : 0,
      date: record.date,
    }));
  }, [filteredRecords]);

  const totalExpenses = useMemo(() => {
    return exportData.reduce((sum, item) => sum + item.amount, 0);
  }, [exportData]);

  const handleExportCSV = () => {
    const headers = ['Date', 'Category', 'Cost Type', 'Amount', 'Percentage of Total'];
    const rows = exportData.map(item => [
      item.date,
      item.category,
      item.costType,
      item.amount.toFixed(2),
      item.percentage.toFixed(2) + '%',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
      '',
      ['Total Expenses', '', '', totalExpenses.toFixed(2), '100%'].join(','),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financial-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const exportPayload = {
      exportDate: new Date().toISOString(),
      dateRange: {
        start: startDate || 'All',
        end: endDate || 'All',
      },
      summary: {
        totalExpenses: totalExpenses,
        recordCount: exportData.length,
      },
      data: exportData,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financial-export-${new Date().toISOString().split('T')[0]}.json`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleResetDates = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Export Financial Data</h2>
        <p className="text-muted-foreground mt-1">Export cost breakdown details with optional date range filtering</p>
      </div>

      {/* Date Range Selection */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">Date Range Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDates}
            className="w-full"
          >
            Clear Date Range
          </Button>
        </CardContent>
      </Card>

      {/* Export Summary */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">Export Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Records to Export</p>
              <p className="text-2xl font-bold mt-1">{exportData.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold mt-1 text-red-500">
                ${(totalExpenses / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Date Range</p>
              <p className="text-sm font-semibold mt-1">
                {startDate || 'Start'} to {endDate || 'End'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">Export Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleExportCSV}
            disabled={exportData.length === 0}
            className="w-full gap-2"
            variant="default"
          >
            <Download className="h-4 w-4" />
            Export as CSV
          </Button>
          <Button
            onClick={handleExportJSON}
            disabled={exportData.length === 0}
            className="w-full gap-2"
            variant="outline"
          >
            <FileText className="h-4 w-4" />
            Export as JSON
          </Button>
        </CardContent>
      </Card>

      {/* Data Preview */}
      {exportData.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Data Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {exportData.slice(0, 10).map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-muted/50 text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{item.category}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${item.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              ))}
              {exportData.length > 10 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  ... and {exportData.length - 10} more records
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {exportData.length === 0 && (
        <Card className="glass">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No financial data available for the selected date range</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
