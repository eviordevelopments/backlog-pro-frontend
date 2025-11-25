import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  taskArb,
  userStoryArb,
  sprintArb,
  teamMemberArb,
  riskArb,
  profitShareArb,
  kpiMetricsArb,
} from './utils/generators';

describe('Testing Infrastructure Smoke Tests', () => {
  describe('Generators', () => {
    it('should generate valid Task entities', () => {
      fc.assert(
        fc.property(taskArb(), (task) => {
          expect(task).toBeDefined();
          expect(task.id).toBeDefined();
          expect(task.title).toBeDefined();
          expect(task.status).toMatch(/^(todo|in-progress|review|done)$/);
          expect(task.priority).toMatch(/^(low|medium|high|critical)$/);
          expect(task.storyPoints).toBeGreaterThanOrEqual(0);
          return true;
        }),
        { numRuns: 10 }
      );
    });

    it('should generate valid UserStory entities', () => {
      fc.assert(
        fc.property(userStoryArb(), (story) => {
          expect(story).toBeDefined();
          expect(story.id).toBeDefined();
          expect(story.title).toBeDefined();
          expect(story.storyPoints).toBeGreaterThanOrEqual(0);
          expect(Array.isArray(story.acceptanceCriteria)).toBe(true);
          return true;
        }),
        { numRuns: 10 }
      );
    });

    it('should generate valid Sprint entities', () => {
      fc.assert(
        fc.property(sprintArb(), (sprint) => {
          expect(sprint).toBeDefined();
          expect(sprint.id).toBeDefined();
          expect(sprint.name).toBeDefined();
          expect(sprint.status).toMatch(/^(planned|active|completed)$/);
          expect(sprint.velocity).toBeGreaterThanOrEqual(0);
          return true;
        }),
        { numRuns: 10 }
      );
    });

    it('should generate valid TeamMember entities', () => {
      fc.assert(
        fc.property(teamMemberArb(), (member) => {
          expect(member).toBeDefined();
          expect(member.id).toBeDefined();
          expect(member.name).toBeDefined();
          expect(member.role).toMatch(/^(Product Owner|Scrum Master|Developer|DevOps)$/);
          expect(member.availability).toBeGreaterThanOrEqual(0);
          expect(member.availability).toBeLessThanOrEqual(100);
          return true;
        }),
        { numRuns: 10 }
      );
    });

    it('should generate valid Risk entities', () => {
      fc.assert(
        fc.property(riskArb(), (risk) => {
          expect(risk).toBeDefined();
          expect(risk.id).toBeDefined();
          expect(risk.title).toBeDefined();
          expect(risk.probability).toBeGreaterThanOrEqual(1);
          expect(risk.probability).toBeLessThanOrEqual(5);
          expect(risk.impact).toBeGreaterThanOrEqual(1);
          expect(risk.impact).toBeLessThanOrEqual(5);
          expect(risk.score).toBe(risk.probability * risk.impact);
          return true;
        }),
        { numRuns: 10 }
      );
    });

    it('should generate valid ProfitShare entities', () => {
      fc.assert(
        fc.property(profitShareArb(), (share) => {
          expect(share).toBeDefined();
          expect(share.memberId).toBeDefined();
          expect(share.memberName).toBeDefined();
          expect(share.percentage).toBeGreaterThanOrEqual(0);
          expect(share.percentage).toBeLessThanOrEqual(100);
          expect(share.amount).toBeGreaterThanOrEqual(0);
          return true;
        }),
        { numRuns: 10 }
      );
    });

    it('should generate valid KPIMetrics', () => {
      fc.assert(
        fc.property(kpiMetricsArb(), (metrics) => {
          expect(metrics).toBeDefined();
          expect(metrics.velocity).toBeGreaterThanOrEqual(0);
          expect(metrics.cycleTime).toBeGreaterThanOrEqual(0);
          expect(metrics.sprintCompletionRate).toBeGreaterThanOrEqual(0);
          expect(metrics.sprintCompletionRate).toBeLessThanOrEqual(100);
          return true;
        }),
        { numRuns: 10 }
      );
    });
  });

  describe('Test Helpers', () => {
    it('should have localStorage available', () => {
      expect(localStorage).toBeDefined();
      localStorage.setItem('test', 'value');
      expect(localStorage.getItem('test')).toBe('value');
      localStorage.clear();
    });

    it('should have window.matchMedia mocked', () => {
      expect(window.matchMedia).toBeDefined();
      const result = window.matchMedia('(min-width: 768px)');
      expect(result).toBeDefined();
      expect(result.matches).toBe(false);
    });
  });
});
