import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import { signUp } from '../../services/authService';
import { useAuthForm } from '../../hooks/useAuthForm';

const SignupPage = () => {
  const navigate = useNavigate();
  const { formData, loading, error, updateField, handleSubmit } = useAuthForm();

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      throw new Error("Passwords don't match");
    }
    
    await signUp(data.email, data.password, data.displayName);
    navigate('/');
  };

  return (
    <AuthLayout 
      title="Join TalenTask" 
      subtitle="Create your account to get started"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit); }}>
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={formData.displayName || ''}
              onChange={(e) => updateField('displayName', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
          
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={formData.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password"
              value={formData.password || ''}
              onChange={(e) => updateField('password', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword || ''}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-linear-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <div className="mt-6 text-center">
          <Link 
            to="/login" 
            className="text-white/70 hover:text-white transition-colors duration-200"
          >
            Already have an account? <span className="text-purple-300 font-semibold">Sign in</span>
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;