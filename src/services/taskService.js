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
import {
  createNotification,
  createNotificationForMany,
} from "./notificationService";

export const createTask = async (
  teamId,
  createdBy,
  taskData,
  creatorName = "",
) => {
  const docRef = await addDoc(collection(db, "tasks"), {
    title: taskData.title,
    description: taskData.description,
    status: "todo",
    teamId,
    createdBy,
    assignedTo: taskData.assignedTo || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Notif ke semua assignee
  if (taskData.assignedTo?.length > 0) {
    await createNotificationForMany(taskData.assignedTo, {
      type: "task_assigned",
      title: "New Task Assigned",
      message: `You have been assigned to "${taskData.title}"`,
      taskId: docRef.id,
      taskTitle: taskData.title,
      teamId,
      teamName: taskData.teamName || "",
      createdBy,
      createdByName: creatorName,
    });
  }

  return docRef;
};

export const updateTask = async (taskId, updates, context = {}) => {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, {
    ...updates,
    updatedAt: new Date(),
  });

  // Notif task_updated ke semua assignee (kecuali jika yg update adalah assignee itu sendiri)
  const {
    taskTitle = "",
    teamId = "",
    teamName = "",
    assignedTo = [],
    actorId = "",
    actorName = "",
    skipNotif = false,
  } = context;

  if (!skipNotif && assignedTo.length > 0 && taskTitle) {
    const recipients = assignedTo.filter((id) => id !== actorId);
    if (recipients.length > 0) {
      await createNotificationForMany(recipients, {
        type: "task_updated",
        title: "Task Details Edited",
        message: `"${taskTitle}" has been edited by ${actorName}`,
        taskId,
        taskTitle,
        teamId,
        teamName,
        createdBy: actorId,
        createdByName: actorName,
      });
    }
  }
};

export const updateTaskStatus = async (taskId, newStatus, context = {}) => {
  await updateTask(taskId, { status: newStatus }, { skipNotif: true });

  const {
    taskTitle = "",
    teamId = "",
    teamName = "",
    assignedTo = [],   // array uid member yang di-assign
    ownerIds = [],     // array uid owner/admin team
    actorId = "",
    actorName = "",
    isDecline = false,
  } = context;

  // Semua pihak terlibat = assignee + owner, dikurangi actor sendiri
  const allInvolved = [...new Set([...assignedTo, ...ownerIds])].filter(
    (id) => id !== actorId
  );

  // 1. Status berubah ke apapun → notif ke semua pihak terlibat (kecuali actor)
  if (allInvolved.length > 0 && taskTitle) {
    const statusLabel = {
      todo: "To Do",
      inprogress: "In Progress",
      inreview: "In Review",
      done: "Done",
    }[newStatus] || newStatus;

    await createNotificationForMany(allInvolved, {
      type: "task_status_changed",
      title: "Task Status Updated",
      message: `"${taskTitle}" status changed to ${statusLabel} by ${actorName}`,
      taskId, taskTitle, teamId, teamName,
      createdBy: actorId, createdByName: actorName,
    });
  }

  // 2. Submit ke review → notif khusus ke owner (sebagai approval request)
  if (newStatus === "inreview" && ownerIds.length > 0) {
    const reviewerRecipients = ownerIds.filter((id) => id !== actorId);
    if (reviewerRecipients.length > 0) {
      await createNotificationForMany(reviewerRecipients, {
        type: "task_submitted_review",
        title: "Task Needs Approval ⏳",
        message: `"${taskTitle}" has been submitted for approval by ${actorName}`,
        taskId, taskTitle, teamId, teamName,
        createdBy: actorId, createdByName: actorName,
      });
    }
  }

  // 3. Approved → notif ke assignee
  if (newStatus === "done" && !isDecline && assignedTo.length > 0) {
    const assigneeRecipients = assignedTo.filter((id) => id !== actorId);
    if (assigneeRecipients.length > 0) {
      await createNotificationForMany(assigneeRecipients, {
        type: "task_approved",
        title: "Task Approved ✓",
        message: `Your task "${taskTitle}" has been approved by ${actorName}`,
        taskId, taskTitle, teamId, teamName,
        createdBy: actorId, createdByName: actorName,
      });
    }
  }

  // 4. Declined → notif ke assignee
  if (newStatus === "inprogress" && isDecline && assignedTo.length > 0) {
    const assigneeRecipients = assignedTo.filter((id) => id !== actorId);
    if (assigneeRecipients.length > 0) {
      await createNotificationForMany(assigneeRecipients, {
        type: "task_declined",
        title: "Task Declined ✗",
        message: `Your task "${taskTitle}" was declined by ${actorName} and needs revision`,
        taskId, taskTitle, teamId, teamName,
        createdBy: actorId, createdByName: actorName,
      });
    }
  }
};

// TAMBAH: fungsi deleteTask dengan notifikasi
export const deleteTask = async (taskId, context = {}) => {
  const {
    taskTitle = "",
    teamId = "",
    teamName = "",
    assignedTo = [],
    ownerIds = [],
    actorId = "",
    actorName = "",
  } = context;

  await deleteDoc(doc(db, "tasks", taskId));

  // Notif ke semua pihak terlibat
  const allInvolved = [...new Set([...assignedTo, ...ownerIds])].filter(
    (id) => id !== actorId
  );

  if (allInvolved.length > 0 && taskTitle) {
    await createNotificationForMany(allInvolved, {
      type: "task_deleted",
      title: "Task Deleted",
      message: `Task "${taskTitle}" has been deleted by ${actorName}`,
      taskId, taskTitle, teamId, teamName,
      createdBy: actorId, createdByName: actorName,
    });
  }
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
    where("teamId", "in", teamIds),
  );
  const tasksSnapshot = await getDocs(tasksQuery);

  const deletePromises = tasksSnapshot.docs.map((doc) => deleteDoc(doc.ref));

  return await Promise.all(deletePromises);
};
