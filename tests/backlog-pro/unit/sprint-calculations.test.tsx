import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { AppProvider, useApp } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { Sprint, Task } from '@/types';
import { setupMockLocalStorage } from '../utils/test-helpers';

describe('Sprint Calculation Functions', () => {
  beforeEach(() => {
    setupMockLocalStorage();
    localStorage.clear();
    // Prevent sample data initialization
    localStorage.setItem('hasInitialized', 'true');
    // Initialize empty arrays for all entities
    localStorage.setItem('tasks', '[]');
    localStorage.setItem('userStories', '[]');
    localStorage.setItem('sprints', '[]');
    localStorage.setItem('risks', '[]');
    localStorage.setItem('profitShares', '[]');
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      <AppProvider>{children}</AppProvider>
    </AuthProvider>
  );

  describe('6.5 Sprint Story Points Calculation', () => {
    it('should calculate total committed points from assigned tasks', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const sprint: Sprint = {
        id: 'sprint-1',
        name: 'Sprint 1',
        goal: 'Complete features',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        velocity: 0,
        committedPoints: 0,
        completedPoints: 0,
        status: 'active',
      };

      act(() => {
        result.current.addSprint(sprint);
      });

      const task1: Task = {
        id: 'task-1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'todo',
        priority: 'medium',
        storyPoints: 5,
        assignedTo: 'Pedro',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        sprintId: 'sprint-1',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const task2: Task = {
        id: 'task-2',
        title: 'Task 2',
        description: 'Description 2',
        status: 'in-progress',
        priority: 'high',
        storyPoints: 8,
        assignedTo: 'David',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        sprintId: 'sprint-1',
        createdAt: '2024-01-02T00:00:00.000Z',
      };

      const task3: Task = {
        id: 'task-3',
        title: 'Task 3',
        description: 'Description 3',
        status: 'done',
        priority: 'low',
        storyPoints: 3,
        assignedTo: 'Morena',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        sprintId: 'sprint-1',
        createdAt: '2024-01-03T00:00:00.000Z',
      };

      act(() => {
        result.current.addTask(task1);
        result.current.addTask(task2);
        result.current.addTask(task3);
      });

      const committedPoints = result.current.calculateSprintCommittedPoints('sprint-1');
      expect(committedPoints).toBe(16); // 5 + 8 + 3
    });

    it('should return 0 for sprint with no tasks', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const sprint: Sprint = {
        id: 'sprint-1',
        name: 'Sprint 1',
        goal: 'Complete features',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        velocity: 0,
        committedPoints: 0,
        completedPoints: 0,
        status: 'planned',
      };

      act(() => {
        result.current.addSprint(sprint);
      });

      const committedPoints = result.current.calculateSprintCommittedPoints('sprint-1');
      expect(committedPoints).toBe(0);
    });


  });

  describe('6.7 Sprint Progress Calculation', () => {
    it('should calculate remaining points and progress percentage', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const sprint: Sprint = {
        id: 'sprint-1',
        name: 'Sprint 1',
        goal: 'Complete features',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        velocity: 0,
        committedPoints: 0,
        completedPoints: 0,
        status: 'active',
      };

      act(() => {
        result.current.addSprint(sprint);
      });

      const task1: Task = {
        id: 'task-1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'done',
        priority: 'medium',
        storyPoints: 5,
        assignedTo: 'Pedro',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        sprintId: 'sprint-1',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const task2: Task = {
        id: 'task-2',
        title: 'Task 2',
        description: 'Description 2',
        status: 'in-progress',
        priority: 'high',
        storyPoints: 8,
        assignedTo: 'David',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        sprintId: 'sprint-1',
        createdAt: '2024-01-02T00:00:00.000Z',
      };

      const task3: Task = {
        id: 'task-3',
        title: 'Task 3',
        description: 'Description 3',
        status: 'done',
        priority: 'low',
        storyPoints: 3,
        assignedTo: 'Morena',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        sprintId: 'sprint-1',
        createdAt: '2024-01-03T00:00:00.000Z',
      };

      act(() => {
        result.current.addTask(task1);
        result.current.addTask(task2);
        result.current.addTask(task3);
      });

      const progress = result.current.calculateSprintProgress('sprint-1');
      
      // Committed: 5 + 8 + 3 = 16
      // Completed: 5 + 3 = 8
      // Remaining: 16 - 8 = 8
      // Progress: (8 / 16) * 100 = 50%
      expect(progress.remainingPoints).toBe(8);
      expect(progress.progressPercentage).toBe(50);
    });

    it('should return 0% progress for sprint with no completed tasks', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const sprint: Sprint = {
        id: 'sprint-1',
        name: 'Sprint 1',
        goal: 'Complete features',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        velocity: 0,
        committedPoints: 0,
        completedPoints: 0,
        status: 'active',
      };

      act(() => {
        result.current.addSprint(sprint);
      });

      const task1: Task = {
        id: 'task-1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'todo',
        priority: 'medium',
        storyPoints: 5,
        assignedTo: 'Pedro',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        sprintId: 'sprint-1',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      act(() => {
        result.current.addTask(task1);
      });

      const progress = result.current.calculateSprintProgress('sprint-1');
      
      expect(progress.remainingPoints).toBe(5);
      expect(progress.progressPercentage).toBe(0);
    });

    it('should return 100% progress when all tasks are done', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const sprint: Sprint = {
        id: 'sprint-1',
        name: 'Sprint 1',
        goal: 'Complete features',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        velocity: 0,
        committedPoints: 0,
        completedPoints: 0,
        status: 'active',
      };

      act(() => {
        result.current.addSprint(sprint);
      });

      const task1: Task = {
        id: 'task-1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'done',
        priority: 'medium',
        storyPoints: 5,
        assignedTo: 'Pedro',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        sprintId: 'sprint-1',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const task2: Task = {
        id: 'task-2',
        title: 'Task 2',
        description: 'Description 2',
        status: 'done',
        priority: 'high',
        storyPoints: 8,
        assignedTo: 'David',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        sprintId: 'sprint-1',
        createdAt: '2024-01-02T00:00:00.000Z',
      };

      act(() => {
        result.current.addTask(task1);
        result.current.addTask(task2);
      });

      const progress = result.current.calculateSprintProgress('sprint-1');
      
      expect(progress.remainingPoints).toBe(0);
      expect(progress.progressPercentage).toBe(100);
    });

    it('should return 0% progress for sprint with no tasks', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const sprint: Sprint = {
        id: 'sprint-1',
        name: 'Sprint 1',
        goal: 'Complete features',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        velocity: 0,
        committedPoints: 0,
        completedPoints: 0,
        status: 'planned',
      };

      act(() => {
        result.current.addSprint(sprint);
      });

      const progress = result.current.calculateSprintProgress('sprint-1');
      
      expect(progress.remainingPoints).toBe(0);
      expect(progress.progressPercentage).toBe(0);
    });
  });

  describe('6.9 Sprint Velocity Calculation', () => {
    it('should calculate velocity from completed story points', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const sprint: Sprint = {
        id: 'sprint-1',
        name: 'Sprint 1',
        goal: 'Complete features',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        velocity: 0,
        committedPoints: 0,
        completedPoints: 0,
        status: 'completed',
      };

      act(() => {
        result.current.addSprint(sprint);
      });

      const task1: Task = {
        id: 'task-1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'done',
        priority: 'medium',
        storyPoints: 5,
        assignedTo: 'Pedro',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        sprintId: 'sprint-1',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const task2: Task = {
        id: 'task-2',
        title: 'Task 2',
        description: 'Description 2',
        status: 'in-progress',
        priority: 'high',
        storyPoints: 8,
        assignedTo: 'David',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        sprintId: 'sprint-1',
        createdAt: '2024-01-02T00:00:00.000Z',
      };

      const task3: Task = {
        id: 'task-3',
        title: 'Task 3',
        description: 'Description 3',
        status: 'done',
        priority: 'low',
        storyPoints: 3,
        assignedTo: 'Morena',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        sprintId: 'sprint-1',
        createdAt: '2024-01-03T00:00:00.000Z',
      };

      act(() => {
        result.current.addTask(task1);
        result.current.addTask(task2);
        result.current.addTask(task3);
      });

      const velocity = result.current.calculateSprintVelocity('sprint-1');
      
      // Only completed tasks: 5 + 3 = 8
      expect(velocity).toBe(8);
    });

    it('should return 0 velocity for sprint with no completed tasks', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const sprint: Sprint = {
        id: 'sprint-1',
        name: 'Sprint 1',
        goal: 'Complete features',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        velocity: 0,
        committedPoints: 0,
        completedPoints: 0,
        status: 'active',
      };

      act(() => {
        result.current.addSprint(sprint);
      });

      const task1: Task = {
        id: 'task-1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'todo',
        priority: 'medium',
        storyPoints: 5,
        assignedTo: 'Pedro',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        sprintId: 'sprint-1',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      act(() => {
        result.current.addTask(task1);
      });

      const velocity = result.current.calculateSprintVelocity('sprint-1');
      expect(velocity).toBe(0);
    });


  });
});
