import { useState } from "react";
import { Users, CheckCircle, Clock, TrendingUp } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import TeamCard from "../components/TeamCard";
import TeamStatCard from "../components/TeamStatCard";
import TeamMemberCard from "../components/TeamMemberCard";
import CreateTeamModal from "../components/CreateTeamModal";
import AddMemberModal from "../components/AddMemberModal";
import { useTeamManagement } from "../hooks/useTeamManagement";

const TeamPage = () => {
  const {
    teams,
    loading,
    canCreateTeam,
    handleCreateTeam,
    handleAddMembers,
    handleRemoveMember,
    handleDeleteTeam,
    getAvailableUsers,
    getTeamStats,
  } = useTeamManagement();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Members");

  const stats = getTeamStats();

  const onCreateTeam = async () => {
    try {
      setActionLoading(true);
      await handleCreateTeam(teamName);
      setTeamName("");
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating team:", error);
      alert(error.message || "Failed to create team");
    } finally {
      setActionLoading(false);
    }
  };

  const onAddMembers = async () => {
    try {
      setActionLoading(true);
      await handleAddMembers(selectedTeam.id, selectedMembers);
      setSelectedMembers([]);
      setShowAddMemberModal(false);
      setSelectedTeam(null);
    } catch (error) {
      console.error("Error adding members:", error);
      alert(error.message || "Failed to add members");
    } finally {
      setActionLoading(false);
    }
  };

  const onRemoveMember = async (teamId, memberId) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      await handleRemoveMember(teamId, memberId);
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member");
    }
  };

  const onDeleteTeam = async (teamId) => {
    if (!confirm("Are you sure you want to delete this team?")) return;

    try {
      await handleDeleteTeam(teamId);
    } catch (error) {
      console.error("Error deleting team:", error);
      alert("Failed to delete team");
    }
  };

  const openAddMemberModal = (team) => {
    setSelectedTeam(team);
    setShowAddMemberModal(true);
  };

  const toggleMemberSelection = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const closeAddMemberModal = () => {
    setShowAddMemberModal(false);
    setSelectedMembers([]);
    setSelectedTeam(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Team Overview"
      subtitle="Manage your teams and members"
      actions={
        canCreateTeam && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Users size={20} />
            Create Team
          </button>
        )
      }
    >
      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            onAddMember={openAddMemberModal}
            onDelete={onDeleteTeam}
          />
        ))}
        {teams.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400">
            {canCreateTeam
              ? "No teams yet. Create your first team!"
              : "You're not part of any team yet."}
          </div>
        )}
      </div>

      {/* Team Statistics */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Team Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TeamStatCard
            icon={Users}
            value={stats.totalMembers}
            label="Team Members"
            gradient="bg-emerald-500"
          />
          <TeamStatCard
            icon={CheckCircle}
            value={stats.completedTasks}
            label="Completed Tasks"
            gradient="bg-blue-500"
          />
          <TeamStatCard
            icon={Clock}
            value={stats.activeTasks}
            label="Active Tasks"
            gradient="bg-orange-500"
          />
          <TeamStatCard
            icon={TrendingUp}
            value={stats.totalTasks}
            label="Total Tasks"
            gradient="bg-purple-500"
          />
        </div>
      </div>

      {/* Team Members Section */}
      {teams.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Team Members</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-slate-700">
            <button
              onClick={() => setActiveTab("Members")}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === "Members"
                  ? "text-white border-b-2 border-emerald-500"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Members
            </button>
          </div>

          {/* Members List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) =>
              team.members?.map((member) => (
                <TeamMemberCard
                  key={`${team.id}-${member.uid}`}
                  member={member}
                  team={team}
                  onRemove={onRemoveMember}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        teamName={teamName}
        setTeamName={setTeamName}
        onCreate={onCreateTeam}
        loading={actionLoading}
      />

      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={closeAddMemberModal}
        selectedTeam={selectedTeam}
        availableUsers={
          selectedTeam ? getAvailableUsers(selectedTeam.memberIds) : []
        }
        selectedMembers={selectedMembers}
        onToggleMember={toggleMemberSelection}
        onAddMembers={onAddMembers}
        loading={actionLoading}
      />
    </DashboardLayout>
  );
};

export default TeamPage;