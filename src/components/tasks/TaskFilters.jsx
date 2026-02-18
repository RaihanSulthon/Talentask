import { X } from "lucide-react";

const TaskFilters = ({
  selectedStatusFilter,
  setSelectedStatusFilter,
  selectedMemberFilter,
  setSelectedMemberFilter,
  selectedSortBy,
  setSelectedSortBy,
  availableMembers,
  onResetFilters,
  isUser,
}) => {
  const hasActiveFilters =
    selectedStatusFilter || selectedMemberFilter || selectedSortBy !== "recent";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status Filter */}
      <select
        value={selectedStatusFilter}
        onChange={(e) => setSelectedStatusFilter(e.target.value)}
        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
      >
        <option value="">All Status</option>
        <option value="todo">To Do</option>
        <option value="inprogress">In Progress</option>
        <option value="inreview">In Review</option>
        <option value="done">Done</option>
      </select>

      {/* Member Filter */}
      <select
        value={selectedMemberFilter}
        onChange={(e) => setSelectedMemberFilter(e.target.value)}
        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
      >
        <option value="">All Members</option>
        {isUser && <option value="my-tasks">My Tasks</option>}
        <option value="unassigned">Unassigned</option>
        {availableMembers.map((member) => (
          <option key={member.uid} value={member.uid}>
            {member.displayName}
          </option>
        ))}
      </select>

      {/* Sort By */}
      <select
        value={selectedSortBy}
        onChange={(e) => setSelectedSortBy(e.target.value)}
        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
      >
        <option value="recent">Most Recent</option>
        <option value="oldest">Oldest First</option>
        <option value="name">Name (A-Z)</option>
      </select>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <button
          onClick={onResetFilters}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <X size={16} />
          Reset Filters
        </button>
      )}
    </div>
  );
};

export default TaskFilters;
