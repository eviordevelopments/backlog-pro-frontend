import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Filter, Layers, Users } from 'lucide-react';
import { FilterState, TeamMember } from '@/types';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import CategoryFilters from './CategoryFilters';
import TeamMemberFilters from './TeamMemberFilters';

interface FilterPanelProps {
  filterState: FilterState;
  teamMembers: TeamMember[];
  onCategoryChange: (category: keyof FilterState['categories'], checked: boolean) => void;
  onTeamMemberChange: (memberId: string, selected: boolean) => void;
  onResetFilters: () => void;
  visibleEventCount: number;
  totalEventCount: number;
  isMobile?: boolean;
}

export default function FilterPanel({
  filterState,
  teamMembers,
  onCategoryChange,
  onTeamMemberChange,
  onResetFilters,
  visibleEventCount,
  totalEventCount,
  isMobile = false,
}: FilterPanelProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const hasActiveFilters =
    !filterState.categories.tasks ||
    !filterState.categories.sprints ||
    !filterState.categories.meetings ||
    !filterState.categories.deadlines ||
    filterState.teamMembers.length < teamMembers.length;

  const filterContent = (
    <div className="space-y-6">
      {/* Category Filters Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">Event Categories</h4>
        </div>
        <p className="text-xs text-muted-foreground">Filter by event type</p>
        <CategoryFilters
          categories={filterState.categories}
          onCategoryChange={onCategoryChange}
        />
      </div>

      {/* Team Member Filters Section */}
      <div className="space-y-3 pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">Team Members</h4>
        </div>
        <p className="text-xs text-muted-foreground">Filter by assignee</p>
        <TeamMemberFilters
          teamMembers={teamMembers}
          selectedMembers={filterState.teamMembers}
          onTeamMemberChange={onTeamMemberChange}
        />
      </div>

      {/* Event Counter */}
      <div className="pt-4 border-t border-border/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Visible Events
          </span>
          <span className="text-sm font-semibold text-foreground">
            {visibleEventCount} of {totalEventCount}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{
              width: totalEventCount > 0 ? `${(visibleEventCount / totalEventCount) * 100}%` : '0%',
            }}
          />
        </div>
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onResetFilters}
        className="w-full"
        disabled={!hasActiveFilters}
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset Filters
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Filter Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDrawerOpen(true)}
          className="w-full mb-4"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
              Active
            </span>
          )}
        </Button>

        {/* Mobile Filter Drawer */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filter Events</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6 overflow-y-auto max-h-[70vh]">
              {filterContent}
            </div>
            <div className="px-4 pb-4">
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Close
                </Button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Card className="glass">
      <div className="p-4">
        {/* Desktop Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-lg">Filters</h3>
              <p className="text-xs text-muted-foreground">Customize your calendar view</p>
            </div>
          </div>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
              Active
            </span>
          )}
        </div>

        {/* Desktop Content */}
        {filterContent}
      </div>
    </Card>
  );
}
