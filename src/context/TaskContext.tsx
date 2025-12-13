import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  listTasksBySprint, 
  createTask as createTaskAPI,
  updateTask as updateTaskAPI,
  deleteTask as deleteTaskAPI,
  Task as APITask,
  CreateTaskDto,
  UpdateTaskDto
} from "@/api/tasks/tasks";
import { useProjectContext } from "./ProjectContext";
import { useAuth } from "./AuthContext";

interface TaskContextType {
  tasks: APITask[];
  loading: boolean;
  error: string | null;
  createTask: (input: CreateTaskDto) => Promise<APITask>;
  updateTask: (taskId: string, input: UpdateTaskDto) => Promise<APITask>;
  deleteTask: (taskId: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { selectedProject } = useProjectContext();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<APITask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = (): string | null => {
    const sessionData = localStorage.getItem('auth_session');
    if (!sessionData) return null;
    try {
      const session = JSON.parse(sessionData);
      return session.accessToken;
    } catch {
      return null;
    }
  };

  // Load tasks when project changes
  useEffect(() => {
    const loadTasks = async () => {
      if (!selectedProject || !user) {
        setTasks([]);
        return;
      }

      setLoading(true);
      try {
        const token = getToken();
        if (!token) {
          setError("No authentication token found");
          return;
        }

        // For now, we'll load tasks from all sprints
        // In a real app, you might want to load all tasks for the project
        setTasks([]);
      } catch (err) {
        console.error("Failed to load tasks:", err);
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [selectedProject, user]);

  const createTask = async (input: CreateTaskDto): Promise<APITask> => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }
      const newTask = await createTaskAPI(token, input);
      setTasks([...tasks, newTask]);
      return newTask;
    } catch (err) {
      throw err;
    }
  };

  const updateTask = async (taskId: string, input: UpdateTaskDto): Promise<APITask> => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }
      const updatedTask = await updateTaskAPI(token, taskId, input);
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      return updatedTask;
    } catch (err) {
      throw err;
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }
      await deleteTaskAPI(token, taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      throw err;
    }
  };

  const refreshTasks = async () => {
    if (!selectedProject) {
      setTasks([]);
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      // Load tasks from all sprints in the project
      // This would need to be implemented in the backend
      setTasks([]);
    } catch (err) {
      console.error("Failed to refresh tasks:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh tasks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        createTask,
        updateTask,
        deleteTask,
        refreshTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within TaskProvider");
  }
  return context;
};
