import { API_CONFIG } from '@/config/api';

const CREATE_USER_STORY_MUTATION = `
  mutation CreateUserStory($input: CreateUserStoryDto!) {
    createUserStory(input: $input) {
      id
      title
      userType
      action
      benefit
      priority
      storyPoints
      status
      projectId
      sprintId
      acceptanceCriteria {
        id
        description
        completed
      }
      definitionOfDone
      impactMetrics
      assignedTo
      createdAt
      updatedAt
    }
  }
`;

const GET_PROJECT_BACKLOG_QUERY = `
  query GetProjectBacklog($projectId: String!) {
    getProjectBacklog(projectId: $projectId) {
      id
      title
      userType
      action
      benefit
      priority
      storyPoints
      status
      projectId
      sprintId
      acceptanceCriteria {
        id
        description
        completed
      }
      definitionOfDone
      impactMetrics
      assignedTo
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_USER_STORY_MUTATION = `
  mutation UpdateUserStory($id: String!, $input: UpdateUserStoryDto!) {
    updateUserStory(id: $id, input: $input) {
      id
      title
      priority
      storyPoints
      status
      sprintId
      acceptanceCriteria {
        id
        description
        completed
      }
      definitionOfDone
      impactMetrics
      assignedTo
      updatedAt
    }
  }
`;

const DELETE_USER_STORY_MUTATION = `
  mutation DeleteUserStory($id: String!) {
    deleteUserStory(id: $id)
  }
`;

export interface AcceptanceCriteria {
  id?: string;
  description: string;
  completed?: boolean;
}

export interface UserStory {
  id: string;
  title: string;
  userType: string;
  action: string;
  benefit: string;
  priority: "low" | "medium" | "high" | "critical";
  storyPoints: number;
  status: "backlog" | "ready" | "in-progress" | "done";
  projectId: string;
  sprintId?: string;
  acceptanceCriteria?: AcceptanceCriteria[] | string[];
  definitionOfDone?: string;
  impactMetrics?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserStoryDto {
  title: string;
  userType: string;
  action: string;
  benefit: string;
  priority?: "low" | "medium" | "high" | "critical";
  storyPoints: number;
  projectId: string;
  sprintId?: string;
  acceptanceCriteria?: string[];
  definitionOfDone?: string;
  impactMetrics?: string;
}

export interface UpdateUserStoryDto {
  title?: string;
  userType?: string;
  action?: string;
  benefit?: string;
  priority?: "low" | "medium" | "high" | "critical";
  storyPoints?: number;
  status?: "backlog" | "ready" | "in-progress" | "done";
  sprintId?: string;
  acceptanceCriteria?: string[];
  definitionOfDone?: string;
  impactMetrics?: string;
  assignedTo?: string;
}

export async function createUserStory(
  token: string,
  input: CreateUserStoryDto
): Promise<UserStory> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: CREATE_USER_STORY_MUTATION,
        variables: { input },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to create user story');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.createUserStory) {
      throw new Error('No user story data returned');
    }

    return result.data.createUserStory;
  } catch (error) {
    throw error;
  }
}

export async function getProjectBacklog(
  token: string,
  projectId: string
): Promise<UserStory[]> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: GET_PROJECT_BACKLOG_QUERY,
        variables: { projectId },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to fetch project backlog');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return result.data?.getProjectBacklog || [];
  } catch (error) {
    throw error;
  }
}

export async function updateUserStory(
  token: string,
  id: string,
  input: UpdateUserStoryDto
): Promise<UserStory> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: UPDATE_USER_STORY_MUTATION,
        variables: { id, input },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to update user story');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.updateUserStory) {
      throw new Error('No user story data returned');
    }

    return result.data.updateUserStory;
  } catch (error) {
    throw error;
  }
}

export async function deleteUserStory(
  token: string,
  id: string
): Promise<boolean> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: DELETE_USER_STORY_MUTATION,
        variables: { id },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to delete user story');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return result.data?.deleteUserStory || false;
  } catch (error) {
    throw error;
  }
}
