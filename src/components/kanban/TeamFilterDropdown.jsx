import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Users } from "lucide-react";

const TeamFilterDropdown = ({ teams, selectedTeam, onSelectTeam }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedTeamData = teams.find((t) => t.id === selectedTeam);
  const displayText = selectedTeamData?.name || "All Teams";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (teamId) => {
    onSelectTeam(teamId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 rounded-xl text-white font-medium transition-all duration-200 min-w-50 group"
      >
        <div className="flex items-center gap-2 flex-1">
          <div className="w-2 h-2 bg-emerald-500 rounded-full group-hover:scale-110 transition-transform" />
          <span>{displayText}</span>
        </div>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-70 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/20 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* All Teams Option */}
          <button
            onClick={() => handleSelect("")}
            className={`w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/70 transition-colors ${
              !selectedTeam ? "bg-emerald-500/10" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  !selectedTeam
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-slate-700 text-slate-400"
                }`}
              >
                <Users size={16} />
              </div>
              <span className={`font-medium ${!selectedTeam ? "text-emerald-400" : "text-white"}`}>
                All Teams
              </span>
            </div>
            {!selectedTeam && <Check size={18} className="text-emerald-400" />}
          </button>

          {/* Divider */}
          <div className="h-px bg-slate-700 my-1" />

          {/* Team Options */}
          <div className="max-h-75 overflow-y-auto">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => handleSelect(team.id)}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/70 transition-colors ${
                  selectedTeam === team.id ? "bg-emerald-500/10" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      selectedTeam === team.id
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {team.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className={`font-medium ${selectedTeam === team.id ? "text-emerald-400" : "text-white"}`}>
                      {team.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {team.members?.length || 0} members
                    </div>
                  </div>
                </div>
                {selectedTeam === team.id && (
                  <Check size={18} className="text-emerald-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamFilterDropdown;