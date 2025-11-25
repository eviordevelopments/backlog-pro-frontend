import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, TrendingUp, Clock, CheckCircle2, UserCheck, UserX, Upload, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { TeamMember } from "@/types";
import { toast } from "sonner";
import { loadTeamMembers, updateTeamMember as updateTeamMemberService } from "@/services/teamService";

export default function Team() {
  const { tasks, currentProject } = useApp();
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [assignments, setAssignments] = useState(() => {
    const saved = localStorage.getItem('projectAssignments');
    return saved ? JSON.parse(saved) : {};
  });

  // Load team members from Supabase on mount
  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        setLoading(true);
        setError(null);
        const members = await loadTeamMembers();
        setTeamMembers(members);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load team members";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchTeamMembers();
  }, []);

  // Check if the current user can edit a team member
  const canEditMember = (member: TeamMember): boolean => {
    if (!user) return false;
    // User can only edit their own profile (match by name)
    return member.name.toLowerCase() === user.name.toLowerCase();
  };
  
  // Get project assignments from state
  const getProjectAssignments = () => {
    return assignments;
  };
  
  // Check if a member is assigned to the current project
  const isMemberAssigned = (memberId: string) => {
    if (!currentProject) return true; // Show all if no project selected
    const assignments = getProjectAssignments();
    const projectAssignments = assignments[currentProject.id] || [];
    // If no assignments exist for this project, assume all members are assigned
    if (projectAssignments.length === 0) return true;
    return projectAssignments.includes(memberId);
  };
  
  // Toggle member assignment to current project
  const toggleMemberAssignment = (memberId: string) => {
    if (!currentProject) return;
    
    const currentAssignments = { ...assignments };
    const projectAssignments = currentAssignments[currentProject.id] || [];
    
    // If no assignments exist yet, initialize with all members except the one being toggled
    if (projectAssignments.length === 0) {
      currentAssignments[currentProject.id] = teamMembers
        .filter(m => m.id !== memberId)
        .map(m => m.id);
    } else {
      // Toggle the member
      if (projectAssignments.includes(memberId)) {
        currentAssignments[currentProject.id] = projectAssignments.filter((id: string) => id !== memberId);
      } else {
        currentAssignments[currentProject.id] = [...projectAssignments, memberId];
      }
    }
    
    // Update state and localStorage
    setAssignments(currentAssignments);
    localStorage.setItem('projectAssignments', JSON.stringify(currentAssignments));
    toast.success("Project assignment updated");
  };

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    skills: "",
    availability: 100,
    image: "",
  });

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      skills: member.skills.join(", "),
      availability: member.availability,
      image: member.image,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      try {
        // Update in Supabase
        await updateTeamMemberService(editingMember.id, {
          name: formData.name,
          role: formData.role as TeamMember["role"],
          image: formData.image,
        });
        
        // Update local state
        setTeamMembers(prev => prev.map(member => 
          member.id === editingMember.id 
            ? {
                ...member,
                name: formData.name,
                role: formData.role as TeamMember["role"],
                skills: formData.skills.split(",").map((s) => s.trim()),
                availability: formData.availability,
                image: formData.image,
              }
            : member
        ));
        
        toast.success("Team member updated successfully");
        setEditingMember(null);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update team member");
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Product Owner":
        return "bg-primary text-primary-foreground";
      case "Scrum Master":
        return "bg-accent text-accent-foreground";
      case "Developer":
        return "bg-success text-success-foreground";
      case "DevOps":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  // Calculate project-specific metrics for a team member
  const getProjectMetrics = (member: TeamMember) => {
    const memberTasks = tasks.filter(
      task => task.assignedTo === member.name && 
      (!currentProject || task.projectId === currentProject.id)
    );
    
    const completedTasks = memberTasks.filter(task => task.status === 'done');
    const velocity = completedTasks.reduce((sum, task) => sum + task.storyPoints, 0);
    
    // Calculate average cycle time (simplified)
    const cycleTime = completedTasks.length > 0 
      ? completedTasks.reduce((sum, task) => {
          const created = new Date(task.createdAt);
          const now = new Date();
          const days = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / completedTasks.length
      : 0;
    
    return {
      velocity,
      tasksCompleted: completedTasks.length,
      averageCycleTime: cycleTime
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient">Team</h1>
        <p className="text-muted-foreground mt-2">
          Manage your team members and their profiles
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading team members...</span>
        </div>
      )}

      {error && (
        <Card className="glass border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="mt-4 mx-auto block"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && teamMembers.length === 0 && (
        <Card className="glass">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">No team members found</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && teamMembers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teamMembers.map((member) => {
          const projectMetrics = getProjectMetrics(member);
          
          return (
            <Card key={member.id} className="glass glass-hover">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-16 w-16 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle>{member.name}</CardTitle>
                        {canEditMember(member) && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {currentProject && (
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={isMemberAssigned(member.id)}
                              onCheckedChange={() => toggleMemberAssignment(member.id)}
                            />
                            {isMemberAssigned(member.id) ? (
                              <UserCheck className="h-4 w-4 text-success" />
                            ) : (
                              <UserX className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        )}
                        {canEditMember(member) && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(member)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Team Member</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                              <Label>Name</Label>
                              <Input
                                value={formData.name}
                                onChange={(e) =>
                                  setFormData({ ...formData, name: e.target.value })
                                }
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Profile Image</Label>
                              <div className="flex items-center gap-4">
                                {formData.image && (
                                  <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="h-20 w-20 rounded-full object-cover border-2 border-primary"
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
                                    }}
                                  />
                                )}
                                <div className="flex-1">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    id="profile-image-upload"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        // Convert image to base64
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          setFormData({ ...formData, image: reader.result as string });
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => document.getElementById('profile-image-upload')?.click()}
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Cambiar Foto de Perfil
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Role</Label>
                              <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                value={formData.role}
                                onChange={(e) =>
                                  setFormData({ ...formData, role: e.target.value })
                                }
                              >
                                <option value="Product Owner">Product Owner</option>
                                <option value="Scrum Master">Scrum Master</option>
                                <option value="Developer">Developer</option>
                                <option value="DevOps">DevOps</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <Label>Skills (comma separated)</Label>
                              <Input
                                value={formData.skills}
                                onChange={(e) =>
                                  setFormData({ ...formData, skills: e.target.value })
                                }
                                placeholder="React, TypeScript, Node.js"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Availability (%)</Label>
                              <Input
                                type="number"
                                value={formData.availability}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    availability: parseInt(e.target.value),
                                  })
                                }
                                min={0}
                                max={100}
                              />
                            </div>

                            <Button type="submit" className="w-full">
                              Save Changes
                            </Button>
                          </form>
                        </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                    <Badge className={getRoleColor(member.role)}>
                      {member.role}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Availability</span>
                    <span className="font-medium">{member.availability}%</span>
                  </div>
                  <Progress value={member.availability} />
                </div>

                {currentProject && !isMemberAssigned(member.id) && (
                  <div className="text-center py-4 text-muted-foreground italic border-t">
                    Not assigned to {currentProject.name}
                  </div>
                )}

                {currentProject && isMemberAssigned(member.id) && (
                  <div className="text-xs text-muted-foreground italic">
                    Metrics for: {currentProject.name}
                  </div>
                )}

                {(!currentProject || isMemberAssigned(member.id)) && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span>Velocity</span>
                    </div>
                    <p className="font-bold text-lg text-primary">
                      {projectMetrics.velocity}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Cycle Time</span>
                    </div>
                    <p className="font-bold text-lg text-accent">
                      {projectMetrics.averageCycleTime.toFixed(1)}d
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Completed</span>
                    </div>
                    <p className="font-bold text-lg text-success">
                      {projectMetrics.tasksCompleted}
                    </p>
                  </div>
                </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}
    </div>
  );
}
