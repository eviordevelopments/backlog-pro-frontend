import { API_CONFIG } from '@/config/api';

export interface WorkedHoursResponseDto {
  userId: string;
  totalHours: number;
  projectId?: string;
  breakdown?: {
    date: string;
    hours: number;
  }[];
}

const GET_WORKED_HOURS_QUERY = `
  query GetWorkedHours($projectId: String) {
    getWorkedHours(projectId: $projectId) {
      userId
      totalHours
      projectId
      breakdown {
        date
        hours
      }
    }
  }
`;

export async function getWorkedHours(
  token: string,
  projectId?: string
): Promise<WorkedHoursResponseDto> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: GET_WORKED_HOURS_QUERY,
        variables: { projectId: projectId || null },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to get worked hours');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.getWorkedHours) {
      return {
        userId: '',
        totalHours: 0,
        projectId,
        breakdown: [],
      };
    }

    return result.data.getWorkedHours;
  } catch (error) {
    throw error;
  }
}
