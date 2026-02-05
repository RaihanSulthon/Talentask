import { X } from "lucide-react";

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
  if (!isOpen || !selectedTeam) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Add Team Member</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-slate-400 mb-4">
            Select members to add to{" "}
            <span className="text-white font-semibold">
              {selectedTeam.name}
            </span>
          </p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableUsers.length > 0 ? (
              availableUsers.map((user) => (
                <div
                  key={user.uid}
                  onClick={() => onToggleMember(user.uid)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedMembers.includes(user.uid)
                      ? "bg-emerald-500/20 border-emerald-500"
                      : "bg-slate-700 border-slate-600 hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.displayName?.substring(0, 2).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-white font-medium">
                          {user.displayName}
                        </div>
                        {user.role === "admin" && (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-sm">{user.email}</div>
                    </div>
                    {selectedMembers.includes(user.uid) && (
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
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
                No available users to add
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onAddMembers}
          disabled={selectedMembers.length === 0 || loading}
          className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Adding..."
            : `Add ${selectedMembers.length} Member${selectedMembers.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
};

export default AddMemberModal;
