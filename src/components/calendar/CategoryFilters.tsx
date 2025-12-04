import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FilterState } from '@/types';

interface CategoryFiltersProps {
  categories: FilterState['categories'];
  onCategoryChange: (category: keyof FilterState['categories'], checked: boolean) => void;
}

const CATEGORY_CONFIG = [
  { key: 'tasks' as const, label: 'Tasks', color: 'bg-blue-500' },
  { key: 'sprints' as const, label: 'Sprints', color: 'bg-purple-500' },
  { key: 'meetings' as const, label: 'Meetings', color: 'bg-green-500' },
  { key: 'deadlines' as const, label: 'Deadlines', color: 'bg-red-500' },
];

export default function CategoryFilters({
  categories,
  onCategoryChange,
}: CategoryFiltersProps) {
  return (
    <div className="space-y-2">
      {CATEGORY_CONFIG.map(({ key, label, color }) => (
        <div key={key} className="flex items-center gap-3">
          <Checkbox
            id={`category-${key}`}
            checked={categories[key]}
            onCheckedChange={(checked) => onCategoryChange(key, checked as boolean)}
          />
          <div className="flex items-center gap-2 flex-1">
            <div className={`w-3 h-3 rounded ${color}`} />
            <Label
              htmlFor={`category-${key}`}
              className="text-sm font-medium cursor-pointer flex-1"
            >
              {label}
            </Label>
          </div>
        </div>
      ))}
    </div>
  );
}
