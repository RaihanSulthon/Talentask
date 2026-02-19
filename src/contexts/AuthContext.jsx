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
    const checkSuperAdmin = () => {
      const superAdminAuth = localStorage.getItem("superAdminAuth");
      if (superAdminAuth) {
        try {
          const superAdmin = JSON.parse(superAdminAuth);
          setUser(superAdmin);
          setUserRole("super_admin");
          setLoading(false);
          return true;
        } catch (error) {
          console.error("Invalid super admin auth data:", error);
          localStorage.removeItem("superAdminAuth");
          return false;
        }
      }
      return false;
    };

    // ✅ FIX: Daftarkan event listeners SEBELUM initial check,
    // jangan pakai early return
    const handleSuperAdminLogin = () => {
      checkSuperAdmin();
    };

    const handleSuperAdminLogout = () => {
      setUser(null);
      setUserRole(null);
      setLoading(false);
    };

    window.addEventListener("superAdminLogin", handleSuperAdminLogin);
    window.addEventListener("superAdminLogout", handleSuperAdminLogout);

    // Initial check setelah listener terdaftar
    checkSuperAdmin();

    // Firebase auth listener tetap berjalan untuk non-super-admin
    let unsubscribeUser = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (localStorage.getItem("superAdminAuth")) {
        setLoading(false);
        return;
      }

      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser({ ...firebaseUser, displayName: userData.displayName });
            setUserRole(userData?.role || "user");
          }
          setLoading(false);
        });
      } else {
        // ✅ Hanya reset jika bukan super admin
        if (!localStorage.getItem("superAdminAuth")) {
          setUser(null);
          setUserRole(null);
          setLoading(false);
        }
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeUser) unsubscribeUser();
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
