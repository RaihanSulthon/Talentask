import { CheckCircle, Clock, XCircle, UserPlus, UserMinus, Edit3, Bell } from "lucide-react";

const typeConfig = {
  task_assigned:         { icon: Bell,        color: "text-blue-400",    bg: "bg-blue-500/10" },
  task_submitted_review: { icon: Clock,        color: "text-yellow-400",  bg: "bg-yellow-500/10" },
  task_approved:         { icon: CheckCircle,  color: "text-emerald-400", bg: "bg-emerald-500/10" },
  task_declined:         { icon: XCircle,      color: "text-red-400",     bg: "bg-red-500/10" },
  task_updated:          { icon: Edit3,        color: "text-purple-400",  bg: "bg-purple-500/10" },
  member_added:          { icon: UserPlus,     color: "text-teal-400",    bg: "bg-teal-500/10" },
  member_removed:        { icon: UserMinus,    color: "text-orange-400",  bg: "bg-orange-500/10" },
};

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const config = typeConfig[notification.type] || typeConfig.task_assigned;
  const Icon = config.icon;

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

  return (
    <div
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-slate-700/50
        ${!notification.isRead ? "bg-slate-700/30" : ""}`}
    >
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.bg}`}>
        <Icon size={16} className={config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${notification.isRead ? "text-slate-400" : "text-white"}`}>
          {notification.title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-slate-600 mt-1">{formatTime(notification.createdAt)}</p>
      </div>
      {!notification.isRead && (
        <div className="shrink-0 w-2 h-2 bg-emerald-400 rounded-full mt-1.5" />
      )}
    </div>
  );
};

export default NotificationItem;