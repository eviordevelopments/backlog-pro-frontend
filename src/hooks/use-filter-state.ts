import { useState, useEffect, useCallback } from 'react';
import { FilterState } from '@/types';
import { loadFilterState, saveFilterState, getDefaultFilterState } from '@/utils/filterPersistence';

export const useFilterState = (teamMemberIds: string[] = []) => {
  const [filterState, setFilterState] = useState<FilterState>(() =>
    loadFilterState(teamMemberIds)
  );

  useEffect(() => {
    saveFilterState(filterState);
  }, [filterState]);

  const updateCategoryFilter = useCallback((category: keyof FilterState['categories'], checked: boolean) => {
    setFilterState(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: checked,
      },
    }));
  }, []);

  const updateTeamMemberFilter = useCallback((memberId: string, selected: boolean) => {
    setFilterState(prev => {
      const newMembers = selected
        ? [...prev.teamMembers, memberId]
        : prev.teamMembers.filter(id => id !== memberId);

      return {
        ...prev,
        teamMembers: newMembers,
      };
    });
  }, []);

  const setTeamMemberFilters = useCallback((memberIds: string[]) => {
    setFilterState(prev => ({
      ...prev,
      teamMembers: memberIds,
    }));
  }, []);

  const updateViewMode = useCallback((viewMode: 'day' | 'week' | 'month') => {
    setFilterState(prev => ({
      ...prev,
      viewMode,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    const defaultState = getDefaultFilterState(teamMemberIds);
    setFilterState(defaultState);
  }, [teamMemberIds]);

  return {
    filterState,
    updateCategoryFilter,
    updateTeamMemberFilter,
    setTeamMemberFilters,
    updateViewMode,
    resetFilters,
  };
};
