import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const createTask = async (teamId, createdBy, taskData) => {
  return await addDoc(collection(db, "tasks"), {
    title: taskData.title,
    description: taskData.description,
    status: "todo",
    teamId,
    createdBy,
    assignedTo: taskData.assignedTo || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const updateTask = async (taskId, updates) => {
  const taskRef = doc(db, "tasks", taskId);
  return await updateDoc(taskRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const updateTaskStatus = async (taskId, newStatus) => {
  return await updateTask(taskId, { status: newStatus });
};

export const addAssignee = async (taskId, memberId) => {
  const taskRef = doc(db, "tasks", taskId);
  return await updateDoc(taskRef, {
    assignedTo: arrayUnion(memberId),
    updatedAt: new Date(),
  });
};

export const removeAssignee = async (taskId, memberId) => {
  const taskRef = doc(db, "tasks", taskId);
  return await updateDoc(taskRef, {
    assignedTo: arrayRemove(memberId),
    updatedAt: new Date(),
  });
};

export const deleteTask = async (taskId) => {
  return await deleteDoc(doc(db, "tasks", taskId));
};

export const subscribeToTeamTasks = (userId, userRole, teamIds, callback) => {
  let tasksQuery;

  if (userRole === "super_admin" || userRole === "admin") {
    tasksQuery = query(
      collection(db, "tasks"),
      where("teamId", "in", teamIds.length > 0 ? teamIds : ["dummy"]),
    );
  } else {
    tasksQuery = query(
      collection(db, "tasks"),
      where("assignedTo", "array-contains", userId),
    );
  }

  return onSnapshot(tasksQuery, callback);
};
