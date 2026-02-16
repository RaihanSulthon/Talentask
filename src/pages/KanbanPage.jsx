import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTeamManagement } from "../hooks/useTeamManagement";
import { useTaskManagement } from "../hooks/useTaskManagement";
import DashboardLayout from "../layouts/DashboardLayout";
import KanbanColumn from "../components/kanban/KanbanColumn";
import TeamFilterDropdown from "../components/kanban/TeamFilterDropdown";
import Modal from "../components/Modal";
import { AlertTriangle } from "lucide-react";
import CustomSelect from "../components/CustomSelect";
import TaskDetailContent from "../components/TaskDetailContent";

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
        await handleUpdateTaskStatus(draggedTask.id, newStatus);
      } catch (error) {
        console.error("Error updating task status:", error);
        alert("Failed to update task status");
      }
    }
    setDraggedTask(null);
  };

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
      await handleDeleteTask(selectedTask.id);
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
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors">
              Add Task
            </button>
          )}
        </div>
      }>
      {/* Task Statistics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {columns.map((col) => {
          const count = filteredTasks.filter(
            (task) => task.status === col.status,
          ).length;

          const getStatBgColor = (status) => {
            switch (status) {
              case "todo":
                return "bg-slate-800";
              case "inprogress":
                return "bg-yellow-600 border border-yellow-500";
              case "inreview":
                return "bg-blue-600 border border-blue-500";
              case "done":
                return "bg-emerald-600 border border-emerald-500";
              default:
                return "bg-slate-800";
            }
          };

          return (
            <div
              key={col.id}
              className={`p-6 rounded-xl ${getStatBgColor(col.status)}`}>
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
        }}
        title="Create New Task"
        maxWidth="max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter task title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Assign To
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-700 rounded-lg p-3">
                {selectedTeamForCreate.members
                  .filter((m) => m.role !== "admin" && m.role !== "super_admin")
                  .map((member) => (
                    <label
                      key={member.uid || member.id}
                      className="flex items-center gap-3 p-2 hover:bg-slate-600 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.assignedTo.includes(
                          member.uid || member.id,
                        )}
                        onChange={() => toggleAssignee(member.uid || member.id)}
                        className="w-4 h-4 text-emerald-500 bg-slate-800 border-slate-500 rounded focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {member.displayName}
                        </div>
                        <div className="text-slate-400 text-sm">
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
              await onCreateTask(formData); // pakai wrapper yang sudah ada
              setFormData({
                title: "",
                description: "",
                teamId: "",
                assignedTo: [],
              });
            }}
            disabled={actionLoading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors">
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
        }>
        <div className="mb-6">
          <p className="text-slate-300">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">
              "{selectedTask?.title}"
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
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={actionLoading}
            className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
        maxWidth="max-w-2xl">
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
