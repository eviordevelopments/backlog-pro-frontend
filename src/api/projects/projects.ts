const GRAPHQL_ENDPOINT = 'https://backlog-pro-backend.onrender.com/graphql';

const CREATE_PROJECT_MUTATION = `
  mutation CreateProject($input: CreateProjectDto!) {
    createProject(input: $input) {
      id
      name
      description
      clientId
      status
      budget
      spent
      progress
      methodology
      startDate
      endDate
      createdAt
      updatedAt
    }
  }
`;

const GET_PROJECT_QUERY = `
  query GetProject($projectId: String!) {
    getProject(projectId: $projectId) {
      id
      name
      description
      clientId
      status
      budget
      spent
      progress
      methodology
      startDate
      endDate
      createdAt
      updatedAt
    }
  }
`;

const LIST_PROJECTS_QUERY = `
  query ListProjects($clientId: String) {
    listProjects(clientId: $clientId) {
      id
      name
      description
      clientId
      status
      budget
      spent
      progress
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_PROJECT_MUTATION = `
  mutation UpdateProject($projectId: String!, $input: UpdateProjectDto!) {
    updateProject(projectId: $projectId, input: $input) {
      id
      name
      description
      status
      budget
      progress
      updatedAt
    }
  }
`;

const DELETE_PROJECT_MUTATION = `
  mutation DeleteProject($projectId: String!) {
    deleteProject(projectId: $projectId)
  }
`;

export interface CreateProjectInput {
  name: string;
  clientId: string;
  description?: string;
  budget?: number;
  startDate?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: string;
  budget?: number;
  progress?: number;
  endDate?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  status: string;
  budget: number;
  spent: number;
  progress: number;
  methodology?: string;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export async function createProject(
  token: string,
  input: CreateProjectInput
): Promise<Project> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: CREATE_PROJECT_MUTATION,
        variables: { input },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result.errors?.[0]?.message || `HTTP error! status: ${response.status}`;
      console.error('GraphQL Error:', result.errors);
      throw new Error(errorMessage);
    }

    if (result.errors) {
      const errorMessage = result.errors[0]?.message || 'Failed to create project';
      console.error('GraphQL Error:', result.errors);
      throw new Error(errorMessage);
    }

    if (!result.data?.createProject) {
      throw new Error('No project data returned');
    }

    return result.data.createProject;
  } catch (error) {
    console.error('Create project error:', error);
    throw error;
  }
}

export async function getProject(
  token: string,
  projectId: string
): Promise<Project> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: GET_PROJECT_QUERY,
        variables: { projectId },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      const errorMessage = result.errors[0]?.message || 'Failed to fetch project';
      throw new Error(errorMessage);
    }

    if (!result.data?.getProject) {
      throw new Error('No project data returned');
    }

    return result.data.getProject;
  } catch (error) {
    console.error('Get project error:', error);
    throw error;
  }
}

export async function listProjects(
  token: string,
  clientId?: string
): Promise<Project[]> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: LIST_PROJECTS_QUERY,
        variables: { clientId: clientId || null },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result.errors?.[0]?.message || `HTTP error! status: ${response.status}`;
      console.error('GraphQL Error:', result.errors);
      throw new Error(errorMessage);
    }

    if (result.errors) {
      const errorMessage = result.errors[0]?.message || 'Failed to fetch projects';
      console.error('GraphQL Error:', result.errors);
      throw new Error(errorMessage);
    }

    if (!result.data?.listProjects) {
      return [];
    }

    return result.data.listProjects;
  } catch (error) {
    console.error('List projects error:', error);
    throw error;
  }
}

export async function updateProject(
  token: string,
  projectId: string,
  input: UpdateProjectInput
): Promise<Project> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: UPDATE_PROJECT_MUTATION,
        variables: { projectId, input },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      const errorMessage = result.errors[0]?.message || 'Failed to update project';
      throw new Error(errorMessage);
    }

    if (!result.data?.updateProject) {
      throw new Error('No updated project data returned');
    }

    return result.data.updateProject;
  } catch (error) {
    console.error('Update project error:', error);
    throw error;
  }
}

export async function deleteProject(
  token: string,
  projectId: string
): Promise<boolean> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: DELETE_PROJECT_MUTATION,
        variables: { projectId },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      const errorMessage = result.errors[0]?.message || 'Failed to delete project';
      throw new Error(errorMessage);
    }

    return result.data?.deleteProject || false;
  } catch (error) {
    console.error('Delete project error:', error);
    throw error;
  }
}
