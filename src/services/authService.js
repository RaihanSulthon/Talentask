import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export const signUp = async (email, password, displayName) => {
  // Auto-detect role based on email
  const role = email.includes("@admintalentask") ? "admin" : "user";

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
  password: "SuperAdmin123!",
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
    window.dispatchEvent(new Event('superAdminLogin'));

    return { user: mockUser };
  }

  return await signInWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  // Clear super admin auth
  localStorage.removeItem("superAdminAuth");
  
  // Trigger event for UI update
  window.dispatchEvent(new Event('superAdminLogout'));

  // Only sign out from Firebase if not super admin
  if (auth.currentUser) {
    return await firebaseSignOut(auth);
  }
};
