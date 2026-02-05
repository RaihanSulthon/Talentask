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
import UserManagement from "./pages/admin/UserManagement";
import Sidebar from "./components/Sidebar";
import TeamPage from "./pages/TeamPage";
import KanbanPage from "./pages/KanbanPage";

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
          <Route path="/login" element={<Navigate to="/auth" />} />
          <Route path="/signup" element={<Navigate to="/auth" />} />
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
            path="/admin/user-management"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/board"
            element={
              <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                <KanbanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team"
            element={
              <ProtectedRoute allowedRoles={["super_admin", "admin", "user"]}>
                <TeamPage />
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
          <Route
            path="/user/kanban"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <KanbanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/tasks"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <div className="flex min-h-screen bg-slate-900">
                  <Sidebar />
                  <div className="flex-1 ml-20 p-8">
                    <h1 className="text-2xl font-bold text-white">
                      Tasks (Coming Soon)
                    </h1>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/approvals"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <div className="flex min-h-screen bg-slate-900">
                  <Sidebar />
                  <div className="flex-1 ml-20 p-8">
                    <h1 className="text-2xl font-bold text-white">
                      Approvals (Coming Soon)
                    </h1>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
