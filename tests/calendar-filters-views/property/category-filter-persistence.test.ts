import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { FilterState } from '@/types';
import { saveFilterState, loadFilterState, getDefaultFilterState } from '@/utils/filterPersistence';

describe('Property 4: Category Filter Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should persist and restore category filters exactly', () => {
    fc.assert(
      fc.property(
        fc.record({
          tasks: fc.boolean(),
          sprints: fc.boolean(),
          meetings: fc.boolean(),
          deadlines: fc.boolean(),
        }),
        fc.array(fc.uuid(), { minLength: 0, maxLength: 5 }),
        (categories, teamMembers) => {
          const originalState: FilterState = {
            categories,
            teamMembers,
            viewMode: 'month',
          };

          saveFilterState(originalState);
          const restoredState = loadFilterState(teamMembers);

          expect(restoredState.categories.tasks).toBe(originalState.categories.tasks);
          expect(restoredState.categories.sprints).toBe(originalState.categories.sprints);
          expect(restoredState.categories.meetings).toBe(originalState.categories.meetings);
          expect(restoredState.categories.deadlines).toBe(originalState.categories.deadlines);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle corrupted localStorage gracefully', () => {
    fc.assert(
      fc.property(fc.array(fc.uuid(), { minLength: 0, maxLength: 5 }), (teamMembers) => {
        localStorage.setItem('calendar_filter_state', 'invalid json {]');
        const restoredState = loadFilterState(teamMembers);

        expect(restoredState.categories.tasks).toBe(true);
        expect(restoredState.categories.sprints).toBe(true);
        expect(restoredState.categories.meetings).toBe(true);
        expect(restoredState.categories.deadlines).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should default to all categories enabled when no state is saved', () => {
    fc.assert(
      fc.property(fc.array(fc.uuid(), { minLength: 0, maxLength: 5 }), (teamMembers) => {
        localStorage.clear();
        const state = loadFilterState(teamMembers);

        expect(state.categories.tasks).toBe(true);
        expect(state.categories.sprints).toBe(true);
        expect(state.categories.meetings).toBe(true);
        expect(state.categories.deadlines).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
