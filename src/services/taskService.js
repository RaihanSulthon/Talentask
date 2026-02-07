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
import { getDocs } from "firebase/firestore";

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

  if (userRole === "super_admin") {
    // Super admin melihat SEMUA task dari semua team
    tasksQuery = query(collection(db, "tasks"));
  } else if (userRole === "admin") {
    // Admin hanya melihat task dari team yang dimiliki
    tasksQuery = query(
      collection(db, "tasks"),
      where("teamId", "in", teamIds.length > 0 ? teamIds : ["dummy"]),
    );
  } else {
    // User biasa hanya melihat task yang di-assign ke mereka
    tasksQuery = query(
      collection(db, "tasks"),
      where("assignedTo", "array-contains", userId),
    );
  }

  return onSnapshot(tasksQuery, callback);
};

export const deleteTasksByTeamIds = async (teamIds) => {
  if (teamIds.length === 0) return;
  
  const tasksQuery = query(
    collection(db, "tasks"),
    where("teamId", "in", teamIds)
  );
  const tasksSnapshot = await getDocs(tasksQuery);
  
  const deletePromises = tasksSnapshot.docs.map((doc) => 
    deleteDoc(doc.ref)
  );
  
  return await Promise.all(deletePromises);
};
