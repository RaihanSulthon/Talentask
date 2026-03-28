import { useState, useRef, useEffect } from "react";
import Modal from "./Modal";
import { Bell, X, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";
import NotificationDropdown from "./notifications/NotificationDropdown";
import logoFull from "../assets/Talentask_full_logoremovebgpreview.png";
import { useToast } from "./Toast";

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
  const toast = useToast();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotif(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    toast.info("Kamu telah berhasil keluar. Sampai jumpa!");
    navigate("/auth");
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
      case "super_admin": return "Super Admin";
      case "admin":       return "Admin";
      default:            return "User";
    }
  };

  const getRoleBadgeStyle = () => {
    switch (userRole) {
      case "super_admin":
        return "bg-violet-100 text-violet-700 border border-violet-200";
      case "admin":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
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
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header
        className="
          fixed top-0 left-0 right-0 z-50
          h-16
          bg-white/80 backdrop-blur-md
          border-b border-gray-200/80
          shadow-sm shadow-gray-200/60
          flex items-center px-4
        "
      >
        {/* Left spacer */}
        <div className="flex-1" />

        {/* Center: Logo */}
        <div className="flex items-center">
          <img
            src={logoFull}
            alt="Talentask"
            className="h-20 lg:h-24 xl:h-32 w-auto"
          />
        </div>

        {/* Right: actions */}
        <div className="flex-1 flex items-center justify-end gap-2.5">

          {/* Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotif((prev) => !prev)}
              className="relative p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all duration-200"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
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
              onMarkAllAsRead={async () => {
                await handleMarkAllAsRead();
                toast.info("Semua notifikasi telah ditandai sebagai dibaca.");
              }}
              onDelete={handleDeleteNotification}
              onDeleteAll={handleDeleteAllNotifications}
              onClose={() => setShowNotif(false)}
            />
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200" />

          {/* Role badge */}
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeStyle()}`}
          >
            {getRoleLabel()}
          </span>

          {/* Avatar + dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-linear-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {getInitials(user?.displayName)}
              </div>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-300 ${
                  showProfile ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {/* Profile dropdown */}
            <div
              className={`
                absolute right-0 top-12 w-76
                bg-white rounded-2xl
                shadow-xl shadow-gray-200/80
                border border-gray-100
                z-50 overflow-hidden
                transition-all duration-200 origin-top-right
                ${showProfile
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }
              `}
            >
              {/* Header gradient */}
              <div className="px-5 py-4 bg-linear-to-r from-violet-600 to-blue-600 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-base">
                    {getInitials(user?.displayName)}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm leading-tight">
                      {user?.displayName || "User"}
                    </p>
                    <p className="text-white/60 text-xs mt-0.5">
                      {getRoleLabel()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfile(false)}
                  className="text-white/50 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <div className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 text-sm">
                    {user?.email || "-"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Terdaftar Sejak
                  </label>
                  <div className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 text-sm">
                    {formatDate(new Date().toISOString())}
                  </div>
                </div>

                <div className="pt-1 border-t border-gray-100">
                  <button
                    onClick={handleLogoutClick}
                    className="w-full py-2.5 mt-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Logout confirmation modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title={
          <>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <LogOut size={18} className="text-red-500" />
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
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={15} />
            Ya, Logout
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Navbar;