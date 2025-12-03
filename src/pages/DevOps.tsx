import { useApp } from "@/context/AppContext";
import { useProjectContext } from "@/context/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
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
} from "recharts";
import { Activity, Zap, Clock, AlertCircle, TrendingUp } from "lucide-react";
import DevOpsLifecycle from "@/components/DevOpsLifecycle";

export default function DevOps() {
  const { kpiMetrics, updateKPIMetrics } = useApp();
  const { selectedProject: currentProject } = useProjectContext();

  const deploymentData = [
    { week: "W1", deployments: 8 },
    { week: "W2", deployments: 12 },
    { week: "W3", deployments: 10 },
    { week: "W4", deployments: 15 },
    { week: "W5", deployments: 14 },
    { week: "W6", deployments: 18 },
  ];

  const leadTimeData = [
    { week: "W1", time: 5.2 },
    { week: "W2", time: 4.8 },
    { week: "W3", time: 4.5 },
    { week: "W4", time: 4.2 },
    { week: "W5", time: 3.9 },
    { week: "W6", time: 4.2 },
  ];

  const getPerformanceLevel = (metric: string, value: number) => {
    // Elite DevOps benchmarks
    switch (metric) {
      case "deployment":
        return value >= 10
          ? { level: "Elite", color: "text-success" }
          : value >= 5
          ? { level: "High", color: "text-primary" }
          : { level: "Medium", color: "text-warning" };
      case "leadTime":
        return value <= 24
          ? { level: "Elite", color: "text-success" }
          : value <= 168
          ? { level: "High", color: "text-primary" }
          : { level: "Medium", color: "text-warning" };
      case "mttr":
        return value <= 1
          ? { level: "Elite", color: "text-success" }
          : value <= 24
          ? { level: "High", color: "text-primary" }
          : { level: "Medium", color: "text-warning" };
      case "changeFailure":
        return value <= 15
          ? { level: "Elite", color: "text-success" }
          : value <= 30
          ? { level: "High", color: "text-primary" }
          : { level: "Medium", color: "text-warning" };
      default:
        return { level: "Unknown", color: "text-muted-foreground" };
    }
  };

  const deploymentLevel = getPerformanceLevel(
    "deployment",
    kpiMetrics.deploymentFrequency
  );
  const leadTimeLevel = getPerformanceLevel("leadTime", kpiMetrics.leadTime * 24);
  const mttrLevel = getPerformanceLevel("mttr", kpiMetrics.mttr * 24);
  const changeFailureLevel = getPerformanceLevel(
    "changeFailure",
    kpiMetrics.changeFailureRate
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient">DevOps Metrics</h1>
        <p className="text-muted-foreground mt-2">
          Track your DevOps performance with DORA metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass glass-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Deployment Frequency
            </CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpiMetrics.deploymentFrequency}
            </div>
            <p className="text-xs text-muted-foreground">per week</p>
            <Badge className="mt-2" variant="secondary">
              <span className={deploymentLevel.color}>{deploymentLevel.level}</span>
            </Badge>
          </CardContent>
        </Card>

        <Card className="glass glass-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lead Time</CardTitle>
            <Clock className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiMetrics.leadTime}d</div>
            <p className="text-xs text-muted-foreground">to production</p>
            <Badge className="mt-2" variant="secondary">
              <span className={leadTimeLevel.color}>{leadTimeLevel.level}</span>
            </Badge>
          </CardContent>
        </Card>

        <Card className="glass glass-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">MTTR</CardTitle>
            <Activity className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiMetrics.mttr}h</div>
            <p className="text-xs text-muted-foreground">mean time to recovery</p>
            <Badge className="mt-2" variant="secondary">
              <span className={mttrLevel.color}>{mttrLevel.level}</span>
            </Badge>
          </CardContent>
        </Card>

        <Card className="glass glass-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Change Failure Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiMetrics.changeFailureRate}%</div>
            <p className="text-xs text-muted-foreground">of deployments</p>
            <Badge className="mt-2" variant="secondary">
              <span className={changeFailureLevel.color}>
                {changeFailureLevel.level}
              </span>
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Deployment Frequency Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deploymentData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px",
                    border: "none",
                  }}
                />
                <Bar dataKey="deployments" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Lead Time Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={leadTimeData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="week" />
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
                  dataKey="time"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Satisfaction */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Team Satisfaction Score</CardTitle>
            <Badge className="bg-primary text-primary-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              {kpiMetrics.teamSatisfaction.toFixed(1)}/10
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            value={[kpiMetrics.teamSatisfaction]}
            onValueChange={(value) =>
              updateKPIMetrics({ teamSatisfaction: value[0] })
            }
            max={10}
            step={0.1}
            className="w-full"
          />
          <div className="grid grid-cols-5 gap-2 text-center text-xs text-muted-foreground">
            <span>2 - Poor</span>
            <span>4 - Fair</span>
            <span>6 - Good</span>
            <span>8 - Great</span>
            <span>10 - Excellent</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Adjust the slider to update your team's satisfaction score based on
            retrospectives and feedback.
          </p>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>DevOps Maturity Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 glass rounded-lg">
              <h3 className="font-semibold mb-2">DORA Metrics Summary</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Based on the DORA (DevOps Research and Assessment) framework, your
                team's performance is evaluated across four key metrics.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Elite Performance:</p>
                  <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                    <li>Deploy frequency: Multiple per day</li>
                    <li>Lead time: Less than 1 day</li>
                    <li>MTTR: Less than 1 hour</li>
                    <li>Change failure rate: 0-15%</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Your Team:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li className={deploymentLevel.color}>
                      Deploy frequency: {deploymentLevel.level}
                    </li>
                    <li className={leadTimeLevel.color}>
                      Lead time: {leadTimeLevel.level}
                    </li>
                    <li className={mttrLevel.color}>MTTR: {mttrLevel.level}</li>
                    <li className={changeFailureLevel.color}>
                      Change failure: {changeFailureLevel.level}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DevOps Lifecycle */}
      {currentProject && <DevOpsLifecycle project={currentProject} />}
    </div>
  );
}
