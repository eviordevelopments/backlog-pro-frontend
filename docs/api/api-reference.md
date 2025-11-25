# API Reference

## Overview

This document provides a comprehensive reference for all data models, TypeScript interfaces, and CRUD operations available in Backlog Pro - Agile Suite. The application uses React Context API for state management with automatic localStorage persistence.

## Type Definitions

### Enums and Union Types

```typescript
// Task status values
export type TaskStatus = "todo" | "in-progress" | "review" | "done";

// Task priority levels
export type TaskPriority = "low" | "medium" | "high" | "critical";

// Team member roles
export type TeamRole = "Product Owner" | "Scrum Master" | "Developer" | "DevOps";

// Sprint status values
export type SprintStatus = "planned" | "active" | "completed";

// Risk status values
export type RiskStatus = "open" | "mitigated" | "closed";
```

## Data Models

### Task

**Description**: Represents a work item in the backlog with status tracking, assignment, and sprint association.

**Interface**:
```typescript
export interface Task {
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
}
```

**Fields**:
- `id` (string, required): Unique identifier for the task
- `title` (string, required): Task title or summary
- `description` (string, required): Detailed description of the task
- `status` (TaskStatus, required): Current status - one of "todo", "in-progress", "review", or "done"
- `priority` (TaskPriority, required): Priority level - one of "low", "medium", "high", or "critical"
- `storyPoints` (number, required): Estimated effort in story points (typically 1-13)
- `assignedTo` (string, required): Name of the team member assigned to this task
- `estimatedDate` (string, required): Target completion date in ISO format (YYYY-MM-DD)
- `tags` (string[], required): Array of tags for categorization and filtering
- `sprintId` (string, optional): ID of the sprint this task belongs to (foreign key to Sprint)
- `storyId` (string, optional): ID of the user story this task implements (foreign key to UserStory)
- `createdAt` (string, required): Creation timestamp in ISO format

**Validation Rules**:
- `id` must be unique across all tasks
- `storyPoints` should be a positive number
- `estimatedDate` should be a valid date string
- `sprintId` and `storyId` should reference existing entities when provided

**Relationships**:
- References: Sprint (via `sprintId`), UserStory (via `storyId`)
- Referenced by: None

---

### UserStory

**Description**: Represents a user story in INVEST format with acceptance criteria and business value tracking.

**Interface**:
```typescript
export interface AcceptanceCriteria {
  id: string;
  description: string;
  completed: boolean;
}

export interface UserStory {
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
}
```

**Fields**:
- `id` (string, required): Unique identifier for the user story
- `title` (string, required): Story title or summary
- `role` (string, required): User role in "As a [role]" format
- `action` (string, required): Desired action in "I want [action]" format
- `benefit` (string, required): Expected benefit in "so that [benefit]" format
- `description` (string, required): Detailed description of the story
- `storyPoints` (number, required): Estimated effort in story points
- `businessValue` (number, required): Business value score (typically 1-100)
- `acceptanceCriteria` (AcceptanceCriteria[], required): Array of acceptance criteria with completion tracking
- `sprintId` (string, optional): ID of the sprint this story is assigned to (foreign key to Sprint)
- `createdAt` (string, required): Creation timestamp in ISO format

**AcceptanceCriteria Fields**:
- `id` (string, required): Unique identifier for the criterion
- `description` (string, required): Description of the acceptance criterion
- `completed` (boolean, required): Whether this criterion has been met

**Validation Rules**:
- `id` must be unique across all user stories
- `storyPoints` and `businessValue` should be positive numbers
- `acceptanceCriteria` array should contain at least one criterion
- `sprintId` should reference an existing Sprint when provided

**Relationships**:
- References: Sprint (via `sprintId`)
- Referenced by: Task (via Task.storyId)

---

### Sprint

**Description**: Represents a time-boxed iteration with goals, velocity tracking, and completion metrics.

**Interface**:
```typescript
export interface Sprint {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  velocity: number;
  committedPoints: number;
  completedPoints: number;
  status: "planned" | "active" | "completed";
}
```

**Fields**:
- `id` (string, required): Unique identifier for the sprint
- `name` (string, required): Sprint name (e.g., "Sprint 1", "Q4 Sprint 2")
- `goal` (string, required): Sprint goal or objective
- `startDate` (string, required): Sprint start date in ISO format (YYYY-MM-DD)
- `endDate` (string, required): Sprint end date in ISO format (YYYY-MM-DD)
- `velocity` (number, required): Team velocity for this sprint (story points per sprint)
- `committedPoints` (number, required): Total story points committed at sprint start
- `completedPoints` (number, required): Total story points completed by sprint end
- `status` (SprintStatus, required): Current status - one of "planned", "active", or "completed"

**Validation Rules**:
- `id` must be unique across all sprints
- `endDate` should be after `startDate`
- `velocity`, `committedPoints`, and `completedPoints` should be non-negative numbers
- `completedPoints` should not exceed `committedPoints` in a healthy sprint

**Relationships**:
- References: None
- Referenced by: Task (via Task.sprintId), UserStory (via UserStory.sprintId)

---

### TeamMember

**Description**: Represents a team member with role, skills, availability, and performance metrics.

**Interface**:
```typescript
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
```

**Fields**:
- `id` (string, required): Unique identifier for the team member
- `name` (string, required): Team member's full name
- `role` (TeamRole, required): Role - one of "Product Owner", "Scrum Master", "Developer", or "DevOps"
- `skills` (string[], required): Array of skills and competencies
- `availability` (number, required): Availability percentage (0-100)
- `image` (string, required): URL to profile image or avatar
- `tasksCompleted` (number, required): Total number of tasks completed
- `averageCycleTime` (number, required): Average time to complete a task in days
- `velocity` (number, required): Individual velocity in story points per sprint

**Validation Rules**:
- `id` must be unique across all team members
- `availability` should be between 0 and 100
- `tasksCompleted` should be a non-negative integer
- `averageCycleTime` and `velocity` should be positive numbers

**Relationships**:
- References: None
- Referenced by: Task (via Task.assignedTo by name), Risk (via Risk.owner by name), ProfitShare (via ProfitShare.memberId)

---

### Risk

**Description**: Represents a project risk with probability, impact scoring, and mitigation strategies.

**Interface**:
```typescript
export interface Risk {
  id: string;
  title: string;
  description: string;
  probability: number; // 1-5
  impact: number; // 1-5
  score: number;
  mitigation: string;
  owner: string;
  status: "open" | "mitigated" | "closed";
}
```

**Fields**:
- `id` (string, required): Unique identifier for the risk
- `title` (string, required): Risk title or summary
- `description` (string, required): Detailed description of the risk
- `probability` (number, required): Likelihood of occurrence on a scale of 1-5 (1=very low, 5=very high)
- `impact` (number, required): Potential impact on a scale of 1-5 (1=negligible, 5=catastrophic)
- `score` (number, required): Risk score calculated as probability × impact (1-25)
- `mitigation` (string, required): Mitigation strategy or action plan
- `owner` (string, required): Name of the team member responsible for managing this risk
- `status` (RiskStatus, required): Current status - one of "open", "mitigated", or "closed"

**Validation Rules**:
- `id` must be unique across all risks
- `probability` and `impact` must be integers between 1 and 5
- `score` should equal `probability × impact`
- `owner` should reference an existing team member name

**Relationships**:
- References: TeamMember (via `owner` by name)
- Referenced by: None

---

### ProfitShare

**Description**: Represents profit sharing allocation for a team member.

**Interface**:
```typescript
export interface ProfitShare {
  memberId: string;
  memberName: string;
  percentage: number;
  amount: number;
}
```

**Fields**:
- `memberId` (string, required): ID of the team member (foreign key to TeamMember)
- `memberName` (string, required): Name of the team member
- `percentage` (number, required): Percentage of profit allocated (0-100)
- `amount` (number, required): Calculated profit amount in currency units

**Validation Rules**:
- `memberId` should reference an existing TeamMember
- `percentage` should be between 0 and 100
- Sum of all percentages across all profit shares should equal 100
- `amount` should be a non-negative number

**Relationships**:
- References: TeamMember (via `memberId`)
- Referenced by: None

---

### KPIMetrics

**Description**: Represents key performance indicators and DORA metrics for the team.

**Interface**:
```typescript
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
```

**Fields**:
- `velocity` (number, required): Average team velocity in story points per sprint
- `cycleTime` (number, required): Average time to complete a task in days
- `sprintCompletionRate` (number, required): Percentage of committed work completed (0-100)
- `deploymentFrequency` (number, required): Number of deployments per time period
- `leadTime` (number, required): Average time from commit to production in days (DORA metric)
- `mttr` (number, required): Mean Time To Recovery in hours (DORA metric)
- `changeFailureRate` (number, required): Percentage of deployments causing failures (0-100, DORA metric)
- `teamSatisfaction` (number, required): Team satisfaction score (0-10)

**Validation Rules**:
- All metrics should be non-negative numbers
- `sprintCompletionRate` and `changeFailureRate` should be between 0 and 100
- `teamSatisfaction` should be between 0 and 10

**Relationships**:
- References: None
- Referenced by: None

---

## AppContext API

The AppContext provides a centralized state management solution with CRUD operations for all entities. Access the context using the `useApp()` hook.

### Accessing the Context

```typescript
import { useApp } from "@/context/AppContext";

function MyComponent() {
  const {
    tasks,
    userStories,
    sprints,
    teamMembers,
    risks,
    profitShares,
    kpiMetrics,
    // ... CRUD methods
  } = useApp();
  
  // Use entities and methods
}
```

### State Properties

All entity collections are available as read-only arrays:

- `tasks: Task[]` - Array of all tasks
- `userStories: UserStory[]` - Array of all user stories
- `sprints: Sprint[]` - Array of all sprints
- `teamMembers: TeamMember[]` - Array of all team members
- `risks: Risk[]` - Array of all risks
- `profitShares: ProfitShare[]` - Array of all profit share allocations
- `kpiMetrics: KPIMetrics` - Current KPI metrics object

---

## CRUD Operations

### Task Operations

#### addTask
```typescript
addTask: (task: Task) => void
```
**Description**: Adds a new task to the task list and persists to localStorage.

**Parameters**:
- `task` (Task): Complete task object with all required fields

**Example**:
```typescript
const newTask: Task = {
  id: crypto.randomUUID(),
  title: "Implement user authentication",
  description: "Add JWT-based authentication",
  status: "todo",
  priority: "high",
  storyPoints: 8,
  assignedTo: "Morena",
  estimatedDate: "2024-12-15",
  tags: ["backend", "security"],
  sprintId: "sprint-1",
  createdAt: new Date().toISOString(),
};

addTask(newTask);
```

#### updateTask
```typescript
updateTask: (id: string, task: Partial<Task>) => void
```
**Description**: Updates an existing task with partial data and persists to localStorage.

**Parameters**:
- `id` (string): ID of the task to update
- `task` (Partial<Task>): Object containing fields to update

**Example**:
```typescript
updateTask("task-123", {
  status: "in-progress",
  assignedTo: "Franco",
});
```

#### deleteTask
```typescript
deleteTask: (id: string) => void
```
**Description**: Removes a task from the task list and updates localStorage.

**Parameters**:
- `id` (string): ID of the task to delete

**Example**:
```typescript
deleteTask("task-123");
```

---

### UserStory Operations

#### addUserStory
```typescript
addUserStory: (story: UserStory) => void
```
**Description**: Adds a new user story to the backlog and persists to localStorage.

**Parameters**:
- `story` (UserStory): Complete user story object with all required fields

**Example**:
```typescript
const newStory: UserStory = {
  id: crypto.randomUUID(),
  title: "User Login Feature",
  role: "user",
  action: "log in with email and password",
  benefit: "I can access my personalized dashboard",
  description: "Implement secure login functionality",
  storyPoints: 13,
  businessValue: 90,
  acceptanceCriteria: [
    { id: "ac-1", description: "User can enter credentials", completed: false },
    { id: "ac-2", description: "Invalid credentials show error", completed: false },
  ],
  createdAt: new Date().toISOString(),
};

addUserStory(newStory);
```

#### updateUserStory
```typescript
updateUserStory: (id: string, story: Partial<UserStory>) => void
```
**Description**: Updates an existing user story with partial data and persists to localStorage.

**Parameters**:
- `id` (string): ID of the user story to update
- `story` (Partial<UserStory>): Object containing fields to update

**Example**:
```typescript
updateUserStory("story-456", {
  sprintId: "sprint-2",
  storyPoints: 8,
});
```

#### deleteUserStory
```typescript
deleteUserStory: (id: string) => void
```
**Description**: Removes a user story from the backlog and updates localStorage.

**Parameters**:
- `id` (string): ID of the user story to delete

**Example**:
```typescript
deleteUserStory("story-456");
```

---

### Sprint Operations

#### addSprint
```typescript
addSprint: (sprint: Sprint) => void
```
**Description**: Creates a new sprint and persists to localStorage.

**Parameters**:
- `sprint` (Sprint): Complete sprint object with all required fields

**Example**:
```typescript
const newSprint: Sprint = {
  id: crypto.randomUUID(),
  name: "Sprint 5",
  goal: "Complete authentication and user profile features",
  startDate: "2024-12-01",
  endDate: "2024-12-14",
  velocity: 35,
  committedPoints: 42,
  completedPoints: 0,
  status: "planned",
};

addSprint(newSprint);
```

#### updateSprint
```typescript
updateSprint: (id: string, sprint: Partial<Sprint>) => void
```
**Description**: Updates an existing sprint with partial data and persists to localStorage.

**Parameters**:
- `id` (string): ID of the sprint to update
- `sprint` (Partial<Sprint>): Object containing fields to update

**Example**:
```typescript
updateSprint("sprint-5", {
  status: "active",
  completedPoints: 28,
});
```

#### deleteSprint
```typescript
deleteSprint: (id: string) => void
```
**Description**: Removes a sprint and updates localStorage.

**Parameters**:
- `id` (string): ID of the sprint to delete

**Example**:
```typescript
deleteSprint("sprint-5");
```

---

### TeamMember Operations

#### updateTeamMember
```typescript
updateTeamMember: (id: string, member: Partial<TeamMember>) => void
```
**Description**: Updates an existing team member's information. Note: Team members are initialized with the application and cannot be added or deleted through the API.

**Parameters**:
- `id` (string): ID of the team member to update
- `member` (Partial<TeamMember>): Object containing fields to update

**Example**:
```typescript
updateTeamMember("1", {
  availability: 80,
  skills: ["Product Strategy", "Stakeholder Management", "UX", "Data Analysis"],
  velocity: 38,
});
```

---

### Risk Operations

#### addRisk
```typescript
addRisk: (risk: Risk) => void
```
**Description**: Adds a new risk to the risk register and persists to localStorage.

**Parameters**:
- `risk` (Risk): Complete risk object with all required fields

**Example**:
```typescript
const newRisk: Risk = {
  id: crypto.randomUUID(),
  title: "Third-party API dependency",
  description: "Payment gateway API may experience downtime",
  probability: 3,
  impact: 4,
  score: 12,
  mitigation: "Implement retry logic and fallback payment methods",
  owner: "Franco",
  status: "open",
};

addRisk(newRisk);
```

#### updateRisk
```typescript
updateRisk: (id: string, risk: Partial<Risk>) => void
```
**Description**: Updates an existing risk with partial data and persists to localStorage.

**Parameters**:
- `id` (string): ID of the risk to update
- `risk` (Partial<Risk>): Object containing fields to update

**Example**:
```typescript
updateRisk("risk-789", {
  status: "mitigated",
  probability: 2,
  score: 8,
});
```

#### deleteRisk
```typescript
deleteRisk: (id: string) => void
```
**Description**: Removes a risk from the risk register and updates localStorage.

**Parameters**:
- `id` (string): ID of the risk to delete

**Example**:
```typescript
deleteRisk("risk-789");
```

---

### ProfitShare Operations

#### updateProfitShares
```typescript
updateProfitShares: (shares: ProfitShare[]) => void
```
**Description**: Replaces the entire profit sharing allocation array and persists to localStorage. This is typically used to recalculate and update all allocations at once.

**Parameters**:
- `shares` (ProfitShare[]): Complete array of profit share allocations

**Example**:
```typescript
const totalRevenue = 100000;
const newShares: ProfitShare[] = [
  { memberId: "1", memberName: "Pedro", percentage: 30, amount: 30000 },
  { memberId: "2", memberName: "David", percentage: 25, amount: 25000 },
  { memberId: "3", memberName: "Morena", percentage: 25, amount: 25000 },
  { memberId: "4", memberName: "Franco", percentage: 20, amount: 20000 },
];

updateProfitShares(newShares);
```

---

### KPIMetrics Operations

#### updateKPIMetrics
```typescript
updateKPIMetrics: (metrics: Partial<KPIMetrics>) => void
```
**Description**: Updates KPI metrics with partial data and persists to localStorage.

**Parameters**:
- `metrics` (Partial<KPIMetrics>): Object containing metrics to update

**Example**:
```typescript
updateKPIMetrics({
  velocity: 38,
  sprintCompletionRate: 92,
  deploymentFrequency: 15,
});
```

---

## Entity Relationships

### Relationship Patterns

The application uses foreign key patterns to establish relationships between entities:

#### Sprint → Tasks and UserStories
- **Pattern**: Tasks and UserStories reference Sprints via `sprintId`
- **Type**: One-to-Many (one Sprint can have many Tasks and UserStories)
- **Usage**: Assign work items to sprints for planning and tracking
- **Example**:
  ```typescript
  // Get all tasks for a specific sprint
  const sprintTasks = tasks.filter(task => task.sprintId === "sprint-1");
  
  // Get all stories for a specific sprint
  const sprintStories = userStories.filter(story => story.sprintId === "sprint-1");
  ```

#### UserStory → Tasks
- **Pattern**: Tasks reference UserStories via `storyId`
- **Type**: One-to-Many (one UserStory can have many Tasks)
- **Usage**: Break down user stories into implementable tasks
- **Example**:
  ```typescript
  // Get all tasks for a specific user story
  const storyTasks = tasks.filter(task => task.storyId === "story-123");
  ```

#### TeamMember → Tasks (by name)
- **Pattern**: Tasks reference TeamMembers via `assignedTo` field (by name)
- **Type**: One-to-Many (one TeamMember can have many Tasks)
- **Usage**: Track task assignments and workload
- **Example**:
  ```typescript
  // Get all tasks assigned to a specific team member
  const memberTasks = tasks.filter(task => task.assignedTo === "Morena");
  ```

#### TeamMember → Risks (by name)
- **Pattern**: Risks reference TeamMembers via `owner` field (by name)
- **Type**: One-to-Many (one TeamMember can own many Risks)
- **Usage**: Assign risk ownership and accountability
- **Example**:
  ```typescript
  // Get all risks owned by a specific team member
  const memberRisks = risks.filter(risk => risk.owner === "Franco");
  ```

#### TeamMember → ProfitShares (by ID)
- **Pattern**: ProfitShares reference TeamMembers via `memberId`
- **Type**: One-to-One (each TeamMember has one ProfitShare allocation)
- **Usage**: Track profit distribution among team members
- **Example**:
  ```typescript
  // Get profit share for a specific team member
  const memberShare = profitShares.find(share => share.memberId === "3");
  ```

### Relationship Diagram

```
Sprint
  ├─→ Task (via Task.sprintId)
  └─→ UserStory (via UserStory.sprintId)

UserStory
  └─→ Task (via Task.storyId)

TeamMember
  ├─→ Task (via Task.assignedTo by name)
  ├─→ Risk (via Risk.owner by name)
  └─→ ProfitShare (via ProfitShare.memberId)
```

---

## localStorage Schema

### Overview

All application data is persisted to the browser's localStorage for client-side storage. Each entity type is stored as a separate JSON-serialized array or object under a specific key.

### Storage Keys

| Key | Type | Description |
|-----|------|-------------|
| `tasks` | Task[] | Array of all tasks |
| `userStories` | UserStory[] | Array of all user stories |
| `sprints` | Sprint[] | Array of all sprints |
| `risks` | Risk[] | Array of all risks |
| `profitShares` | ProfitShare[] | Array of profit share allocations |
| `kpiMetrics` | KPIMetrics | Single KPI metrics object |

**Note**: `teamMembers` are not persisted to localStorage as they are initialized with the application.

### Data Persistence Flow

1. **Initialization**: On app load, `initializeSampleData()` seeds localStorage with sample data if keys don't exist
2. **Loading**: AppContext reads from localStorage on mount using `useEffect`
3. **Synchronization**: Each entity state change triggers a `useEffect` that writes to localStorage
4. **Automatic**: All CRUD operations automatically persist changes without manual save actions

### Storage Format

Data is stored as JSON strings:

```javascript
// Example localStorage content
localStorage.getItem("tasks")
// Returns: '[{"id":"1","title":"Task 1",...},{"id":"2","title":"Task 2",...}]'

localStorage.getItem("kpiMetrics")
// Returns: '{"velocity":35,"cycleTime":2.5,...}'
```

### Manual Data Access

You can directly access localStorage data outside of React components:

```typescript
// Read data
const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
const kpiMetrics = JSON.parse(localStorage.getItem("kpiMetrics") || "{}");

// Write data (not recommended - use AppContext methods instead)
localStorage.setItem("tasks", JSON.stringify(updatedTasks));

// Clear all data
localStorage.clear();
```

### Storage Limitations

- **Size Limit**: Most browsers limit localStorage to 5-10 MB per origin
- **Synchronous**: localStorage operations are synchronous and may block the UI with large datasets
- **String Only**: All data must be JSON-serializable (no functions, circular references, etc.)
- **Browser-Specific**: Data is stored per browser and not synchronized across devices
- **No Encryption**: Data is stored in plain text and accessible via browser dev tools

### Backup and Export

For data backup and export procedures, see [Backup Procedures](../security/backup-procedures.md).

---

## Usage Examples

### Complete Task Workflow

```typescript
import { useApp } from "@/context/AppContext";

function TaskManager() {
  const { tasks, sprints, addTask, updateTask, deleteTask } = useApp();
  
  // Create a new task
  const handleCreateTask = () => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: "Implement search feature",
      description: "Add full-text search to task list",
      status: "todo",
      priority: "high",
      storyPoints: 5,
      assignedTo: "Morena",
      estimatedDate: "2024-12-20",
      tags: ["feature", "frontend"],
      sprintId: sprints[0]?.id,
      createdAt: new Date().toISOString(),
    };
    addTask(newTask);
  };
  
  // Update task status
  const handleMoveToInProgress = (taskId: string) => {
    updateTask(taskId, { status: "in-progress" });
  };
  
  // Complete a task
  const handleCompleteTask = (taskId: string) => {
    updateTask(taskId, { 
      status: "done",
      // Update sprint completed points
    });
  };
  
  // Delete a task
  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId);
    }
  };
  
  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <button onClick={() => handleMoveToInProgress(task.id)}>
            Start Task
          </button>
          <button onClick={() => handleCompleteTask(task.id)}>
            Complete
          </button>
          <button onClick={() => handleDeleteTask(task.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Sprint Planning Workflow

```typescript
import { useApp } from "@/context/AppContext";

function SprintPlanning() {
  const { 
    sprints, 
    userStories, 
    tasks,
    addSprint, 
    updateSprint,
    updateUserStory,
    updateTask 
  } = useApp();
  
  // Create a new sprint
  const handleCreateSprint = () => {
    const newSprint: Sprint = {
      id: crypto.randomUUID(),
      name: "Sprint 6",
      goal: "Improve user experience and performance",
      startDate: "2024-12-15",
      endDate: "2024-12-28",
      velocity: 35,
      committedPoints: 0,
      completedPoints: 0,
      status: "planned",
    };
    addSprint(newSprint);
  };
  
  // Assign stories to sprint
  const handleAssignStoryToSprint = (storyId: string, sprintId: string) => {
    updateUserStory(storyId, { sprintId });
    
    // Also assign related tasks
    const relatedTasks = tasks.filter(t => t.storyId === storyId);
    relatedTasks.forEach(task => {
      updateTask(task.id, { sprintId });
    });
  };
  
  // Calculate committed points
  const calculateCommittedPoints = (sprintId: string) => {
    const sprintStories = userStories.filter(s => s.sprintId === sprintId);
    const totalPoints = sprintStories.reduce((sum, s) => sum + s.storyPoints, 0);
    updateSprint(sprintId, { committedPoints: totalPoints });
  };
  
  // Start sprint
  const handleStartSprint = (sprintId: string) => {
    updateSprint(sprintId, { status: "active" });
  };
  
  return (
    <div>
      <button onClick={handleCreateSprint}>Create New Sprint</button>
      {/* Sprint planning UI */}
    </div>
  );
}
```

### Filtering and Querying Data

```typescript
import { useApp } from "@/context/AppContext";

function DataQueries() {
  const { tasks, userStories, sprints, teamMembers } = useApp();
  
  // Get active sprint
  const activeSprint = sprints.find(s => s.status === "active");
  
  // Get tasks for active sprint
  const activeSprintTasks = tasks.filter(t => t.sprintId === activeSprint?.id);
  
  // Get high priority tasks
  const highPriorityTasks = tasks.filter(t => t.priority === "high" || t.priority === "critical");
  
  // Get tasks by assignee
  const morenasTasks = tasks.filter(t => t.assignedTo === "Morena");
  
  // Get incomplete tasks
  const incompleteTasks = tasks.filter(t => t.status !== "done");
  
  // Get stories without sprint assignment
  const backlogStories = userStories.filter(s => !s.sprintId);
  
  // Calculate team workload
  const workloadByMember = teamMembers.map(member => ({
    name: member.name,
    taskCount: tasks.filter(t => t.assignedTo === member.name && t.status !== "done").length,
    totalPoints: tasks
      .filter(t => t.assignedTo === member.name && t.status !== "done")
      .reduce((sum, t) => sum + t.storyPoints, 0),
  }));
  
  // Get overdue tasks
  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => 
    t.status !== "done" && t.estimatedDate < today
  );
  
  return <div>{/* Display filtered data */}</div>;
}
```

### Risk Management Workflow

```typescript
import { useApp } from "@/context/AppContext";

function RiskManagement() {
  const { risks, addRisk, updateRisk, deleteRisk } = useApp();
  
  // Add a new risk
  const handleAddRisk = (riskData: Omit<Risk, "id" | "score">) => {
    const newRisk: Risk = {
      ...riskData,
      id: crypto.randomUUID(),
      score: riskData.probability * riskData.impact,
    };
    addRisk(newRisk);
  };
  
  // Update risk assessment
  const handleReassessRisk = (riskId: string, probability: number, impact: number) => {
    updateRisk(riskId, {
      probability,
      impact,
      score: probability * impact,
    });
  };
  
  // Close a risk
  const handleCloseRisk = (riskId: string) => {
    updateRisk(riskId, { status: "closed" });
  };
  
  // Get high-priority risks (score >= 15)
  const criticalRisks = risks.filter(r => r.score >= 15 && r.status === "open");
  
  // Get risks by owner
  const francoRisks = risks.filter(r => r.owner === "Franco");
  
  return (
    <div>
      <h2>Critical Risks: {criticalRisks.length}</h2>
      {/* Risk management UI */}
    </div>
  );
}
```

### KPI Dashboard Workflow

```typescript
import { useApp } from "@/context/AppContext";

function KPIDashboard() {
  const { kpiMetrics, updateKPIMetrics, tasks, sprints } = useApp();
  
  // Calculate and update velocity
  const handleUpdateVelocity = () => {
    const completedSprints = sprints.filter(s => s.status === "completed");
    const avgVelocity = completedSprints.reduce((sum, s) => sum + s.completedPoints, 0) 
      / completedSprints.length;
    
    updateKPIMetrics({ velocity: Math.round(avgVelocity) });
  };
  
  // Calculate sprint completion rate
  const handleUpdateCompletionRate = () => {
    const activeSprint = sprints.find(s => s.status === "active");
    if (activeSprint && activeSprint.committedPoints > 0) {
      const rate = (activeSprint.completedPoints / activeSprint.committedPoints) * 100;
      updateKPIMetrics({ sprintCompletionRate: Math.round(rate) });
    }
  };
  
  // Update DORA metrics
  const handleUpdateDORAMetrics = (metrics: {
    deploymentFrequency?: number;
    leadTime?: number;
    mttr?: number;
    changeFailureRate?: number;
  }) => {
    updateKPIMetrics(metrics);
  };
  
  return (
    <div>
      <h2>Team Velocity: {kpiMetrics.velocity}</h2>
      <h2>Sprint Completion: {kpiMetrics.sprintCompletionRate}%</h2>
      <h2>Deployment Frequency: {kpiMetrics.deploymentFrequency}/month</h2>
      {/* KPI dashboard UI */}
    </div>
  );
}
```

---

## Related Documentation

- [System Architecture](../architecture/system-architecture.md) - Technical architecture and component design
- [End User Guide](../user-guides/end-user-guide.md) - User-facing feature documentation
- [Admin Guide](../user-guides/admin-guide.md) - Configuration and maintenance procedures

---

## Changelog

- 2024-11-19: Initial API reference documentation created with complete data models, CRUD operations, relationships, and localStorage schema
