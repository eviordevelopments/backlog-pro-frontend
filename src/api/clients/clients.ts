import { API_CONFIG } from '@/config/api';

const CREATE_CLIENT_MUTATION = `
  mutation CreateClient($input: CreateClientDto!) {
    createClient(input: $input) {
      id
      name
      email
      phone
      company
      industry
      status
      ltv
      cac
      mrr
      createdAt
      updatedAt
    }
  }
`;

const GET_CLIENT_QUERY = `
  query GetClient($clientId: String!) {
    getClient(clientId: $clientId) {
      id
      name
      email
      phone
      company
      industry
      status
      ltv
      cac
      mrr
      createdAt
      updatedAt
    }
  }
`;

const LIST_CLIENTS_QUERY = `
  query ListClients {
    listClients {
      id
      name
      email
      company
      status
      createdAt
    }
  }
`;

export interface CreateClientInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  status: string;
  ltv?: number;
  cac?: number;
  mrr?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientListItem {
  id: string;
  name: string;
  email: string;
  company?: string;
  status: string;
  createdAt: string;
}

export async function createClient(
  token: string,
  input: CreateClientInput
): Promise<Client> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: CREATE_CLIENT_MUTATION,
        variables: { input },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      const errorMessage = result.errors[0]?.message || 'Failed to create client';
      throw new Error(errorMessage);
    }

    if (!result.data?.createClient) {
      throw new Error('No client data returned');
    }

    return result.data.createClient;
  } catch (error) {
    console.error('Create client error:', error);
    throw error;
  }
}

export async function getClient(
  token: string,
  clientId: string
): Promise<Client> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: GET_CLIENT_QUERY,
        variables: { clientId },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      const errorMessage = result.errors[0]?.message || 'Failed to fetch client';
      throw new Error(errorMessage);
    }

    if (!result.data?.getClient) {
      throw new Error('No client data returned');
    }

    return result.data.getClient;
  } catch (error) {
    console.error('Get client error:', error);
    throw error;
  }
}

export async function listClients(token: string): Promise<ClientListItem[]> {
  try {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: LIST_CLIENTS_QUERY,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      const errorMessage = result.errors[0]?.message || 'Failed to fetch clients';
      throw new Error(errorMessage);
    }

    if (!result.data?.listClients) {
      return [];
    }

    return result.data.listClients;
  } catch (error) {
    console.error('List clients error:', error);
    throw error;
  }
}
