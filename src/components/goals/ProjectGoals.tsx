import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Target, CheckCircle2, Circle, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface Goal {
  id: string;
  projectId: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  status: 'not-started' | 'in-progress' | 'completed';
  createdAt: string;
}

export default function ProjectGoals() {
  const { currentProject } = useApp();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [open, setOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetValue: 0,
    currentValue: 0,
    unit: '',
    deadline: '',
  });

  // Load goals from localStorage
  const loadGoals = () => {
    const saved = localStorage.getItem('projectGoals');
    if (saved) {
      setGoals(JSON.parse(saved));
    }
  };

  useEffect(() => {
    loadGoals();
    
    const handleGoalsUpdate = () => {
      loadGoals();
    };
    
    window.addEventListener('goalsUpdated', handleGoalsUpdate);
    
    return () => {
      window.removeEventListener('goalsUpdated', handleGoalsUpdate);
    };
  }, []);

  // Save goals to localStorage
  const saveGoals = (newGoals: Goal[]) => {
    setGoals(newGoals);
    localStorage.setItem('projectGoals', JSON.stringify(newGoals));
    window.dispatchEvent(new Event('goalsUpdated'));
  };

  // Filter goals by current project
  const projectGoals = currentProject
    ? goals.filter(g => g.projectId === currentProject.id)
    : goals;

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetValue: 0,
      currentValue: 0,
      unit: '',
      deadline: '',
    });
    setEditingGoal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentProject) {
      toast.error('Please select a project first');
      return;
    }

    const progress = formData.targetValue > 0 
      ? (formData.currentValue / formData.targetValue) * 100 
      : 0;
    
    const status: Goal['status'] = 
      progress === 0 ? 'not-started' :
      progress >= 100 ? 'completed' :
      'in-progress';

    if (editingGoal) {
      // Update existing goal
      const updatedGoals = goals.map(g => 
        g.id === editingGoal.id 
          ? { ...g, ...formData, status }
          : g
      );
      saveGoals(updatedGoals);
      toast.success('Goal updated successfully');
    } else {
      // Create new goal
      const newGoal: Goal = {
        id: Date.now().toString(),
        projectId: currentProject.id,
        ...formData,
        status,
        createdAt: new Date().toISOString(),
      };
      saveGoals([...goals, newGoal]);
      toast.success('Goal created successfully');
    }
    
    setOpen(false);
    resetForm();
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      targetValue: goal.targetValue,
      currentValue: goal.currentValue,
      unit: goal.unit,
      deadline: goal.deadline,
    });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    saveGoals(goals.filter(g => g.id !== id));
    toast.success('Goal deleted successfully');
  };

  const updateProgress = (goalId: string, newValue: number) => {
    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        const progress = g.targetValue > 0 ? (newValue / g.targetValue) * 100 : 0;
        const status: Goal['status'] = 
          progress === 0 ? 'not-started' :
          progress >= 100 ? 'completed' :
          'in-progress';
        return { ...g, currentValue: newValue, status };
      }
      return g;
    });
    saveGoals(updatedGoals);
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'in-progress':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: Goal['status']) => {
    return status === 'completed' ? CheckCircle2 : Circle;
  };

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
              <Target className="w-5 h-5 text-white" />
            </div>
            <CardTitle>Project Goals</CardTitle>
          </div>
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingGoal ? 'Edit Goal' : 'New Goal'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Reach 1000 users"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your goal..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Target Value *</Label>
                    <Input
                      type="number"
                      value={formData.targetValue}
                      onChange={(e) => setFormData({ ...formData, targetValue: parseFloat(e.target.value) || 0 })}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label>Current Value</Label>
                    <Input
                      type="number"
                      value={formData.currentValue}
                      onChange={(e) => setFormData({ ...formData, currentValue: parseFloat(e.target.value) || 0 })}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label>Unit</Label>
                  <Input
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., users, $, tasks"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Deadline</Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projectGoals.map((goal) => {
            const progress = goal.targetValue > 0 
              ? Math.min((goal.currentValue / goal.targetValue) * 100, 100)
              : 0;
            const StatusIcon = getStatusIcon(goal.status);

            return (
              <div key={goal.id} className="p-4 rounded-xl glass space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <StatusIcon className={`w-5 h-5 mt-1 ${getStatusColor(goal.status)}`} />
                    <div className="flex-1">
                      <h4 className="font-semibold">{goal.title}</h4>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                      )}
                      {goal.deadline && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Deadline: {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(goal)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(goal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                  </div>
                  <Progress value={progress} />
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={goal.currentValue}
                      onChange={(e) => updateProgress(goal.id, parseFloat(e.target.value) || 0)}
                      className="flex-1"
                      placeholder="Update progress"
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {projectGoals.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No goals yet. Add your first goal to track progress!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
