import { useState, useEffect } from "react";
import { getAllUsers, updateUserRole } from "../../services/authService";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebase";
import Sidebar from "../../components/Sidebar";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await updateUserRole(userId, newRole);
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update user role");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar />
      <div className="flex-1 ml-20">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-white mb-8">
            User Management
          </h1>

          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                    Joined Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {users.map((user) => {
                  const formatDate = (timestamp) => {
                    if (!timestamp) return "N/A";
                    const date = timestamp.toDate
                      ? timestamp.toDate()
                      : new Date(timestamp);
                    return new Intl.DateTimeFormat("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(date);
                  };

                  return (
                    <tr key={user.id} className="hover:bg-slate-700/50">
                      <td className="px-6 py-4 text-slate-300">
                        {user.displayName}
                      </td>
                      <td className="px-6 py-4 text-slate-300">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-slate-600 text-slate-300"
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        {user.role !== "super_admin" && (
                          <button
                            onClick={() => handleRoleChange(user.id, user.role)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                            {user.role === "admin"
                              ? "Demote to User"
                              : "Promote to Admin"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
