import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProjectContext } from "@/context/ProjectContext";
import { useProfile } from "@/hooks/use-profile";
import { UserProfile, UpdateProfileInput } from "@/api/user/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { getWorkedHours, WorkedHoursResponseDto } from "@/api/worked-hours/worked-hours";
import { Clock } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  skills: z.string(),
  hourlyRate: z.coerce.number().min(0, "Hourly rate must be positive"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { selectedProject: currentProject } = useProjectContext();
  const { getProfile, updateProfile, updateAvatar } = useProfile();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [workedHours, setWorkedHours] = useState<WorkedHoursResponseDto | null>(null);
  const [loadingHours, setLoadingHours] = useState(false);

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

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      skills: "",
      hourlyRate: 0,
    },
  });

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profileData = await getProfile();
        setProfile(profileData);
        form.reset({
          name: profileData.name,
          skills: profileData.skills.join(", "),
          hourlyRate: profileData.hourlyRate,
        });
        setAvatarUrl(profileData.avatar || "");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [getProfile, form, toast]);

  // Load worked hours
  useEffect(() => {
    const loadWorkedHours = async () => {
      const token = getToken();
      if (!token) return;

      try {
        setLoadingHours(true);
        const data = await getWorkedHours(token, currentProject?.id);
        setWorkedHours(data);
      } catch (error) {
        console.error('Failed to load worked hours:', error);
        // Set default values on error
        setWorkedHours({
          userId: user?.id || '',
          totalHours: 0,
          projectId: currentProject?.id,
          breakdown: [],
        });
      } finally {
        setLoadingHours(false);
      }
    };

    loadWorkedHours();
  }, [currentProject?.id, user?.id]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setUpdating(true);
      const skillsArray = data.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(Boolean);
      
      const input: UpdateProfileInput = {
        name: data.name,
        skills: skillsArray,
        hourlyRate: data.hourlyRate,
      };
      const updated = await updateProfile(input);
      setProfile(updated);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarUpdate = async () => {
    if (!avatarUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid avatar URL",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdating(true);
      const updated = await updateAvatar(avatarUrl);
      setProfile(updated);
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update avatar",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your profile information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>Update your profile picture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.avatar && (
              <div className="flex justify-center">
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="h-32 w-32 rounded-full object-cover"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar URL</label>
              <Input
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                disabled={updating}
              />
            </div>
            <Button
              onClick={handleAvatarUpdate}
              disabled={updating}
              className="w-full"
            >
              {updating ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                "Update Avatar"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Profile Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your email and account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium">User ID</label>
              <p className="text-sm text-muted-foreground font-mono">{profile?.userId}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Member Since</label>
              <p className="text-sm text-muted-foreground">
                {profile?.createdAt && new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Worked Hours Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Worked Hours
            </CardTitle>
            <CardDescription>
              {currentProject ? `Time tracking for ${currentProject.name}` : 'Your time tracking information'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingHours ? (
              <div className="flex items-center justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4">
                  <label className="text-sm font-medium text-muted-foreground">Total Hours</label>
                  <p className="text-3xl font-bold text-primary mt-1">
                    {workedHours?.totalHours.toFixed(1) || '0'}
                    <span className="text-lg ml-1">hours</span>
                  </p>
                </div>
                
                {!currentProject && (
                  <div className="text-sm text-muted-foreground italic p-3 bg-muted rounded">
                    Select a project to view project-specific hours
                  </div>
                )}
                
                {workedHours?.breakdown && workedHours.breakdown.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Recent Activity</label>
                    <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                      {workedHours.breakdown.slice(0, 10).map((entry, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm p-2 hover:bg-muted rounded">
                          <span className="text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString('es-ES', { 
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="font-semibold text-primary">{entry.hours}h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {(!workedHours?.breakdown || workedHours.breakdown.length === 0) && (
                  <div className="text-sm text-muted-foreground italic p-3 bg-muted rounded text-center">
                    No time entries yet
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your name"
                        disabled={updating}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="TypeScript, React, Node.js (comma-separated)"
                        disabled={updating}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50"
                        disabled={updating}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={updating} className="w-full">
                {updating ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
