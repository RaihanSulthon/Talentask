import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Users } from "lucide-react";

const TeamFilterDropdown = ({ teams, selectedTeam, onSelectTeam }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedTeamData = teams.find((t) => t.id === selectedTeam);
  const displayText = selectedTeamData?.name || "All Teams";

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
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-3 rounded-lg border font-medium text-sm transition-all duration-200 min-w-36 justify-between ${
          isOpen
            ? "bg-violet-50 border-violet-500 text-gray-800"
            : "bg-white border-gray-200 text-gray-700 hover:border-violet-300"
        }`}
      >
        <div className="flex items-center gap-2">
          {selectedTeamData ? (
            <span className="w-6 h-6 rounded bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {selectedTeamData.name.substring(0, 2).toUpperCase()}
            </span>
          ) : (
            <Users size={16} className="text-gray-400 shrink-0" />
          )}
          <span className="truncate max-w-28">{displayText}</span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl shadow-gray-200/80 z-50 overflow-hidden">
          {/* Header label */}
          <div className="px-4 py-2 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Filter by Team
            </span>
          </div>

          {/* All Teams */}
          <button
            onClick={() => handleSelect("")}
            className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left ${
              !selectedTeam
                ? "bg-emerald-500/15 text-emerald-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                !selectedTeam ? "bg-emerald-500/20" : "bg-gray-200"
              }`}
            >
              <Users
                size={15}
                className={!selectedTeam ? "text-emerald-400" : "text-gray-400"}
              />
            </div>
            <span className="flex-1 font-medium text-sm">All Teams</span>
            {!selectedTeam && (
              <Check size={15} className="text-emerald-400 shrink-0" />
            )}
          </button>

          {/* Divider */}
          {teams.length > 0 && <div className="h-px bg-gray-200 mx-3" />}

          {/* Team list */}
          <div className="max-h-64 overflow-y-auto">
            {teams.map((team) => {
              const isSelected = selectedTeam === team.id;
              return (
                <button
                  key={team.id}
                  onClick={() => handleSelect(team.id)}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left ${
                    isSelected
                      ? "bg-emerald-500/15 text-emerald-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {team.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {team.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {team.members?.length || 0} member
                      {team.members?.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  {isSelected && (
                    <Check size={15} className="text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamFilterDropdown;
