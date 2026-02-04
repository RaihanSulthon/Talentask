import Sidebar from "../components/Sidebar";

const DashboardLayout = ({ children, title, subtitle, actions }) => {
  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar />
      <div className="flex-1 ml-20 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
          {subtitle && <p className="text-slate-400">{subtitle}</p>}
          {actions && <div className="mt-4">{actions}</div>}
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;