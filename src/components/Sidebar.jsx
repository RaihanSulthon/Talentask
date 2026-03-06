import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  FileCheck,
  UserCog,
  Home,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { signOut } from "../services/authService";
import logoIcon from "../assets/Talentask_Logoremovebgpreview.png";

const Sidebar = ({
  isExpanded,
  onMouseEnter,
  onMouseLeave,
  onAfterNavigate,
}) => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getMenuItems = () => {
    if (userRole === "super_admin" || userRole === "admin") {
      const items = [
        { icon: LayoutDashboard, label: "Kanban", path: "/admin/board" },
        { icon: Users, label: "Team", path: "/team" },
        { icon: CheckSquare, label: "Tasks", path: "/admin/tasks" },
        { icon: FileCheck, label: "Approvals", path: "/admin/approvals" },
        { icon: BookOpen, label: "Repository", path: "/repository" },
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
      { icon: BookOpen, label: "Repository", path: "/repository" },
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
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 pt-16 z-40 ${
        isExpanded ? "w-56 xl:w-64 shadow-2xl shadow-black/50" : "w-16 xl:w-20"
      }`}>
      <div className="flex items-center justify-center py-3 mb-2">
        <img src={logoIcon} alt="Talentask" className="w-auto h-12" />
      </div>
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
                className={`flex items-center px-4 lg:px-5 xl:px-6 py-2.5 lg:py-3 mb-1 transition-all duration-200 rounded-lg mx-2 ${
                  isActive
                    ? "bg-violet-100 text-violet-700 border-l-2 border-violet-600"
                    : "text-gray-500 hover:bg-violet-50 hover:text-violet-600"
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
          <div className="py-4 border-t border-gray-100">
            <Link
              to="/landing"
              onClick={onAfterNavigate}
              className="flex items-center px-4 lg:px-5 xl:px-6 py-2.5 lg:py-3 mx-2 rounded-lg text-gray-400 hover:bg-violet-50 hover:text-violet-600 transition-all duration-200">
              <Home size={20} className="shrink-0" />
              <span
                className={`ml-4 font-medium whitespace-nowrap transition-all duration-300 ${
                  isExpanded
                    ? "opacity-100 w-auto"
                    : "opacity-0 w-0 overflow-hidden"
                }`}>
                Back to Home
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
