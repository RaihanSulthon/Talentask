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

export const addMembersToTeam = async (teamId, memberIds) => {
  const teamRef = doc(db, "teams", teamId);
  return await updateDoc(teamRef, {
    memberIds: arrayUnion(...memberIds),
    updatedAt: new Date(),
  });
};

export const removeMemberFromTeam = async (teamId, memberId) => {
  const teamRef = doc(db, "teams", teamId);
  return await updateDoc(teamRef, {
    memberIds: arrayRemove(memberId),
    updatedAt: new Date(),
  });
};

export const deleteTeam = async (teamId) => {
  return await deleteDoc(doc(db, "teams", teamId));
};

export const subscribeToUserTeams = (userId, userRole, callback) => {
  let teamsQuery;

  if (userRole === "super_admin" || userRole === "admin") {
    teamsQuery = query(collection(db, "teams"), where("ownerId", "==", userId));
  } else {
    teamsQuery = query(
      collection(db, "teams"),
      where("memberIds", "array-contains", userId)
    );
  }

  return onSnapshot(teamsQuery, callback);
};

export const fetchTeamMembers = async (memberIds) => {
  const memberDetails = await Promise.all(
    (memberIds || []).map(async (memberId) => {
      const memberQuery = query(
        collection(db, "users"),
        where("uid", "==", memberId)
      );
      const memberSnapshot = await getDocs(memberQuery);
      if (!memberSnapshot.empty) {
        return {
          id: memberSnapshot.docs[0].id,
          ...memberSnapshot.docs[0].data(),
        };
      }
      return null;
    })
  );

  return memberDetails.filter((m) => m !== null);
};

export const getAllRegularUsers = async () => {
  const usersQuery = query(
    collection(db, "users"),
    where("role", "==", "user")
  );
  const usersSnapshot = await getDocs(usersQuery);
  return usersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};