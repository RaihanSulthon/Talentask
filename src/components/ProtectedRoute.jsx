import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, userRole, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;