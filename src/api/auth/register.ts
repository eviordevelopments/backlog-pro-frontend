import { API_CONFIG } from '@/config/api';

const SIGNUP_MUTATION = `
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      userId
      email
      name
      message
      requiresEmailConfirmation
    }
  }
`;

export interface SignupInput {
  email: string;
  password: string;
  name: string;
}

export interface SignupResponse {
  userId: string;
  email: string;
  name: string;
  message: string;
  requiresEmailConfirmation: boolean;
}

export async function signup(input: SignupInput): Promise<SignupResponse> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: SIGNUP_MUTATION,
        variables: { input },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      const errorMessage = result.errors[0]?.message || 'Signup failed';
      throw new Error(errorMessage);
    }

    if (!result.data?.signup) {
      throw new Error('No signup data returned');
    }

    return result.data.signup;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}
