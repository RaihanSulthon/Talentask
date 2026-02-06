import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for super admin on mount
    const checkSuperAdmin = () => {
      const superAdminAuth = localStorage.getItem("superAdminAuth");
      if (superAdminAuth) {
        const superAdmin = JSON.parse(superAdminAuth);
        setUser(superAdmin);
        setUserRole("super_admin");
        setLoading(false);
        return true;
      }
      return false;
    };

    // Initial check
    if (checkSuperAdmin()) return;

    // Listen for super admin login/logout
    const handleSuperAdminLogin = () => {
      checkSuperAdmin();
    };

    const handleSuperAdminLogout = () => {
      setUser(null);
      setUserRole(null);
    };

    window.addEventListener("superAdminLogin", handleSuperAdminLogin);
    window.addEventListener("superAdminLogout", handleSuperAdminLogout);

    // Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Skip if super admin is logged in
      if (localStorage.getItem("superAdminAuth")) return;

      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser({ ...firebaseUser, displayName: userData.displayName });
            setUserRole(userData?.role || "user");
          }
        });
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      window.removeEventListener("superAdminLogin", handleSuperAdminLogin);
      window.removeEventListener("superAdminLogout", handleSuperAdminLogout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
