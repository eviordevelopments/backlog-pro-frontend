import { API_CONFIG } from '@/config/api';

const REQUEST_PASSWORD_RESET_MUTATION = `
  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {
    requestPasswordReset(input: $input) {
      resetToken
      expiresIn
    }
  }
`;

export interface RequestPasswordResetInput {
  email: string;
}

export interface RequestPasswordResetResponse {
  resetToken: string;
  expiresIn: string;
}

export async function requestPasswordReset(
  input: RequestPasswordResetInput
): Promise<RequestPasswordResetResponse> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: REQUEST_PASSWORD_RESET_MUTATION,
        variables: { input },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      const errorMessage = result.errors[0]?.message || 'Password reset request failed';
      throw new Error(errorMessage);
    }

    if (!result.data?.requestPasswordReset) {
      throw new Error('No password reset data returned');
    }

    return result.data.requestPasswordReset;
  } catch (error) {
    console.error('Password reset request error:', error);
    throw error;
  }
}
