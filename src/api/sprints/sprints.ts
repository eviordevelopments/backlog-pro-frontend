import { API_CONFIG } from '@/config/api';

const CREATE_SPRINT_MUTATION = `
  mutation CreateSprint($input: CreateSprintDto!) {
    createSprint(input: $input) {
      id
      name
      goal
      projectId
      startDate
      endDate
      status
      createdAt
    }
  }
`;

const LIST_SPRINTS_QUERY = `
  query ListSprintsByProject($projectId: String!) {
    listSprintsByProject(projectId: $projectId) {
      id
      name
      goal
      projectId
      status
    }
  }
`;

const GET_SPRINT_METRICS_QUERY = `
  query GetSprintMetrics($sprintId: String!) {
    getSprintMetrics(sprintId: $sprintId) {
      sprintId
      sprintName
      status
      completedTasks
      totalTasks
      completionRate
      velocity
      storyPointsCommitted
      storyPointsCompleted
      averageCycleTime
    }
  }
`;

export interface CreateSprintDto {
  name: string;
  goal: string;
  projectId: string;
  startDate: string;
  endDate: string;
}

export interface SprintMetrics {
  sprintId: string;
  sprintName: string;
  status: string;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
  velocity: number;
  storyPointsCommitted: number;
  storyPointsCompleted: number;
  averageCycleTime: number;
}

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  projectId: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

export async function createSprint(
  token: string,
  input: CreateSprintDto
): Promise<Sprint> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: CREATE_SPRINT_MUTATION,
        variables: { input },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      const error = result.errors[0];
      const errorMessage = error.message || 'Failed to create sprint';
      
      console.error('GraphQL Error:', result.errors);
      console.error('Full response:', result);
      console.error('Input sent:', input);
      
      if (error.extensions?.validationErrors) {
        const validationErrors = error.extensions.validationErrors;
        const messages = Object.entries(validationErrors)
          .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n');
        throw new Error(`Validation errors:\n${messages}`);
      }
      
      throw new Error(errorMessage);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.createSprint) {
      throw new Error('No sprint data returned');
    }

    return result.data.createSprint;
  } catch (error) {
    console.error('Create sprint error:', error);
    throw error;
  }
}

export async function listSprints(
  token: string,
  projectId?: string
): Promise<Sprint[]> {
  try {
    if (!projectId) {
      return [];
    }

    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: LIST_SPRINTS_QUERY,
        variables: { projectId },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      const error = result.errors[0];
      const errorMessage = error.message || 'Failed to fetch sprints';
      
      console.error('GraphQL Error:', result.errors);
      
      if (error.extensions?.validationErrors) {
        const validationErrors = error.extensions.validationErrors;
        const messages = Object.entries(validationErrors)
          .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n');
        throw new Error(`Validation errors:\n${messages}`);
      }
      
      throw new Error(errorMessage);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.listSprintsByProject) {
      return [];
    }

    return result.data.listSprintsByProject;
  } catch (error) {
    console.error('List sprints error:', error);
    throw error;
  }
}

export async function getSprintMetrics(
  token: string,
  sprintId: string
): Promise<SprintMetrics> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: GET_SPRINT_METRICS_QUERY,
        variables: { sprintId },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      const error = result.errors[0];
      const errorMessage = error.message || 'Failed to get sprint metrics';
      
      console.error('GraphQL Error:', result.errors);
      
      if (error.extensions?.validationErrors) {
        const validationErrors = error.extensions.validationErrors;
        const messages = Object.entries(validationErrors)
          .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n');
        throw new Error(`Validation errors:\n${messages}`);
      }
      
      throw new Error(errorMessage);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.getSprintMetrics) {
      throw new Error('No sprint metrics data returned');
    }

    return result.data.getSprintMetrics;
  } catch (error) {
    console.error('Get sprint metrics error:', error);
    throw error;
  }
}
