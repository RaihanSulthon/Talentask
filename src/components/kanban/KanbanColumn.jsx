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
        className={`min-h-125 p-4 bg-slate-800/50 rounded-xl border-2 border-dashed transition-colors ${
          isDragging ? "border-emerald-500 bg-slate-700/50" : "border-slate-700"
        }`}
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
