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
  AlertTriangle,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";
import { useTeamManagement } from "../hooks/useTeamManagement";
import { useTaskManagement } from "../hooks/useTaskManagement";
import { Search } from "lucide-react";
import Modal from "../components/Modal";
import { getTeamColor } from "../utils/teamColors";
import { useToast } from "../components/Toast";
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
  const [showDeleteTeamModal, setShowDeleteTeamModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [teamNameError, setTeamNameError] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Members");
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const toast = useToast();
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

  const onRemoveMember = (team, member) => {
    setMemberToRemove({ team, member });
    setShowRemoveMemberModal(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      setActionLoading(true);
      await handleRemoveMember(
        memberToRemove.team.id,
        memberToRemove.member.uid,
      );
      setShowRemoveMemberModal(false);
      toast.success(
        `${memberToRemove.member.displayName} berhasil dihapus dari tim.`,
      );
      setMemberToRemove(null);
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Gagal menghapus member.");
    } finally {
      setActionLoading(false);
    }
  };

  const onDeleteTeam = (team) => {
    setTeamToDelete(team);
    setShowDeleteTeamModal(true);
  };

  const confirmDeleteTeam = async () => {
    if (!teamToDelete) return;
    try {
      setActionLoading(true);
      await handleDeleteTeam(teamToDelete.id);
      if (selectedTeamId === teamToDelete.id) setSelectedTeamId(null);
      setShowDeleteTeamModal(false);
      toast.success(`Tim "${teamToDelete.name}" berhasil dihapus.`);
      setTeamToDelete(null);
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Gagal menghapus tim.");
    } finally {
      setActionLoading(false);
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
    : (() => {
        const memberMap = new Map();
        teams.forEach((team) => {
          team.members?.forEach((member) => {
            if (!memberMap.has(member.uid)) {
              memberMap.set(member.uid, { ...member, teamNames: [team.name] });
            } else {
              memberMap.get(member.uid).teamNames.push(team.name);
            }
          });
        });
        return Array.from(memberMap.values());
      })();

  if (loading || tasksLoading) {
    return (
      <DashboardLayout title="Team Overview">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Memuat teams...</p>
          </div>
        </div>
      </DashboardLayout>
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
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-violet-200"
          >
            <Users size={16} />
            Create Team
          </button>
        )
      }
    >
      {/* Teams Grid — card dengan color bar dan info lebih kaya */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {teams.map((team, idx) => {
          const teamColorPalette = [
            {
              bar: "bg-violet-500",
              soft: "bg-violet-50",
              text: "text-violet-700",
              border: "border-violet-300",
            },
            {
              bar: "bg-blue-500",
              soft: "bg-blue-50",
              text: "text-blue-700",
              border: "border-blue-300",
            },
            {
              bar: "bg-emerald-500",
              soft: "bg-emerald-50",
              text: "text-emerald-700",
              border: "border-emerald-300",
            },
            {
              bar: "bg-amber-500",
              soft: "bg-amber-50",
              text: "text-amber-700",
              border: "border-amber-300",
            },
            {
              bar: "bg-pink-500",
              soft: "bg-pink-50",
              text: "text-pink-700",
              border: "border-pink-300",
            },
          ];
          const palette = teamColorPalette[idx % teamColorPalette.length];
          const isSelected = selectedTeamId === team.id;
          const taskCount = tasks.filter((t) => t.teamId === team.id).length;
          const doneCount = tasks.filter(
            (t) => t.teamId === team.id && t.status === "done",
          ).length;

          return (
            <Card
              key={team.id}
              onClick={() => setSelectedTeamId(isSelected ? null : team.id)}
              className={`relative overflow-hidden cursor-pointer rounded-2xl border-2 transition-all duration-300 p-5 ${
                isSelected
                  ? `${palette.soft} ${palette.border} shadow-lg shadow-current -translate-y-1`
                  : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              {/* Top color bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${palette.bar}`}
              />

              <div className="mt-1">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 ${palette.bar} rounded-xl flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {team.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex gap-1.5 items-center">
                    {team.isOwner && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openAddMemberModal(team);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Add Members"
                        >
                          <UserPlus size={15} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTeam(team);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete Team"
                        >
                          <Trash2 size={15} />
                        </button>
                        <Crown size={14} className="text-yellow-400 ml-0.5" />
                      </>
                    )}
                  </div>
                </div>

                <h3
                  className={`font-bold text-base mb-1 ${isSelected ? palette.text : "text-gray-800"}`}
                >
                  {team.name}
                </h3>

                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {team.members?.length || 0} members
                  </span>
                  <span>{taskCount} tasks</span>
                </div>

                {/* Mini progress bar */}
                {taskCount > 0 && (
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${palette.bar} rounded-full transition-all`}
                      style={{
                        width: `${Math.round((doneCount / taskCount) * 100)}%`,
                      }}
                    />
                  </div>
                )}
                {taskCount > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {doneCount}/{taskCount} selesai
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Team Statistics */}
      <div className="mb-12">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 lg:mb-6">
          {selectedTeamId
            ? `${selectedTeamData?.name} Statistics`
            : "Statistics"}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-4 xl:gap-6">
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
            <Card key={i} className="p-4 lg:p-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 ${gradient} rounded-xl flex items-center justify-center`}
                >
                  <Icon size={24} className="text-white" />
                </div>
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-gray-800">
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
              displayedMembers.map((member) => {
                const memberTeam = selectedTeamId ? selectedTeamData : null;
                return (
                  <Card key={`${memberTeam?.id}-${member.uid}`} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-linear-to-br from-violet-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {member.displayName?.substring(0, 2).toUpperCase() ||
                            "U"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-gray-800 font-semibold">
                              {member.displayName}
                            </h3>
                            {member.uid === memberTeam?.ownerId && (
                              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-600 text-xs rounded-full font-medium border border-yellow-300">
                                Owner
                              </span>
                            )}
                            {member.role === "super_admin" ? (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full font-medium border border-purple-300">
                                Super Admin
                              </span>
                            ) : member.role === "admin" ? (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full font-medium border border-blue-300">
                                Admin
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-medium border border-gray-200">
                                User
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">
                            {member.email}
                          </p>
                          {!selectedTeamId && member.teamNames && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {member.teamNames.map((teamName) => {
                                const team = teams.find(
                                  (t) => t.name === teamName,
                                );
                                const color = getTeamColor(team?.id);
                                return (
                                  <span
                                    key={teamName}
                                    style={{
                                      backgroundColor: color.bg,
                                      color: color.text,
                                      border: `1px solid ${color.border}`,
                                    }}
                                    className="px-2 py-0.5 text-xs rounded-full font-medium whitespace-nowrap"
                                  >
                                    {teamName}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedTeamId &&
                        memberTeam?.isOwner &&
                        member.uid !== memberTeam?.ownerId && (
                          <button
                            onClick={() => onRemoveMember(memberTeam, member)}
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
        onClose={() => {
          setShowCreateModal(false);
          setTeamNameError("");
        }}
        title="Create New Team"
        maxWidth="max-w-md"
      >
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Team Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Design Team"
            value={teamName}
            onChange={(e) => {
              setTeamName(e.target.value);
              if (teamNameError) setTeamNameError("");
            }}
            className={`w-full px-4 py-3 border rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-sm ${
              teamNameError
                ? "bg-red-50 border-red-400 focus:ring-red-100"
                : "bg-gray-50 border-gray-200 focus:ring-violet-200 focus:border-violet-400 focus:bg-white"
            }`}
            autoFocus
          />
          {teamNameError && (
            <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
              <AlertCircle size={12} className="shrink-0" />
              {teamNameError}
            </p>
          )}
        </div>
        <button
          onClick={async () => {
            if (!teamName.trim()) {
              setTeamNameError("Team name is required");
              return;
            }
            try {
              setActionLoading(true);
              await handleCreateTeam(teamName);
              setTeamName("");
              setTeamNameError("");
              toast.success("Tim berhasil dibuat! 🎉");
              setShowCreateModal(false);
            } catch (error) {
              toast.error("Gagal membuat tim.");
            } finally {
              setActionLoading(false);
            }
          }}
          disabled={actionLoading}
          className="w-full px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-violet-200"
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
          className="space-y-2 mb-6 overflow-y-auto pr-1 max-h-60 min-h-60
    [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-100
    [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb:hover]:bg-gray-400"
        >
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.uid}
                onClick={() => toggleMemberSelection(user.uid)}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedMembers.includes(user.uid)
                    ? "bg-violet-50 border-violet-400"
                    : "bg-white border-gray-200 hover:border-violet-200 hover:bg-violet-50/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-linear-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {user.displayName?.substring(0, 2).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-800 font-medium">
                      {user.displayName}
                    </div>
                    <div className="text-gray-500 text-sm">{user.email}</div>
                  </div>
                  {selectedMembers.includes(user.uid) && (
                    <div className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center shrink-0">
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
              toast.success(
                `${selectedMembers.length} member berhasil ditambahkan.`,
              );
              closeAddMemberModal();
              setSearchQuery("");
            } catch (error) {
              toast.error("Gagal menambahkan member.");
            } finally {
              setActionLoading(false);
            }
          }}
          disabled={selectedMembers.length === 0 || actionLoading}
          className="w-full px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-violet-200"
        >
          {actionLoading
            ? "Adding..."
            : `Add ${selectedMembers.length} Member${selectedMembers.length !== 1 ? "s" : ""}`}
        </button>
      </Modal>
      <Modal
        isOpen={showDeleteTeamModal}
        onClose={() => {
          if (!actionLoading) {
            setShowDeleteTeamModal(false);
            setTeamToDelete(null);
          }
        }}
        title={
          <>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 shrink-0">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <span className="text-gray-800 font-semibold text-lg">
              Delete Team
            </span>
          </>
        }
        maxWidth="max-w-md"
      >
        <div className="text-center pb-2">
          <p className="text-gray-600 mb-1">
            Anda yakin ingin menghapus tim{" "}
            <span className="font-semibold text-gray-800">
              "{teamToDelete?.name}"
            </span>
            ?
          </p>
          <p className="text-sm text-gray-400">
            Semua data tim, anggota, dan{" "}
            <span className="text-red-400 font-medium">seluruh tasks</span> yang
            terkait dengan tim ini akan dihapus secara permanen. Tindakan ini
            tidak dapat dibatalkan.
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              setShowDeleteTeamModal(false);
              setTeamToDelete(null);
            }}
            disabled={actionLoading}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            onClick={confirmDeleteTeam}
            disabled={actionLoading}
            className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {actionLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Hapus Tim
              </>
            )}
          </button>
        </div>
      </Modal>
      {/* Remove Member Confirmation Modal */}
      <Modal
        isOpen={showRemoveMemberModal}
        onClose={() => {
          if (!actionLoading) {
            setShowRemoveMemberModal(false);
            setMemberToRemove(null);
          }
        }}
        title={
          <>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 shrink-0">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <span className="text-gray-800 font-semibold text-lg">
              Hapus Anggota
            </span>
          </>
        }
        maxWidth="max-w-md"
      >
        <div className="text-center pb-2">
          <p className="text-gray-600 mb-1">
            Anda yakin ingin menghapus{" "}
            <span className="font-semibold text-gray-800">
              "{memberToRemove?.member?.displayName}"
            </span>{" "}
            dari tim{" "}
            <span className="font-semibold text-gray-800">
              "{memberToRemove?.team?.name}"
            </span>
            ?
          </p>
          <p className="text-sm text-gray-400">
            Anggota ini akan kehilangan akses ke tim dan{" "}
            <span className="text-red-400 font-medium">seluruh tasks</span> yang
            terkait. Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              setShowRemoveMemberModal(false);
              setMemberToRemove(null);
            }}
            disabled={actionLoading}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            onClick={confirmRemoveMember}
            disabled={actionLoading}
            className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {actionLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Hapus Anggota
              </>
            )}
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default TeamPage;
