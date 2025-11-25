import { describe, it, expect } from 'vitest';
import { Task, TaskStatus, TaskPriority } from '@/types';

describe('Task Filtering Logic', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Implement Login Feature',
      description: 'Create user authentication system',
      status: 'in-progress' as TaskStatus,
      priority: 'high' as TaskPriority,
      storyPoints: 5,
      assignedTo: 'Pedro',
      estimatedDate: '2024-01-15',
      tags: ['frontend', 'auth'],
      createdAt: '2024-01-01',
    },
    {
      id: '2',
      title: 'Fix Bug in Dashboard',
      description: 'Resolve chart rendering issue',
      status: 'todo' as TaskStatus,
      priority: 'critical' as TaskPriority,
      storyPoints: 3,
      assignedTo: 'David',
      estimatedDate: '2024-01-10',
      tags: ['bug', 'frontend'],
      createdAt: '2024-01-02',
    },
    {
      id: '3',
      title: 'Update Documentation',
      description: 'Add API documentation for new endpoints',
      status: 'done' as TaskStatus,
      priority: 'low' as TaskPriority,
      storyPoints: 2,
      assignedTo: 'Morena',
      estimatedDate: '2024-01-05',
      tags: ['docs'],
      createdAt: '2024-01-03',
    },
  ];

  describe('Search Filtering (Requirement 15.1)', () => {
    it('should filter tasks by title (case-insensitive)', () => {
      const searchTerm = 'login';
      const filtered = mockTasks.filter((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Implement Login Feature');
    });

    it('should filter tasks by description (case-insensitive)', () => {
      const searchTerm = 'chart';
      const filtered = mockTasks.filter((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Fix Bug in Dashboard');
    });

    it('should return all tasks when search term is empty', () => {
      const searchTerm = '';
      const filtered = mockTasks.filter((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(filtered).toHaveLength(3);
    });
  });

  describe('Status Filtering (Requirement 15.2)', () => {
    it('should filter tasks by status', () => {
      const filterStatus = 'todo';
      const filtered = mockTasks.filter((task) =>
        filterStatus === 'all' || task.status === filterStatus
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe('todo');
    });

    it('should return all tasks when filter is "all"', () => {
      const filterStatus = 'all';
      const filtered = mockTasks.filter((task) =>
        filterStatus === 'all' || task.status === filterStatus
      );
      
      expect(filtered).toHaveLength(3);
    });
  });

  describe('Priority Filtering (Requirement 15.3)', () => {
    it('should filter tasks by priority', () => {
      const filterPriority = 'high';
      const filtered = mockTasks.filter((task) =>
        filterPriority === 'all' || task.priority === filterPriority
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].priority).toBe('high');
    });

    it('should return all tasks when filter is "all"', () => {
      const filterPriority = 'all';
      const filtered = mockTasks.filter((task) =>
        filterPriority === 'all' || task.priority === filterPriority
      );
      
      expect(filtered).toHaveLength(3);
    });
  });

  describe('Assignee Filtering (Requirement 15.4)', () => {
    it('should filter tasks by assignee', () => {
      const filterAssignee = 'Pedro';
      const filtered = mockTasks.filter((task) =>
        filterAssignee === 'all' || task.assignedTo === filterAssignee
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].assignedTo).toBe('Pedro');
    });

    it('should return all tasks when filter is "all"', () => {
      const filterAssignee = 'all';
      const filtered = mockTasks.filter((task) =>
        filterAssignee === 'all' || task.assignedTo === filterAssignee
      );
      
      expect(filtered).toHaveLength(3);
    });
  });

  describe('Combined Filtering (Requirement 15.5)', () => {
    it('should apply multiple filters simultaneously', () => {
      const searchTerm = 'bug';
      const filterStatus = 'todo';
      const filterPriority = 'critical';
      const filterAssignee = 'David';

      const filtered = mockTasks.filter((task) => {
        const matchesSearch =
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          filterStatus === 'all' || task.status === filterStatus;
        const matchesPriority =
          filterPriority === 'all' || task.priority === filterPriority;
        const matchesAssignee =
          filterAssignee === 'all' || task.assignedTo === filterAssignee;
        return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
      });
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Fix Bug in Dashboard');
    });

    it('should return all tasks when all filters are reset to "all"', () => {
      const searchTerm = '';
      const filterStatus = 'all';
      const filterPriority = 'all';
      const filterAssignee = 'all';

      const filtered = mockTasks.filter((task) => {
        const matchesSearch =
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          filterStatus === 'all' || task.status === filterStatus;
        const matchesPriority =
          filterPriority === 'all' || task.priority === filterPriority;
        const matchesAssignee =
          filterAssignee === 'all' || task.assignedTo === filterAssignee;
        return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
      });
      
      expect(filtered).toHaveLength(3);
    });
  });
});
