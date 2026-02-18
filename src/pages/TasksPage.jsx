import { useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTeamManagement } from "../hooks/useTeamManagement";
import { useTaskManagement } from "../hooks/useTaskManagement";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";
import TaskListItem from "../components/tasks/TaskListItem";
import TaskFilters from "../components/tasks/TaskFilters";
import TaskViewToggle from "../components/tasks/TaskViewToggle";
import {
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ListTodo,
  Eye,
  CheckCheck,
  User,
} from "lucide-react";
import TeamFilterDropdown from "../components/kanban/TeamFilterDropdown";
import Modal from "../components/Modal";
import CustomSelect from "../components/CustomSelect";
import TaskDetailContent from "../components/tasks/TaskDetailContent";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeamFilter, setSelectedTeamFilter] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [selectedMemberFilter, setSelectedMemberFilter] = useState("");
  const [selectedSortBy, setSelectedSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState("list"); // list, grouped, timeline

  const toggleAssignee = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(memberId)
        ? prev.assignedTo.filter((id) => id !== memberId)
        : [...prev.assignedTo, memberId],
    }));
  };

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

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    teamId: "",
    assignedTo: [],
  });
  const selectedTeamForCreate = teams.find((t) => t.id === formData.teamId);
  const teamOptions = ownedTeams.map((team) => ({
    value: team.id,
    label: team.name,
    icon: team.name.substring(0, 2).toUpperCase(),
    description: `${team.members?.length || 0} members`,
  }));

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
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Create Task
          </button>
        )
      }
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          {
            icon: CheckCircle2,
            value: statistics.total,
            label: "Total Tasks",
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
            accent: "bg-emerald-500",
          },
          {
            icon: Clock,
            value: statistics.inProgress,
            label: "In Progress",
            color: "text-blue-500",
            bg: "bg-blue-50",
            border: "border-blue-100",
            accent: "bg-blue-500",
          },
          {
            icon: ListTodo,
            value: statistics.todo,
            label: "To Do",
            color: "text-amber-500",
            bg: "bg-amber-50",
            border: "border-amber-100",
            accent: "bg-amber-500",
          },
          {
            icon: Eye,
            value: statistics.inReview,
            label: "Needs Review",
            color: "text-violet-500",
            bg: "bg-violet-50",
            border: "border-violet-100",
            accent: "bg-violet-500",
          },
          !isUser
            ? {
                icon: CheckCheck,
                value: statistics.done,
                label: "Completed",
                color: "text-pink-500",
                bg: "bg-pink-50",
                border: "border-pink-100",
                accent: "bg-pink-500",
              }
            : {
                icon: User,
                value: statistics.myTasks,
                label: "My Tasks",
                color: "text-indigo-500",
                bg: "bg-indigo-50",
                border: "border-indigo-100",
                accent: "bg-indigo-500",
              },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={i}
              className={`p-5 border ${stat.border} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden relative`}
            >
              {/* Accent bar top */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${stat.accent} rounded-t-xl`}
              />
              <div className="flex items-center gap-3 mt-1">
                <div
                  className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}
                >
                  <Icon size={20} className={stat.color} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800 leading-none">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-xs mt-1 font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {/* Team Filter Dropdown */}
          <TeamFilterDropdown
            teams={availableTeams}
            selectedTeam={selectedTeamFilter}
            onSelectTeam={setSelectedTeamFilter}
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
              <div className="text-center py-16 text-gray-400">
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
            {[
              {
                status: "todo",
                label: "To Do",
                accent: "bg-amber-400",
                badge: "bg-amber-50 text-amber-600 border border-amber-200",
              },
              {
                status: "inprogress",
                label: "In Progress",
                accent: "bg-blue-400",
                badge: "bg-blue-50 text-blue-600 border border-blue-200",
              },
              {
                status: "inreview",
                label: "In Review",
                accent: "bg-violet-400",
                badge: "bg-violet-50 text-violet-600 border border-violet-200",
              },
              {
                status: "done",
                label: "Done",
                accent: "bg-emerald-400",
                badge:
                  "bg-emerald-50 text-emerald-600 border border-emerald-200",
              },
            ].map(({ status, label, accent, badge }) => {
              const count = filteredTasks.filter(
                (t) => t.status === status,
              ).length;
              return (
                <div
                  key={status}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Colored top bar */}
                  <div className={`h-1 w-full ${accent}`} />
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                    <span className="text-sm font-semibold text-gray-700">
                      {label}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge}`}
                    >
                      {count}
                    </span>
                  </div>
                  {/* Tasks */}
                  <div className="p-3 space-y-2">
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
                    {count === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                          <span className="text-gray-300 text-lg">—</span>
                        </div>
                        <p className="text-sm">No tasks</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg">No tasks found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({
            title: "",
            description: "",
            teamId: "",
            assignedTo: [],
          });
        }}
        title="Create New Task"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 transition-all"
              placeholder="Enter task title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 transition-all resize-none"
              placeholder="Enter task description"
            />
          </div>
          <CustomSelect
            options={teamOptions}
            value={formData.teamId}
            onChange={(value) =>
              setFormData({ ...formData, teamId: value, assignedTo: [] })
            }
            placeholder="Select a team"
            label="Team"
            required
            searchable
          />
          {selectedTeamForCreate?.members && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Assign To
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2 bg-gray-50">
                {selectedTeamForCreate.members
                  .filter((m) => m.role !== "admin" && m.role !== "super_admin")
                  .map((member) => (
                    <label
                      key={member.uid || member.id}
                      className="flex items-center gap-3 p-2.5 hover:bg-white rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.assignedTo.includes(
                          member.uid || member.id,
                        )}
                        onChange={() => toggleAssignee(member.uid || member.id)}
                        className="w-4 h-4 accent-violet-500 rounded"
                      />
                      <div className="flex-1">
                        <div className="text-gray-800 font-medium text-sm">
                          {member.displayName}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {member.email}
                        </div>
                      </div>
                    </label>
                  ))}
              </div>
            </div>
          )}
          <button
            onClick={async () => {
              if (!formData.title || !formData.teamId) {
                alert("Please fill in all required fields");
                return;
              }
              try {
                setActionLoading(true);
                await handleCreateTask(formData);
                setShowCreateModal(false);
                setFormData({
                  title: "",
                  description: "",
                  teamId: "",
                  assignedTo: [],
                });
              } catch (error) {
                alert("Failed to create task");
              } finally {
                setActionLoading(false);
              }
            }}
            disabled={actionLoading}
            className="w-full py-3 bg-violet-500 hover:bg-violet-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-medium transition-all shadow-sm shadow-violet-200"
          >
            {actionLoading ? "Creating..." : "Create Task"}
          </button>
        </div>
      </Modal>

      {/* Delete Task Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        maxWidth="max-w-md"
        title={
          <>
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-400" size={24} />
            </div>
            <span className="text-2xl font-bold text-white">Delete Task</span>
          </>
        }
      >
        <div className="mb-6">
          <p className="text-slate-300">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">
              "{taskToDelete?.title}"
            </span>
            ?
          </p>
          <p className="text-slate-400 text-sm mt-2">
            This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            disabled={actionLoading}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              try {
                setActionLoading(true);
                await handleDeleteTask(taskToDelete.id);
                setShowDeleteModal(false);
                setTaskToDelete(null);
              } catch (error) {
                alert("Failed to delete task");
              } finally {
                setActionLoading(false);
              }
            }}
            disabled={actionLoading}
            className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading ? "Deleting..." : "Delete Task"}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showDetailModal && !!selectedTask}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTask(null);
        }}
        title="Task Details"
        maxWidth="max-w-2xl"
      >
        {selectedTask && (
          <TaskDetailContent
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
      </Modal>
    </DashboardLayout>
  );
};

export default TasksPage;
