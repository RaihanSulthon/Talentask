import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTeamManagement } from "../hooks/useTeamManagement";
import { useTaskManagement } from "../hooks/useTaskManagement";
import DashboardLayout from "../layouts/DashboardLayout";
import CreateTaskModal from "../components/kanban/CreateTaskModal";
import KanbanColumn from "../components/kanban/KanbanColumn";
import TaskDetailModal from "../components/kanban/TaskDetailModal";

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
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [draggedTask, setDraggedTask] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const columns = [
    { id: "todo", title: "TO DO", status: "todo" },
    { id: "inprogress", title: "IN PROGRESS", status: "inprogress" },
    { id: "inreview", title: "IN REVIEW", status: "inreview" },
    { id: "done", title: "DONE", status: "done" },
  ];

  const isAdmin = userRole === "super_admin" || userRole === "admin";
  const ownedTeams =
    userRole === "super_admin"
      ? teams // Super admin bisa membuat task untuk semua team
      : teams.filter((t) => t.isOwner); // Admin biasa hanya untuk team yang dimiliki

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

  const onDragStart = (e, task) => {
    if (!canEditTask(task)) {
      e.preventDefault();
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
    // Tambahkan team info ke task
    const taskWithTeam = {
      ...task,
      teamName: teams.find((t) => t.id === task.teamId)?.name || "Unknown Team",
    };
    setSelectedTask(taskWithTeam);
    setShowDetailModal(true);
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
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>

          {isAdmin && ownedTeams.length > 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
            >
              Add Task
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
          return (
            <div key={col.id} className="p-6 bg-slate-800 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-white">{count}</div>
                <div className="text-slate-400 text-sm">{col.title}</div>
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
              isDragging={draggedTask !== null}
            />
          );
        })}
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

export default KanbanPage;
