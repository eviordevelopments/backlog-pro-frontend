# Implementation Plan

- [x] 1. Extend database schema and types





  - Add devops_stage column to Project table in Supabase
  - Update Project TypeScript interface to include devops_stage field
  - Run database migration
  - _Requirements: 8.1, 8.2_

- [x] 2. Create DevOpsLifecycle component structure




  - Create new component file at src/components/DevOpsLifecycle.tsx
  - Set up component props interface accepting project
  - Initialize React Query hooks for tasks and users
  - Initialize mutations for project update and task creation
  - Initialize local state for selectedStage, taskDialogOpen, and taskForm
  - _Requirements: 1.1, 3.1, 6.1, 7.3_

- [x] 3. Implement infinity loop visualization





  - Create SVG with animated gradient path forming figure-eight
  - Define stages array with 8 stages (Plan, Code, Build, Test, Release, Deploy, Operate, Monitor)
  - Map stages to render stage node buttons with icons and names
  - Apply positioning styles to form infinity loop pattern
  - Add Framer Motion animations for stage node entrance
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 3.1 Write property test for stage node rendering
  - **Property 1: Stage nodes render with complete information**
  - **Validates: Requirements 1.3, 1.4**

- [x] 4. Implement active stage indicators





  - Calculate currentStageIndex from project.devops_stage
  - Apply conditional styling for active stage (scale, shadow)
  - Add pulsing glow effect using Framer Motion for active stage
  - Render circular indicator within active stage button
  - Show CheckCircle2 icon on completed stages (before current)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 4.1 Write property test for active stage indicators
  - **Property 2: Active stage has enhanced visual indicators**
  - **Validates: Requirements 2.1, 2.3, 2.4**

- [ ]* 4.2 Write property test for completed stage checkmarks
  - **Property 3: Completed stages show checkmark**
  - **Validates: Requirements 2.5**

- [ ]* 4.3 Write property test for null devops_stage
  - **Property 17: Null devops_stage shows no active stage**
  - **Validates: Requirements 8.3**

- [x] 5. Implement stage click handling





  - Add onClick handler to stage buttons
  - Call updateProjectMutation with project ID and selected stage ID
  - Update selectedStage state on click
  - Ensure mutation invalidates projects query on success
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ]* 5.1 Write property test for stage click updates
  - **Property 4: Stage click updates project**
  - **Validates: Requirements 3.1, 3.2**

- [ ]* 5.2 Write property test for stage selection
  - **Property 5: Stage click updates selection**
  - **Validates: Requirements 3.4**

- [ ]* 5.3 Write property test for cache invalidation
  - **Property 6: Mutation success invalidates cache**
  - **Validates: Requirements 3.3**

- [x] 6. Implement task count badges




  - Create getTasksForStage helper function to filter tasks by stage tag
  - Calculate completed and total task counts per stage
  - Render badge below stage node when tasks exist
  - Format badge text as "completed/total"
  - Apply translucent background styling to badge
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 6.1 Write property test for task filtering
  - **Property 7: Task filtering by stage**
  - **Validates: Requirements 4.2**

- [ ]* 6.2 Write property test for task count format
  - **Property 8: Task count badge displays correct format**
  - **Validates: Requirements 4.1, 4.4**

- [x] 7. Implement stage details panel





  - Conditionally render GlassCard when selectedStage is not null
  - Display stage icon, name, and task count in header
  - Map and render task list using getTasksForStage
  - Show task title, description, assigned user, and status for each task
  - Use CheckCircle2 icon for done tasks, Circle for others
  - Display "No tasks for this stage yet" when task list is empty
  - Add "Assign Task" button in header
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 7.1 Write property test for details panel rendering
  - **Property 9: Selected stage shows details panel**
  - **Validates: Requirements 5.1**

- [ ]* 7.2 Write property test for task information display
  - **Property 10: Task display includes all information**
  - **Validates: Requirements 5.2**

- [ ]* 7.3 Write property test for task status icons
  - **Property 11: Task completion status determines icon**
  - **Validates: Requirements 5.3**


- [x] 8. Implement user name display in tasks




  - Fetch users list using React Query
  - Find user by assigned_to ID in task
  - Display user's full_name or email if found
  - Display "Unknown" if user not found
  - _Requirements: 7.1, 7.2, 7.3_

- [ ]* 8.1 Write property test for user display
  - **Property 16: User display shows name or email**
  - **Validates: Requirements 7.1**

- [x] 9. Implement task assignment dialog





  - Create Dialog component with form fields
  - Add controlled input for task title
  - Add controlled Textarea for task description
  - Add Select component for user assignment
  - Populate Select with users from query
  - Control dialog open state with taskDialogOpen
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 10. Implement task creation logic





  - Create handleCreateTask function
  - Validate that title is not empty before submission
  - Call createTaskMutation with form data
  - Set project_id to current project
  - Set status to "todo"
  - Add selectedStage.id to tags array
  - Handle mutation success: close dialog, reset form, invalidate tasks query
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [ ]* 10.1 Write property test for title validation
  - **Property 12: Task creation requires title**
  - **Validates: Requirements 6.2**

- [ ]* 10.2 Write property test for optional fields
  - **Property 13: Task creation accepts optional fields**
  - **Validates: Requirements 6.3**

- [ ]* 10.3 Write property test for task defaults
  - **Property 14: Task creation sets correct defaults**
  - **Validates: Requirements 6.4, 6.5, 6.6**

- [ ]* 10.4 Write property test for UI reset
  - **Property 15: Task creation success resets UI**
  - **Validates: Requirements 6.7, 6.8**

- [x] 11. Integrate DevOpsLifecycle into DevOps page





  - Import DevOpsLifecycle component in src/pages/DevOps.tsx
  - Pass current project as prop to DevOpsLifecycle
  - Position component below existing DevOps metrics
  - Ensure proper spacing and layout
  - _Requirements: 8.4_

- [ ]* 11.1 Write property test for API client usage
  - **Property 18: API client used for all operations**
  - **Validates: Requirements 8.4**



- [x] 12. Add error handling and loading states



  - Add error boundaries for component failures
  - Display loading spinners during data fetching
  - Show error messages for failed mutations
  - Add retry buttons for failed operations
  - Handle edge cases (no project, no users, no tasks)
  - _Requirements: All error handling requirements_

- [ ]* 12.1 Write unit tests for error handling
  - Test API error display
  - Test form validation errors
  - Test edge case handling
  - Test loading states

- [x] 13. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.
