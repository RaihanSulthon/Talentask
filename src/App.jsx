import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./pages/user/UserDashboard";
import AuthPage from "./pages/auth/AuthPage";
import LandingPage from "./pages/LandingPage";

const DashboardRouter = () => {
  const { user, userRole, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/landing" />;

  if (userRole === "super_admin" || userRole === "admin") {
    return <Navigate to="/admin/dashboard" />;
  }
  return <Navigate to="/user/dashboard" />;
};
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<DashboardRouter />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
