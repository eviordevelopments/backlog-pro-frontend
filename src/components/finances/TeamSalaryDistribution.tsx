import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useProjectContext } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import MockedDataIndicator from "./MockedDataIndicator";

interface TeamSalaryDistributionProps {
  operationalPercentage: number;
  totalRevenue: number;
}

export default function TeamSalaryDistribution({
  operationalPercentage,
  totalRevenue,
}: TeamSalaryDistributionProps) {
  const { teamMembers, profitShares, updateProfitShares } = useApp();
  const { selectedProject: currentProject } = useProjectContext();
  const { user } = useAuth();

  const salaryBudget = (totalRevenue * operationalPercentage) / 100;

  const projectProfitShares = profitShares.filter(
    (share) => !currentProject || share.projectId === currentProject.id
  );

  const [shares, setShares] = useState(
    projectProfitShares.length > 0
      ? projectProfitShares
      : teamMembers.map((member) => ({
          projectId: currentProject?.id || "",
          memberId: member.id,
          memberName: member.name,
          percentage: teamMembers.length > 0 ? 100 / teamMembers.length : 0,
          amount: teamMembers.length > 0 ? (salaryBudget / teamMembers.length) : 0,
          userId: user?.id || "",
        }))
  );

  useEffect(() => {
    const projectProfitShares = profitShares.filter(
      (share) => !currentProject || share.projectId === currentProject.id
    );

    if (projectProfitShares.length > 0) {
      setShares(projectProfitShares);
    } else {
      const equalPercentage = teamMembers.length > 0 ? 100 / teamMembers.length : 0;
      setShares(
        teamMembers.map((member) => ({
          projectId: currentProject?.id || "",
          memberId: member.id,
          memberName: member.name,
          percentage: equalPercentage,
          amount: (salaryBudget * equalPercentage) / 100,
          userId: user?.id || "",
        }))
      );
    }
  }, [currentProject, profitShares, teamMembers, salaryBudget]);

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
  ];

  const handlePercentageChange = (memberId: string, value: number) => {
    setShares(
      shares.map((share) =>
        share.memberId === memberId
          ? {
              ...share,
              percentage: value,
              amount: (salaryBudget * value) / 100,
            }
          : share
      )
    );
  };

  const handleSave = () => {
    const total = shares.reduce((sum, share) => sum + share.percentage, 0);
    if (Math.abs(total - 100) > 0.01) {
      toast.error("Total percentage must equal 100%");
      return;
    }

    try {
      const projectId = currentProject?.id || "";
      const sharesWithProject = shares.map((share) => ({
        ...share,
        projectId: projectId,
      }));

      updateProfitShares(sharesWithProject, totalRevenue);
      toast.success("Team salary distribution updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update salary distribution"
      );
    }
  };

  const totalPercentage = shares.reduce((sum, share) => sum + share.percentage, 0);

  if (teamMembers.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <CardTitle>Team Salary Distribution</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Distribute operational budget among team members
                </p>
              </div>
            </div>
            <MockedDataIndicator />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No team members assigned to this project
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-purple-600" />
            <div>
              <CardTitle>Team Salary Distribution</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Distribute operational budget ({operationalPercentage}%) among team members
              </p>
            </div>
          </div>
          <MockedDataIndicator />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="glass border-accent/50">
          <AlertCircle className="h-4 w-4 text-accent" />
          <AlertDescription>
            <span className="font-medium">Operational Budget:</span> ${salaryBudget.toLocaleString()} ({operationalPercentage}% of ${totalRevenue.toLocaleString()})
            <br />
            <span className="text-xs text-muted-foreground">
              Distribute this budget among team members by percentage
            </span>
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Team Distribution</Label>
              <span
                className={`text-sm font-medium ${
                  Math.abs(totalPercentage - 100) > 0.01
                    ? "text-destructive"
                    : "text-success"
                }`}
              >
                Total: {totalPercentage.toFixed(1)}%
              </span>
            </div>

            {shares.map((share) => (
              <div key={share.memberId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{share.memberName}</Label>
                  <span className="text-sm font-medium">
                    ${share.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={share.percentage}
                    onChange={(e) =>
                      handlePercentageChange(
                        share.memberId,
                        parseFloat(e.target.value) || 0
                      )
                    }
                    min={0}
                    max={100}
                    step={0.1}
                    className="flex-1"
                  />
                  <div className="flex items-center justify-center w-12 text-sm text-muted-foreground">
                    %
                  </div>
                </div>
              </div>
            ))}

            <Button
              onClick={handleSave}
              className="w-full"
              disabled={Math.abs(totalPercentage - 100) > 0.01}
            >
              Save Distribution
            </Button>
          </div>

          {/* Visualization */}
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={shares}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ memberName, percentage }) => `${memberName}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="percentage"
                >
                  {shares.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, _, props: any) => [
                    `${value.toFixed(1)}% (${props.payload.amount.toLocaleString()})`,
                    props.payload.memberName,
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {shares.map((share, index) => (
                <div
                  key={share.memberId}
                  className="flex items-center justify-between p-2 glass rounded-lg text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{share.memberName}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">${share.amount.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {share.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
