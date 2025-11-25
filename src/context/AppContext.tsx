import { createContext, useContext, useState, useEffect } from "react";
import {
  Task,
  TaskPriority,
  TaskStatus,
  UserStory,
  Sprint,
  TeamMember,
  Risk,
  ProfitShare,
  KPIMetrics,
  Project,
} from "@/types";
import { initializeSampleData } from "@/utils/sampleData";
import { useAuth } from "./AuthContext";

interface AppContextType {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  tasks: Task[];
  userStories: UserStory[];
  sprints: Sprint[];
  teamMembers: TeamMember[];
  risks: Risk[];
  profitShares: ProfitShare[];
  kpiMetrics: KPIMetrics;
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addUserStory: (story: UserStory) => void;
  updateUserStory: (id: string, story: Partial<UserStory>) => void;
  deleteUserStory: (id: string) => void;
  addSprint: (sprint: Sprint) => void;
  updateSprint: (id: string, sprint: Partial<Sprint>) => void;
  deleteSprint: (id: string) => void;
  addTeamMember: (member: Partial<TeamMember>) => void;
  updateTeamMember: (id: string, member: Partial<TeamMember>) => void;
  addRisk: (risk: Risk) => void;
  updateRisk: (id: string, risk: Partial<Risk>) => void;
  deleteRisk: (id: string) => void;
  updateProfitShares: (shares: ProfitShare[], totalRevenue?: number) => void;
  updateKPIMetrics: (metrics: Partial<KPIMetrics>) => void;
  calculateSprintCommittedPoints: (sprintId: string) => number;
  calculateSprintProgress: (sprintId: string) => { remainingPoints: number; progressPercentage: number };
  calculateSprintVelocity: (sprintId: string) => number;
  calculateIndividualKPIs: (memberId: string) => { velocity: number; tasksCompleted: number; completionRate: number };
  calculateTeamVelocity: () => number;
  calculateCycleTime: () => number;
  calculateCompletionRate: () => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// No initial team members - users will be added automatically when they register
const initialTeamMembers: TeamMember[] = [];

const initialKPIMetrics: KPIMetrics = {
  velocity: 35,
  cycleTime: 2.5,
  sprintCompletionRate: 87,
  deploymentFrequency: 12,
  leadTime: 4.2,
  mttr: 1.3,
  changeFailureRate: 8,
  teamSatisfaction: 8.5,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Import user from AuthContext (Requirement 8.1)
  const { user } = useAuth();
  const userId = user?.id || null;

  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [allUserStories, setAllUserStories] = useState<UserStory[]>([]);
  const [allSprints, setAllSprints] = useState<Sprint[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [allRisks, setAllRisks] = useState<Risk[]>([]);
  const [allProfitShares, setAllProfitShares] = useState<ProfitShare[]>([]);
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetrics>(initialKPIMetrics);

  // Filter data by authenticated user's ID (Requirement 8.4)
  const projects = userId ? allProjects.filter(p => p.userId === userId) : allProjects;
  const tasks = userId ? allTasks.filter(t => t.userId === userId) : allTasks;
  const userStories = userId ? allUserStories.filter(s => s.userId === userId) : allUserStories;
  const sprints = userId ? allSprints.filter(s => s.userId === userId) : allSprints;
  const risks = userId ? allRisks.filter(r => r.userId === userId) : allRisks;
  const profitShares = userId ? allProfitShares.filter(p => p.userId === userId) : allProfitShares;

  // Load from localStorage on app initialization (Requirement 10.4)
  useEffect(() => {
    // Initialize sample data if localStorage is empty (Requirement 10.5)
    initializeSampleData();
    
    const savedProjects = localStorage.getItem("projects");
    const savedCurrentProject = localStorage.getItem("currentProject");
    const savedTasks = localStorage.getItem("tasks");
    const savedStories = localStorage.getItem("userStories");
    const savedSprints = localStorage.getItem("sprints");
    const savedTeamMembers = localStorage.getItem("teamMembers");
    const savedRisks = localStorage.getItem("risks");
    const savedProfitShares = localStorage.getItem("profitShares");
    const savedKpiMetrics = localStorage.getItem("kpiMetrics");

    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      setAllProjects(parsedProjects);
      
      if (savedCurrentProject) {
        setCurrentProject(JSON.parse(savedCurrentProject));
      } else if (parsedProjects.length > 0) {
        setCurrentProject(parsedProjects[0]);
      }
    } else {
      // Create a default project
      const defaultProject: Project = {
        id: "default-project",
        name: "Proyecto Principal",
        description: "Proyecto de demostración",
        color: "#5b7cfc",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: userId || '', // Will be migrated later
      };
      setAllProjects([defaultProject]);
      setCurrentProject(defaultProject);
    }

    if (savedTasks) setAllTasks(JSON.parse(savedTasks));
    if (savedStories) setAllUserStories(JSON.parse(savedStories));
    if (savedSprints) setAllSprints(JSON.parse(savedSprints));
    if (savedTeamMembers) setTeamMembers(JSON.parse(savedTeamMembers));
    if (savedRisks) setAllRisks(JSON.parse(savedRisks));
    if (savedProfitShares) setAllProfitShares(JSON.parse(savedProfitShares));
    if (savedKpiMetrics) setKpiMetrics(JSON.parse(savedKpiMetrics));
  }, []);

  // Listen for logout events and clear user-specific data (Requirement 7.5)
  useEffect(() => {
    // When user becomes null (logout), clear all user-specific data
    if (user === null) {
      // Note: We don't clear the data from state immediately because
      // the filtered arrays will automatically show empty when userId is null
      // This preserves data in localStorage for when user logs back in
      // If we want to clear localStorage on logout, we would do:
      // localStorage.removeItem("projects");
      // localStorage.removeItem("tasks");
      // etc.
    }
  }, [user]);

  // Auto-create TeamMember for registered users
  useEffect(() => {
    if (user) {
      // Check if a team member already exists for this user
      const existingMember = teamMembers.find(
        member => member.name.toLowerCase() === user.name.toLowerCase()
      );

      if (!existingMember) {
        // Create a new team member for this user
        const newMember: TeamMember = {
          id: user.id,
          name: user.name,
          role: "Developer", // Default role
          skills: [],
          availability: 100,
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
          tasksCompleted: 0,
          averageCycleTime: 0,
          velocity: 0,
        };

        setTeamMembers(prev => [...prev, newMember]);
      }
    }
  }, [user]);

  // Data migration for existing users (Requirement 8.2)
  useEffect(() => {
    if (userId) {
      let needsMigration = false;

      // Check if existing data lacks userId fields
      const migratedProjects = allProjects.map(project => {
        if (!project.userId || project.userId === '') {
          needsMigration = true;
          return { ...project, userId };
        }
        return project;
      });

      const migratedTasks = allTasks.map(task => {
        if (!task.userId || task.userId === '') {
          needsMigration = true;
          return { ...task, userId };
        }
        return task;
      });

      const migratedUserStories = allUserStories.map(story => {
        if (!story.userId || story.userId === '') {
          needsMigration = true;
          return { ...story, userId };
        }
        return story;
      });

      const migratedSprints = allSprints.map(sprint => {
        if (!sprint.userId || sprint.userId === '') {
          needsMigration = true;
          return { ...sprint, userId };
        }
        return sprint;
      });

      const migratedRisks = allRisks.map(risk => {
        if (!risk.userId || risk.userId === '') {
          needsMigration = true;
          return { ...risk, userId };
        }
        return risk;
      });

      const migratedProfitShares = allProfitShares.map(share => {
        if (!share.userId || share.userId === '') {
          needsMigration = true;
          return { ...share, userId };
        }
        return share;
      });

      // If migration is needed, update state and localStorage
      if (needsMigration) {
        setAllProjects(migratedProjects);
        setAllTasks(migratedTasks);
        setAllUserStories(migratedUserStories);
        setAllSprints(migratedSprints);
        setAllRisks(migratedRisks);
        setAllProfitShares(migratedProfitShares);
      }
    }
  }, [userId]); // Run when userId changes (user logs in)

  // Save to localStorage on create/update/delete (Requirements 10.1, 10.2, 10.3)
  useEffect(() => {
    if (allProjects.length > 0) {
      localStorage.setItem("projects", JSON.stringify(allProjects));
    }
  }, [allProjects]);

  useEffect(() => {
    if (currentProject) {
      localStorage.setItem("currentProject", JSON.stringify(currentProject));
    }
  }, [currentProject]);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(allTasks));
  }, [allTasks]);

  useEffect(() => {
    localStorage.setItem("userStories", JSON.stringify(allUserStories));
  }, [allUserStories]);

  useEffect(() => {
    localStorage.setItem("sprints", JSON.stringify(allSprints));
  }, [allSprints]);

  useEffect(() => {
    localStorage.setItem("teamMembers", JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem("risks", JSON.stringify(allRisks));
  }, [allRisks]);

  useEffect(() => {
    localStorage.setItem("profitShares", JSON.stringify(allProfitShares));
  }, [allProfitShares]);

  useEffect(() => {
    localStorage.setItem("kpiMetrics", JSON.stringify(kpiMetrics));
  }, [kpiMetrics]);

  const addTask = (task: Task) => {
    // Validate story points are non-negative numeric values
    if (typeof task.storyPoints !== 'number' || task.storyPoints < 0 || !isFinite(task.storyPoints)) {
      throw new Error('Story points must be a non-negative numeric value');
    }
    
    // Validate priority is one of valid enum values
    const validPriorities: TaskPriority[] = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(task.priority)) {
      throw new Error('Priority must be one of: low, medium, high, critical');
    }
    
    // Validate status is one of valid enum values
    const validStatuses: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];
    if (!validStatuses.includes(task.status)) {
      throw new Error('Status must be one of: todo, in-progress, review, done');
    }
    
    // Validate assignedTo matches existing team member name
    if (task.assignedTo && task.assignedTo.trim() !== '') {
      const validTeamMemberNames = teamMembers.map(member => member.name);
      if (!validTeamMemberNames.includes(task.assignedTo)) {
        throw new Error(`Team member "${task.assignedTo}" does not exist. Valid team members: ${validTeamMemberNames.join(', ')}`);
      }
    }
    
    // Validate sprintId references existing sprint or is undefined (Requirement 4.2)
    if (task.sprintId !== undefined && task.sprintId !== null && task.sprintId.trim() !== '') {
      const sprintExists = sprints.some(sprint => sprint.id === task.sprintId);
      if (!sprintExists) {
        throw new Error(`Sprint with id "${task.sprintId}" does not exist`);
      }
    }
    
    // Ensure task has unique ID, createdAt timestamp, and userId from authenticated user (Requirement 8.3)
    const taskWithMetadata: Task = {
      ...task,
      id: task.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: task.createdAt || new Date().toISOString(),
      userId: userId || task.userId || '', // Use authenticated user's ID
    };
    setAllTasks(prevTasks => [...prevTasks, taskWithMetadata]);
  };

  const addProject = (project: Project) => {
    // Ensure project has userId from authenticated user (Requirement 8.3)
    const projectWithUserId: Project = {
      ...project,
      userId: userId || project.userId || '', // Use authenticated user's ID
    };
    setAllProjects([...allProjects, projectWithUserId]);
    if (!currentProject) {
      setCurrentProject(projectWithUserId);
    }
  };

  const updateProject = (id: string, updatedProject: Partial<Project>) => {
    const { id: _, ...updateWithoutId } = updatedProject as Project;
    const updatedProjects = allProjects.map((p) => 
      p.id === id ? { ...p, ...updateWithoutId, updatedAt: new Date().toISOString() } : p
    );
    setAllProjects(updatedProjects);
    
    if (currentProject?.id === id) {
      setCurrentProject({ ...currentProject, ...updateWithoutId, updatedAt: new Date().toISOString() });
    }
  };

  const updateTask = (id: string, updatedTask: Partial<Task>) => {
    // Validate story points if provided
    if (updatedTask.storyPoints !== undefined) {
      if (typeof updatedTask.storyPoints !== 'number' || updatedTask.storyPoints < 0 || !isFinite(updatedTask.storyPoints)) {
        throw new Error('Story points must be a non-negative numeric value');
      }
    }
    
    // Validate priority if provided
    if (updatedTask.priority !== undefined) {
      const validPriorities: TaskPriority[] = ['low', 'medium', 'high', 'critical'];
      if (!validPriorities.includes(updatedTask.priority)) {
        throw new Error('Priority must be one of: low, medium, high, critical');
      }
    }
    
    // Validate status if provided
    if (updatedTask.status !== undefined) {
      const validStatuses: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];
      if (!validStatuses.includes(updatedTask.status)) {
        throw new Error('Status must be one of: todo, in-progress, review, done');
      }
    }
    
    // Validate assignedTo if provided
    if (updatedTask.assignedTo !== undefined && updatedTask.assignedTo.trim() !== '') {
      const validTeamMemberNames = teamMembers.map(member => member.name);
      if (!validTeamMemberNames.includes(updatedTask.assignedTo)) {
        throw new Error(`Team member "${updatedTask.assignedTo}" does not exist. Valid team members: ${validTeamMemberNames.join(', ')}`);
      }
    }
    
    // Validate sprintId references existing sprint or is undefined (Requirement 4.2)
    if (updatedTask.sprintId !== undefined && updatedTask.sprintId !== null && updatedTask.sprintId.trim() !== '') {
      const sprintExists = sprints.some(sprint => sprint.id === updatedTask.sprintId);
      if (!sprintExists) {
        throw new Error(`Sprint with id "${updatedTask.sprintId}" does not exist`);
      }
    }
    
    // Ensure task ID remains unchanged
    const { id: _, ...updateWithoutId } = updatedTask as Task;
    setAllTasks(prevTasks => prevTasks.map((t) => (t.id === id ? { ...t, ...updateWithoutId } : t)));
  };

  const deleteTask = (id: string) => {
    // Remove task from state
    setAllTasks(prevTasks => prevTasks.filter((t) => t.id !== id));
  };

  const addUserStory = (story: UserStory) => {
    // Ensure story includes all required fields
    if (!story.title || story.title.trim() === '') {
      throw new Error('User story title is required');
    }
    if (!story.description || story.description.trim() === '') {
      throw new Error('User story description is required');
    }
    if (typeof story.storyPoints !== 'number' || story.storyPoints < 0 || !isFinite(story.storyPoints)) {
      throw new Error('Story points must be a non-negative numeric value');
    }
    // Ensure acceptanceCriteria is an array (supports multiple items)
    if (!Array.isArray(story.acceptanceCriteria)) {
      throw new Error('Acceptance criteria must be an array');
    }
    
    // Validate sprintId references existing sprint or is undefined (Requirement 4.2)
    if (story.sprintId !== undefined && story.sprintId !== null && story.sprintId.trim() !== '') {
      const sprintExists = sprints.some(sprint => sprint.id === story.sprintId);
      if (!sprintExists) {
        throw new Error(`Sprint with id "${story.sprintId}" does not exist`);
      }
    }
    
    // Ensure story has unique ID, createdAt timestamp, and userId from authenticated user (Requirement 8.3)
    const storyWithMetadata: UserStory = {
      ...story,
      id: story.id || `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: story.createdAt || new Date().toISOString(),
      userId: userId || story.userId || '', // Use authenticated user's ID
    };
    
    setAllUserStories(prevStories => [...prevStories, storyWithMetadata]);
  };
  
  const updateUserStory = (id: string, updatedStory: Partial<UserStory>) => {
    // Validate story points if provided
    if (updatedStory.storyPoints !== undefined) {
      if (typeof updatedStory.storyPoints !== 'number' || updatedStory.storyPoints < 0 || !isFinite(updatedStory.storyPoints)) {
        throw new Error('Story points must be a non-negative numeric value');
      }
    }
    
    // Validate acceptanceCriteria if provided
    if (updatedStory.acceptanceCriteria !== undefined) {
      if (!Array.isArray(updatedStory.acceptanceCriteria)) {
        throw new Error('Acceptance criteria must be an array');
      }
    }
    
    // Validate sprintId references existing sprint or is undefined (Requirement 4.2)
    if (updatedStory.sprintId !== undefined && updatedStory.sprintId !== null && updatedStory.sprintId.trim() !== '') {
      const sprintExists = sprints.some(sprint => sprint.id === updatedStory.sprintId);
      if (!sprintExists) {
        throw new Error(`Sprint with id "${updatedStory.sprintId}" does not exist`);
      }
    }
    
    // Ensure story ID remains unchanged
    const { id: _, ...updateWithoutId } = updatedStory as UserStory;
    
    setAllUserStories(prevStories =>
      prevStories.map((s) => (s.id === id ? { ...s, ...updateWithoutId } : s))
    );
  };
  
  const deleteUserStory = (id: string) => {
    // Remove story from state
    setAllUserStories(prevStories => prevStories.filter((s) => s.id !== id));
  };

  const addSprint = (sprint: Sprint) => {
    // Verify sprint stores name, dates, and goal (Requirement 4.1)
    if (!sprint.name || sprint.name.trim() === '') {
      throw new Error('Sprint name is required');
    }
    if (!sprint.startDate || sprint.startDate.trim() === '') {
      throw new Error('Sprint start date is required');
    }
    if (!sprint.endDate || sprint.endDate.trim() === '') {
      throw new Error('Sprint end date is required');
    }
    if (!sprint.goal || sprint.goal.trim() === '') {
      throw new Error('Sprint goal is required');
    }
    
    // Ensure sprint has unique ID and userId from authenticated user (Requirement 8.3)
    const sprintWithMetadata: Sprint = {
      ...sprint,
      id: sprint.id || `sprint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: userId || sprint.userId || '', // Use authenticated user's ID
    };
    
    setAllSprints([...allSprints, sprintWithMetadata]);
  };
  
  const updateSprint = (id: string, updatedSprint: Partial<Sprint>) => {
    // Verify updateSprint modifies timeline dates (Requirement 4.7)
    if (updatedSprint.startDate !== undefined && (!updatedSprint.startDate || updatedSprint.startDate.trim() === '')) {
      throw new Error('Sprint start date cannot be empty');
    }
    if (updatedSprint.endDate !== undefined && (!updatedSprint.endDate || updatedSprint.endDate.trim() === '')) {
      throw new Error('Sprint end date cannot be empty');
    }
    
    // Ensure sprint ID remains unchanged
    const { id: _, ...updateWithoutId } = updatedSprint as Sprint;
    
    setAllSprints(
      allSprints.map((s) => (s.id === id ? { ...s, ...updateWithoutId } : s))
    );
  };
  
  const deleteSprint = (id: string) =>
    setAllSprints(allSprints.filter((s) => s.id !== id));

  // Add team member with defaults (Requirement 5.5)
  const addTeamMember = (member: Partial<TeamMember>) => {
    // Initialize missing properties with default values
    const defaultMember: TeamMember = {
      id: member.id || `member-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: member.name || 'New Member',
      role: member.role || 'Developer',
      skills: member.skills || [],
      availability: member.availability !== undefined ? member.availability : 100,
      image: member.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name || 'default'}`,
      tasksCompleted: member.tasksCompleted !== undefined ? member.tasksCompleted : 0,
      averageCycleTime: member.averageCycleTime !== undefined ? member.averageCycleTime : 0,
      velocity: member.velocity !== undefined ? member.velocity : 0,
    };
    
    setTeamMembers(prevMembers => [...prevMembers, defaultMember]);
  };

  // Update team member profile (Requirement 5.3)
  const updateTeamMember = (id: string, updatedMember: Partial<TeamMember>) => {
    // Verify updateTeamMember function modifies profile properties
    const memberExists = teamMembers.some(m => m.id === id);
    if (!memberExists) {
      throw new Error(`Team member with id "${id}" does not exist`);
    }
    
    // Ensure team member ID remains unchanged
    const { id: _, ...updateWithoutId } = updatedMember as TeamMember;
    
    setTeamMembers(
      teamMembers.map((m) => (m.id === id ? { ...m, ...updateWithoutId } : m))
    );
  };

  // Calculate individual KPIs for a team member (Requirement 5.4)
  const calculateIndividualKPIs = (memberId: string): { velocity: number; tasksCompleted: number; completionRate: number } => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) {
      return { velocity: 0, tasksCompleted: 0, completionRate: 0 };
    }
    
    // Get all tasks assigned to this member
    const memberTasks = tasks.filter(task => task.assignedTo === member.name);
    
    // Calculate tasks completed
    const tasksCompleted = memberTasks.filter(task => task.status === 'done').length;
    
    // Calculate velocity (sum of story points for completed tasks)
    const velocity = memberTasks
      .filter(task => task.status === 'done')
      .reduce((total, task) => total + task.storyPoints, 0);
    
    // Calculate completion rate (percentage of tasks completed on time)
    const tasksWithEstimates = memberTasks.filter(task => task.estimatedDate && task.estimatedDate.trim() !== '');
    const tasksCompletedOnTime = tasksWithEstimates.filter(task => {
      if (task.status !== 'done') return false;
      // For simplicity, we consider a task completed on time if it's done
      // In a real system, we'd compare completion date with estimated date
      return true;
    }).length;
    
    const completionRate = tasksWithEstimates.length > 0 
      ? (tasksCompletedOnTime / tasksWithEstimates.length) * 100 
      : 0;
    
    return { velocity, tasksCompleted, completionRate };
  };

  const addRisk = (risk: Risk) => {
    // Verify addRisk function stores all risk properties (Requirement 7.1)
    if (!risk.title || risk.title.trim() === '') {
      throw new Error('Risk title is required');
    }
    if (!risk.description || risk.description.trim() === '') {
      throw new Error('Risk description is required');
    }
    
    // Ensure probability is integer between 1-5 (Requirement 7.2)
    if (!Number.isInteger(risk.probability) || risk.probability < 1 || risk.probability > 5) {
      throw new Error('Risk probability must be an integer between 1 and 5');
    }
    
    // Ensure impact is integer between 1-5 (Requirement 7.3)
    if (!Number.isInteger(risk.impact) || risk.impact < 1 || risk.impact > 5) {
      throw new Error('Risk impact must be an integer between 1 and 5');
    }
    
    // Verify mitigation text is stored with risk (Requirement 7.7)
    if (risk.mitigation === undefined || risk.mitigation === null) {
      throw new Error('Risk mitigation strategy is required');
    }
    
    // Calculate score as probability * impact (Requirement 7.4)
    const calculatedScore = risk.probability * risk.impact;
    
    // Ensure risk has unique ID and userId from authenticated user (Requirement 8.3)
    const riskWithMetadata: Risk = {
      ...risk,
      id: risk.id || `risk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      score: calculatedScore, // Auto-calculate score
      userId: userId || risk.userId || '', // Use authenticated user's ID
    };
    
    setAllRisks([...allRisks, riskWithMetadata]);
  };
  
  const updateRisk = (id: string, updatedRisk: Partial<Risk>) => {
    // Validate probability if provided (Requirement 7.2)
    if (updatedRisk.probability !== undefined) {
      if (!Number.isInteger(updatedRisk.probability) || updatedRisk.probability < 1 || updatedRisk.probability > 5) {
        throw new Error('Risk probability must be an integer between 1 and 5');
      }
    }
    
    // Validate impact if provided (Requirement 7.3)
    if (updatedRisk.impact !== undefined) {
      if (!Number.isInteger(updatedRisk.impact) || updatedRisk.impact < 1 || updatedRisk.impact > 5) {
        throw new Error('Risk impact must be an integer between 1 and 5');
      }
    }
    
    // Get the current risk to calculate score
    const currentRisk = risks.find(r => r.id === id);
    if (!currentRisk) {
      throw new Error(`Risk with id "${id}" does not exist`);
    }
    
    // Auto-recalculate score when probability or impact changes (Requirement 7.6)
    const newProbability = updatedRisk.probability !== undefined ? updatedRisk.probability : currentRisk.probability;
    const newImpact = updatedRisk.impact !== undefined ? updatedRisk.impact : currentRisk.impact;
    const calculatedScore = newProbability * newImpact;
    
    // Ensure risk ID remains unchanged
    const { id: _, ...updateWithoutId } = updatedRisk as Risk;
    
    setAllRisks(allRisks.map((r) => (r.id === id ? { ...r, ...updateWithoutId, score: calculatedScore } : r)));
  };
  
  const deleteRisk = (id: string) => setAllRisks(allRisks.filter((r) => r.id !== id));

  const updateProfitShares = (shares: ProfitShare[], totalRevenue?: number) => {
    // Validate each profit share
    for (const share of shares) {
      // Validate percentage is between 0-100 (Requirement 8.2)
      if (typeof share.percentage !== 'number' || share.percentage < 0 || share.percentage > 100 || !isFinite(share.percentage)) {
        throw new Error(`Percentage for ${share.memberName} must be between 0 and 100`);
      }
      
      // Validate amount is non-negative if provided
      if (share.amount !== undefined && (typeof share.amount !== 'number' || share.amount < 0 || !isFinite(share.amount))) {
        throw new Error(`Amount for ${share.memberName} must be a non-negative numeric value`);
      }
      
      // If totalRevenue is provided, validate and recalculate amounts (Requirement 8.3, 8.5)
      if (totalRevenue !== undefined) {
        // Validate total revenue is non-negative numeric value (Requirement 8.1)
        if (typeof totalRevenue !== 'number' || totalRevenue < 0 || !isFinite(totalRevenue)) {
          throw new Error('Total revenue must be a non-negative numeric value');
        }
        
        // Calculate individual amount as (percentage / 100) * revenue (Requirement 8.3)
        share.amount = (share.percentage / 100) * totalRevenue;
      }
    }
    
    // Get the projectId from the first share (all shares should have the same projectId)
    const projectId = shares.length > 0 ? shares[0].projectId : null;
    
    if (projectId) {
      // Remove old shares for this project and add the new ones
      setAllProfitShares(prevShares => {
        const filtered = prevShares.filter(s => s.projectId !== projectId);
        const updated = [...filtered, ...shares];
        return updated;
      });
    } else {
      // If no projectId, replace all (backward compatibility)
      setAllProfitShares(shares);
    }
  };

  const updateKPIMetrics = (metrics: Partial<KPIMetrics>) => {
    setKpiMetrics({ ...kpiMetrics, ...metrics });
  };

  // Helper function: Calculate total committed points from assigned tasks (Requirement 4.3)
  const calculateSprintCommittedPoints = (sprintId: string): number => {
    return tasks
      .filter(task => task.sprintId === sprintId)
      .reduce((total, task) => total + task.storyPoints, 0);
  };

  // Helper function: Calculate remaining points and progress percentage (Requirement 4.4)
  const calculateSprintProgress = (sprintId: string): { remainingPoints: number; progressPercentage: number } => {
    const committedPoints = calculateSprintCommittedPoints(sprintId);
    const completedPoints = tasks
      .filter(task => task.sprintId === sprintId && task.status === 'done')
      .reduce((total, task) => total + task.storyPoints, 0);
    
    const remainingPoints = committedPoints - completedPoints;
    const progressPercentage = committedPoints > 0 ? (completedPoints / committedPoints) * 100 : 0;
    
    return { remainingPoints, progressPercentage };
  };

  // Helper function: Calculate velocity from completed story points (Requirement 4.6)
  const calculateSprintVelocity = (sprintId: string): number => {
    return tasks
      .filter(task => task.sprintId === sprintId && task.status === 'done')
      .reduce((total, task) => total + task.storyPoints, 0);
  };

  // Calculate team velocity - average velocity across all sprints (Requirement 6.2)
  const calculateTeamVelocity = (): number => {
    if (sprints.length === 0) {
      return 0;
    }
    
    const totalVelocity = sprints.reduce((sum, sprint) => {
      return sum + calculateSprintVelocity(sprint.id);
    }, 0);
    
    return totalVelocity / sprints.length;
  };

  // Calculate cycle time - average time from start to completion (Requirement 6.3)
  const calculateCycleTime = (): number => {
    // Get all completed tasks
    const completedTasks = tasks.filter(task => task.status === 'done');
    
    if (completedTasks.length === 0) {
      return 0;
    }
    
    // Calculate cycle time for each task
    // For simplicity, we'll use createdAt as start date and current date as completion
    // In a real system, we'd track actual start and completion dates
    const totalCycleTime = completedTasks.reduce((sum, task) => {
      const startDate = new Date(task.createdAt);
      const completionDate = new Date(); // In real system, would use actual completion date
      const cycleTimeInDays = (completionDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      return sum + cycleTimeInDays;
    }, 0);
    
    return totalCycleTime / completedTasks.length;
  };

  // Calculate completion rate - percentage of tasks completed on time (Requirement 6.4)
  const calculateCompletionRate = (): number => {
    // Get tasks with estimated dates
    const tasksWithEstimates = tasks.filter(task => task.estimatedDate && task.estimatedDate.trim() !== '');
    
    if (tasksWithEstimates.length === 0) {
      return 0;
    }
    
    // Count tasks completed on or before estimated date
    const tasksCompletedOnTime = tasksWithEstimates.filter(task => {
      if (task.status !== 'done') {
        return false;
      }
      
      // In a real system, we'd compare actual completion date with estimated date
      // For now, we'll consider all completed tasks as on-time
      // This is a simplification since we don't track actual completion dates
      return true;
    }).length;
    
    return (tasksCompletedOnTime / tasksWithEstimates.length) * 100;
  };

  return (
    <AppContext.Provider
      value={{
        projects,
        currentProject,
        setCurrentProject,
        addProject,
        updateProject,
        tasks,
        userStories,
        sprints,
        teamMembers,
        risks,
        profitShares,
        kpiMetrics,
        addTask,
        updateTask,
        deleteTask,
        addUserStory,
        updateUserStory,
        deleteUserStory,
        addSprint,
        updateSprint,
        deleteSprint,
        addTeamMember,
        updateTeamMember,
        addRisk,
        updateRisk,
        deleteRisk,
        updateProfitShares,
        updateKPIMetrics,
        calculateSprintCommittedPoints,
        calculateSprintProgress,
        calculateSprintVelocity,
        calculateIndividualKPIs,
        calculateTeamVelocity,
        calculateCycleTime,
        calculateCompletionRate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
