import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTeamManagement } from "../hooks/useTeamManagement";
import { useTaskManagement } from "../hooks/useTaskManagement";
import DashboardLayout from "../layouts/DashboardLayout";
import KanbanColumn from "../components/kanban/KanbanColumn";
import TeamFilterDropdown from "../components/kanban/TeamFilterDropdown";
import Modal from "../components/Modal";
import { AlertTriangle, AlertCircle } from "lucide-react";
import CustomSelect from "../components/CustomSelect";
import TaskDetailContent from "../components/tasks/TaskDetailContent";

const KanbanPage = () => {
  const { user, userRole } = useAuth();
  const { teams, loading: teamsLoading } = useTeamManagement();
  const {
    tasks,
    loading: tasksLoading,
    handleCreateTask,
    handleUpdateTaskStatus,
    handleUpdateTask,
    handleDeleteTask,
    canEditTask,
  } = useTaskManagement(teams);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [draggedTask, setDraggedTask] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const columns = [
    { id: "todo", title: "To Do", status: "todo" },
    { id: "inprogress", title: "In Progress", status: "inprogress" },
    { id: "inreview", title: "In Review", status: "inreview" },
    { id: "done", title: "Done", status: "done" },
  ];

  const isAdmin = userRole === "super_admin" || userRole === "admin";
  const ownedTeams =
    userRole === "super_admin" ? teams : teams.filter((t) => t.isOwner);

  const filteredTasks = (
    selectedTeam ? tasks.filter((task) => task.teamId === selectedTeam) : tasks
  ).map((task) => ({
    ...task,
    teamName: teams.find((t) => t.id === task.teamId)?.name || "Unknown Team",
  }));

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

  // HARUS DITAMBAHKAN setelah deklarasi state yang ada
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    teamId: "",
    assignedTo: [],
  });
  const [formErrors, setFormErrors] = useState({});

  const validateTaskForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const selectedTeamForCreate =
    ownedTeams.find((t) => t.id === formData.teamId) || null;
  const teamOptions = ownedTeams.map((team) => ({
    value: team.id,
    label: team.name,
    icon: team.name.substring(0, 2).toUpperCase(),
    description: `${team.members?.length || 0} members`,
  }));
  const toggleAssignee = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(memberId)
        ? prev.assignedTo.filter((id) => id !== memberId)
        : [...prev.assignedTo, memberId],
    }));
  };

  const onDragStart = (e, task) => {
    if (!canEditTask(task)) {
      e.preventDefault();
      return;
    }

    if (task.status === "inreview" && !isAdmin) {
      e.preventDefault();
      alert("This task is awaiting approval and cannot be moved.");
      return;
    }

    setDraggedTask(task);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = async (e, newStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      if (newStatus === "done" && !isAdmin) {
        alert(
          "You cannot directly mark a task as Done. Please move it to 'In Review' for approval.",
        );
        setDraggedTask(null);
        return;
      }

      if (newStatus === "inreview" && !isAdmin) {
        if (
          !window.confirm(
            "Submit this task for approval? Your team owner will review it.",
          )
        ) {
          setDraggedTask(null);
          return;
        }
      }

      try {
        const taskTeam = teams.find((t) => t.id === draggedTask.teamId);
        const ownerIds = taskTeam?.ownerId ? [taskTeam.ownerId] : [];
        await handleUpdateTaskStatus(draggedTask.id, newStatus, {
          taskTitle: draggedTask.title,
          teamId: draggedTask.teamId,
          teamName: taskTeam?.name || "",
          assignedTo: draggedTask.assignedTo || [],
          ownerIds,
          actorId: user.uid,
          actorName: user.displayName,
        });
      } catch (error) {
        console.error("Error updating task status:", error);
        alert("Failed to update task status");
      }
    }
    setDraggedTask(null);
  };

  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-open task modal dari notifikasi
  useEffect(() => {
    const taskId = searchParams.get("taskId");
    if (!taskId || tasks.length === 0) return;

    const found = tasks.find((t) => t.id === taskId);
    if (found) {
      const taskWithTeam = {
        ...found,
        teamName:
          teams.find((t) => t.id === found.teamId)?.name || "Unknown Team",
      };
      setSelectedTask(taskWithTeam);
      setIsEditMode(false);
      setShowDetailModal(true);
      setSearchParams({}); // bersihkan URL
    }
  }, [tasks, searchParams]);

  const onTaskClick = (task) => {
    const taskWithTeam = {
      ...task,
      teamName: teams.find((t) => t.id === task.teamId)?.name || "Unknown Team",
    };
    setSelectedTask(taskWithTeam);
    setIsEditMode(false);
    setShowDetailModal(true);
  };

  const handleEditTask = (task) => {
    const taskWithTeam = {
      ...task,
      teamName: teams.find((t) => t.id === task.teamId)?.name || "Unknown Team",
    };
    setSelectedTask(taskWithTeam);
    setIsEditMode(true);
    setShowDetailModal(true);
  };

  const handleDeleteTaskClick = (task) => {
    setSelectedTask(task);
    setTaskToDelete(task); // tambahkan ini
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      const taskTeam = teams.find((t) => t.id === selectedTask.teamId);
      const ownerIds = taskTeam?.ownerId ? [taskTeam.ownerId] : [];

      await handleDeleteTask(selectedTask.id, {
        taskTitle: selectedTask.title,
        teamId: selectedTask.teamId,
        teamName: taskTeam?.name || "",
        assignedTo: selectedTask.assignedTo || [],
        ownerIds,
        actorId: user.uid,
        actorName: user.displayName,
      });
      setShowDeleteModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task");
    } finally {
      setActionLoading(false);
    }
  };

  if (teamsLoading || tasksLoading) {
    return (
      <DashboardLayout title="Kanban Board">
        <div className="text-white">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Kanban Board"
      subtitle="Visualize and manage your tasks"
      actions={
        <div className="flex gap-4">
          <TeamFilterDropdown
            teams={teams}
            selectedTeam={selectedTeam}
            onSelectTeam={setSelectedTeam}
          />

          {isAdmin && ownedTeams.length > 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
            >
              Create Task
            </button>
          )}
        </div>
      }
    >
      {/* Task Statistics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {columns.map((col) => {
          const count = filteredTasks.filter(
            (task) => task.status === col.status,
          ).length;

          const getStatBgColor = (status) => {
            switch (status) {
              case "todo":
                return "bg-gray-600 border border-gray-300 text-gray-700";
              case "inprogress":
                return "bg-amber-500 text-white shadow-amber-200 shadow-md";
              case "inreview":
                return "bg-blue-500 text-white shadow-blue-200 shadow-md";
              case "done":
                return "bg-green-500 text-white shadow-green-200 shadow-md";
              default:
                return "bg-gray-200";
            }
          };

          return (
            <div
              key={col.id}
              className={`p-6 rounded-xl ${getStatBgColor(col.status)}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-white">{count}</div>
                <div className="text-white font-semibold text-md">
                  {col.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-6">
        {columns.map((column) => {
          const columnTasks = filteredTasks.filter(
            (task) => task.status === column.status,
          );
          return (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onTaskClick={onTaskClick}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTaskClick}
              isDragging={draggedTask !== null}
            />
          );
        })}
      </div>

      {/* Modals */}
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
              await onCreateTask(formData);
              setFormData({
                title: "",
                description: "",
                teamId: "",
                assignedTo: [],
              });
              setFormErrors({});
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
            <span className="text-xl font-semibold text-gray-800">
              Delete Task
            </span>
          </>
        }
      >
        <div className="mb-6">
          <p className="text-gray-500 text-center">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-800">
              "{selectedTask?.title}"
            </span>
            ?
          </p>
          <p className="text-gray-400 text-sm mt-2">
            This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            disabled={actionLoading}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={actionLoading}
            className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading ? "Deleting..." : "Delete Task"}
          </button>
        </div>
      </Modal>

      {/* Task Detail Modal */}
      <Modal
        isOpen={showDetailModal && !!selectedTask}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTask(null);
          setIsEditMode(false);
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
              setIsEditMode(false);
            }}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            canEdit={canEditTask(selectedTask)}
            loading={actionLoading}
            initialEditMode={isEditMode}
          />
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default KanbanPage;
