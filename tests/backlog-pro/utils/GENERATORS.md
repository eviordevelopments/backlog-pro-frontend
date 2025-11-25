# Property-Based Testing Generators

This document describes all the generators available for property-based testing in the Backlog Pro system.

## Overview

All generators use the `fast-check` library to create random, valid instances of entity types. Each generator can be customized with overrides to test specific scenarios.

## Basic Generators

### Enum Generators

#### `taskStatusArb()`
Generates valid TaskStatus values: `"todo"`, `"in-progress"`, `"review"`, `"done"`

```typescript
const status = fc.sample(taskStatusArb(), 1)[0];
// Example: "in-progress"
```

#### `taskPriorityArb()`
Generates valid TaskPriority values: `"low"`, `"medium"`, `"high"`, `"critical"`

```typescript
const priority = fc.sample(taskPriorityArb(), 1)[0];
// Example: "high"
```

#### `teamRoleArb()`
Generates valid TeamRole values: `"Product Owner"`, `"Scrum Master"`, `"Developer"`, `"DevOps"`

```typescript
const role = fc.sample(teamRoleArb(), 1)[0];
// Example: "Developer"
```

### Utility Generators

#### `isoDateArb()`
Generates valid ISO 8601 date strings

```typescript
const date = fc.sample(isoDateArb(), 1)[0];
// Example: "2024-03-15T10:30:00.000Z"
```

## Entity Generators

### `taskArb(overrides?: Partial<Task>)`
Generates complete Task entities with all required fields.

**Fields:**
- `id`: UUID string
- `title`: String (1-100 chars)
- `description`: String (0-500 chars)
- `status`: TaskStatus enum
- `priority`: TaskPriority enum
- `storyPoints`: Integer (0-100)
- `assignedTo`: String (1-50 chars)
- `estimatedDate`: ISO date string
- `tags`: Array of strings (max 10 items)
- `sprintId`: Optional UUID
- `storyId`: Optional UUID
- `createdAt`: ISO date string

**Usage:**
```typescript
// Generate random task
const task = fc.sample(taskArb(), 1)[0];

// Generate task with specific status
const todoTask = fc.sample(taskArb({ status: 'todo' }), 1)[0];

// Use in property test
fc.assert(
  fc.property(taskArb(), (task) => {
    // Test property
  }),
  { numRuns: 100 }
);
```

### `userStoryArb(overrides?: Partial<UserStory>)`
Generates complete UserStory entities.

**Fields:**
- `id`: UUID string
- `title`: String (1-100 chars)
- `role`: String (1-50 chars)
- `action`: String (1-100 chars)
- `benefit`: String (1-100 chars)
- `description`: String (0-500 chars)
- `storyPoints`: Integer (0-100)
- `businessValue`: Integer (0-100)
- `acceptanceCriteria`: Array of AcceptanceCriteria (max 10)
- `sprintId`: Optional UUID
- `createdAt`: ISO date string

**Usage:**
```typescript
// Generate random user story
const story = fc.sample(userStoryArb(), 1)[0];

// Generate story with specific sprint
const sprintStory = fc.sample(userStoryArb({ sprintId: 'sprint-123' }), 1)[0];
```

### `sprintArb(overrides?: Partial<Sprint>)`
Generates complete Sprint entities.

**Fields:**
- `id`: UUID string
- `name`: String (1-50 chars)
- `goal`: String (1-200 chars)
- `startDate`: ISO date string
- `endDate`: ISO date string
- `velocity`: Integer (0-200)
- `committedPoints`: Integer (0-200)
- `completedPoints`: Integer (0-200)
- `status`: "planned" | "active" | "completed"

**Usage:**
```typescript
// Generate random sprint
const sprint = fc.sample(sprintArb(), 1)[0];

// Generate active sprint
const activeSprint = fc.sample(sprintArb({ status: 'active' }), 1)[0];
```

### `teamMemberArb(overrides?: Partial<TeamMember>)`
Generates complete TeamMember entities.

**Fields:**
- `id`: UUID string
- `name`: String (1-50 chars)
- `role`: TeamRole enum
- `skills`: Array of strings (max 10)
- `availability`: Integer (0-100)
- `image`: Web URL string
- `tasksCompleted`: Integer (0-1000)
- `averageCycleTime`: Integer (0-100)
- `velocity`: Integer (0-200)

**Usage:**
```typescript
// Generate random team member
const member = fc.sample(teamMemberArb(), 1)[0];

// Generate developer
const dev = fc.sample(teamMemberArb({ role: 'Developer' }), 1)[0];
```

### `riskArb(overrides?: Partial<Risk>)`
Generates complete Risk entities with automatic score calculation.

**Fields:**
- `id`: UUID string
- `title`: String (1-100 chars)
- `description`: String (0-500 chars)
- `probability`: Integer (1-5)
- `impact`: Integer (1-5)
- `score`: Integer (1-25) - automatically calculated as probability * impact
- `mitigation`: String (0-500 chars)
- `owner`: String (1-50 chars)
- `status`: "open" | "mitigated" | "closed"

**Note:** The score is always calculated as `probability * impact`, even if overridden.

**Usage:**
```typescript
// Generate random risk
const risk = fc.sample(riskArb(), 1)[0];

// Generate high-impact risk
const highRisk = fc.sample(riskArb({ probability: 5, impact: 5 }), 1)[0];
// highRisk.score will be 25
```

### `profitShareArb(overrides?: Partial<ProfitShare>)`
Generates complete ProfitShare entities.

**Fields:**
- `memberId`: UUID string
- `memberName`: String (1-50 chars)
- `percentage`: Integer (0-100)
- `amount`: Float (0-1,000,000)

**Usage:**
```typescript
// Generate random profit share
const share = fc.sample(profitShareArb(), 1)[0];

// Generate specific percentage
const fixedShare = fc.sample(profitShareArb({ percentage: 25 }), 1)[0];
```

### `kpiMetricsArb(overrides?: Partial<KPIMetrics>)`
Generates complete KPIMetrics objects.

**Fields:**
- `velocity`: Integer (0-200)
- `cycleTime`: Integer (0-100)
- `sprintCompletionRate`: Integer (0-100)
- `deploymentFrequency`: Integer (0-100)
- `leadTime`: Integer (0-100)
- `mttr`: Integer (0-100)
- `changeFailureRate`: Integer (0-100)
- `teamSatisfaction`: Integer (0-100)

**Usage:**
```typescript
// Generate random KPI metrics
const metrics = fc.sample(kpiMetricsArb(), 1)[0];
```

## Array Generators

### `taskArrayArb(minLength = 0, maxLength = 20)`
Generates arrays of Task entities.

```typescript
// Generate array of 5-10 tasks
const tasks = fc.sample(taskArrayArb(5, 10), 1)[0];
```

### `userStoryArrayArb(minLength = 0, maxLength = 20)`
Generates arrays of UserStory entities.

### `sprintArrayArb(minLength = 0, maxLength = 10)`
Generates arrays of Sprint entities.

### `teamMemberArrayArb(minLength = 0, maxLength = 20)`
Generates arrays of TeamMember entities.

### `riskArrayArb(minLength = 0, maxLength = 20)`
Generates arrays of Risk entities.

### `profitShareArrayArb(minLength = 0, maxLength = 20)`
Generates arrays of ProfitShare entities.

## Advanced Usage

### Combining Generators

```typescript
// Generate a sprint with tasks
fc.assert(
  fc.property(
    sprintArb(),
    taskArrayArb(1, 10),
    (sprint, tasks) => {
      // Assign all tasks to the sprint
      const assignedTasks = tasks.map(t => ({ ...t, sprintId: sprint.id }));
      // Test property
    }
  ),
  { numRuns: 100 }
);
```

### Custom Constraints

```typescript
// Generate only high-priority tasks
const highPriorityTaskArb = taskArb({ priority: 'high' });

// Generate only completed sprints
const completedSprintArb = sprintArb({ status: 'completed' });

// Generate risks with specific probability
const highProbabilityRiskArb = riskArb({ probability: 5 });
```

### Filtering Generated Values

```typescript
fc.assert(
  fc.property(
    taskArb().filter(t => t.storyPoints > 0),
    (task) => {
      // Test only tasks with story points
    }
  ),
  { numRuns: 100 }
);
```

## Best Practices

1. **Use Overrides Sparingly**: Only override fields that are essential to your test
2. **Test Edge Cases**: Use specific overrides to test boundary conditions
3. **Run Enough Iterations**: Always use at least 100 iterations for property tests
4. **Validate Invariants**: Check that generated data maintains required invariants
5. **Document Assumptions**: Comment why specific overrides are used

## Examples

### Testing CRUD Operations

```typescript
// **Feature: backlog-pro-system, Property 1: Task creation adds to list**
it('should add task to list', () => {
  fc.assert(
    fc.property(taskArb(), (task) => {
      const initialLength = taskList.length;
      addTask(task);
      expect(taskList.length).toBe(initialLength + 1);
      expect(taskList).toContainEqual(task);
    }),
    { numRuns: 100 }
  );
});
```

### Testing Calculations

```typescript
// **Feature: backlog-pro-system, Property 28: Risk score calculation**
it('should calculate risk score correctly', () => {
  fc.assert(
    fc.property(riskArb(), (risk) => {
      expect(risk.score).toBe(risk.probability * risk.impact);
    }),
    { numRuns: 100 }
  );
});
```

### Testing Filtering

```typescript
// **Feature: backlog-pro-system, Property 35: Status filtering is accurate**
it('should filter tasks by status', () => {
  fc.assert(
    fc.property(
      taskArrayArb(10, 20),
      taskStatusArb(),
      (tasks, filterStatus) => {
        const filtered = tasks.filter(t => t.status === filterStatus);
        expect(filtered.every(t => t.status === filterStatus)).toBe(true);
      }
    ),
    { numRuns: 100 }
  );
});
```
