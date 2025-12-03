import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { listClients, createClient, ClientListItem, CreateClientInput } from "@/api/clients/clients";

interface ClientContextType {
  clients: ClientListItem[];
  loading: boolean;
  error: string | null;
  createNewClient: (input: CreateClientInput) => Promise<ClientListItem>;
  refreshClients: () => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load clients on mount
  useEffect(() => {
    let isMounted = true;

    const loadClients = async () => {
      try {
        setLoading(true);
        setError(null);
        const sessionData = localStorage.getItem("auth_session");
        if (!sessionData) {
          setLoading(false);
          return;
        }
        const session = JSON.parse(sessionData);
        const data = await listClients(session.accessToken);
        if (isMounted) {
          setClients(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load clients:", err);
          setError(err instanceof Error ? err.message : "Failed to load clients");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadClients();

    return () => {
      isMounted = false;
    };
  }, []);

  const createNewClient = async (input: CreateClientInput): Promise<ClientListItem> => {
    try {
      const sessionData = localStorage.getItem("auth_session");
      if (!sessionData) {
        throw new Error("No active session");
      }
      const session = JSON.parse(sessionData);
      const newClient = await createClient(session.accessToken, input);
      const clientListItem: ClientListItem = {
        id: newClient.id,
        name: newClient.name,
        email: newClient.email,
        company: newClient.company,
        status: newClient.status,
        createdAt: newClient.createdAt,
      };
      setClients([...clients, clientListItem]);
      return clientListItem;
    } catch (err) {
      throw err;
    }
  };

  const refreshClients = async () => {
    try {
      setLoading(true);
      const sessionData = localStorage.getItem("auth_session");
      if (!sessionData) {
        setLoading(false);
        return;
      }
      const session = JSON.parse(sessionData);
      const data = await listClients(session.accessToken);
      setClients(data);
    } catch (err) {
      console.error("Failed to refresh clients:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh clients");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientContext.Provider
      value={{
        clients,
        loading,
        error,
        createNewClient,
        refreshClients,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useClientContext = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error("useClientContext must be used within ClientProvider");
  }
  return context;
};
