import { useAuth } from "@/context/AuthContext";
import { createSprint, listSprints, getSprintMetrics, CreateSprintDto, SprintMetrics, Sprint } from "@/api/sprints/sprints";

export const useSprints = () => {
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
    createSprint: async (input: CreateSprintDto): Promise<Sprint> => {
      const token = getToken();
      return createSprint(token, input);
    },
    listSprints: async (projectId?: string): Promise<Sprint[]> => {
      const token = getToken();
      return listSprints(token, projectId);
    },
    getSprintMetrics: async (sprintId: string): Promise<SprintMetrics> => {
      const token = getToken();
      return getSprintMetrics(token, sprintId);
    },
  };
};
