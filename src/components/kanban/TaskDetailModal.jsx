import { useState, useEffect } from "react";
import { X, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import CustomSelect from "../CustomSelect";

const TaskDetailModal = ({
  task,
  teams,
  onClose,
  onUpdate,
  onDelete,
  canEdit,
  loading,
  initialEditMode = false,
}) => {
  const { userRole } = useAuth();
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const isAdmin = userRole === "super_admin" || userRole === "admin";
  const isUser = userRole === "user";
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    status: task.status,
    assignedTo: task.assignedTo || [],
  });

  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const currentTeam = teams.find((t) => t.id === task.teamId);

  const statusOptions = [
    { value: "todo", label: "To Do" },
    { value: "inprogress", label: "In Progress" },
    { value: "inreview", label: "In Review" },
    { value: "done", label: "Done" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(task.id, formData);
    setIsEditing(false);
  };

  const toggleAssignee = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(memberId)
        ? prev.assignedTo.filter((id) => id !== memberId)
        : [...prev.assignedTo, memberId],
    }));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString("en-GB");
  };

  const statusSelectOptions = statusOptions.map((opt) => ({
    value: opt.value,
    label: opt.label,
    icon:
      opt.value === "todo"
        ? "⏸"
        : opt.value === "inprogress"
          ? "⏱"
          : opt.value === "inreview"
            ? "👁"
            : "✅",
  }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Task Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {isEditing && isAdmin ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div> */}
            <CustomSelect
              options={statusSelectOptions}
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value })}
              label="Status"
            />

            {/* Approval Status - untuk task yang in review */}
            {task.status === "inreview" && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-sm font-medium flex items-center gap-2">
                  <Clock size={16} />
                  {isAdmin
                    ? "This task is awaiting your approval"
                    : "This task is awaiting approval from the team owner"}
                </p>
              </div>
            )}

            {isAdmin && currentTeam && currentTeam.members && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Assigned To
                </label>

                {/* Assigned Members Chips */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.assignedTo.map((memberId) => {
                    const member = currentTeam.members.find(
                      (m) => m.uid === memberId || m.id === memberId,
                    );
                    return member ? (
                      <div
                        key={memberId}
                        className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">
                        <span className="text-sm font-medium">
                          {member.displayName}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleAssignee(memberId)}
                          className="text-emerald-300 hover:text-emerald-100 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>

                {/* Add Member Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                    className="w-full px-4 py-3 bg-slate-700 text-slate-400 rounded-lg border border-slate-600 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left transition-colors">
                    Add team member...
                  </button>

                  {showAssignDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-slate-700 rounded-lg border border-slate-600 shadow-xl max-h-60 overflow-y-auto">
                      {currentTeam.members
                        .filter(
                          (m) => m.role !== "admin" && m.role !== "super_admin",
                        )
                        .filter(
                          (m) => !formData.assignedTo.includes(m.uid || m.id),
                        )
                        .map((member) => {
                          const isAssigned = formData.assignedTo.includes(
                            member.uid || member.id,
                          );
                          return (
                            <button
                              key={member.uid || member.id}
                              type="button"
                              onClick={() => {
                                toggleAssignee(member.uid || member.id);
                                setShowAssignDropdown(false);
                              }}
                              className="w-full px-4 py-3 text-left transition-colors hover:bg-slate-600 text-white">
                              <div className="font-medium">
                                {member.displayName}
                              </div>
                              <div className="text-sm text-slate-400">
                                {member.email}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors">
                {loading ? "Saving..." : "Save Details"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                TITLE
              </label>
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-white">{task.title}</p>
                {isAdmin && canEdit && (
                  <button
                    onClick={() => isAdmin && setIsEditing(true)}
                    className="text-slate-400 hover:text-emerald-400">
                    <Edit2 size={18} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                DESCRIPTION
              </label>
              <p className="text-white">{task.description}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                TEAM
              </label>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <p className="text-white font-medium">
                  {task.teamName || currentTeam?.name || "Unknown Team"}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                STATUS
              </label>
              {isUser ? (
                <CustomSelect
                  options={statusSelectOptions.filter(
                    (opt) => opt.value !== "done", // User tidak bisa langsung set ke Done
                  )}
                  value={formData.status}
                  onChange={(value) => {
                    if (value === "inreview") {
                      if (
                        !window.confirm(
                          "Submit this task for approval? Your team owner will review it.",
                        )
                      ) {
                        return;
                      }
                    }
                    setFormData({ ...formData, status: value });
                    onUpdate(task.id, { status: value });
                  }}
                />
              ) : (
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    task.status === "todo"
                      ? "bg-slate-700 text-slate-300"
                      : task.status === "inprogress"
                        ? "bg-blue-500/20 text-blue-300"
                        : task.status === "inreview"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-emerald-500/20 text-emerald-300"
                  }`}>
                  {statusOptions.find((s) => s.value === task.status)?.label}
                </span>
              )}
            </div>

            {currentTeam && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  ASSIGNED TO
                </label>
                <div className="flex flex-wrap gap-2">
                  {task.assignedTo?.map((memberId) => {
                    const member = currentTeam.members?.find(
                      (m) => m.uid === memberId || m.id === memberId,
                    );
                    return member ? (
                      <span
                        key={memberId}
                        className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">
                        {member.displayName}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  CREATED
                </label>
                <p className="text-white">{formatDate(task.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  LAST UPDATED
                </label>
                <p className="text-white">{formatDate(task.updatedAt)}</p>
              </div>
            </div>

            {isUser && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 text-sm">
                  ℹ️ You can only change the status of this task. Contact your
                  team admin to edit title or description.
                </p>
              </div>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  if (
                    window.confirm("Are you sure you want to delete this task?")
                  ) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <Trash2 size={18} />
                Delete Task
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailModal;
