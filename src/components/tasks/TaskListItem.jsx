import { User, Calendar, Tag } from "lucide-react";

const TaskListItem = ({
  task,
  onClick,
  onStatusChange,
  teams,
  canEdit,
  isUser,
  compact = false,
}) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "todo":
        return "bg-slate-700 text-slate-300";
      case "inprogress":
        return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
      case "inreview":
        return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
      case "done":
        return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
      default:
        return "bg-slate-700 text-slate-300";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "todo":
        return "To Do";
      case "inprogress":
        return "In Progress";
      case "inreview":
        return "In Review";
      case "done":
        return "Done";
      default:
        return status;
    }
  };

  const currentTeam = teams.find((t) => t.id === task.teamId);
  const assignedMembers = task.assignedTo
    ?.map((memberId) =>
      currentTeam?.members?.find((m) => m.uid === memberId || m.id === memberId)
    )
    .filter(Boolean);

  const handleStatusClick = (e) => {
    e.stopPropagation();
    if (!onStatusChange) return;

    const statuses = ["todo", "inprogress", "inreview", "done"];
    const currentIndex = statuses.indexOf(task.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    onStatusChange(task.id, nextStatus);
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-emerald-500 cursor-pointer transition-all hover:shadow-lg ${
        compact ? "p-3" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className={`font-semibold text-white mb-1 ${compact ? "text-sm" : ""}`}>
            {task.title}
          </h4>
          {!compact && (
            <p className="text-sm text-slate-400 line-clamp-2 mb-2">
              {task.description}
            </p>
          )}
        </div>
        {(isUser || canEdit) && onStatusChange && (
          <button
            onClick={handleStatusClick}
            className={`ml-3 px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${getStatusColor(
              task.status
            )}`}
          >
            {getStatusLabel(task.status)}
          </button>
        )}
        {!onStatusChange && (
          <span
            className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
              task.status
            )}`}
          >
            {getStatusLabel(task.status)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400">
        {!compact && (
          <>
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
                    : `${assignedMembers.length} assigned`
                  : "Unassigned"}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(task.createdAt)}</span>
            </div>
          </>
        )}
        {compact && (
          <div className="flex items-center gap-1">
            <User size={14} />
            <span>
              {assignedMembers && assignedMembers.length > 0
                ? assignedMembers.length
                : 0}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskListItem;