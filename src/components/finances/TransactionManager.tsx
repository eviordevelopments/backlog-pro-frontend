import { useState, useEffect } from 'react';
import { useProjectContext } from '@/context/ProjectContext';
import { useFinances } from '@/hooks/use-finances';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, TrendingUp, TrendingDown, Calendar, DollarSign, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Transaction } from '@/api/finances/finances';

export default function TransactionManager() {
  const { selectedProject: currentProject } = useProjectContext();
  const { createTransaction: createTransactionAPI } = useFinances();
  const [open, setOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: 'salaries',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    isRecurring: false,
    currency: 'USD'
  });

  // Load transactions from localStorage
  const loadTransactions = () => {
    const saved = localStorage.getItem('transactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  };

  useEffect(() => {
    loadTransactions();
    
    const handleTransactionsUpdate = () => {
      loadTransactions();
    };
    
    window.addEventListener('transactionsUpdated', handleTransactionsUpdate);
    
    return () => {
      window.removeEventListener('transactionsUpdated', handleTransactionsUpdate);
    };
  }, []);

  // Filter transactions by project
  const projectTransactions = currentProject
    ? transactions.filter(t => t.projectId === currentProject.id)
    : transactions;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentProject) {
      toast.error('Please select a project first');
      return;
    }

    setIsLoading(true);
    try {
      const newTransaction = await createTransactionAPI({
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
        description: formData.description,
        projectId: currentProject.id,
        isRecurring: formData.isRecurring,
        currency: formData.currency
      });

      setTransactions([...transactions, newTransaction]);
      localStorage.setItem('transactions', JSON.stringify([...transactions, newTransaction]));
      window.dispatchEvent(new Event('transactionsUpdated'));
      
      setOpen(false);
      setFormData({
        type: 'expense',
        category: 'salaries',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        isRecurring: false,
        currency: 'USD'
      });
      
      toast.success('Transaction created successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem('transactions', JSON.stringify(updated));
    window.dispatchEvent(new Event('transactionsUpdated'));
    toast.success('Transaction deleted');
  };

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>New Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salaries">Salaries</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="hardware">Hardware</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Amount ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-2"
                    placeholder="Transaction description"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="recurring" className="cursor-pointer">
                    Recurring Transaction
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Transaction'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {projectTransactions.slice(0, 50).map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-xl glass hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'income' ? 'bg-success/20' :
                  transaction.type === 'expense' ? 'bg-destructive/20' :
                  'bg-primary/20'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="w-5 h-5 text-success" />
                  ) : transaction.type === 'expense' ? (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  ) : (
                    <DollarSign className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {transaction.description || transaction.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                    {transaction.isRecurring && (
                      <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs">
                        Recurring
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`text-lg font-bold ${
                  transaction.type === 'income' ? 'text-success' :
                  transaction.type === 'expense' ? 'text-destructive' :
                  'text-primary'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(transaction.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {projectTransactions.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No transactions yet. Add your first transaction!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
