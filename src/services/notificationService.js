import {
  collection, addDoc, updateDoc, doc,
  query, where, onSnapshot, writeBatch, getDocs
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
    where("isRead", "==", false)
  );
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.update(d.ref, { isRead: true }));
  return await batch.commit();
};

export const subscribeToNotifications = (userId, callback) => {
  const q = query(
    collection(db, "notifications"),
    where("recipientId", "==", userId)
  );
  return onSnapshot(q, callback);
};