import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "@/types";

/**
 * Load all team members from Supabase database
 * @returns Array of team members
 * @throws Error if database query fails
 */
export async function loadTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to load team members: ${error.message}`);
  }

  // Map Supabase data to TeamMember type
  return (data || []).map(member => ({
    id: member.id,
    name: member.name,
    role: member.role as TeamMember["role"],
    skills: [], // Skills not stored in Supabase yet, default to empty
    availability: 100, // Availability not stored in Supabase yet, default to 100
    image: member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`,
    // Computed metrics - will be calculated by the UI
    tasksCompleted: 0,
    averageCycleTime: 0,
    velocity: 0,
  }));
}

/**
 * Update a team member's profile in Supabase
 * @param memberId - The ID of the team member to update
 * @param updates - Partial team member data to update
 * @throws Error if update fails or user is not authorized
 */
export async function updateTeamMember(
  memberId: string,
  updates: Partial<Pick<TeamMember, 'name' | 'role' | 'image'>>
): Promise<void> {
  // Map TeamMember fields to Supabase fields
  const supabaseUpdates: any = {};
  
  if (updates.name !== undefined) {
    supabaseUpdates.name = updates.name;
  }
  
  if (updates.role !== undefined) {
    supabaseUpdates.role = updates.role;
  }
  
  if (updates.image !== undefined) {
    supabaseUpdates.avatar = updates.image;
  }

  const { error } = await supabase
    .from('team_members')
    .update(supabaseUpdates)
    .eq('id', memberId);

  if (error) {
    throw new Error(`Failed to update team member: ${error.message}`);
  }
}

/**
 * Delete a team member from Supabase (admin only)
 * @param memberId - The ID of the team member to delete
 * @throws Error if deletion fails or user is not authorized
 */
export async function deleteTeamMember(memberId: string): Promise<void> {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', memberId);

  if (error) {
    throw new Error(`Failed to delete team member: ${error.message}`);
  }
}
