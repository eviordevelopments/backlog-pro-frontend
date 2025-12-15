import { API_CONFIG } from '@/config/api';

const CONFIRM_EMAIL_MUTATION = `
  mutation ConfirmEmail($token: String!) {
    confirmEmail(token: $token) {
      success
      message
      token
      userId
      email
      name
    }
  }
`;

export interface ConfirmEmailResponse {
  success: boolean;
  message: string;
  token?: string;
  userId?: string;
  email?: string;
  name?: string;
}

export async function confirmEmail(token: string): Promise<ConfirmEmailResponse> {
  try {
    console.log('confirmEmail: Starting with token:', token);
    console.log('confirmEmail: Endpoint:', API_CONFIG.GRAPHQL_ENDPOINT);
    
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: CONFIRM_EMAIL_MUTATION,
        variables: { token },
      }),
    });

    console.log('confirmEmail: Response status:', response.status);
    
    const result = await response.json();
    console.log('confirmEmail: Response data:', result);

    if (result.errors) {
      const errorMsg = result.errors[0]?.message || 'Failed to confirm email';
      console.error('confirmEmail: GraphQL error:', errorMsg);
      throw new Error(errorMsg);
    }

    if (!response.ok) {
      console.error('confirmEmail: HTTP error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.confirmEmail) {
      console.error('confirmEmail: No data returned');
      throw new Error('No confirm email data returned');
    }

    console.log('confirmEmail: Success');
    return result.data.confirmEmail;
  } catch (error) {
    console.error('confirmEmail: Exception:', error);
    throw error;
  }
}
