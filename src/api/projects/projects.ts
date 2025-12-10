const GRAPHQL_ENDPOINT = 'https://backlog-pro-backend.onrender.com/graphql';

const LIST_PROJECTS_QUERY = `
  query ListProjects {
    listProjects {
      id
      name
      description
    }
  }
`;

const CREATE_PROJECT_MUTATION = `
  mutation CreateProject($input: CreateProjectDto!) {
    createProject(input: $input) {
      id
      name
      description
    }
  }
`;

const UPDATE_PROJECT_MUTATION = `
  mutation UpdateProject($id: String!, $input: UpdateProjectDto!) {
    updateProject(id: $id, input: $input) {
      id
      name
      description
    }
  }
`;

export interface Project {
  id: string;
  name: string;
  description?: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
}

export async function updateProject(
  token: string,
  projectId: string,
  input: UpdateProjectDto
): Promise<any> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: UPDATE_PROJECT_MUTATION,
        variables: { id: projectId, input },
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
    const response = await fetch(GRAPHQL_ENDPOINT, {
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


const GET_PROJECT_QUERY = `
  query GetProject($id: String!) {
    getProject(id: $id) {
      id
      name
      description
    }
  }
`;

export async function getProject(token: string, projectId: string): Promise<Project> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: GET_PROJECT_QUERY,
        variables: { id: projectId },
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

const DELETE_PROJECT_MUTATION = `
  mutation DeleteProject($id: String!) {
    deleteProject(id: $id) {
      id
    }
  }
`;

export async function deleteProject(token: string, projectId: string): Promise<void> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: DELETE_PROJECT_MUTATION,
        variables: { id: projectId },
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
