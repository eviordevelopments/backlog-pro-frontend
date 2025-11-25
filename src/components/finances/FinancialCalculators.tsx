import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, DollarSign, Percent } from 'lucide-react';

export default function FinancialCalculators() {
  const [roiInputs, setRoiInputs] = useState({ investment: 10000, returns: 15000 });
  const [breakEvenInputs, setBreakEvenInputs] = useState({ 
    fixedCosts: 50000, 
    pricePerUnit: 100, 
    variableCostPerUnit: 40 
  });
  const [valuationInputs, setValuationInputs] = useState({ revenue: 1000000, multiple: 5 });

  const calculateROI = () => {
    const roi = ((roiInputs.returns - roiInputs.investment) / roiInputs.investment) * 100;
    return roi.toFixed(2);
  };

  const calculateBreakEven = () => {
    const breakEven = breakEvenInputs.fixedCosts / 
      (breakEvenInputs.pricePerUnit - breakEvenInputs.variableCostPerUnit);
    return Math.ceil(breakEven);
  };

  const calculateValuation = () => {
    return valuationInputs.revenue * valuationInputs.multiple;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ROI Calculator */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <CardTitle>ROI Calculator</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Initial Investment ($)</Label>
            <Input
              type="number"
              value={roiInputs.investment}
              onChange={(e) => setRoiInputs({ ...roiInputs, investment: parseFloat(e.target.value) || 0 })}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Total Returns ($)</Label>
            <Input
              type="number"
              value={roiInputs.returns}
              onChange={(e) => setRoiInputs({ ...roiInputs, returns: parseFloat(e.target.value) || 0 })}
              className="mt-2"
            />
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Return on Investment</p>
            <p className="text-3xl font-bold text-success">{calculateROI()}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Break-Even Calculator */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <CardTitle>Break-Even Point</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Fixed Costs ($)</Label>
            <Input
              type="number"
              value={breakEvenInputs.fixedCosts}
              onChange={(e) => setBreakEvenInputs({ ...breakEvenInputs, fixedCosts: parseFloat(e.target.value) || 0 })}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Price per Unit ($)</Label>
            <Input
              type="number"
              value={breakEvenInputs.pricePerUnit}
              onChange={(e) => setBreakEvenInputs({ ...breakEvenInputs, pricePerUnit: parseFloat(e.target.value) || 0 })}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Variable Cost per Unit ($)</Label>
            <Input
              type="number"
              value={breakEvenInputs.variableCostPerUnit}
              onChange={(e) => setBreakEvenInputs({ ...breakEvenInputs, variableCostPerUnit: parseFloat(e.target.value) || 0 })}
              className="mt-2"
            />
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Units to Break Even</p>
            <p className="text-3xl font-bold text-primary">{calculateBreakEven().toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Valuation Calculator */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <CardTitle>Company Valuation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Annual Revenue ($)</Label>
            <Input
              type="number"
              value={valuationInputs.revenue}
              onChange={(e) => setValuationInputs({ ...valuationInputs, revenue: parseFloat(e.target.value) || 0 })}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Revenue Multiple</Label>
            <Input
              type="number"
              step="0.1"
              value={valuationInputs.multiple}
              onChange={(e) => setValuationInputs({ ...valuationInputs, multiple: parseFloat(e.target.value) || 0 })}
              className="mt-2"
            />
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Estimated Valuation</p>
            <p className="text-3xl font-bold text-accent">${calculateValuation().toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* CAC & LTV Calculator */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
              <Percent className="w-5 h-5 text-white" />
            </div>
            <CardTitle>Unit Economics</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Marketing Spend ($)</Label>
            <Input type="number" defaultValue={10000} className="mt-2" id="marketing-spend" />
          </div>
          <div>
            <Label>Customers Acquired</Label>
            <Input type="number" defaultValue={100} className="mt-2" id="customers-acquired" />
          </div>
          <div>
            <Label>Avg Customer Lifetime Value ($)</Label>
            <Input type="number" defaultValue={5000} className="mt-2" id="ltv" />
          </div>
          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            onClick={() => {
              const spend = parseFloat((document.getElementById('marketing-spend') as HTMLInputElement)?.value) || 0;
              const customers = parseFloat((document.getElementById('customers-acquired') as HTMLInputElement)?.value) || 1;
              const ltv = parseFloat((document.getElementById('ltv') as HTMLInputElement)?.value) || 0;
              const cac = spend / customers;
              const ratio = ltv / cac;
              alert(`CAC: $${cac.toFixed(2)}\nLTV:CAC Ratio: ${ratio.toFixed(2)}:1`);
            }}
          >
            Calculate
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
