import LandingLayout from "../layouts/LandingLayout";
import HeroSection from "../components/HeroSection";
import Card from "../components/Card";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const LandingPage = () => {
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
      gradient: "bg-gradient-to-r from-emerald-500 to-teal-500",
    },
    {
      icon: "⚡",
      title: "Streamlined Communication",
      description:
        "Efficient communication tools that save time and reduce friction between mentors and mentees. Focus on what matters most - learning and growth.",
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

  const { user } = useAuth();

  return (
    <LandingLayout>
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Built specifically for internship programs, TalenTask provides the
              tools that mentors and interns need to succeed together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:transform hover:scale-[1.02]"
              >
                <div
                  className={`absolute inset-0 ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}
                ></div>
                <div className="relative">
                  <div
                    className={`w-12 h-12 ${feature.gradient} rounded-xl flex items-center justify-center mb-6`}
                  >
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-linear-to-r from-emerald-900/30 to-teal-900/30 rounded-3xl border border-emerald-500/20">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Internship Program?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join hundreds of companies already using TalenTask to create
              exceptional internship experiences.
            </p>
            <Link
              to={user ? "/" : "/auth"}
              className="px-8 py-4 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-emerald-500/25"
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default LandingPage;
