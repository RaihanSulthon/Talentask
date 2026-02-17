import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useSidebar } from "../contexts/SidebarContext";

const DashboardLayout = ({ children, title, subtitle, actions }) => {
  const {
    isExpanded,
    handleMouseEnter,
    handleMouseLeave,
    handleAfterNavigate,
  } = useSidebar();

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Navbar />
      <Sidebar
        isExpanded={isExpanded}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onAfterNavigate={handleAfterNavigate}
      />
      <div className="flex-1 p-8 pt-24 transition-all duration-300 ml-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
          {subtitle && <p className="text-slate-400">{subtitle}</p>}
          {actions && <div className="mt-4">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
