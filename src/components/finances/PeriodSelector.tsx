import { Button } from '@/components/ui/button';
import { PeriodType } from '@/utils/financialPeriods';

interface PeriodSelectorProps {
  selectedPeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
}

export default function PeriodSelector({ selectedPeriod, onPeriodChange }: PeriodSelectorProps) {
  const periods: { label: string; value: PeriodType }[] = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Annual', value: 'annual' },
  ];

  return (
    <div className="flex gap-2">
      {periods.map(period => (
        <Button
          key={period.value}
          variant={selectedPeriod === period.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPeriodChange(period.value)}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
}
