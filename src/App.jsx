import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { ToastProvider } from "./components/Toast";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/auth/AuthPage";
import LandingPage from "./pages/LandingPage";
import UserManagement from "./pages/admin/UserManagement";
import Sidebar from "./components/Sidebar";
import TeamPage from "./pages/TeamPage";
import KanbanPage from "./pages/KanbanPage";
import TasksPage from "./pages/TasksPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import TaskDetailPage from "./pages/TaskDetailPage";

const DashboardRouter = () => {
  const { user, userRole, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  if (!user) return <Navigate to="/landing" />;

  if (userRole === "super_admin" || userRole === "admin") {
    return <Navigate to="/admin/board" />;
  }
  return <Navigate to="/user/kanban" />;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SidebarProvider>
          <Router>
            <Routes>
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<Navigate to="/auth" />} />
              <Route path="/signup" element={<Navigate to="/auth" />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={<DashboardRouter />} />
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
                  <ProtectedRoute
                    allowedRoles={["super_admin", "admin", "user"]}
                  >
                    <TeamPage />
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
                path="/admin/tasks"
                element={
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <TasksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/tasks"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <TasksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/task/:taskId"
                element={
                  <ProtectedRoute
                    allowedRoles={["super_admin", "admin", "user"]}
                  >
                    <TaskDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/approvals"
                element={
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <ApprovalsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/approvals"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <ApprovalsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </SidebarProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
