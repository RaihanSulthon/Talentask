import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTeamManagement } from "../hooks/useTeamManagement";
import { useTaskManagement } from "../hooks/useTaskManagement";
import DashboardLayout from "../layouts/DashboardLayout";
import CreateTaskModal from "../components/kanban/CreateTaskModal";
import KanbanColumn from "../components/kanban/KanbanColumn";
import TaskDetailModal from "../components/kanban/TaskDetailModal";
import DeleteTaskModal from "../components/kanban/DeleteTaskModal";
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [draggedTask, setDraggedTask] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const columns = [
    { id: "todo", title: "To Do", status: "todo" },
    { id: "inprogress", title: "In Progress", status: "inprogress" },
    { id: "inreview", title: "In Review", status: "inreview" },
    { id: "done", title: "Done", status: "done" },
  ];

  const isAdmin = userRole === "super_admin" || userRole === "admin";
  const ownedTeams =
    userRole === "super_admin"
      ? teams
      : teams.filter((t) => t.isOwner);

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
            setIsEditMode(false);
          }}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          canEdit={canEditTask(selectedTask)}
          loading={actionLoading}
          initialEditMode={isEditMode}
        />
      )}

      {showDeleteModal && selectedTask && (
        <DeleteTaskModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedTask(null);
          }}
          onConfirm={confirmDelete}
          taskTitle={selectedTask.title}
          loading={actionLoading}
        />
      )}
    </DashboardLayout>
  );
};

export default KanbanPage;