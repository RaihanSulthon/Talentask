import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import { signIn, signUp } from "../../services/authService";
import { useAuthForm } from "../../hooks/useAuthForm";

const AuthInput = ({
  type: initialType = "text",
  placeholder,
  value,
  onChange,
  required,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = initialType === "password";
  const type = isPassword ? (showPassword ? "text" : "password") : initialType;

  return (
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={
          isPassword
            ? "current-password"
            : initialType === "email"
              ? "email"
              : "off"
        }
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 text-sm pr-11 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
};

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const navigate = useNavigate();
  const { formData, loading, error, updateField, handleSubmit } = useAuthForm();

  const onSubmit = async (data) => {
    if (isLogin) {
      await signIn(data.email, data.password);
      navigate("/landing");
    } else {
      if (data.password !== data.confirmPassword)
        throw new Error("Passwords don't match");
      await signUp(data.email, data.password, data.displayName);
      navigate("/");
    }
  };

  return (
    <AuthLayout
      title={isLogin ? "Welcome back" : "Create account"}
      subtitle={
        isLogin
          ? "Sign in to your TalenTask workspace"
          : "Start managing tasks smarter today"
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit);
        }}
        className="space-y-4"
      >
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
            <span className="mt-0.5">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {!isLogin && (
          <AuthInput
            type="text"
            placeholder="Full Name"
            value={formData.displayName || ""}
            onChange={(e) => updateField("displayName", e.target.value)}
            required
          />
        )}

        <AuthInput
          type="email"
          placeholder="Email address"
          value={formData.email || ""}
          onChange={(e) => updateField("email", e.target.value)}
          required
        />

        <AuthInput
          type="password"
          placeholder="Password"
          value={formData.password || ""}
          onChange={(e) => updateField("password", e.target.value)}
          required
        />

        {!isLogin && (
          <AuthInput
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword || ""}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            required
          />
        )}

        {isLogin && (
          <div className="text-right">
            <button
              type="button"
              className="text-xs text-violet-600 hover:text-violet-700 transition-colors font-medium"
            >
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 flex items-center justify-center gap-2 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white py-3 rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] transition-all duration-200 shadow-lg shadow-violet-200"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading
            ? isLogin
              ? "Signing in..."
              : "Creating account..."
            : isLogin
              ? "Sign In"
              : "Create Account"}
        </button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-slate-400 text-xs">or</span>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-violet-600 hover:text-violet-700 font-semibold transition-colors"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </form>
    </AuthLayout>
  );
};

export default AuthPage;
