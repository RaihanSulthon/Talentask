import { Clock, User } from "lucide-react";

const TaskCard = ({ task, onDragStart, onClick }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-GB");
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={onClick}
      className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-emerald-500 cursor-move transition-all hover:shadow-lg"
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-white">{task.title}</h4>
        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-medium">
          {task.teamName || "Team"}
        </span>
      </div>
      <p className="text-sm text-slate-400 mb-3 line-clamp-2">
        {task.description}
      </p>

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
