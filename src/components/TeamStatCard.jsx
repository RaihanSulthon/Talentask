const TeamStatCard = ({ icon: Icon, value, label, gradient }) => {
  return (
    <div className="p-6 bg-slate-800 rounded-xl">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 ${gradient} rounded-lg flex items-center justify-center`}
        >
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <div className="text-3xl font-bold text-white">{value}</div>
          <div className="text-slate-400 text-sm">{label}</div>
        </div>
      </div>
    </div>
  );
};

export default TeamStatCard;