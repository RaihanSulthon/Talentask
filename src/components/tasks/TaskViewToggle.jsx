import { List, Grid, Clock } from "lucide-react";

const TaskViewToggle = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex items-center gap-2 mb-6">
      <button
        onClick={() => setViewMode("list")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
          viewMode === "list"
            ? "bg-emerald-500 text-white"
            : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
        }`}
      >
        <List size={18} />
        List View
      </button>
      <button
        onClick={() => setViewMode("grouped")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
          viewMode === "grouped"
            ? "bg-emerald-500 text-white"
            : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
        }`}
      >
        <Grid size={18} />
        Grouped by Status
      </button>
      <button
        onClick={() => setViewMode("timeline")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
          viewMode === "timeline"
            ? "bg-emerald-500 text-white"
            : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
        }`}
      >
        <Clock size={18} />
        Timeline
      </button>
    </div>
  );
};

export default TaskViewToggle;