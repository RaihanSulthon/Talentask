import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  subscribeToTeamTasks,
  addAssignee,
  removeAssignee,
} from "../services/taskService";

export const useTaskManagement = (teams) => {
  const { user, userRole } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = userRole === "super_admin" || userRole === "admin";
  const ownedTeamIds =
    userRole === "super_admin"
      ? teams.map((t) => t.id) // Super admin: semua team
      : teams.filter((t) => t.isOwner).map((t) => t.id); // Admin: hanya team miliknya
  const memberTeamIds = teams.map((t) => t.id);

  useEffect(() => {
    if (!user) return;

    const teamIds = isAdmin ? ownedTeamIds : memberTeamIds;

    const unsubscribe = subscribeToTeamTasks(
      user.uid,
      userRole,
      teamIds,
      (snapshot) => {
        const tasksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(tasksData);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user, userRole, teams.length]);

  const handleCreateTask = async (teamId, taskData) => {
    await createTask(
      teamId,
      user.uid,
      taskData,
      user.displayName || user.email || "",
    );
  };

  const handleUpdateTask = async (taskId, updates, context = {}) => {
    await updateTask(taskId, updates, context);
  };

  const handleUpdateTaskStatus = async (taskId, newStatus, context = {}) => {
    await updateTaskStatus(taskId, newStatus, context);
  };

  const handleDeleteTask = async (taskId, context = {}) => {
    await deleteTask(taskId, context);
  };

  const handleAddAssignee = async (taskId, memberId) => {
    await addAssignee(taskId, memberId);
  };

  const handleRemoveAssignee = async (taskId, memberId) => {
    await removeAssignee(taskId, memberId);
  };

  const canEditTask = (task) => {
    if (isAdmin && ownedTeamIds.includes(task.teamId)) return true;
    if (task.assignedTo?.includes(user.uid)) return true;
    return false;
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  // Helper: hitung sisa hari hingga deadline
  const getDeadlineInfo = (task) => {
    if (!task.deadline) return null;
    const deadline = task.deadline?.toDate
      ? task.deadline.toDate()
      : new Date(task.deadline);
    const now = new Date();
    const diffMs = deadline - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return {
      deadline,
      diffDays,
      isOverdue: diffDays < 0,
      isToday: diffDays === 0,
      isUrgent: diffDays >= 0 && diffDays <= (task.deadlineReminder ?? 3),
      label:
        diffDays < 0
          ? `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""}`
          : diffDays === 0
            ? "Due today"
            : `${diffDays} day${diffDays > 1 ? "s" : ""} left`,
    };
  };

  // Tasks yang mendekati/melewati deadline (untuk banner reminder)
  const urgentDeadlineTasks = tasks.filter((task) => {
    if (!task.deadline || task.status === "done") return false;
    const info = getDeadlineInfo(task);
    return info?.isUrgent || info?.isOverdue;
  });

  return {
    tasks,
    loading,
    handleCreateTask,
    handleUpdateTask,
    handleUpdateTaskStatus,
    handleDeleteTask,
    handleAddAssignee,
    handleRemoveAssignee,
    canEditTask,
    getTasksByStatus,
    getDeadlineInfo,
    urgentDeadlineTasks,
  };
};
