import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  createTeam,
  addMembersToTeam,
  removeMemberFromTeam,
  deleteTeam,
  subscribeToUserTeams,
  fetchTeamMembers,
  getAllRegularUsers,
} from "../services/teamService";

export const useTeamManagement = () => {
  const { user, userRole } = useAuth();
  const [teams, setTeams] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all regular users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllRegularUsers();
        setAllUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Subscribe to teams
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserTeams(
      user.uid,
      userRole,
      async (snapshot) => {
        const teamsData = await Promise.all(
          snapshot.docs.map(async (teamDoc) => {
            const teamData = teamDoc.data();
            const members = await fetchTeamMembers(teamData.memberIds);

            return {
              id: teamDoc.id,
              ...teamData,
              members,
              isOwner: teamData.ownerId === user.uid,
            };
          }),
        );

        setTeams(teamsData);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user, userRole]);

  const handleCreateTeam = async (teamName) => {
    if (!teamName.trim()) throw new Error("Team name is required");

    return await createTeam(
      user.uid,
      user.displayName || user.email,
      user.email,
      teamName,
    );
  };

  const handleAddMembers = async (teamId, memberIds) => {
    if (memberIds.length === 0) throw new Error("No members selected");
    return await addMembersToTeam(teamId, memberIds);
  };

  const handleRemoveMember = async (teamId, memberId) => {
    return await removeMemberFromTeam(teamId, memberId);
  };

  const handleDeleteTeam = async (teamId) => {
    return await deleteTeam(teamId);
  };

  const getAvailableUsers = (teamMemberIds) => {
    return allUsers.filter((user) => !teamMemberIds.includes(user.uid));
  };

  const getTeamStats = () => {
    const totalMembers = teams.reduce(
      (sum, team) => sum + (team.members?.length || 0),
      0,
    );
    return {
      totalMembers,
      totalTeams: teams.length,
      completedTasks: 1, // Placeholder
      activeTasks: 1, // Placeholder
      totalTasks: 2, // Placeholder
    };
  };

  const canCreateTeam = userRole === "super_admin" || userRole === "admin";

  return {
    teams,
    allUsers,
    loading,
    canCreateTeam,
    handleCreateTeam,
    handleAddMembers,
    handleRemoveMember,
    handleDeleteTeam,
    getAvailableUsers,
    getTeamStats,
  };
};
