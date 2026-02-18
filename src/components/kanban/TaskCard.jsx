import { Clock, User, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

const TaskCard = ({ task, onDragStart, onClick, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { userRole } = useAuth();
  const isAdmin = userRole === "super_admin" || userRole === "admin";
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-GB");
  };

  const getBorderColor = (status) => {
    switch (status) {
      case "todo":
        return "border-t-4 border-t-gray-400";
      case "inprogress":
        return "border-t-4 border-t-amber-500";
      case "inreview":
        return "border-t-4 border-t-blue-500";
      case "done":
        return "border-t-4 border-t-emerald-500";
      default:
        return "";
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(task);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(task);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={onClick}
      className={`p-4 bg-white rounded-lg border border-gray-200 shadow-sm cursor-move transition-all 
    hover:shadow-md hover:border-violet-200 hover:-translate-y-1 hover:scale-90
    ${getBorderColor(task.status)}`}
    >
      {/* Header with three dots */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900 flex-1 pr-2">
          {task.title}
        </h4>

        {/* Three dots menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuClick}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <MoreVertical size={16} className="text-gray-400" />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Edit2 size={14} />
                <span>Edit</span>
              </button>
              {isAdmin && (
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description and Team badge side by side */}
      <div className="flex items-start gap-2 mb-3">
        <p className="text-sm text-gray-500 line-clamp-2 flex-1">
          {task.description}
        </p>
        <span className="shrink-0 px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-full font-medium whitespace-nowrap">
          {task.teamName || "Team"}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <User size={14} />
          <span>{task.assignedTo?.length || 0} assigned</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{formatDate(task.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
