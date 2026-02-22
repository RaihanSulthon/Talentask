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
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar
        isExpanded={isExpanded}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onAfterNavigate={handleAfterNavigate}
      />
      <div
        className={`flex-1 p-4 lg:p-6 xl:p-8 pt-20 lg:pt-22 xl:pt-24 transition-all duration-300 ${isExpanded ? "lg:ml-56 xl:ml-64" : "lg:ml-16 xl:ml-20"} ml-16`}
      >
        <div className="mb-5 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          {subtitle && <p className="text-gray-500">{subtitle}</p>}
          {actions && <div className="mt-4">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
