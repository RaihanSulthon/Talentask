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

    // Prevent users from directly changing to "done"
    if (nextStatus === "done" && isUser && !canEdit) {
      alert(
        "You cannot directly mark a task as Done. Please move it to 'In Review' for approval.",
      );
      return;
    }

    // Show confirmation when submitting for review
    if (nextStatus === "inreview" && isUser) {
      if (
        !window.confirm(
          "Submit this task for approval? Your team owner will review it.",
        )
      ) {
        return;
      }
    }

    // Prevent changing status of tasks in review (only admin can)
    if (task.status === "inreview" && isUser) {
      alert("This task is awaiting approval and cannot be changed.");
      return;
    }

    onStatusChange(task.id, nextStatus);
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-md hover:shadow-violet-50 cursor-pointer transition-all group ${
        compact ? "p-3" : "p-4"
      }`}
    >
      {/* Violet accent bar */}
      <div
        className={`w-1 shrink-0 rounded-l-xl ${
          task.status === "todo"
            ? "bg-slate-300"
            : task.status === "inprogress"
              ? "bg-blue-400"
              : task.status === "inreview"
                ? "bg-amber-400"
                : "bg-emerald-400"
        }`}
      />
      <div className={`flex-1 ${compact ? "p-3" : "p-4"}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4
              className={`font-semibold text-slate-800 mb-1 ${compact ? "text-sm" : ""}`}
            >
              {task.title}
            </h4>
            {!compact && (
              <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                {task.description}
              </p>
            )}
          </div>
          {(isUser || canEdit) && onStatusChange && (
            <button
              onClick={handleStatusClick}
              className={`ml-3 px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${getStatusColor(
                task.status,
              )}`}
            >
              {getStatusLabel(task.status)}
            </button>
          )}
          {!onStatusChange && (
            <span
              className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                task.status,
              )}`}
            >
              {getStatusLabel(task.status)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 pt-3 border-t border-violet-50">
        {" "}
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
