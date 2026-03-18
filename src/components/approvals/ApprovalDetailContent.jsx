import {
  Tag,
  Calendar,
  CheckCircle,
  XCircle,
  MessagesSquare,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

const ApprovalDetailContent = ({
  task,
  teams,
  isAdmin,
  actionLoading,
  onApprove,
  onDecline,
  declineComment,
  onDeclineCommentChange,
  newDeadline,
  onNewDeadlineChange,
}) => {
  const currentTeam = teams.find((t) => t.id === task.teamId);
  const assignedMembers = task.assignedTo
    ?.map((id) =>
      currentTeam?.members?.find((m) => m.uid === id || m.id === id),
    )
    .filter(Boolean);

  const formatDate = (ts) => {
    if (!ts) return "N/A";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString("en-GB");
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          Title
        </label>
        <p className="text-lg font-semibold text-gray-800">{task.title}</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          Description
        </label>
        <p className="text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg px-4 py-3 text-sm">
          {task.description || (
            <span className="italic text-gray-400">
              No description provided.
            </span>
          )}
        </p>
      </div>

      {/* Team */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          Team
        </label>
        <div className="flex items-center gap-2">
          <Tag size={15} className="text-violet-500" />
          <p className="text-gray-700 font-medium">
            {task.teamName || currentTeam?.name || "Unknown Team"}
          </p>
        </div>
      </div>

      {/* Assigned To */}
      {assignedMembers?.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Assigned To
          </label>
          <div className="flex flex-wrap gap-2">
            {assignedMembers.map((member) => (
              <div
                key={member.uid}
                className="flex items-center gap-2.5 px-3 py-2 bg-gray-100 rounded-xl">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {member.displayName?.substring(0, 2).toUpperCase() || "U"}
                </div>
                <div>
                  <div className="text-gray-800 text-sm font-medium">
                    {member.displayName}
                  </div>
                  <div className="text-gray-400 text-xs">{member.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-xl px-4 py-3">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Created
          </label>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Calendar size={14} className="text-gray-400 shrink-0" />
            <span>{formatDate(task.createdAt)}</span>
          </div>
        </div>
        <div className="bg-yellow-50 rounded-xl px-4 py-3">
          <label className="block text-xs font-semibold text-yellow-500 uppercase tracking-wider mb-1">
            Submitted for Review
          </label>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Calendar size={14} className="text-yellow-400 shrink-0" />
            <span>{formatDate(task.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Previous Decline Reason — tampil ke semua (admin & member) jika ada */}
      {task.declineComment && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">
              Previous Decline Reason
            </p>
            <p className="text-red-700 text-sm leading-relaxed">
              {task.declineComment}
            </p>
          </div>
        </div>
      )}

      {task.declinedAt && task.deadline && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
          <Calendar size={16} className="text-orange-500 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider">
              Revision Deadline
            </p>
            <p className="text-orange-700 text-sm font-medium">
              {formatDate(task.deadline)}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      {isAdmin ? (
        <div className="space-y-4 pt-4 border-t border-gray-100">
          {/* Decline Comment Textarea */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              <MessagesSquare size={13} />
              Decline Reason
              <span className="text-red-400 normal-case font-normal">
                (required to decline)
              </span>
            </label>
            <textarea
              value={declineComment}
              onChange={(e) => onDeclineCommentChange(e.target.value)}
              placeholder="Explain what needs to be revised or corrected..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 resize-none transition-colors"
            />
          </div>

          {/* New Deadline for Revision */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              <Calendar size={13} />
              Deadline Revisi Baru
              <span className="text-red-400 normal-case font-normal">
                (wajib diisi)
              </span>
            </label>
            <input
              type="date"
              value={newDeadline || ""}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => onNewDeadlineChange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 transition-colors"
            />
            {task.deadline && (
              <p className="text-xs text-gray-400 mt-1.5">
                Deadline sebelumnya:{" "}
                <span className="font-medium text-gray-500">
                  {new Date(
                    task.deadline?.toDate
                      ? task.deadline.toDate()
                      : task.deadline,
                  ).toLocaleDateString("en-GB")}
                </span>
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onApprove}
              disabled={actionLoading}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-200">
              <CheckCircle size={18} />
              {actionLoading ? "Approving..." : "Approve Task"}
            </button>
            <button
              onClick={onDecline}
              disabled={
                actionLoading || !declineComment?.trim() || !newDeadline
              }
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm shadow-red-200">
              <XCircle size={18} />
              {actionLoading ? "Declining..." : "Decline Task"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {task.declineComment ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-amber-700 text-sm font-medium">
                ⚠️ This task was declined. Please review the reason above and
                resubmit.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-blue-600 text-sm font-medium">
                ℹ️ This task is awaiting approval from your team owner.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApprovalDetailContent;
