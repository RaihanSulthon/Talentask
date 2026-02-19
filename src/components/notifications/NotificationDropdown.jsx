import { Bell, CheckCheck, Trash2 } from "lucide-react";
import NotificationItem from "./NotificationItem";

const NotificationDropdown = ({
  notifications,
  unreadCount,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onDeleteAll,
  onClose,
  isOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-96 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-gray-200/60 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-gray-900 font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-violet-100 text-violet-600 text-xs rounded-full font-semibold">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1 text-xs text-violet-500 hover:text-violet-700 font-medium transition-colors px-2 py-1 hover:bg-violet-50 rounded-lg"
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onDeleteAll}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-medium transition-colors px-2 py-1 hover:bg-red-50 rounded-lg"
            >
              <Trash2 size={13} />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto max-h-105">
        {loading ? (
          <div className="py-10 text-center text-gray-400 text-sm">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell size={22} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium">You're all caught up!</p>
            <p className="text-gray-400 text-xs mt-1">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;