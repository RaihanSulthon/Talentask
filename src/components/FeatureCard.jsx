const FeatureCard = ({ icon, title, description, gradient }) => {
  return (
    <div className="group relative p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:transform hover:scale-[1.02]">
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
      
      <div className="relative">
        <div className={`w-12 h-12 ${gradient} rounded-xl flex items-center justify-center mb-6`}>
          <span className="text-2xl">{icon}</span>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;