const GRAPHQL_ENDPOINT = 'https://backlog-pro-backend.onrender.com/graphql';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: 'team' | 'individual';
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  period: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  ownerId: string;
  projectId?: string;
  createdAt: string;
}

export interface CreateGoalDto {
  title: string;
  description?: string;
  type: 'team' | 'individual';
  category: string;
  targetValue: number;
  unit: string;
  period: string;
  startDate: string;
  endDate: string;
  ownerId: string;
}

const CREATE_GOAL_MUTATION = `
  mutation CreateGoal($input: CreateGoalDto!) {
    createGoal(input: $input) {
      id
      title
      description
      type
      category
      targetValue
      currentValue
      unit
      period
      startDate
      endDate
      status
      progress
      ownerId
      createdAt
    }
  }
`;

const UPDATE_GOAL_PROGRESS_MUTATION = `
  mutation UpdateGoalProgress($goalId: String!, $currentValue: Float!) {
    updateGoalProgress(goalId: $goalId, currentValue: $currentValue) {
      id
      title
      currentValue
      targetValue
      progress
      status
    }
  }
`;

const GET_USER_GOALS_QUERY = `
  query GetUserGoals($ownerId: String!) {
    getUserGoals(ownerId: $ownerId) {
      id
      title
      description
      type
      category
      targetValue
      currentValue
      unit
      period
      startDate
      endDate
      status
      progress
      ownerId
      createdAt
    }
  }
`;



export async function createGoal(token: string, input: CreateGoalDto): Promise<Goal> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: CREATE_GOAL_MUTATION,
        variables: { input },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to create goal');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.createGoal) {
      throw new Error('No goal data returned');
    }

    return result.data.createGoal;
  } catch (error) {
    throw error;
  }
}

export async function updateGoalProgress(
  token: string,
  goalId: string,
  currentValue: number
): Promise<Goal> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: UPDATE_GOAL_PROGRESS_MUTATION,
        variables: { goalId, currentValue },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to update goal progress');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.updateGoalProgress) {
      throw new Error('No goal data returned');
    }

    return result.data.updateGoalProgress;
  } catch (error) {
    throw error;
  }
}



export async function getUserGoals(token: string, ownerId: string): Promise<Goal[]> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: GET_USER_GOALS_QUERY,
        variables: { ownerId },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to get user goals');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return result.data?.getUserGoals || [];
  } catch (error) {
    throw error;
  }
}
