import Sidebar from "../components/Sidebar";
import { useState } from "react";
import Navbar from "../components/Navbar";

const DashboardLayout = ({ children, title, subtitle, actions }) => {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isPinned || isHovered;

  const handleNavigate = () => {
    // Delay collapse agar animasi sidebar sempat terlihat
    setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Navbar
        isPinned={isPinned}
        onToggleSidebar={() => setIsPinned((prev) => !prev)}
      />
      <Sidebar
        isExpanded={isExpanded}
        isPinned={isPinned}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onNavigate={handleNavigate}
      />
      <div
        className={`flex-1 p-8 pt-24 transition-all duration-300 ${
          isPinned ? "ml-64" : "ml-20"
        }`}>
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