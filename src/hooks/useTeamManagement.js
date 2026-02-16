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
    const team = teams.find((t) => t.id === teamId);
    return await addMembersToTeam(teamId, memberIds, {
      teamName: team?.name || "",
      actorId: user.uid,
      actorName: user.displayName || "",
    });
  };

  const handleRemoveMember = async (teamId, memberId) => {
    const team = teams.find((t) => t.id === teamId);
    return await removeMemberFromTeam(teamId, memberId, {
      teamName: team?.name || "",
      actorId: user.uid,
      actorName: user.displayName || "",
    });
  };

  const handleDeleteTeam = async (teamId) => {
    return await deleteTeam(teamId);
  };

  const getAvailableUsers = (teamMemberIds) => {
    return allUsers.filter((user) => !teamMemberIds.includes(user.uid));
  };

  const getTeamStats = (teamId = null, allTasks = []) => {
    // Calculate members based on selected team
    let totalMembers;
    if (teamId) {
      const selectedTeam = teams.find((t) => t.id === teamId);
      totalMembers = selectedTeam?.members?.length || 0;
    } else {
      // Menggunakan Set untuk menghindari duplikasi member yang ada di banyak team
      const uniqueMemberIds = new Set();
      teams.forEach((team) => {
        team.members?.forEach((member) => {
          uniqueMemberIds.add(member.uid || member.id);
        });
      });
      totalMembers = uniqueMemberIds.size;
    }

    // Filter tasks by team if teamId is provided
    const relevantTasks = teamId
      ? allTasks.filter((task) => task.teamId === teamId)
      : allTasks;

    const completedTasks = relevantTasks.filter(
      (task) => task.status === "done",
    ).length;
    const activeTasks = relevantTasks.filter(
      (task) => task.status === "inprogress",
    ).length;
    const needsReview = relevantTasks.filter(
      (task) => task.status === "inreview",
    ).length;
    const totalTasks = relevantTasks.length;

    return {
      totalMembers,
      totalTeams: teams.length,
      completedTasks,
      activeTasks,
      needsReview,
      totalTasks,
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
