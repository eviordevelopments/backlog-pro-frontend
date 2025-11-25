import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { AppProvider, useApp } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { Sprint, Task } from '@/types';
import { setupMockLocalStorage } from '../utils/test-helpers';

describe('Sprint CRUD Operations', () => {
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

  describe('6.1 Sprint Creation', () => {
    it('should store sprint with name, dates, and goal', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newSprint: Sprint = {
        id: '',
        name: 'Sprint 1',
        goal: 'Complete user authentication',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        velocity: 0,
        committedPoints: 0,
        completedPoints: 0,
        status: 'planned',
      };

      act(() => {
        result.current.addSprint(newSprint);
      });

      expect(result.current.sprints).toHaveLength(1);
      expect(result.current.sprints[0].name).toBe('Sprint 1');
      expect(result.current.sprints[0].goal).toBe('Complete user authentication');
      expect(result.current.sprints[0].startDate).toBe('2024-01-01');
      expect(result.current.sprints[0].endDate).toBe('2024-01-14');
    });

    it('should assign unique ID when sprint has no ID', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newSprint: Sprint = {
        id: '',
        name: 'Sprint 1',
        goal: 'Complete user authentication',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        velocity: 0,
        committedPoints: 0,
        completedPoints: 0,
        status: 'planned',
      };

      act(() => {
        result.current.addSprint(newSprint);
      });

      expect(result.current.sprints[0].id).toBeTruthy();
      expect(result.current.sprints[0].id).not.toBe('');
    });

    it('should throw error when name is missing', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const invalidSprint: Sprint = {
        id: '',
        name: '',
        goal: 'Complete user authentication',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        velocity: 0,
        committedPoints: 0,
        completedPoints: 0,
        status: 'planned',
      };

      expect(() => {
        act(() => {
          result.current.addSprint(invalidSprint);
        });
      }).toThrow('Sprint name is required');
    });

    it('should throw error when start date is missing', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const invalidSprint: Sprint = {
        id: '',
        name: 'Sprint 1',
        goal: 'Complete user authentication',
        startDate: '',
        endDate: '2024-01-14',
        velocity: 0,
        committedPoints: 0,
        completedPoints: 0,
        status: 'planned',
      };

      expect(() => {
        act(() => {
          result.current.addSprint(invalidSprint);
        });
      }).toThrow('Sprint start date is required');
    });

    it('should throw error when end date is missing', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const invalidSprint: Sprint = {
        id: '',
        name: 'Sprint 1',
        goal: 'Complete user authentication',
        startDate: '2024-01-01',
        endDate: '',
        velocity: 0,
        committedPoints: 0,
        completedPoints: 0,
        status: 'planned',
      };

      expect(() => {
        act(() => {
          result.current.addSprint(invalidSprint);
        });
      }).toThrow('Sprint end date is required');
    });

    it('should throw error when goal is missing', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const invalidSprint: Sprint = {
        id: '',
        name: 'Sprint 1',
        goal: '',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        velocity: 0,
        committedPoints: 0,
        completedPoints: 0,
        status: 'planned',
      };

      expect(() => {
        act(() => {
          result.current.addSprint(invalidSprint);
        });
      }).toThrow('Sprint goal is required');
    });
  });

  describe('6.3 Sprint Assignment Validation', () => {
    it('should allow task with valid sprintId', () => {
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

      const task: Task = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test Description',
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
        result.current.addTask(task);
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].sprintId).toBe('sprint-1');
    });

    it('should allow task with undefined sprintId', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const task: Task = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'medium',
        storyPoints: 5,
        assignedTo: 'Pedro',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        sprintId: undefined,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      act(() => {
        result.current.addTask(task);
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].sprintId).toBeUndefined();
    });

    it('should throw error when sprintId references non-existent sprint', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const task: Task = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'medium',
        storyPoints: 5,
        assignedTo: 'Pedro',
        estimatedDate: '2024-12-31',
        tags: ['test'],
        sprintId: 'non-existent-sprint',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      expect(() => {
        act(() => {
          result.current.addTask(task);
        });
      }).toThrow('Sprint with id "non-existent-sprint" does not exist');
    });

    it('should validate sprintId on task update', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const task: Task = {
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
        result.current.addTask(task);
      });

      expect(() => {
        act(() => {
          result.current.updateTask('task-1', { sprintId: 'non-existent-sprint' });
        });
      }).toThrow('Sprint with id "non-existent-sprint" does not exist');
    });
  });

  describe('6.11 Sprint Date Updates', () => {
    it('should modify sprint timeline dates', () => {
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

      act(() => {
        result.current.updateSprint('sprint-1', {
          startDate: '2024-02-01',
          endDate: '2024-02-14',
        });
      });

      expect(result.current.sprints[0].startDate).toBe('2024-02-01');
      expect(result.current.sprints[0].endDate).toBe('2024-02-14');
    });

    it('should throw error when updating to empty start date', () => {
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

      expect(() => {
        act(() => {
          result.current.updateSprint('sprint-1', { startDate: '' });
        });
      }).toThrow('Sprint start date cannot be empty');
    });

    it('should throw error when updating to empty end date', () => {
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

      expect(() => {
        act(() => {
          result.current.updateSprint('sprint-1', { endDate: '' });
        });
      }).toThrow('Sprint end date cannot be empty');
    });

    it('should preserve other sprint properties when updating dates', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const sprint: Sprint = {
        id: 'sprint-1',
        name: 'Sprint 1',
        goal: 'Complete features',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        velocity: 25,
        committedPoints: 30,
        completedPoints: 20,
        status: 'active',
      };

      act(() => {
        result.current.addSprint(sprint);
      });

      act(() => {
        result.current.updateSprint('sprint-1', {
          startDate: '2024-02-01',
          endDate: '2024-02-14',
        });
      });

      expect(result.current.sprints[0].name).toBe('Sprint 1');
      expect(result.current.sprints[0].goal).toBe('Complete features');
      expect(result.current.sprints[0].velocity).toBe(25);
      expect(result.current.sprints[0].committedPoints).toBe(30);
      expect(result.current.sprints[0].completedPoints).toBe(20);
      expect(result.current.sprints[0].status).toBe('active');
    });
  });
});
