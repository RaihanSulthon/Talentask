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
    await createTask(teamId, user.uid, taskData);
  };

  const handleUpdateTask = async (taskId, updates) => {
    await updateTask(taskId, updates);
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    await updateTaskStatus(taskId, newStatus);
  };

  const handleDeleteTask = async (taskId) => {
    await deleteTask(taskId);
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
  };
};
