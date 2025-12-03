import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useApp } from '@/context/AppContext';

interface MetricData {
  month: string;
  cac: number;
  ltv: number;
  runway: number;
  burn: number;
  churn: number;
}

export default function FinancialMetrics() {
  const {
    financialRecords,
    calculateMetricsCAC,
    calculateMetricsLTV,
    calculateMetricsCashRunway,
    calculateMetricsBurnRate,
    calculateMetricsChurnRate,
  } = useApp();

  const [metricsData, setMetricsData] = useState<MetricData[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState({
    cac: 0,
    ltv: 0,
    runway: 0,
    burn: 0,
    churn: 0,
  });

  useEffect(() => {
    // Generate metrics data from financial records
    const data: MetricData[] = [];
    
    // Group financial records by month
    const recordsByMonth: Record<string, typeof financialRecords> = {};
    
    financialRecords.forEach(record => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!recordsByMonth[monthKey]) {
        recordsByMonth[monthKey] = [];
      }
      recordsByMonth[monthKey].push(record);
    });

    // Calculate metrics for each month
    const sortedMonths = Object.keys(recordsByMonth).sort();
    sortedMonths.forEach(monthKey => {
      const records = recordsByMonth[monthKey];
      const date = new Date(monthKey + '-01');
      const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });

      // Calculate totals for the month
      const totalIncome = records
        .filter(r => r.type === 'income')
        .reduce((sum, r) => sum + r.amount, 0);
      
      const totalExpense = records
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + r.amount, 0);

      // Use calculation functions from AppContext
      const cac = calculateMetricsCAC(totalExpense * 0.2, Math.max(1, Math.floor(totalIncome / 500)));
      const ltv = calculateMetricsLTV(totalIncome > 0 ? totalIncome / Math.max(1, Math.floor(totalIncome / 500)) : 0, 0.8);
      const runway = calculateMetricsCashRunway(totalIncome * 3, totalExpense);
      const burn = calculateMetricsBurnRate(totalExpense, 1);
      const churn = calculateMetricsChurnRate(Math.max(0, Math.floor(totalIncome / 1000) * 0.05), Math.max(1, Math.floor(totalIncome / 1000)));

      data.push({
        month,
        cac: isFinite(cac) ? cac : 0,
        ltv: isFinite(ltv) ? ltv : 0,
        runway: isFinite(runway) ? runway : 0,
        burn: isFinite(burn) ? burn : 0,
        churn: isFinite(churn) ? churn : 0,
      });
    });

    setMetricsData(data);

    // Set current metrics from latest month
    if (data.length > 0) {
      const latest = data[data.length - 1];
      setCurrentMetrics({
        cac: latest.cac,
        ltv: latest.ltv,
        runway: latest.runway,
        burn: latest.burn,
        churn: latest.churn,
      });
    }
  }, [financialRecords, calculateMetricsCAC, calculateMetricsLTV, calculateMetricsCashRunway, calculateMetricsBurnRate, calculateMetricsChurnRate]);

  const ltv = currentMetrics.ltv || 0;
  const cac = currentMetrics.cac || 0;
  const ltv_cac_ratio = cac > 0 ? (ltv / cac).toFixed(2) : '0';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Financial Metrics</h2>
        <p className="text-muted-foreground mt-1">Key performance indicators for business health</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* CAC */}
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CAC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentMetrics.cac.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Customer Acquisition Cost</p>
          </CardContent>
        </Card>

        {/* LTV */}
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">LTV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentMetrics.ltv.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime Value</p>
          </CardContent>
        </Card>

        {/* LTV:CAC Ratio */}
        <Card className={`glass ${parseFloat(ltv_cac_ratio) >= 3 ? 'border-success/50' : 'border-warning/50'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">LTV:CAC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${parseFloat(ltv_cac_ratio) >= 3 ? 'text-success' : 'text-warning'}`}>
              {ltv_cac_ratio}:1
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {parseFloat(ltv_cac_ratio) >= 3 ? 'Healthy' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>

        {/* Cash Runway */}
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Runway</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.runway.toFixed(1)}mo</div>
            <p className="text-xs text-muted-foreground mt-1">Months of cash left</p>
          </CardContent>
        </Card>

        {/* Churn Rate */}
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Churn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.churn.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Monthly churn rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CAC vs LTV Trend */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>CAC vs LTV Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metricsData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => `$${value}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cac"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="CAC"
                />
                <Line
                  type="monotone"
                  dataKey="ltv"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="LTV"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cash Runway & Burn */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Cash Runway & Burn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metricsData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="runway"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Runway (months)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="burn"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Burn Rate ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Churn Rate Trend */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Churn Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metricsData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => `${value}%`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="churn"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Churn Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Metrics Summary */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Metrics Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">LTV:CAC Ratio</p>
                  <p className="text-xs text-muted-foreground">Ideal: 3:1 or higher</p>
                </div>
                <div className={`text-lg font-bold ${parseFloat(ltv_cac_ratio) >= 3 ? 'text-success' : 'text-warning'}`}>
                  {ltv_cac_ratio}:1
                </div>
              </div>

              <div className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">Cash Runway</p>
                  <p className="text-xs text-muted-foreground">Months until cash depleted</p>
                </div>
                <div className={`text-lg font-bold ${currentMetrics.runway > 12 ? 'text-success' : currentMetrics.runway > 6 ? 'text-warning' : 'text-destructive'}`}>
                  {currentMetrics.runway.toFixed(1)}mo
                </div>
              </div>

              <div className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">Monthly Burn</p>
                  <p className="text-xs text-muted-foreground">Cash spent per month</p>
                </div>
                <div className="text-lg font-bold">
                  ${(currentMetrics.burn / 1000).toFixed(1)}k
                </div>
              </div>

              <div className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">Churn Rate</p>
                  <p className="text-xs text-muted-foreground">Monthly customer loss</p>
                </div>
                <div className={`text-lg font-bold ${currentMetrics.churn < 3 ? 'text-success' : 'text-warning'}`}>
                  {currentMetrics.churn.toFixed(2)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
