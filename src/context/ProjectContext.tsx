import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { listProjects, createProject, Project, CreateProjectInput } from "@/api/projects/projects";

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (projectId: string) => void;
  loading: boolean;
  error: string | null;
  createNewProject: (input: CreateProjectInput) => Promise<Project>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProjectState] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects on mount
  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const sessionData = localStorage.getItem("auth_session");
        if (!sessionData) {
          setLoading(false);
          return;
        }
        const session = JSON.parse(sessionData);
        const data = await listProjects(session.accessToken);
        if (isMounted) {
          setProjects(data);
          if (data.length > 0) {
            setSelectedProjectState(data[0]);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load projects:", err);
          setError(err instanceof Error ? err.message : "Failed to load projects");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  const setSelectedProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProjectState(project);
    }
  };

  const createNewProject = async (input: CreateProjectInput): Promise<Project> => {
    try {
      const sessionData = localStorage.getItem("auth_session");
      if (!sessionData) {
        throw new Error("No active session");
      }
      const session = JSON.parse(sessionData);
      const newProject = await createProject(session.accessToken, input);
      setProjects([...projects, newProject]);
      setSelectedProjectState(newProject);
      return newProject;
    } catch (err) {
      throw err;
    }
  };

  const refreshProjects = async () => {
    try {
      setLoading(true);
      const sessionData = localStorage.getItem("auth_session");
      if (!sessionData) {
        setLoading(false);
        return;
      }
      const session = JSON.parse(sessionData);
      const data = await listProjects(session.accessToken);
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProjectState(data[0]);
      }
    } catch (err) {
      console.error("Failed to refresh projects:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh projects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProject,
        setSelectedProject,
        loading,
        error,
        createNewProject,
        refreshProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjectContext must be used within ProjectProvider");
  }
  return context;
};
