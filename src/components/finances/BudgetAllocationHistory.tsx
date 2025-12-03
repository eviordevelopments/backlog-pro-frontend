import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronDown, ChevronUp, AlertCircle, TrendingUp } from 'lucide-react';
import { BudgetAllocation } from '@/types';

const FUND_ICONS: Record<string, string> = {
  technology: '💻',
  growth: '📈',
  team: '👥',
  marketing: '📢',
  emergency: '🚨',
  investments: '💰',
};

const FUND_DISPLAY_NAMES: Record<string, string> = {
  technology: 'Technology',
  growth: 'Growth',
  team: 'Team',
  marketing: 'Marketing',
  emergency: 'Emergency',
  investments: 'Investments',
};

interface ExpandedAllocation {
  [key: string]: boolean;
}

export default function BudgetAllocationHistory() {
  const { budgetAllocations, fundAccounts } = useApp();
  const [expandedAllocations, setExpandedAllocations] = useState<ExpandedAllocation>({});

  const toggleExpanded = (allocationId: string) => {
    setExpandedAllocations(prev => ({
      ...prev,
      [allocationId]: !prev[allocationId],
    }));
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'distributed':
        return 'bg-success/20 text-success';
      case 'approved':
        return 'bg-warning/20 text-warning';
      case 'pending':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const calculateFundPercentage = (amount: number, total: number): number => {
    return total > 0 ? (amount / total) * 100 : 0;
  };

  const checkThresholdNotifications = (allocation: BudgetAllocation): Array<{
    fund: string;
    message: string;
  }> => {
    const notifications: Array<{ fund: string; message: string }> = [];
    const fundNames = Object.keys(allocation.allocations) as Array<keyof typeof allocation.allocations>;

    fundNames.forEach(fundName => {
      const allocatedAmount = allocation.allocations[fundName];
      const percentage = calculateFundPercentage(allocatedAmount, allocation.totalBudget);

      // Check if fund is below 10% threshold
      if (percentage < 10 && percentage > 0) {
        notifications.push({
          fund: FUND_DISPLAY_NAMES[fundName],
          message: `${FUND_DISPLAY_NAMES[fundName]} fund is below 10% threshold (${percentage.toFixed(1)}%)`,
        });
      }

      // Check if fund is depleted
      if (percentage === 0) {
        notifications.push({
          fund: FUND_DISPLAY_NAMES[fundName],
          message: `${FUND_DISPLAY_NAMES[fundName]} fund has no allocation`,
        });
      }
    });

    return notifications;
  };

  const sortedAllocations = [...budgetAllocations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (budgetAllocations.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Budget Allocation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No budget allocations yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first budget allocation to see the history here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Budget Allocation History</h2>
        <p className="text-muted-foreground mt-1">
          View all past budget distributions and allocation details
        </p>
      </div>

      <div className="space-y-4">
        {sortedAllocations.map(allocation => {
          const isExpanded = expandedAllocations[allocation.id];
          const notifications = checkThresholdNotifications(allocation);
          const fundNames = Object.keys(allocation.allocations) as Array<keyof typeof allocation.allocations>;

          return (
            <Card key={allocation.id} className="glass overflow-hidden">
              {/* Header - Always Visible */}
              <div
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleExpanded(allocation.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        ${allocation.totalBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </h3>
                      <Badge className={getStatusColor(allocation.status)}>
                        {getStatusLabel(allocation.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(allocation.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <>
                  <div className="border-t border-border/50" />
                  <CardContent className="pt-6 space-y-6">
                    {/* Fund Breakdown */}
                    <div>
                      <h4 className="font-semibold mb-4">Fund Distribution</h4>
                      <div className="space-y-3">
                        {fundNames.map(fundName => {
                          const amount = allocation.allocations[fundName];
                          const percentage = calculateFundPercentage(amount, allocation.totalBudget);

                          return (
                            <div key={fundName} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{FUND_ICONS[fundName]}</span>
                                  <span className="font-medium text-sm">
                                    {FUND_DISPLAY_NAMES[fundName]}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-sm">
                                    ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {percentage.toFixed(1)}%
                                  </p>
                                </div>
                              </div>
                              {/* Progress Bar */}
                              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Threshold Notifications */}
                    {notifications.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Threshold Alerts
                        </h4>
                        <div className="space-y-2">
                          {notifications.map((notification, idx) => (
                            <Alert key={idx} variant="default" className="py-2">
                              <AlertCircle className="h-3 w-3" />
                              <AlertDescription className="text-xs">
                                {notification.message}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Audit Trail Info */}
                    <div className="pt-4 border-t border-border/50">
                      <h4 className="font-semibold text-sm mb-3">Audit Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Allocation ID</p>
                          <p className="font-mono text-xs break-all">{allocation.id}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Created</p>
                          <p className="text-xs">
                            {new Date(allocation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Fund Account Status */}
                    {fundAccounts.length > 0 && (
                      <div className="pt-4 border-t border-border/50">
                        <h4 className="font-semibold text-sm mb-3">Current Fund Status</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {fundAccounts.map(fund => {
                            const remaining = fund.balance - fund.allocated;
                            const remainingPercentage = (remaining / fund.balance) * 100;

                            return (
                              <div
                                key={fund.id}
                                className="p-3 rounded-lg bg-muted/50 border border-border/50"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-sm">{fund.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {remainingPercentage.toFixed(0)}% remaining
                                  </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full transition-all ${
                                      remainingPercentage > 20
                                        ? 'bg-success'
                                        : remainingPercentage > 0
                                          ? 'bg-warning'
                                          : 'bg-destructive'
                                    }`}
                                    style={{ width: `${Math.max(0, remainingPercentage)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary Statistics */}
      {sortedAllocations.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base">Allocation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Allocations</p>
                <p className="text-2xl font-bold">{sortedAllocations.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Budget Distributed</p>
                <p className="text-2xl font-bold">
                  ${sortedAllocations
                    .reduce((sum, a) => sum + a.totalBudget, 0)
                    .toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Allocation</p>
                <p className="text-2xl font-bold">
                  ${(
                    sortedAllocations.reduce((sum, a) => sum + a.totalBudget, 0) /
                    sortedAllocations.length
                  ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
