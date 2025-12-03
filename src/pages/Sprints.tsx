import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useProjectContext } from "@/context/ProjectContext";
import { useSprints } from "@/hooks/use-sprints";
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
import { Plus, Calendar, Target, TrendingUp } from "lucide-react";
import { Sprint } from "@/types";
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

export default function Sprints() {
  const { addSprint, tasks, userStories } = useApp();
  const { projects, selectedProject: currentProject } = useProjectContext();
  const { createSprint: createSprintAPI, listSprints: listSprintsAPI, getSprintMetrics: getSprintMetricsAPI } = useSprints();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backendSprints, setBackendSprints] = useState<Sprint[]>([]);
  const [sprintMetrics, setSprintMetrics] = useState<Record<string, any>>({});
  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    startDate: "",
    endDate: "",
    projectId: currentProject?.id || "",
    velocity: 0,
    committedPoints: 0,
    completedPoints: 0,
    status: "planned" as Sprint["status"],
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load sprints from backend when component mounts or project changes
  useEffect(() => {
    const loadSprints = async () => {
      try {
        const data = await listSprintsAPI(currentProject?.id);
        // Convert backend sprints to local Sprint type
        const convertedSprints = data.map((s: any) => ({
          id: s.id,
          name: s.name,
          goal: s.goal,
          projectId: s.projectId,
          startDate: s.startDate || new Date().toISOString().split('T')[0],
          endDate: s.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: s.status as Sprint["status"],
          velocity: 0,
          committedPoints: 0,
          completedPoints: 0,
          userId: "",
        }));
        setBackendSprints(convertedSprints);

        // Load metrics for each sprint
        const metrics: Record<string, any> = {};
        for (const sprint of convertedSprints) {
          try {
            const sprintMetrics = await getSprintMetricsAPI(sprint.id);
            metrics[sprint.id] = sprintMetrics;
          } catch (error) {
            console.error(`Failed to load metrics for sprint ${sprint.id}:`, error);
          }
        }
        setSprintMetrics(metrics);
      } catch (error) {
        console.error("Failed to load sprints:", error);
      }
    };

    loadSprints();
  }, [currentProject?.id, listSprintsAPI, getSprintMetricsAPI]);

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

    // Numeric validation
    if (formData.committedPoints < 0) {
      errors.committedPoints = "Committed points must be non-negative";
    }

    if (isNaN(formData.committedPoints)) {
      errors.committedPoints = "Committed points must be a valid number";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix validation errors before submitting");
      return;
    }

    setIsLoading(true);
    try {
      // Call backend API to create sprint
      const createdSprint = await createSprintAPI({
        name: formData.name,
        goal: formData.goal,
        projectId: formData.projectId,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });

      // Add to backend sprints list for immediate UI update
      const sprint: Sprint = {
        id: createdSprint.id,
        name: createdSprint.name,
        goal: createdSprint.goal,
        projectId: formData.projectId,
        startDate: createdSprint.startDate,
        endDate: createdSprint.endDate,
        velocity: 0,
        committedPoints: 0,
        completedPoints: 0,
        userId: "",
        status: (createdSprint.status || "planned") as "planned" | "active" | "completed",
      };
      setBackendSprints([...backendSprints, sprint]);
      addSprint(sprint);
      toast.success("Sprint created successfully");
      
      // Clear form and errors
      setFormData({
        name: "",
        goal: "",
        startDate: "",
        endDate: "",
        projectId: currentProject?.id || "",
        velocity: 0,
        committedPoints: 0,
        completedPoints: 0,
        status: "planned",
      });
      setValidationErrors({});
      setIsCreateOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create sprint");
    } finally {
      setIsLoading(false);
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
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Sprint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Sprint</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Project *</Label>
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
                {validationErrors.projectId && (
                  <p className="text-sm text-destructive">{validationErrors.projectId}</p>
                )}
              </div>

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
                <Label>Committed Points</Label>
                <Input
                  type="number"
                  value={formData.committedPoints}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      committedPoints: parseInt(e.target.value) || 0,
                    });
                    if (validationErrors.committedPoints) {
                      setValidationErrors({ ...validationErrors, committedPoints: "" });
                    }
                  }}
                  min={0}
                  className={validationErrors.committedPoints ? "border-destructive" : ""}
                />
                {validationErrors.committedPoints && (
                  <p className="text-sm text-destructive">{validationErrors.committedPoints}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Sprint"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Sprint Burndown */}
      {backendSprints.filter(s => !currentProject || s.projectId === currentProject.id).some((s) => s.status === "active") && (
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
        {backendSprints
          .filter(sprint => !currentProject || sprint.projectId === currentProject.id)
          .map((sprint) => {
          const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);
          const sprintStories = userStories.filter((s) => s.sprintId === sprint.id);
          const metrics = sprintMetrics[sprint.id];
          const completionRate = metrics?.completionRate || 0;

          return (
            <Card key={sprint.id} className="glass glass-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{sprint.name}</CardTitle>
                      <Badge className={getStatusColor(sprint.status)}>
                        {sprint.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{sprint.goal}</p>
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
                      {metrics?.storyPointsCompleted || 0} / {metrics?.storyPointsCommitted || 0} pts
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>Velocity</span>
                    </div>
                    <p className="font-medium">{metrics?.velocity || 0} pts</p>
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

        {backendSprints.filter(sprint => !currentProject || sprint.projectId === currentProject.id).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No sprints created yet. Create your first sprint to get started!
          </div>
        )}
      </div>
    </div>
  );
}
