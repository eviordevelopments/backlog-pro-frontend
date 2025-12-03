import { useAuth } from '@/context/AuthContext';
import { updateProject, UpdateProjectDto } from '@/api/projects/projects';

export const useProjects = () => {
  const { user } = useAuth();

  const getToken = (): string => {
    const sessionData = localStorage.getItem('auth_session');
    if (!sessionData) {
      throw new Error('No active session');
    }
    const session = JSON.parse(sessionData);
    return session.accessToken;
  };

  return {
    updateProject: async (projectId: string, input: UpdateProjectDto): Promise<any> => {
      const token = getToken();
      return updateProject(token, projectId, input);
    },
  };
};
