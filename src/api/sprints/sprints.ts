import { API_CONFIG } from '@/config/api';

const CREATE_SPRINT_MUTATION = `
  mutation CreateSprint($input: CreateSprintDto!) {
    createSprint(input: $input) {
      id
      name
      goal
      projectId
      status
      velocity
      storyPointsCommitted
      storyPointsCompleted
      teamMembers
      dailyStandupTime
    }
  }
`;

const GET_SPRINT_QUERY = `
  query GetSprint($id: String!) {
    getSprint(id: $id) {
      id
      name
      goal
      projectId
      status
      velocity
      storyPointsCommitted
      storyPointsCompleted
      teamMembers
      dailyStandupTime
      retrospectiveNotes
    }
  }
`;

const LIST_SPRINTS_BY_PROJECT_QUERY = `
  query ListSprintsByProject($projectId: String!) {
    listSprintsByProject(projectId: $projectId) {
      id
      name
      goal
      projectId
      status
      velocity
      storyPointsCommitted
      storyPointsCompleted
    }
  }
`;

const UPDATE_SPRINT_MUTATION = `
  mutation UpdateSprint($id: String!, $input: UpdateSprintDto!) {
    updateSprint(id: $id, input: $input) {
      id
      name
      goal
      status
      velocity
      storyPointsCommitted
      storyPointsCompleted
      teamMembers
      dailyStandupTime
      retrospectiveNotes
    }
  }
`;

const EXTEND_SPRINT_MUTATION = `
  mutation ExtendSprint($id: String!, $newEndDate: String!) {
    extendSprint(id: $id, newEndDate: $newEndDate) {
      id
      name
      status
    }
  }
`;

const COMPLETE_SPRINT_MUTATION = `
  mutation CompleteSprint($id: String!) {
    completeSprint(id: $id) {
      id
      name
      status
      velocity
      storyPointsCompleted
    }
  }
`;

const REGISTER_RETROSPECTIVE_MUTATION = `
  mutation RegisterRetrospective($id: String!, $notes: String!) {
    registerRetrospective(id: $id, notes: $notes) {
      id
      name
      retrospectiveNotes
    }
  }
`;

const DELETE_SPRINT_MUTATION = `
  mutation DeleteSprint($id: String!) {
    deleteSprint(id: $id)
  }
`;

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  velocity: number;
  storyPointsCommitted: number;
  storyPointsCompleted: number;
  teamMembers?: string[];
  sprintPlanningDate?: string;
  sprintReviewDate?: string;
  sprintRetrospectiveDate?: string;
  dailyStandupTime?: string;
  retrospectiveNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSprintDto {
  name: string;
  goal?: string;
  projectId: string;
  startDate: string;
  endDate: string;
  dailyStandupTime?: string;
}

export interface UpdateSprintDto {
  name?: string;
  goal?: string;
  endDate?: string;
  status?: string;
  velocity?: number;
  storyPointsCommitted?: number;
  storyPointsCompleted?: number;
  teamMembers?: string[];
  dailyStandupTime?: string;
  retrospectiveNotes?: string;
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
      throw new Error(result.errors[0]?.message || 'Failed to create sprint');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.createSprint) {
      throw new Error('No sprint data returned');
    }

    return result.data.createSprint;
  } catch (error) {
    throw error;
  }
}

export async function getSprint(
  token: string,
  id: string
): Promise<Sprint> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: GET_SPRINT_QUERY,
        variables: { id },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to get sprint');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.getSprint) {
      throw new Error('Sprint not found');
    }

    return result.data.getSprint;
  } catch (error) {
    throw error;
  }
}

export async function listSprintsByProject(
  token: string,
  projectId: string
): Promise<Sprint[]> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: LIST_SPRINTS_BY_PROJECT_QUERY,
        variables: { projectId },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to list sprints');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const sprints = result.data?.listSprintsByProject || [];
    
    // Provide default dates if not available
    return sprints.map((sprint: any) => ({
      ...sprint,
      startDate: sprint.startDate || new Date().toISOString().split('T')[0],
      endDate: sprint.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }));
  } catch (error) {
    throw error;
  }
}

export async function updateSprint(
  token: string,
  id: string,
  input: UpdateSprintDto
): Promise<Sprint> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: UPDATE_SPRINT_MUTATION,
        variables: { id, input },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to update sprint');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.updateSprint) {
      throw new Error('No sprint data returned');
    }

    return result.data.updateSprint;
  } catch (error) {
    throw error;
  }
}

export async function extendSprint(
  token: string,
  id: string,
  newEndDate: string
): Promise<Sprint> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: EXTEND_SPRINT_MUTATION,
        variables: { id, newEndDate },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to extend sprint');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.extendSprint) {
      throw new Error('No sprint data returned');
    }

    return result.data.extendSprint;
  } catch (error) {
    throw error;
  }
}

export async function completeSprint(
  token: string,
  id: string
): Promise<Sprint> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: COMPLETE_SPRINT_MUTATION,
        variables: { id },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to complete sprint');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.completeSprint) {
      throw new Error('No sprint data returned');
    }

    return result.data.completeSprint;
  } catch (error) {
    throw error;
  }
}

export async function registerRetrospective(
  token: string,
  id: string,
  notes: string
): Promise<Sprint> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: REGISTER_RETROSPECTIVE_MUTATION,
        variables: { id, notes },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to register retrospective');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.registerRetrospective) {
      throw new Error('No sprint data returned');
    }

    return result.data.registerRetrospective;
  } catch (error) {
    throw error;
  }
}

export async function deleteSprint(
  token: string,
  id: string
): Promise<void> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: DELETE_SPRINT_MUTATION,
        variables: { id },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to delete sprint');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
}
