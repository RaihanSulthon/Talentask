import { useAuth } from "../../contexts/AuthContext";
import { signOut } from "../../services/authService";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

const handleLogout = async () => {
  try {
    await signOut();
    navigate('/');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ini halaman dashboard user</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Welcome, {user?.displayName}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
