import TaskCard from "./TaskCard";

const KanbanColumn = ({
  column,
  tasks,
  onDragStart,
  onDragOver,
  onDrop,
  onTaskClick,
  isDragging,
}) => {
  const getColumnBgColor = (status) => {
    switch (status) {
      case "inprogress":
        return "bg-yellow-900/5";
      case "inreview":
        return "bg-blue-900/5";
      case "done":
        return "bg-emerald-900/5";
      default:
        return "bg-slate-800/50";
    }
  };

  const getColumnBorderColor = (status, isDragging) => {
    if (isDragging) return "border-emerald-500";
    return "border-slate-700";
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">
          {column.title}
        </h3>
        <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
          {tasks.length}
        </span>
      </div>

      <div
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, column.status)}
        className={`min-h-125 p-4 ${getColumnBgColor(column.status)} rounded-xl border-2 border-dashed transition-colors ${getColumnBorderColor(column.status, isDragging)}`}
      >
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center min-h-96">
            <p className="text-slate-500 text-lg font-medium">
              No tasks available
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={{
                  ...task,
                  teamName: task.teamName,
                }}
                onDragStart={onDragStart}
                onClick={() => onTaskClick(task)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;