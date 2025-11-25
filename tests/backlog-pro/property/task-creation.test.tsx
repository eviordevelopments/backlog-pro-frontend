import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { act, renderHook } from '@testing-library/react';
import { setupMockLocalStorage } from '../utils/test-helpers';
import { taskArb } from '../utils/generators';
import { AppProvider, useApp } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { ReactNode } from 'react';

// **Feature: backlog-pro-system, Property 1: Task creation adds to list**
// **Validates: Requirements 1.1**
describe('Property 1: Task creation adds to list', () => {
  beforeEach(() => {
    setupMockLocalStorage();
    localStorage.clear();
  });

  it('should add task to list for any valid task', () => {
    fc.assert(
      fc.property(taskArb({ sprintId: undefined, storyId: undefined }), (task) => {
        // Render the hook with AuthProvider and AppProvider wrapper
        const wrapper = ({ children }: { children: ReactNode }) => (
          <AuthProvider>
            <AppProvider>{children}</AppProvider>
          </AuthProvider>
        );
        
        const { result } = renderHook(() => useApp(), { wrapper });
        
        // Get initial state
        const initialLength = result.current.tasks.length;
        
        // Add the task
        act(() => {
          result.current.addTask(task);
        });
        
        // Get final state
        const finalLength = result.current.tasks.length;
        const addedTask = result.current.tasks.find(
          t => t.title === task.title && t.description === task.description
        );
        
        // Property 1: Task list length should increase by one
        expect(finalLength).toBe(initialLength + 1);
        
        // Property 2: The new task should be present in the list
        expect(addedTask).toBeDefined();
        
        // Property 3: All task properties should be intact (excluding auto-generated id and createdAt)
        if (addedTask) {
          expect(addedTask.title).toBe(task.title);
          expect(addedTask.description).toBe(task.description);
          expect(addedTask.status).toBe(task.status);
          expect(addedTask.priority).toBe(task.priority);
          expect(addedTask.storyPoints).toBe(task.storyPoints);
          expect(addedTask.assignedTo).toBe(task.assignedTo);
          expect(addedTask.estimatedDate).toBe(task.estimatedDate);
          expect(addedTask.tags).toEqual(task.tags);
          expect(addedTask.sprintId).toBe(task.sprintId);
          expect(addedTask.storyId).toBe(task.storyId);
          // id and createdAt are auto-generated, so we just verify they exist
          expect(addedTask.id).toBeDefined();
          expect(addedTask.createdAt).toBeDefined();
        }
      }),
      { numRuns: 100 }
    );
  });
});
