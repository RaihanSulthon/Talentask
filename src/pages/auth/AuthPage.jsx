import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import { signIn, signUp } from "../../services/authService";
import { useAuthForm } from "../../hooks/useAuthForm";

const AuthInput = ({
  type: initialType = "text",
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  success,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = initialType === "password";
  const type = isPassword ? (showPassword ? "text" : "password") : initialType;

  const borderClass = error
    ? "border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50"
    : success
      ? "border-green-400 focus:ring-green-400 focus:border-green-400 bg-green-50/30"
      : "border-slate-200 focus:ring-violet-500 focus:border-violet-500 bg-slate-50";

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">{label}</label>
      )}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={
            isPassword
              ? "current-password"
              : initialType === "email"
                ? "email"
                : "off"
          }
          className={`w-full px-4 py-3 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 text-sm pr-11 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${borderClass}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          ) : error ? (
            <AlertCircle size={16} className="text-red-400" />
          ) : success ? (
            <CheckCircle2 size={16} className="text-green-500" />
          ) : null}
        </div>
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle size={12} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const navigate = useNavigate();
  const {
    formData,
    fieldErrors,
    touched,
    loading,
    error,
    updateField,
    touchField,
    handleSubmit,
  } = useAuthForm();

  const onSubmit = async (data) => {
    if (isLogin) {
      await signIn(data.email, data.password);
      navigate("/landing");
    } else {
      await signUp(data.email, data.password, data.displayName);
      navigate("/");
    }
  };

  const isSuccess = (field) =>
    touched[field] && !fieldErrors[field] && !!formData[field];

  const switchMode = () => setIsLogin((v) => !v);

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
          handleSubmit(onSubmit, isLogin);
        }}
        className="space-y-4"
      >
        {/* Firebase / server error */}
        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!isLogin && (
          <AuthInput
            type="text"
            label="Full Name"
            placeholder="e.g. John Doe"
            value={formData.displayName || ""}
            onChange={(e) => updateField("displayName", e.target.value)}
            onBlur={() => touchField("displayName")}
            error={touched.displayName ? fieldErrors.displayName : ""}
            success={isSuccess("displayName")}
          />
        )}

        <AuthInput
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={formData.email || ""}
          onChange={(e) => updateField("email", e.target.value)}
          onBlur={() => touchField("email")}
          error={touched.email ? fieldErrors.email : ""}
          success={isSuccess("email")}
        />

        <AuthInput
          type="password"
          label="Password"
          placeholder={isLogin ? "Enter your password" : "Min. 6 characters"}
          value={formData.password || ""}
          onChange={(e) => updateField("password", e.target.value)}
          onBlur={() => touchField("password")}
          error={touched.password ? fieldErrors.password : ""}
          success={isSuccess("password")}
        />

        {!isLogin && (
          <AuthInput
            type="password"
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword || ""}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            onBlur={() => touchField("confirmPassword")}
            error={touched.confirmPassword ? fieldErrors.confirmPassword : ""}
            success={isSuccess("confirmPassword")}
          />
        )}

        {isLogin && (
          <div className="text-right -mt-1">
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
            onClick={switchMode}
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