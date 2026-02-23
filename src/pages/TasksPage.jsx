import { useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
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
  AlertCircle,
  CheckCircle2,
  Clock,
  ListTodo,
  Eye,
  CheckCheck,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import TeamFilterDropdown from "../components/kanban/TeamFilterDropdown";
import Modal from "../components/Modal";
import CustomSelect from "../components/CustomSelect";
import TaskDetailContent from "../components/tasks/TaskDetailContent";
import { useToast } from "../components/Toast";
import { sendDeadlineReminders } from "../services/notificationService";
import { useEffect } from "react";

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
    getDeadlineInfo,
    urgentDeadlineTasks,
  } = useTaskManagement(teams);
  // State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeamFilter, setSelectedTeamFilter] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [selectedMemberFilter, setSelectedMemberFilter] = useState("");
  const [selectedDeadlineFilter, setSelectedDeadlineFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [viewMode, setViewMode] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;
  const toast = useToast();
  const navigate = useNavigate();

  // Bungkus setiap setter filter agar reset page
  const handleStatusFilter = (v) => {
    setSelectedStatusFilter(v);
    setCurrentPage(1);
  };
  const handleMemberFilter = (v) => {
    setSelectedMemberFilter(v);
    setCurrentPage(1);
  };
  const handleDeadlineFilter = (v) => {
    setSelectedDeadlineFilter(v);
    setCurrentPage(1);
  };
  const handleDateRange = (v) => {
    setDateRange(v);
    setCurrentPage(1);
  };
  const handleSearch = (v) => {
    setSearchQuery(v);
    setCurrentPage(1);
  };
  const handleTeamFilter = (v) => {
    setSelectedTeamFilter(v);
    setCurrentPage(1);
  };

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
    deadline: null,
    deadlineReminder: 3,
  });

  const [formErrors, setFormErrors] = useState({});

  const validateTaskForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.deadline) errors.deadline = "Deadline is required";
    if (!formData.teamId) errors.teamId = "Team is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

    // Filter by date range
    if (dateRange.start) {
      filtered = filtered.filter((task) => {
        const taskDate = task.createdAt?.toDate?.() || new Date(task.createdAt);
        const start = new Date(dateRange.start);
        start.setHours(0, 0, 0, 0);
        const end = dateRange.end
          ? new Date(dateRange.end)
          : new Date(dateRange.start);
        end.setHours(23, 59, 59, 999);
        return taskDate >= start && taskDate <= end;
      });
    }

    // Filter by deadline
    if (selectedDeadlineFilter) {
      const now = new Date();
      filtered = filtered.filter((task) => {
        if (selectedDeadlineFilter === "no-deadline") return !task.deadline;
        if (!task.deadline) return false;
        const deadline = task.deadline?.toDate
          ? task.deadline.toDate()
          : new Date(task.deadline);
        const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        if (selectedDeadlineFilter === "overdue") return diffDays < 0;
        if (selectedDeadlineFilter === "today") return diffDays === 0;
        if (selectedDeadlineFilter === "3days")
          return diffDays >= 0 && diffDays <= 3;
        if (selectedDeadlineFilter === "week")
          return diffDays >= 0 && diffDays <= 7;
        return true;
      });
    }

    // Default sort: most recent
    filtered.sort((a, b) => {
      const dateA = a.updatedAt?.toDate?.() || new Date(a.updatedAt);
      const dateB = b.updatedAt?.toDate?.() || new Date(b.updatedAt);
      return dateB - dateA;
    });

    return filtered;
  }, [
    tasks,
    teams,
    searchQuery,
    selectedTeamFilter,
    selectedStatusFilter,
    selectedMemberFilter,
    selectedDeadlineFilter,
    dateRange,
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

  const hasUnassigned = useMemo(
    () =>
      filteredTasks.some(
        (task) => !task.assignedTo || task.assignedTo.length === 0,
      ),
    [filteredTasks],
  );

  const onTaskClick = (task) => {
    navigate(`/task/${task.id}`);
  };

  const onStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const taskTeam = teams.find((t) => t.id === task.teamId);
      const ownerIds = taskTeam?.ownerId ? [taskTeam.ownerId] : [];

      await handleUpdateTaskStatus(taskId, newStatus, {
        taskTitle: task.title,
        teamId: task.teamId,
        teamName: taskTeam?.name || "",
        assignedTo: task.assignedTo || [],
        ownerIds,
        actorId: user.uid,
        actorName: user.displayName,
      });
      toast.success(`Status task diperbarui ke "${newStatus}".`);
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Gagal memperbarui status task.");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedTeamFilter("");
    setSelectedStatusFilter("");
    setSelectedMemberFilter("");
    setSelectedDeadlineFilter("");
    setDateRange({ start: null, end: null });
  };

  useEffect(() => {
    if (!user || tasks.length === 0) return;
    sendDeadlineReminders(tasks, user.uid);
  }, [user, tasks.length]);

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
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Create Task
          </button>
        )
      }
    >
      {/* Deadline Reminder Banner */}
      {urgentDeadlineTasks.length > 0 && (
        <div className="mb-4 p-4 bg-linear-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-orange-700">
              {urgentDeadlineTasks.length} task
              {urgentDeadlineTasks.length > 1 ? "s" : ""} need your attention
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {urgentDeadlineTasks.slice(0, 5).map((task) => {
              const info = getDeadlineInfo(task);
              return (
                <button
                  key={task.id}
                  onClick={() => navigate(`/task/${task.id}`)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:shadow-sm
              ${
                info.isOverdue
                  ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                  : info.isToday
                    ? "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200"
                    : "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
              }`}
                >
                  <span>
                    {info.isOverdue ? "🚨" : info.isToday ? "⚠️" : "⏰"}
                  </span>
                  <span className="max-w-32 truncate">{task.title}</span>
                  <span className="opacity-70">· {info.label}</span>
                </button>
              );
            })}
            {urgentDeadlineTasks.length > 5 && (
              <span className="flex items-center px-3 py-1.5 text-xs text-orange-500">
                +{urgentDeadlineTasks.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-4 mb-5 lg:mb-8">
        {" "}
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
          selectedDeadlineFilter={selectedDeadlineFilter}
          setSelectedDeadlineFilter={handleDeadlineFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          availableMembers={availableMembers}
          hasUnassigned={hasUnassigned}
          onResetFilters={handleResetFilters}
          isUser={isUser}
        />
      </div>

      {/* View Toggle */}
      <TaskViewToggle viewMode={viewMode} setViewMode={setViewMode} />

      {/* Tasks List */}
      <div className="space-y-3">
        {viewMode === "list" &&
          (() => {
            const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
            const paginated = filteredTasks.slice(
              (currentPage - 1) * ITEMS_PER_PAGE,
              currentPage * ITEMS_PER_PAGE,
            );

            return (
              <>
                {filteredTasks.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {paginated.map((task) => (
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
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                        <span className="text-sm text-gray-400">
                          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}– {""}
                          {Math.min(
                            currentPage * ITEMS_PER_PAGE,
                            filteredTasks.length,
                          )}{" "}
                          of {filteredTasks.length} tasks
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronLeft size={16} />
                          </button>

                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(
                              (p) =>
                                p === 1 ||
                                p === totalPages ||
                                Math.abs(p - currentPage) <= 1,
                            )
                            .reduce((acc, p, idx, arr) => {
                              if (idx > 0 && p - arr[idx - 1] > 1)
                                acc.push("...");
                              acc.push(p);
                              return acc;
                            }, [])
                            .map((p, idx) =>
                              p === "..." ? (
                                <span
                                  key={`ellipsis-${idx}`}
                                  className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm"
                                >
                                  …
                                </span>
                              ) : (
                                <button
                                  key={p}
                                  onClick={() => setCurrentPage(p)}
                                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                          ${
                            currentPage === p
                              ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                                >
                                  {p}
                                </button>
                              ),
                            )}

                          <button
                            onClick={() =>
                              setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={currentPage === totalPages}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16 text-gray-400">
                    <p className="text-lg">No tasks found</p>
                    <p className="text-sm mt-2">
                      Try adjusting your filters or create a new task
                    </p>
                  </div>
                )}
              </>
            );
          })()}

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
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
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
                  {/* Tasks — scrollable, max height */}
                  <div
                    className="p-3 flex-1 overflow-y-auto max-h-[calc(100vh-420px)] min-h-48
  [&::-webkit-scrollbar]:w-1.5
  [&::-webkit-scrollbar-track]:bg-transparent
  [&::-webkit-scrollbar-thumb]:bg-gray-200
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb:hover]:bg-gray-300
  space-y-2"
                  >
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
                          <span className="text-gray-300 text-lg">–</span>
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
          setFormErrors({});
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
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (formErrors.title)
                  setFormErrors((prev) => ({ ...prev, title: "" }));
              }}
              className={`w-full px-4 py-2.5 border rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                formErrors.title
                  ? "bg-red-50 border-red-400 focus:ring-red-100"
                  : "bg-gray-50 border-gray-200 focus:ring-violet-100 focus:border-violet-400"
              }`}
              placeholder="Enter task title"
            />
            {formErrors.title && (
              <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
                <AlertCircle size={12} className="shrink-0" />
                {formErrors.title}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (formErrors.description)
                  setFormErrors((prev) => ({ ...prev, description: "" }));
              }}
              rows={3}
              className={`w-full px-4 py-2.5 border rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${
                formErrors.description
                  ? "bg-red-50 border-red-400 focus:ring-red-100"
                  : "bg-gray-50 border-gray-200 focus:ring-violet-100 focus:border-violet-400"
              }`}
              placeholder="Enter task description"
            />
            {formErrors.description && (
              <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
                <AlertCircle size={12} className="shrink-0" />
                {formErrors.description}
              </p>
            )}
          </div>

          {/* Deadline field - tambah setelah field description */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Deadline <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={
                formData.deadline
                  ? new Date(formData.deadline).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  deadline: e.target.value ? new Date(e.target.value) : null,
                })
              }
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 transition-all"
            />
            {formData.deadline && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <label className="text-xs text-gray-500">Remind me</label>
                <select
                  value={formData.deadlineReminder ?? 3}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deadlineReminder: parseInt(e.target.value),
                    })
                  }
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-violet-300"
                >
                  <option value={1}>1 day before</option>
                  <option value={2}>2 days before</option>
                  <option value={3}>3 days before</option>
                  <option value={5}>5 days before</option>
                  <option value={7}>7 days before</option>
                </select>
              </div>
            )}
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
              if (!validateTaskForm()) return;
              try {
                setActionLoading(true);
                await handleCreateTask(formData.teamId, {
                  title: formData.title,
                  description: formData.description,
                  assignedTo: formData.assignedTo,
                  teamName:
                    teams.find((t) => t.id === formData.teamId)?.name || "",
                  deadline: formData.deadline || null,
                  deadlineReminder: formData.deadlineReminder ?? 3,
                });
                setShowCreateModal(false);
                toast.success("Task berhasil dibuat! 🎉");
                setFormData({
                  title: "",
                  description: "",
                  teamId: "",
                  assignedTo: [],
                  deadline: null,
                  deadlineReminder: 3,
                });
                setFormErrors({});
              } catch (error) {
                toast.error("Gagal membuat task. Silakan coba lagi.");
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
                const taskTeam = teams.find(
                  (t) => t.id === taskToDelete.teamId,
                );
                const ownerIds = taskTeam?.ownerId ? [taskTeam.ownerId] : [];

                await handleDeleteTask(taskToDelete.id, {
                  taskTitle: taskToDelete.title,
                  teamId: taskToDelete.teamId,
                  teamName: taskTeam?.name || "",
                  assignedTo: taskToDelete.assignedTo || [],
                  ownerIds,
                  actorId: user.uid,
                  actorName: user.displayName,
                });
                setShowDeleteModal(false);
                toast.success("Task berhasil dihapus.");
                setTaskToDelete(null);
              } catch (error) {
                toast.error("Gagal menghapus task.");
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
    </DashboardLayout>
  );
};

export default TasksPage;
