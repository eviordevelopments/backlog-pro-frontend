import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { TeamMember } from '@/types';

interface TeamMemberFiltersProps {
  teamMembers: TeamMember[];
  selectedMembers: string[];
  onTeamMemberChange: (memberId: string, selected: boolean) => void;
}

export default function TeamMemberFilters({
  teamMembers,
  selectedMembers,
  onTeamMemberChange,
}: TeamMemberFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayCount = 3;
  const visibleMembers = teamMembers.slice(0, displayCount);
  const hiddenCount = Math.max(0, teamMembers.length - displayCount);

  return (
    <div className="space-y-2">
      {visibleMembers.map((member) => (
        <div key={member.id} className="flex items-center gap-3">
          <Checkbox
            id={`member-${member.id}`}
            checked={selectedMembers.includes(member.id)}
            onCheckedChange={(checked) => onTeamMemberChange(member.id, checked as boolean)}
          />
          <Label
            htmlFor={`member-${member.id}`}
            className="text-sm font-medium cursor-pointer flex-1"
          >
            {member.name}
          </Label>
        </div>
      ))}

      {isExpanded &&
        teamMembers.slice(displayCount).map((member) => (
          <div key={member.id} className="flex items-center gap-3">
            <Checkbox
              id={`member-${member.id}`}
              checked={selectedMembers.includes(member.id)}
              onCheckedChange={(checked) => onTeamMemberChange(member.id, checked as boolean)}
            />
            <Label
              htmlFor={`member-${member.id}`}
              className="text-sm font-medium cursor-pointer flex-1"
            >
              {member.name}
            </Label>
          </div>
        ))}

      {hiddenCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-start text-xs"
        >
          <ChevronDown
            className={`h-4 w-4 mr-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
          {isExpanded ? 'Show less' : `Show ${hiddenCount} more`}
        </Button>
      )}
    </div>
  );
}
