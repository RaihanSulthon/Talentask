import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";
import {
  createNotification,
  createNotificationForMany,
} from "./notificationService";
import { deleteTasksByTeamIds } from "./taskService";

export const createTeam = async (userId, userName, userEmail, teamName) => {
  return await addDoc(collection(db, "teams"), {
    name: teamName,
    ownerId: userId,
    ownerName: userName,
    ownerEmail: userEmail,
    memberIds: [userId],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const addMembersToTeam = async (teamId, memberIds, context = {}) => {
  const teamRef = doc(db, "teams", teamId);
  await updateDoc(teamRef, {
    memberIds: arrayUnion(...memberIds),
    updatedAt: new Date(),
  });

  // Notif ke setiap member yang baru ditambahkan
  const { teamName = "", actorId = "", actorName = "" } = context;
  if (memberIds.length > 0 && teamName) {
    await createNotificationForMany(memberIds, {
      type: "member_added",
      title: "Added to Team",
      message: `You have been added to "${teamName}"`,
      teamId,
      teamName,
      createdBy: actorId,
      createdByName: actorName,
    });
  }
};

export const removeMemberFromTeam = async (teamId, memberId, context = {}) => {
  const teamRef = doc(db, "teams", teamId);
  await updateDoc(teamRef, {
    memberIds: arrayRemove(memberId),
    updatedAt: new Date(),
  });

  // Hapus member dari assignedTo di semua tasks yang terkait team ini
  const tasksQuery = query(
    collection(db, "tasks"),
    where("teamId", "==", teamId),
    where("assignedTo", "array-contains", memberId),
  );
  const tasksSnapshot = await getDocs(tasksQuery);
  const unassignPromises = tasksSnapshot.docs.map((taskDoc) =>
    updateDoc(taskDoc.ref, {
      assignedTo: arrayRemove(memberId),
      updatedAt: new Date(),
    }),
  );
  await Promise.all(unassignPromises);

  // Notif ke member yang diremove
  const { teamName = "", actorId = "", actorName = "" } = context;
  if (teamName) {
    await createNotification({
      recipientId: memberId,
      type: "member_removed",
      title: "Removed from Team",
      message: `You have been removed from "${teamName}"`,
      teamId,
      teamName,
      createdBy: actorId,
      createdByName: actorName,
    });
  }
};

export const deleteTeam = async (teamId) => {
  await deleteTasksByTeamIds([teamId]);
  const { deleteRepositoryByTeamId } = await import("./repositoryService");
  await deleteRepositoryByTeamId(teamId);
  return await deleteDoc(doc(db, "teams", teamId));
};

export const getAllUsers = async () => {
  const usersSnapshot = await getDocs(collection(db, "users"));
  return usersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const subscribeToUserTeams = (userId, userRole, callback) => {
  let teamsQuery;

  if (userRole === "super_admin") {
    // Super admin sees ALL teams
    teamsQuery = query(collection(db, "teams"));
  } else if (userRole === "admin") {
    // Admin only sees teams they own
    teamsQuery = query(collection(db, "teams"), where("ownerId", "==", userId));
  } else {
    // Regular users see teams they're members of
    teamsQuery = query(
      collection(db, "teams"),
      where("memberIds", "array-contains", userId),
    );
  }

  return onSnapshot(teamsQuery, callback);
};

export const fetchTeamMembers = async (memberIds) => {
  const memberDetails = await Promise.all(
    (memberIds || []).map(async (memberId) => {
      const memberQuery = query(
        collection(db, "users"),
        where("uid", "==", memberId),
      );
      const memberSnapshot = await getDocs(memberQuery);
      if (!memberSnapshot.empty) {
        return {
          id: memberSnapshot.docs[0].id,
          ...memberSnapshot.docs[0].data(),
        };
      }
      return null;
    }),
  );

  return memberDetails.filter((m) => m !== null);
};

export const getAllRegularUsers = async () => {
  const usersQuery = query(
    collection(db, "users"),
    where("role", "==", "user"), // Only regular users
  );
  const usersSnapshot = await getDocs(usersQuery);
  return usersSnapshot.docs.map((doc) => {
    const userData = doc.data();
    return {
      id: doc.id,
      uid: userData.uid || doc.id,
      ...userData,
    };
  });
};

export const deleteTeamsByOwnerId = async (ownerId) => {
  const teamsQuery = query(
    collection(db, "teams"),
    where("ownerId", "==", ownerId),
  );
  const teamsSnapshot = await getDocs(teamsQuery);

  const teamIds = teamsSnapshot.docs.map((doc) => doc.id);

  // Hapus semua tasks dari team-team ini terlebih dahulu
  if (teamIds.length > 0) {
    await deleteTasksByTeamIds(teamIds);
  }

  const deletePromises = teamsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
  return await Promise.all(deletePromises);
};
