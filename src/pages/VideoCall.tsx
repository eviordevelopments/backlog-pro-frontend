import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProjectContext } from "@/context/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Video,
  Plus,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Monitor,
  Users,
  Clock,
  AlertCircle,
  Maximize,
  Minimize,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { VideoCallSession } from "@/types";
import { toast as sonnerToast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createMeeting, getProjectMeetings, Meeting, CreateMeetingDto } from "@/api/meetings/meetings";

export default function VideoCall() {
  const { user } = useAuth();
  const { selectedProject: currentProject } = useProjectContext();
  const [sessions, setSessions] = useState<VideoCallSession[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [open, setOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "standup" as const,
    duration: 1,
    dateTime: new Date().toISOString().slice(0, 16),
    selectedParticipants: [] as string[],
  });

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

  const loadMeetings = async () => {
    const token = getToken();
    if (!token || !currentProject) return;

    try {
      setLoading(true);
      const data = await getProjectMeetings(token, currentProject.id);
      setMeetings(data);
      localStorage.setItem('projectMeetings', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to load meetings:', error);
      try {
        const saved = localStorage.getItem('projectMeetings');
        if (saved) {
          setMeetings(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load from localStorage:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentProject) {
      loadMeetings();
    }
  }, [currentProject]);

  useEffect(() => {
    const saved = localStorage.getItem("videoSessions");
    if (saved) {
      setSessions(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("videoSessions", JSON.stringify(sessions));
  }, [sessions]);

  // Initialize media stream when video is turned on
  useEffect(() => {
    if (activeSessionId && isVideoOn && !streamRef.current) {
      startMediaStream();
    }
  }, [activeSessionId, isVideoOn]);

  // Cleanup media stream on unmount or when call ends
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const startMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: !isMuted,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Apply audio mute state
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });

      sonnerToast.success("Camera & Microphone accessed successfully");
    } catch (error) {
      console.error("Error accessing media devices:", error);
      sonnerToast.error("Please allow access to camera and microphone in your browser settings");
      setIsVideoOn(false);
    }
  };

  const toggleMicrophone = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = async () => {
    if (isVideoOn) {
      // Stop video
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsVideoOn(false);
    } else {
      // Start video
      setIsVideoOn(true);
      await startMediaStream();
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else if ((document as any).webkitFullscreenElement) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  const handleStartCall = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      sonnerToast.error("Call title is required");
      return;
    }

    if (formData.selectedParticipants.length === 0) {
      sonnerToast.error("Select at least one participant");
      return;
    }

    const token = getToken();
    if (!token || !user || !currentProject) {
      sonnerToast.error('Not authenticated or no project selected');
      return;
    }

    try {
      setLoading(true);

      const input: CreateMeetingDto = {
        title: formData.title,
        type: formData.type,
        dateTime: new Date(formData.dateTime).toISOString(),
        duration: formData.duration,
        ownerId: user.id,
        participants: formData.selectedParticipants,
        agenda: formData.description,
        projectId: currentProject.id,
      };

      const newMeeting = await createMeeting(token, input);
      sonnerToast.success(`Meeting "${formData.title}" created successfully`);

      // Add to local state
      setMeetings([...meetings, newMeeting]);
      localStorage.setItem('projectMeetings', JSON.stringify([...meetings, newMeeting]));

      // Also create a video session
      const newSession: VideoCallSession = {
        id: newMeeting.id,
        title: formData.title,
        description: formData.description,
        initiatorId: user.id,
        initiatorName: "You",
        participantIds: formData.selectedParticipants,
        participants: formData.selectedParticipants.map((id) => ({
          id,
          name: id,
          status: "pending" as const,
        })),
        startedAt: new Date().toISOString(),
        status: "active",
        projectId: currentProject.id,
        createdAt: new Date().toISOString(),
      };

      setSessions([...sessions, newSession]);
      setActiveSessionId(newSession.id);
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create meeting:', error);
      sonnerToast.error(error instanceof Error ? error.message : "Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "standup",
      duration: 1,
      dateTime: new Date().toISOString().slice(0, 16),
      selectedParticipants: [],
    });
  };

  const handleJoinCall = (sessionId: string) => {
    setSessions(
      sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              participants: s.participants.map((p) =>
                p.id === "current-user"
                  ? { ...p, status: "connected" as const, joinedAt: new Date().toISOString() }
                  : p
              ),
            }
          : s
      )
    );
    setActiveSessionId(sessionId);
    sonnerToast.success("You have joined the call");
  };

  const handleEndCall = (sessionId: string) => {
    setSessions(
      sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: "ended" as const,
              endedAt: new Date().toISOString(),
            }
          : s
      )
    );
    setActiveSessionId(null);
    sonnerToast.success("Video call has been terminated");
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const activeSessions = sessions.filter((s) => s.status === "active");
  const endedSessions = sessions.filter((s) => s.status === "ended");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Video Calls</h1>
          <p className="text-muted-foreground mt-2">
            Connect with your team members in real-time
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="gap-2">
              <Plus className="w-4 h-4" />
              Start Call
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle>Start Video Call</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleStartCall} className="space-y-4">
              <div>
                <Label>Meeting Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Team Standup"
                  className="mt-2"
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background mt-2"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                    disabled={loading}
                  >
                    <option value="standup">Standup</option>
                    <option value="sprint_planning">Sprint Planning</option>
                    <option value="sprint_review">Sprint Review</option>
                    <option value="retrospective">Retrospective</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label>Duration (hours)</Label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })
                    }
                    min={1}
                    max={8}
                    className="mt-2"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label>Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) =>
                    setFormData({ ...formData, dateTime: e.target.value })
                  }
                  className="mt-2"
                  disabled={loading}
                />
              </div>

              <div>
                <Label>Agenda</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional meeting agenda"
                  className="mt-2"
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div>
                <Label>Invite Participants *</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border border-border/50 rounded-lg p-3 bg-muted/30">
                  <label className="flex items-center gap-2 p-1 rounded hover:bg-muted/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.selectedParticipants.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            selectedParticipants: [user?.id || ''],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            selectedParticipants: [],
                          });
                        }
                      }}
                      className="rounded"
                      disabled={loading}
                    />
                    <span className="text-sm">Me ({user?.name})</span>
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                <Video className="w-4 h-4" />
                {loading ? 'Creating...' : 'Create Meeting'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Call View */}
      {activeSession && (
        <div
          ref={containerRef}
          className={`${
            isFullscreen
              ? "fixed inset-0 z-50 bg-black"
              : "relative"
          }`}
        >
          <Card
            className={`glass border-accent/50 ${
              isFullscreen ? "h-full rounded-none border-0" : ""
            }`}
          >
            <CardHeader className={isFullscreen ? "p-4" : ""}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                  <div>
                    <CardTitle>{activeSession.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activeSession.participants.length} participants
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="gap-2"
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize className="w-4 h-4" />
                        Exit Fullscreen
                      </>
                    ) : (
                      <>
                        <Maximize className="w-4 h-4" />
                        Fullscreen
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      handleEndCall(activeSession.id);
                      if (isFullscreen) {
                        document.exitFullscreen().catch(() => {});
                        setIsFullscreen(false);
                      }
                    }}
                    className="gap-2"
                  >
                    <PhoneOff className="w-4 h-4" />
                    End Call
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent
              className={`space-y-4 ${isFullscreen ? "h-[calc(100%-120px)]" : ""}`}
            >
              {/* Video Grid */}
              <div
                className={`${
                  isFullscreen
                    ? "grid grid-cols-2 gap-4 h-full"
                    : "grid grid-cols-1 md:grid-cols-2 gap-4"
                }`}
              >
                {/* Local Video */}
                <div
                  className={`relative bg-black rounded-lg overflow-hidden ${
                    isFullscreen ? "aspect-auto" : "aspect-video"
                  }`}
                >
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                  />
                  <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                    You
                  </div>
                  {!isVideoOn && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <Video className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Remote Participants */}
                {activeSession.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className={`relative bg-muted rounded-lg overflow-hidden flex items-center justify-center ${
                      isFullscreen ? "aspect-auto" : "aspect-video"
                    }`}
                  >
                    <div className="text-center">
                      <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium">{participant.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {participant.status === "connected"
                          ? "Connected"
                          : "Pending"}
                      </p>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                      {participant.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* Call Controls */}
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-border/50">
                <Button
                  variant={isMuted ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleMicrophone}
                  className="gap-2"
                >
                  {isMuted ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      Unmute
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      Mute
                    </>
                  )}
                </Button>

                <Button
                  variant={!isVideoOn ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleVideo}
                  className="gap-2"
                >
                  {isVideoOn ? (
                    <>
                      <Video className="w-4 h-4" />
                      Stop Video
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      Start Video
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Monitor className="w-4 h-4" />
                  Share Screen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Sessions */}
      {!activeSessionId && activeSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Calls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass hover:border-accent/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {session.title}
                        </CardTitle>
                        {session.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {session.description}
                          </p>
                        )}
                      </div>
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {session.participants.length} participants
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Started{" "}
                      {new Date(session.startedAt).toLocaleTimeString()}
                    </div>
                    <Button
                      onClick={() => handleJoinCall(session.id)}
                      className="w-full gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Join Call
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No Active Sessions */}
      {!activeSessionId && activeSessions.length === 0 && (
        <Card className="glass">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Active Calls</h3>
              <p className="text-muted-foreground mb-6">
                Start a new video call to connect with your team
              </p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Start Your First Call
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ended Sessions */}
      {endedSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Call History</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {endedSessions.slice(-6).map((session) => (
              <Card key={session.id} className="glass opacity-75">
                <CardHeader>
                  <CardTitle className="text-sm">{session.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <p>
                    Duration:{" "}
                    {session.endedAt
                      ? Math.round(
                          (new Date(session.endedAt).getTime() -
                            new Date(session.startedAt).getTime()) /
                            60000
                        )
                      : 0}{" "}
                    minutes
                  </p>
                  <p>{session.participants.length} participants</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
