import { useState } from "react";
import { useApp } from "@/context/AppContext";
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
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Task, TaskPriority, TaskStatus } from "@/types";
import { toast } from "sonner";

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, teamMembers, sprints, currentProject, projects } =
    useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo" as TaskStatus,
    priority: "medium" as TaskPriority,
    storyPoints: 0,
    assignedTo: "",
    estimatedDate: "",
    tags: "",
    sprintId: "",
    projectId: currentProject?.id || "",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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

    // Required field validation
    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.assignedTo) {
      errors.assignedTo = "Assignee is required";
    }

    // Data type validation
    if (formData.storyPoints < 0) {
      errors.storyPoints = "Story points must be non-negative";
    }

    if (isNaN(formData.storyPoints)) {
      errors.storyPoints = "Story points must be a valid number";
    }

    // Date validation
    if (formData.estimatedDate) {
      const estimatedDate = new Date(formData.estimatedDate);
      if (isNaN(estimatedDate.getTime())) {
        errors.estimatedDate = "Invalid date format";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix validation errors before submitting");
      return;
    }

    try {
      const taskData = {
        ...formData,
        projectId: formData.projectId || currentProject?.id || "default-project",
        tags: formData.tags.split(",").map((t) => t.trim()).filter(t => t),
        id: editingTask?.id || Date.now().toString(),
        createdAt: editingTask?.createdAt || new Date().toISOString(),
      };

      if (editingTask) {
        updateTask(editingTask.id, taskData);
        toast.success("Task updated successfully");
      } else {
        addTask(taskData as Task);
        toast.success("Task created successfully");
      }

      // Clear form and errors
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        storyPoints: 0,
        assignedTo: "",
        estimatedDate: "",
        tags: "",
        sprintId: "",
        projectId: currentProject?.id || "",
      });
      setValidationErrors({});
      setEditingTask(null);
      setIsCreateOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save task");
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      ...task,
      tags: task.tags.join(", "),
      sprintId: task.sprintId || "",
      projectId: task.projectId || currentProject?.id || "",
    });
    setIsCreateOpen(true);
  };

  const handleDelete = (id: string) => {
    try {
      deleteTask(id);
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete task");
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "critical":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-warning text-warning-foreground";
      case "medium":
        return "bg-accent text-accent-foreground";
      case "low":
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "done":
        return "bg-success text-success-foreground";
      case "review":
        return "bg-accent text-accent-foreground";
      case "in-progress":
        return "bg-primary text-primary-foreground";
      case "todo":
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
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
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
                <Select
                  value={formData.projectId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, projectId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects && projects.length > 0 ? (
                      projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="default-project">Default Project</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value as TaskStatus })
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
                        priority: value as TaskPriority,
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
                  <Label>Estimated Date</Label>
                  <Input
                    type="date"
                    value={formData.estimatedDate}
                    onChange={(e) => {
                      setFormData({ ...formData, estimatedDate: e.target.value });
                      if (validationErrors.estimatedDate) {
                        setValidationErrors({ ...validationErrors, estimatedDate: "" });
                      }
                    }}
                    className={validationErrors.estimatedDate ? "border-destructive" : ""}
                  />
                  {validationErrors.estimatedDate && (
                    <p className="text-sm text-destructive">{validationErrors.estimatedDate}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assigned To *</Label>
                  <Select
                    value={formData.assignedTo}
                    onValueChange={(value) => {
                      setFormData({ ...formData, assignedTo: value });
                      if (validationErrors.assignedTo) {
                        setValidationErrors({ ...validationErrors, assignedTo: "" });
                      }
                    }}
                  >
                    <SelectTrigger className={validationErrors.assignedTo ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.name}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.assignedTo && (
                    <p className="text-sm text-destructive">{validationErrors.assignedTo}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Sprint</Label>
                  <Select
                    value={formData.sprintId || "no-sprint"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sprintId: value === "no-sprint" ? "" : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sprint" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-sprint">No Sprint</SelectItem>
                      {sprints.map((sprint) => (
                        <SelectItem key={sprint.id} value={sprint.id}>
                          {sprint.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              <Button type="submit" className="w-full">
                {editingTask ? "Update Task" : "Create Task"}
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
                  {task.estimatedDate && (
                    <span className="text-muted-foreground">
                      Due:{" "}
                      <strong>
                        {new Date(task.estimatedDate).toLocaleDateString()}
                      </strong>
                    </span>
                  )}
                  {task.tags.map((tag) => (
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
