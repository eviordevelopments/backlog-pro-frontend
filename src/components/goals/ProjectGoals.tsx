import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProjectContext } from '@/context/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Target, CheckCircle2, Circle, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { createGoal, updateGoalProgress, getUserGoals, Goal, CreateGoalDto } from '@/api/goals/goals';

export default function ProjectGoals() {
  const { user } = useAuth();
  const { selectedProject: currentProject } = useProjectContext();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [open, setOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetValue: 0,
    currentValue: 0,
    unit: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    type: 'team' as const,
    category: 'productivity',
    period: 'quarterly',
  });

  const getToken = (): string | null => {
    const sessionData = localStorage.getItem('auth_session');
    if (!sessionData) return null;
    try {
      const session = JSON.parse(sessionData);
      return session.accessToken;
    } catch {
      return null;
    }
  };

  // Load goals from backend
  const loadGoals = async () => {
    const token = getToken();
    if (!token || !user) return;
    
    try {
      setLoading(true);
      const data = await getUserGoals(token, user.id);
      setGoals(data);
      // Also save to localStorage for offline access
      localStorage.setItem('projectGoals', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to load goals:', error);
      // Fallback to localStorage
      try {
        const saved = localStorage.getItem('projectGoals');
        if (saved) {
          setGoals(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load from localStorage:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  // Save goals to localStorage
  const saveGoalsLocal = (newGoals: Goal[]) => {
    setGoals(newGoals);
    localStorage.setItem('projectGoals', JSON.stringify(newGoals));
  };

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetValue: 0,
      currentValue: 0,
      unit: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      type: 'team',
      category: 'productivity',
      period: 'quarterly',
    });
    setEditingGoal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = getToken();
    if (!token || !user) {
      toast.error('Not authenticated');
      return;
    }

    if (!currentProject) {
      toast.error('Please select a project first');
      return;
    }

    try {
      setLoading(true);
      
      const input: CreateGoalDto = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        targetValue: formData.targetValue,
        unit: formData.unit,
        period: formData.period,
        startDate: formData.startDate,
        endDate: formData.endDate,
        ownerId: user.id,
      };

      const newGoal = await createGoal(token, input);
      
      // Add projectId locally
      const goalWithProject = { ...newGoal, projectId: currentProject.id };
      toast.success('Goal created successfully');
      
      // Add to local storage
      saveGoalsLocal([...goals, goalWithProject]);
      
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create goal:', error);
      toast.error('Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const updatedGoals = goals.filter(g => g.id !== id);
      saveGoalsLocal(updatedGoals);
      toast.success('Goal deleted successfully');
    } catch (error) {
      console.error('Failed to delete goal:', error);
      toast.error('Failed to delete goal');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (goalId: string, newValue: number) => {
    const token = getToken();
    if (!token) {
      toast.error('Not authenticated');
      return;
    }

    try {
      setLoading(true);
      const updated = await updateGoalProgress(token, goalId, newValue);
      
      // Update local storage
      const updatedGoals = goals.map(g => g.id === goalId ? updated : g);
      saveGoalsLocal(updatedGoals);
      
      toast.success('Goal progress updated');
    } catch (error) {
      console.error('Failed to update goal progress:', error);
      toast.error('Failed to update goal progress');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'active':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
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
                    disabled={loading}
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
                    disabled={loading}
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
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Input
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="e.g., users, $, tasks"
                      className="mt-2"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="mt-2"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="mt-2"
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Goal'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.filter(g => !currentProject || g.projectId === currentProject.id).map((goal) => {
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
                      {goal.endDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Deadline: {new Date(goal.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(goal.id)}
                      disabled={loading}
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
                      onChange={(e) => handleUpdateProgress(goal.id, parseFloat(e.target.value) || 0)}
                      className="flex-1"
                      placeholder="Update progress"
                      disabled={loading}
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {goals.filter(g => !currentProject || g.projectId === currentProject.id).length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No goals yet. Add your first goal to track progress!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
