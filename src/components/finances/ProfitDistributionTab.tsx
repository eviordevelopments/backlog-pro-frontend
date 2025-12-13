import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useFinances } from "@/hooks/use-finances";

interface ProfitDistributionTabProps {
  projectId: string;
  teamMembers: any[];
  totalRevenue: number;
}

export default function ProfitDistributionTab({
  projectId,
  teamMembers,
  totalRevenue,
}: ProfitDistributionTabProps) {
  const { calculateProfitShares, updateProfitShares, getProfitSharesByProject } = useFinances();
  const [shares, setShares] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const projectShares = getProfitSharesByProject(projectId);
    setShares(projectShares);
  }, [projectId]);

  const handleCalculateDistribution = () => {
    try {
      const calculated = calculateProfitShares(projectId, totalRevenue, teamMembers);
      updateProfitShares(projectId, calculated);
      setShares(calculated);
      setOpen(false);
    } catch (error) {
      console.error("Failed to calculate distribution:", error);
    }
  };

  const handleDeleteShare = (shareId: string) => {
    if (confirm("Are you sure you want to delete this profit share?")) {
      const updated = shares.filter(s => s.id !== shareId);
      updateProfitShares(projectId, updated);
      setShares(updated);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const totalDistributed = shares.reduce((sum, s) => sum + (s.amount || 0), 0);
  const remainingAmount = totalRevenue - totalDistributed;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distributed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDistributed)}</div>
            <p className="text-xs text-muted-foreground">{((totalDistributed / totalRevenue) * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{formatCurrency(remainingAmount)}</div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Calculate Distribution
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calculate Profit Distribution</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Distribution Method</Label>
              <p className="text-sm text-muted-foreground">
                Profit will be distributed based on team member availability percentage.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Team Members</Label>
              <div className="space-y-2">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">Availability: {member.availability}%</p>
                    </div>
                    <p className="font-bold">
                      {formatCurrency((totalRevenue * member.availability) / 100 / teamMembers.reduce((sum, m) => sum + m.availability, 0))}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleCalculateDistribution} className="w-full">
              Confirm Distribution
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Profit Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {shares.length === 0 ? (
            <p className="text-muted-foreground">No profit shares calculated yet</p>
          ) : (
            <div className="space-y-2">
              {shares.map(share => (
                <div key={share.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition">
                  <div className="flex-1">
                    <p className="font-medium">{share.memberName}</p>
                    <p className="text-sm text-muted-foreground">{share.percentage.toFixed(1)}% of revenue</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold">{formatCurrency(share.amount)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteShare(share.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
