import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const addRepositoryItem = async (teamId, teamName, userId, userName, data) => {
  return await addDoc(collection(db, "repositories"), {
    teamId,
    teamName,
    title: data.title,
    type: data.type, // "link" | "file" | "document"
    url: data.url,
    description: data.description || "",
    createdBy: userId,
    createdByName: userName,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const updateRepositoryItem = async (itemId, data) => {
  const ref = doc(db, "repositories", itemId);
  return await updateDoc(ref, {
    title: data.title,
    type: data.type,
    url: data.url,
    description: data.description || "",
    updatedAt: new Date(),
  });
};

export const deleteRepositoryItem = async (itemId) => {
  return await deleteDoc(doc(db, "repositories", itemId));
};

export const subscribeToTeamRepository = (teamId, callback) => {
  const q = query(
    collection(db, "repositories"),
    where("teamId", "==", teamId)
  );
  return onSnapshot(q, callback);
};

export const deleteRepositoryByTeamId = async (teamId) => {
  const q = query(collection(db, "repositories"), where("teamId", "==", teamId));
  const { getDocs } = await import("firebase/firestore");
  const snap = await getDocs(q);
  return Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
};