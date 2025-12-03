const GRAPHQL_ENDPOINT = 'https://backlog-pro-backend.onrender.com/graphql';

export interface Meeting {
  id: string;
  title: string;
  type: 'sprint_planning' | 'sprint_review' | 'retrospective' | 'standup' | 'other';
  dateTime: string;
  duration: number;
  ownerId: string;
  participants: string[];
  agenda?: string;
  notes?: string;
  projectId: string;
  sprintId?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface CreateMeetingDto {
  title: string;
  type: 'sprint_planning' | 'sprint_review' | 'retrospective' | 'standup' | 'other';
  dateTime: string;
  duration: number;
  ownerId: string;
  participants?: string[];
  agenda?: string;
  projectId: string;
  sprintId?: string;
}

const CREATE_MEETING_MUTATION = `
  mutation CreateMeeting($input: CreateMeetingDto!) {
    createMeeting(input: $input) {
      id
      title
      type
      dateTime
      duration
      ownerId
      participants
      agenda
      notes
      projectId
      sprintId
      status
      createdAt
    }
  }
`;

const GET_PROJECT_MEETINGS_QUERY = `
  query GetProjectMeetings($projectId: String!) {
    getProjectMeetings(projectId: $projectId) {
      id
      title
      type
      dateTime
      duration
      ownerId
      participants
      agenda
      notes
      projectId
      sprintId
      status
      createdAt
    }
  }
`;

export async function createMeeting(token: string, input: CreateMeetingDto): Promise<Meeting> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: CREATE_MEETING_MUTATION,
        variables: { input },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to create meeting');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.createMeeting) {
      throw new Error('No meeting data returned');
    }

    return result.data.createMeeting;
  } catch (error) {
    throw error;
  }
}

export async function getProjectMeetings(token: string, projectId: string): Promise<Meeting[]> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: GET_PROJECT_MEETINGS_QUERY,
        variables: { projectId },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to get project meetings');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return result.data?.getProjectMeetings || [];
  } catch (error) {
    throw error;
  }
}
