import { User, Calendar, Tag, CheckCircle, XCircle, Clock } from "lucide-react";

const ApprovalCard = ({
  task,
  teams,
  onClick,
  onApprove,
  onDecline,
  isAdmin,
}) => {
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

  const currentTeam = teams.find((t) => t.id === task.teamId);
  const assignedMembers = task.assignedTo
    ?.map((memberId) =>
      currentTeam?.members?.find((m) => m.uid === memberId || m.id === memberId)
    )
    .filter(Boolean);

  const handleApprove = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to approve this task?")) {
      onApprove();
    }
  };

  const handleDecline = (e) => {
    e.stopPropagation();
    if (
      window.confirm(
        "Are you sure you want to decline this task? It will be returned to In Progress."
      )
    ) {
      onDecline();
    }
  };

  return (
    <div
      onClick={onClick}
      className="p-6 bg-slate-800 rounded-xl border-2 border-yellow-500/30 hover:border-yellow-500/50 cursor-pointer transition-all hover:shadow-lg hover:shadow-yellow-500/10"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-semibold text-white">{task.title}</h4>
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-full text-xs font-medium flex items-center gap-1">
              <Clock size={12} />
              Pending Approval
            </span>
          </div>
          <p className="text-sm text-slate-400 line-clamp-2 mb-3">
            {task.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-400">
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

        {isAdmin && onApprove && onDecline && (
          <div className="flex gap-2 ml-4">
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Approve
            </button>
            <button
              onClick={handleDecline}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <XCircle size={18} />
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalCard;