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
    <div className="flex min-h-screen bg-[#F4F5F7]">
      <Navbar />
      <Sidebar
        isExpanded={isExpanded}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onAfterNavigate={handleAfterNavigate}
      />

      {/* Main content area */}
      <div
        className={`
          flex-1
          min-h-screen
          pt-16
          transition-all duration-300
          ${isExpanded ? "lg:ml-56 xl:ml-64" : "lg:ml-16 xl:ml-20"}
          ml-16
        `}
      >
        {/* Page header strip */}
        <div className="bg-linear-to-r from-white via-white to-violet-50/40 border-b border-gray-200/80 px-6 lg:px-8 xl:px-10 py-5 lg:py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="shrink-0 flex items-center gap-3 mt-0.5">
                {actions}
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className="p-6 lg:p-8 xl:p-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;