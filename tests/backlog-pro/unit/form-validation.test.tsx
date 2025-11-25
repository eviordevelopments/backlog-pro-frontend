import { describe, it, expect } from 'vitest';

describe('Form Validation', () => {
  // Test validation logic directly rather than through UI
  
  const validateTaskForm = (formData: {
    title: string;
    assignedTo: string;
    storyPoints: number;
    estimatedDate: string;
  }) => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.assignedTo) {
      errors.assignedTo = "Assignee is required";
    }

    if (formData.storyPoints < 0) {
      errors.storyPoints = "Story points must be non-negative";
    }

    if (isNaN(formData.storyPoints)) {
      errors.storyPoints = "Story points must be a valid number";
    }

    if (formData.estimatedDate) {
      const estimatedDate = new Date(formData.estimatedDate);
      if (isNaN(estimatedDate.getTime())) {
        errors.estimatedDate = "Invalid date format";
      }
    }

    return errors;
  };

  const validateSprintForm = (formData: {
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    committedPoints: number;
  }) => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Sprint name is required";
    }

    if (!formData.goal.trim()) {
      errors.goal = "Sprint goal is required";
    }

    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      errors.endDate = "End date is required";
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (isNaN(start.getTime())) {
        errors.startDate = "Invalid start date format";
      }
      
      if (isNaN(end.getTime())) {
        errors.endDate = "Invalid end date format";
      }
      
      if (start >= end) {
        errors.endDate = "End date must be after start date";
      }
    }

    if (formData.committedPoints < 0) {
      errors.committedPoints = "Committed points must be non-negative";
    }

    if (isNaN(formData.committedPoints)) {
      errors.committedPoints = "Committed points must be a valid number";
    }

    return errors;
  };

  const validateUserStoryForm = (formData: {
    title: string;
    role: string;
    action: string;
    benefit: string;
    storyPoints: number;
    businessValue: number;
  }) => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.role.trim()) {
      errors.role = "Role is required";
    }

    if (!formData.action.trim()) {
      errors.action = "Action is required";
    }

    if (!formData.benefit.trim()) {
      errors.benefit = "Benefit is required";
    }

    if (formData.storyPoints < 0) {
      errors.storyPoints = "Story points must be non-negative";
    }

    if (isNaN(formData.storyPoints)) {
      errors.storyPoints = "Story points must be a valid number";
    }

    if (formData.businessValue < 0 || formData.businessValue > 100) {
      errors.businessValue = "Business value must be between 0 and 100";
    }

    if (isNaN(formData.businessValue)) {
      errors.businessValue = "Business value must be a valid number";
    }

    return errors;
  };

  const validateRiskForm = (formData: {
    title: string;
    probability: number;
    impact: number;
  }) => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (formData.probability < 1 || formData.probability > 5) {
      errors.probability = "Probability must be between 1 and 5";
    }

    if (isNaN(formData.probability) || !Number.isInteger(formData.probability)) {
      errors.probability = "Probability must be a valid integer";
    }

    if (formData.impact < 1 || formData.impact > 5) {
      errors.impact = "Impact must be between 1 and 5";
    }

    if (isNaN(formData.impact) || !Number.isInteger(formData.impact)) {
      errors.impact = "Impact must be a valid integer";
    }

    return errors;
  };

  describe('Required Field Validation - Tasks', () => {
    it('should detect empty title', () => {
      const errors = validateTaskForm({
        title: '',
        assignedTo: 'Pedro',
        storyPoints: 5,
        estimatedDate: '2024-12-31'
      });

      expect(errors.title).toBe('Title is required');
    });

    it('should detect missing assignee', () => {
      const errors = validateTaskForm({
        title: 'Test Task',
        assignedTo: '',
        storyPoints: 5,
        estimatedDate: '2024-12-31'
      });

      expect(errors.assignedTo).toBe('Assignee is required');
    });

    it('should pass validation with all required fields', () => {
      const errors = validateTaskForm({
        title: 'Test Task',
        assignedTo: 'Pedro',
        storyPoints: 5,
        estimatedDate: '2024-12-31'
      });

      expect(Object.keys(errors).length).toBe(0);
    });
  });

  describe('Data Type Validation - Tasks', () => {
    it('should validate story points are non-negative', () => {
      const errors = validateTaskForm({
        title: 'Test Task',
        assignedTo: 'Pedro',
        storyPoints: -5,
        estimatedDate: '2024-12-31'
      });

      expect(errors.storyPoints).toBe('Story points must be non-negative');
    });

    it('should validate date format', () => {
      const errors = validateTaskForm({
        title: 'Test Task',
        assignedTo: 'Pedro',
        storyPoints: 5,
        estimatedDate: 'invalid-date'
      });

      expect(errors.estimatedDate).toBe('Invalid date format');
    });
  });

  describe('Required Field Validation - Sprints', () => {
    it('should detect empty sprint name', () => {
      const errors = validateSprintForm({
        name: '',
        goal: 'Complete features',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        committedPoints: 50
      });

      expect(errors.name).toBe('Sprint name is required');
    });

    it('should detect empty goal', () => {
      const errors = validateSprintForm({
        name: 'Sprint 1',
        goal: '',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        committedPoints: 50
      });

      expect(errors.goal).toBe('Sprint goal is required');
    });

    it('should detect missing dates', () => {
      const errors = validateSprintForm({
        name: 'Sprint 1',
        goal: 'Complete features',
        startDate: '',
        endDate: '',
        committedPoints: 50
      });

      expect(errors.startDate).toBe('Start date is required');
      expect(errors.endDate).toBe('End date is required');
    });
  });

  describe('Data Type Validation - Sprints', () => {
    it('should validate end date is after start date', () => {
      const errors = validateSprintForm({
        name: 'Sprint 1',
        goal: 'Complete features',
        startDate: '2024-12-31',
        endDate: '2024-12-01',
        committedPoints: 50
      });

      expect(errors.endDate).toBe('End date must be after start date');
    });

    it('should validate committed points are non-negative', () => {
      const errors = validateSprintForm({
        name: 'Sprint 1',
        goal: 'Complete features',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        committedPoints: -10
      });

      expect(errors.committedPoints).toBe('Committed points must be non-negative');
    });
  });

  describe('Required Field Validation - User Stories', () => {
    it('should detect empty title', () => {
      const errors = validateUserStoryForm({
        title: '',
        role: 'User',
        action: 'do something',
        benefit: 'achieve goal',
        storyPoints: 5,
        businessValue: 50
      });

      expect(errors.title).toBe('Title is required');
    });

    it('should detect empty role', () => {
      const errors = validateUserStoryForm({
        title: 'Test Story',
        role: '',
        action: 'do something',
        benefit: 'achieve goal',
        storyPoints: 5,
        businessValue: 50
      });

      expect(errors.role).toBe('Role is required');
    });

    it('should detect empty action', () => {
      const errors = validateUserStoryForm({
        title: 'Test Story',
        role: 'User',
        action: '',
        benefit: 'achieve goal',
        storyPoints: 5,
        businessValue: 50
      });

      expect(errors.action).toBe('Action is required');
    });

    it('should detect empty benefit', () => {
      const errors = validateUserStoryForm({
        title: 'Test Story',
        role: 'User',
        action: 'do something',
        benefit: '',
        storyPoints: 5,
        businessValue: 50
      });

      expect(errors.benefit).toBe('Benefit is required');
    });
  });

  describe('Data Type Validation - User Stories', () => {
    it('should validate business value is between 0 and 100', () => {
      const errors = validateUserStoryForm({
        title: 'Test Story',
        role: 'User',
        action: 'do something',
        benefit: 'achieve goal',
        storyPoints: 5,
        businessValue: 150
      });

      expect(errors.businessValue).toBe('Business value must be between 0 and 100');
    });

    it('should validate story points are non-negative', () => {
      const errors = validateUserStoryForm({
        title: 'Test Story',
        role: 'User',
        action: 'do something',
        benefit: 'achieve goal',
        storyPoints: -5,
        businessValue: 50
      });

      expect(errors.storyPoints).toBe('Story points must be non-negative');
    });
  });

  describe('Required Field Validation - Risks', () => {
    it('should detect empty title', () => {
      const errors = validateRiskForm({
        title: '',
        probability: 3,
        impact: 4
      });

      expect(errors.title).toBe('Title is required');
    });
  });

  describe('Data Type Validation - Risks', () => {
    it('should validate probability is between 1 and 5', () => {
      const errors = validateRiskForm({
        title: 'Test Risk',
        probability: 10,
        impact: 3
      });

      expect(errors.probability).toBe('Probability must be between 1 and 5');
    });

    it('should validate impact is between 1 and 5', () => {
      const errors = validateRiskForm({
        title: 'Test Risk',
        probability: 3,
        impact: 0
      });

      expect(errors.impact).toBe('Impact must be between 1 and 5');
    });

    it('should validate probability is an integer', () => {
      const errors = validateRiskForm({
        title: 'Test Risk',
        probability: 3.5,
        impact: 3
      });

      expect(errors.probability).toBe('Probability must be a valid integer');
    });

    it('should validate impact is an integer', () => {
      const errors = validateRiskForm({
        title: 'Test Risk',
        probability: 3,
        impact: 4.7
      });

      expect(errors.impact).toBe('Impact must be a valid integer');
    });
  });

  describe('Form Submission and Reset', () => {
    it('should return no errors for valid task data', () => {
      const errors = validateTaskForm({
        title: 'Valid Task',
        assignedTo: 'Pedro',
        storyPoints: 5,
        estimatedDate: '2024-12-31'
      });

      expect(Object.keys(errors).length).toBe(0);
    });

    it('should return no errors for valid sprint data', () => {
      const errors = validateSprintForm({
        name: 'Sprint 1',
        goal: 'Complete features',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        committedPoints: 50
      });

      expect(Object.keys(errors).length).toBe(0);
    });

    it('should return no errors for valid user story data', () => {
      const errors = validateUserStoryForm({
        title: 'Test Story',
        role: 'User',
        action: 'do something',
        benefit: 'achieve goal',
        storyPoints: 5,
        businessValue: 50
      });

      expect(Object.keys(errors).length).toBe(0);
    });

    it('should return no errors for valid risk data', () => {
      const errors = validateRiskForm({
        title: 'Test Risk',
        probability: 3,
        impact: 4
      });

      expect(Object.keys(errors).length).toBe(0);
    });
  });
});
