import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useApp } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { Task } from '@/types';

describe('Kanban Status Update via Drag and Drop', () => {
  beforeEach(() => {
    // Clear all localStorage including initialization flag
    localStorage.clear();
  });

  it('should update task status when dragged to a different column (Requirements 3.2, 3.3)', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>
        <AppProvider>{children}</AppProvider>
      </AuthProvider>
    );

    const { result } = renderHook(() => useApp(), { wrapper });

    // Create a task in "todo" status
    const testTask: Task = {
      id: 'test-task-drag-1',
      title: 'Test Task for Drag',
      description: 'A test task for drag and drop',
      status: 'todo',
      priority: 'medium',
      storyPoints: 3,
      assignedTo: 'Pedro',
      estimatedDate: '2024-12-31',
      tags: [],
      createdAt: new Date().toISOString(),
    };

    // Add the task
    act(() => {
      result.current.addTask(testTask);
    });

    // Find the task we just added
    const addedTask = result.current.tasks.find(t => t.id === 'test-task-drag-1');
    expect(addedTask).toBeDefined();
    expect(addedTask?.status).toBe('todo');

    // Simulate drag and drop to "in-progress" column
    act(() => {
      result.current.updateTask('test-task-drag-1', { status: 'in-progress' });
    });

    // Verify task status was updated
    const updatedTask = result.current.tasks.find(t => t.id === 'test-task-drag-1');
    expect(updatedTask?.status).toBe('in-progress');
    
    // Verify the change persists in localStorage (Requirement 3.3)
    const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const savedTask = savedTasks.find((t: Task) => t.id === 'test-task-drag-1');
    expect(savedTask?.status).toBe('in-progress');
  });

  it('should update task status through all workflow stages', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>
        <AppProvider>{children}</AppProvider>
      </AuthProvider>
    );

    const { result } = renderHook(() => useApp(), { wrapper });

    // Create a task
    const testTask: Task = {
      id: 'workflow-task-unique',
      title: 'Workflow Task',
      description: 'Testing workflow',
      status: 'todo',
      priority: 'high',
      storyPoints: 5,
      assignedTo: 'Morena',
      estimatedDate: '2024-12-31',
      tags: [],
      createdAt: new Date().toISOString(),
    };

    act(() => {
      result.current.addTask(testTask);
    });

    // Move through workflow: todo -> in-progress -> review -> done
    const statuses: Array<'todo' | 'in-progress' | 'review' | 'done'> = [
      'in-progress',
      'review',
      'done',
    ];

    statuses.forEach((status) => {
      act(() => {
        result.current.updateTask('workflow-task-unique', { status });
      });

      const task = result.current.tasks.find(t => t.id === 'workflow-task-unique');
      expect(task?.status).toBe(status);
    });
  });

  it('should maintain task properties when status is updated', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>
        <AppProvider>{children}</AppProvider>
      </AuthProvider>
    );

    const { result } = renderHook(() => useApp(), { wrapper });

    const testTask: Task = {
      id: 'property-test-unique',
      title: 'Property Test Task',
      description: 'Testing property preservation',
      status: 'todo',
      priority: 'critical',
      storyPoints: 8,
      assignedTo: 'Franco',
      estimatedDate: '2024-12-31',
      tags: ['backend', 'urgent'],
      createdAt: new Date().toISOString(),
    };

    act(() => {
      result.current.addTask(testTask);
    });

    // Update status
    act(() => {
      result.current.updateTask('property-test-unique', { status: 'in-progress' });
    });

    const updatedTask = result.current.tasks.find(t => t.id === 'property-test-unique');
    expect(updatedTask).toBeDefined();

    // Verify all other properties remain unchanged
    expect(updatedTask?.id).toBe('property-test-unique');
    expect(updatedTask?.title).toBe('Property Test Task');
    expect(updatedTask?.description).toBe('Testing property preservation');
    expect(updatedTask?.priority).toBe('critical');
    expect(updatedTask?.storyPoints).toBe(8);
    expect(updatedTask?.assignedTo).toBe('Franco');
    expect(updatedTask?.tags).toEqual(['backend', 'urgent']);
    expect(updatedTask?.status).toBe('in-progress');
  });
});
