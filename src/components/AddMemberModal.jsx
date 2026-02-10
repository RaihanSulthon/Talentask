import { useState } from "react";
import { X, Search } from "lucide-react";

const AddMemberModal = ({
  isOpen,
  onClose,
  selectedTeam,
  availableUsers,
  selectedMembers,
  onToggleMember,
  onAddMembers,
  loading,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen || !selectedTeam) return null;

  const filteredUsers = availableUsers.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.displayName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto"
      onClick={onClose}>
      <div
        className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full mx-4 my-8 flex flex-col"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Add Team Member</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex flex-col">
          <p className="text-slate-400 mb-4">
            Select members to add to{" "}
            <span className="text-white font-semibold">
              {selectedTeam.name}
            </span>
          </p>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* User List with Virtual Scroll */}
          <div
            className="space-y-2 mb-6 overflow-y-auto pr-2 max-h-60 min-h-60
           [&::-webkit-scrollbar]:w-2
           [&::-webkit-scrollbar-track]:bg-slate-800/50
           [&::-webkit-scrollbar-track]:rounded-lg
           [&::-webkit-scrollbar-thumb]:bg-slate-600
           [&::-webkit-scrollbar-thumb]:rounded-lg
           [&::-webkit-scrollbar-thumb]:hover:bg-slate-500
           scrollbar-thin">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.uid}
                  onClick={() => onToggleMember(user.uid)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedMembers.includes(user.uid)
                      ? "bg-emerald-500/20 border-emerald-500"
                      : "bg-slate-700 border-slate-600 hover:border-slate-500"
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.displayName?.substring(0, 2).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">
                        {user.displayName}
                      </div>
                      <div className="text-slate-400 text-sm">{user.email}</div>
                    </div>
                    {selectedMembers.includes(user.uid) && (
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-8">
                {searchQuery
                  ? "No users found matching your search"
                  : "No available users to add"}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onAddMembers}
          disabled={selectedMembers.length === 0 || loading}
          className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {loading
            ? "Adding..."
            : `Add ${selectedMembers.length} Member${selectedMembers.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
};

export default AddMemberModal;
