import TaskCard from "./TaskCard";

const KanbanColumn = ({
  column,
  tasks,
  onDragStart,
  onDragOver,
  onDrop,
  onTaskClick,
  onEditTask,
  onDeleteTask,
  isDragging,
}) => {
  const getColumnConfig = (status) => {
    switch (status) {
      case "todo":
        return {
          accentBar: "bg-slate-400",
          headerBg: "bg-slate-50",
          dropBg: "bg-slate-50/60",
          dropBorder: isDragging ? "border-slate-400" : "border-slate-200",
          badge: "bg-slate-200 text-slate-700",
          emptyIcon: "text-slate-300",
          emptyText: "text-slate-400",
          dot: "bg-slate-400",
        };
      case "inprogress":
        return {
          accentBar: "bg-amber-400",
          headerBg: "bg-amber-50",
          dropBg: "bg-amber-50/50",
          dropBorder: isDragging ? "border-amber-400" : "border-amber-200",
          badge: "bg-amber-500 text-white",
          emptyIcon: "text-amber-200",
          emptyText: "text-amber-400",
          dot: "bg-amber-400",
        };
      case "inreview":
        return {
          accentBar: "bg-blue-400",
          headerBg: "bg-blue-50",
          dropBg: "bg-blue-50/50",
          dropBorder: isDragging ? "border-blue-400" : "border-blue-200",
          badge: "bg-blue-500 text-white",
          emptyIcon: "text-blue-200",
          emptyText: "text-blue-400",
          dot: "bg-blue-400",
        };
      case "done":
        return {
          accentBar: "bg-emerald-400",
          headerBg: "bg-emerald-50",
          dropBg: "bg-emerald-50/50",
          dropBorder: isDragging ? "border-emerald-400" : "border-emerald-200",
          badge: "bg-emerald-500 text-white",
          emptyIcon: "text-emerald-200",
          emptyText: "text-emerald-400",
          dot: "bg-emerald-400",
        };
      default:
        return {
          accentBar: "bg-gray-300",
          headerBg: "bg-gray-50",
          dropBg: "bg-gray-50",
          dropBorder: "border-gray-200",
          badge: "bg-gray-200 text-gray-600",
          emptyIcon: "text-gray-200",
          emptyText: "text-gray-400",
          dot: "bg-gray-400",
        };
    }
  };

  const cfg = getColumnConfig(column.status);

  return (
    <div className="w-full flex flex-col">
      {/* Column Header */}
      <div
        className={`mb-3 rounded-xl border border-gray-100 shadow-sm overflow-hidden`}
      >
        {/* Accent top bar */}
        <div className={`h-1 w-full ${cfg.accentBar}`} />
        <div className={`px-4 py-3 ${cfg.headerBg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              <h3 className="text-sm font-bold text-gray-700 tracking-wide">
                {column.title}
              </h3>
            </div>
            <span
              className={`min-w-6 px-2 py-0.5 text-xs font-bold rounded-full text-center ${cfg.badge}`}
            >
              {tasks.length}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1 pl-4">
            {tasks.length === 0
              ? "Belum ada task di sini"
              : tasks.length === 1
                ? "1 task"
                : `${tasks.length} tasks`}
          </p>
        </div>
      </div>

      {/* Drop Zone — tinggi dikunci, isi bisa di-scroll */}
      <div
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, column.status)}
        className={`
          p-3
          ${cfg.dropBg}
          rounded-xl border-2 border-dashed
          ${cfg.dropBorder}
          transition-all duration-200
          ${isDragging ? "scale-[1.01]" : ""}
          flex flex-col
          h-[calc(100vh-340px)]
          min-h-80
          overflow-hidden
        `}
      >
        {tasks.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
            <div
              className={`w-12 h-12 border-2 border-dashed rounded-2xl flex items-center justify-center ${cfg.emptyIcon} border-current`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <p className={`text-sm font-medium ${cfg.emptyText}`}>
              Drag task ke sini
            </p>
          </div>
        ) : (
          /* ── Scrollable task list — max 4 tiket terlihat, sisanya scroll ── */
          <div
            className="
              flex flex-col gap-2.5
              overflow-y-auto
              h-full
              pr-1
              [&::-webkit-scrollbar]:w-1.5
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:bg-gray-300
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:hover:bg-gray-400
            "
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={{ ...task, teamName: task.teamName }}
                onDragStart={onDragStart}
                onClick={() => onTaskClick(task)}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;