import { useAuth } from "@/context/AuthContext";
import { createProject, getProject, listProjects, updateProject, deleteProject, CreateProjectInput, UpdateProjectInput, Project } from "@/api/projects/projects";

export const useProjects = () => {
  const { user } = useAuth();

  const getToken = (): string => {
    const sessionData = localStorage.getItem("auth_session");
    if (!sessionData) {
      throw new Error("No active session");
    }
    const session = JSON.parse(sessionData);
    return session.accessToken;
  };

  return {
    createProject: async (input: CreateProjectInput) => {
      const token = getToken();
      return createProject(token, input);
    },
    getProject: async (projectId: string) => {
      const token = getToken();
      return getProject(token, projectId);
    },
    listProjects: async (clientId?: string) => {
      const token = getToken();
      return listProjects(token, clientId);
    },
    updateProject: async (projectId: string, input: UpdateProjectInput) => {
      const token = getToken();
      return updateProject(token, projectId, input);
    },
    deleteProject: async (projectId: string) => {
      const token = getToken();
      return deleteProject(token, projectId);
    },
  };
};
