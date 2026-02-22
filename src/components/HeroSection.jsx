import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const HeroSection = () => {
  const { user } = useAuth();

  // Background pattern SVG
  const bgPattern = `data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M50 50L60 40L70 50L60 60z'/%3E%3C/g%3E%3C/svg%3E`;

  return (
    <section className="relative pt-24 lg:pt-28 xl:pt-32 pb-14 lg:pb-16 xl:pb-20 px-6 overflow-hidden">
      {" "}
      {/* Gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-violet-50 to-white" />
      {/* Pattern background */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url(${bgPattern})`,
        }}
      />
      {/* Content */}
      <div className="relative max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center px-4 py-2 bg-violet-100 border border-violet-200 rounded-full text-violet-700 text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-violet-500 rounded-full mr-2 animate-pulse"></span>
          Streamline Your Internship Management
        </div>

        <h1 className="text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-gray-900 mb-5 lg:mb-6 tracking-tight">
          {" "}
          Bridge the Gap Between
          <span className="block bg-linear-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent">
            Mentors & Interns
          </span>
        </h1>

        <p className="text-base lg:text-lg xl:text-xl text-gray-600 mb-8 lg:mb-10 xl:mb-12 max-w-3xl mx-auto leading-relaxed">
          TalenTask revolutionizes internship management with powerful Kanban
          boards, centralized document repositories, and seamless communication
          tools designed for the modern workplace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Link
              to="/"
              className="px-8 py-4 bg-linear-to-r from-blue-500 to-violet-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-violet-700 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-violet-500/25"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth?mode=signup"
                className="px-8 py-4 bg-linear-to-r from-blue-500 to-violet-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-violet-700 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-violet-500/25"
              >
                Start Free Today
              </Link>

              <Link
                to="/auth?mode=login"
                className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-violet-400 hover:text-violet-700 transition-all duration-200"
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
