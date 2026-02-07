import { X, AlertTriangle } from "lucide-react";

const DemoteAdminModal = ({ isOpen, onClose, onConfirm, userName, teamCount, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-400" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white">Confirm Demotion</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6 space-y-4">
          <p className="text-slate-300">
            Are you sure you want to demote{" "}
            <span className="font-semibold text-white">{userName}</span> to a regular user?
          </p>
          
          {teamCount > 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm font-medium">
                ⚠️ Warning: This action will delete:
              </p>
              <ul className="mt-2 text-red-200 text-sm list-disc list-inside space-y-1">
                <li>{teamCount} team{teamCount > 1 ? 's' : ''} owned by this admin</li>
                <li>All tasks associated with {teamCount > 1 ? 'these teams' : 'this team'}</li>
              </ul>
            </div>
          )}

          <p className="text-slate-400 text-sm">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Confirm Demotion"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoteAdminModal;