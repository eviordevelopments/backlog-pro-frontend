import { API_CONFIG } from '@/config/api';

const SIGNIN_MUTATION = `
  mutation Signin($input: SigninInput!) {
    signin(input: $input) {
      token
      userId
      email
      name
    }
  }
`;

export interface SigninInput {
  email: string;
  password: string;
}

export interface SigninResponse {
  token: string;
  userId: string;
  email: string;
  name: string;
}

export async function signin(input: SigninInput): Promise<SigninResponse> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: SIGNIN_MUTATION,
        variables: { input },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      const errorMessage = result.errors[0]?.message || 'Signin failed';
      throw new Error(errorMessage);
    }

    if (!result.data?.signin) {
      throw new Error('No signin data returned');
    }

    return result.data.signin;
  } catch (error) {
    console.error('Signin error:', error);
    throw error;
  }
}
