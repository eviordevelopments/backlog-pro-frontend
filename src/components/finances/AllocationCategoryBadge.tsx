import { AllocationCategory } from '@/types';

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

interface AllocationCategoryBadgeProps {
  category: AllocationCategory;
}

export default function AllocationCategoryBadge({ category }: AllocationCategoryBadgeProps) {
  const color = FUND_COLORS[category];
  const icon = FUND_ICONS[category];

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white"
      style={{ backgroundColor: color }}
    >
      <span>{icon}</span>
      <span>{category}</span>
    </div>
  );
}
