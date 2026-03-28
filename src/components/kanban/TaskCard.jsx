import { Clock, Users, MoreVertical, Edit2, Trash2, AlertCircle } from "lucide-react";
import { getTeamColor } from "../../utils/teamColors";
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
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Cek apakah deadline sudah lewat
  const getDeadlineStatus = () => {
    if (!task.deadline) return null;
    const deadline = task.deadline.toDate
      ? task.deadline.toDate()
      : new Date(task.deadline);
    const now = new Date();
    const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "overdue";
    if (diffDays <= 3) return "urgent";
    return null;
  };

  const deadlineStatus = getDeadlineStatus();

  // Accent border kiri per status
  const getAccentBorder = (status) => {
    switch (status) {
      case "todo":        return "border-l-slate-400";
      case "inprogress":  return "border-l-amber-400";
      case "inreview":    return "border-l-blue-400";
      case "done":        return "border-l-emerald-400";
      default:            return "border-l-gray-300";
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

  const teamColor = getTeamColor(task.teamId);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={onClick}
      className={`
        relative
        bg-white rounded-xl
        border border-gray-100
        border-l-4 ${getAccentBorder(task.status)}
        shadow-sm
        cursor-grab active:cursor-grabbing
        transition-all duration-200
        hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5
        select-none
      `}
    >
      {/* Overdue/Urgent strip di atas */}
      {deadlineStatus === "overdue" && (
        <div className="absolute top-0 left-4 right-4 h-0.5 bg-red-400 rounded-full" />
      )}
      {deadlineStatus === "urgent" && (
        <div className="absolute top-0 left-4 right-4 h-0.5 bg-amber-400 rounded-full" />
      )}

      <div className="p-4">
        {/* Header: title + menu */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <h4 className="font-bold text-gray-800 text-sm leading-snug flex-1 line-clamp-2">
            {task.title}
          </h4>

          {/* Three-dot menu */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={handleMenuClick}
              className="p-1 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <MoreVertical size={15} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-7 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                <button
                  onClick={handleEdit}
                  className="w-full px-3 py-2 text-left text-gray-600 hover:bg-gray-50 hover:text-violet-600 text-sm flex items-center gap-2 transition-colors"
                >
                  <Edit2 size={13} />
                  Edit Task
                </button>
                {isAdmin && (
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-red-500 hover:bg-red-50 text-sm flex items-center gap-2 transition-colors"
                  >
                    <Trash2 size={13} />
                    Hapus Task
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description + Team badge */}
        <div className="flex items-start gap-2 mb-3">
          <p className="text-xs text-gray-400 line-clamp-2 flex-1 leading-relaxed">
            {task.description}
          </p>
          <span
            style={{
              backgroundColor: teamColor.bg,
              color: teamColor.text,
              border: `1px solid ${teamColor.border}`,
            }}
            className="shrink-0 px-2 py-0.5 text-xs rounded-full font-semibold whitespace-nowrap"
          >
            {task.teamName || "Tim"}
          </span>
        </div>

        {/* Footer: assignees + date/deadline */}
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-50">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Users size={12} />
            <span>{task.assignedTo?.length || 0} assigned</span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            {deadlineStatus === "overdue" ? (
              <span className="flex items-center gap-1 text-red-500 font-semibold">
                <AlertCircle size={11} />
                Overdue
              </span>
            ) : deadlineStatus === "urgent" ? (
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                <Clock size={11} />
                Segera
              </span>
            ) : (
              <span className="flex items-center gap-1 text-gray-400">
                <Clock size={11} />
                {formatDate(task.createdAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;