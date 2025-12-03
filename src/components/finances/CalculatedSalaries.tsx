import { useState, useEffect } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { useFinances } from "@/hooks/use-finances";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SalaryInfo } from "@/api/finances/finances";
import { DollarSign, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface CalculatedSalariesProps {
  operationalBudget: number;
}

export default function CalculatedSalaries({ operationalBudget }: CalculatedSalariesProps) {
  const { selectedProject: currentProject } = useProjectContext();
  const { calculateSalaries } = useFinances();
  const [salaries, setSalaries] = useState<SalaryInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSalaries = async () => {
    if (!currentProject) {
      toast.error("Please select a project first");
      return;
    }

    setIsLoading(true);
    try {
      const data = await calculateSalaries(currentProject.id);
      setSalaries(data);
    } catch (error) {
      console.warn("Backend salary calculation unavailable, using local data");
      setSalaries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentProject) {
      loadSalaries();
    }
  }, [currentProject?.id]);

  const totalSalaries = salaries.reduce((sum, s) => sum + s.salary, 0);

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-green-600" />
            <div>
              <CardTitle>Calculated Team Salaries</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Based on operational budget and team distribution
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSalaries}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {salaries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No salary data available</p>
            <p className="text-sm mt-2">Configure team distribution to see calculated salaries</p>
          </div>
        ) : (
          <div className="space-y-3">
            {salaries.map((salary) => (
              <div
                key={salary.userId}
                className="flex items-center justify-between p-4 rounded-lg glass border border-border/50"
              >
                <div>
                  <p className="font-medium">{salary.userName}</p>
                  <p className="text-sm text-muted-foreground">
                    ${salary.idealHourlyRate}/hr
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-success">
                    ${salary.salary.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((salary.salary / operationalBudget) * 100).toFixed(1)}% of budget
                  </p>
                </div>
              </div>
            ))}

            <div className="mt-4 p-4 rounded-lg bg-accent/10 border border-accent/30">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Salaries</span>
                <span className="font-bold text-lg text-accent">
                  ${totalSalaries.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Operational Budget: ${operationalBudget.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
