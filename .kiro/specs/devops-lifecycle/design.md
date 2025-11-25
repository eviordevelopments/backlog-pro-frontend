# Design Document

## Overview

The DevOps Lifecycle feature provides an interactive visual representation of the DevOps infinity loop integrated into the existing DevOps Metrics page. The component displays eight stages arranged in a figure-eight pattern, with visual indicators showing the current stage of each project. Users can click stages to update project progress, view stage-specific tasks, and create new tasks assigned to specific stages.

The design leverages existing infrastructure including React Query for data fetching, the base44 API client for persistence, and Supabase as the backend database. The component integrates seamlessly with the existing glassmorphic design system and follows established patterns from the codebase.

## Architecture

### Component Structure

```
DevOps.tsx (existing page)
├── DevOpsMetrics (existing metrics display)
└── DevOpsLifecycle (new component)
    ├── InfinityLoopVisualization
    │   ├── SVG Path with animated gradient
    │   └── Stage Nodes (8 buttons)
    │       ├── Stage Icon
    │       ├── Stage Name
    │       ├── Active Indicator (glow + circle)
    │       ├── Completed Indicator (checkmark)
    │       └── Task Count Badge
    ├── StageDetailsPanel
    │   ├── Stage Header
    │   ├── Task List
    │   └── Assign Task Button
    └── TaskAssignmentDialog
        ├── Title Input
        ├── Description Textarea
        ├── User Select
        └── Create Button
```

### Data Flow

1. **Project Loading**: Component receives project prop with devops_stage field
2. **Task Fetching**: React Query fetches tasks filtered by project_id
3. **User Fetching**: React Query fetches users for task assignment
4. **Stage Update**: User clicks stage → mutation updates project → invalidates cache → UI updates
5. **Task Creation**: User submits form → mutation creates task with stage tag → invalidates cache → UI updates

### Integration Points

- **Database Schema**: Extends Project table with devops_stage column
- **API Client**: Uses base44.entities.Project and base44.entities.Task
- **State Management**: React Query for server state, local useState for UI state
- **Styling**: Follows existing glassmorphic design with GlassCard component

## Components and Interfaces

### DevOpsLifecycle Component

**Props:**
```typescript
interface DevOpsLifecycleProps {
  project: Project;
}
```

**State:**
```typescript
const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
const [taskDialogOpen, setTaskDialogOpen] = useState(false);
const [taskForm, setTaskForm] = useState({
  title: string;
  description: string;
  assigned_to: string;
});
```

**Queries:**
```typescript
// Fetch tasks for current project
useQuery({
  queryKey: ['tasks', project.id],
  queryFn: () => base44.entities.Task.list()
    .then(tasks => tasks.filter(t => t.project_id === project.id))
});

// Fetch users for assignment
useQuery({
  queryKey: ['users'],
  queryFn: () => base44.entities.User.list()
});
```

**Mutations:**
```typescript
// Update project stage
useMutation({
  mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
  onSuccess: () => queryClient.invalidateQueries(['projects'])
});

// Create task
useMutation({
  mutationFn: (data) => base44.entities.Task.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries(['tasks']);
    setTaskDialogOpen(false);
    setTaskForm({ title: '', description: '', assigned_to: '' });
  }
});
```

### Stage Configuration

```typescript
interface Stage {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string; // Tailwind gradient classes
  bgColor: string; // Hex color for glow effect
  position: { top: string; left: string }; // Percentage positioning
}

const stages: Stage[] = [
  { 
    id: 'plan', 
    name: 'Plan', 
    icon: Lightbulb, 
    color: 'from-blue-400 to-blue-600',
    bgColor: '#3b82f6',
    position: { top: '10%', left: '50%' }
  },
  // ... 7 more stages
];
```

## Data Models

### Database Schema Changes

**Project Table Extension:**
```sql
ALTER TABLE projects 
ADD COLUMN devops_stage VARCHAR(20);

-- Valid values: 'plan', 'code', 'build', 'test', 'release', 'deploy', 'operate', 'monitor'
-- NULL indicates no stage assigned
```

### TypeScript Type Updates

**Project Interface:**
```typescript
export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  devops_stage?: 'plan' | 'code' | 'build' | 'test' | 'release' | 'deploy' | 'operate' | 'monitor';
}
```

**Task Interface (existing, uses tags field):**
```typescript
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
  tags: string[]; // Stage IDs stored here
  sprintId?: string;
  storyId?: string;
  createdAt: string;
  userId: string;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, the following redundancies were identified and resolved:

- **Redundancy 1**: Properties for stage node rendering (1.3, 1.4) can be combined into a single comprehensive property that validates all stage node attributes
- **Redundancy 2**: Properties for active stage indicators (2.1, 2.3, 2.4) overlap and can be consolidated into one property that checks all active stage characteristics
- **Redundancy 3**: Properties for mutation side effects (3.2, 3.3) are both covered by testing the mutation's onSuccess callback
- **Redundancy 4**: Properties for task creation data (6.4, 6.5, 6.6) can be combined into one property that validates all task creation defaults

### Properties

**Property 1: Stage nodes render with complete information**
*For any* stage in the stages array, the rendered stage node should contain the stage's icon component, name text, and color gradient CSS classes
**Validates: Requirements 1.3, 1.4**

**Property 2: Active stage has enhanced visual indicators**
*For any* project with a devops_stage value, the corresponding stage node should have the active CSS class, scale transformation, and contain a circular indicator element
**Validates: Requirements 2.1, 2.3, 2.4**

**Property 3: Completed stages show checkmark**
*For any* project with a devops_stage value, all stages that come before the current stage in the stages array should display a CheckCircle2 icon
**Validates: Requirements 2.5**

**Property 4: Stage click updates project**
*For any* stage node, clicking it should trigger the updateProjectMutation with the project ID and the selected stage ID
**Validates: Requirements 3.1, 3.2**

**Property 5: Stage click updates selection**
*For any* stage node, clicking it should update the selectedStage state to that stage
**Validates: Requirements 3.4**

**Property 6: Mutation success invalidates cache**
*For any* successful project update mutation, the React Query cache for 'projects' should be invalidated
**Validates: Requirements 3.3**

**Property 7: Task filtering by stage**
*For any* stage ID and task list, the getTasksForStage function should return only tasks whose tags array includes that stage ID
**Validates: Requirements 4.2**

**Property 8: Task count badge displays correct format**
*For any* stage with tasks, the task count badge should display text in the format "X/Y" where X is completed tasks and Y is total tasks
**Validates: Requirements 4.1, 4.4**

**Property 9: Selected stage shows details panel**
*For any* selected stage, the details panel should be rendered and display all tasks returned by getTasksForStage for that stage ID
**Validates: Requirements 5.1**

**Property 10: Task display includes all information**
*For any* task in the details panel, the rendered task element should contain the task's title, description (if present), assigned user name, and status
**Validates: Requirements 5.2**

**Property 11: Task completion status determines icon**
*For any* task, if status is "done" then CheckCircle2 icon should be rendered, otherwise Circle icon should be rendered
**Validates: Requirements 5.3**

**Property 12: Task creation requires title**
*For any* task form submission, the createTaskMutation should only be called if the title field is non-empty
**Validates: Requirements 6.2**

**Property 13: Task creation accepts optional fields**
*For any* task creation, the mutation should succeed whether or not description and assigned_to fields are provided
**Validates: Requirements 6.3**

**Property 14: Task creation sets correct defaults**
*For any* created task, it should have tags containing the selected stage ID, project_id matching the current project, and status set to "todo"
**Validates: Requirements 6.4, 6.5, 6.6**

**Property 15: Task creation success resets UI**
*For any* successful task creation, the dialog should close (taskDialogOpen = false), form should reset to initial values, and tasks query should be invalidated
**Validates: Requirements 6.7, 6.8**

**Property 16: User display shows name or email**
*For any* task with an assigned_to value, if a matching user exists, the display should show that user's full_name or email
**Validates: Requirements 7.1**

**Property 17: Null devops_stage shows no active stage**
*For any* project where devops_stage is null or undefined, no stage node should have the active visual indicators
**Validates: Requirements 8.3**

**Property 18: API client used for all operations**
*For any* data operation (project update, task creation, task fetching, user fetching), the base44 API client methods should be called
**Validates: Requirements 8.4**

## Error Handling

### API Errors

**Project Update Failures:**
- Display toast notification with error message
- Revert visual indicators to previous state
- Log error to console for debugging

**Task Creation Failures:**
- Display toast notification with error message
- Keep dialog open with form data preserved
- Allow user to retry submission

**Data Fetching Failures:**
- Display error state in component
- Provide retry button
- Show fallback UI for missing data

### Validation Errors

**Form Validation:**
- Prevent submission if title is empty
- Show inline error messages
- Disable submit button until valid

**Data Validation:**
- Verify project prop is provided
- Check that stage IDs are valid
- Ensure task data structure is correct

### Edge Cases

**No Project:**
- Component should not render if project prop is null
- Display message indicating project selection required

**No Tasks:**
- Display "No tasks for this stage yet" message
- Show empty state illustration
- Provide clear call-to-action to create first task

**No Users:**
- Disable user assignment select
- Show message indicating no users available
- Allow task creation without assignment

**Network Offline:**
- Show offline indicator
- Queue mutations for when connection restored
- Provide clear feedback about offline state

## Testing Strategy

### Unit Testing

The component will use Vitest and React Testing Library for unit tests. Tests will focus on:

**Rendering Tests:**
- Component renders without errors
- All 8 stage nodes are present
- Stage details panel renders when stage selected
- Task assignment dialog opens/closes correctly

**Interaction Tests:**
- Clicking stage updates project
- Clicking "Assign Task" opens dialog
- Form submission creates task
- Dialog closes after successful creation

**Data Display Tests:**
- Active stage has correct visual indicators
- Completed stages show checkmarks
- Task counts display correctly
- User names display correctly

**Edge Case Tests:**
- No tasks message displays when appropriate
- "Unknown" displays for missing users
- Null devops_stage shows no active stage
- Form validation prevents empty title submission

### Property-Based Testing

The component will use fast-check for property-based testing. The testing library is already installed in the project.

**Configuration:**
- Each property test will run a minimum of 100 iterations
- Tests will use custom generators for domain-specific data
- Each test will be tagged with the format: `**Feature: devops-lifecycle, Property {number}: {property_text}**`

**Test Data Generators:**

```typescript
// Generate random stage
const stageArb = fc.constantFrom(...stages.map(s => s.id));

// Generate random project with optional devops_stage
const projectArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1 }),
  devops_stage: fc.option(stageArb, { nil: undefined })
});

// Generate random task
const taskArb = fc.record({
  id: fc.uuid(),
  project_id: fc.uuid(),
  title: fc.string({ minLength: 1 }),
  description: fc.string(),
  status: fc.constantFrom('todo', 'in_progress', 'done'),
  tags: fc.array(stageArb)
});

// Generate random user
const userArb = fc.record({
  id: fc.uuid(),
  full_name: fc.option(fc.string({ minLength: 1 })),
  email: fc.emailAddress()
});
```

**Property Test Examples:**

```typescript
// Property 1: Stage nodes render with complete information
test('Property 1: Stage nodes render with complete information', () => {
  fc.assert(
    fc.property(projectArb, (project) => {
      const { container } = render(<DevOpsLifecycle project={project} />);
      
      stages.forEach(stage => {
        const stageNode = container.querySelector(`[data-stage-id="${stage.id}"]`);
        expect(stageNode).toBeTruthy();
        expect(stageNode).toHaveTextContent(stage.name);
        expect(stageNode).toHaveClass(stage.color);
      });
    }),
    { numRuns: 100 }
  );
});

// Property 7: Task filtering by stage
test('Property 7: Task filtering by stage', () => {
  fc.assert(
    fc.property(
      stageArb,
      fc.array(taskArb),
      (stageId, tasks) => {
        const filtered = getTasksForStage(stageId, tasks);
        
        // All returned tasks should have the stage ID in tags
        filtered.forEach(task => {
          expect(task.tags).toContain(stageId);
        });
        
        // No tasks without the stage ID should be included
        const excluded = tasks.filter(t => !t.tags.includes(stageId));
        excluded.forEach(task => {
          expect(filtered).not.toContain(task);
        });
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

**API Integration:**
- Mock base44 API client responses
- Test mutation success/failure paths
- Verify React Query cache updates

**Component Integration:**
- Test interaction between DevOpsLifecycle and parent DevOps page
- Verify project prop updates trigger re-renders
- Test dialog component integration

### Manual Testing Checklist

- [ ] Visual appearance matches design mockups
- [ ] Animations are smooth and performant
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Keyboard navigation works correctly
- [ ] Screen reader announces stage changes
- [ ] Color contrast meets WCAG AA standards
- [ ] Touch targets are at least 44x44px
- [ ] Loading states display appropriately
- [ ] Error messages are clear and actionable
