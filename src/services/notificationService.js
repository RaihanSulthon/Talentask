import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const createNotification = async (data) => {
  return await addDoc(collection(db, "notifications"), {
    recipientId: data.recipientId,
    type: data.type,
    title: data.title,
    message: data.message,
    taskId: data.taskId || "",
    taskTitle: data.taskTitle || "",
    teamId: data.teamId || "",
    teamName: data.teamName || "",
    isRead: false,
    createdAt: new Date(),
    createdBy: data.createdBy || "",
    createdByName: data.createdByName || "",
  });
};

// Buat notif untuk banyak penerima sekaligus (misal task assigned ke multiple user)
export const createNotificationForMany = async (recipientIds, data) => {
  const batch = writeBatch(db);
  recipientIds.forEach((recipientId) => {
    const ref = doc(collection(db, "notifications"));
    batch.set(ref, {
      ...data,
      recipientId,
      isRead: false,
      createdAt: new Date(),
    });
  });
  return await batch.commit();
};

export const markAsRead = async (notifId) => {
  return await updateDoc(doc(db, "notifications", notifId), { isRead: true });
};

export const markAllAsRead = async (userId) => {
  const q = query(
    collection(db, "notifications"),
    where("recipientId", "==", userId),
    where("isRead", "==", false),
  );
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.update(d.ref, { isRead: true }));
  return await batch.commit();
};

export const subscribeToNotifications = (userId, callback) => {
  const q = query(
    collection(db, "notifications"),
    where("recipientId", "==", userId),
  );
  return onSnapshot(q, callback);
};

export const deleteNotification = async (notifId) => {
  return await deleteDoc(doc(db, "notifications", notifId));
};

export const deleteAllNotifications = async (userId) => {
  const q = query(
    collection(db, "notifications"),
    where("recipientId", "==", userId),
  );
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  return await batch.commit();
};

// Kirim deadline reminder notifications
export const sendDeadlineReminders = async (tasks, userId) => {
  const now = new Date();

  for (const task of tasks) {
    if (!task.deadline || task.status === "done") continue;
    if (!task.assignedTo?.includes(userId)) continue;

    const deadline = task.deadline?.toDate ? task.deadline.toDate() : new Date(task.deadline);
    const diffMs = deadline - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const reminderThreshold = task.deadlineReminder ?? 3;

    // Hanya kirim jika dalam rentang reminder dan belum lewat
    if (diffDays > reminderThreshold || diffDays < -1) continue;

    // Cek duplikat: jangan kirim lebih dari 1x per hari untuk task+user+daysLeft yang sama
    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", userId),
      where("taskId", "==", task.id),
      where("type", "==", "deadline_reminder"),
    );
    const existing = await getDocs(q);

    const alreadySentToday = existing.docs.some((d) => {
      const sentAt = d.data().createdAt?.toDate?.() || new Date(d.data().createdAt);
      const hoursDiff = (now - sentAt) / (1000 * 60 * 60);
      return hoursDiff < 24 && d.data().daysLeft === diffDays;
    });

    if (alreadySentToday) continue;

    const isOverdue = diffDays <= 0;
    await createNotification({
      recipientId: userId,
      type: "deadline_reminder",
      title: isOverdue ? "🚨 Task Overdue!" : diffDays === 1 ? "⚠️ Deadline Tomorrow!" : `⏰ Deadline in ${diffDays} days`,
      message: isOverdue
        ? `Task "${task.title}" has passed its deadline!`
        : `Task "${task.title}" is due in ${diffDays} day${diffDays > 1 ? "s" : ""}`,
      taskId: task.id,
      taskTitle: task.title,
      teamId: task.teamId,
      teamName: task.teamName || "",
      createdBy: "system",
      createdByName: "System",
      daysLeft: diffDays,
    });
  }
};