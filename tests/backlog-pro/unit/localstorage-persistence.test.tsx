import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, cleanup } from '@testing-library/react';
import { AppProvider, useApp } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { setupMockLocalStorage } from '../utils/test-helpers';

describe('localStorage Persistence', () => {
  beforeEach(() => {
    setupMockLocalStorage();
    localStorage.clear();
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

  describe('Empty localStorage initialization', () => {
    it('should load sample data when localStorage is empty (Requirement 10.5)', () => {
      // Ensure localStorage is completely empty
      localStorage.clear();
      
      // Render the hook which should trigger initialization
      const { result } = renderHook(() => useApp(), { wrapper });
      
      // Wait for initialization to complete
      // The sample data should be loaded from sampleData.ts
      
      // Verify that sample data was loaded into localStorage
      const savedTasks = localStorage.getItem('tasks');
      const savedUserStories = localStorage.getItem('userStories');
      const savedSprints = localStorage.getItem('sprints');
      const savedRisks = localStorage.getItem('risks');
      
      expect(savedTasks).toBeTruthy();
      expect(savedUserStories).toBeTruthy();
      expect(savedSprints).toBeTruthy();
      expect(savedRisks).toBeTruthy();
      
      // Verify the data is not empty
      const tasks = JSON.parse(savedTasks!);
      const userStories = JSON.parse(savedUserStories!);
      const sprints = JSON.parse(savedSprints!);
      const risks = JSON.parse(savedRisks!);
      
      expect(tasks.length).toBeGreaterThan(0);
      expect(userStories.length).toBeGreaterThan(0);
      expect(sprints.length).toBeGreaterThan(0);
      expect(risks.length).toBeGreaterThan(0);
      
      // Verify the hasInitialized flag was set
      expect(localStorage.getItem('hasInitialized')).toBe('true');
    });

    it('should not overwrite existing data when localStorage has data', () => {
      // Set up existing data in localStorage
      const existingTasks = [
        {
          id: 'existing-1',
          title: 'Existing Task',
          description: 'This task already exists',
          status: 'todo',
          priority: 'high',
          storyPoints: 5,
          assignedTo: 'Pedro',
          estimatedDate: '2025-12-01',
          tags: ['test'],
          createdAt: '2025-11-01T10:00:00Z',
        },
      ];
      
      localStorage.setItem('tasks', JSON.stringify(existingTasks));
      localStorage.setItem('userStories', '[]');
      localStorage.setItem('sprints', '[]');
      localStorage.setItem('risks', '[]');
      localStorage.setItem('hasInitialized', 'true');
      
      // Render the hook
      const { result } = renderHook(() => useApp(), { wrapper });
      
      // Verify that existing data was preserved
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].id).toBe('existing-1');
      expect(result.current.tasks[0].title).toBe('Existing Task');
    });
  });
});
