import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProjectContext } from "@/context/ProjectContext";
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
import { Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { createRisk, getProjectRisks, Risk, CreateRiskDto } from "@/api/risks/risks";

export default function Risks() {
  const { user } = useAuth();
  const { selectedProject: currentProject } = useProjectContext();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    probability: "medium" as const,
    impact: "medium" as const,
    mitigationStrategy: "",
    category: "technical",
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

  const loadRisks = async () => {
    const token = getToken();
    if (!token || !currentProject) return;

    try {
      setLoading(true);
      const data = await getProjectRisks(token, currentProject.id);
      setRisks(data);
      localStorage.setItem('projectRisks', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to load risks:', error);
      // Fallback to localStorage
      try {
        const saved = localStorage.getItem('projectRisks');
        if (saved) {
          setRisks(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load from localStorage:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentProject) {
      loadRisks();
    }
  }, [currentProject]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
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

    const token = getToken();
    if (!token || !user || !currentProject) {
      toast.error('Not authenticated or no project selected');
      return;
    }

    try {
      setLoading(true);

      const input: CreateRiskDto = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        probability: formData.probability,
        impact: formData.impact,
        projectId: currentProject.id,
        responsibleId: user.id,
        mitigationStrategy: formData.mitigationStrategy,
      };

      const newRisk = await createRisk(token, input);
      toast.success("Risk created successfully");

      // Add to local state
      setRisks([...risks, newRisk]);
      localStorage.setItem('projectRisks', JSON.stringify([...risks, newRisk]));

      // Clear form
      setFormData({
        title: "",
        description: "",
        probability: "medium",
        impact: "medium",
        mitigationStrategy: "",
        category: "technical",
      });
      setValidationErrors({});
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Failed to create risk:', error);
      toast.error(error instanceof Error ? error.message : "Failed to create risk");
    } finally {
      setLoading(false);
    }
  };

  const probabilityMap = { low: 1, medium: 2, high: 3, critical: 4 };
  const impactMap = { low: 1, medium: 2, high: 3, critical: 4 };

  const getRiskColor = (severity: number) => {
    if (severity <= 4) return "bg-success text-success-foreground";
    if (severity <= 8) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  const getRiskLevel = (severity: number) => {
    if (severity <= 4) return "Low";
    if (severity <= 8) return "Medium";
    return "High";
  };

  // Create 4x4 matrix
  const matrix = Array.from({ length: 4 }, (_, i) => 4 - i);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Risk Matrix</h1>
          <p className="text-muted-foreground mt-2">
            Identify and manage project risks
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Risk
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Risk</DialogTitle>
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
                <Label>Category</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="technical">Technical</option>
                  <option value="resource">Resource</option>
                  <option value="schedule">Schedule</option>
                  <option value="external">External</option>
                  <option value="organizational">Organizational</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Probability *</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.probability}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        probability: e.target.value as 'low' | 'medium' | 'high' | 'critical',
                      });
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Impact *</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.impact}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        impact: e.target.value as 'low' | 'medium' | 'high' | 'critical',
                      });
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mitigation Strategy</Label>
                <Textarea
                  value={formData.mitigationStrategy}
                  onChange={(e) =>
                    setFormData({ ...formData, mitigationStrategy: e.target.value })
                  }
                  rows={3}
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Add Risk'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Risk Matrix */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>5×5 Risk Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-sm text-muted-foreground">Impact →</th>
                  {['Low', 'Medium', 'High', 'Critical'].map((i) => (
                    <th key={i} className="p-2 text-sm font-medium">
                      {i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((probability) => (
                  <tr key={probability}>
                    <td className="p-2 text-sm font-medium">
                      {probability === 4 ? "↑ Probability" : ['Low', 'Medium', 'High', 'Critical'][probability - 1]}
                    </td>
                    {['low', 'medium', 'high', 'critical'].map((impact) => {
                      const probValue = probabilityMap[['low', 'medium', 'high', 'critical'][probability - 1] as keyof typeof probabilityMap];
                      const impactValue = impactMap[impact as keyof typeof impactMap];
                      const score = probValue * impactValue;
                      const cellRisks = risks.filter(
                        (r) => r.probability === ['low', 'medium', 'high', 'critical'][probability - 1] && r.impact === impact
                      );
                      return (
                        <td
                          key={impact}
                          className={`p-2 border ${
                            score <= 4
                              ? "bg-success/20"
                              : score <= 8
                              ? "bg-warning/20"
                              : "bg-destructive/20"
                          }`}
                        >
                          <div className="min-h-[80px] flex flex-col gap-1">
                            <span className="text-xs font-medium">
                              Score: {score}
                            </span>
                            {cellRisks.map((risk) => (
                              <div
                                key={risk.id}
                                className="text-xs p-1 glass rounded cursor-pointer hover:scale-105 transition-transform"
                                title={risk.title}
                              >
                                <AlertTriangle className="h-3 w-3 inline mr-1" />
                                {risk.title.slice(0, 20)}
                                {risk.title.length > 20 ? "..." : ""}
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Risks List */}
      <div className="grid gap-4">
        {risks.map((risk) => {
          const probValue = probabilityMap[risk.probability];
          const impactValue = impactMap[risk.impact];
          const severity = probValue * impactValue;

          return (
            <Card key={risk.id} className="glass glass-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{risk.title}</CardTitle>
                      <Badge className={getRiskColor(severity)}>
                        {getRiskLevel(severity)} - Severity: {severity}
                      </Badge>
                      <Badge variant="outline">{risk.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {risk.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Probability: </span>
                    <strong className="capitalize">{risk.probability}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Impact: </span>
                    <strong className="capitalize">{risk.impact}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category: </span>
                    <strong className="capitalize">{risk.category}</strong>
                  </div>
                </div>

                {risk.mitigationStrategy && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium mb-1">Mitigation Strategy</p>
                    <p className="text-sm text-muted-foreground">{risk.mitigationStrategy}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {risks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No risks identified yet. Add your first risk to start tracking!
          </div>
        )}
      </div>
    </div>
  );
}
