import { useState, useEffect } from 'react';
import { useProjectContext } from '@/context/ProjectContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { listSprintsByProject, Sprint } from '@/api/sprints/sprints';

interface MeetingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meeting: any) => void;
}

export default function MeetingDialog({ isOpen, onClose, onSave }: MeetingDialogProps) {
  const { projects, selectedProject: currentProject } = useProjectContext();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'sprint_planning' | 'sprint_review' | 'retrospective' | 'standup' | 'other'>('other');
  const [dateTime, setDateTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantInput, setParticipantInput] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [projectId, setProjectId] = useState(currentProject?.id || '');
  const [sprintId, setSprintId] = useState('');
  const [sprints, setSprints] = useState<Sprint[]>([]);

  const getToken = (): string | null => {
    const sessionData = localStorage.getItem('auth_session');
    if (!sessionData) return null;
    try {
      const session = JSON.parse(sessionData);
      return session.accessToken;
    } catch {
      return null;
    }
  };

  // Load sprints when project changes
  useEffect(() => {
    const loadSprints = async () => {
      if (!projectId) {
        setSprints([]);
        return;
      }

      try {
        const token = getToken();
        if (!token) return;

        const projectSprints = await listSprintsByProject(token, projectId);
        setSprints(projectSprints);
      } catch (error) {
        console.error('Failed to load sprints:', error);
      }
    };

    loadSprints();
  }, [projectId]);

  // Update projectId when currentProject changes
  useEffect(() => {
    if (currentProject) {
      setProjectId(currentProject.id);
    }
  }, [currentProject]);

  const handleAddParticipant = () => {
    if (participantInput.trim() && !participants.includes(participantInput.trim())) {
      setParticipants([...participants, participantInput.trim()]);
      setParticipantInput('');
    }
  };

  const handleRemoveParticipant = (participant: string) => {
    setParticipants(participants.filter(p => p !== participant));
  };

  const handleSave = () => {
    if (!title.trim() || !dateTime || !projectId || !sprintId) {
      alert('Please fill in all required fields');
      return;
    }

    const newMeeting = {
      id: `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      type,
      dateTime,
      duration: parseInt(duration),
      participants,
      meetLink: meetLink.trim() || undefined,
      status: 'scheduled' as const,
      projectId,
      sprintId,
    };

    onSave(newMeeting);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setType('other');
    setDateTime('');
    setDuration('60');
    setParticipants([]);
    setParticipantInput('');
    setMeetLink('');
    setSprintId('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetForm()}>
      <DialogContent className="w-full max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
          <DialogTitle>Create New Meeting</DialogTitle>
          <DialogDescription>
            Schedule a new meeting and add participants
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-1">
          {/* Project and Sprint Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Project */}
            <div className="space-y-1.5">
              <Label htmlFor="project" className="text-sm">Project *</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger id="project" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sprint */}
            <div className="space-y-1.5">
              <Label htmlFor="sprint" className="text-sm">Sprint *</Label>
              <Select value={sprintId} onValueChange={setSprintId}>
                <SelectTrigger id="sprint" className="h-9">
                  <SelectValue placeholder="Select sprint" />
                </SelectTrigger>
                <SelectContent>
                  {sprints.map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!sprintId && (
                <p className="text-xs text-destructive">Sprint is required</p>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm">Meeting Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Sprint Planning"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Type and Duration Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Type */}
            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-sm">Meeting Type</Label>
              <Select value={type} onValueChange={(value: any) => setType(value)}>
                <SelectTrigger id="type" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sprint_planning">Sprint Planning</SelectItem>
                  <SelectItem value="sprint_review">Sprint Review</SelectItem>
                  <SelectItem value="retrospective">Retrospective</SelectItem>
                  <SelectItem value="standup">Stand-up</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <Label htmlFor="duration" className="text-sm">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-1.5">
            <Label htmlFor="dateTime" className="text-sm">Date & Time *</Label>
            <Input
              id="dateTime"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Meet Link */}
          <div className="space-y-1.5">
            <Label htmlFor="meetLink" className="text-sm">Google Meet Link (optional)</Label>
            <Input
              id="meetLink"
              type="url"
              placeholder="https://meet.google.com/..."
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Participants */}
          <div className="space-y-1.5">
            <Label htmlFor="participant" className="text-sm">Add Participants</Label>
            <div className="flex gap-2">
              <Input
                id="participant"
                placeholder="Name or email"
                value={participantInput}
                onChange={(e) => setParticipantInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()}
                className="h-9 flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddParticipant}
                className="h-9 px-3"
              >
                Add
              </Button>
            </div>

            {/* Participants List */}
            {participants.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 max-h-24 overflow-y-auto">
                {participants.map((participant) => (
                  <Badge key={participant} variant="secondary" className="gap-1 text-xs">
                    {participant}
                    <button
                      onClick={() => handleRemoveParticipant(participant)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 bg-background pt-4 mt-4 border-t flex gap-2 justify-end">
          <Button variant="outline" onClick={resetForm} className="h-9">
            Cancel
          </Button>
          <Button onClick={handleSave} className="h-9">
            Create Meeting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
