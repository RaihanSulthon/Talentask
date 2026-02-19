import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { updateDoc } from "firebase/firestore";

export const signUp = async (email, password, displayName) => {
  // Auto-detect role based on email
  const role = "user";

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    displayName,
    role,
    createdAt: new Date(),
  });

  return userCredential;
};

const SUPER_ADMIN = {
  email: "superadmin@talentask.com",
  password: "123123",
  uid: "hardcoded_super_admin_uid",
  displayName: "Super Admin",
  role: "super_admin",
};

export const signIn = async (email, password) => {
  // Check for hard-coded super admin
  if (email === SUPER_ADMIN.email && password === SUPER_ADMIN.password) {
    // Create mock user object
    const mockUser = {
      uid: SUPER_ADMIN.uid,
      email: SUPER_ADMIN.email,
      displayName: SUPER_ADMIN.displayName,
    };

    // Store in localStorage for persistence
    localStorage.setItem("superAdminAuth", JSON.stringify(mockUser));

    // Trigger storage event for other tabs/windows and manual check
    window.dispatchEvent(new Event("superAdminLogin"));

    return { user: mockUser };
  }

  return await signInWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  const isSuperAdmin = localStorage.getItem("superAdminAuth");

  if (isSuperAdmin) {
    localStorage.removeItem("superAdminAuth"); // ✅ Hapus dulu
    window.dispatchEvent(new Event("superAdminLogout")); // ✅ Baru dispatch
    // Tambah small delay agar React state sempat update
    await new Promise((resolve) => setTimeout(resolve, 50));
    return;
  }

  if (auth.currentUser) {
    return await firebaseSignOut(auth);
  }
};

export const updateUserRole = async (userId, newRole) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    role: newRole,
    updatedAt: new Date(),
  });
};

export const getAllUsers = async () => {
  const usersSnapshot = await getDocs(collection(db, "users"));
  return usersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
