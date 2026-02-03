import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from '../services/authService';

const LandingLayout = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-linear-to-r from-emerald-500 to-teal-500 rounded-lg"></div>
            <span className="text-xl font-bold text-white">TalenTask</span>
          </div>
          
          <div className="flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/"
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <span className="text-slate-400">Hi, {user.displayName}</span>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/auth"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/auth"
                  className="bg-linear-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      {children}
    </div>
  );
};

export default LandingLayout;