import { useState } from "react";
import { useApp } from "@/context/AppContext";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2, Circle, Trash2 } from "lucide-react";
import { UserStory, AcceptanceCriteria } from "@/types";
import { toast } from "sonner";

export default function UserStories() {
  const { userStories, addUserStory, updateUserStory, deleteUserStory, sprints, currentProject, projects } =
    useApp();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    role: "",
    action: "",
    benefit: "",
    description: "",
    storyPoints: 0,
    businessValue: 0,
    sprintId: "",
    projectId: currentProject?.id || "",
  });

  const [newCriteria, setNewCriteria] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<
    AcceptanceCriteria[]
  >([]);
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Required field validation
    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.role.trim()) {
      errors.role = "Role is required";
    }

    if (!formData.action.trim()) {
      errors.action = "Action is required";
    }

    if (!formData.benefit.trim()) {
      errors.benefit = "Benefit is required";
    }

    // Numeric validation
    if (formData.storyPoints < 0) {
      errors.storyPoints = "Story points must be non-negative";
    }

    if (isNaN(formData.storyPoints)) {
      errors.storyPoints = "Story points must be a valid number";
    }

    if (formData.businessValue < 0 || formData.businessValue > 100) {
      errors.businessValue = "Business value must be between 0 and 100";
    }

    if (isNaN(formData.businessValue)) {
      errors.businessValue = "Business value must be a valid number";
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
      const story: UserStory = {
        ...formData,
        projectId: currentProject?.id || "default-project",
        id: Date.now().toString(),
        acceptanceCriteria,
        createdAt: new Date().toISOString(),
      };
      addUserStory(story);
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
      role: "",
      action: "",
      benefit: "",
      description: "",
      storyPoints: 0,
      businessValue: 0,
      sprintId: "",
      projectId: currentProject?.id || "",
    });
    setAcceptanceCriteria([]);
    setNewCriteria("");
    setValidationErrors({});
  };

  const addCriteria = () => {
    if (newCriteria.trim()) {
      setAcceptanceCriteria([
        ...acceptanceCriteria,
        {
          id: Date.now().toString(),
          description: newCriteria,
          completed: false,
        },
      ]);
      setNewCriteria("");
    }
  };

  const removeCriteria = (id: string) => {
    setAcceptanceCriteria(acceptanceCriteria.filter((c) => c.id !== id));
  };

  const toggleCriteria = (story: UserStory, criteriaId: string) => {
    try {
      const updatedCriteria = story.acceptanceCriteria.map((c) =>
        c.id === criteriaId ? { ...c, completed: !c.completed } : c
      );
      updateUserStory(story.id, { acceptanceCriteria: updatedCriteria });
      toast.success("User Story updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user story");
    }
  };

  const handleDelete = (id: string) => {
    try {
      deleteUserStory(id);
      toast.success("User Story deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user story");
    }
  };

  const getCompletionPercentage = (criteria: AcceptanceCriteria[]) => {
    if (criteria.length === 0) return 0;
    const completed = criteria.filter((c) => c.completed).length;
    return (completed / criteria.length) * 100;
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
                    value={formData.role}
                    onChange={(e) => {
                      setFormData({ ...formData, role: e.target.value });
                      if (validationErrors.role) {
                        setValidationErrors({ ...validationErrors, role: "" });
                      }
                    }}
                    placeholder="Product Owner, Developer, User..."
                    className={validationErrors.role ? "border-destructive" : ""}
                  />
                  {validationErrors.role && (
                    <p className="text-sm text-destructive">{validationErrors.role}</p>
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

              <div className="grid grid-cols-3 gap-4">
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
                  <Label>Business Value (0-100)</Label>
                  <Input
                    type="number"
                    value={formData.businessValue}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        businessValue: parseInt(e.target.value) || 0,
                      });
                      if (validationErrors.businessValue) {
                        setValidationErrors({ ...validationErrors, businessValue: "" });
                      }
                    }}
                    min={0}
                    max={100}
                    className={validationErrors.businessValue ? "border-destructive" : ""}
                  />
                  {validationErrors.businessValue && (
                    <p className="text-sm text-destructive">{validationErrors.businessValue}</p>
                  )}
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
              </div>

              <div className="space-y-3">
                <Label>Acceptance Criteria</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCriteria}
                    onChange={(e) => setNewCriteria(e.target.value)}
                    placeholder="Add acceptance criteria..."
                    onKeyPress={(e) => {
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
                  {acceptanceCriteria.map((criteria) => (
                    <div
                      key={criteria.id}
                      className="flex items-center gap-2 p-2 glass rounded"
                    >
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="flex-1">{criteria.description}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriteria(criteria.id)}
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
        {userStories
          .filter(story => !currentProject || story.projectId === currentProject.id)
          .map((story) => {
          const completion = getCompletionPercentage(story.acceptanceCriteria);
          return (
            <Card
              key={story.id}
              className="glass glass-hover cursor-pointer"
              onClick={() => setSelectedStory(story)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{story.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      As a <strong>{story.role}</strong>, I want to{" "}
                      <strong>{story.action}</strong>, so that{" "}
                      <strong>{story.benefit}</strong>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{story.storyPoints} pts</Badge>
                    <Badge className="bg-accent text-accent-foreground">
                      Value: {story.businessValue}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {story.description && (
                  <p className="text-sm">{story.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Acceptance Criteria</span>
                    <span className="text-muted-foreground">
                      {story.acceptanceCriteria.filter((c) => c.completed).length} /{" "}
                      {story.acceptanceCriteria.length} completed (
                      {completion.toFixed(0)}%)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {story.acceptanceCriteria.map((criteria) => (
                      <div
                        key={criteria.id}
                        className="flex items-start gap-2 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={criteria.completed}
                          onCheckedChange={() =>
                            toggleCriteria(story, criteria.id)
                          }
                          className="mt-0.5"
                        />
                        <span
                          className={
                            criteria.completed
                              ? "line-through text-muted-foreground"
                              : ""
                          }
                        >
                          {criteria.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {userStories.filter(story => !currentProject || story.projectId === currentProject.id).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No user stories yet. Create your first story to get started!
          </div>
        )}
      </div>
    </div>
  );
}
