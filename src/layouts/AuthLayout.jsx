import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logoFull from "../assets/Talentask_full_logoremovebgpreview.png";

const AuthLayout = ({ children, title, subtitle }) => {
  const bgPattern = `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-600 via-violet-600 to-purple-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${bgPattern})`,
        }}
      />

      {/* Back Button */}
      <Link
        to="/landing"
        className="absolute top-6 left-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors group z-10"
      >
        <ArrowLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span>Back to Home</span>
      </Link>

      {/* Card */}
      <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md border border-white/20 shadow-2xl z-10">
        <div className="text-center mb-8">
          <img
            src={logoFull}
            alt="Talentask"
            className="h-10 w-auto mx-auto mb-4 brightness-0 invert"
          />
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-white/70">{subtitle}</p>
        </div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>

          <p className="text-white/70">{subtitle}</p>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
