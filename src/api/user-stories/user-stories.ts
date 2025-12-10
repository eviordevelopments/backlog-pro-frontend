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
      createdAt
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
      sprintId
    }
  }
`;

export interface CreateUserStoryDto {
  title: string;
  userType: string;
  action: string;
  benefit: string;
  priority: string;
  storyPoints: number;
  projectId: string;
  sprintId?: string;
  acceptanceCriteria: string[];
}

export interface UserStory {
  id: string;
  title: string;
  userType: string;
  action: string;
  benefit: string;
  priority: string;
  storyPoints: number;
  status: string;
  projectId: string;
  sprintId?: string;
  acceptanceCriteria?: string[];
  createdAt: string;
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
      const error = result.errors[0];
      const errorMessage = error.message || 'Failed to create user story';
      
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

    if (!result.data?.createUserStory) {
      throw new Error('No user story data returned');
    }

    return {
      ...result.data.createUserStory,
      acceptanceCriteria: input.acceptanceCriteria
    };
  } catch (error) {
    console.error('Create user story error:', error);
    throw error;
  }
}

export async function getProjectBacklog(
  token: string,
  projectId: string
): Promise<UserStory[]> {
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
        query: GET_PROJECT_BACKLOG_QUERY,
        variables: { projectId },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      const error = result.errors[0];
      const errorMessage = error.message || 'Failed to fetch user stories';
      
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

    if (!result.data?.getProjectBacklog) {
      return [];
    }

    return result.data.getProjectBacklog.map((story: any) => ({
      ...story,
      acceptanceCriteria: story.acceptanceCriteria ? 
        (Array.isArray(story.acceptanceCriteria) && typeof story.acceptanceCriteria[0] === 'object'
          ? story.acceptanceCriteria.map((c: any) => c.description || c)
          : story.acceptanceCriteria)
        : []
    }));
  } catch (error) {
    console.error('Get project backlog error:', error);
    throw error;
  }
}
