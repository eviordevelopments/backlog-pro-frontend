import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useApp } from '@/context/AppContext';
import { Plus, Trash2 } from 'lucide-react';

interface TeamMemberShare {
  memberId: string;
  memberName: string;
  salary: number;
  profitShare: number;
}

export default function ProfitSharingCalculator() {
  const { teamMembers } = useApp();
  const [totalRevenue, setTotalRevenue] = useState(100000);
  const [teamMemberShares, setTeamMemberShares] = useState<TeamMemberShare[]>(
    teamMembers.slice(0, 3).map(member => ({
      memberId: member.id,
      memberName: member.name,
      salary: 3000,
      profitShare: 0,
    }))
  );

  const calculations = useMemo(() => {
    // 50% for salaries, 50% for profit sharing
    const salaryBudget = totalRevenue * 0.5;
    const profitBudget = totalRevenue * 0.5;

    // Calculate total salary allocation
    const totalSalaryAllocated = teamMemberShares.reduce((sum, share) => sum + share.salary, 0);

    // Calculate profit shares (equal distribution among team members)
    const profitPerMember = profitBudget / teamMemberShares.length;

    // Calculate total compensation per member
    const memberCompensation = teamMemberShares.map(share => ({
      ...share,
      profitShare: profitPerMember,
      totalCompensation: share.salary + profitPerMember,
    }));

    // Calculate ideal hourly rate (assuming 160 hours/month)
    const hoursPerMonth = 160;
    const hourlyRates = memberCompensation.map(comp => ({
      memberName: comp.memberName,
      hourlyRate: comp.totalCompensation / hoursPerMonth,
    }));

    // Calculate budget distribution
    const budgetDistribution = [
      { name: 'Salaries (50%)', value: salaryBudget, color: '#3b82f6' },
      { name: 'Profit Sharing (50%)', value: profitBudget, color: '#10b981' },
    ];

    // Calculate remaining budget
    const remainingBudget = salaryBudget - totalSalaryAllocated;

    return {
      salaryBudget,
      profitBudget,
      totalSalaryAllocated,
      remainingBudget,
      profitPerMember,
      memberCompensation,
      hourlyRates,
      budgetDistribution,
    };
  }, [totalRevenue, teamMemberShares]);

  const handleAddMember = () => {
    const availableMembers = teamMembers.filter(
      member => !teamMemberShares.find(share => share.memberId === member.id)
    );

    if (availableMembers.length > 0) {
      const newMember = availableMembers[0];
      setTeamMemberShares([
        ...teamMemberShares,
        {
          memberId: newMember.id,
          memberName: newMember.name,
          salary: 3000,
          profitShare: 0,
        },
      ]);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamMemberShares(teamMemberShares.filter(share => share.memberId !== memberId));
  };

  const handleSalaryChange = (memberId: string, salary: number) => {
    setTeamMemberShares(
      teamMemberShares.map(share =>
        share.memberId === memberId ? { ...share, salary } : share
      )
    );
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Profit Sharing Calculator</h2>
        <p className="text-muted-foreground mt-1">50% Salaries / 50% Profit Distribution</p>
      </div>

      {/* Revenue Input */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="revenue" className="text-sm">
                Monthly Revenue
              </Label>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg font-semibold">$</span>
                <Input
                  id="revenue"
                  type="number"
                  value={totalRevenue}
                  onChange={(e) => setTotalRevenue(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="text-lg font-semibold"
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Salary Budget</p>
              <p className="text-2xl font-bold text-primary">
                ${(calculations.salaryBudget / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Profit Budget</p>
              <p className="text-2xl font-bold text-success">
                ${(calculations.profitBudget / 1000).toFixed(1)}k
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Distribution Chart */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Budget Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={calculations.budgetDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: $${(value / 1000).toFixed(1)}k`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {calculations.budgetDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${(value / 1000).toFixed(1)}k`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Team Member Salaries */}
      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team Member Salaries</CardTitle>
          <Button
            onClick={handleAddMember}
            size="sm"
            variant="outline"
            disabled={teamMemberShares.length >= teamMembers.length}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMemberShares.map((share, index) => (
              <div key={share.memberId} className="flex items-end gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <Label className="text-sm font-medium">{share.memberName}</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm">$</span>
                    <Input
                      type="number"
                      value={share.salary}
                      onChange={(e) =>
                        handleSalaryChange(share.memberId, Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="font-semibold"
                    />
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Profit Share</p>
                  <p className="text-lg font-bold text-success">
                    ${calculations.memberCompensation[index]?.profitShare.toFixed(0) || 0}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-primary">
                    ${calculations.memberCompensation[index]?.totalCompensation.toFixed(0) || 0}
                  </p>
                </div>
                {teamMemberShares.length > 1 && (
                  <Button
                    onClick={() => handleRemoveMember(share.memberId)}
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {/* Summary */}
            <div className="mt-6 pt-4 border-t space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Salaries Allocated</span>
                <span className="font-bold">${calculations.totalSalaryAllocated.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Salary Budget</span>
                <span className="font-bold text-primary">${calculations.salaryBudget.toFixed(0)}</span>
              </div>
              <div
                className={`flex justify-between items-center p-3 rounded-lg ${
                  calculations.remainingBudget >= 0 ? 'bg-success/10' : 'bg-destructive/10'
                }`}
              >
                <span className="font-medium">Remaining Budget</span>
                <span
                  className={`font-bold ${
                    calculations.remainingBudget >= 0 ? 'text-success' : 'text-destructive'
                  }`}
                >
                  ${calculations.remainingBudget.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compensation Breakdown */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Total Compensation Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={calculations.memberCompensation}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="memberName" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(0)}`} />
              <Legend />
              <Bar dataKey="salary" stackId="a" fill="#3b82f6" name="Salary" />
              <Bar dataKey="profitShare" stackId="a" fill="#10b981" name="Profit Share" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hourly Rates */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Ideal Hourly Rates</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Based on 160 hours/month</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={calculations.hourlyRates}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="memberName" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}/hr`} />
              <Bar dataKey="hourlyRate" fill="#8b5cf6" name="Hourly Rate" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Budget Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between p-3 rounded-lg bg-muted/50">
              <span className="font-medium">Total Revenue</span>
              <span className="font-bold">${totalRevenue.toFixed(0)}</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-blue-500/10">
              <span className="font-medium">Salary Budget (50%)</span>
              <span className="font-bold text-blue-600">${calculations.salaryBudget.toFixed(0)}</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-green-500/10">
              <span className="font-medium">Profit Budget (50%)</span>
              <span className="font-bold text-green-600">${calculations.profitBudget.toFixed(0)}</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-muted/50">
              <span className="font-medium">Per Member Profit Share</span>
              <span className="font-bold">${calculations.profitPerMember.toFixed(0)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Team Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between p-3 rounded-lg bg-muted/50">
              <span className="font-medium">Team Members</span>
              <span className="font-bold">{teamMemberShares.length}</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-muted/50">
              <span className="font-medium">Avg. Salary</span>
              <span className="font-bold">
                ${(calculations.totalSalaryAllocated / teamMemberShares.length).toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-muted/50">
              <span className="font-medium">Avg. Total Comp.</span>
              <span className="font-bold">
                ${(
                  calculations.memberCompensation.reduce((sum, m) => sum + m.totalCompensation, 0) /
                  teamMemberShares.length
                ).toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-muted/50">
              <span className="font-medium">Avg. Hourly Rate</span>
              <span className="font-bold">
                ${(
                  calculations.hourlyRates.reduce((sum, h) => sum + h.hourlyRate, 0) /
                  calculations.hourlyRates.length
                ).toFixed(2)}
                /hr
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
