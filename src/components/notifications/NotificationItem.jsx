import {
  CheckCircle,
  Clock,
  XCircle,
  UserPlus,
  UserMinus,
  Edit3,
  Bell,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const typeConfig = {
  task_assigned: { icon: Bell, color: "text-blue-500", bg: "bg-blue-50" },
  task_submitted_review: {
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  task_approved: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  task_declined: { icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
  task_updated: { icon: Edit3, color: "text-violet-500", bg: "bg-violet-50" },
  task_status_changed: {
    icon: ArrowUpRight,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
  },
  task_deleted: { icon: Trash2, color: "text-gray-500", bg: "bg-gray-100" },
  member_added: { icon: UserPlus, color: "text-teal-500", bg: "bg-teal-50" },
  member_removed: {
    icon: UserMinus,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
};

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClose,
}) => {
  const config = typeConfig[notification.type] || typeConfig.task_assigned;
  const Icon = config.icon;
  const navigate = useNavigate();

  const formatTime = (createdAt) => {
    if (!createdAt) return "";
    const date = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const { userRole } = useAuth();

  const handleClick = async () => {
    onDelete(notification.id);
    onClose?.();

    const isAdmin = userRole === "super_admin" || userRole === "admin";

    if (
      notification.type === "member_added" ||
      notification.type === "member_removed"
    ) {
      navigate("/team");
    } else if (
      notification.type === "task_submitted_review" ||
      notification.type === "task_needs_approval"
    ) {
      // Arahkan admin ke halaman approvals dengan taskId, user ke kanban
      if (isAdmin) {
        navigate(`/admin/approvals?taskId=${notification.taskId}`);
      } else {
        navigate(`/user/kanban?taskId=${notification.taskId}`);
      }
    } else if (notification.taskId && notification.type !== "task_deleted") {
      navigate(
        `${isAdmin ? "/admin/board" : "/user/kanban"}?taskId=${notification.taskId}`,
      );
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  const isClickable =
    (notification.taskId && notification.type !== "task_deleted") ||
    notification.type === "member_added" ||
    notification.type === "member_removed";

  return (
    <div
      onClick={handleClick}
      className={`group relative flex items-start gap-3 px-4 py-3.5 transition-colors
        ${isClickable ? "cursor-pointer" : "cursor-default"}
        ${!notification.isRead ? "bg-violet-50/60" : "hover:bg-gray-50"}
      `}
    >
      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-violet-500 rounded-full" />
      )}

      {/* Icon */}
      <div
        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${config.bg}`}
      >
        <Icon size={17} className={config.color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <p
          className={`text-sm font-semibold leading-snug ${notification.isRead ? "text-gray-500" : "text-gray-800"}`}
        >
          {notification.title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
          {notification.message}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[11px] text-gray-300">
            {formatTime(notification.createdAt)}
          </span>
          {isClickable && (
            <span className="text-[11px] text-violet-400 font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {notification.type === "member_added" ||
              notification.type === "member_removed"
                ? "View team"
                : "View task"}{" "}
              <ArrowUpRight size={10} />
            </span>
          )}
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="absolute right-3 top-3 p-1 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
};

export default NotificationItem;
