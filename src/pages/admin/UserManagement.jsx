import { useState, useEffect } from "react";
import { getAllUsers, updateUserRole } from "../../services/authService";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import DemoteAdminModal from "../../components/DemoteAdminModal";
import { deleteTasksByTeamIds } from "../../services/taskService";
import { deleteTeamsByOwnerId } from "../../services/teamService";
import DashboardLayout from "../../layouts/DashboardLayout";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDemoteModal, setShowDemoteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [demoteLoading, setDemoteLoading] = useState(false);

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

  const getTeamCountByOwnerId = async (ownerId) => {
    const teamsQuery = query(
      collection(db, "teams"),
      where("ownerId", "==", ownerId),
    );
    const teamsSnapshot = await getDocs(teamsQuery);
    return {
      count: teamsSnapshot.docs.length,
      teamIds: teamsSnapshot.docs.map((doc) => doc.id),
    };
  };

  const handleRoleChange = async (userId, currentRole, userName) => {
    const newRole = currentRole === "admin" ? "user" : "admin";

    if (newRole === "user" && currentRole === "admin") {
      const { count, teamIds } = await getTeamCountByOwnerId(userId);
      setSelectedUser({
        id: userId,
        name: userName,
        teamCount: count,
        teamIds: teamIds,
      });
      setShowDemoteModal(true);
      return;
    }

    try {
      await updateUserRole(userId, newRole);
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update user role");
    }
  };

  const handleConfirmDemote = async () => {
    try {
      setDemoteLoading(true);

      if (selectedUser.teamIds.length > 0) {
        await deleteTasksByTeamIds(selectedUser.teamIds);
      }

      await deleteTeamsByOwnerId(selectedUser.id);
      await updateUserRole(selectedUser.id, "user");

      setShowDemoteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error demoting admin:", error);
      alert("Failed to demote admin. Please try again.");
    } finally {
      setDemoteLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="User Management">
        <div className="text-white">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="User Management"
      subtitle="Manage user roles and permissions"
    >
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
                          : user.role === "super_admin"
                            ? "bg-purple-500/20 text-purple-400"
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
                        onClick={() =>
                          handleRoleChange(user.id, user.role, user.displayName)
                        }
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

      <DemoteAdminModal
        isOpen={showDemoteModal}
        onClose={() => {
          setShowDemoteModal(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmDemote}
        userName={selectedUser?.name}
        teamCount={selectedUser?.teamCount}
        loading={demoteLoading}
      />
    </DashboardLayout>
  );
};

export default UserManagement;