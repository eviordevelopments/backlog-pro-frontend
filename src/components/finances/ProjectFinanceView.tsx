import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useProjectContext } from "@/context/ProjectContext";
import { useProjects } from "@/hooks/use-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DollarSign,
  PieChart,
  Users,
  AlertCircle,
  Save,
  RotateCcw,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FinancialCategory } from "@/types";
import { toast } from "@/components/ui/use-toast";
import TeamSalaryDistribution from "./TeamSalaryDistribution";
import CalculatedSalaries from "./CalculatedSalaries";

const DEFAULT_FINANCIAL_STRUCTURE: FinancialCategory[] = [
  {
    id: "emergency",
    category: "Emergency Reserves",
    percentage: 15,
    color: "from-red-500 to-orange-600",
  },
  {
    id: "growth",
    category: "Growth Fund",
    percentage: 30,
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "operational",
    category: "Operational",
    percentage: 50,
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "reinvestment",
    category: "Team Reinvestment",
    percentage: 10,
    color: "from-purple-500 to-pink-600",
  },
  {
    id: "technology",
    category: "Technology",
    percentage: 5,
    color: "from-indigo-500 to-blue-600",
  },
  {
    id: "marketing",
    category: "Marketing",
    percentage: 5,
    color: "from-yellow-500 to-amber-600",
  },
];

export default function ProjectFinanceView() {
  const { updateProject: updateProjectLocal, teamMembers, profitShares } = useApp();
  const { selectedProject: currentProject } = useProjectContext();
  const { updateProject: updateProjectBackend } = useProjects();
  const [isSaving, setIsSaving] = useState(false);
  const [financialStructure, setFinancialStructure] = useState<
    FinancialCategory[]
  >([]);
  const [isEditing, setIsEditing] = useState(false);
  const [totalPercentage, setTotalPercentage] = useState(100);
  const [budget, setBudget] = useState(0);
  const [spent, setSpent] = useState(0);

  useEffect(() => {
    if (currentProject) {
      setFinancialStructure(
        ((currentProject as any).financialStructure) || DEFAULT_FINANCIAL_STRUCTURE
      );
      setBudget(currentProject.budget || 0);
      setSpent(currentProject.spent || 0);
    }
  }, [currentProject]);

  useEffect(() => {
    const total = financialStructure.reduce((sum, item) => sum + item.percentage, 0);
    setTotalPercentage(total);
  }, [financialStructure]);

  const handlePercentageChange = (id: string, newPercentage: number) => {
    setFinancialStructure(
      financialStructure.map((item) =>
        item.id === id ? { ...item, percentage: Math.max(0, newPercentage) } : item
      )
    );
  };

  const handleCategoryChange = (id: string, newCategory: string) => {
    setFinancialStructure(
      financialStructure.map((item) =>
        item.id === id ? { ...item, category: newCategory } : item
      )
    );
  };

  const handleSave = async () => {
    if (totalPercentage !== 100) {
      toast({
        title: "Invalid Distribution",
        description: `Total percentage must equal 100% (currently ${totalPercentage}%)`,
        variant: "destructive",
      });
      return;
    }

    if (currentProject) {
      setIsSaving(true);
      try {
        // Save to backend
        await updateProjectBackend(currentProject.id, {
          financialStructure,
          budget,
          spent,
        });

        // Also update local context
        updateProjectLocal(currentProject.id, {
          financialStructure,
          budget,
          spent,
        });

        setIsEditing(false);
        toast({
          title: "Financial Structure Updated",
          description: "Project financial structure has been saved successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to save project",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleReset = () => {
    if (currentProject) {
      setFinancialStructure(
        ((currentProject as any).financialStructure) || DEFAULT_FINANCIAL_STRUCTURE
      );
      setBudget(currentProject.budget || 0);
      setSpent(currentProject.spent || 0);
      setIsEditing(false);
    }
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Project Selected</AlertTitle>
          <AlertDescription>
            Please select a project to view finances.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const budgetPercentage =
    budget > 0 ? ((spent / budget) * 100).toFixed(1) : "0";
  const budgetStatus =
    parseFloat(budgetPercentage) > 90
      ? "destructive"
      : parseFloat(budgetPercentage) > 75
        ? "warning"
        : "default";

  return (
    <div className="space-y-6">
      {/* Financial Structure */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PieChart className="w-5 h-5 text-green-600" />
              <div>
                <CardTitle>Financial Structure</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure how project revenue is distributed
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={totalPercentage !== 100 || isSaving}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {totalPercentage !== 100 && isEditing && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Invalid Distribution</AlertTitle>
              <AlertDescription>
                Total percentage is {totalPercentage}%. It must equal 100%.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {financialStructure.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl glass border border-border/50"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Category</Label>
                      <Input
                        value={item.category}
                        onChange={(e) =>
                          handleCategoryChange(item.id, e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Percentage (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.percentage}
                        onChange={(e) =>
                          handlePercentageChange(item.id, parseFloat(e.target.value) || 0)
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-foreground">
                        {item.category}
                      </h5>
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-sm`}
                      >
                        {item.percentage}%
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-300`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Budget */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle>Project Budget</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track project spending
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Total Budget</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                  placeholder="Enter budget amount"
                  disabled={!isEditing}
                />
                {isEditing && (
                  <Button
                    size="sm"
                    onClick={async () => {
                      if (currentProject) {
                        try {
                          await updateProjectBackend(currentProject.id, { budget });
                          updateProjectLocal(currentProject.id, { budget });
                          toast({
                            title: "Budget Updated",
                            description: "Project budget has been updated",
                          });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to update budget",
                            variant: "destructive",
                          });
                        }
                      }
                    }}
                  >
                    Update
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label>Amount Spent</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  min="0"
                  value={spent}
                  onChange={(e) => setSpent(parseFloat(e.target.value) || 0)}
                  placeholder="Enter spent amount"
                  disabled={!isEditing}
                />
                {isEditing && (
                  <Button
                    size="sm"
                    onClick={async () => {
                      if (currentProject) {
                        try {
                          await updateProjectBackend(currentProject.id, { spent });
                          updateProjectLocal(currentProject.id, { spent });
                          toast({
                            title: "Spending Updated",
                            description: "Project spending has been updated",
                          });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to update spending",
                            variant: "destructive",
                          });
                        }
                      }
                    }}
                  >
                    Update
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl glass border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground">Budget Usage</p>
                <p className="text-2xl font-bold">
                  ${spent.toLocaleString()} / ${budget.toLocaleString()}
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-lg font-semibold ${
                  budgetStatus === "destructive"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    : budgetStatus === "warning"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                }`}
              >
                {budgetPercentage}%
              </div>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  parseFloat(budgetPercentage) > 90
                    ? "bg-gradient-to-r from-red-500 to-orange-600"
                    : parseFloat(budgetPercentage) > 75
                      ? "bg-gradient-to-r from-yellow-500 to-amber-600"
                      : "bg-gradient-to-r from-green-500 to-emerald-600"
                }`}
                style={{ width: `${Math.min(parseFloat(budgetPercentage), 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Salary Distribution */}
      <TeamSalaryDistribution
        operationalPercentage={
          financialStructure.find((cat) =>
            cat.category.toLowerCase().includes("operational")
          )?.percentage || 0
        }
        totalRevenue={budget}
      />

      {/* Calculated Salaries */}
      <CalculatedSalaries
        operationalBudget={
          (budget *
            (((currentProject as any)?.financialStructure || financialStructure).find((cat: any) =>
              cat.category.toLowerCase().includes("operational")
            )?.percentage || 0)) /
          100
        }
      />
    </div>
  );
}
