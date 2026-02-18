import { useState } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  UserPlus,
  Trash2,
  Crown,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";
import { useTeamManagement } from "../hooks/useTeamManagement";
import { useTaskManagement } from "../hooks/useTaskManagement";
import { Search } from "lucide-react";
import Modal from "../components/Modal";

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

  const { tasks, loading: tasksLoading } = useTaskManagement(teams);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Members");
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const availableUsers = selectedTeam
    ? getAvailableUsers(selectedTeam.members?.map((m) => m.uid) ?? [])
    : [];
  const filteredUsers = availableUsers.filter((user) => {
    const q = searchQuery.toLowerCase();
    return (
      user.displayName?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q)
    );
  });

  const displayedStats = getTeamStats(selectedTeamId, tasks);

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
        : [...prev, userId],
    );
  };

  const closeAddMemberModal = () => {
    setShowAddMemberModal(false);
    setSelectedMembers([]);
    setSelectedTeam(null);
  };

  const selectedTeamData = selectedTeamId
    ? teams.find((t) => t.id === selectedTeamId)
    : null;

  const displayedMembers = selectedTeamId
    ? selectedTeamData?.members || []
    : teams.flatMap(
        (team) =>
          team.members?.map((member) => ({ ...member, teamName: team.name })) ||
          [],
      );

  if (loading || tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-700">
        {" "}
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
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Users size={20} />
            Create Team
          </button>
        )
      }
    >
      {/* Teams Grid */}
      <div className="flex gap-4 mb-12 overflow-x-auto pb-4">
        {teams.map((team) => (
          <Card
            key={team.id}
            onClick={() =>
              setSelectedTeamId(selectedTeamId === team.id ? null : team.id)
            }
            className={`shrink-0 p-6 rounded-2xl border-2 transition-all duration-300 min-w-62.5 cursor-pointer ${
              selectedTeamId === team.id
                ? "bg-violet-50 border-violet-500 shadow-lg shadow-violet-200 ring-2 ring-violet-200"
                : team.isOwner
                  ? "bg-white border-violet-200 hover:border-violet-400 hover:shadow-md hover:bg-violet-50/50"
                  : "bg-white border-gray-200 hover:border-violet-300 hover:shadow-md hover:bg-violet-50/30"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <h3
                className={`text-xl font-bold transition-colors ${
                  selectedTeamId === team.id
                    ? "text-violet-700"
                    : "text-gray-800"
                }`}
              >
                {team.name}
              </h3>
              <div className="flex gap-2">
                {team.isOwner && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddMemberModal(team);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 transition-colors"
                      title="Add Members"
                    >
                      <UserPlus size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTeam(team.id);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete Team"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
                {team.isOwner && (
                  <Crown size={18} className="text-yellow-400" />
                )}
              </div>
            </div>
            <div
              className={`flex items-center gap-2 text-sm transition-colors ${
                selectedTeamId === team.id ? "text-violet-500" : "text-gray-400"
              }`}
            >
              <Users size={16} />
              <span>{team.members?.length || 0} members</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Team Statistics */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {selectedTeamId
            ? `${selectedTeamData?.name} Statistics`
            : "Statistics"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            {
              Icon: Users,
              value: displayedStats.totalMembers,
              label: "Team Members",
              gradient: "bg-emerald-500",
            },
            {
              Icon: CheckCircle,
              value: displayedStats.completedTasks,
              label: "Completed Tasks",
              gradient: "bg-blue-500",
            },
            {
              Icon: Clock,
              value: displayedStats.activeTasks,
              label: "Active Tasks",
              gradient: "bg-orange-500",
            },
            {
              Icon: AlertCircle,
              value: displayedStats.needsReview,
              label: "Needs Review",
              gradient: "bg-yellow-500",
            },
            {
              Icon: TrendingUp,
              value: displayedStats.totalTasks,
              label: "Total Tasks",
              gradient: "bg-purple-500",
            },
          ].map(({ Icon, value, label, gradient }, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 ${gradient} rounded-lg flex items-center justify-center`}
                >
                  <Icon size={24} className="text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-800">
                    {value}
                  </div>
                  <div className="text-gray-500 text-sm">{label}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Team Members Section */}
      {teams.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedTeamId
                ? `${selectedTeamData?.name} Members`
                : " Members"}
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("Members")}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === "Members"
                  ? "text-violet-600 border-b-2 border-violet-500"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Members
            </button>
          </div>

          {/* Members List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedMembers.length > 0 ? (
              displayedMembers
                .filter(
                  (member, index, self) =>
                    index === self.findIndex((m) => m.uid === member.uid),
                )
                .map((member) => {
                  const memberTeam = selectedTeamId
                    ? selectedTeamData
                    : teams.find((t) =>
                        t.members?.some((m) => m.uid === member.uid),
                      );

                  return (
                    <Card
                      key={`${memberTeam?.id}-${member.uid}`}
                      className="p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                            {member.displayName
                              ?.substring(0, 2)
                              .toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-gray-800 font-semibold">
                                {member.displayName}
                              </h3>
                              {member.uid === memberTeam?.ownerId && (
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-medium">
                                  Owner
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm">
                              {member.email}
                            </p>
                            {!selectedTeamId && (
                              <p className="text-gray-500 text-xs mt-1">
                                <span className="text-gray-600 font-medium">
                                  Team:
                                </span>{" "}
                                {memberTeam?.name}
                              </p>
                            )}
                          </div>
                        </div>
                        {memberTeam?.isOwner &&
                          member.uid !== memberTeam?.ownerId && (
                            <button
                              onClick={() =>
                                onRemoveMember(memberTeam.id, member.uid)
                              }
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Remove member"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                      </div>
                    </Card>
                  );
                })
            ) : (
              <div className="col-span-full text-center text-gray-400 py-8">
                No members found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Team"
        maxWidth="max-w-md"
      >
        <input
          type="text"
          placeholder="Team name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 mb-6"
          autoFocus
        />
        <button
          onClick={async () => {
            try {
              setActionLoading(true);
              await handleCreateTeam(teamName);
              setTeamName("");
              setShowCreateModal(false);
            } catch (error) {
              alert("Failed to create team");
            } finally {
              setActionLoading(false);
            }
          }}
          disabled={!teamName.trim() || actionLoading}
          className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {actionLoading ? "Creating..." : "Create Team"}
        </button>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddMemberModal}
        onClose={() => {
          setShowAddMemberModal(false);
          setSelectedMembers([]);
          setSearchQuery("");
        }}
        title={`Add Member to ${selectedTeam?.name}`}
        maxWidth="max-w-2xl"
      >
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-400 transition-all"
          />
        </div>
        <div
          className="space-y-2 mb-6 overflow-y-auto pr-2 max-h-60 min-h-60
    [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-800/50
    [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-lg
    [&::-webkit-scrollbar-thumb]:hover:bg-slate-500"
        >
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.uid}
                onClick={() => toggleMemberSelection(user.uid)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedMembers.includes(user.uid)
                    ? "bg-emerald-500/20 border-emerald-500"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user.displayName?.substring(0, 2).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-800 font-medium">
                      {user.displayName}
                    </div>
                    <div className="text-gray-500 text-sm">{user.email}</div>
                  </div>
                  {selectedMembers.includes(user.uid) && (
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">
              {searchQuery
                ? "No users found matching your search"
                : "No available users to add"}
            </div>
          )}
        </div>
        <button
          onClick={async () => {
            try {
              setActionLoading(true);
              await handleAddMembers(selectedTeam.id, selectedMembers);
              closeAddMemberModal();
              setSearchQuery("");
            } catch (error) {
              alert("Failed to add members");
            } finally {
              setActionLoading(false);
            }
          }}
          disabled={selectedMembers.length === 0 || actionLoading}
          className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {actionLoading
            ? "Adding..."
            : `Add ${selectedMembers.length} Member${selectedMembers.length !== 1 ? "s" : ""}`}
        </button>
      </Modal>
    </DashboardLayout>
  );
};

export default TeamPage;
