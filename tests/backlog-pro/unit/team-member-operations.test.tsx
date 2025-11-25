import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useApp } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { TeamMember } from '@/types';

describe('Team Member Operations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      <AppProvider>{children}</AppProvider>
    </AuthProvider>
  );

  describe('updateTeamMember', () => {
    it('should update team member profile properties', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      // Get the first team member
      const originalMember = result.current.teamMembers[0];
      const memberId = originalMember.id;

      // Update the team member
      act(() => {
        result.current.updateTeamMember(memberId, {
          name: 'Updated Name',
          role: 'Scrum Master',
          skills: ['New Skill'],
          availability: 80,
        });
      });

      // Verify the update
      const updatedMember = result.current.teamMembers.find(m => m.id === memberId);
      expect(updatedMember).toBeDefined();
      expect(updatedMember?.name).toBe('Updated Name');
      expect(updatedMember?.role).toBe('Scrum Master');
      expect(updatedMember?.skills).toEqual(['New Skill']);
      expect(updatedMember?.availability).toBe(80);
    });

    it('should maintain team member ID when updating', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const originalMember = result.current.teamMembers[0];
      const memberId = originalMember.id;

      act(() => {
        result.current.updateTeamMember(memberId, {
          name: 'New Name',
        });
      });

      const updatedMember = result.current.teamMembers.find(m => m.id === memberId);
      expect(updatedMember?.id).toBe(memberId);
    });

    it('should throw error when updating non-existent team member', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      expect(() => {
        act(() => {
          result.current.updateTeamMember('non-existent-id', { name: 'Test' });
        });
      }).toThrow('Team member with id "non-existent-id" does not exist');
    });
  });

  describe('addTeamMember', () => {
    it('should create team member with all provided properties', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const newMember: Partial<TeamMember> = {
        name: 'New Member',
        role: 'Developer',
        skills: ['React', 'TypeScript'],
        availability: 90,
        tasksCompleted: 5,
        averageCycleTime: 2.5,
        velocity: 15,
      };

      act(() => {
        result.current.addTeamMember(newMember);
      });

      const addedMember = result.current.teamMembers.find(m => m.name === 'New Member');
      expect(addedMember).toBeDefined();
      expect(addedMember?.role).toBe('Developer');
      expect(addedMember?.skills).toEqual(['React', 'TypeScript']);
      expect(addedMember?.availability).toBe(90);
      expect(addedMember?.tasksCompleted).toBe(5);
      expect(addedMember?.averageCycleTime).toBe(2.5);
      expect(addedMember?.velocity).toBe(15);
    });

    it('should initialize missing properties with default values', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const minimalMember: Partial<TeamMember> = {
        name: 'Minimal Member',
      };

      act(() => {
        result.current.addTeamMember(minimalMember);
      });

      const addedMember = result.current.teamMembers.find(m => m.name === 'Minimal Member');
      expect(addedMember).toBeDefined();
      expect(addedMember?.id).toBeDefined();
      expect(addedMember?.role).toBe('Developer'); // default role
      expect(addedMember?.skills).toEqual([]); // default empty array
      expect(addedMember?.availability).toBe(100); // default 100%
      expect(addedMember?.image).toBeDefined();
      expect(addedMember?.tasksCompleted).toBe(0); // default 0
      expect(addedMember?.averageCycleTime).toBe(0); // default 0
      expect(addedMember?.velocity).toBe(0); // default 0
    });

    it('should generate unique ID when not provided', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      act(() => {
        result.current.addTeamMember({ name: 'Member 1' });
        result.current.addTeamMember({ name: 'Member 2' });
      });

      const member1 = result.current.teamMembers.find(m => m.name === 'Member 1');
      const member2 = result.current.teamMembers.find(m => m.name === 'Member 2');

      expect(member1?.id).toBeDefined();
      expect(member2?.id).toBeDefined();
      expect(member1?.id).not.toBe(member2?.id);
    });
  });

  describe('calculateIndividualKPIs', () => {
    it('should calculate velocity from completed tasks', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const member = result.current.teamMembers[0];

      // Add tasks for this member
      act(() => {
        result.current.addTask({
          id: 'task-1',
          title: 'Task 1',
          description: 'Description',
          status: 'done',
          priority: 'medium',
          storyPoints: 5,
          assignedTo: member.name,
          estimatedDate: '2024-12-31',
          tags: [],
          createdAt: new Date().toISOString(),
        });

        result.current.addTask({
          id: 'task-2',
          title: 'Task 2',
          description: 'Description',
          status: 'done',
          priority: 'high',
          storyPoints: 8,
          assignedTo: member.name,
          estimatedDate: '2024-12-31',
          tags: [],
          createdAt: new Date().toISOString(),
        });

        result.current.addTask({
          id: 'task-3',
          title: 'Task 3',
          description: 'Description',
          status: 'in-progress',
          priority: 'low',
          storyPoints: 3,
          assignedTo: member.name,
          estimatedDate: '2024-12-31',
          tags: [],
          createdAt: new Date().toISOString(),
        });
      });

      const kpis = result.current.calculateIndividualKPIs(member.id);

      expect(kpis.velocity).toBe(13); // 5 + 8 (only completed tasks)
      expect(kpis.tasksCompleted).toBe(2); // 2 done tasks
    });

    it('should return zero KPIs for non-existent member', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const kpis = result.current.calculateIndividualKPIs('non-existent-id');

      expect(kpis.velocity).toBe(0);
      expect(kpis.tasksCompleted).toBe(0);
      expect(kpis.completionRate).toBe(0);
    });

    it('should calculate completion rate correctly', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const member = result.current.teamMembers[0];

      // Add tasks with estimated dates
      act(() => {
        result.current.addTask({
          id: 'task-1',
          title: 'Task 1',
          description: 'Description',
          status: 'done',
          priority: 'medium',
          storyPoints: 5,
          assignedTo: member.name,
          estimatedDate: '2024-12-31',
          tags: [],
          createdAt: new Date().toISOString(),
        });

        result.current.addTask({
          id: 'task-2',
          title: 'Task 2',
          description: 'Description',
          status: 'done',
          priority: 'high',
          storyPoints: 8,
          assignedTo: member.name,
          estimatedDate: '2024-12-31',
          tags: [],
          createdAt: new Date().toISOString(),
        });

        result.current.addTask({
          id: 'task-3',
          title: 'Task 3',
          description: 'Description',
          status: 'in-progress',
          priority: 'low',
          storyPoints: 3,
          assignedTo: member.name,
          estimatedDate: '2024-12-31',
          tags: [],
          createdAt: new Date().toISOString(),
        });
      });

      const kpis = result.current.calculateIndividualKPIs(member.id);

      // 2 completed out of 3 tasks with estimates = 66.67%
      expect(kpis.completionRate).toBeCloseTo(66.67, 1);
    });
  });
});
