import { API_CONFIG } from '@/config/api';

export interface Meeting {
  id: string;
  title: string;
  type: 'planning' | 'review' | 'retrospective' | 'standup' | 'other';
  dateTime: string;
  duration: number;
  ownerId: string;
  participants: string[];
  agenda?: string;
  notes?: string;
  projectId?: string;
  sprintId?: string;
  isRecurring: boolean;
  recurringPattern?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  attendance: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingDto {
  title: string;
  type: 'planning' | 'review' | 'retrospective' | 'standup' | 'other';
  dateTime: string;
  duration: number;
  ownerId: string;
  participants: string[];
  agenda?: string;
  notes?: string;
  projectId?: string;
  sprintId?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
}

export interface UpdateMeetingDto {
  title?: string;
  type?: 'planning' | 'review' | 'retrospective' | 'standup' | 'other';
  dateTime?: string;
  duration?: number;
  agenda?: string;
  notes?: string;
  participants?: string[];
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  isRecurring?: boolean;
  recurringPattern?: string;
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
      isRecurring
      recurringPattern
      status
      attendance
      createdAt
      updatedAt
    }
  }
`;

const GET_SPRINT_MEETINGS_QUERY = `
  query GetSprintMeetings($sprintId: String!) {
    getSprintMeetings(sprintId: $sprintId) {
      id
      title
      type
      dateTime
      duration
      ownerId
      participants
      agenda
      notes
      status
      attendance
      createdAt
    }
  }
`;

const UPDATE_MEETING_MUTATION = `
  mutation UpdateMeeting($id: String!, $input: UpdateMeetingDto!) {
    updateMeeting(id: $id, input: $input) {
      id
      title
      type
      dateTime
      duration
      agenda
      notes
      participants
      status
      isRecurring
      recurringPattern
      attendance
      updatedAt
    }
  }
`;

const DELETE_MEETING_MUTATION = `
  mutation DeleteMeeting($id: String!) {
    deleteMeeting(id: $id)
  }
`;

export async function createMeeting(token: string, input: CreateMeetingDto): Promise<Meeting> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
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

export async function getSprintMeetings(token: string, sprintId: string): Promise<Meeting[]> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: GET_SPRINT_MEETINGS_QUERY,
        variables: { sprintId },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to get sprint meetings');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return result.data?.getSprintMeetings || [];
  } catch (error) {
    throw error;
  }
}

export async function updateMeeting(token: string, id: string, input: UpdateMeetingDto): Promise<Meeting> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: UPDATE_MEETING_MUTATION,
        variables: { id, input },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to update meeting');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.updateMeeting) {
      throw new Error('No meeting data returned');
    }

    return result.data.updateMeeting;
  } catch (error) {
    throw error;
  }
}

export async function deleteMeeting(token: string, id: string): Promise<boolean> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: DELETE_MEETING_MUTATION,
        variables: { id },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to delete meeting');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return result.data?.deleteMeeting || false;
  } catch (error) {
    throw error;
  }
}
