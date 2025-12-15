import { API_CONFIG } from '@/config/api';

const LIST_ALL_USERS_QUERY = `
  query ListAllUsers {
    listAllUsers {
      id
      userId
      name
      email
      avatar
      skills
      hourlyRate
      createdAt
      updatedAt
    }
  }
`;

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  skills: string[];
  hourlyRate: number;
  createdAt: string;
  updatedAt: string;
}

export async function listAllUsers(token: string): Promise<UserProfile[]> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: LIST_ALL_USERS_QUERY,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      const errorMessage = result.errors[0]?.message || 'Failed to fetch users';
      throw new Error(errorMessage);
    }

    if (!result.data?.listAllUsers) {
      throw new Error('No users data returned');
    }

    return result.data.listAllUsers;
  } catch (error) {
    console.error('List all users error:', error);
    throw error;
  }
}
