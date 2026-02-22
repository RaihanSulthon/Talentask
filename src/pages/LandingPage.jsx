import LandingLayout from "../layouts/LandingLayout";
import HeroSection from "../components/HeroSection";
import Card from "../components/Card";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: "📋",
      title: "Kanban Task Management",
      description:
        "Organize internship tasks with intuitive Kanban boards. Track progress, assign tickets, and manage workflows like a pro with our Jira-inspired interface.",
      gradient: "bg-gradient-to-r from-blue-500 to-cyan-500",
    },
    {
      icon: "📚",
      title: "Document Repository",
      description:
        "Centralized hub for all your important documents and links. Keep resources organized and easily accessible for both mentors and interns.",
      gradient: "bg-gradient-to-r from-violet-500 to-blue-500",
    },
    {
      icon: "⚡",
      title: "Streamlined Communication",
      description:
        "Efficient communication tools that save time and reduce friction between mentors and mentees. Focus on what matters most — learning and growth.",
      gradient: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      icon: "🎯",
      title: "Goal-Oriented Workflow",
      description:
        "Designed specifically for internship programs. Every feature is crafted to enhance the mentor-intern relationship and accelerate professional development.",
      gradient: "bg-gradient-to-r from-orange-500 to-red-500",
    },
  ];

  const stats = [
    { value: "500+", label: "Companies Onboarded" },
    { value: "12K+", label: "Interns Managed" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "3x", label: "Faster Onboarding" },
  ];

  const steps = [
    {
      step: "01",
      title: "Create Your Workspace",
      description:
        "Sign up and set up your company workspace in minutes. Invite your team, define roles, and configure your internship program structure.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      step: "02",
      title: "Invite Mentors & Interns",
      description:
        "Add team members with role-based access. Mentors get oversight tools, interns get a clear view of their tasks and goals.",
      color: "from-violet-500 to-blue-500",
    },
    {
      step: "03",
      title: "Manage Tasks on Kanban",
      description:
        "Create, assign, and track tasks on visual Kanban boards. Move tickets through stages and never lose track of progress.",
      color: "from-purple-500 to-pink-500",
    },
    {
      step: "04",
      title: "Track & Improve",
      description:
        "Review task completion, approve submissions, and continuously improve your internship program based on real data.",
      color: "from-orange-500 to-red-500",
    },
  ];

  const testimonials = [
    {
      name: "Rina Kusuma",
      role: "HR Manager · Tokopedia",
      avatar: "RK",
      color: "from-blue-500 to-cyan-500",
      text: "TalenTask transformed how we handle 50+ interns per batch. The Kanban view gives us instant clarity on where everyone is.",
    },
    {
      name: "Budi Santoso",
      role: "Tech Lead · Gojek",
      avatar: "BS",
      color: "from-violet-500 to-purple-600",
      text: "Finally a tool built for internship management. The document repo alone saved us hours of back-and-forth every week.",
    },
    {
      name: "Mega Putri",
      role: "Intern Supervisor · Traveloka",
      avatar: "MP",
      color: "from-pink-500 to-rose-500",
      text: "Onboarding interns used to take days. With TalenTask, they're productive from day one. The interface is intuitive and clean.",
    },
  ];

  const benefits = [
    {
      icon: "🔒",
      title: "Role-Based Access Control",
      description:
        "Super Admins, Admins, and Interns each see exactly what they need. No information overload.",
    },
    {
      icon: "📊",
      title: "Approval Workflows",
      description:
        "Structured task submission and approval process keeps quality high and accountability clear.",
    },
    {
      icon: "🔔",
      title: "Real-Time Notifications",
      description:
        "Never miss an update. Instant notifications for task assignments, approvals, and comments.",
    },
    {
      icon: "📁",
      title: "Centralized Resources",
      description:
        "All docs, links, and references in one place. No more digging through emails or chats.",
    },
    {
      icon: "🤝",
      title: "Mentor-Intern Pairing",
      description:
        "Smart team structures that pair interns with mentors and track progress transparently.",
    },
    {
      icon: "📱",
      title: "Works Everywhere",
      description:
        "Fully responsive design. Manage internships from desktop, tablet, or mobile seamlessly.",
    },
  ];

  return (
    <LandingLayout>
      <HeroSection />

      {/* Stats Section */}
      <section className="py-10 lg:py-12 xl:py-14 px-6 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 text-center">
          {stats.map((stat, i) => (
            <div key={i}>
              <div className="text-3xl lg:text-4xl font-extrabold bg-linear-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-gray-500 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-14 lg:py-16 xl:py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 lg:mb-14 xl:mb-16">
            <span className="inline-block px-4 py-1.5 bg-violet-100 text-violet-700 text-sm font-semibold rounded-full mb-4">
              Platform Features
            </span>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 lg:mb-6">
              Everything You Need in One Platform
            </h2>
            <p className="text-base lg:text-lg xl:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
              Built specifically for internship programs, TalenTask provides the
              tools that mentors and interns need to succeed together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 xl:gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative p-6 lg:p-7 xl:p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
              >
                <div
                  className={`absolute inset-0 ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}
                />
                <div className="relative">
                  <div
                    className={`w-12 h-12 ${feature.gradient} rounded-xl flex items-center justify-center mb-6`}
                  >
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-base lg:text-lg xl:text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-14 lg:py-16 xl:py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 lg:mb-14 xl:mb-16">
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
              How It Works
            </span>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 lg:mb-6">
              Up & Running in 4 Simple Steps
            </h2>
            <p className="text-base lg:text-lg xl:text-xl text-gray-500 max-w-2xl mx-auto">
              From setup to fully productive — get your entire internship
              program organized fast.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-linear-to-r from-blue-200 via-violet-200 to-pink-200" />

            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div
                  className={`w-16 h-16 lg:w-18 lg:h-18 xl:w-20 xl:h-20 mx-auto rounded-2xl bg-linear-to-r ${step.color} flex items-center justify-center mb-4 lg:mb-6 shadow-lg`}
                >
                  <span className="text-white text-xl lg:text-2xl font-extrabold">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid Section */}
      <section className="py-14 lg:py-16 xl:py-20 px-6 bg-linear-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 lg:mb-14 xl:mb-16">
            <span className="inline-block px-4 py-1.5 bg-white/10 text-white/80 text-sm font-semibold rounded-full mb-4">
              Why TalenTask
            </span>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 lg:mb-6">
              Built for the Modern Internship
            </h2>
            <p className="text-base lg:text-lg xl:text-xl text-white/60 max-w-2xl mx-auto">
              Every feature was designed around one question: what do mentors
              and interns actually need?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-6 lg:p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors duration-200"
              >
                <div className="w-11 h-11 shrink-0 bg-white/10 rounded-xl flex items-center justify-center text-2xl">
                  {b.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{b.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-14 lg:py-16 xl:py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 lg:mb-14 xl:mb-16">
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-full mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 lg:mb-6">
              Trusted by Teams Across Indonesia
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 xl:gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white p-5 lg:p-6 xl:p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <svg
                      key={s}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full bg-linear-to-r ${t.color} flex items-center justify-center text-white text-sm font-bold`}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {t.name}
                    </div>
                    <div className="text-gray-400 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 lg:py-16 xl:py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-8 lg:p-10 xl:p-12 bg-linear-to-r from-blue-600 to-violet-600 rounded-3xl relative overflow-hidden">
            {/* Subtle pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="relative">
              <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Internship Program?
              </h2>
              <p className="text-base lg:text-lg xl:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join hundreds of companies already using TalenTask to create
                exceptional internship experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to={user ? "/" : "/auth?mode=signup"}
                  className="inline-block px-8 py-4 bg-white text-violet-700 font-semibold rounded-xl hover:bg-gray-50 shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {user ? "Go to Dashboard" : "Get Started Free"}
                </Link>
                {!user && (
                  <Link
                    to="/auth?mode=login"
                    className="inline-block px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-7 lg:py-8 xl:py-10 px-6 bg-slate-900 text-center">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} TalenTask · Built for modern internship
          management
        </p>
      </footer>
    </LandingLayout>
  );
};

export default LandingPage;
