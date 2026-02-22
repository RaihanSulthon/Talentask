import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Zap, Shield } from "lucide-react";
import logoFull from "../assets/Talentask_full_logoremovebgpreview.png";

const FEATURES = [
  { icon: Zap, text: "Manage tasks efficiently with smart workflows" },
  { icon: Shield, text: "Secure and private team collaboration" },
  { icon: CheckCircle2, text: "Track approvals and progress in real-time" },
];

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-1/2 relative flex-col justify-center p-8 lg:p-10 xl:p-12 overflow-hidden bg-linear-to-br from-violet-700 via-purple-700 to-indigo-800">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Logo — absolute, tidak mendorong konten */}
        <div className="absolute top-8 left-1 z-20">
          <img
            src={logoFull}
            alt="TalenTask"
            className="h-28 lg:h-32 xl:h-40 w-auto brightness-0 invert"
          />
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white leading-tight mb-3">
              The smarter way to
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-300 to-violet-300">
                manage your team
              </span>
            </h2>
            <p className="text-white/60 text-sm lg:text-base xl:text-lg">
              TalenTask brings your tasks, approvals, and team together in one
              beautiful workspace.
            </p>
          </div>

          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="shrink-0 w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <Icon size={18} className="text-purple-300" />
                </span>
                <span className="text-white/80 text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Copyright — absolute di bawah */}
        <div className="absolute bottom-8 left-12 z-20">
          <p className="text-white/40 text-xs">
            &copy; {new Date().getFullYear()} TalenTask. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col min-h-screen bg-white relative">
        {/* Back button */}
        <div className="absolute top-16 lg:top-20 xl:top-24 left-8 lg:left-10 xl:left-12 z-20">
          <Link
            to="/landing"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all duration-200 group text-sm font-medium"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform duration-200"
            />
            Back to Home
          </Link>
        </div>

        {/* Mobile logo — absolute, tidak mendorong form */}
        <div className="lg:hidden absolute top-16 left-1/2 -translate-x-1/2 z-20">
          <img src={logoFull} alt="TalenTask" className="h-40 w-auto" />
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 pb-8 lg:pb-10 xl:pb-12">
          <div className="w-full max-w-sm">
            <div className="mb-5 lg:mb-7 xl:mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
                {title}
              </h1>
              <p className="text-slate-500">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
