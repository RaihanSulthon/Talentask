import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  FileCheck,
  UserCog,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const { userRole } = useAuth();

  const getMenuItems = () => {
    if (userRole === "super_admin" || userRole === "admin") {
      const items = [
        { icon: LayoutDashboard, label: "Kanban", path: "/admin/board" },
        { icon: Users, label: "Team", path: "/team" },
        { icon: CheckSquare, label: "Tasks", path: "/admin/tasks" },
        { icon: FileCheck, label: "Approvals", path: "/admin/approvals" },
      ];

      if (userRole === "super_admin") {
        items.push({
          icon: UserCog,
          label: "User Management",
          path: "/admin/user-management",
        });
      }

      return items;
    }

    // User menu items
    return [
      { icon: LayoutDashboard, label: "Kanban", path: "/user/kanban" },
      { icon: Users, label: "Team", path: "/team" },
      { icon: CheckSquare, label: "Tasks", path: "/user/tasks" },
      { icon: FileCheck, label: "Approvals", path: "/user/approvals" },
    ];
  };

  const menuItems = getMenuItems();

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-slate-800 border-r border-slate-700 transition-all duration-300 z-40 ${
        isExpanded ? "w-64" : "w-20"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <Link
          to="/landing"
          className="h-16 flex items-center px-6 border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
        >
          <div className="w-8 h-8 bg-linear-to-r from-emerald-500 to-teal-500 rounded-lg" />
          {isExpanded && (
            <span className="ml-3 text-white font-bold text-lg">TalenTask</span>
          )}
        </Link>

        {/* Menu Items */}
        <nav className="flex-1 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3 mb-1 transition-colors ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-400 border-r-2 border-emerald-500"
                    : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {isExpanded && (
                  <span className="ml-4 font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 group"
          >
            <LogOut
              size={20}
              className="group-hover:scale-110 transition-transform"
            />
            {isExpanded && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
