import { createClient, getClient, listClients, CreateClientInput, Client, ClientListItem } from "@/api/clients/clients";

export const useClients = () => {
  const getToken = (): string => {
    const sessionData = localStorage.getItem("auth_session");
    if (!sessionData) {
      throw new Error("No active session");
    }
    const session = JSON.parse(sessionData);
    return session.accessToken;
  };

  return {
    createClient: async (input: CreateClientInput) => {
      const token = getToken();
      return createClient(token, input);
    },
    getClient: async (clientId: string) => {
      const token = getToken();
      return getClient(token, clientId);
    },
    listClients: async () => {
      const token = getToken();
      return listClients(token);
    },
  };
};
