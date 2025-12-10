import { API_CONFIG } from '@/config/api';

const GET_PROFILE_QUERY = `
  query GetProfile {
    getProfile {
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

const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($input: UpdateProfileDto!) {
    updateProfile(input: $input) {
      id
      userId
      name
      email
      avatar
      skills
      hourlyRate
      updatedAt
    }
  }
`;

const UPDATE_AVATAR_MUTATION = `
  mutation UpdateAvatar($input: UpdateAvatarDto!) {
    updateAvatar(input: $input) {
      id
      userId
      name
      email
      avatar
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

export interface UpdateProfileInput {
  name?: string;
  skills?: string[];
  hourlyRate?: number;
}

export interface UpdateAvatarInput {
  avatarUrl: string;
}

export async function getProfile(token: string): Promise<UserProfile> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: GET_PROFILE_QUERY,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      const errorMessage = result.errors[0]?.message || 'Failed to fetch profile';
      throw new Error(errorMessage);
    }

    if (!result.data?.getProfile) {
      throw new Error('No profile data returned');
    }

    return result.data.getProfile;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
}

export async function updateProfile(
  token: string,
  input: UpdateProfileInput
): Promise<UserProfile> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: UPDATE_PROFILE_MUTATION,
        variables: { input },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      const errorMessage = result.errors[0]?.message || 'Failed to update profile';
      throw new Error(errorMessage);
    }

    if (!result.data?.updateProfile) {
      throw new Error('No updated profile data returned');
    }

    return result.data.updateProfile;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
}

export async function updateAvatar(
  token: string,
  input: UpdateAvatarInput
): Promise<UserProfile> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: UPDATE_AVATAR_MUTATION,
        variables: { input },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      const errorMessage = result.errors[0]?.message || 'Failed to update avatar';
      throw new Error(errorMessage);
    }

    if (!result.data?.updateAvatar) {
      throw new Error('No updated avatar data returned');
    }

    return result.data.updateAvatar;
  } catch (error) {
    console.error('Update avatar error:', error);
    throw error;
  }
}
