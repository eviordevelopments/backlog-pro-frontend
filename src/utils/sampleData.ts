import { Task, UserStory, Sprint, Risk, FinancialRecord, BudgetAllocation, FundAccount } from "@/types";

const DEFAULT_PROJECT_ID = "default-project";
const DEFAULT_USER_ID = "default-user";

export const sampleTasks: Task[] = [
  {
    projectId: DEFAULT_PROJECT_ID,
    id: "1",
    title: "Implement user authentication",
    description: "Add JWT-based authentication with refresh tokens",
    status: "in-progress",
    priority: "high",
    storyPoints: 8,
    assignedTo: "Morena",
    estimatedDate: "2025-12-15",
    tags: ["backend", "security"],
    sprintId: "1",
    createdAt: "2025-11-01T10:00:00Z",
  },
  {
    projectId: DEFAULT_PROJECT_ID,
    id: "2",
    title: "Design dashboard UI",
    description: "Create glassmorphic dashboard with KPI cards",
    status: "review",
    priority: "high",
    storyPoints: 5,
    assignedTo: "Morena",
    estimatedDate: "2025-12-12",
    tags: ["frontend", "design"],
    sprintId: "1",
    createdAt: "2025-11-02T10:00:00Z",
  },
  {
    projectId: DEFAULT_PROJECT_ID,
    id: "3",
    title: "Setup CI/CD pipeline",
    description: "Configure GitHub Actions for automated deployments",
    status: "done",
    priority: "critical",
    storyPoints: 13,
    assignedTo: "Franco",
    estimatedDate: "2025-12-10",
    tags: ["devops", "infrastructure"],
    sprintId: "1",
    createdAt: "2025-11-03T10:00:00Z",
  },
  {
    projectId: DEFAULT_PROJECT_ID,
    id: "4",
    title: "Write API documentation",
    description: "Document all REST endpoints with OpenAPI spec",
    status: "todo",
    priority: "medium",
    storyPoints: 3,
    assignedTo: "David",
    estimatedDate: "2025-12-18",
    tags: ["documentation"],
    sprintId: "1",
    createdAt: "2025-11-04T10:00:00Z",
  },
  {
    projectId: DEFAULT_PROJECT_ID,
    id: "5",
    title: "Implement drag and drop kanban",
    description: "Add drag and drop functionality to the kanban board",
    status: "in-progress",
    priority: "high",
    storyPoints: 8,
    assignedTo: "Morena",
    estimatedDate: "2025-12-20",
    tags: ["frontend", "feature"],
    createdAt: "2025-11-05T10:00:00Z",
  },
  {
    projectId: DEFAULT_PROJECT_ID,
    id: "6",
    title: "Setup monitoring and alerts",
    description: "Configure Prometheus and Grafana for system monitoring",
    status: "todo",
    priority: "medium",
    storyPoints: 5,
    assignedTo: "Franco",
    estimatedDate: "2025-12-25",
    tags: ["devops", "monitoring"],
    createdAt: "2025-11-06T10:00:00Z",
  },
];

export const sampleUserStories: UserStory[] = [
  {
    projectId: DEFAULT_PROJECT_ID,
    id: "1",
    title: "User Registration and Login",
    role: "User",
    action: "register and login securely",
    benefit: "I can access my personalized dashboard",
    description: "Complete authentication flow with email verification",
    storyPoints: 13,
    businessValue: 90,
    acceptanceCriteria: [
      {
        id: "1",
        description: "User can register with email and password",
        completed: true,
      },
      {
        id: "2",
        description: "Email verification is sent and validated",
        completed: true,
      },
      {
        id: "3",
        description: "User can login with valid credentials",
        completed: false,
      },
      {
        id: "4",
        description: "JWT tokens are issued and refreshed properly",
        completed: false,
      },
    ],
    sprintId: "1",
    createdAt: "2025-11-01T10:00:00Z",
  },
  {
    projectId: DEFAULT_PROJECT_ID,
    id: "2",
    title: "Interactive Dashboard",
    role: "Product Manager",
    action: "view real-time KPIs and metrics",
    benefit: "I can make data-driven decisions quickly",
    description: "Dashboard with charts, graphs, and key performance indicators",
    storyPoints: 8,
    businessValue: 85,
    acceptanceCriteria: [
      {
        id: "1",
        description: "Display velocity trend chart",
        completed: true,
      },
      {
        id: "2",
        description: "Show task distribution pie chart",
        completed: true,
      },
      {
        id: "3",
        description: "Show team performance metrics",
        completed: false,
      },
    ],
    sprintId: "1",
    createdAt: "2025-11-02T10:00:00Z",
  },
  {
    projectId: DEFAULT_PROJECT_ID,
    id: "3",
    title: "Kanban Board with Drag & Drop",
    role: "Scrum Master",
    action: "manage tasks visually through drag and drop",
    benefit: "I can update task statuses efficiently",
    description: "Interactive kanban board with drag-and-drop functionality",
    storyPoints: 13,
    businessValue: 75,
    acceptanceCriteria: [
      {
        id: "1",
        description: "Tasks can be dragged between columns",
        completed: false,
      },
      {
        id: "2",
        description: "Status updates are persisted",
        completed: false,
      },
      {
        id: "3",
        description: "Visual feedback during drag operations",
        completed: false,
      },
      {
        id: "4",
        description: "Touch support for mobile devices",
        completed: false,
      },
    ],
    createdAt: "2025-11-03T10:00:00Z",
  },
];

export const sampleSprints: Sprint[] = [
  {
    projectId: DEFAULT_PROJECT_ID,
    id: "1",
    name: "Sprint 1 - Foundation",
    goal: "Establish core infrastructure and authentication",
    startDate: "2025-11-01",
    endDate: "2025-11-14",
    velocity: 35,
    committedPoints: 29,
    completedPoints: 26,
    status: "active",
  },
  {
    projectId: DEFAULT_PROJECT_ID,
    id: "2",
    name: "Sprint 2 - Core Features",
    goal: "Implement main dashboard and kanban board",
    startDate: "2025-11-15",
    endDate: "2025-11-28",
    velocity: 35,
    committedPoints: 0,
    completedPoints: 0,
    status: "planned",
  },
];

export const sampleRisks: Risk[] = [
  {
    projectId: DEFAULT_PROJECT_ID,
    id: "1",
    title: "Authentication Security Vulnerabilities",
    description: "Potential security issues in JWT implementation",
    probability: 3,
    impact: 5,
    score: 15,
    mitigation: "Code review, security audit, penetration testing",
    owner: "Morena",
    status: "open",
  },
  {
    projectId: DEFAULT_PROJECT_ID,
    id: "2",
    title: "Performance Issues with Large Datasets",
    description: "Dashboard may slow down with extensive historical data",
    probability: 4,
    impact: 3,
    score: 12,
    mitigation: "Implement pagination, data virtualization, and caching",
    owner: "Franco",
    status: "mitigated",
  },
  {
    projectId: DEFAULT_PROJECT_ID,
    id: "3",
    title: "Browser Compatibility",
    description: "Drag and drop may not work consistently across browsers",
    probability: 2,
    impact: 3,
    score: 6,
    mitigation: "Use well-tested library, comprehensive browser testing",
    owner: "Morena",
    status: "open",
  },
  {
    projectId: DEFAULT_PROJECT_ID,
    id: "4",
    title: "Third-party API Dependency",
    description: "External services may experience downtime",
    probability: 3,
    impact: 4,
    score: 12,
    mitigation: "Implement fallback mechanisms and error handling",
    owner: "David",
    status: "open",
  },
];

export const sampleFinancialRecords: FinancialRecord[] = [
  {
    id: "rec-1",
    date: "2025-11-01",
    type: "income",
    category: "Project Revenue",
    amount: 5000,
    projectId: DEFAULT_PROJECT_ID,
    costType: undefined,
    description: "Client payment for Q4 services",
    userId: DEFAULT_USER_ID,
  },
  {
    id: "rec-2",
    date: "2025-11-02",
    type: "expense",
    category: "Salaries",
    amount: 8000,
    projectId: DEFAULT_PROJECT_ID,
    costType: "fixed",
    description: "Monthly team salaries",
    userId: DEFAULT_USER_ID,
  },
  {
    id: "rec-3",
    date: "2025-11-03",
    type: "expense",
    category: "Infrastructure",
    amount: 1200,
    projectId: DEFAULT_PROJECT_ID,
    costType: "fixed",
    description: "Cloud hosting and services",
    userId: DEFAULT_USER_ID,
  },
  {
    id: "rec-4",
    date: "2025-11-05",
    type: "expense",
    category: "Marketing",
    amount: 2000,
    projectId: DEFAULT_PROJECT_ID,
    costType: "variable",
    description: "Social media advertising",
    userId: DEFAULT_USER_ID,
  },
  {
    id: "rec-5",
    date: "2025-11-08",
    type: "income",
    category: "Project Revenue",
    amount: 3500,
    projectId: DEFAULT_PROJECT_ID,
    costType: undefined,
    description: "Additional milestone payment",
    userId: DEFAULT_USER_ID,
  },
];

export const sampleBudgetAllocations: BudgetAllocation[] = [
  {
    id: "alloc-1",
    totalBudget: 50000,
    allocations: {
      technology: 12500,
      growth: 10000,
      team: 15000,
      marketing: 7500,
      emergency: 2500,
      investments: 2500,
    },
    createdAt: "2025-11-01T10:00:00Z",
    status: "distributed",
    userId: DEFAULT_USER_ID,
  },
];

export const sampleFundAccounts: FundAccount[] = [
  {
    id: "fund-1",
    name: "Tech Infrastructure",
    balance: 12500,
    allocated: 2000,
    percentage: 25,
    purpose: "Technology fund for infrastructure and tools",
    allocationCategory: "Technology",
  },
  {
    id: "fund-2",
    name: "Market Expansion",
    balance: 10000,
    allocated: 3000,
    percentage: 20,
    purpose: "Growth fund for business expansion",
    allocationCategory: "Growth",
  },
  {
    id: "fund-3",
    name: "Payroll & Benefits",
    balance: 15000,
    allocated: 8000,
    percentage: 30,
    purpose: "Team fund for salaries and benefits",
    allocationCategory: "Team",
  },
  {
    id: "fund-4",
    name: "Campaign Budget",
    balance: 7500,
    allocated: 2000,
    percentage: 15,
    purpose: "Marketing fund for campaigns and advertising",
    allocationCategory: "Marketing",
  },
  {
    id: "fund-5",
    name: "Contingency Reserve",
    balance: 2500,
    allocated: 0,
    percentage: 5,
    purpose: "Emergency fund for unexpected expenses",
    allocationCategory: "Emergency",
  },
  {
    id: "fund-6",
    name: "Growth Investments",
    balance: 2500,
    allocated: 500,
    percentage: 5,
    purpose: "Investments fund for future opportunities",
    allocationCategory: "Investments",
  },
];

export const initializeSampleData = () => {
  // Initialize sample data only if localStorage is empty (Requirement 10.5)
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(sampleTasks));
  }
  
  if (!localStorage.getItem("userStories")) {
    localStorage.setItem("userStories", JSON.stringify(sampleUserStories));
  }
  
  if (!localStorage.getItem("sprints")) {
    localStorage.setItem("sprints", JSON.stringify(sampleSprints));
  }
  
  if (!localStorage.getItem("risks")) {
    localStorage.setItem("risks", JSON.stringify(sampleRisks));
  }

  if (!localStorage.getItem("financialRecords")) {
    localStorage.setItem("financialRecords", JSON.stringify(sampleFinancialRecords));
  }

  if (!localStorage.getItem("budgetAllocations")) {
    localStorage.setItem("budgetAllocations", JSON.stringify(sampleBudgetAllocations));
  }

  if (!localStorage.getItem("fundAccounts")) {
    localStorage.setItem("fundAccounts", JSON.stringify(sampleFundAccounts));
  }
};
