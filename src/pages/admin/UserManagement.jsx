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
import { deleteTasksByTeamIds } from "../../services/taskService";
import { deleteTeamsByOwnerId } from "../../services/teamService";
import DashboardLayout from "../../layouts/DashboardLayout";
import Modal from "../../components/Modal";
import {
  AlertTriangle,
  UserCheck,
  UserX,
  Shield,
  Users,
  Mail,
  Calendar,
} from "lucide-react";
import { useToast } from "../../components/Toast";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDemoteModal, setShowDemoteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [demoteLoading, setDemoteLoading] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteLoading, setPromoteLoading] = useState(false);
  const toast = useToast();

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

    if (currentRole === "admin") {
      const { count, teamIds } = await getTeamCountByOwnerId(userId);
      setSelectedUser({
        id: userId,
        name: userName,
        teamCount: count,
        teamIds,
      });
      setShowDemoteModal(true);
      return;
    }

    if (currentRole === "user") {
      setSelectedUser({ id: userId, name: userName });
      setShowPromoteModal(true);
      return;
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
      toast.success(`${selectedUser.name} berhasil diturunkan menjadi User.`);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error demoting admin:", error);
      toast.error("Gagal mengubah role user. Silakan coba lagi.");
    } finally {
      setDemoteLoading(false);
    }
  };

  const handleConfirmPromote = async () => {
    try {
      setPromoteLoading(true);
      await updateUserRole(selectedUser.id, "admin");
      setShowPromoteModal(false);
      toast.success(
        `${selectedUser.name} berhasil dipromosikan menjadi Admin.`,
      );
      setSelectedUser(null);
    } catch (error) {
      console.error("Error promoting user:", error);
      toast.error("Gagal mempromosikan user. Silakan coba lagi.");
    } finally {
      setPromoteLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;

  if (loading) {
    return (
      <DashboardLayout
        title="User Management"
        subtitle="Manage user roles and permissions"
      >
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-9 h-9 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading users...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="User Management"
      subtitle="Manage user roles and permissions"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-violet-100 rounded-xl flex items-center justify-center">
            <Users size={20} className="text-violet-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              Total Users
            </p>
            <p className="text-2xl font-bold text-gray-800">{users.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              Admins
            </p>
            <p className="text-2xl font-bold text-gray-800">{adminCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
            <UserCheck size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              Regular Users
            </p>
            <p className="text-2xl font-bold text-gray-800">{userCount}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2fr_3fr_1.2fr_2fr_1.5fr] px-6 py-3.5 bg-gray-50 border-b border-gray-200">
          {["Name", "Email", "Role", "Joined Date", "Actions"].map((h) => (
            <span
              key={h}
              className="text-xs font-semibold text-gray-400 uppercase tracking-widest"
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {users.map((user) => {
            const initials = (user.displayName || "?")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            const avatarGradient =
              user.role === "super_admin"
                ? "from-violet-500 to-purple-600"
                : user.role === "admin"
                  ? "from-emerald-400 to-teal-500"
                  : "from-blue-400 to-indigo-500";

            return (
              <div
                key={user.id}
                className="grid grid-cols-[2fr_3fr_1.2fr_2fr_1.5fr] items-center px-6 py-4 hover:bg-gray-50/80 transition-colors duration-150"
              >
                {/* Name */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full bg-linear-to-br ${avatarGradient} flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0`}
                  >
                    {initials}
                  </div>
                  <span className="text-gray-800 font-semibold text-sm">
                    {user.displayName}
                  </span>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Mail size={13} className="text-gray-400 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>

                {/* Role Badge */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.role === "super_admin"
                        ? "bg-violet-100 text-violet-700 border border-violet-200"
                        : user.role === "admin"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        user.role === "super_admin"
                          ? "bg-violet-500"
                          : user.role === "admin"
                            ? "bg-emerald-500"
                            : "bg-gray-400"
                      }`}
                    />
                    {user.role === "super_admin"
                      ? "Super Admin"
                      : user.role === "admin"
                        ? "Admin"
                        : "User"}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Calendar size={13} className="text-gray-400 shrink-0" />
                  <span>{formatDate(user.createdAt)}</span>
                </div>

                {/* Action */}
                <div>
                  {user.role !== "super_admin" ? (
                    <button
                      onClick={() =>
                        handleRoleChange(user.id, user.role, user.displayName)
                      }
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border ${
                        user.role === "admin"
                          ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                          : "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100"
                      }`}
                    >
                      {user.role === "admin" ? (
                        <>
                          <UserX size={13} /> Demote to User
                        </>
                      ) : (
                        <>
                          <UserCheck size={13} /> Promote to Admin
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/60">
          <p className="text-xs text-gray-400">{users.length} users total</p>
        </div>
      </div>

      <Modal
        isOpen={showDemoteModal}
        onClose={() => setShowDemoteModal(false)}
        maxWidth="max-w-md"
        title={
          <>
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={20} />
            </div>
            <span className="text-lg font-bold text-gray-800">
              Confirm Demotion
            </span>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            Are you sure you want to demote{" "}
            <span className="font-semibold text-gray-900">
              {selectedUser?.name}
            </span>{" "}
            to a regular user?
          </p>

          {(selectedUser?.teamCount || 0) > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-semibold mb-2">
                ⚠️ This action will permanently delete:
              </p>
              <ul className="text-red-600 text-sm list-disc list-inside space-y-1">
                <li>
                  {selectedUser.teamCount} team
                  {selectedUser.teamCount > 1 ? "s" : ""} owned by this admin
                </li>
                <li>
                  All tasks associated with{" "}
                  {selectedUser.teamCount > 1 ? "these teams" : "this team"}
                </li>
              </ul>
            </div>
          )}

          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle size={14} className="text-amber-500 shrink-0" />
            <p className="text-amber-700 text-xs font-medium">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowDemoteModal(false)}
            disabled={demoteLoading}
            className="flex-1 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDemote}
            disabled={demoteLoading}
            className="flex-1 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-red-200"
          >
            {demoteLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              "Confirm Demotion"
            )}
          </button>
        </div>
      </Modal>

      {/* Promote Modal */}
      <Modal
        isOpen={showPromoteModal}
        onClose={() => setShowPromoteModal(false)}
        maxWidth="max-w-md"
        title={
          <>
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <UserCheck className="text-indigo-500" size={20} />
            </div>
            <span className="text-lg font-bold text-gray-800">
              Confirm Promotion
            </span>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            Are you sure you want to promote{" "}
            <span className="font-semibold text-gray-900">
              {selectedUser?.name}
            </span>{" "}
            to Admin?
          </p>

          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
            <p className="text-indigo-700 text-sm font-semibold mb-2">
              🛡️ As an Admin, this user will be able to:
            </p>
            <ul className="text-indigo-600 text-sm list-disc list-inside space-y-1">
              <li>Create and manage teams</li>
              <li>Assign tasks to team members</li>
              <li>Access admin dashboard features</li>
            </ul>
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle size={14} className="text-amber-500 shrink-0" />
            <p className="text-amber-700 text-xs font-medium">
              You can demote this user back to regular user at any time.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowPromoteModal(false)}
            disabled={promoteLoading}
            className="flex-1 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmPromote}
            disabled={promoteLoading}
            className="flex-1 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-200"
          >
            {promoteLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              "Confirm Promotion"
            )}
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default UserManagement;
