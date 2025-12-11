import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useProjectContext } from '@/context/ProjectContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Video, Users, Clock, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import MeetingDialog from '@/components/meetings/MeetingDialog';

interface MeetingItem {
  id: string;
  title: string;
  dateTime: string;
  duration: number;
  participants: string[];
  meetLink?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  type: 'sprint_planning' | 'sprint_review' | 'retrospective' | 'standup' | 'other';
}

export default function Meetings() {
  const { selectedProject } = useProjectContext();
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load meetings from localStorage
  useEffect(() => {
    const savedMeetings = localStorage.getItem('meetings');
    if (savedMeetings) {
      setMeetings(JSON.parse(savedMeetings));
    }
  }, []);

  // Save meetings to localStorage
  useEffect(() => {
    localStorage.setItem('meetings', JSON.stringify(meetings));
  }, [meetings]);

  const handleAddMeeting = (newMeeting: MeetingItem) => {
    setMeetings([...meetings, newMeeting]);
    setIsDialogOpen(false);
  };

  const handleDeleteMeeting = (id: string) => {
    setMeetings(meetings.filter(m => m.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sprint_planning: 'Sprint Planning',
      sprint_review: 'Sprint Review',
      retrospective: 'Retrospective',
      standup: 'Stand-up',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const upcomingMeetings = meetings
    .filter(m => m.status === 'scheduled' || m.status === 'in_progress')
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const pastMeetings = meetings
    .filter(m => m.status === 'completed' || m.status === 'cancelled')
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Meetings</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track your team meetings
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Meeting
        </Button>
      </div>

      {/* Meeting Dialog */}
      <MeetingDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleAddMeeting}
      />

      {/* Upcoming Meetings */}
      {upcomingMeetings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Upcoming Meetings</h2>
          <div className="grid gap-4">
            {upcomingMeetings.map(meeting => (
              <Card key={meeting.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{meeting.title}</CardTitle>
                        <Badge variant="outline" className={getStatusColor(meeting.status)}>
                          {meeting.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
                        </Badge>
                        <Badge variant="secondary">{getTypeLabel(meeting.type)}</Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {formatDateTime(meeting.dateTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {meeting.duration} min
                        </span>
                      </CardDescription>
                    </div>
                    {meeting.meetLink && (
                      <a
                        href={meeting.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4"
                      >
                        <Button size="sm" variant="outline" className="gap-2">
                          <Video className="w-4 h-4" />
                          Join
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </a>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {meeting.participants.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Participants ({meeting.participants.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {meeting.participants.map((participant, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {participant}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Upcoming Meetings */}
      {upcomingMeetings.length === 0 && meetings.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No meetings scheduled</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first meeting to get started
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Meeting
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Past Meetings */}
      {pastMeetings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Past Meetings</h2>
          <div className="grid gap-4">
            {pastMeetings.map(meeting => (
              <Card key={meeting.id} className="opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{meeting.title}</CardTitle>
                        <Badge variant="outline" className={getStatusColor(meeting.status)}>
                          {meeting.status === 'completed' ? 'Completed' : 'Cancelled'}
                        </Badge>
                        <Badge variant="secondary">{getTypeLabel(meeting.type)}</Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {formatDateTime(meeting.dateTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {meeting.duration} min
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {meeting.participants.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Participants ({meeting.participants.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {meeting.participants.map((participant, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {participant}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
