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
        return "bg-violet-50 text-violet-600 border border-violet-200";
      case "inprogress":
        return "bg-blue-50 text-blue-600 border border-blue-200";
      case "inreview":
        return "bg-amber-50 text-amber-600 border border-amber-200";
      case "done":
        return "bg-emerald-50 text-emerald-600 border border-emerald-200";
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  const getAccentBar = (status) => {
    switch (status) {
      case "todo":       return "bg-violet-400";
      case "inprogress": return "bg-blue-400";
      case "inreview":   return "bg-amber-400";
      case "done":       return "bg-emerald-400";
      default:           return "bg-slate-300";
    }
  };

  const getDeadlineBadge = () => {
    if (!task.deadline || task.status === "done") return null;
    const deadline = task.deadline?.toDate
      ? task.deadline.toDate()
      : new Date(task.deadline);
    const diffDays = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
    const threshold = task.deadlineReminder ?? 3;
    if (diffDays > threshold) return null;

    if (diffDays < 0)
      return {
        label: `Overdue ${Math.abs(diffDays)}d`,
        color: "bg-red-100 text-red-600 border-red-200",
        icon: "🚨",
      };
    if (diffDays === 0)
      return {
        label: "Due today",
        color: "bg-orange-100 text-orange-600 border-orange-200",
        icon: "⚠️",
      };
    return {
      label: `${diffDays}d left`,
      color: "bg-amber-100 text-amber-600 border-amber-200",
      icon: "⏰",
    };
  };
  const deadlineBadge = getDeadlineBadge();

  const getStatusLabel = (status) => {
    switch (status) {
      case "todo":       return "To Do";
      case "inprogress": return "In Progress";
      case "inreview":   return "In Review";
      case "done":       return "Done";
      default:           return status;
    }
  };

  const currentTeam = teams.find((t) => t.id === task.teamId);
  const assignedMembers = task.assignedTo
    ?.map((memberId) =>
      currentTeam?.members?.find(
        (m) => m.uid === memberId || m.id === memberId,
      ),
    )
    .filter(Boolean);

  const handleStatusClick = (e) => {
    e.stopPropagation();
    if (!onStatusChange) return;

    const statuses = ["todo", "inprogress", "inreview", "done"];
    const currentIndex = statuses.indexOf(task.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    if (nextStatus === "done" && isUser && !canEdit) {
      alert(
        "You cannot directly mark a task as Done. Please move it to 'In Review' for approval.",
      );
      return;
    }

    if (nextStatus === "inreview" && isUser) {
      if (
        !window.confirm(
          "Submit this task for approval? Your team owner will review it.",
        )
      ) {
        return;
      }
    }

    if (task.status === "inreview" && isUser) {
      alert("This task is awaiting approval and cannot be changed.");
      return;
    }

    onStatusChange(task.id, nextStatus);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-md hover:shadow-violet-50/60 cursor-pointer transition-all duration-200 group flex overflow-hidden"
    >
      {/* Left accent bar */}
      <div className={`w-1 shrink-0 self-stretch ${getAccentBar(task.status)}`} />

      {/* Main content */}
      <div className={`flex-1 min-w-0 ${compact ? "px-3 py-2.5" : "px-4 py-3.5"}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h4
              className={`font-semibold text-slate-800 leading-snug ${compact ? "text-sm" : "text-sm lg:text-base"}`}
            >
              {task.title}
            </h4>
            {!compact && (
              <p className="text-sm text-slate-400 line-clamp-1 mt-0.5">
                {task.description}
              </p>
            )}
          </div>
          {(isUser || canEdit) && onStatusChange && (
            <button
              onClick={handleStatusClick}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 ${getStatusColor(
                task.status,
              )}`}
            >
              {getStatusLabel(task.status)}
            </button>
          )}
          {!onStatusChange && (
            <span
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                task.status,
              )}`}
            >
              {getStatusLabel(task.status)}
            </span>
          )}
        </div>

        {/* Footer metadata */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-2 pt-2.5 border-t border-slate-100">
          {!compact && (
            <>
              <div className="flex items-center gap-1">
                <Tag size={12} />
                <span>{task.teamName || "Unknown Team"}</span>
              </div>

              <div className="flex items-center gap-1">
                <User size={12} />
                <span>
                  {assignedMembers && assignedMembers.length > 0
                    ? assignedMembers.length === 1
                      ? assignedMembers[0].displayName
                      : `${assignedMembers.length} assigned`
                    : "Unassigned"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{formatDate(task.createdAt)}</span>
              </div>

              {deadlineBadge && (
                <span
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-medium border ${deadlineBadge.color}`}
                >
                  {deadlineBadge.icon} {deadlineBadge.label}
                </span>
              )}
            </>
          )}
          {compact && (
            <div className="flex items-center gap-1">
              <User size={12} />
              <span>{assignedMembers?.length ?? 0}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskListItem;
