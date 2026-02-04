import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CheckSquare, FileCheck, UserCog } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const { userRole } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Board', path: '/admin/board' },
    { icon: Users, label: 'Team', path: '/admin/team' },
    { icon: CheckSquare, label: 'Tasks', path: '/admin/tasks' },
    { icon: FileCheck, label: 'Approvals', path: '/admin/approvals' },
  ];

  if (userRole === 'super_admin') {
    menuItems.push({ 
      icon: UserCog, 
      label: 'User Management', 
      path: '/admin/user-management' 
    });
  }

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-slate-800 border-r border-slate-700 transition-all duration-300 z-40 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-700">
          <div className="w-8 h-8 bg-linear-to-r from-emerald-500 to-teal-500 rounded-lg" />
          {isExpanded && (
            <span className="ml-3 text-white font-bold text-lg">TalenTask</span>
          )}
        </div>

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
                    ? 'bg-emerald-500/20 text-emerald-400 border-r-2 border-emerald-500'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
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
      </div>
    </div>
  );
};

export default Sidebar;