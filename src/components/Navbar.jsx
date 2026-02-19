import { useState, useRef, useEffect } from "react";
import Modal from "./Modal";
import { Bell, X, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";
import NotificationDropdown from "./notifications/NotificationDropdown";
import logoFull from "../assets/Talentask_full_logoremovebgpreview.png";
import LogoIcon from "../assets/Talentask_Logoremovebgpreview.png";

const Navbar = () => {
  const { user, userRole } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    handleDeleteAllNotifications,
  } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/landing");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLogoutClick = () => {
    setShowProfile(false);
    setShowLogoutModal(true);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.substring(0, 1).toUpperCase();
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      default:
        return "User";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-50 flex items-center px-4">
        {" "}
        {/* ADDED: Spacer kiri agar logo tetap di tengah */}
        <div className="flex-1" />
        {/* Center: Logo — CHANGED: hapus "absolute left-1/2 -translate-x-1/2" */}
        <div className="flex items-center gap-2">
          <img src={logoFull} alt="Talentask" className="h-32 w-auto" />
        </div>
        {/* Right: Bell + Role Badge + Avatar — CHANGED: tambah "flex-1 justify-end" */}
        <div className="flex-1 flex items-center justify-end gap-3">
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotif((prev) => !prev)}
              className="relative p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <NotificationDropdown
              isOpen={showNotif}
              notifications={notifications}
              unreadCount={unreadCount}
              loading={loading}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onDelete={handleDeleteNotification}
              onDeleteAll={handleDeleteAllNotifications}
              onClose={() => setShowNotif(false)}
            />
          </div>

          <span className="px-3 py-1 bg-violet-100 text-violet-700 text-sm rounded-full font-medium">
            {getRoleLabel()}
          </span>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold">
                {getInitials(user?.displayName)}
              </div>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform duration-300 ${
                  showProfile ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {/* Profile Dropdown */}
            <div
              className={`absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl z-50 overflow-hidden
              transition-all duration-300 origin-top-right
              ${
                showProfile
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
              }`}
            >
              <div className="flex items-center justify-between px-5 py-4 bg-linear-to-r from-blue-600 to-violet-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                    {getInitials(user?.displayName)}
                  </div>
                  <span className="text-white font-semibold text-lg uppercase">
                    {user?.displayName || "User"}
                  </span>
                </div>
                <button
                  onClick={() => setShowProfile(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <h3 className="text-slate-800 font-semibold text-base">
                  Informasi Akun
                </h3>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Email
                  </label>
                  <div className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 text-sm bg-slate-50">
                    {user?.email || "-"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Registered On
                  </label>
                  <div className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 text-sm bg-slate-50">
                    {formatDate(new Date().toISOString())}
                  </div>
                </div>
                <button
                  onClick={handleLogoutClick}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title={
          <>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <LogOut size={20} className="text-red-500" />
            </div>
            <span className="text-gray-800 font-semibold text-lg">
              Konfirmasi Logout
            </span>
          </>
        }
        maxWidth="max-w-sm"
      >
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Apakah kamu yakin ingin keluar? Kamu perlu login kembali untuk
          mengakses dashboard.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowLogoutModal(false)}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Ya, Logout
          </button>
        </div>
      </Modal>
      ;
    </>
  );
};

export default Navbar;
