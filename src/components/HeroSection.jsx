import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const HeroSection = () => {
  const { user } = useAuth();

  // Background pattern SVG
  const bgPattern = `data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M50 50L60 40L70 50L60 60z'/%3E%3C/g%3E%3C/svg%3E`;

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-emerald-900/20 via-teal-900/20 to-slate-900/20" />

      {/* Pattern background */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url(${bgPattern})`,
        }}
      />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
          Streamline Your Internship Management
        </div>

        <h1 className="text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
          Bridge the Gap Between
          <span className="block bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Mentors & Interns
          </span>
        </h1>

        <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          TalenTask revolutionizes internship management with powerful Kanban
          boards, centralized document repositories, and seamless communication
          tools designed for the modern workplace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Link
              to="/"
              className="px-8 py-4 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-emerald-500/25"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/signup"
                className="px-8 py-4 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-emerald-500/25"
              >
                Start Free Today
              </Link>

              <Link
                to="/login"
                className="px-8 py-4 border border-slate-600 text-slate-300 rounded-xl font-semibold hover:border-slate-500 hover:text-white transition-all duration-200"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
