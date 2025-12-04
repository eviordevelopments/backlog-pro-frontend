import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useProjectContext } from '@/context/ProjectContext';
import { CalendarEvent, TeamMember } from '@/types';
import { useFilterState } from '@/hooks/use-filter-state';
import { useIsMobile } from '@/hooks/use-mobile';
import { applyAllFilters } from './filterUtils';
import FilterPanel from './FilterPanel';
import ViewToggle from './ViewToggle';
import CalendarGrid from './CalendarGrid';

export default function ProjectCalendar() {
  const { tasks, sprints } = useApp();
  const { selectedProject: currentProject } = useProjectContext();
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Initialize filter state with team member IDs
  const teamMemberIds = teamMembers.map(m => m.id);
  const {
    filterState,
    updateCategoryFilter,
    updateTeamMemberFilter,
    updateViewMode,
    resetFilters,
  } = useFilterState(teamMemberIds);

  // Generate calendar events from tasks, sprints, and meetings
  useEffect(() => {
    const calendarEvents: CalendarEvent[] = [];

    // Filter by current project or show all if no project selected
    const projectTasks = currentProject 
      ? tasks.filter(t => t.projectId === currentProject.id)
      : tasks;
    const projectSprints = currentProject 
      ? sprints.filter(s => s.projectId === currentProject.id)
      : sprints;

    // Add tasks
    projectTasks.forEach(task => {
      if (task.estimatedDate) {
        calendarEvents.push({
          id: `task-${task.id}`,
          title: task.title,
          date: new Date(task.estimatedDate),
          type: 'task',
          color: '#3b82f6',
          assigneeId: task.assignedTo,
          assignee: task.assignedTo,
        });
      }
    });

    // Add sprints
    projectSprints.forEach(sprint => {
      if (sprint.startDate) {
        calendarEvents.push({
          id: `sprint-start-${sprint.id}`,
          title: `${sprint.name} (Start)`,
          date: new Date(sprint.startDate),
          type: 'sprint',
          color: '#8b5cf6',
        });
      }
      if (sprint.endDate) {
        calendarEvents.push({
          id: `sprint-end-${sprint.id}`,
          title: `${sprint.name} (End)`,
          date: new Date(sprint.endDate),
          type: 'sprint',
          color: '#8b5cf6',
        });
      }
    });

    // Add sample events for demonstration if no events exist
    if (calendarEvents.length === 0) {
      const today = new Date();
      calendarEvents.push(
        {
          id: 'sample-task-1',
          title: 'Sample Task',
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
          type: 'task',
          color: '#3b82f6',
        },
        {
          id: 'sample-sprint-1',
          title: 'Sprint Start',
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
          type: 'sprint',
          color: '#8b5cf6',
        }
      );
    }

    setAllEvents(calendarEvents);
  }, [tasks, sprints, currentProject]);

  // Initialize team members from tasks
  useEffect(() => {
    const uniqueMembers = new Map<string, TeamMember>();
    
    allEvents.forEach(event => {
      if (event.assigneeId && !uniqueMembers.has(event.assigneeId)) {
        uniqueMembers.set(event.assigneeId, {
          id: event.assigneeId,
          name: event.assignee || event.assigneeId,
          role: 'Developer',
          skills: [],
          availability: 100,
          image: '',
          tasksCompleted: 0,
          averageCycleTime: 0,
          velocity: 0,
        });
      }
    });

    setTeamMembers(Array.from(uniqueMembers.values()));
  }, [allEvents]);

  // Apply filters to events
  const filteredEvents = applyAllFilters(allEvents, filterState);

  return (
    <>
      <div>
        <h1 className="text-4xl font-bold text-gradient">Calendar</h1>
        <p className="text-muted-foreground mt-2">
          {currentProject 
            ? `Calendar for ${currentProject.name}` 
            : "Project calendar with tasks, sprints, and meetings"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Filter Panel - Hidden on mobile, shown in drawer */}
        {!isMobile && (
          <div className="lg:col-span-1">
            <FilterPanel
              filterState={filterState}
              teamMembers={teamMembers}
              onCategoryChange={updateCategoryFilter}
              onTeamMemberChange={updateTeamMemberFilter}
              onResetFilters={resetFilters}
              visibleEventCount={filteredEvents.length}
              totalEventCount={allEvents.length}
              isMobile={false}
            />
          </div>
        )}

        {/* Calendar Section */}
        <div className={isMobile ? 'col-span-1' : 'lg:col-span-3'}>
          {/* Mobile Filter Drawer */}
          {isMobile && (
            <FilterPanel
              filterState={filterState}
              teamMembers={teamMembers}
              onCategoryChange={updateCategoryFilter}
              onTeamMemberChange={updateTeamMemberFilter}
              onResetFilters={resetFilters}
              visibleEventCount={filteredEvents.length}
              totalEventCount={allEvents.length}
              isMobile={true}
            />
          )}

          <div className="space-y-4">
            {/* View Toggle */}
            <ViewToggle
              currentView={filterState.viewMode}
              onViewChange={updateViewMode}
            />

            {/* Calendar Grid */}
            <CalendarGrid
              view={filterState.viewMode}
              currentDate={currentDate}
              events={filteredEvents}
              onDateChange={setCurrentDate}
            />
          </div>
        </div>
      </div>
    </>
  );
}
