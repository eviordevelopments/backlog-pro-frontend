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
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle } from "lucide-react";
import { Risk } from "@/types";
import { toast } from "sonner";

export default function Risks() {
  const { risks, addRisk, updateRisk, teamMembers, currentProject } = useApp();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    probability: 3,
    impact: 3,
    mitigation: "",
    owner: "",
    status: "open" as Risk["status"],
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Required field validation
    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    // Numeric validation
    if (formData.probability < 1 || formData.probability > 5) {
      errors.probability = "Probability must be between 1 and 5";
    }

    if (isNaN(formData.probability) || !Number.isInteger(formData.probability)) {
      errors.probability = "Probability must be a valid integer";
    }

    if (formData.impact < 1 || formData.impact > 5) {
      errors.impact = "Impact must be between 1 and 5";
    }

    if (isNaN(formData.impact) || !Number.isInteger(formData.impact)) {
      errors.impact = "Impact must be a valid integer";
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
      const risk: Risk = {
        ...formData,
        projectId: currentProject?.id || "default-project",
        id: Date.now().toString(),
        score: formData.probability * formData.impact,
      };
      addRisk(risk);
      toast.success("Risk added successfully");
      
      // Clear form and errors
      setFormData({
        title: "",
        description: "",
        probability: 3,
        impact: 3,
        mitigation: "",
        owner: "",
        status: "open",
      });
      setValidationErrors({});
      setIsCreateOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add risk");
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 4) return "bg-success text-success-foreground";
    if (score <= 12) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  const getRiskLevel = (score: number) => {
    if (score <= 4) return "Low";
    if (score <= 12) return "Medium";
    return "High";
  };

  // Create 5x5 matrix
  const matrix = Array.from({ length: 5 }, (_, i) => 5 - i);

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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Probability (1-5) *</Label>
                  <Input
                    type="number"
                    value={formData.probability}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        probability: parseInt(e.target.value) || 1,
                      });
                      if (validationErrors.probability) {
                        setValidationErrors({ ...validationErrors, probability: "" });
                      }
                    }}
                    min={1}
                    max={5}
                    className={validationErrors.probability ? "border-destructive" : ""}
                  />
                  {validationErrors.probability && (
                    <p className="text-sm text-destructive">{validationErrors.probability}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Impact (1-5) *</Label>
                  <Input
                    type="number"
                    value={formData.impact}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        impact: parseInt(e.target.value) || 1,
                      });
                      if (validationErrors.impact) {
                        setValidationErrors({ ...validationErrors, impact: "" });
                      }
                    }}
                    min={1}
                    max={5}
                    className={validationErrors.impact ? "border-destructive" : ""}
                  />
                  {validationErrors.impact && (
                    <p className="text-sm text-destructive">{validationErrors.impact}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mitigation Strategy</Label>
                <Textarea
                  value={formData.mitigation}
                  onChange={(e) =>
                    setFormData({ ...formData, mitigation: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Owner</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.owner}
                  onChange={(e) =>
                    setFormData({ ...formData, owner: e.target.value })
                  }
                >
                  <option value="">Select owner</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="w-full">
                Add Risk
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
                  {[1, 2, 3, 4, 5].map((i) => (
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
                      {probability === 5 ? "↑ Probability" : probability}
                    </td>
                    {[1, 2, 3, 4, 5].map((impact) => {
                      const score = probability * impact;
                      const cellRisks = risks.filter(
                        (r) => (!currentProject || r.projectId === currentProject.id) && r.probability === probability && r.impact === impact
                      );
                      return (
                        <td
                          key={impact}
                          className={`p-2 border ${
                            score <= 4
                              ? "bg-success/20"
                              : score <= 12
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
        {risks
          .filter(risk => !currentProject || risk.projectId === currentProject.id)
          .map((risk) => (
          <Card key={risk.id} className="glass glass-hover">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{risk.title}</CardTitle>
                    <Badge className={getRiskColor(risk.score)}>
                      {getRiskLevel(risk.score)} - Score: {risk.score}
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
                  <strong>{risk.probability}/5</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Impact: </span>
                  <strong>{risk.impact}/5</strong>
                </div>
                {risk.owner && (
                  <div>
                    <span className="text-muted-foreground">Owner: </span>
                    <strong>{risk.owner}</strong>
                  </div>
                )}
              </div>

              {risk.mitigation && (
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium mb-1">Mitigation Strategy</p>
                  <p className="text-sm text-muted-foreground">{risk.mitigation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {risks.filter(risk => !currentProject || risk.projectId === currentProject.id).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No risks identified yet. Add your first risk to start tracking!
          </div>
        )}
      </div>
    </div>
  );
}
