import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { AppProvider, useApp } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { Task } from '@/types';
import { setupMockLocalStorage } from '../utils/test-helpers';

describe('Task CRUD Operations', () => {
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

  describe('2.1 Task Creation', () => {
    it('should add task to state array', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newTask: Task = {
        id: '',
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'medium',
        storyPoints: 5,
        assignedTo: 'Pedro',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        createdAt: '',
      };

      act(() => {
        result.current.addTask(newTask);
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].title).toBe('Test Task');
    });

    it('should assign unique ID when task has no ID', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newTask: Task = {
        id: '',
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'medium',
        storyPoints: 5,
        assignedTo: 'Pedro',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        createdAt: '',
      };

      act(() => {
        result.current.addTask(newTask);
      });

      expect(result.current.tasks[0].id).toBeTruthy();
      expect(result.current.tasks[0].id).not.toBe('');
    });

    it('should assign createdAt timestamp when task has no timestamp', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newTask: Task = {
        id: '',
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'medium',
        storyPoints: 5,
        assignedTo: 'Pedro',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        createdAt: '',
      };

      const beforeTime = new Date().toISOString();

      act(() => {
        result.current.addTask(newTask);
      });

      const afterTime = new Date().toISOString();

      expect(result.current.tasks[0].createdAt).toBeTruthy();
      expect(result.current.tasks[0].createdAt).not.toBe('');
      expect(result.current.tasks[0].createdAt >= beforeTime).toBe(true);
      expect(result.current.tasks[0].createdAt <= afterTime).toBe(true);
    });

    it('should preserve provided ID if task already has one', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newTask: Task = {
        id: 'custom-id-123',
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'medium',
        storyPoints: 5,
        assignedTo: 'Pedro',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      act(() => {
        result.current.addTask(newTask);
      });

      expect(result.current.tasks[0].id).toBe('custom-id-123');
      expect(result.current.tasks[0].createdAt).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('2.3 Task Update', () => {
    it('should modify task properties', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newTask: Task = {
        id: 'task-1',
        title: 'Original Title',
        description: 'Original Description',
        status: 'todo',
        priority: 'low',
        storyPoints: 3,
        assignedTo: 'Pedro',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      act(() => {
        result.current.addTask(newTask);
      });

      act(() => {
        result.current.updateTask('task-1', {
          title: 'Updated Title',
          priority: 'high',
          storyPoints: 8,
        });
      });

      expect(result.current.tasks[0].title).toBe('Updated Title');
      expect(result.current.tasks[0].priority).toBe('high');
      expect(result.current.tasks[0].storyPoints).toBe(8);
      expect(result.current.tasks[0].description).toBe('Original Description');
    });

    it('should ensure task ID remains unchanged', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newTask: Task = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'medium',
        storyPoints: 5,
        assignedTo: 'Pedro',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      act(() => {
        result.current.addTask(newTask);
      });

      act(() => {
        result.current.updateTask('task-1', {
          id: 'different-id',
          title: 'Updated Title',
        } as Task);
      });

      expect(result.current.tasks[0].id).toBe('task-1');
      expect(result.current.tasks[0].title).toBe('Updated Title');
    });

    it('should not affect other tasks', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

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
        createdAt: '2024-01-02T00:00:00.000Z',
      };

      act(() => {
        result.current.addTask(task1);
        result.current.addTask(task2);
      });

      act(() => {
        result.current.updateTask('task-1', { title: 'Updated Task 1' });
      });

      expect(result.current.tasks[0].title).toBe('Updated Task 1');
      expect(result.current.tasks[1].title).toBe('Task 2');
      expect(result.current.tasks[1].description).toBe('Description 2');
    });
  });

  describe('2.5 Task Deletion', () => {
    it('should remove task from state', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newTask: Task = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'medium',
        storyPoints: 5,
        assignedTo: 'Pedro',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      act(() => {
        result.current.addTask(newTask);
      });

      expect(result.current.tasks).toHaveLength(1);

      act(() => {
        result.current.deleteTask('task-1');
      });

      expect(result.current.tasks).toHaveLength(0);
    });

    it('should only remove the specified task', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

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
        createdAt: '2024-01-03T00:00:00.000Z',
      };

      act(() => {
        result.current.addTask(task1);
        result.current.addTask(task2);
        result.current.addTask(task3);
      });

      expect(result.current.tasks).toHaveLength(3);

      act(() => {
        result.current.deleteTask('task-2');
      });

      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks.find(t => t.id === 'task-1')).toBeTruthy();
      expect(result.current.tasks.find(t => t.id === 'task-2')).toBeUndefined();
      expect(result.current.tasks.find(t => t.id === 'task-3')).toBeTruthy();
    });

    it('should handle deletion of non-existent task gracefully', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newTask: Task = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'medium',
        storyPoints: 5,
        assignedTo: 'Pedro',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      act(() => {
        result.current.addTask(newTask);
      });

      expect(result.current.tasks).toHaveLength(1);

      act(() => {
        result.current.deleteTask('non-existent-id');
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].id).toBe('task-1');
    });
  });
});
