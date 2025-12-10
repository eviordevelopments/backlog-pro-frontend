import { API_CONFIG } from '@/config/api';

export interface ProjectMetricsItem {
  projectId: string;
  projectName: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
}

export interface DashboardMetrics {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  overallProgress: number;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  budgetUtilization: number;
  projects: ProjectMetricsItem[];
  timestamp: string;
}

export interface ProjectMetrics {
  projectId: string;
  projectName: string;
  status: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  totalSprints: number;
  completedSprints: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  averageVelocity: number;
  budget: number;
  spent: number;
  remaining: number;
  budgetUtilization: number;
}

const DASHBOARD_METRICS_QUERY = `
  query GetDashboardMetrics {
    getDashboardMetrics {
      totalProjects
      totalTasks
      completedTasks
      overallProgress
      totalBudget
      totalSpent
      remainingBudget
      budgetUtilization
      projects {
        projectId
        projectName
        status
        progress
        budget
        spent
      }
      timestamp
    }
  }
`;

const PROJECT_METRICS_QUERY = `
  query GetProjectMetrics($projectId: String!) {
    getProjectMetrics(projectId: $projectId) {
      projectId
      projectName
      status
      progress
      totalTasks
      completedTasks
      totalSprints
      completedSprints
      totalStoryPoints
      completedStoryPoints
      averageVelocity
      budget
      spent
      remaining
      budgetUtilization
    }
  }
`;

async function fetchDashboardMetrics(token: string): Promise<DashboardMetrics> {
  const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: DASHBOARD_METRICS_QUERY,
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to fetch dashboard metrics');
  }

  return result.data.getDashboardMetrics;
}

async function fetchProjectMetrics(token: string, projectId: string): Promise<ProjectMetrics> {
  const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: PROJECT_METRICS_QUERY,
      variables: { projectId },
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to fetch project metrics');
  }

  return result.data.getProjectMetrics;
}

export function subscribeToDashboardMetrics(
  token: string,
  onData: (metrics: DashboardMetrics) => void,
  onError: (error: Error) => void
): () => void {
  let isActive = true;
  let intervalId: NodeJS.Timeout | null = null;

  const poll = async () => {
    try {
      const metrics = await fetchDashboardMetrics(token);
      if (isActive) {
        onData(metrics);
      }
    } catch (error) {
      if (isActive) {
        onError(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  };

  poll();
  intervalId = setInterval(poll, 5000);

  return () => {
    isActive = false;
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}

export function subscribeToProjectMetrics(
  token: string,
  projectId: string,
  onData: (metrics: ProjectMetrics) => void,
  onError: (error: Error) => void
): () => void {
  let isActive = true;
  let intervalId: NodeJS.Timeout | null = null;

  const poll = async () => {
    try {
      const metrics = await fetchProjectMetrics(token, projectId);
      if (isActive) {
        onData(metrics);
      }
    } catch (error) {
      if (isActive) {
        onError(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  };

  poll();
  intervalId = setInterval(poll, 5000);

  return () => {
    isActive = false;
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}
