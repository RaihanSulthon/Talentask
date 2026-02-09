import { X, CheckCircle, XCircle, User, Calendar, Tag } from "lucide-react";

const ApprovalDetailModal = ({
  task,
  teams,
  onClose,
  onApprove,
  onDecline,
  loading,
  isAdmin,
}) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString("en-GB");
  };

  const currentTeam = teams.find((t) => t.id === task.teamId);
  const assignedMembers = task.assignedTo
    ?.map((memberId) =>
      currentTeam?.members?.find((m) => m.uid === memberId || m.id === memberId)
    )
    .filter(Boolean);

  const handleApprove = () => {
    if (window.confirm("Are you sure you want to approve this task?")) {
      onApprove(task.id);
    }
  };

  const handleDecline = () => {
    if (
      window.confirm(
        "Are you sure you want to decline this task? It will be returned to In Progress."
      )
    ) {
      onDecline(task.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">Task Review</h2>
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-full text-xs font-medium">
              Pending Approval
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              TITLE
            </label>
            <p className="text-lg font-semibold text-white">{task.title}</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              DESCRIPTION
            </label>
            <p className="text-white whitespace-pre-wrap">{task.description}</p>
          </div>

          {/* Team */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              TEAM
            </label>
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-emerald-500" />
              <p className="text-white font-medium">
                {task.teamName || currentTeam?.name || "Unknown Team"}
              </p>
            </div>
          </div>

          {/* Assigned To */}
          {assignedMembers && assignedMembers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                ASSIGNED TO
              </label>
              <div className="flex flex-wrap gap-2">
                {assignedMembers.map((member) => (
                  <div
                    key={member.uid}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {member.displayName?.substring(0, 2).toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">
                        {member.displayName}
                      </div>
                      <div className="text-slate-400 text-xs">
                        {member.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                CREATED
              </label>
              <div className="flex items-center gap-2 text-white">
                <Calendar size={16} className="text-slate-400" />
                <span>{formatDate(task.createdAt)}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                SUBMITTED FOR REVIEW
              </label>
              <div className="flex items-center gap-2 text-white">
                <Calendar size={16} className="text-slate-400" />
                <span>{formatDate(task.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons for Admin */}
          {isAdmin && onApprove && onDecline && (
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                {loading ? "Approving..." : "Approve Task"}
              </button>
              <button
                onClick={handleDecline}
                disabled={loading}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <XCircle size={20} />
                {loading ? "Declining..." : "Decline Task"}
              </button>
            </div>
          )}

          {/* Info for User */}
          {!isAdmin && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                ℹ️ This task is awaiting approval from your team owner. You will
                be notified once it has been reviewed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalDetailModal;