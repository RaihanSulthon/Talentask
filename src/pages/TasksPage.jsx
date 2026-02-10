import { useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTeamManagement } from "../hooks/useTeamManagement";
import { useTaskManagement } from "../hooks/useTaskManagement";
import DashboardLayout from "../layouts/DashboardLayout";
import CreateTaskModal from "../components/kanban/CreateTaskModal";
import TaskDetailModal from "../components/kanban/TaskDetailModal";
import TaskStatCard from "../components/tasks/TaskStatCard";
import TaskListItem from "../components/tasks/TaskListItem";
import TaskFilters from "../components/tasks/TaskFilters";
import TaskViewToggle from "../components/tasks/TaskViewToggle";
import { Plus, Search, Users } from "lucide-react";
import CustomSelect from "../components/CustomSelect";

const TasksPage = () => {
  const { user, userRole } = useAuth();
  const { teams, loading: teamsLoading } = useTeamManagement();
  const {
    tasks,
    loading: tasksLoading,
    handleCreateTask,
    handleUpdateTask,
    handleUpdateTaskStatus,
    handleDeleteTask,
    canEditTask,
  } = useTaskManagement(teams);

  // State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeamFilter, setSelectedTeamFilter] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [selectedMemberFilter, setSelectedMemberFilter] = useState("");
  const [selectedSortBy, setSelectedSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState("list"); // list, grouped, timeline

  const isAdmin = userRole === "super_admin" || userRole === "admin";
  const isSuperAdmin = userRole === "super_admin";
  const isUser = userRole === "user";

  // Filter teams based on role
  const availableTeams = useMemo(() => {
    if (isSuperAdmin) return teams;
    if (isAdmin) return teams.filter((t) => t.isOwner);
    return teams;
  }, [teams, userRole]);

  // Get owned teams for creating tasks
  const ownedTeams = useMemo(() => {
    if (isSuperAdmin) return teams;
    return teams.filter((t) => t.isOwner);
  }, [teams, userRole]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks.map((task) => ({
      ...task,
      teamName: teams.find((t) => t.id === task.teamId)?.name || "Unknown Team",
    }));

    // Search by name
    if (searchQuery) {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by team
    if (selectedTeamFilter) {
      filtered = filtered.filter((task) => task.teamId === selectedTeamFilter);
    }

    // Filter by status
    if (selectedStatusFilter) {
      filtered = filtered.filter(
        (task) => task.status === selectedStatusFilter,
      );
    }

    // Filter by assigned member
    if (selectedMemberFilter) {
      if (selectedMemberFilter === "unassigned") {
        filtered = filtered.filter(
          (task) => !task.assignedTo || task.assignedTo.length === 0,
        );
      } else if (selectedMemberFilter === "my-tasks" && user) {
        filtered = filtered.filter(
          (task) => task.assignedTo && task.assignedTo.includes(user.uid),
        );
      } else {
        filtered = filtered.filter(
          (task) =>
            task.assignedTo && task.assignedTo.includes(selectedMemberFilter),
        );
      }
    }

    // Sort
    switch (selectedSortBy) {
      case "recent":
        filtered.sort((a, b) => {
          const dateA = a.updatedAt?.toDate?.() || new Date(a.updatedAt);
          const dateB = b.updatedAt?.toDate?.() || new Date(b.updatedAt);
          return dateB - dateA;
        });
        break;
      case "oldest":
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateA - dateB;
        });
        break;
      case "name":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return filtered;
  }, [
    tasks,
    teams,
    searchQuery,
    selectedTeamFilter,
    selectedStatusFilter,
    selectedMemberFilter,
    selectedSortBy,
    user,
  ]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const relevantTasks = selectedTeamFilter
      ? filteredTasks.filter((task) => task.teamId === selectedTeamFilter)
      : filteredTasks;

    return {
      total: relevantTasks.length,
      todo: relevantTasks.filter((task) => task.status === "todo").length,
      inProgress: relevantTasks.filter((task) => task.status === "inprogress")
        .length,
      inReview: relevantTasks.filter((task) => task.status === "inreview")
        .length,
      done: relevantTasks.filter((task) => task.status === "done").length,
      myTasks: relevantTasks.filter(
        (task) => task.assignedTo && task.assignedTo.includes(user?.uid),
      ).length,
    };
  }, [filteredTasks, selectedTeamFilter, user]);

  // Get all members from selected team or all teams
  const availableMembers = useMemo(() => {
    const memberMap = new Map();
    const teamsToCheck = selectedTeamFilter
      ? teams.filter((t) => t.id === selectedTeamFilter)
      : availableTeams;

    teamsToCheck.forEach((team) => {
      team.members?.forEach((member) => {
        if (!memberMap.has(member.uid)) {
          memberMap.set(member.uid, member);
        }
      });
    });

    return Array.from(memberMap.values());
  }, [teams, selectedTeamFilter, availableTeams]);

  // Handlers
  const onCreateTask = async (taskData) => {
    try {
      setActionLoading(true);
      await handleCreateTask(taskData.teamId, taskData);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task");
    } finally {
      setActionLoading(false);
    }
  };

  const onTaskClick = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const onStatusChange = async (taskId, newStatus) => {
    try {
      await handleUpdateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Failed to update task status");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedTeamFilter("");
    setSelectedStatusFilter("");
    setSelectedMemberFilter("");
    setSelectedSortBy("recent");
  };

  const teamFilterOptions = [
    { value: "", label: "All Teams", icon: "👥" },
    ...availableTeams.map((team) => ({
      value: team.id,
      label: team.name,
      icon: team.name.substring(0, 2).toUpperCase(),
      description: `${team.members?.length || 0} members`,
    })),
  ];

  if (teamsLoading || tasksLoading) {
    return (
      <DashboardLayout title="Tasks">
        <div className="text-white">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Current Tasks"
      subtitle="View and manage all your tasks"
      actions={
        isAdmin &&
        ownedTeams.length > 0 && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <Plus size={20} />
            Create Task
          </button>
        )
      }>
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <TaskStatCard
          icon="✓"
          value={statistics.total}
          label="Total Tasks"
          gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
        />
        <TaskStatCard
          icon="⏱"
          value={statistics.inProgress}
          label="In Progress"
          gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
        />
        <TaskStatCard
          icon="⚠"
          value={statistics.todo}
          label="To Do"
          gradient="bg-gradient-to-br from-orange-500 to-amber-500"
        />
        <TaskStatCard
          icon="👁"
          value={statistics.inReview}
          label="Needs Review"
          gradient="bg-gradient-to-br from-yellow-500 to-orange-500"
        />
        {!isUser && (
          <TaskStatCard
            icon="✓"
            value={statistics.done}
            label="Completed"
            gradient="bg-gradient-to-br from-purple-500 to-pink-500"
          />
        )}
        {isUser && (
          <TaskStatCard
            icon="👤"
            value={statistics.myTasks}
            label="My Tasks"
            gradient="bg-gradient-to-br from-indigo-500 to-purple-500"
          />
        )}
      </div>

      {/* Filters and Search */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Team Filter */}
          <CustomSelect
            options={teamFilterOptions}
            value={selectedTeamFilter}
            onChange={setSelectedTeamFilter}
            searchable={availableTeams.length > 5}
          />
        </div>

        <TaskFilters
          selectedStatusFilter={selectedStatusFilter}
          setSelectedStatusFilter={setSelectedStatusFilter}
          selectedMemberFilter={selectedMemberFilter}
          setSelectedMemberFilter={setSelectedMemberFilter}
          selectedSortBy={selectedSortBy}
          setSelectedSortBy={setSelectedSortBy}
          availableMembers={availableMembers}
          onResetFilters={handleResetFilters}
          isUser={isUser}
        />
      </div>

      {/* View Toggle */}
      <TaskViewToggle viewMode={viewMode} setViewMode={setViewMode} />

      {/* Tasks List */}
      <div className="space-y-3">
        {viewMode === "list" && (
          <>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskListItem
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                  onStatusChange={
                    isUser || canEditTask(task) ? onStatusChange : null
                  }
                  teams={teams}
                  canEdit={canEditTask(task)}
                  isUser={isUser}
                />
              ))
            ) : (
              <div className="text-center py-16 text-slate-400">
                <p className="text-lg">No tasks found</p>
                <p className="text-sm mt-2">
                  Try adjusting your filters or create a new task
                </p>
              </div>
            )}
          </>
        )}

        {viewMode === "grouped" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {["todo", "inprogress", "inreview", "done"].map((status) => (
              <div key={status} className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">
                  {status === "todo"
                    ? "To Do"
                    : status === "inprogress"
                      ? "In Progress"
                      : status === "inreview"
                        ? "In Review"
                        : "Done"}
                  <span className="ml-2 px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                    {filteredTasks.filter((t) => t.status === status).length}
                  </span>
                </h3>
                <div className="space-y-3">
                  {filteredTasks
                    .filter((t) => t.status === status)
                    .map((task) => (
                      <TaskListItem
                        key={task.id}
                        task={task}
                        onClick={() => onTaskClick(task)}
                        onStatusChange={
                          isUser || canEditTask(task) ? onStatusChange : null
                        }
                        teams={teams}
                        canEdit={canEditTask(task)}
                        isUser={isUser}
                        compact
                      />
                    ))}
                  {filteredTasks.filter((t) => t.status === status).length ===
                    0 && (
                    <p className="text-slate-500 text-sm text-center py-8">
                      No tasks
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "timeline" && (
          <div className="space-y-6">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, index) => {
                const prevTask = filteredTasks[index - 1];
                const currentDate =
                  task.createdAt?.toDate?.() || new Date(task.createdAt);
                const prevDate =
                  prevTask?.createdAt?.toDate?.() ||
                  new Date(prevTask?.createdAt);
                const showDateHeader =
                  !prevTask ||
                  currentDate.toDateString() !== prevDate.toDateString();

                return (
                  <div key={task.id}>
                    {showDateHeader && (
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-slate-400 font-medium">
                          {currentDate.toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        <div className="flex-1 h-px bg-slate-700"></div>
                      </div>
                    )}
                    <TaskListItem
                      task={task}
                      onClick={() => onTaskClick(task)}
                      onStatusChange={
                        isUser || canEditTask(task) ? onStatusChange : null
                      }
                      teams={teams}
                      canEdit={canEditTask(task)}
                      isUser={isUser}
                    />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 text-slate-400">
                <p className="text-lg">No tasks found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateTaskModal
          teams={ownedTeams}
          onClose={() => setShowCreateModal(false)}
          onCreate={onCreateTask}
          loading={actionLoading}
        />
      )}

      {showDetailModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          teams={teams}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTask(null);
          }}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          canEdit={canEditTask(selectedTask)}
          loading={actionLoading}
        />
      )}
    </DashboardLayout>
  );
};

export default TasksPage;
