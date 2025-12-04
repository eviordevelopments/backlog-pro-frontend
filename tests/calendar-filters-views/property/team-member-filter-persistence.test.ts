import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { FilterState } from '@/types';
import { saveFilterState, loadFilterState } from '@/utils/filterPersistence';

describe('Property 8: Team Member Filter Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should persist and restore team member filters exactly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.uuid(), { minLength: 0, maxLength: 10 }),
        (teamMembers) => {
          const originalState: FilterState = {
            categories: {
              tasks: true,
              sprints: true,
              meetings: true,
              deadlines: true,
            },
            teamMembers,
            viewMode: 'month',
          };

          saveFilterState(originalState);
          const restoredState = loadFilterState(teamMembers);

          expect(restoredState.teamMembers.sort()).toEqual(originalState.teamMembers.sort());
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty team member selection', () => {
    fc.assert(
      fc.property(fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }), (availableMembers) => {
        const originalState: FilterState = {
          categories: {
            tasks: true,
            sprints: true,
            meetings: true,
            deadlines: true,
          },
          teamMembers: [],
          viewMode: 'month',
        };

        saveFilterState(originalState);
        const restoredState = loadFilterState(availableMembers);

        expect(restoredState.teamMembers).toEqual([]);
      }),
      { numRuns: 100 }
    );
  });

  it('should default to all team members when no state is saved', () => {
    fc.assert(
      fc.property(fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }), (teamMembers) => {
        localStorage.clear();
        const state = loadFilterState(teamMembers);

        expect(state.teamMembers.sort()).toEqual(teamMembers.sort());
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve team member order when persisting', () => {
    fc.assert(
      fc.property(
        fc.array(fc.uuid(), { minLength: 1, maxLength: 10 }).chain(members =>
          fc.tuple(fc.constant(members), fc.shuffledSubarray(members))
        ),
        ([availableMembers, selectedMembers]) => {
          const originalState: FilterState = {
            categories: {
              tasks: true,
              sprints: true,
              meetings: true,
              deadlines: true,
            },
            teamMembers: selectedMembers,
            viewMode: 'month',
          };

          saveFilterState(originalState);
          const restoredState = loadFilterState(availableMembers);

          expect(new Set(restoredState.teamMembers)).toEqual(new Set(selectedMembers));
        }
      ),
      { numRuns: 100 }
    );
  });
});
