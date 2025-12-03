const GRAPHQL_ENDPOINT = 'https://backlog-pro-backend.onrender.com/graphql';

export interface Risk {
  id: string;
  title: string;
  description?: string;
  category: string;
  probability: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high' | 'critical';
  severity: number;
  status: 'open' | 'mitigated' | 'closed';
  projectId: string;
  responsibleId?: string;
  mitigationStrategy?: string;
  isCore?: boolean;
  createdAt: string;
}

export interface CreateRiskDto {
  title: string;
  description?: string;
  category: string;
  probability: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high' | 'critical';
  projectId: string;
  responsibleId?: string;
  mitigationStrategy?: string;
}

const CREATE_RISK_MUTATION = `
  mutation CreateRisk($input: CreateRiskDto!) {
    createRisk(input: $input) {
      id
      title
      description
      category
      probability
      impact
      severity
      status
      projectId
      responsibleId
      mitigationStrategy
      isCore
      createdAt
    }
  }
`;

const GET_PROJECT_RISKS_QUERY = `
  query GetProjectRisks($projectId: String!) {
    getProjectRisks(projectId: $projectId) {
      id
      title
      category
      probability
      impact
      severity
      status
      mitigationStrategy
    }
  }
`;

export async function createRisk(token: string, input: CreateRiskDto): Promise<Risk> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: CREATE_RISK_MUTATION,
        variables: { input },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to create risk');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.createRisk) {
      throw new Error('No risk data returned');
    }

    return result.data.createRisk;
  } catch (error) {
    throw error;
  }
}

export async function getProjectRisks(token: string, projectId: string): Promise<Risk[]> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: GET_PROJECT_RISKS_QUERY,
        variables: { projectId },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to get project risks');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return result.data?.getProjectRisks || [];
  } catch (error) {
    throw error;
  }
}
