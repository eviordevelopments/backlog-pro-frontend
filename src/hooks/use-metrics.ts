import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  subscribeToDashboardMetrics,
  subscribeToProjectMetrics,
  DashboardMetrics,
  ProjectMetrics,
} from '@/api/metrics/metrics';

export const useDashboardMetrics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsConnected(false);
      return;
    }

    const getToken = (): string => {
      const sessionData = localStorage.getItem('auth_session');
      if (!sessionData) {
        throw new Error('No active session');
      }
      const session = JSON.parse(sessionData);
      return session.accessToken;
    };

    try {
      const token = getToken();

      const unsubscribe = subscribeToDashboardMetrics(
        token,
        (data) => {
          setMetrics(data);
          setError(null);
          setIsConnected(true);
        },
        (err) => {
          setError(err);
          setIsConnected(false);
        }
      );

      return () => {
        unsubscribe();
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setIsConnected(false);
    }
  }, [user]);

  return { metrics, error, isConnected };
};

export const useProjectMetrics = (projectId: string) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user || !projectId) {
      setIsConnected(false);
      return;
    }

    const getToken = (): string => {
      const sessionData = localStorage.getItem('auth_session');
      if (!sessionData) {
        throw new Error('No active session');
      }
      const session = JSON.parse(sessionData);
      return session.accessToken;
    };

    try {
      const token = getToken();

      const unsubscribe = subscribeToProjectMetrics(
        token,
        projectId,
        (data) => {
          setMetrics(data);
          setError(null);
          setIsConnected(true);
        },
        (err) => {
          setError(err);
          setIsConnected(false);
        }
      );

      return () => {
        unsubscribe();
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setIsConnected(false);
    }
  }, [user, projectId]);

  return { metrics, error, isConnected };
};
