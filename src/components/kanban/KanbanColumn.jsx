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
  const getColumnBgColor = (status) => {
    switch (status) {
      case "inprogress":
        return "bg-amber-50";
      case "inreview":
        return "bg-blue-50";
      case "done":
        return "bg-green-50";
      default:
        return "bg-gray-50";
    }
  };

  const getColumnBorderColor = (status, isDragging) => {
    if (isDragging) return "border-violet-500";
    return "border-gray-300";
  };

  const getCountBadgeColor = (status) => {
    switch (status) {
      case "todo":
        return "bg-gray-200 text-gray-700";
      case "inprogress":
        return "bg-amber-500 text-white border border-amber-400";
      case "inreview":
        return "bg-blue-500 text-white border border-blue-400";
      case "done":
        return "bg-green-500 text-white border border-green-400";
      default:
        return "bg-gray-700 text-gray-300";
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase">
          {column.title}
        </h3>
        <span
          className={`px-2 py-1 text-xs font-bold rounded-full ${getCountBadgeColor(column.status)}`}
        >
          {tasks.length}
        </span>
      </div>

      <div
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, column.status)}
        className={`h-[calc(100vh-420px)] min-h-125 max-h- p-4 ${getColumnBgColor(column.status)} rounded-xl border-2 border-dashed transition-colors ${getColumnBorderColor(column.status, isDragging)} flex flex-col`}
      >
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center flex-1">
            <p className="text-gray-400 text-lg font-medium">
              No tasks available
            </p>
          </div>
        ) : (
          <div
            className="space-y-3 overflow-y-auto flex-1 pr-2 
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:bg-gray-100
                    [&::-webkit-scrollbar-track]:rounded-lg
                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                    [&::-webkit-scrollbar-thumb]:rounded-lg
                    [&::-webkit-scrollbar-thumb]:hover:bg-gray-400
                    scrollbar-thin"
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={{
                  ...task,
                  teamName: task.teamName,
                }}
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
