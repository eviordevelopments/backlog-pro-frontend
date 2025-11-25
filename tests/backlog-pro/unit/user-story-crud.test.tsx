import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { AppProvider, useApp } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { UserStory } from '@/types';
import { setupMockLocalStorage } from '../utils/test-helpers';

describe('User Story CRUD Operations', () => {
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

  describe('4.1 User Story Creation', () => {
    it('should add user story to state array', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newStory: UserStory = {
        id: '',
        title: 'Test User Story',
        role: 'user',
        action: 'perform action',
        benefit: 'get benefit',
        description: 'Test Description',
        storyPoints: 5,
        businessValue: 8,
        acceptanceCriteria: [
          { id: '1', description: 'Criterion 1', completed: false },
          { id: '2', description: 'Criterion 2', completed: false },
        ],
        createdAt: '',
      };

      act(() => {
        result.current.addUserStory(newStory);
      });

      expect(result.current.userStories).toHaveLength(1);
      expect(result.current.userStories[0].title).toBe('Test User Story');
    });

    it('should ensure story includes title, description, acceptance criteria, and story points', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newStory: UserStory = {
        id: '',
        title: 'Complete User Story',
        role: 'developer',
        action: 'write code',
        benefit: 'deliver features',
        description: 'Full description of the story',
        storyPoints: 8,
        businessValue: 10,
        acceptanceCriteria: [
          { id: '1', description: 'AC 1', completed: false },
          { id: '2', description: 'AC 2', completed: true },
          { id: '3', description: 'AC 3', completed: false },
        ],
        createdAt: '',
      };

      act(() => {
        result.current.addUserStory(newStory);
      });

      const addedStory = result.current.userStories[0];
      expect(addedStory.title).toBe('Complete User Story');
      expect(addedStory.description).toBe('Full description of the story');
      expect(addedStory.storyPoints).toBe(8);
      expect(addedStory.acceptanceCriteria).toHaveLength(3);
      expect(addedStory.acceptanceCriteria[0].description).toBe('AC 1');
    });

    it('should assign unique ID when story has no ID', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newStory: UserStory = {
        id: '',
        title: 'Test Story',
        role: 'user',
        action: 'action',
        benefit: 'benefit',
        description: 'Description',
        storyPoints: 3,
        businessValue: 5,
        acceptanceCriteria: [],
        createdAt: '',
      };

      act(() => {
        result.current.addUserStory(newStory);
      });

      expect(result.current.userStories[0].id).toBeTruthy();
      expect(result.current.userStories[0].id).not.toBe('');
    });

    it('should assign createdAt timestamp when story has no timestamp', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newStory: UserStory = {
        id: '',
        title: 'Test Story',
        role: 'user',
        action: 'action',
        benefit: 'benefit',
        description: 'Description',
        storyPoints: 3,
        businessValue: 5,
        acceptanceCriteria: [],
        createdAt: '',
      };

      const beforeTime = new Date().toISOString();

      act(() => {
        result.current.addUserStory(newStory);
      });

      const afterTime = new Date().toISOString();

      expect(result.current.userStories[0].createdAt).toBeTruthy();
      expect(result.current.userStories[0].createdAt).not.toBe('');
      expect(result.current.userStories[0].createdAt >= beforeTime).toBe(true);
      expect(result.current.userStories[0].createdAt <= afterTime).toBe(true);
    });

    it('should throw error when title is missing', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const invalidStory: UserStory = {
        id: '',
        title: '',
        role: 'user',
        action: 'action',
        benefit: 'benefit',
        description: 'Description',
        storyPoints: 3,
        businessValue: 5,
        acceptanceCriteria: [],
        createdAt: '',
      };

      expect(() => {
        act(() => {
          result.current.addUserStory(invalidStory);
        });
      }).toThrow('User story title is required');
    });

    it('should throw error when description is missing', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const invalidStory: UserStory = {
        id: '',
        title: 'Test Story',
        role: 'user',
        action: 'action',
        benefit: 'benefit',
        description: '',
        storyPoints: 3,
        businessValue: 5,
        acceptanceCriteria: [],
        createdAt: '',
      };

      expect(() => {
        act(() => {
          result.current.addUserStory(invalidStory);
        });
      }).toThrow('User story description is required');
    });

    it('should throw error when story points are invalid', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const invalidStory: UserStory = {
        id: '',
        title: 'Test Story',
        role: 'user',
        action: 'action',
        benefit: 'benefit',
        description: 'Description',
        storyPoints: -5,
        businessValue: 5,
        acceptanceCriteria: [],
        createdAt: '',
      };

      expect(() => {
        act(() => {
          result.current.addUserStory(invalidStory);
        });
      }).toThrow('Story points must be a non-negative numeric value');
    });
  });

  describe('4.3 Acceptance Criteria Array Support', () => {
    it('should support empty acceptance criteria array', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newStory: UserStory = {
        id: '',
        title: 'Story with no criteria',
        role: 'user',
        action: 'action',
        benefit: 'benefit',
        description: 'Description',
        storyPoints: 2,
        businessValue: 3,
        acceptanceCriteria: [],
        createdAt: '',
      };

      act(() => {
        result.current.addUserStory(newStory);
      });

      expect(result.current.userStories[0].acceptanceCriteria).toEqual([]);
    });

    it('should support multiple acceptance criteria items', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newStory: UserStory = {
        id: '',
        title: 'Story with multiple criteria',
        role: 'user',
        action: 'action',
        benefit: 'benefit',
        description: 'Description',
        storyPoints: 5,
        businessValue: 8,
        acceptanceCriteria: [
          { id: '1', description: 'First criterion', completed: false },
          { id: '2', description: 'Second criterion', completed: true },
          { id: '3', description: 'Third criterion', completed: false },
          { id: '4', description: 'Fourth criterion', completed: false },
          { id: '5', description: 'Fifth criterion', completed: true },
        ],
        createdAt: '',
      };

      act(() => {
        result.current.addUserStory(newStory);
      });

      expect(result.current.userStories[0].acceptanceCriteria).toHaveLength(5);
      expect(result.current.userStories[0].acceptanceCriteria[1].completed).toBe(true);
      expect(result.current.userStories[0].acceptanceCriteria[2].description).toBe('Third criterion');
    });

    it('should throw error when acceptanceCriteria is not an array', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const invalidStory = {
        id: '',
        title: 'Invalid Story',
        role: 'user',
        action: 'action',
        benefit: 'benefit',
        description: 'Description',
        storyPoints: 3,
        businessValue: 5,
        acceptanceCriteria: 'not an array',
        createdAt: '',
      };

      expect(() => {
        act(() => {
          result.current.addUserStory(invalidStory as any);
        });
      }).toThrow('Acceptance criteria must be an array');
    });
  });

  describe('4.5 User Story Update', () => {
    it('should modify story properties', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newStory: UserStory = {
        id: 'story-1',
        title: 'Original Title',
        role: 'user',
        action: 'original action',
        benefit: 'original benefit',
        description: 'Original Description',
        storyPoints: 3,
        businessValue: 5,
        acceptanceCriteria: [
          { id: '1', description: 'Original AC', completed: false },
        ],
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      act(() => {
        result.current.addUserStory(newStory);
      });

      act(() => {
        result.current.updateUserStory('story-1', {
          title: 'Updated Title',
          storyPoints: 8,
          acceptanceCriteria: [
            { id: '1', description: 'Updated AC', completed: true },
            { id: '2', description: 'New AC', completed: false },
          ],
        });
      });

      expect(result.current.userStories[0].title).toBe('Updated Title');
      expect(result.current.userStories[0].storyPoints).toBe(8);
      expect(result.current.userStories[0].acceptanceCriteria).toHaveLength(2);
      expect(result.current.userStories[0].description).toBe('Original Description');
    });

    it('should ensure story ID remains unchanged', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newStory: UserStory = {
        id: 'story-1',
        title: 'Test Story',
        role: 'user',
        action: 'action',
        benefit: 'benefit',
        description: 'Description',
        storyPoints: 3,
        businessValue: 5,
        acceptanceCriteria: [],
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      act(() => {
        result.current.addUserStory(newStory);
      });

      act(() => {
        result.current.updateUserStory('story-1', {
          id: 'different-id',
          title: 'Updated Title',
        } as UserStory);
      });

      expect(result.current.userStories[0].id).toBe('story-1');
      expect(result.current.userStories[0].title).toBe('Updated Title');
    });

    it('should not affect other stories', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const story1: UserStory = {
        id: 'story-1',
        title: 'Story 1',
        role: 'user',
        action: 'action 1',
        benefit: 'benefit 1',
        description: 'Description 1',
        storyPoints: 3,
        businessValue: 5,
        acceptanceCriteria: [],
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const story2: UserStory = {
        id: 'story-2',
        title: 'Story 2',
        role: 'developer',
        action: 'action 2',
        benefit: 'benefit 2',
        description: 'Description 2',
        storyPoints: 8,
        businessValue: 10,
        acceptanceCriteria: [],
        createdAt: '2024-01-02T00:00:00.000Z',
      };

      act(() => {
        result.current.addUserStory(story1);
        result.current.addUserStory(story2);
      });

      act(() => {
        result.current.updateUserStory('story-1', { title: 'Updated Story 1' });
      });

      expect(result.current.userStories[0].title).toBe('Updated Story 1');
      expect(result.current.userStories[1].title).toBe('Story 2');
      expect(result.current.userStories[1].description).toBe('Description 2');
    });

    it('should throw error when updating with invalid story points', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newStory: UserStory = {
        id: 'story-1',
        title: 'Test Story',
        role: 'user',
        action: 'action',
        benefit: 'benefit',
        description: 'Description',
        storyPoints: 3,
        businessValue: 5,
        acceptanceCriteria: [],
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      act(() => {
        result.current.addUserStory(newStory);
      });

      expect(() => {
        act(() => {
          result.current.updateUserStory('story-1', { storyPoints: -5 });
        });
      }).toThrow('Story points must be a non-negative numeric value');
    });
  });

  describe('4.7 User Story Deletion', () => {
    it('should remove story from state', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newStory: UserStory = {
        id: 'story-1',
        title: 'Test Story',
        role: 'user',
        action: 'action',
        benefit: 'benefit',
        description: 'Description',
        storyPoints: 3,
        businessValue: 5,
        acceptanceCriteria: [],
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      act(() => {
        result.current.addUserStory(newStory);
      });

      expect(result.current.userStories).toHaveLength(1);

      act(() => {
        result.current.deleteUserStory('story-1');
      });

      expect(result.current.userStories).toHaveLength(0);
    });

    it('should only remove the specified story', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const story1: UserStory = {
        id: 'story-1',
        title: 'Story 1',
        role: 'user',
        action: 'action 1',
        benefit: 'benefit 1',
        description: 'Description 1',
        storyPoints: 3,
        businessValue: 5,
        acceptanceCriteria: [],
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const story2: UserStory = {
        id: 'story-2',
        title: 'Story 2',
        role: 'developer',
        action: 'action 2',
        benefit: 'benefit 2',
        description: 'Description 2',
        storyPoints: 8,
        businessValue: 10,
        acceptanceCriteria: [],
        createdAt: '2024-01-02T00:00:00.000Z',
      };

      const story3: UserStory = {
        id: 'story-3',
        title: 'Story 3',
        role: 'admin',
        action: 'action 3',
        benefit: 'benefit 3',
        description: 'Description 3',
        storyPoints: 5,
        businessValue: 7,
        acceptanceCriteria: [],
        createdAt: '2024-01-03T00:00:00.000Z',
      };

      act(() => {
        result.current.addUserStory(story1);
        result.current.addUserStory(story2);
        result.current.addUserStory(story3);
      });

      expect(result.current.userStories).toHaveLength(3);

      act(() => {
        result.current.deleteUserStory('story-2');
      });

      expect(result.current.userStories).toHaveLength(2);
      expect(result.current.userStories.find(s => s.id === 'story-1')).toBeTruthy();
      expect(result.current.userStories.find(s => s.id === 'story-2')).toBeUndefined();
      expect(result.current.userStories.find(s => s.id === 'story-3')).toBeTruthy();
    });

    it('should handle deletion of non-existent story gracefully', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newStory: UserStory = {
        id: 'story-1',
        title: 'Test Story',
        role: 'user',
        action: 'action',
        benefit: 'benefit',
        description: 'Description',
        storyPoints: 3,
        businessValue: 5,
        acceptanceCriteria: [],
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      act(() => {
        result.current.addUserStory(newStory);
      });

      expect(result.current.userStories).toHaveLength(1);

      act(() => {
        result.current.deleteUserStory('non-existent-id');
      });

      expect(result.current.userStories).toHaveLength(1);
      expect(result.current.userStories[0].id).toBe('story-1');
    });
  });
});
