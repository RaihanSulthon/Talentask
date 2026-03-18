import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";
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
import { useToast } from "../components/Toast";

const ApprovalsPage = () => {
  const { user, userRole } = useAuth();
  const { teams, loading: teamsLoading } = useTeamManagement();
  const {
    tasks,
    loading: tasksLoading,
    handleUpdateTaskStatus,
    handleUpdateTask,
  } = useTaskManagement(teams);

  const [selectedTeamFilter, setSelectedTeamFilter] = useState("");
  const [declineComment, setDeclineComment] = useState("");
  const [newDeadline, setNewDeadline] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: null,
    task: null,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Auto-redirect ke task detail dari notif jika ada ?taskId= di URL
  useEffect(() => {
    const taskIdFromUrl = searchParams.get("taskId");
    if (taskIdFromUrl && tasks.length > 0) {
      const task = tasks.find((t) => t.id === taskIdFromUrl);
      if (task) {
        const teamName =
          teams.find((t) => t.id === task.teamId)?.name || "Unknown Team";
        setSearchParams({}, { replace: true });
        navigate(`/task/${task.id}`, {
          state: { fromApproval: true, taskTitle: task.title, teamName },
        });
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

  const handleTaskClick = (task) => {
    navigate(`/task/${task.id}`, {
      state: {
        fromApproval: true,
        taskTitle: task.title,
        teamName: task.teamName,
      },
    });
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

  const openConfirm = (type, task, e) => {
    e?.stopPropagation();
    setDeclineComment("");
    setNewDeadline("");
    setConfirmModal({ open: true, type, task });
  };

  const closeConfirm = () => {
    setConfirmModal({ open: false, type: null, task: null });
    setDeclineComment("");
    setNewDeadline("");
  };

  const handleApprove = async (task) => {
    if (!task) return;
    setActionLoading(true);
    try {
      const currentTeam = teams.find((t) => t.id === task.teamId);
      const ownerIds =
        currentTeam?.members
          ?.filter((m) => m.role === "owner" || m.role === "admin")
          .map((m) => m.uid || m.id) || [];

      await handleUpdateTaskStatus(task.id, "done", {
        taskTitle: task.title,
        teamId: task.teamId,
        teamName: task.teamName,
        assignedTo: task.assignedTo || [],
        ownerIds,
        actorId: user.uid,
        actorName: user.displayName || user.email,
        isDecline: false,
      });
      toast.success("Task approved successfully!");
    } catch {
      toast.error("Failed to approve task.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    const { task } = confirmModal;
    if (!task || !declineComment.trim()) {
      toast.error("Please provide a decline reason.");
      return;
    }
    if (!newDeadline) {
      toast.error("Please provide a new deadline.");
      return;
    }
    setActionLoading(true);
    try {
      const currentTeam = teams.find((t) => t.id === task.teamId);
      const ownerIds =
        currentTeam?.members
          ?.filter((m) => m.role === "owner" || m.role === "admin")
          .map((m) => m.uid || m.id) || [];

      await handleUpdateTaskStatus(task.id, "inprogress", {
        taskTitle: task.title,
        teamId: task.teamId,
        teamName: task.teamName,
        assignedTo: task.assignedTo || [],
        ownerIds,
        actorId: user.uid,
        actorName: user.displayName || user.email,
        isDecline: true,
        declineComment: declineComment.trim(),
        newDeadline: newDeadline,
      });
      toast.success("Task declined with comment.");
      closeConfirm();
    } catch {
      toast.error("Failed to decline task.");
    } finally {
      setActionLoading(false);
    }
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
      }>
      {/* Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-6 mb-5 lg:mb-8">
        {" "}
        {/* Card 1: selalu tampil */}
        <Card className="p-4 lg:p-6 border border-violet-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linear-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-white" />
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-bold text-gray-800">
                {statistics.pending}
              </div>
              <div className="text-gray-500 text-sm">Pending Approval</div>
            </div>
          </div>
        </Card>
        {/* Card 2 & 3: hanya untuk admin */}
        {isAdmin && (
          <>
            <Card className="p-4 lg:p-6 border border-violet-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-gray-800">
                    {statistics.approvedToday}
                  </div>
                  <div className="text-gray-500 text-sm">Approved Today</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 lg:p-6 border border-violet-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <XCircle size={24} className="text-white" />
                </div>
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-gray-800">
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
                className="p-6 rounded-xl border-2 border-yellow-500/30 hover:border-yellow-500/50 transition-all hover:shadow-lg hover:shadow-yellow-500/10">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(task);
                        }}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                        <CheckCircle size={18} />
                        Approve
                      </button>
                      <button
                        onClick={(e) => openConfirm("decline", task, e)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
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
      {/* Decline Modal */}
      <Modal
        isOpen={confirmModal.open && confirmModal.type === "decline"}
        onClose={closeConfirm}
        title={
          <>
            <XCircle size={20} className="text-red-500" />
            <span className="text-gray-800 font-semibold">Alasan Decline</span>
          </>
        }
        maxWidth="max-w-md">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 leading-relaxed">
            Berikan alasan mengapa task{" "}
            <span className="font-semibold text-gray-700">
              "{confirmModal.task?.title}"
            </span>{" "}
            ditolak, agar anggota tim dapat melakukan perbaikan yang tepat.
          </p>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Alasan Decline{" "}
              <span className="text-red-400 normal-case font-normal">
                (wajib diisi)
              </span>
            </label>
            <textarea
              value={declineComment}
              onChange={(e) => setDeclineComment(e.target.value)}
              placeholder="Contoh: Hasil kerja belum sesuai kriteria. Mohon perbaiki bagian X dan Y..."
              rows={4}
              autoFocus
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 resize-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Deadline Revisi Baru{" "}
              <span className="text-red-400 normal-case font-normal">
                (wajib diisi)
              </span>
            </label>
            <input
              type="date"
              value={newDeadline}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setNewDeadline(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 transition-colors"
            />
            {confirmModal.task?.deadline && (
              <p className="text-xs text-gray-400 mt-1.5">
                Deadline sebelumnya:{" "}
                <span className="font-medium text-gray-500">
                  {new Date(
                    confirmModal.task.deadline?.toDate
                      ? confirmModal.task.deadline.toDate()
                      : confirmModal.task.deadline,
                  ).toLocaleDateString("en-GB")}
                </span>
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={closeConfirm}
              disabled={actionLoading}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors">
              Batal
            </button>
            <button
              onClick={handleDecline}
              disabled={actionLoading || !declineComment.trim() || !newDeadline}
              className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              <XCircle size={16} />
              {actionLoading ? "Menolak..." : "Konfirmasi Decline"}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default ApprovalsPage;
