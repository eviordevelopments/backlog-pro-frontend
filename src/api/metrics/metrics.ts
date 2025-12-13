import { API_CONFIG } from '@/config/api';

const GET_DASHBOARD_METRICS_QUERY = `
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

const GET_PROJECT_METRICS_QUERY = `
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

export interface ProjectMetricsData {
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
  projects: ProjectMetricsData[];
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

export async function getDashboardMetrics(
  token: string
): Promise<DashboardMetrics> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: GET_DASHBOARD_METRICS_QUERY,
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to get dashboard metrics');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.getDashboardMetrics) {
      throw new Error('No metrics data returned');
    }

    return result.data.getDashboardMetrics;
  } catch (error) {
    throw error;
  }
}

export async function getProjectMetrics(
  token: string,
  projectId: string
): Promise<ProjectMetrics> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: GET_PROJECT_METRICS_QUERY,
        variables: { projectId },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to get project metrics');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.getProjectMetrics) {
      throw new Error('No metrics data returned');
    }

    return result.data.getProjectMetrics;
  } catch (error) {
    throw error;
  }
}
