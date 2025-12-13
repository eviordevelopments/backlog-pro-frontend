import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { listProjects, createProject, getProject, updateProject, deleteProject, addProjectMember, getProjectMembers, Project, CreateProjectDto, UpdateProjectDto, ProjectMember, AddMemberDto } from "@/api/projects/projects";
import { useAuth } from "./AuthContext";

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  projectMembers: ProjectMember[];
  setSelectedProject: (projectId: string) => void;
  loading: boolean;
  error: string | null;
  createNewProject: (input: CreateProjectDto) => Promise<Project>;
  getProjectDetails: (projectId: string) => Promise<Project>;
  updateProjectDetails: (projectId: string, input: UpdateProjectDto) => Promise<Project>;
  deleteProjectById: (projectId: string) => Promise<void>;
  addMemberToProject: (projectId: string, input: AddMemberDto) => Promise<ProjectMember>;
  getProjectMembersDetails: (projectId: string) => Promise<ProjectMember[]>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProjectState] = useState<Project | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects when user is authenticated
  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Wait for auth to finish loading
        if (authLoading) {
          return;
        }
        
        // Only load if user is authenticated
        if (!user) {
          setProjects([]);
          setSelectedProjectState(null);
          setLoading(false);
          return;
        }
        
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
  }, [user, authLoading]);

  const setSelectedProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProjectState(project);
    }
  };

  const createNewProject = async (input: CreateProjectDto): Promise<Project> => {
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

  const getProjectDetails = async (projectId: string): Promise<Project> => {
    try {
      const sessionData = localStorage.getItem("auth_session");
      if (!sessionData) {
        throw new Error("No active session");
      }
      const session = JSON.parse(sessionData);
      const project = await getProject(session.accessToken, projectId);
      return project;
    } catch (err) {
      throw err;
    }
  };

  const updateProjectDetails = async (projectId: string, input: UpdateProjectDto): Promise<Project> => {
    try {
      const sessionData = localStorage.getItem("auth_session");
      if (!sessionData) {
        throw new Error("No active session");
      }
      const session = JSON.parse(sessionData);
      const updatedProject = await updateProject(session.accessToken, projectId, input);
      
      // Update projects list
      setProjects(projects.map(p => p.id === projectId ? { ...p, ...updatedProject } : p));
      
      // Update selected project if it's the one being updated
      if (selectedProject?.id === projectId) {
        setSelectedProjectState({ ...selectedProject, ...updatedProject });
      }
      
      return updatedProject;
    } catch (err) {
      throw err;
    }
  };

  const deleteProjectById = async (projectId: string): Promise<void> => {
    try {
      const sessionData = localStorage.getItem("auth_session");
      if (!sessionData) {
        throw new Error("No active session");
      }
      const session = JSON.parse(sessionData);
      await deleteProject(session.accessToken, projectId);
      
      // Remove from projects list
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      
      // Update selected project if it was deleted
      if (selectedProject?.id === projectId) {
        setSelectedProjectState(updatedProjects.length > 0 ? updatedProjects[0] : null);
      }
    } catch (err) {
      throw err;
    }
  };

  const addMemberToProject = async (projectId: string, input: AddMemberDto): Promise<ProjectMember> => {
    try {
      const sessionData = localStorage.getItem("auth_session");
      if (!sessionData) {
        throw new Error("No active session");
      }
      const session = JSON.parse(sessionData);
      const newMember = await addProjectMember(session.accessToken, projectId, input);
      
      // Update project members list if it's the selected project
      if (selectedProject?.id === projectId) {
        setProjectMembers([...projectMembers, newMember]);
      }
      
      return newMember;
    } catch (err) {
      throw err;
    }
  };

  const getProjectMembersDetails = async (projectId: string): Promise<ProjectMember[]> => {
    try {
      const sessionData = localStorage.getItem("auth_session");
      if (!sessionData) {
        throw new Error("No active session");
      }
      const session = JSON.parse(sessionData);
      const members = await getProjectMembers(session.accessToken, projectId);
      
      // Update state if it's the selected project
      if (selectedProject?.id === projectId) {
        setProjectMembers(members);
      }
      
      return members;
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
        projectMembers,
        setSelectedProject,
        loading,
        error,
        createNewProject,
        getProjectDetails,
        updateProjectDetails,
        deleteProjectById,
        addMemberToProject,
        getProjectMembersDetails,
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
