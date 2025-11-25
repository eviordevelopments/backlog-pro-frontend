import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, TrendingUp, TrendingDown, Calendar, DollarSign, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  projectId: string;
  type: 'income' | 'expense' | 'investment';
  category: string;
  amount: number;
  date: string;
  description: string;
  is_recurring: boolean;
}

export default function TransactionManager() {
  const { currentProject } = useApp();
  const [open, setOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense' | 'investment',
    category: 'revenue',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    is_recurring: false
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
    
    // Listen for transaction updates from other components
    const handleTransactionsUpdate = () => {
      loadTransactions();
    };
    
    window.addEventListener('transactionsUpdated', handleTransactionsUpdate);
    
    return () => {
      window.removeEventListener('transactionsUpdated', handleTransactionsUpdate);
    };
  }, []);

  // Save transactions to localStorage and notify other components
  const saveTransactions = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    localStorage.setItem('transactions', JSON.stringify(newTransactions));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('transactionsUpdated'));
  };

  // Filter transactions by project
  const projectTransactions = currentProject
    ? transactions.filter(t => t.projectId === currentProject.id)
    : transactions;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      projectId: currentProject?.id || 'default-project',
      type: formData.type,
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: formData.date,
      description: formData.description,
      is_recurring: formData.is_recurring
    };

    saveTransactions([...transactions, newTransaction]);
    
    setOpen(false);
    setFormData({
      type: 'income',
      category: 'revenue',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      is_recurring: false
    });
    
    toast.success('Transaction added successfully');
  };

  const handleDelete = (id: string) => {
    saveTransactions(transactions.filter(t => t.id !== id));
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
                        <SelectItem value="investment">Investment</SelectItem>
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
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="salary">Salary</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="hardware">Hardware</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
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
                    checked={formData.is_recurring}
                    onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="recurring" className="cursor-pointer">
                    Recurring Transaction
                  </Label>
                </div>

                <Button type="submit" className="w-full">
                  Create Transaction
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
                    {transaction.is_recurring && (
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
