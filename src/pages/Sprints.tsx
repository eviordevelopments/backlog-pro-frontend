import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useProjectContext } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Calendar, Target, TrendingUp, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  createSprint,
  listSprintsByProject,
  updateSprint,
  deleteSprint,
  Sprint,
  CreateSprintDto,
  UpdateSprintDto,
} from "@/api/sprints/sprints";

export default function Sprints() {
  const { tasks, userStories } = useApp();
  const { projects, selectedProject: currentProject } = useProjectContext();
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    startDate: "",
    endDate: "",
    projectId: currentProject?.id || "",
    dailyStandupTime: "09:00",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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

  // Load sprints from backend when component mounts or project changes
  useEffect(() => {
    const loadSprints = async () => {
      if (!currentProject) {
        setSprints([]);
        return;
      }

      try {
        const token = getToken();
        if (!token) {
          toast.error("No authentication token found");
          return;
        }

        const data = await listSprintsByProject(token, currentProject.id);
        setSprints(data);
      } catch (error) {
        console.error("Failed to load sprints:", error);
        toast.error("Failed to load sprints");
      }
    };

    loadSprints();
  }, [currentProject?.id]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Required field validation
    if (!formData.name.trim()) {
      errors.name = "Sprint name is required";
    }

    if (!formData.goal.trim()) {
      errors.goal = "Sprint goal is required";
    }

    if (!formData.projectId) {
      errors.projectId = "Project is required";
    }

    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      errors.endDate = "End date is required";
    }

    // Date validation
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (isNaN(start.getTime())) {
        errors.startDate = "Invalid start date format";
      }
      
      if (isNaN(end.getTime())) {
        errors.endDate = "Invalid end date format";
      }
      
      if (start >= end) {
        errors.endDate = "End date must be after start date";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix validation errors before submitting");
      return;
    }

    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      if (editingSprint) {
        const updateData: UpdateSprintDto = {
          name: formData.name,
          goal: formData.goal,
          endDate: formData.endDate,
          dailyStandupTime: formData.dailyStandupTime,
        };
        await updateSprint(token, editingSprint.id, updateData);
        toast.success("Sprint updated successfully");
      } else {
        const createData: CreateSprintDto = {
          name: formData.name,
          goal: formData.goal,
          projectId: formData.projectId || currentProject?.id || "",
          startDate: formData.startDate,
          endDate: formData.endDate,
          dailyStandupTime: formData.dailyStandupTime,
        };
        const newSprint = await createSprint(token, createData);
        toast.success("Sprint created successfully");
        
        // Add the new sprint to the list immediately
        setSprints([...sprints, newSprint]);
      }

      // Reload sprints with a small delay to ensure backend has processed the creation
      if (currentProject && editingSprint) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const data = await listSprintsByProject(token, currentProject.id);
        setSprints(data);
      }

      // Clear form
      setFormData({
        name: "",
        goal: "",
        startDate: "",
        endDate: "",
        projectId: currentProject?.id || "",
        dailyStandupTime: "09:00",
      });
      setValidationErrors({});
      setEditingSprint(null);
      setIsCreateOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save sprint");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (sprint: Sprint) => {
    setEditingSprint(sprint);
    setFormData({
      name: sprint.name,
      goal: sprint.goal || "",
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      projectId: sprint.projectId,
      dailyStandupTime: sprint.dailyStandupTime || "09:00",
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = getToken();
      if (!token) {
        toast.error("No authentication token found");
        return;
      }
      await deleteSprint(token, id);
      setSprints(sprints.filter(s => s.id !== id));
      toast.success("Sprint deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete sprint");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "active":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const burndownData = [
    { day: "Day 1", ideal: 50, actual: 50 },
    { day: "Day 2", ideal: 45, actual: 48 },
    { day: "Day 3", ideal: 40, actual: 42 },
    { day: "Day 4", ideal: 35, actual: 38 },
    { day: "Day 5", ideal: 30, actual: 30 },
    { day: "Day 6", ideal: 25, actual: 25 },
    { day: "Day 7", ideal: 20, actual: 18 },
    { day: "Day 8", ideal: 15, actual: 15 },
    { day: "Day 9", ideal: 10, actual: 8 },
    { day: "Day 10", ideal: 5, actual: 3 },
    { day: "Day 11", ideal: 0, actual: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Sprints</h1>
          <p className="text-muted-foreground mt-2">
            Plan and track your sprint progress
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setEditingSprint(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New Sprint
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSprint ? "Edit Sprint" : "Create New Sprint"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingSprint && (
                <div className="space-y-2">
                  <Label>Project *</Label>
                  {projects && projects.length > 0 ? (
                    <select
                      value={formData.projectId}
                      onChange={(e) => {
                        setFormData({ ...formData, projectId: e.target.value });
                        if (validationErrors.projectId) {
                          setValidationErrors({ ...validationErrors, projectId: "" });
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                        validationErrors.projectId ? "border-destructive" : "border-input"
                      }`}
                    >
                      <option value="">Select a project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2 border border-destructive rounded text-sm text-destructive">
                      No projects available. Create a project first.
                    </div>
                  )}
                  {validationErrors.projectId && (
                    <p className="text-sm text-destructive">{validationErrors.projectId}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Sprint Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (validationErrors.name) {
                      setValidationErrors({ ...validationErrors, name: "" });
                    }
                  }}
                  placeholder="Sprint 1"
                  className={validationErrors.name ? "border-destructive" : ""}
                />
                {validationErrors.name && (
                  <p className="text-sm text-destructive">{validationErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Sprint Goal *</Label>
                <Textarea
                  value={formData.goal}
                  onChange={(e) => {
                    setFormData({ ...formData, goal: e.target.value });
                    if (validationErrors.goal) {
                      setValidationErrors({ ...validationErrors, goal: "" });
                    }
                  }}
                  placeholder="What do you want to achieve in this sprint?"
                  rows={3}
                  className={validationErrors.goal ? "border-destructive" : ""}
                />
                {validationErrors.goal && (
                  <p className="text-sm text-destructive">{validationErrors.goal}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => {
                      setFormData({ ...formData, startDate: e.target.value });
                      if (validationErrors.startDate) {
                        setValidationErrors({ ...validationErrors, startDate: "" });
                      }
                    }}
                    disabled={!!editingSprint}
                    className={validationErrors.startDate ? "border-destructive" : ""}
                  />
                  {validationErrors.startDate && (
                    <p className="text-sm text-destructive">{validationErrors.startDate}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => {
                      setFormData({ ...formData, endDate: e.target.value });
                      if (validationErrors.endDate) {
                        setValidationErrors({ ...validationErrors, endDate: "" });
                      }
                    }}
                    className={validationErrors.endDate ? "border-destructive" : ""}
                  />
                  {validationErrors.endDate && (
                    <p className="text-sm text-destructive">{validationErrors.endDate}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Daily Standup Time</Label>
                <Input
                  type="time"
                  value={formData.dailyStandupTime}
                  onChange={(e) =>
                    setFormData({ ...formData, dailyStandupTime: e.target.value })
                  }
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingSprint ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editingSprint ? "Update Sprint" : "Create Sprint"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Sprint Burndown */}
      {sprints.filter(s => !currentProject || s.projectId === currentProject.id).some((s) => s.status === "active") && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Active Sprint Burndown Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={burndownData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px",
                    border: "none",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ideal"
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Sprints List */}
      <div className="grid gap-4">
        {sprints
          .filter(sprint => !currentProject || sprint.projectId === currentProject.id)
          .map((sprint) => {
          const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);
          const sprintStories = userStories.filter((s) => s.sprintId === sprint.id);
          const completionRate = sprint.storyPointsCommitted > 0 
            ? (sprint.storyPointsCompleted / sprint.storyPointsCommitted) * 100 
            : 0;

          return (
            <Card key={sprint.id} className="glass glass-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{sprint.name}</CardTitle>
                      <Badge className={getStatusColor(sprint.status)}>
                        {sprint.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{sprint.goal}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(sprint)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(sprint.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Duration</span>
                    </div>
                    <p className="font-medium">
                      {new Date(sprint.startDate).toLocaleDateString()} -{" "}
                      {new Date(sprint.endDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span>Progress</span>
                    </div>
                    <p className="font-medium">
                      {sprint.storyPointsCompleted} / {sprint.storyPointsCommitted} pts
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>Velocity</span>
                    </div>
                    <p className="font-medium">{sprint.velocity} pts</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Items</p>
                    <p className="font-medium">
                      {sprintTasks.length} tasks, {sprintStories.length} stories
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Completion Rate</span>
                    <span className="font-medium">{completionRate.toFixed(0)}%</span>
                  </div>
                  <Progress value={completionRate} />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {sprints.filter(sprint => !currentProject || sprint.projectId === currentProject.id).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No sprints created yet. Create your first sprint to get started!
          </div>
        )}
      </div>
    </div>
  );
}
