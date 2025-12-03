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
import { Plus, Circle, Trash2 } from "lucide-react";
import { UserStory } from "@/api/user-stories/user-stories";
import { toast } from "sonner";

export default function UserStories() {
  const { sprints } = useApp();
  const { projects, selectedProject: currentProject } = useProjectContext();
  const { createUserStory: createUserStoryAPI, getProjectBacklog: getProjectBacklogAPI } = useUserStories();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [backendUserStories, setBackendUserStories] = useState<UserStory[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    userType: "",
    action: "",
    benefit: "",
    priority: "medium",
    storyPoints: 0,
    sprintId: "",
    projectId: currentProject?.id || "",
    description: "",
    businessValue: 0,
    role: "",
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
      const createdStory = await createUserStoryAPI({
        title: formData.title,
        userType: formData.userType,
        action: formData.action,
        benefit: formData.benefit,
        priority: formData.priority,
        storyPoints: formData.storyPoints,
        projectId: formData.projectId,
        sprintId: formData.sprintId || undefined,
        acceptanceCriteria,
      });

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
      priority: "medium",
      storyPoints: 0,
      sprintId: "",
      projectId: currentProject?.id || "",
      description: "",
      businessValue: 0,
      role: "",
    });
    setAcceptanceCriteria([]);
    setNewCriteria("");
    setValidationErrors({});
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
                      setFormData({ ...formData, priority: e.target.value })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

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
                    <CardTitle className="text-xl">{story.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
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
                          <span>{criteria}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No acceptance criteria</p>
                    )}
                  </div>
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
