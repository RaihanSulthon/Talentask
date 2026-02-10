import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTeamManagement } from "../hooks/useTeamManagement";
import { useTaskManagement } from "../hooks/useTaskManagement";
import DashboardLayout from "../layouts/DashboardLayout";
import CreateTaskModal from "../components/kanban/CreateTaskModal";
import KanbanColumn from "../components/kanban/KanbanColumn";
import TaskDetailModal from "../components/kanban/TaskDetailModal";
import TeamFilterDropdown from "../components/kanban/TeamFilterDropdown";

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

    // Prevent dragging tasks that are in review (only admin can move them)
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
      // Prevent users from directly moving to "done"
      if (newStatus === "done" && !isAdmin) {
        alert(
          "You cannot directly mark a task as Done. Please move it to 'In Review' for approval.",
        );
        setDraggedTask(null);
        return;
      }

      // For users moving to "inreview", show confirmation
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
