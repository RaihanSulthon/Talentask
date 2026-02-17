import { Bell, CheckCheck } from "lucide-react";
import NotificationItem from "./NotificationItem";

const NotificationDropdown = ({ notifications, unreadCount, loading, onMarkAsRead, onMarkAllAsRead, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-gray-900 font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-emerald-500 text-gray-500 text-xs rounded-full font-medium">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="overflow-y-auto max-h-96">
        {loading ? (
          <div className="py-8 text-center text-violet-600 text-sm">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell size={32} className="mx-auto text-violet-600 mb-2" />
            <p className="text-violet-600 text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onMarkAsRead={onMarkAsRead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;