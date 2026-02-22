import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import { useTeamManagement } from "../hooks/useTeamManagement";
import { useTaskManagement } from "../hooks/useTaskManagement";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";
import CustomSelect from "../components/CustomSelect";
import {
  User,
  Calendar,
  Tag,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
} from "lucide-react";
import Modal from "../components/Modal";
import ApprovalDetailContent from "../components/approvals/ApprovalDetailContent";

const ApprovalsPage = () => {
  const { user, userRole } = useAuth();
  const { teams, loading: teamsLoading } = useTeamManagement();
  const {
    tasks,
    loading: tasksLoading,
    handleUpdateTaskStatus,
    handleUpdateTask,
  } = useTaskManagement(teams);

  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: null,
    task: null,
  });

  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-buka task dari notif jika ada ?taskId= di URL
  useEffect(() => {
    const taskIdFromUrl = searchParams.get("taskId");
    if (taskIdFromUrl && tasks.length > 0) {
      const task = tasks.find((t) => t.id === taskIdFromUrl);
      if (task) {
        const taskWithTeamName = {
          ...task,
          teamName:
            teams.find((t) => t.id === task.teamId)?.name || "Unknown Team",
        };
        setSelectedTask(taskWithTeamName);
        setSearchParams({}, { replace: true }); // bersihkan URL setelah dibuka
      }
    }
  }, [searchParams, tasks, teams]);

  const isAdmin = userRole === "super_admin" || userRole === "admin";
  const isSuperAdmin = userRole === "super_admin";
  const isUser = userRole === "user";

  // Get teams where user is owner (for admin)
  const ownedTeams = useMemo(() => {
    if (isSuperAdmin) return teams;
    return teams.filter((t) => t.isOwner);
  }, [teams, userRole]);

  // Filter tasks that need approval
  const pendingApprovals = useMemo(() => {
    let filtered = tasks.filter((task) => task.status === "inreview");

    // Add team name to each task
    filtered = filtered.map((task) => ({
      ...task,
      teamName: teams.find((t) => t.id === task.teamId)?.name || "Unknown Team",
    }));

    // For admin, only show tasks from owned teams
    if (isAdmin && !isSuperAdmin) {
      const ownedTeamIds = ownedTeams.map((t) => t.id);
      filtered = filtered.filter((task) => ownedTeamIds.includes(task.teamId));
    }

    // For user, only show their own submitted tasks
    if (isUser) {
      filtered = filtered.filter(
        (task) => task.assignedTo && task.assignedTo.includes(user.uid),
      );
    }

    // Filter by team if selected
    if (selectedTeamFilter) {
      filtered = filtered.filter((task) => task.teamId === selectedTeamFilter);
    }

    return filtered;
  }, [
    tasks,
    teams,
    isAdmin,
    isSuperAdmin,
    isUser,
    ownedTeams,
    selectedTeamFilter,
    user,
  ]);

  // Statistics
  // Statistics
  const statistics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = (timestamp) => {
      if (!timestamp) return false;
      const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return d >= today;
    };

    // Filter tasks from owned/visible teams
    const visibleTeamIds = isSuperAdmin
      ? null
      : isAdmin
        ? ownedTeams.map((t) => t.id)
        : null;

    const visibleTasks = tasks.filter((task) =>
      visibleTeamIds ? visibleTeamIds.includes(task.teamId) : true,
    );

    const approvedToday = visibleTasks.filter(
      (task) => task.status === "done" && isToday(task.updatedAt),
    ).length;

    const declinedToday = visibleTasks.filter(
      (task) => task.status === "inprogress" && isToday(task.updatedAt),
    ).length;

    return {
      pending: pendingApprovals.length,
      approvedToday,
      declinedToday,
    };
  }, [tasks, pendingApprovals, ownedTeams, isAdmin, isSuperAdmin]);

  const handleApprove = async (task) => {
    try {
      setActionLoading(true);
      await handleUpdateTaskStatus(task.id, "done", {
        taskTitle: task.title,
        teamId: task.teamId,
        teamName: task.teamName,
        assignedTo: task.assignedTo || [],
        actorId: user.uid,
        actorName: user.displayName,
      });
      setSelectedTask(null);
      setConfirmModal({ open: false, type: null, task: null });
    } catch (error) {
      console.error("Error approving task:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async (task) => {
    try {
      setActionLoading(true);
      await handleUpdateTaskStatus(task.id, "inprogress", {
        taskTitle: task.title,
        teamId: task.teamId,
        teamName: task.teamName,
        assignedTo: task.assignedTo || [],
        actorId: user.uid,
        actorName: user.displayName,
        isDecline: true,
      });
      setSelectedTask(null);
      setConfirmModal({ open: false, type: null, task: null });
    } catch (error) {
      console.error("Error declining task:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper untuk buka confirm modal
  const openConfirm = (type, task, e) => {
    e?.stopPropagation();
    setConfirmModal({ open: true, type, task });
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (teamsLoading || tasksLoading) {
    return (
      <DashboardLayout title="Approvals">
        <div className="text-white">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={isAdmin ? "Task Approvals" : "My Approval Requests"}
      subtitle={
        isAdmin
          ? "Review and approve tasks submitted by team members"
          : "Track your tasks awaiting approval"
      }
    >
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: selalu tampil */}
        <Card className="p-6 border border-violet-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linear-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">
                {statistics.pending}
              </div>
              <div className="text-gray-500 text-sm">Pending Approval</div>
            </div>
          </div>
        </Card>

        {/* Card 2 & 3: hanya untuk admin */}
        {isAdmin && (
          <>
            <Card className="p-6 border border-violet-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-800">
                    {statistics.approvedToday}
                  </div>
                  <div className="text-gray-500 text-sm">Approved Today</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-violet-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <XCircle size={24} className="text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-800">
                    {statistics.declinedToday}
                  </div>
                  <div className="text-gray-500 text-sm">Declined Today</div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      {isAdmin && ownedTeams.length > 1 && (
        <div className="mb-6 flex items-center gap-3">
          <Filter size={20} className="text-violet-400" />
          <div className="w-56">
            <CustomSelect
              value={selectedTeamFilter}
              onChange={(val) => setSelectedTeamFilter(val)}
              placeholder="All Teams"
              options={[
                { value: "", label: "All Teams" },
                ...ownedTeams.map((team) => ({
                  value: team.id,
                  label: team.name,
                })),
              ]}
            />
          </div>
        </div>
      )}

      {/* Approvals List */}
      <div className="space-y-4">
        {pendingApprovals.length > 0 ? (
          pendingApprovals.map((task) => {
            const currentTeam = teams.find((t) => t.id === task.teamId);
            const assignedMembers = task.assignedTo
              ?.map((memberId) =>
                currentTeam?.members?.find(
                  (m) => m.uid === memberId || m.id === memberId,
                ),
              )
              .filter(Boolean);

            return (
              <Card
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className="p-6 rounded-xl border-2 border-yellow-500/30 hover:border-yellow-500/50 transition-all hover:shadow-lg hover:shadow-yellow-500/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-800">
                        {task.title}
                      </h4>
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-full text-xs font-medium flex items-center gap-1">
                        <Clock size={12} />
                        Pending Approval
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Tag size={14} />
                        <span>{task.teamName || "Unknown Team"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>
                          {assignedMembers && assignedMembers.length > 0
                            ? assignedMembers.length === 1
                              ? assignedMembers[0].displayName
                              : `${assignedMembers.length} members`
                            : "Unassigned"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDate(task.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={(e) => openConfirm("approve", task, e)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Approve
                      </button>
                      <button
                        onClick={(e) => openConfirm("decline", task, e)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <XCircle size={18} />
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-16 text-slate-400">
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No pending approvals</p>
            <p className="text-sm mt-2">
              {isAdmin
                ? "All tasks have been reviewed"
                : "You don't have any tasks awaiting approval"}
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        maxWidth="max-w-2xl"
        title={
          <>
            <span className="text-2xl font-bold text-gray-800">
              Task Review
            </span>
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-full text-xs font-medium">
              Pending Approval
            </span>
          </>
        }
      >
        {selectedTask && (
          <ApprovalDetailContent
            task={selectedTask}
            teams={teams}
            isAdmin={isAdmin}
            actionLoading={actionLoading}
            onApprove={() => openConfirm("approve", selectedTask)}
            onDecline={() => openConfirm("decline", selectedTask)}
          />
        )}
      </Modal>
      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: null, task: null })}
        maxWidth="max-w-md"
        title={
          confirmModal.type === "approve" ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle size={18} className="text-emerald-600" />
              </div>
              <span className="text-lg font-semibold text-gray-800">
                Approve Task
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle size={18} className="text-red-500" />
              </div>
              <span className="text-lg font-semibold text-gray-800">
                Decline Task
              </span>
            </div>
          )
        }
      >
        <div className="space-y-5">
          <p className="text-gray-600 text-sm leading-relaxed">
            {confirmModal.type === "approve"
              ? `Apakah kamu yakin ingin menyetujui task `
              : `Apakah kamu yakin ingin menolak task `}
            <span className="font-semibold text-gray-800">
              "{confirmModal.task?.title}"
            </span>
            {confirmModal.type === "decline" && (
              <span className="text-gray-600">
                ? Task akan dikembalikan ke{" "}
                <span className="font-medium text-orange-600">In Progress</span>
                .
              </span>
            )}
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() =>
                setConfirmModal({ open: false, type: null, task: null })
              }
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() =>
                confirmModal.type === "approve"
                  ? handleApprove(confirmModal.task)
                  : handleDecline(confirmModal.task)
              }
              disabled={actionLoading}
              className={`px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 ${
                confirmModal.type === "approve"
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {actionLoading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : confirmModal.type === "approve" ? (
                <CheckCircle size={16} />
              ) : (
                <XCircle size={16} />
              )}
              {actionLoading
                ? "Processing..."
                : confirmModal.type === "approve"
                  ? "Ya, Approve"
                  : "Ya, Decline"}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default ApprovalsPage;
