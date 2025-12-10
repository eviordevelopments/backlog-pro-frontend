import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { FundAccount, AllocationCategory } from '@/types';

interface EditAllocationDialogProps {
  fund: FundAccount;
  onUpdate: (fund: FundAccount) => void;
}

const ALLOCATION_CATEGORIES: AllocationCategory[] = [
  'Technology',
  'Growth',
  'Team',
  'Marketing',
  'Emergency',
  'Investments',
];

export default function EditAllocationDialog({ fund, onUpdate }: EditAllocationDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AllocationCategory>(fund.allocationCategory);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setSelectedCategory(fund.allocationCategory);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCategory === fund.allocationCategory) {
      toast.error('Please select a different allocation category');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedFund: FundAccount = {
        ...fund,
        allocationCategory: selectedCategory,
      };

      onUpdate(updatedFund);
      setOpen(false);
      toast.success('Allocation category updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update allocation category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit2 className="h-4 w-4" />
          Edit Category
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Allocation Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Fund: <span className="font-medium text-foreground">{fund.name}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Current category: <span className="font-medium text-foreground">{fund.allocationCategory}</span>
            </p>
          </div>

          <div>
            <Label htmlFor="new-category">New Allocation Category</Label>
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as AllocationCategory)}>
              <SelectTrigger id="new-category" className="mt-2">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {ALLOCATION_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category} disabled={category === fund.allocationCategory}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Category'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
