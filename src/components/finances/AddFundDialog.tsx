import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { FundAccount, AllocationCategory } from '@/types';

interface AddFundDialogProps {
  onSubmit: (fund: Omit<FundAccount, 'id'>) => void;
}

const ALLOCATION_CATEGORIES: AllocationCategory[] = [
  'Technology',
  'Growth',
  'Team',
  'Marketing',
  'Emergency',
  'Investments',
];

export default function AddFundDialog({ onSubmit }: AddFundDialogProps) {
  const [open, setOpen] = useState(false);
  const [fundName, setFundName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AllocationCategory | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    if (!fundName.trim()) {
      toast.error('Fund name is required');
      return false;
    }

    if (fundName.trim().length > 100) {
      toast.error('Fund name must be 100 characters or less');
      return false;
    }

    if (!initialBalance) {
      toast.error('Initial balance is required');
      return false;
    }

    const balance = parseFloat(initialBalance);
    if (isNaN(balance) || balance <= 0) {
      toast.error('Initial balance must be a positive number');
      return false;
    }

    if (!selectedCategory) {
      toast.error('Allocation category is required');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newFund: Omit<FundAccount, 'id'> = {
        name: fundName.trim(),
        balance: parseFloat(initialBalance),
        allocated: 0,
        percentage: 0,
        purpose: `${selectedCategory} fund`,
        allocationCategory: selectedCategory as AllocationCategory,
      };

      onSubmit(newFund);

      setFundName('');
      setInitialBalance('');
      setSelectedCategory('');
      setOpen(false);
      toast.success('Fund created successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create fund');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Fund
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Fund Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fund-name">Fund Name</Label>
            <Input
              id="fund-name"
              value={fundName}
              onChange={(e) => setFundName(e.target.value)}
              placeholder="e.g., Q1 Technology Budget"
              className="mt-2"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {fundName.length}/100 characters
            </p>
          </div>

          <div>
            <Label htmlFor="initial-balance">Initial Balance ($)</Label>
            <Input
              id="initial-balance"
              type="number"
              step="0.01"
              min="0"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="0.00"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="allocation-category">Allocation Category</Label>
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as AllocationCategory)}>
              <SelectTrigger id="allocation-category" className="mt-2">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {ALLOCATION_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Fund'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
