import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, query, where, onSnapshot, serverTimestamp
} from "firebase/firestore";
import { db } from "../config/firebase";
import { createNotificationForMany } from "./notificationService";

export const createSubmission = async (submissionData, context = {}) => {
  const docRef = await addDoc(collection(db, "submissions"), {
    taskId: submissionData.taskId,
    assignedTo: submissionData.assignedTo,        // UID submitter
    assignedToName: submissionData.assignedToName,
    teamId: submissionData.teamId,
    content: submissionData.content || "",
    fileUrl: submissionData.fileUrl || "",
    fileName: submissionData.fileName || "",
    fileType: submissionData.fileType || "",
    status: "submitted",
    reviewNote: "",
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    reviewedBy: "",
    reviewedAt: null,
  });

  // Notif ke admin/owner
  if (context.ownerIds?.length > 0) {
    await createNotificationForMany(context.ownerIds, {
      type: "task_submission",
      title: "New Submission 📬",
      message: `${submissionData.assignedToName} submitted work for "${context.taskTitle}"`,
      taskId: submissionData.taskId,
      taskTitle: context.taskTitle,
      teamId: submissionData.teamId,
      teamName: context.teamName || "",
      createdBy: submissionData.assignedTo,
      createdByName: submissionData.assignedToName,
    });
  }

  return docRef;
};

export const updateSubmission = async (submissionId, updates) => {
  const ref = doc(db, "submissions", submissionId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
};

export const reviewSubmission = async (submissionId, status, reviewNote, context = {}) => {
  const ref = doc(db, "submissions", submissionId);
  await updateDoc(ref, {
    status,           // "reviewed" | "revision"
    reviewNote,
    reviewedBy: context.reviewedBy || "",
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Notif ke submitter
  if (context.submitterId) {
    const isApproved = status === "reviewed";
    await createNotificationForMany([context.submitterId], {
      type: isApproved ? "submission_approved" : "submission_revision",
      title: isApproved ? "Submission Approved ✅" : "Revision Needed 🔄",
      message: isApproved
        ? `Your submission for "${context.taskTitle}" has been approved`
        : `Your submission for "${context.taskTitle}" needs revision: ${reviewNote}`,
      taskId: context.taskId,
      taskTitle: context.taskTitle,
      teamId: context.teamId || "",
      createdBy: context.reviewedBy,
      createdByName: context.reviewerName || "",
    });
  }
};

export const deleteSubmission = async (submissionId) => {
  await deleteDoc(doc(db, "submissions", submissionId));
};

export const subscribeToTaskSubmissions = (taskId, callback) => {
  const q = query(collection(db, "submissions"), where("taskId", "==", taskId));
  return onSnapshot(q, callback);
};

export const subscribeToSubmissionsByTaskIds = (taskIds, callback) => {
  if (!taskIds || taskIds.length === 0) {
    callback({});
    return () => {};
  }
  // Firestore "in" max 30 items, ambil batch pertama saja (cukup untuk use case ini)
  const q = query(
    collection(db, "submissions"),
    where("taskId", "in", taskIds.slice(0, 30)),
  );
  return onSnapshot(q, (snap) => {
    // Return map: { [taskId]: true } untuk task yang punya submission
    const map = {};
    snap.docs.forEach((d) => {
      map[d.data().taskId] = true;
    });
    callback(map);
  });
};