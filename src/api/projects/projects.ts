import { API_CONFIG } from '@/config/api';

const LIST_PROJECTS_QUERY = `
  query ListProjects {
    listProjects {
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

const ADD_PROJECT_MEMBER_MUTATION = `
  mutation AddProjectMember($projectId: String!, $input: AddMemberDto!) {
    addProjectMember(projectId: $projectId, input: $input) {
      id
      projectId
      userId
      role
      joinedAt
      createdAt
      updatedAt
    }
  }
`;

const GET_PROJECT_MEMBERS_QUERY = `
  query GetProjectMembers($projectId: String!) {
    getProjectMembers(projectId: $projectId) {
      id
      projectId
      userId
      role
      joinedAt
      createdAt
      updatedAt
    }
  }
`;

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId?: string;
  status?: string;
  budget?: number;
  spent?: number;
  progress?: number;
  methodology?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  clientId?: string;
  status?: string;
  budget?: number;
  methodology?: string;
  startDate?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: string;
  budget?: number;
  progress?: number;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddMemberDto {
  userId: string;
  role: string;
}

export async function updateProject(
  token: string,
  projectId: string,
  input: UpdateProjectDto
): Promise<Project> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
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

    const result = await response.json();

    if (result.errors) {
      const error = result.errors[0];
      throw new Error(error.message || 'Failed to update project');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.updateProject) {
      throw new Error('No project data returned');
    }

    return result.data.updateProject;
  } catch (error) {
    throw error;
  }
}


export async function listProjects(token: string): Promise<Project[]> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: LIST_PROJECTS_QUERY,
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to list projects');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return result.data?.listProjects || [];
  } catch (error) {
    throw error;
  }
}

export async function createProject(
  token: string,
  input: CreateProjectDto
): Promise<Project> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
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

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to create project');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.createProject) {
      throw new Error('No project data returned');
    }

    return result.data.createProject;
  } catch (error) {
    throw error;
  }
}


export async function getProject(token: string, projectId: string): Promise<Project> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
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

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to get project');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.getProject) {
      throw new Error('Project not found');
    }

    return result.data.getProject;
  } catch (error) {
    throw error;
  }
}

export async function deleteProject(token: string, projectId: string): Promise<void> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
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

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to delete project');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
}

export async function addProjectMember(
  token: string,
  projectId: string,
  input: AddMemberDto
): Promise<ProjectMember> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: ADD_PROJECT_MEMBER_MUTATION,
        variables: { projectId, input },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to add project member');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.addProjectMember) {
      throw new Error('No member data returned');
    }

    return result.data.addProjectMember;
  } catch (error) {
    throw error;
  }
}

export async function getProjectMembers(
  token: string,
  projectId: string
): Promise<ProjectMember[]> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: GET_PROJECT_MEMBERS_QUERY,
        variables: { projectId },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to get project members');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return result.data?.getProjectMembers || [];
  } catch (error) {
    throw error;
  }
}
