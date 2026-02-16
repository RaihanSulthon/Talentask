import { useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTeamManagement } from "../hooks/useTeamManagement";
import { useTaskManagement } from "../hooks/useTaskManagement";
import DashboardLayout from "../layouts/DashboardLayout";
import ApprovalCard from "../components/approvals/ApprovalCard";
import { CheckCircle, Clock, XCircle, Filter } from "lucide-react";
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
  const statistics = useMemo(() => {
    return {
      pending: pendingApprovals.length,
      // We don't track approved/rejected history in current structure
      // But you can add if needed
    };
  }, [pendingApprovals]);

  const handleApprove = async (taskId) => {
    try {
      setActionLoading(true);
      await handleUpdateTaskStatus(taskId, "done", {
        taskTitle: selectedTask.title,
        teamId: selectedTask.teamId,
        teamName: selectedTask.teamName,
        assignedTo: selectedTask.assignedTo || [],
        actorId: user.uid,
        actorName: user.displayName,
      });
      setShowDetailModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error approving task:", error);
      alert("Failed to approve task");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async (taskId) => {
    try {
      setActionLoading(true);
      // Return task to "inprogress" status when declined
      await handleUpdateTaskStatus(taskId, "inprogress", {
        taskTitle: selectedTask.title,
        teamId: selectedTask.teamId,
        teamName: selectedTask.teamName,
        assignedTo: selectedTask.assignedTo || [],
        actorId: user.uid,
        actorName: user.displayName,
        isDecline: true,
      });
      setShowDetailModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error declining task:", error);
      alert("Failed to decline task");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linear-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">
                {statistics.pending}
              </div>
              <div className="text-slate-400 text-sm">Pending Approval</div>
            </div>
          </div>
        </div>

        {isAdmin && (
          <>
            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">-</div>
                  <div className="text-slate-400 text-sm">Approved Today</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <XCircle size={24} className="text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">-</div>
                  <div className="text-slate-400 text-sm">Declined Today</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      {isAdmin && ownedTeams.length > 1 && (
        <div className="mb-6 flex items-center gap-3">
          <Filter size={20} className="text-slate-400" />
          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">All Teams</option>
            {ownedTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Approvals List */}
      <div className="space-y-4">
        {pendingApprovals.length > 0 ? (
          pendingApprovals.map((task) => (
            <ApprovalCard
              key={task.id}
              task={task}
              teams={teams}
              onClick={() => handleTaskClick(task)}
              onApprove={isAdmin ? () => handleApprove(task.id) : null}
              onDecline={isAdmin ? () => handleDecline(task.id) : null}
              isAdmin={isAdmin}
            />
          ))
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
            <span className="text-2xl font-bold text-white">Task Review</span>
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-full text-xs font-medium">
              Pending Approval
            </span>
          </>
        }>
        {selectedTask && (
          <ApprovalDetailContent
            task={selectedTask}
            teams={teams}
            isAdmin={isAdmin}
            actionLoading={actionLoading}
            onApprove={() => {
              if (window.confirm("Approve this task?"))
                handleApprove(selectedTask.id);
            }}
            onDecline={() => {
              if (
                window.confirm(
                  "Decline this task? It will return to In Progress.",
                )
              )
                handleDecline(selectedTask.id);
            }}
          />
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default ApprovalsPage;
