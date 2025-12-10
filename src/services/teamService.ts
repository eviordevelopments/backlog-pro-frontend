import { TeamMember } from "@/types";

/**
 * Load all team members from localStorage
 * @returns Array of team members
 */
export async function loadTeamMembers(): Promise<TeamMember[]> {
  try {
    const saved = localStorage.getItem("teamMembers");
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load team members:", error);
    return [];
  }
}

/**
 * Update a team member's profile in localStorage
 * @param memberId - The ID of the team member to update
 * @param updates - Partial team member data to update
 */
export async function updateTeamMember(
  memberId: string,
  updates: Partial<Pick<TeamMember, 'name' | 'role' | 'image'>>
): Promise<void> {
  try {
    const saved = localStorage.getItem("teamMembers");
    const members: TeamMember[] = saved ? JSON.parse(saved) : [];
    
    const updated = members.map(m =>
      m.id === memberId ? { ...m, ...updates } : m
    );
    
    localStorage.setItem("teamMembers", JSON.stringify(updated));
  } catch (error) {
    throw new Error(`Failed to update team member: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a team member from localStorage
 * @param memberId - The ID of the team member to delete
 */
export async function deleteTeamMember(memberId: string): Promise<void> {
  try {
    const saved = localStorage.getItem("teamMembers");
    const members: TeamMember[] = saved ? JSON.parse(saved) : [];
    
    const filtered = members.filter(m => m.id !== memberId);
    localStorage.setItem("teamMembers", JSON.stringify(filtered));
  } catch (error) {
    throw new Error(`Failed to delete team member: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
