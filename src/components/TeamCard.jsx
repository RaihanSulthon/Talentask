import { Users, Crown, UserPlus, Trash2 } from "lucide-react";

const TeamCard = ({ team, onAddMember, onDelete }) => {
  return (
    <div
      className={`p-6 rounded-2xl border transition-all duration-300 hover:transform hover:scale-[1.02] ${
        team.isOwner
          ? "bg-emerald-500/10 border-emerald-500/30"
          : "bg-slate-800/50 border-slate-700/50"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-white">{team.name}</h3>
        <div className="flex gap-2">
          {team.isOwner && (
            <>
              <button
                onClick={() => onAddMember(team)}
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
                title="Add Members"
              >
                <UserPlus size={18} />
              </button>
              <button
                onClick={() => onDelete(team.id)}
                className="text-red-400 hover:text-red-300 transition-colors"
                title="Delete Team"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
          {team.isOwner && <Crown size={18} className="text-yellow-400" />}
        </div>
      </div>
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <Users size={16} />
        <span>{team.members?.length || 0} members</span>
      </div>
    </div>
  );
};

export default TeamCard;