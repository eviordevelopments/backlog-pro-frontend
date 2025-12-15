import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useProjectContext } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { Task, TaskPriority, TaskStatus } from "@/types";
import { toast } from "sonner";
import { 
  createTask as createTaskAPI, 
  updateTask as updateTaskAPI, 
  deleteTask as deleteTaskAPI, 
  listTasksBySprint,
  Task as APITask,
  CreateTaskDto,
  UpdateTaskDto
} from "@/api/tasks/tasks";
import { listSprintsByProject, Sprint } from "@/api/sprints/sprints";

export default function Tasks() {
  const { teamMembers } = useApp();
  const { projects, selectedProject: currentProject } = useProjectContext();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<APITask | null>(null);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [tasks, setTasks] = useState<APITask[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sprints, setSprints] = useState<Sprint[]>([]);

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

  // Load sprints and tasks when project changes
  useEffect(() => {
    const loadSprintsAndTasks = async () => {
      if (!currentProject) {
        setTasks([]);
        setSprints([]);
        return;
      }

      setLoadingTasks(true);
      try {
        const token = getToken();
        if (!token) {
          toast.error("No authentication token found");
          return;
        }

        // Load sprints for the project
        const projectSprints = await listSprintsByProject(token, currentProject.id);
        setSprints(projectSprints);

        const allTasks: APITask[] = [];
        
        // Load tasks from all sprints
        for (const sprint of projectSprints) {
          const sprintTasks = await listTasksBySprint(token, sprint.id);
          allTasks.push(...sprintTasks);
        }
        
        setTasks(allTasks);
      } catch (error) {
        console.error("Failed to load sprints and tasks:", error);
        toast.error("Failed to load sprints and tasks");
      } finally {
        setLoadingTasks(false);
      }
    };

    loadSprintsAndTasks();
  }, [currentProject]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    storyPoints: 0,
    assignedTo: "unassigned",
    dueDate: "",
    tags: "",
    sprintId: "",
    projectId: "",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Update projectId when currentProject changes
  useEffect(() => {
    if (currentProject && !editingTask) {
      setFormData(prev => ({
        ...prev,
        projectId: currentProject.id
      }));
    }
  }, [currentProject, editingTask]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isCreateOpen) {
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        storyPoints: 0,
        assignedTo: "unassigned",
        dueDate: "",
        tags: "",
        sprintId: "",
        projectId: currentProject?.id || "",
      });
      setEditingTask(null);
      setValidationErrors({});
    }
  }, [isCreateOpen, currentProject]);

  const filteredTasks = tasks
    .filter(task => !currentProject || task.projectId === currentProject.id)
    .filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || task.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || task.priority === filterPriority;
    const matchesAssignee =
      filterAssignee === "all" || task.assignedTo === filterAssignee;
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.projectId) {
      errors.projectId = "Project is required";
    }

    if (!formData.sprintId) {
      errors.sprintId = "Sprint is required";
    }

    if (formData.storyPoints < 0) {
      errors.storyPoints = "Story points must be non-negative";
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      if (isNaN(dueDate.getTime())) {
        errors.dueDate = "Invalid date format";
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

    setIsSubmitting(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const tags = formData.tags.split(",").map((t) => t.trim()).filter(t => t);
      const assignedTo = formData.assignedTo === "unassigned" ? undefined : formData.assignedTo || undefined;
      const sprintId = formData.sprintId === "no-sprint" ? undefined : formData.sprintId || undefined;

      if (editingTask) {
        const updateData: UpdateTaskDto = {
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          storyPoints: formData.storyPoints,
          assignedTo,
          tags,
          dueDate: formData.dueDate || undefined,
        };
        await updateTaskAPI(token, editingTask.id, updateData);
        toast.success("Task updated successfully");
      } else {
        const createData: CreateTaskDto = {
          title: formData.title,
          description: formData.description || undefined,
          projectId: formData.projectId || currentProject?.id || "",
          sprintId,
          storyPoints: formData.storyPoints || undefined,
          tags: tags.length > 0 ? tags : undefined,
          dueDate: formData.dueDate || undefined,
        };
        await createTaskAPI(token, createData);
        toast.success("Task created successfully");
      }

      // Reload tasks
      const allTasks: APITask[] = [];
      for (const sprint of sprints) {
        if (sprint.projectId === currentProject?.id) {
          const sprintTasks = await listTasksBySprint(token, sprint.id);
          allTasks.push(...sprintTasks);
        }
      }
      
      setTasks(allTasks);

      // Clear form
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        storyPoints: 0,
        assignedTo: "unassigned",
        dueDate: "",
        tags: "",
        sprintId: "no-sprint",
        projectId: currentProject?.id || "",
      });
      setValidationErrors({});
      setEditingTask(null);
      setIsCreateOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (task: APITask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      storyPoints: task.storyPoints || 0,
      assignedTo: task.assignedTo || "unassigned",
      dueDate: task.dueDate || "",
      tags: task.tags?.join(", ") || "",
      sprintId: task.sprintId || "no-sprint",
      projectId: task.projectId,
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
      await deleteTaskAPI(token, id);
      setTasks(tasks.filter(t => t.id !== id));
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete task");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-warning text-warning-foreground";
      case "medium":
        return "bg-accent text-accent-foreground";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-success text-success-foreground";
      case "review":
        return "bg-accent text-accent-foreground";
      case "in-progress":
        return "bg-primary text-primary-foreground";
      case "todo":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Tasks</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all your tasks
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setEditingTask(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? "Edit Task" : "Create New Task"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto px-1">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (validationErrors.title) {
                      setValidationErrors({ ...validationErrors, title: "" });
                    }
                  }}
                  className={validationErrors.title ? "border-destructive" : ""}
                />
                {validationErrors.title && (
                  <p className="text-sm text-destructive">{validationErrors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Project *</Label>
                {projects && projects.length > 0 ? (
                  <Select
                    value={formData.projectId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, projectId: value })
                    }
                  >
                    <SelectTrigger className={validationErrors.projectId ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 border border-destructive rounded text-sm text-destructive">
                    No projects available. Create a project first.
                  </div>
                )}
                {validationErrors.projectId && (
                  <p className="text-sm text-destructive">{validationErrors.projectId}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        priority: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Story Points</Label>
                  <Input
                    type="number"
                    value={formData.storyPoints}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        storyPoints: parseInt(e.target.value) || 0,
                      });
                      if (validationErrors.storyPoints) {
                        setValidationErrors({ ...validationErrors, storyPoints: "" });
                      }
                    }}
                    min={0}
                    className={validationErrors.storyPoints ? "border-destructive" : ""}
                  />
                  {validationErrors.storyPoints && (
                    <p className="text-sm text-destructive">{validationErrors.storyPoints}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => {
                      setFormData({ ...formData, dueDate: e.target.value });
                      if (validationErrors.dueDate) {
                        setValidationErrors({ ...validationErrors, dueDate: "" });
                      }
                    }}
                    className={validationErrors.dueDate ? "border-destructive" : ""}
                  />
                  {validationErrors.dueDate && (
                    <p className="text-sm text-destructive">{validationErrors.dueDate}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assigned To</Label>
                  <Select
                    value={formData.assignedTo}
                    onValueChange={(value) => {
                      setFormData({ ...formData, assignedTo: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">None</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.name}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sprint *</Label>
                  <Select
                    value={formData.sprintId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sprintId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sprint" />
                    </SelectTrigger>
                    <SelectContent>
                      {sprints
                        .filter((sprint) => !currentProject || sprint.projectId === currentProject.id)
                        .map((sprint) => (
                          <SelectItem key={sprint.id} value={sprint.id}>
                            {sprint.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {!formData.sprintId && (
                    <p className="text-sm text-destructive">Sprint is required</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="frontend, bug, urgent"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingTask ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editingTask ? "Update Task" : "Create Task"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterAssignee} onValueChange={setFilterAssignee}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.name}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setSearchTerm("");
            setFilterStatus("all");
            setFilterPriority("all");
            setFilterAssignee("all");
          }}
        >
          Reset Filters
        </Button>
      </div>

      {/* Tasks List */}
      <div className="grid gap-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="glass p-4 rounded-lg glass-hover">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace("-", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {task.description}
                </p>
                <div className="flex flex-wrap gap-2 items-center text-sm">
                  <span className="text-muted-foreground">
                    Points: <strong>{task.storyPoints}</strong>
                  </span>
                  {task.assignedTo && (
                    <span className="text-muted-foreground">
                      Assigned: <strong>{task.assignedTo}</strong>
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="text-muted-foreground">
                      Due:{" "}
                      <strong>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </strong>
                    </span>
                  )}
                  {task.tags && task.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(task)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No tasks found. Create your first task to get started!
          </div>
        )}
      </div>
    </div>
  );
}
