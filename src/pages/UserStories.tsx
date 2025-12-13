import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useProjectContext } from "@/context/ProjectContext";
import { useUserStories } from "@/hooks/use-user-stories";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Circle, Trash2, Edit2 } from "lucide-react";
import { UserStory } from "@/api/user-stories/user-stories";
import { toast } from "sonner";

export default function UserStories() {
  const { sprints } = useApp();
  const { projects, selectedProject: currentProject } = useProjectContext();
  const { 
    createUserStory: createUserStoryAPI, 
    getProjectBacklog: getProjectBacklogAPI,
    updateUserStory: updateUserStoryAPI,
    deleteUserStory: deleteUserStoryAPI,
  } = useUserStories();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<UserStory | null>(null);
  const [backendUserStories, setBackendUserStories] = useState<UserStory[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    userType: "",
    action: "",
    benefit: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    storyPoints: 0,
    sprintId: "",
    projectId: currentProject?.id || "",
    status: "backlog" as "backlog" | "ready" | "in-progress" | "done",
    definitionOfDone: "",
    impactMetrics: "",
    assignedTo: "",
  });

  const [newCriteria, setNewCriteria] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string[]>([]);
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load user stories from backend when component mounts or project changes
  useEffect(() => {
    const loadUserStories = async () => {
      try {
        const data = await getProjectBacklogAPI(currentProject?.id || "");
        // Add projectId to each story since backend doesn't return it
        const storiesWithProjectId = data.map((story: any) => ({
          ...story,
          projectId: currentProject?.id || "",
        }));
        setBackendUserStories(storiesWithProjectId);
      } catch (error) {
        console.error("Failed to load user stories:", error);
      }
    };

    if (currentProject?.id) {
      loadUserStories();
    }
  }, [currentProject?.id, getProjectBacklogAPI]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.userType.trim()) {
      errors.userType = "Role is required";
    }

    if (!formData.action.trim()) {
      errors.action = "Action is required";
    }

    if (!formData.benefit.trim()) {
      errors.benefit = "Benefit is required";
    }

    if (formData.storyPoints < 0 || isNaN(formData.storyPoints)) {
      errors.storyPoints = "Story points must be a valid non-negative number";
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

    try {
      // Create in backend
      const payload: any = {
        title: formData.title,
        userType: formData.userType,
        action: formData.action,
        benefit: formData.benefit,
        priority: formData.priority,
        storyPoints: formData.storyPoints,
        projectId: formData.projectId,
      };

      if (formData.sprintId) payload.sprintId = formData.sprintId;
      if (acceptanceCriteria.length > 0) {
        payload.acceptanceCriteria = acceptanceCriteria.filter(c => c.trim() !== "");
      }
      if (formData.definitionOfDone) payload.definitionOfDone = formData.definitionOfDone;
      if (formData.impactMetrics) payload.impactMetrics = formData.impactMetrics;

      const createdStory = await createUserStoryAPI(payload);

      // Add to backend stories list with projectId
      const storyWithProjectId = {
        ...createdStory,
        projectId: formData.projectId,
        acceptanceCriteria,
      };
      setBackendUserStories([...backendUserStories, storyWithProjectId]);
      toast.success("User Story created successfully");
      resetForm();
      setIsCreateOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create user story");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      userType: "",
      action: "",
      benefit: "",
      priority: "medium" as "low" | "medium" | "high" | "critical",
      storyPoints: 0,
      sprintId: "",
      projectId: currentProject?.id || "",
      status: "backlog" as "backlog" | "ready" | "in-progress" | "done",
      definitionOfDone: "",
      impactMetrics: "",
      assignedTo: "",
    });
    setAcceptanceCriteria([]);
    setNewCriteria("");
    setValidationErrors({});
    setEditingStory(null);
  };

  const addCriteria = () => {
    if (newCriteria.trim()) {
      setAcceptanceCriteria([...acceptanceCriteria, newCriteria]);
      setNewCriteria("");
    }
  };

  const removeCriteria = (index: number) => {
    setAcceptanceCriteria(acceptanceCriteria.filter((_, i) => i !== index));
  };

  const handleEditClick = (story: UserStory) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      userType: story.userType,
      action: story.action,
      benefit: story.benefit,
      priority: story.priority,
      storyPoints: story.storyPoints,
      sprintId: story.sprintId || "",
      projectId: story.projectId,
      status: story.status,
      definitionOfDone: story.definitionOfDone || "",
      impactMetrics: story.impactMetrics || "",
      assignedTo: story.assignedTo || "",
    });
    
    // Handle both string[] and AcceptanceCriteria[] formats
    const criteria = story.acceptanceCriteria || [];
    const criteriaStrings = criteria.map((c) => 
      typeof c === 'string' ? c : c.description
    );
    setAcceptanceCriteria(criteriaStrings);
    setIsEditOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !editingStory) {
      toast.error("Please fix validation errors before submitting");
      return;
    }

    try {
      const payload: any = {
        title: formData.title,
        userType: formData.userType,
        action: formData.action,
        benefit: formData.benefit,
        priority: formData.priority,
        storyPoints: formData.storyPoints,
        status: formData.status,
      };

      if (formData.sprintId) payload.sprintId = formData.sprintId;
      if (acceptanceCriteria.length > 0) {
        payload.acceptanceCriteria = acceptanceCriteria.filter(c => c.trim() !== "");
      }
      if (formData.definitionOfDone) payload.definitionOfDone = formData.definitionOfDone;
      if (formData.impactMetrics) payload.impactMetrics = formData.impactMetrics;
      if (formData.assignedTo) payload.assignedTo = formData.assignedTo;

      const updatedStory = await updateUserStoryAPI(editingStory.id, payload);

      // Merge the response with the original story to preserve fields not returned by backend
      const mergedStory = {
        ...editingStory,
        ...updatedStory,
      };

      setBackendUserStories(
        backendUserStories.map((s) => (s.id === editingStory.id ? mergedStory : s))
      );
      toast.success("User Story updated successfully");
      resetForm();
      setIsEditOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user story");
    }
  };

  const handleDelete = async (storyId: string) => {
    if (!confirm("Are you sure you want to delete this user story?")) {
      return;
    }

    try {
      await deleteUserStoryAPI(storyId);
      setBackendUserStories(backendUserStories.filter((s) => s.id !== storyId));
      toast.success("User Story deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user story");
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient">User Stories</h1>
          <p className="text-muted-foreground mt-2">
            Define and track user stories with acceptance criteria
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New User Story
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User Story</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Short descriptive title"
                  className={validationErrors.title ? "border-destructive" : ""}
                />
                {validationErrors.title && (
                  <p className="text-sm text-destructive">{validationErrors.title}</p>
                )}
              </div>

              <div className="p-4 glass rounded-lg space-y-3">
                <p className="font-medium">INVEST Format</p>
                <div className="space-y-2">
                  <Label>As a (Role) *</Label>
                  <Input
                    value={formData.userType}
                    onChange={(e) => {
                      setFormData({ ...formData, userType: e.target.value });
                      if (validationErrors.userType) {
                        setValidationErrors({ ...validationErrors, userType: "" });
                      }
                    }}
                    placeholder="Product Owner, Developer, User..."
                    className={validationErrors.userType ? "border-destructive" : ""}
                  />
                  {validationErrors.userType && (
                    <p className="text-sm text-destructive">{validationErrors.userType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>I want to (Action) *</Label>
                  <Input
                    value={formData.action}
                    onChange={(e) => {
                      setFormData({ ...formData, action: e.target.value });
                      if (validationErrors.action) {
                        setValidationErrors({ ...validationErrors, action: "" });
                      }
                    }}
                    placeholder="create tasks, view reports..."
                    className={validationErrors.action ? "border-destructive" : ""}
                  />
                  {validationErrors.action && (
                    <p className="text-sm text-destructive">{validationErrors.action}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>So that (Benefit) *</Label>
                  <Input
                    value={formData.benefit}
                    onChange={(e) => {
                      setFormData({ ...formData, benefit: e.target.value });
                      if (validationErrors.benefit) {
                        setValidationErrors({ ...validationErrors, benefit: "" });
                      }
                    }}
                    placeholder="I can track progress efficiently..."
                    className={validationErrors.benefit ? "border-destructive" : ""}
                  />
                  {validationErrors.benefit && (
                    <p className="text-sm text-destructive">{validationErrors.benefit}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Project *</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.projectId}
                  onChange={(e) =>
                    setFormData({ ...formData, projectId: e.target.value })
                  }
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
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
                  <Label>Priority</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as "low" | "medium" | "high" | "critical" })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sprint (Optional)</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.sprintId}
                    onChange={(e) =>
                      setFormData({ ...formData, sprintId: e.target.value })
                    }
                  >
                    <option value="">No Sprint</option>
                    {sprints.map((sprint) => (
                      <option key={sprint.id} value={sprint.id}>
                        {sprint.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as any })
                    }
                  >
                    <option value="backlog">Backlog</option>
                    <option value="ready">Ready</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assigned To (Optional)</Label>
                <Input
                  value={formData.assignedTo}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedTo: e.target.value })
                  }
                  placeholder="Team member name or ID"
                />
              </div>

              <div className="space-y-2">
                <Label>Definition of Done (Optional)</Label>
                <Input
                  value={formData.definitionOfDone}
                  onChange={(e) =>
                    setFormData({ ...formData, definitionOfDone: e.target.value })
                  }
                  placeholder="e.g., Feature is tested and deployed"
                />
              </div>

              <div className="space-y-2">
                <Label>Impact Metrics (Optional)</Label>
                <Input
                  value={formData.impactMetrics}
                  onChange={(e) =>
                    setFormData({ ...formData, impactMetrics: e.target.value })
                  }
                  placeholder="e.g., Reduce login time by 50%"
                />
              </div>

              <div className="space-y-3">
                <Label>Acceptance Criteria</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCriteria}
                    onChange={(e) => setNewCriteria(e.target.value)}
                    placeholder="Add acceptance criteria..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCriteria();
                      }
                    }}
                  />
                  <Button type="button" onClick={addCriteria}>
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {acceptanceCriteria.map((criteria, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 glass rounded"
                    >
                      <Circle className="h-4 w-4 text-success" />
                      <span className="flex-1">{criteria}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriteria(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full">
                Create User Story
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User Story</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
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
                placeholder="Short descriptive title"
                className={validationErrors.title ? "border-destructive" : ""}
              />
              {validationErrors.title && (
                <p className="text-sm text-destructive">{validationErrors.title}</p>
              )}
            </div>

            <div className="p-4 glass rounded-lg space-y-3">
              <p className="font-medium">INVEST Format</p>
              <div className="space-y-2">
                <Label>As a (Role) *</Label>
                <Input
                  value={formData.userType}
                  onChange={(e) => {
                    setFormData({ ...formData, userType: e.target.value });
                    if (validationErrors.userType) {
                      setValidationErrors({ ...validationErrors, userType: "" });
                    }
                  }}
                  placeholder="Product Owner, Developer, User..."
                  className={validationErrors.userType ? "border-destructive" : ""}
                />
                {validationErrors.userType && (
                  <p className="text-sm text-destructive">{validationErrors.userType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>I want to (Action) *</Label>
                <Input
                  value={formData.action}
                  onChange={(e) => {
                    setFormData({ ...formData, action: e.target.value });
                    if (validationErrors.action) {
                      setValidationErrors({ ...validationErrors, action: "" });
                    }
                  }}
                  placeholder="create tasks, view reports..."
                  className={validationErrors.action ? "border-destructive" : ""}
                />
                {validationErrors.action && (
                  <p className="text-sm text-destructive">{validationErrors.action}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>So that (Benefit) *</Label>
                <Input
                  value={formData.benefit}
                  onChange={(e) => {
                    setFormData({ ...formData, benefit: e.target.value });
                    if (validationErrors.benefit) {
                      setValidationErrors({ ...validationErrors, benefit: "" });
                    }
                  }}
                  placeholder="I can track progress efficiently..."
                  className={validationErrors.benefit ? "border-destructive" : ""}
                />
                {validationErrors.benefit && (
                  <p className="text-sm text-destructive">{validationErrors.benefit}</p>
                )}
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
                <Label>Priority</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value as any })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sprint (Optional)</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.sprintId}
                  onChange={(e) =>
                    setFormData({ ...formData, sprintId: e.target.value })
                  }
                >
                  <option value="">No Sprint</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as any })
                  }
                >
                  <option value="backlog">Backlog</option>
                  <option value="ready">Ready</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assigned To (Optional)</Label>
              <Input
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData({ ...formData, assignedTo: e.target.value })
                }
                placeholder="Team member name or ID"
              />
            </div>

            <div className="space-y-2">
              <Label>Definition of Done (Optional)</Label>
              <Input
                value={formData.definitionOfDone}
                onChange={(e) =>
                  setFormData({ ...formData, definitionOfDone: e.target.value })
                }
                placeholder="e.g., Feature is tested and deployed"
              />
            </div>

            <div className="space-y-2">
              <Label>Impact Metrics (Optional)</Label>
              <Input
                value={formData.impactMetrics}
                onChange={(e) =>
                  setFormData({ ...formData, impactMetrics: e.target.value })
                }
                placeholder="e.g., Reduce login time by 50%"
              />
            </div>

            <div className="space-y-3">
              <Label>Acceptance Criteria</Label>
              <div className="flex gap-2">
                <Input
                  value={newCriteria}
                  onChange={(e) => setNewCriteria(e.target.value)}
                  placeholder="Add acceptance criteria..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCriteria();
                    }
                  }}
                />
                <Button type="button" onClick={addCriteria}>
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {acceptanceCriteria.map((criteria, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 glass rounded"
                  >
                    <Circle className="h-4 w-4 text-success" />
                    <span className="flex-1">{criteria}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCriteria(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Update User Story
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* User Stories List */}
      <div className="grid gap-4">
        {backendUserStories
          .filter(story => !currentProject || story.projectId === currentProject.id)
          .map((story) => {
          return (
            <Card
              key={story.id}
              className="glass glass-hover"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{story.title}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {story.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      As a <strong>{story.userType}</strong>, I want to{" "}
                      <strong>{story.action}</strong>, so that{" "}
                      <strong>{story.benefit}</strong>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{story.storyPoints} pts</Badge>
                    <Badge className="bg-accent text-accent-foreground">
                      {story.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Acceptance Criteria</span>
                    <span className="text-muted-foreground">
                      {story.acceptanceCriteria?.length || 0} criteria
                    </span>
                  </div>

                  <div className="space-y-2">
                    {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 ? (
                      story.acceptanceCriteria.map((criteria, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Circle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span>{typeof criteria === 'string' ? criteria : criteria.description}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No acceptance criteria</p>
                    )}
                  </div>
                </div>

                {(story.definitionOfDone || story.impactMetrics || story.assignedTo) && (
                  <div className="pt-2 border-t border-border space-y-2 text-sm">
                    {story.definitionOfDone && (
                      <div>
                        <span className="font-medium text-muted-foreground">Definition of Done:</span>
                        <p className="text-foreground">{story.definitionOfDone}</p>
                      </div>
                    )}
                    {story.impactMetrics && (
                      <div>
                        <span className="font-medium text-muted-foreground">Impact Metrics:</span>
                        <p className="text-foreground">{story.impactMetrics}</p>
                      </div>
                    )}
                    {story.assignedTo && (
                      <div>
                        <span className="font-medium text-muted-foreground">Assigned to:</span>
                        <p className="text-foreground">{story.assignedTo}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditClick(story)}
                    className="gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(story.id)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {backendUserStories.filter(story => !currentProject || story.projectId === currentProject.id).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No user stories yet. Create your first story to get started!
          </div>
        )}
      </div>
    </div>
  );
}
