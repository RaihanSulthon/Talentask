import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "../services/authService";
import logoFull from "../assets/Talentask_full_logoremovebgpreview.png";

const LandingLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="min-h-screen bg-slate-900" />;
  }

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/landing";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src={logoFull} alt="Talentask" className="h-28 w-auto" />
          </div>

          <div className="flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/"
                  className="text-violet-600 hover:text-violet-700 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <span className="text-gray-500">Hi, {user.displayName}</span>
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
                  to="/auth?mode=login"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="bg-linear-to-r from-blue-500 to-violet-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-violet-700 transition-all duration-200"
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
