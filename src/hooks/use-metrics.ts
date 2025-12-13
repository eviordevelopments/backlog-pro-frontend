import { useState, useEffect } from 'react';
import { getDashboardMetrics, getProjectMetrics, DashboardMetrics, ProjectMetrics } from '@/api/metrics/metrics';

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const sessionData = localStorage.getItem('auth_session');
        if (!sessionData) {
          setError('No authentication token found');
          return;
        }

        const session = JSON.parse(sessionData);
        const token = session.accessToken;

        if (!token) {
          setError('No authentication token found');
          return;
        }

        const data = await getDashboardMetrics(token);
        setMetrics(data);
        setIsConnected(true);
        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
        setIsConnected(false);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { metrics, isConnected, error };
}

export function useProjectMetrics(projectId: string) {
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setMetrics(null);
      return;
    }

    const loadMetrics = async () => {
      try {
        const sessionData = localStorage.getItem('auth_session');
        if (!sessionData) {
          setError('No authentication token found');
          return;
        }

        const session = JSON.parse(sessionData);
        const token = session.accessToken;

        if (!token) {
          setError('No authentication token found');
          return;
        }

        const data = await getProjectMetrics(token, projectId);
        setMetrics(data);
        setIsConnected(true);
        setError(null);
      } catch (err) {
        console.error('Failed to load project metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
        setIsConnected(false);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [projectId]);

  return { metrics, isConnected, error };
}
