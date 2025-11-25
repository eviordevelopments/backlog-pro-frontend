import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function ProfitSharing() {
  const { teamMembers, profitShares, updateProfitShares, currentProject } = useApp();
  
  // Store total revenue per project in localStorage
  const getProjectRevenue = (projectId: string) => {
    const revenues = JSON.parse(localStorage.getItem('projectRevenues') || '{}');
    return revenues[projectId] || 100000;
  };
  
  const saveProjectRevenue = (projectId: string, revenue: number) => {
    const revenues = JSON.parse(localStorage.getItem('projectRevenues') || '{}');
    revenues[projectId] = revenue;
    localStorage.setItem('projectRevenues', JSON.stringify(revenues));
  };
  
  const [totalRevenue, setTotalRevenue] = useState(() => 
    getProjectRevenue(currentProject?.id || "default-project")
  );
  // Filter profit shares by current project
  const projectProfitShares = profitShares.filter(
    share => !currentProject || share.projectId === currentProject.id
  );
  
  const [shares, setShares] = useState(
    projectProfitShares.length > 0
      ? projectProfitShares
      : teamMembers.map((member) => ({
          projectId: currentProject?.id || "default-project",
          memberId: member.id,
          memberName: member.name,
          percentage: 25,
          amount: 25000,
        }))
  );

  // Update shares and revenue when project changes
  useEffect(() => {
    const projectId = currentProject?.id || "default-project";
    const projectRevenue = getProjectRevenue(projectId);
    setTotalRevenue(projectRevenue);
    
    const projectProfitShares = profitShares.filter(
      share => !currentProject || share.projectId === currentProject.id
    );
    
    if (projectProfitShares.length > 0) {
      setShares(projectProfitShares);
    } else {
      // Initialize with equal distribution for current project
      const equalPercentage = 100 / teamMembers.length;
      setShares(
        teamMembers.map((member) => ({
          projectId: projectId,
          memberId: member.id,
          memberName: member.name,
          percentage: equalPercentage,
          amount: (projectRevenue * equalPercentage) / 100,
        }))
      );
    }
  }, [currentProject, profitShares, teamMembers]);

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
              amount: (totalRevenue * value) / 100,
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
      const projectId = currentProject?.id || "default-project";
      
      // Ensure all shares have the correct projectId
      const sharesWithProject = shares.map(share => ({
        ...share,
        projectId: projectId
      }));
      
      // Save the revenue for this project
      saveProjectRevenue(projectId, totalRevenue);
      
      updateProfitShares(sharesWithProject, totalRevenue);
      toast.success("Profit sharing updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profit sharing");
    }
  };

  const handleRevenueChange = (value: number) => {
    setTotalRevenue(value);
    setShares(
      shares.map((share) => ({
        ...share,
        amount: (value * share.percentage) / 100,
      }))
    );
  };

  const totalPercentage = shares.reduce((sum, share) => sum + share.percentage, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient">Profit Sharing</h1>
        <p className="text-muted-foreground mt-2">
          Manage team revenue distribution and profit sharing
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Total Revenue ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={totalRevenue}
                  onChange={(e) => handleRevenueChange(parseFloat(e.target.value))}
                  className="pl-10"
                  min={0}
                />
              </div>
            </div>

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

              {shares.map((share, index) => (
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
            </div>

            <Button
              onClick={handleSave}
              className="w-full"
              disabled={Math.abs(totalPercentage - 100) > 0.01}
            >
              Save Distribution
            </Button>
          </CardContent>
        </Card>

        {/* Visualization */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Distribution Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={shares}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.memberName}: ${entry.percentage}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="percentage"
                >
                  {shares.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name, props) => [
                    `${value.toFixed(1)}% ($${props.payload.amount.toLocaleString()})`,
                    props.payload.memberName,
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-6 space-y-3">
              {shares.map((share, index) => (
                <div
                  key={share.memberId}
                  className="flex items-center justify-between p-3 glass rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{share.memberName}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      ${share.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {share.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
