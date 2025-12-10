import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Plus, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FundAccount, AllocationCategory } from '@/types';
import AddFundDialog from './AddFundDialog';
import AllocationCategoryBadge from './AllocationCategoryBadge';
import EditAllocationDialog from './EditAllocationDialog';

const FUND_COLORS: Record<AllocationCategory, string> = {
  Technology: '#3b82f6',
  Growth: '#10b981',
  Team: '#f59e0b',
  Marketing: '#ec4899',
  Emergency: '#ef4444',
  Investments: '#8b5cf6',
};

const FUND_ICONS: Record<AllocationCategory, string> = {
  Technology: '💻',
  Growth: '📈',
  Team: '👥',
  Marketing: '📢',
  Emergency: '🚨',
  Investments: '💰',
};

const DEFAULT_FUND_PERCENTAGES: Record<AllocationCategory, number> = {
  Technology: 25,
  Growth: 20,
  Team: 30,
  Marketing: 15,
  Emergency: 5,
  Investments: 5,
};

export default function FundAccountsManager() {
  const { fundAccounts, addFundAccount, updateFundAccount, budgetAllocations, addBudgetAllocation } = useApp();
  const [totalBudget, setTotalBudget] = useState<string>('100000');
  const [fundPercentages, setFundPercentages] = useState<Record<AllocationCategory, number>>(
    DEFAULT_FUND_PERCENTAGES
  );
  const [isDistributing, setIsDistributing] = useState(false);
  const [isAddFundDialogOpen, setIsAddFundDialogOpen] = useState(false);

  const handlePercentageChange = (category: AllocationCategory, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFundPercentages(prev => ({
      ...prev,
      [category]: Math.max(0, Math.min(100, numValue)),
    }));
  };

  const getTotalPercentage = (): number => {
    return Object.values(fundPercentages).reduce((sum, pct) => sum + pct, 0);
  };

  const handleAddFund = (fundData: Omit<FundAccount, 'id'>) => {
    try {
      const newFund: FundAccount = {
        ...fundData,
        id: `fund-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      addFundAccount(newFund);
      setIsAddFundDialogOpen(false);
    } catch (error) {
      console.error('Error adding fund:', error);
    }
  };

  const handleDistributeBudget = () => {
    const budget = parseFloat(totalBudget);
    if (!budget || budget <= 0) {
      alert('Please enter a valid budget amount');
      return;
    }

    const totalPct = getTotalPercentage();
    if (Math.abs(totalPct - 100) > 0.01) {
      alert(`Fund percentages must sum to 100% (currently ${totalPct.toFixed(1)}%)`);
      return;
    }

    setIsDistributing(true);

    try {
      // Clear existing funds
      fundAccounts.forEach(fund => {
        // We'll recreate them with new allocations
      });

      // Create new fund accounts with distributed budget
      const categories: AllocationCategory[] = [
        'Technology',
        'Growth',
        'Team',
        'Marketing',
        'Emergency',
        'Investments',
      ];

      categories.forEach(category => {
        const percentage = fundPercentages[category];
        const allocatedAmount = (percentage / 100) * budget;

        const newFund: FundAccount = {
          id: `fund-${category.toLowerCase()}-${Date.now()}`,
          name: `${category} Fund`,
          balance: allocatedAmount,
          allocated: 0,
          percentage,
          purpose: `${category} fund for business operations`,
          allocationCategory: category,
        };

        addFundAccount(newFund);
      });

      // Create budget allocation record
      const allocation = {
        id: `allocation-${Date.now()}`,
        totalBudget: budget,
        allocations: {
          technology: (fundPercentages.Technology / 100) * budget,
          growth: (fundPercentages.Growth / 100) * budget,
          team: (fundPercentages.Team / 100) * budget,
          marketing: (fundPercentages.Marketing / 100) * budget,
          emergency: (fundPercentages.Emergency / 100) * budget,
          investments: (fundPercentages.Investments / 100) * budget,
        },
        createdAt: new Date().toISOString(),
        status: 'distributed' as const,
        userId: '',
      };

      addBudgetAllocation(allocation);
    } catch (error) {
      console.error('Error distributing budget:', error);
      alert('Failed to distribute budget');
    } finally {
      setIsDistributing(false);
    }
  };

  const getDepletionStatus = (fund: FundAccount): 'healthy' | 'warning' | 'critical' => {
    const remaining = fund.balance - fund.allocated;
    const percentageRemaining = (remaining / fund.balance) * 100;

    if (percentageRemaining <= 0) return 'critical';
    if (percentageRemaining <= 20) return 'warning';
    return 'healthy';
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical'): string => {
    switch (status) {
      case 'healthy':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'critical':
        return 'text-destructive';
    }
  };

  const getStatusBgColor = (status: 'healthy' | 'warning' | 'critical'): string => {
    switch (status) {
      case 'healthy':
        return 'bg-success/10';
      case 'warning':
        return 'bg-warning/10';
      case 'critical':
        return 'bg-destructive/10';
    }
  };

  const totalPct = getTotalPercentage();
  const isValidDistribution = Math.abs(totalPct - 100) < 0.01;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fund Accounts Manager</h2>
          <p className="text-muted-foreground mt-1">
            Manage and distribute budget across 6 fund accounts
          </p>
        </div>
        <AddFundDialog onSubmit={handleAddFund} />
      </div>

      {/* Budget Distribution Setup */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Budget Distribution Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Budget Input */}
          <div>
            <label className="text-sm font-medium">Total Budget Amount</label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                placeholder="Enter total budget"
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground py-2">
                ${parseFloat(totalBudget || '0').toLocaleString()}
              </span>
            </div>
          </div>

          {/* Fund Percentage Inputs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Fund Allocations</label>
              <span className={`text-sm font-semibold ${isValidDistribution ? 'text-success' : 'text-destructive'}`}>
                {totalPct.toFixed(1)}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(DEFAULT_FUND_PERCENTAGES) as AllocationCategory[]).map(category => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{FUND_ICONS[category]}</span>
                    <label className="text-sm font-medium flex-1">{category}</label>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={fundPercentages[category]}
                      onChange={(e) => handlePercentageChange(category, e.target.value)}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground py-2 w-12 text-right">%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${((fundPercentages[category] / 100) * parseFloat(totalBudget || '0')).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!isValidDistribution && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Fund percentages must sum to 100% (currently {totalPct.toFixed(1)}%)
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleDistributeBudget}
            disabled={!isValidDistribution || isDistributing}
            className="w-full"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isDistributing ? 'Distributing...' : 'Distribute Budget'}
          </Button>
        </CardContent>
      </Card>

      {/* Fund Accounts Display */}
      {fundAccounts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Fund Accounts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fundAccounts.map(fund => {
              const status = getDepletionStatus(fund);
              const remaining = fund.balance - fund.allocated;
              const remainingPercentage = (remaining / fund.balance) * 100;

              return (
                <Card key={fund.id} className={`glass ${getStatusBgColor(status)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{FUND_ICONS[fund.allocationCategory]}</span>
                        <div>
                          <CardTitle className="text-base">{fund.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{fund.percentage}% allocation</p>
                        </div>
                      </div>
                      {status !== 'healthy' && (
                        <AlertCircle className={`h-5 w-5 ${getStatusColor(status)}`} />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Allocation Category Badge */}
                    <div className="flex items-center justify-between">
                      <AllocationCategoryBadge category={fund.allocationCategory} />
                      <EditAllocationDialog fund={fund} onUpdate={updateFundAccount} />
                    </div>

                    {/* Balance */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Balance</p>
                      <p className="text-lg font-bold">
                        ${fund.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>

                    {/* Allocated */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Allocated</p>
                      <p className="text-sm font-semibold">
                        ${fund.allocated.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>

                    {/* Remaining */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground">Remaining</p>
                        <p className={`text-xs font-semibold ${getStatusColor(status)}`}>
                          {remainingPercentage.toFixed(0)}%
                        </p>
                      </div>
                      <p className={`text-sm font-bold ${getStatusColor(status)}`}>
                        ${remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          status === 'healthy'
                            ? 'bg-success'
                            : status === 'warning'
                              ? 'bg-warning'
                              : 'bg-destructive'
                        }`}
                        style={{ width: `${Math.max(0, remainingPercentage)}%` }}
                      />
                    </div>

                    {/* Status Message */}
                    {status !== 'healthy' && (
                      <Alert variant={status === 'critical' ? 'destructive' : 'default'} className="py-2">
                        <AlertCircle className="h-3 w-3" />
                        <AlertDescription className="text-xs">
                          {status === 'critical'
                            ? 'Fund depleted - no remaining balance'
                            : 'Fund running low - less than 20% remaining'}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Purpose */}
                    <p className="text-xs text-muted-foreground italic">{fund.purpose}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Allocation History */}
      {budgetAllocations.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Allocation History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {budgetAllocations.map(allocation => (
                <div key={allocation.id} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">
                      ${allocation.totalBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      allocation.status === 'distributed'
                        ? 'bg-success/20 text-success'
                        : allocation.status === 'approved'
                          ? 'bg-warning/20 text-warning'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {allocation.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(allocation.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
