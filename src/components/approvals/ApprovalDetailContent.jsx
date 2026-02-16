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
    ?.map((id) => currentTeam?.members?.find((m) => m.uid === id || m.id === id))
    .filter(Boolean);

  const formatDate = (ts) => {
    if (!ts) return "N/A";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString("en-GB");
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">TITLE</label>
        <p className="text-lg font-semibold text-white">{task.title}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">DESCRIPTION</label>
        <p className="text-white whitespace-pre-wrap">{task.description}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">TEAM</label>
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-emerald-500" />
          <p className="text-white font-medium">
            {task.teamName || currentTeam?.name || "Unknown Team"}
          </p>
        </div>
      </div>
      {assignedMembers?.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">ASSIGNED TO</label>
          <div className="flex flex-wrap gap-2">
            {assignedMembers.map((member) => (
              <div key={member.uid} className="flex items-center gap-2 px-3 py-2 bg-slate-700 rounded-lg">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {member.displayName?.substring(0, 2).toUpperCase() || "U"}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{member.displayName}</div>
                  <div className="text-slate-400 text-xs">{member.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">CREATED</label>
          <div className="flex items-center gap-2 text-white">
            <Calendar size={16} className="text-slate-400" />
            <span>{formatDate(task.createdAt)}</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">SUBMITTED FOR REVIEW</label>
          <div className="flex items-center gap-2 text-white">
            <Calendar size={16} className="text-slate-400" />
            <span>{formatDate(task.updatedAt)}</span>
          </div>
        </div>
      </div>
      {isAdmin ? (
        <div className="flex gap-3 pt-4 border-t border-slate-700">
          <button
            onClick={onApprove}
            disabled={actionLoading}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
            <CheckCircle size={20} />
            {actionLoading ? "Approving..." : "Approve Task"}
          </button>
          <button
            onClick={onDecline}
            disabled={actionLoading}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
            <XCircle size={20} />
            {actionLoading ? "Declining..." : "Decline Task"}
          </button>
        </div>
      ) : (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-sm">
            ℹ️ This task is awaiting approval from your team owner.
          </p>
        </div>
      )}
    </div>
  );
};

export default ApprovalDetailContent;