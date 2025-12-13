import { useCallback } from "react";
import {
  createUserStory as createUserStoryAPI,
  getProjectBacklog as getProjectBacklogAPI,
  updateUserStory as updateUserStoryAPI,
  deleteUserStory as deleteUserStoryAPI,
  UserStory,
  CreateUserStoryDto,
  UpdateUserStoryDto,
} from "@/api/user-stories/user-stories";

export const useUserStories = () => {
  const getToken = (): string => {
    const sessionData = localStorage.getItem("auth_session");
    if (!sessionData) {
      throw new Error("No active session");
    }
    const session = JSON.parse(sessionData);
    return session.accessToken;
  };

  const createUserStory = useCallback(
    async (input: CreateUserStoryDto): Promise<UserStory> => {
      const token = getToken();
      return createUserStoryAPI(token, input);
    },
    []
  );

  const getProjectBacklog = useCallback(
    async (projectId: string): Promise<UserStory[]> => {
      const token = getToken();
      return getProjectBacklogAPI(token, projectId);
    },
    []
  );

  const updateUserStory = useCallback(
    async (id: string, input: UpdateUserStoryDto): Promise<UserStory> => {
      const token = getToken();
      return updateUserStoryAPI(token, id, input);
    },
    []
  );

  const deleteUserStory = useCallback(
    async (id: string): Promise<boolean> => {
      const token = getToken();
      return deleteUserStoryAPI(token, id);
    },
    []
  );

  return {
    createUserStory,
    getProjectBacklog,
    updateUserStory,
    deleteUserStory,
  };
};
