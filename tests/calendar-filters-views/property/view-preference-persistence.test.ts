import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { FilterState } from '@/types';
import { saveFilterState, loadFilterState } from '@/utils/filterPersistence';

describe('Property 13: View Preference Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should persist and restore view mode exactly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('day', 'week', 'month') as fc.Arbitrary<'day' | 'week' | 'month'>,
        fc.array(fc.uuid(), { minLength: 0, maxLength: 5 }),
        (viewMode, teamMembers) => {
          const originalState: FilterState = {
            categories: {
              tasks: true,
              sprints: true,
              meetings: true,
              deadlines: true,
            },
            teamMembers,
            viewMode,
          };

          saveFilterState(originalState);
          const restoredState = loadFilterState(teamMembers);

          expect(restoredState.viewMode).toBe(originalState.viewMode);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should default to day view when no state is saved', () => {
    fc.assert(
      fc.property(fc.array(fc.uuid(), { minLength: 0, maxLength: 5 }), (teamMembers) => {
        localStorage.clear();
        const state = loadFilterState(teamMembers);

        expect(state.viewMode).toBe('day');
      }),
      { numRuns: 100 }
    );
  });

  it('should handle invalid view mode in stored state', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => s !== 'day' && s !== 'week' && s !== 'month'),
        fc.array(fc.uuid(), { minLength: 0, maxLength: 5 }),
        (invalidViewMode, teamMembers) => {
          const invalidState = {
            categories: {
              tasks: true,
              sprints: true,
              meetings: true,
              deadlines: true,
            },
            teamMembers,
            viewMode: invalidViewMode,
          };

          localStorage.setItem('calendar_filter_state', JSON.stringify(invalidState));
          const restoredState = loadFilterState(teamMembers);

          expect(restoredState.viewMode).toBe('day');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve view mode across multiple save/load cycles', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('day', 'week', 'month') as fc.Arbitrary<'day' | 'week' | 'month'>,
        fc.array(fc.uuid(), { minLength: 0, maxLength: 5 }),
        (viewMode, teamMembers) => {
          const originalState: FilterState = {
            categories: {
              tasks: true,
              sprints: true,
              meetings: true,
              deadlines: true,
            },
            teamMembers,
            viewMode,
          };

          saveFilterState(originalState);
          const firstLoad = loadFilterState(teamMembers);
          saveFilterState(firstLoad);
          const secondLoad = loadFilterState(teamMembers);

          expect(secondLoad.viewMode).toBe(viewMode);
        }
      ),
      { numRuns: 100 }
    );
  });
});
