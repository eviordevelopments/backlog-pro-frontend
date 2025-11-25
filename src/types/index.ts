export type TaskStatus = "todo" | "in-progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TeamRole = "Product Owner" | "Scrum Master" | "Developer" | "DevOps";

// Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
  };
  accessToken: string;
  expiresAt: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export type DevOpsStage = 'plan' | 'code' | 'build' | 'test' | 'release' | 'deploy' | 'operate' | 'monitor';

export interface FinancialCategory {
  id: string;
  category: string;
  percentage: number;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  devops_stage?: DevOpsStage;
  budget?: number;
  spent?: number;
  financialStructure?: FinancialCategory[];
}

export interface Task {
  projectId: string;
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  storyPoints: number;
  assignedTo: string;
  estimatedDate: string;
  tags: string[];
  sprintId?: string;
  storyId?: string;
  createdAt: string;
  userId: string;
}

export interface AcceptanceCriteria {
  id: string;
  description: string;
  completed: boolean;
}

export interface UserStory {
  projectId: string;
  id: string;
  title: string;
  role: string;
  action: string;
  benefit: string;
  description: string;
  storyPoints: number;
  businessValue: number;
  acceptanceCriteria: AcceptanceCriteria[];
  sprintId?: string;
  createdAt: string;
  userId: string;
}

export interface Sprint {
  projectId: string;
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  velocity: number;
  committedPoints: number;
  completedPoints: number;
  status: "planned" | "active" | "completed";
  userId: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  skills: string[];
  availability: number;
  image: string;
  tasksCompleted: number;
  averageCycleTime: number;
  velocity: number;
}

export interface Risk {
  projectId: string;
  id: string;
  title: string;
  description: string;
  probability: number; // 1-5
  impact: number; // 1-5
  score: number;
  mitigation: string;
  owner: string;
  status: "open" | "mitigated" | "closed";
  userId: string;
}

export interface ProfitShare {
  projectId: string;
  memberId: string;
  memberName: string;
  percentage: number;
  amount: number;
  userId: string;
}

export interface KPIMetrics {
  velocity: number;
  cycleTime: number;
  sprintCompletionRate: number;
  deploymentFrequency: number;
  leadTime: number;
  mttr: number;
  changeFailureRate: number;
  teamSatisfaction: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  status: "active" | "inactive" | "churned";
  cac: number;
  ltv: number;
  mrr: number;
  npsScore?: number;
  projectIds: string[];
  createdAt: string;
  userId: string;
}

export interface VideoCallSession {
  id: string;
  title: string;
  description?: string;
  initiatorId: string;
  initiatorName: string;
  participantIds: string[];
  participants: Array<{
    id: string;
    name: string;
    status: "connected" | "disconnected" | "pending";
    joinedAt?: string;
  }>;
  startedAt: string;
  endedAt?: string;
  status: "active" | "ended" | "scheduled";
  projectId?: string;
  createdAt: string;
}
