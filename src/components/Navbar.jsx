import { useState, useRef, useEffect } from "react";
import { Menu, Bell, X, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "../services/authService";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onToggleSidebar }) => {
  const { user, userRole } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
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
    <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-700 z-50 flex items-center justify-between px-4">
      {/* Left: Hamburger */}
      <button
        onClick={onToggleSidebar}
        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
        <Menu size={22} />
      </button>

      {/* Center: Logo */}
      <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        <div className="w-8 h-8 bg-linear-to-r from-emerald-500 to-teal-500 rounded-lg" />
        <span className="text-white font-bold text-lg">TalenTask</span>
      </div>

      {/* Right: Bell + Role Badge + Avatar */}
      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
          <Bell size={20} />
        </button>

        <span className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-full font-medium">
          {getRoleLabel()}
        </span>

        {/* Avatar */}
        {/* Avatar + Chevron */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
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
      }`}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                  {getInitials(user?.displayName)}
                </div>
                <span className="text-white font-semibold text-lg uppercase">
                  {user?.displayName || "User"}
                </span>
              </div>
              <button
                onClick={() => setShowProfile(false)}
                className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
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
                onClick={handleLogout}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
