import { useAuth } from "@/context/AuthContext";
import { createUserStory, getProjectBacklog, CreateUserStoryDto, UserStory } from "@/api/user-stories/user-stories";

export const useUserStories = () => {
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
    createUserStory: async (input: CreateUserStoryDto): Promise<UserStory> => {
      const token = getToken();
      return createUserStory(token, input);
    },
    getProjectBacklog: async (projectId: string): Promise<UserStory[]> => {
      const token = getToken();
      return getProjectBacklog(token, projectId);
    },
  };
};
