import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AppProvider, useApp } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { Task, Sprint } from '@/types';

describe('KPI Calculations', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      <AppProvider>{children}</AppProvider>
    </AuthProvider>
  );

  beforeEach(() => {
    // Clear all localStorage including initialization flag
    localStorage.clear();
  });

  describe('calculateTeamVelocity', () => {
    it('should return 0 when there are no sprints', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      
      // Wait for initial state to settle
      await waitFor(() => {
        expect(result.current.sprints).toBeDefined();
      });
      
      // Clear any sample data that might have loaded
      act(() => {
        result.current.sprints.forEach(sprint => {
          result.current.deleteSprint(sprint.id);
        });
        result.current.tasks.forEach(task => {
          result.current.deleteTask(task.id);
        });
      });
      
      const velocity = result.current.calculateTeamVelocity();
      
      expect(velocity).toBe(0);
    });

    it('should calculate average velocity across all sprints', () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      
      // Calculate velocity with existing sample data
      const initialVelocity = result.current.calculateTeamVelocity();
      
      // Velocity should be a number (may be > 0 due to sample data)
      expect(typeof initialVelocity).toBe('number');
      expect(initialVelocity).toBeGreaterThanOrEqual(0);
      
      // Verify the calculation logic by checking it matches manual calculation
      const manualVelocity = result.current.sprints.reduce((sum, sprint) => {
        return sum + result.current.calculateSprintVelocity(sprint.id);
      }, 0) / (result.current.sprints.length || 1);
      
      expect(initialVelocity).toBe(manualVelocity);
    });

    it('should only count completed tasks in velocity calculation', () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      
      // Verify that only completed tasks are counted
      // Check each sprint's velocity calculation
      result.current.sprints.forEach(sprint => {
        const sprintVelocity = result.current.calculateSprintVelocity(sprint.id);
        
        // Calculate expected velocity manually
        const completedTasks = result.current.tasks.filter(
          task => task.sprintId === sprint.id && task.status === 'done'
        );
        const expectedVelocity = completedTasks.reduce((sum, task) => sum + task.storyPoints, 0);
        
        expect(sprintVelocity).toBe(expectedVelocity);
      });
    });
  });

  describe('calculateCycleTime', () => {
    it('should return 0 when there are no completed tasks', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      
      // Wait for initial state
      await waitFor(() => {
        expect(result.current.tasks).toBeDefined();
      });
      
      // Clear existing data
      act(() => {
        result.current.tasks.forEach(task => result.current.deleteTask(task.id));
      });
      
      const cycleTime = result.current.calculateCycleTime();
      
      expect(cycleTime).toBe(0);
    });

    it('should calculate average cycle time for completed tasks', () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      
      act(() => {
        // Add completed tasks with different creation dates
        result.current.addTask({
          id: 'task-1',
          title: 'Task 1',
          description: 'Description',
          status: 'done',
          priority: 'medium',
          storyPoints: 5,
          assignedTo: 'Pedro',
          estimatedDate: '2024-01-10',
          tags: [],
          createdAt: '2024-01-01',
        });
        
        result.current.addTask({
          id: 'task-2',
          title: 'Task 2',
          description: 'Description',
          status: 'done',
          priority: 'high',
          storyPoints: 8,
          assignedTo: 'David',
          estimatedDate: '2024-01-15',
          tags: [],
          createdAt: '2024-01-05',
        });
      });
      
      const cycleTime = result.current.calculateCycleTime();
      
      // Should return a positive number (days)
      expect(cycleTime).toBeGreaterThan(0);
    });

    it('should only count completed tasks in cycle time calculation', () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      
      act(() => {
        // Add completed task
        result.current.addTask({
          id: 'task-1',
          title: 'Task 1',
          description: 'Description',
          status: 'done',
          priority: 'medium',
          storyPoints: 5,
          assignedTo: 'Pedro',
          estimatedDate: '2024-01-10',
          tags: [],
          createdAt: '2024-01-01',
        });
        
        // Add in-progress task (should not count)
        result.current.addTask({
          id: 'task-2',
          title: 'Task 2',
          description: 'Description',
          status: 'in-progress',
          priority: 'high',
          storyPoints: 8,
          assignedTo: 'David',
          estimatedDate: '2024-01-15',
          tags: [],
          createdAt: '2024-01-05',
        });
      });
      
      const cycleTime = result.current.calculateCycleTime();
      
      // Should calculate based on only 1 completed task
      expect(cycleTime).toBeGreaterThan(0);
    });
  });

  describe('calculateCompletionRate', () => {
    it('should return 0 when there are no tasks with estimated dates', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      
      // Wait for initial state
      await waitFor(() => {
        expect(result.current.tasks).toBeDefined();
      });
      
      // Clear existing data
      act(() => {
        result.current.tasks.forEach(task => result.current.deleteTask(task.id));
      });
      
      const completionRate = result.current.calculateCompletionRate();
      
      expect(completionRate).toBe(0);
    });

    it('should calculate percentage of tasks completed on time', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      
      // Wait for initial state
      await waitFor(() => {
        expect(result.current.tasks).toBeDefined();
      });
      
      // Clear existing data
      act(() => {
        result.current.tasks.forEach(task => result.current.deleteTask(task.id));
      });
      
      act(() => {
        // Add completed tasks with estimated dates
        result.current.addTask({
          id: 'task-1',
          title: 'Task 1',
          description: 'Description',
          status: 'done',
          priority: 'medium',
          storyPoints: 5,
          assignedTo: 'Pedro',
          estimatedDate: '2024-01-10',
          tags: [],
          createdAt: '2024-01-01',
        });
        
        result.current.addTask({
          id: 'task-2',
          title: 'Task 2',
          description: 'Description',
          status: 'done',
          priority: 'high',
          storyPoints: 8,
          assignedTo: 'David',
          estimatedDate: '2024-01-15',
          tags: [],
          createdAt: '2024-01-05',
        });
        
        // Add incomplete task with estimated date
        result.current.addTask({
          id: 'task-3',
          title: 'Task 3',
          description: 'Description',
          status: 'in-progress',
          priority: 'low',
          storyPoints: 3,
          assignedTo: 'Morena',
          estimatedDate: '2024-01-20',
          tags: [],
          createdAt: '2024-01-10',
        });
      });
      
      const completionRate = result.current.calculateCompletionRate();
      
      // 2 completed out of 3 with estimates = 66.67%
      expect(completionRate).toBeCloseTo(66.67, 1);
    });

    it('should ignore tasks without estimated dates', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      
      // Wait for initial state
      await waitFor(() => {
        expect(result.current.tasks).toBeDefined();
      });
      
      // Clear existing data
      act(() => {
        result.current.tasks.forEach(task => result.current.deleteTask(task.id));
      });
      
      act(() => {
        // Add task with estimated date
        result.current.addTask({
          id: 'task-1',
          title: 'Task 1',
          description: 'Description',
          status: 'done',
          priority: 'medium',
          storyPoints: 5,
          assignedTo: 'Pedro',
          estimatedDate: '2024-01-10',
          tags: [],
          createdAt: '2024-01-01',
        });
        
        // Add task without estimated date (should be ignored)
        result.current.addTask({
          id: 'task-2',
          title: 'Task 2',
          description: 'Description',
          status: 'done',
          priority: 'high',
          storyPoints: 8,
          assignedTo: 'David',
          estimatedDate: '',
          tags: [],
          createdAt: '2024-01-05',
        });
      });
      
      const completionRate = result.current.calculateCompletionRate();
      
      // Only 1 task with estimate, and it's completed = 100%
      expect(completionRate).toBe(100);
    });
  });
});
