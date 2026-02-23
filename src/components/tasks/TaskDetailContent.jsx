import { useState } from "react";
import { X, Edit2, Trash2, Clock, Calendar, AlertTriangle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import CustomSelect from "../CustomSelect";

const TaskDetailContent = ({
  task,
  teams,
  onClose,
  onUpdate,
  onDelete,
  canEdit,
  loading,
  initialEditMode = false,
}) => {
  const { user, userRole } = useAuth();
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const isAdmin = userRole === "super_admin" || userRole === "admin";
  const isUser = userRole === "user";
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    status: task.status,
    assignedTo: task.assignedTo || [],
    deadline: task.deadline || null,
    deadlineReminder: task.deadlineReminder ?? 3,
  });
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const currentTeam = teams.find((t) => t.id === task.teamId);

  const statusOptions = [
    { value: "todo", label: "To Do" },
    { value: "inprogress", label: "In Progress" },
    { value: "inreview", label: "In Review" },
    { value: "done", label: "Done" },
  ];

  const statusSelectOptions = statusOptions.map((opt) => ({
    value: opt.value,
    label: opt.label,
    icon:
      opt.value === "todo"
        ? "⸸"
        : opt.value === "inprogress"
          ? "ⱱ"
          : opt.value === "inreview"
            ? "👁"
            : "✅",
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(task.id, formData, {
      taskTitle: formData.title,
      teamId: task.teamId,
      teamName: task.teamName || currentTeam?.name || "",
      assignedTo: formData.assignedTo || [],
      actorId: user?.uid || "",
      actorName: user?.displayName || "",
    });
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

  const getDeadlineInfo = () => {
    const dl = formData.deadline || task.deadline;
    if (!dl) return null;
    const deadline = dl?.toDate ? dl.toDate() : new Date(dl);
    const now = new Date();
    const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    return {
      deadline,
      diffDays,
      isOverdue: diffDays < 0,
      isToday: diffDays === 0,
      isUrgent: diffDays >= 0 && diffDays <= (formData.deadlineReminder ?? 3),
      label:
        diffDays < 0
          ? `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""}`
          : diffDays === 0
            ? "Due today"
            : `${diffDays} day${diffDays > 1 ? "s" : ""} left`,
      formatted: deadline.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
  };
  const deadlineInfo = getDeadlineInfo();

  if (isEditing && isAdmin) {
    return (
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Enter task title..."
            className="w-full px-4 py-3 bg-white text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent placeholder-slate-400 text-sm transition-all shadow-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={5}
            placeholder="Describe the task in detail..."
            className="w-full px-4 py-3 bg-white text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent placeholder-slate-400 text-sm leading-relaxed transition-all shadow-sm resize-none"
          />
        </div>

        <CustomSelect
          options={statusSelectOptions}
          value={formData.status}
          onChange={(value) => setFormData({ ...formData, status: value })}
          label="Status"
        />

        {/* Deadline - di form edit, setelah CustomSelect status */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Deadline
          </label>
          <input
            type="date"
            value={
              formData.deadline
                ? (formData.deadline?.toDate
                    ? formData.deadline.toDate()
                    : new Date(formData.deadline)
                  )
                    .toISOString()
                    .split("T")[0]
                : ""
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                deadline: e.target.value ? new Date(e.target.value) : null,
              })
            }
            className="w-full px-4 py-3 bg-white text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm transition-all shadow-sm"
          />
          {formData.deadline && (
            <div className="flex items-center gap-2 mt-1">
              <label className="text-xs text-slate-500">Reminder:</label>
              <select
                value={formData.deadlineReminder ?? 3}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deadlineReminder: parseInt(e.target.value),
                  })
                }
                className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-300"
              >
                <option value={1}>1 day before</option>
                <option value={2}>2 days before</option>
                <option value={3}>3 days before</option>
                <option value={5}>5 days before</option>
                <option value={7}>7 days before</option>
              </select>
            </div>
          )}
        </div>

        {task.status === "inreview" && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <Clock size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-amber-700 text-sm font-medium leading-snug">
              {isAdmin
                ? "This task is awaiting your approval"
                : "This task is awaiting approval from the team owner"}
            </p>
          </div>
        )}

        {isAdmin && currentTeam?.members && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
              Assigned To
            </label>
            <div className="flex flex-wrap gap-2 mb-3 min-h-8">
              {formData.assignedTo.length === 0 && (
                <span className="text-sm text-slate-400 italic">
                  No members assigned yet
                </span>
              )}
              {formData.assignedTo.map((memberId) => {
                const member = currentTeam.members.find(
                  (m) => m.uid === memberId || m.id === memberId,
                );
                return member ? (
                  <div
                    key={memberId}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 text-sm font-medium"
                  >
                    <span>{member.displayName}</span>
                    <button
                      type="button"
                      onClick={() => toggleAssignee(memberId)}
                      className="text-emerald-400 hover:text-emerald-700 transition-colors ml-0.5"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : null;
              })}
            </div>
            <div className="relative">
              {(() => {
                const availableMembers = currentTeam.members
                  .filter((m) => m.role !== "admin" && m.role !== "super_admin")
                  .filter((m) => !formData.assignedTo.includes(m.uid || m.id));

                return availableMembers.length > 0 ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                      className="w-full px-4 py-3 bg-white text-slate-400 rounded-xl border border-slate-200 border-dashed hover:border-emerald-400 hover:text-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-left text-sm transition-all flex items-center gap-2"
                    >
                      <span className="text-lg leading-none">+</span>
                      Add team member...
                    </button>
                    {showAssignDropdown && (
                      <div className="absolute z-10 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl max-h-60 overflow-y-auto">
                        {availableMembers.map((member) => (
                          <button
                            key={member.uid || member.id}
                            type="button"
                            onClick={() => {
                              toggleAssignee(member.uid || member.id);
                              setShowAssignDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left transition-colors hover:bg-emerald-50 group"
                          >
                            <div className="font-medium text-slate-700 group-hover:text-emerald-700 text-sm">
                              {member.displayName}
                            </div>
                            <div className="text-xs text-slate-400">
                              {member.email}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null;
              })()}
              {showAssignDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl max-h-60 overflow-y-auto">
                  {currentTeam.members
                    .filter(
                      (m) => m.role !== "admin" && m.role !== "super_admin",
                    )
                    .filter((m) => !formData.assignedTo.includes(m.uid || m.id))
                    .map((member) => (
                      <button
                        key={member.uid || member.id}
                        type="button"
                        onClick={() => {
                          toggleAssignee(member.uid || member.id);
                          setShowAssignDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left transition-colors hover:bg-emerald-50 group"
                      >
                        <div className="font-medium text-slate-700 group-hover:text-emerald-700 text-sm">
                          {member.displayName}
                        </div>
                        <div className="text-xs text-slate-400">
                          {member.email}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              "Save Details"
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold text-sm transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-5">
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
          Title
        </label>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-slate-800">{task.title}</p>
          {isAdmin && canEdit && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-slate-400 hover:text-emerald-400"
            >
              <Edit2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
          Description
        </label>
        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
          {task.description || (
            <span className="italic text-slate-400">
              No description provided.
            </span>
          )}
        </p>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
          Team
        </label>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <p className="text-slate-700 font-medium">
            {task.teamName || currentTeam?.name || "Unknown Team"}
          </p>
        </div>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
          Status
        </label>
        {isUser ? (
          task.status === "done" ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700">
              ✅ Done
            </span>
          ) : (
            <CustomSelect
              options={statusSelectOptions.filter(
                (opt) => opt.value !== "done",
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
          )
        ) : (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
              task.status === "todo"
                ? "bg-slate-100 text-slate-600"
                : task.status === "inprogress"
                  ? "bg-blue-100 text-blue-700"
                  : task.status === "inreview"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {statusOptions.find((s) => s.value === task.status)?.label}
          </span>
        )}
      </div>

      {/* Deadline display - di view mode, setelah status section */}
      <div
        className={`p-4 rounded-xl border ${
          deadlineInfo?.isOverdue
            ? "bg-red-50 border-red-200"
            : deadlineInfo?.isToday
              ? "bg-orange-50 border-orange-200"
              : deadlineInfo?.isUrgent
                ? "bg-amber-50 border-amber-200"
                : "bg-slate-50 border-slate-100"
        }`}
      >
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
          Deadline
        </label>
        {deadlineInfo ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar
                size={15}
                className={
                  deadlineInfo.isOverdue
                    ? "text-red-500"
                    : deadlineInfo.isToday
                      ? "text-orange-500"
                      : deadlineInfo.isUrgent
                        ? "text-amber-500"
                        : "text-slate-400"
                }
              />
              <span className="text-slate-700 font-medium text-sm">
                {deadlineInfo.formatted}
              </span>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                deadlineInfo.isOverdue
                  ? "bg-red-100 text-red-600"
                  : deadlineInfo.isToday
                    ? "bg-orange-100 text-orange-600"
                    : deadlineInfo.isUrgent
                      ? "bg-amber-100 text-amber-600"
                      : "bg-slate-100 text-slate-500"
              }`}
            >
              {deadlineInfo.isOverdue
                ? "🚨 "
                : deadlineInfo.isToday
                  ? "⚠️ "
                  : deadlineInfo.isUrgent
                    ? "⏰ "
                    : ""}
              {deadlineInfo.label}
            </span>
          </div>
        ) : (
          <p className="text-slate-400 text-sm italic">No deadline set</p>
        )}
      </div>

      {currentTeam && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
            Assigned To
          </label>
          <div className="flex flex-wrap gap-2">
            {formData.assignedTo?.map((memberId) => {
              const member = currentTeam.members?.find(
                (m) => m.uid === memberId || m.id === memberId,
              );
              return member ? (
                <span
                  key={memberId}
                  className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-sm font-medium"
                >
                  {member.displayName}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
            Created
          </label>
          <p className="text-slate-700 text-sm">{formatDate(task.createdAt)}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
            Last Updated
          </label>
          <p className="text-slate-700 text-sm">{formatDate(task.updatedAt)}</p>
        </div>
      </div>

      {isUser && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-blue-700 text-sm font-medium">
            ℹ️ You can only change the status of this task. Contact your team
            admin to edit title or description.
          </p>
        </div>
      )}

      {isAdmin && (
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this task?")) {
              onDelete(task.id);
              onClose();
            }
          }}
          className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 size={18} />
          Delete Task
        </button>
      )}
    </div>
  );
};

export default TaskDetailContent;
