import { API_CONFIG } from '@/config/api';

const CREATE_TASK_MUTATION = `
  mutation CreateTask($input: CreateTaskDto!) {
    createTask(input: $input) {
      id
      title
      description
      projectId
      sprintId
      status
      priority
      estimatedHours
      actualHours
      storyPoints
      assignedTo
      tags
      dependencies
      dueDate
      createdAt
      updatedAt
    }
  }
`;

const GET_TASK_QUERY = `
  query GetTask($taskId: String!) {
    getTask(taskId: $taskId) {
      id
      title
      description
      projectId
      sprintId
      status
      priority
      assignedTo
      estimatedHours
      actualHours
      storyPoints
      dueDate
      tags
      dependencies
      createdAt
      updatedAt
    }
  }
`;

const LIST_TASKS_BY_SPRINT_QUERY = `
  query ListTasksBySprint($sprintId: String!) {
    listTasksBySprint(sprintId: $sprintId) {
      id
      title
      description
      projectId
      sprintId
      status
      priority
      assignedTo
      estimatedHours
      actualHours
      storyPoints
      dueDate
      tags
      dependencies
      createdAt
      updatedAt
    }
  }
`;

const LIST_TASKS_WITHOUT_SPRINT_QUERY = `
  query ListTasksWithoutSprint($projectId: String!) {
    listTasksWithoutSprint(projectId: $projectId) {
      id
      title
      description
      projectId
      sprintId
      status
      priority
      assignedTo
      estimatedHours
      actualHours
      storyPoints
      dueDate
      tags
      dependencies
      createdAt
      updatedAt
    }
  }
`;



const UPDATE_TASK_MUTATION = `
  mutation UpdateTask($taskId: String!, $input: UpdateTaskDto!) {
    updateTask(taskId: $taskId, input: $input) {
      id
      title
      description
      status
      priority
      estimatedHours
      storyPoints
      dueDate
      tags
      updatedAt
    }
  }
`;

const ASSIGN_TASK_MUTATION = `
  mutation AssignTask($taskId: String!, $userId: String!) {
    assignTask(taskId: $taskId, userId: $userId) {
      id
      title
      assignedTo
      status
    }
  }
`;

const ADD_SUBTASKS_MUTATION = `
  mutation AddSubtasks($taskId: String!, $subtasks: [String!]!) {
    addSubtasks(taskId: $taskId, subtasks: $subtasks) {
      id
      title
      dependencies
      updatedAt
    }
  }
`;

const ADD_DEPENDENCY_MUTATION = `
  mutation AddDependency($taskId: String!, $dependsOnTaskId: String!) {
    addDependency(taskId: $taskId, dependsOnTaskId: $dependsOnTaskId) {
      id
      title
      dependencies
      updatedAt
    }
  }
`;

const DELETE_TASK_MUTATION = `
  mutation DeleteTask($taskId: String!) {
    deleteTask(taskId: $taskId)
  }
`;

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  sprintId?: string;
  status: string;
  priority: string;
  estimatedHours?: number;
  actualHours?: number;
  storyPoints?: number;
  assignedTo?: string;
  tags?: string[];
  dependencies?: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  projectId: string;
  sprintId?: string;
  storyPoints?: number;
  tags?: string[];
  dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  estimatedHours?: number;
  actualHours?: number;
  storyPoints?: number;
  assignedTo?: string;
  tags?: string[];
  dueDate?: string;
}

export async function createTask(
  token: string,
  input: CreateTaskDto
): Promise<Task> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: CREATE_TASK_MUTATION,
        variables: { input },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to create task');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.createTask) {
      throw new Error('No task data returned');
    }

    return result.data.createTask;
  } catch (error) {
    throw error;
  }
}

export async function getTask(
  token: string,
  taskId: string
): Promise<Task> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: GET_TASK_QUERY,
        variables: { taskId },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to get task');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.getTask) {
      throw new Error('Task not found');
    }

    return result.data.getTask;
  } catch (error) {
    throw error;
  }
}

export async function listTasksBySprint(
  token: string,
  sprintId: string
): Promise<Task[]> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: LIST_TASKS_BY_SPRINT_QUERY,
        variables: { sprintId },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to list tasks');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return result.data?.listTasksBySprint || [];
  } catch (error) {
    throw error;
  }
}

export async function listTasksWithoutSprint(
  token: string,
  projectId: string
): Promise<Task[]> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: LIST_TASKS_WITHOUT_SPRINT_QUERY,
        variables: { projectId },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to list tasks');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return result.data?.listTasksWithoutSprint || [];
  } catch (error) {
    throw error;
  }
}



export async function updateTask(
  token: string,
  taskId: string,
  input: UpdateTaskDto
): Promise<Task> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: UPDATE_TASK_MUTATION,
        variables: { taskId, input },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to update task');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.updateTask) {
      throw new Error('No task data returned');
    }

    return result.data.updateTask;
  } catch (error) {
    throw error;
  }
}

export async function assignTask(
  token: string,
  taskId: string,
  userId: string
): Promise<Task> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: ASSIGN_TASK_MUTATION,
        variables: { taskId, userId },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to assign task');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.assignTask) {
      throw new Error('No task data returned');
    }

    return result.data.assignTask;
  } catch (error) {
    throw error;
  }
}

export async function addSubtasks(
  token: string,
  taskId: string,
  subtasks: string[]
): Promise<Task> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: ADD_SUBTASKS_MUTATION,
        variables: { taskId, subtasks },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to add subtasks');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.addSubtasks) {
      throw new Error('No task data returned');
    }

    return result.data.addSubtasks;
  } catch (error) {
    throw error;
  }
}

export async function addDependency(
  token: string,
  taskId: string,
  dependsOnTaskId: string
): Promise<Task> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: ADD_DEPENDENCY_MUTATION,
        variables: { taskId, dependsOnTaskId },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to add dependency');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.addDependency) {
      throw new Error('No task data returned');
    }

    return result.data.addDependency;
  } catch (error) {
    throw error;
  }
}

export async function deleteTask(
  token: string,
  taskId: string
): Promise<void> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: DELETE_TASK_MUTATION,
        variables: { taskId },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to delete task');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
}
