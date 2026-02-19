import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "../services/authService";
import { LogOut } from "lucide-react";
import logoFull from "../assets/Talentask_full_logoremovebgpreview.png";
import Modal from "../components/Modal";

const LandingLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const handleLogoutClick = () => setShowLogoutModal(true);

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200/80 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src={logoFull} alt="Talentask" className="h-28 w-auto" />
            </div>

            <div className="flex items-center space-x-6">
              {user ? (
                <div className="flex items-center gap-3">
                  {/* Greeting chip */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                    <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.displayName?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      {user.displayName}
                    </span>
                  </div>

                  {/* Dashboard button */}
                  <Link
                    to="/"
                    className="flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-blue-500 to-violet-600 text-white text-sm font-semibold rounded-lg hover:from-blue-600 hover:to-violet-700 transition-all duration-200 shadow-sm shadow-violet-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    Dashboard
                  </Link>

                  {/* Logout button */}
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/auth?mode=login"
                    className="px-4 py-2 text-sm font-medium text-violet-600 border border-violet-300 rounded-lg hover:bg-violet-50 hover:border-violet-500 hover:text-violet-700 transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    className="px-4 py-2 text-sm font-semibold bg-linear-to-r from-blue-500 to-violet-600 text-white rounded-lg hover:from-blue-600 hover:to-violet-700 transition-all duration-200 shadow-sm shadow-violet-200"
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
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title={
          <>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <LogOut size={20} className="text-red-500" />
            </div>
            <span className="text-gray-800 font-semibold text-lg">
              Konfirmasi Logout
            </span>
          </>
        }
        maxWidth="max-w-sm"
      >
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Apakah kamu yakin ingin keluar? Kamu perlu login kembali untuk
          mengakses dashboard.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowLogoutModal(false)}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Ya, Logout
          </button>
        </div>
      </Modal>
    </>
  );
};

export default LandingLayout;
