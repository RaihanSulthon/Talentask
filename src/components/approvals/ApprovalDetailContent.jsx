import { Tag, Calendar, CheckCircle, XCircle } from "lucide-react";

const ApprovalDetailContent = ({
  task,
  teams,
  isAdmin,
  actionLoading,
  onApprove,
  onDecline,
}) => {
  const currentTeam = teams.find((t) => t.id === task.teamId);
  const assignedMembers = task.assignedTo
    ?.map((id) =>
      currentTeam?.members?.find((m) => m.uid === id || m.id === id),
    )
    .filter(Boolean);

  const formatDate = (ts) => {
    if (!ts) return "N/A";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString("en-GB");
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          Title
        </label>
        <p className="text-lg font-semibold text-gray-800">{task.title}</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          Description
        </label>
        <p className="text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg px-4 py-3 text-sm">
          {task.description || (
            <span className="italic text-gray-400">
              No description provided.
            </span>
          )}
        </p>
      </div>

      {/* Team */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          Team
        </label>
        <div className="flex items-center gap-2">
          <Tag size={15} className="text-violet-500" />
          <p className="text-gray-700 font-medium">
            {task.teamName || currentTeam?.name || "Unknown Team"}
          </p>
        </div>
      </div>

      {/* Assigned To */}
      {assignedMembers?.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Assigned To
          </label>
          <div className="flex flex-wrap gap-2">
            {assignedMembers.map((member) => (
              <div
                key={member.uid}
                className="flex items-center gap-2.5 px-3 py-2 bg-gray-100 rounded-xl"
              >
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {member.displayName?.substring(0, 2).toUpperCase() || "U"}
                </div>
                <div>
                  <div className="text-gray-800 text-sm font-medium">
                    {member.displayName}
                  </div>
                  <div className="text-gray-400 text-xs">{member.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-xl px-4 py-3">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Created
          </label>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Calendar size={14} className="text-gray-400 shrink-0" />
            <span>{formatDate(task.createdAt)}</span>
          </div>
        </div>
        <div className="bg-yellow-50 rounded-xl px-4 py-3">
          <label className="block text-xs font-semibold text-yellow-500 uppercase tracking-wider mb-1">
            Submitted for Review
          </label>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Calendar size={14} className="text-yellow-400 shrink-0" />
            <span>{formatDate(task.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {isAdmin ? (
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onApprove}
            disabled={actionLoading}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-200"
          >
            <CheckCircle size={18} />
            {actionLoading ? "Approving..." : "Approve Task"}
          </button>
          <button
            onClick={onDecline}
            disabled={actionLoading}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm shadow-red-200"
          >
            <XCircle size={18} />
            {actionLoading ? "Declining..." : "Decline Task"}
          </button>
        </div>
      ) : (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-blue-600 text-sm font-medium">
            ℹ️ This task is awaiting approval from your team owner.
          </p>
        </div>
      )}
    </div>
  );
};

export default ApprovalDetailContent;
