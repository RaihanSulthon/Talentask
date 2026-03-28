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
        { icon: LayoutDashboard, label: "Kanban",   path: "/admin/board" },
        { icon: Users,           label: "Tim",       path: "/team" },
        { icon: CheckSquare,     label: "Tasks",     path: "/admin/tasks" },
        { icon: FileCheck,       label: "Approvals", path: "/admin/approvals" },
        { icon: BookOpen,        label: "Repository",path: "/repository" },
      ];
      if (userRole === "super_admin") {
        items.push({
          icon: UserCog,
          label: "Users",
          path: "/admin/user-management",
        });
      }
      return items;
    }
    return [
      { icon: LayoutDashboard, label: "Kanban",    path: "/user/kanban" },
      { icon: Users,           label: "Tim",        path: "/team" },
      { icon: CheckSquare,     label: "Tasks",      path: "/user/tasks" },
      { icon: FileCheck,       label: "Approvals",  path: "/user/approvals" },
      { icon: BookOpen,        label: "Repository", path: "/repository" },
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
      className={`
        fixed left-0 top-0 h-full z-40
        pt-16
        transition-all duration-300
        flex flex-col
        bg-gray-50 border-r border-gray-200/80
        shadow-[1px_0_8px_0_rgba(0,0,0,0.04)]
        ${isExpanded ? "w-56 xl:w-64" : "w-16 xl:w-20"}
      `}
    >
      {/* Logo icon (collapsed state) */}
      <div className="flex items-center justify-center py-3 mb-1">
        <img
          src={logoIcon}
          alt="Talentask"
          className={`w-auto transition-all duration-300 ${
            isExpanded ? "h-10" : "h-9"
          }`}
        />
      </div>

      {/* Divider */}
      <div className="mx-3 h-px bg-gray-200 mb-2" />

      {/* Nav items */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onAfterNavigate}
              title={!isExpanded ? item.label : undefined}
              className={`
                group flex items-center gap-3
                px-3 py-2.5 rounded-xl
                transition-all duration-200
                ${isActive
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-300"
                  : "text-gray-500 hover:bg-white hover:text-violet-600 hover:shadow-sm"
                }
              `}
            >
              <Icon
                size={19}
                className={`shrink-0 transition-transform duration-200 ${
                  isActive ? "text-white" : "text-gray-400 group-hover:text-violet-600"
                }`}
              />
              <span
                className={`
                  text-sm font-semibold whitespace-nowrap
                  transition-all duration-300
                  ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}
                  ${isActive ? "text-white" : ""}
                `}
              >
                {item.label}
              </span>

              {/* Active indicator dot — hanya saat collapsed */}
              {isActive && !isExpanded && (
                <span className="absolute left-1 w-1 h-5 bg-violet-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px bg-gray-200 mb-2" />

      {/* Back to Home */}
      <div className="px-2 pb-4">
        <Link
          to="/landing"
          onClick={onAfterNavigate}
          title={!isExpanded ? "Beranda" : undefined}
          className="
            group flex items-center gap-3
            px-3 py-2.5 rounded-xl
            text-gray-400 hover:bg-white hover:text-violet-600 hover:shadow-sm
            transition-all duration-200
          "
        >
          <Home
            size={19}
            className="shrink-0 text-gray-400 group-hover:text-violet-600 transition-colors"
          />
          <span
            className={`
              text-sm font-semibold whitespace-nowrap
              transition-all duration-300
              ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}
            `}
          >
            Beranda
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;