import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { CheckCircle2, Clock, TrendingUp, Users } from "lucide-react";

export default function Dashboard() {
  const { tasks, sprints, kpiMetrics, teamMembers, currentProject } = useApp();

  // Filter data by current project
  const projectTasks = tasks.filter(task => !currentProject || task.projectId === currentProject.id);
  const projectSprints = sprints.filter(sprint => !currentProject || sprint.projectId === currentProject.id);

  const tasksByStatus = [
    { name: "To Do", value: projectTasks.filter((t) => t.status === "todo").length },
    {
      name: "In Progress",
      value: projectTasks.filter((t) => t.status === "in-progress").length,
    },
    { name: "Review", value: projectTasks.filter((t) => t.status === "review").length },
    { name: "Done", value: projectTasks.filter((t) => t.status === "done").length },
  ];

  const sprintData = projectSprints.slice(-5).map((sprint) => ({
    name: sprint.name,
    velocity: sprint.velocity,
    completed: sprint.completedPoints,
    committed: sprint.committedPoints,
  }));

  // Calculate project-specific metrics
  const projectVelocity = projectSprints.length > 0
    ? projectSprints.reduce((sum, s) => sum + s.velocity, 0) / projectSprints.length
    : 0;

  const completedTasks = projectTasks.filter(t => t.status === 'done');
  const projectCycleTime = completedTasks.length > 0
    ? completedTasks.reduce((sum, task) => {
        const created = new Date(task.createdAt);
        const now = new Date();
        const days = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0) / completedTasks.length
    : 0;

  const projectCompletionRate = projectSprints.length > 0
    ? (projectSprints.filter(s => s.status === 'completed').length / projectSprints.length) * 100
    : 0;

  // Get team members assigned to current project
  const getProjectAssignments = () => {
    const assignments = localStorage.getItem('projectAssignments');
    return assignments ? JSON.parse(assignments) : {};
  };

  const projectTeamMembers = currentProject
    ? teamMembers.filter(member => {
        const assignments = getProjectAssignments();
        const projectAssignments = assignments[currentProject.id] || [];
        if (projectAssignments.length === 0) return true;
        return projectAssignments.includes(member.id);
      })
    : teamMembers;

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#00C49F"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          {currentProject 
            ? `Overview of ${currentProject.name}` 
            : "Overview of your agile metrics and team performance"}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass glass-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Velocity</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectVelocity.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">points per sprint</p>
          </CardContent>
        </Card>

        <Card className="glass glass-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cycle Time</CardTitle>
            <Clock className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCycleTime.toFixed(1)}d</div>
            <p className="text-xs text-muted-foreground">average days</p>
          </CardContent>
        </Card>

        <Card className="glass glass-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Sprint Completion
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projectCompletionRate.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">completion rate</p>
          </CardContent>
        </Card>

        <Card className="glass glass-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectTeamMembers.length}</div>
            <p className="text-xs text-muted-foreground">active members</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Sprint Velocity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sprintData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px",
                    border: "none",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="velocity"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tasksByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tasksByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Sprint Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sprintData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px",
                    border: "none",
                  }}
                />
                <Bar dataKey="committed" fill="hsl(var(--primary))" />
                <Bar dataKey="completed" fill="hsl(var(--success))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectTeamMembers.map((member) => {
                // Calculate project-specific velocity for each member
                const memberTasks = projectTasks.filter(
                  task => task.assignedTo === member.name && task.status === 'done'
                );
                const memberVelocity = memberTasks.reduce((sum, task) => sum + task.storyPoints, 0);
                
                return (
                  <div key={member.id} className="flex items-center gap-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{memberVelocity}</p>
                      <p className="text-xs text-muted-foreground">velocity</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
