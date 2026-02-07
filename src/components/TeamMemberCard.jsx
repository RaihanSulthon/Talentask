import { Trash2 } from "lucide-react";

// Add showTeamName prop
const TeamMemberCard = ({ member, team, onRemove, showTeamName = false }) => {
  const isOwner = member.uid === team.ownerId;
  const canRemove = team.isOwner && !isOwner;

  return (
    <div className="p-6 bg-slate-800 rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
            {member.displayName?.substring(0, 2).toUpperCase() || "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold">{member.displayName}</h3>
              {isOwner && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-medium">
                  Owner
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm">{member.email}</p>
            {showTeamName && (
              <p className="text-slate-500 text-xs mt-1">
                <span className="text-slate-600 font-medium">Team:</span>{" "}
                {team?.name}
              </p>
            )}
          </div>
        </div>
        {canRemove && (
          <button
            onClick={() => onRemove(team.id, member.uid)}
            className="text-red-400 hover:text-red-300 transition-colors"
            title="Remove member"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default TeamMemberCard;
