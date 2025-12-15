import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { listAllUsers, UserProfile } from '@/api/user/users';
import { TeamMember } from '@/types';

export function useTeamMembers() {
  const { user, token } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) {
      setTeamMembers([]);
      return;
    }

    const fetchTeamMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        const users = await listAllUsers(token);
        
        const members: TeamMember[] = users.map((user: UserProfile) => ({
          id: user.userId,
          name: user.name,
          role: 'Developer',
          skills: user.skills || [],
          availability: 100,
          image: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
          tasksCompleted: 0,
          averageCycleTime: 0,
          velocity: 0,
        }));
        
        setTeamMembers(members);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch team members';
        setError(errorMessage);
        console.error('Error fetching team members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [user, token]);

  return { teamMembers, loading, error };
}
