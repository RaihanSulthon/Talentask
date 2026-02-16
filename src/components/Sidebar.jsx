import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  FileCheck,
  UserCog,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { signOut } from "../services/authService";

const Sidebar = ({
  isExpanded,
  isPinned,
  onMouseEnter,
  onMouseLeave,
  onAfterNavigate,
}) => {
  const { userRole } = useAuth();
  const navigate = useNavigate();

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

    return [
      { icon: LayoutDashboard, label: "Kanban", path: "/user/kanban" },
      { icon: Users, label: "Team", path: "/team" },
      { icon: CheckSquare, label: "Tasks", path: "/user/tasks" },
      { icon: FileCheck, label: "Approvals", path: "/user/approvals" },
    ];
  };

  const menuItems = getMenuItems();

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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`fixed left-0 top-0 h-full bg-slate-800 border-r border-slate-700 transition-all duration-300 pt-16 ${
        isExpanded ? "w-64" : "w-20"
      } ${isPinned ? "z-30" : "z-40"}`}>
      <div className="flex flex-col h-full">
        <nav className="flex-1 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onAfterNavigate}
                className={`flex items-center px-6 py-3 mb-1 transition-all duration-200 rounded-lg mx-2 ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-400 border-l-2 border-emerald-500"
                    : "text-slate-400 hover:bg-green-500/10 hover:text-white"
                }`}>
                <Icon size={20} className="shrink-0" />
                <span
                  className={`ml-4 font-medium whitespace-nowrap transition-all duration-300 ${
                    isExpanded
                      ? "opacity-100 w-auto"
                      : "opacity-0 w-0 overflow-hidden"
                  }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
