import { Clock, User, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const TaskCard = ({ task, onDragStart, onClick, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
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
        return "border-t-4 border-t-slate-500";
      case "inprogress":
        return "border-t-4 border-t-yellow-500";
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
      className={`p-4 bg-slate-800 rounded-lg border-2 border-slate-700 cursor-move transition-all 
    hover:bg-slate-700 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]
    ${getBorderColor(task.status)}`}>
      {/* Header with three dots */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-white flex-1 pr-2">{task.title}</h4>
        
        {/* Three dots menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuClick}
            className="p-1 hover:bg-slate-600 rounded transition-colors"
          >
            <MoreVertical size={16} className="text-slate-400" />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute right-0 top-8 w-40 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-50 overflow-hidden">
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2 text-left text-white hover:bg-slate-600 transition-colors flex items-center gap-2"
              >
                <Edit2 size={14} />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-600 transition-colors flex items-center gap-2"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description and Team badge side by side */}
      <div className="flex items-start gap-2 mb-3">
        <p className="text-sm text-slate-400 line-clamp-2 flex-1">
          {task.description}
        </p>
        <span className="shrink-0 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-medium whitespace-nowrap">
          {task.teamName || "Team"}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
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