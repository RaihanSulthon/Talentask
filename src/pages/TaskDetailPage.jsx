import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  RotateCcw,
  Send,
  Paperclip,
  X,
  Link as LinkIcon,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTeamManagement } from "../hooks/useTeamManagement";
import { useTaskManagement } from "../hooks/useTaskManagement";
import { useToast } from "../components/Toast";
import DashboardLayout from "../layouts/DashboardLayout";
import TaskDetailContent from "../components/tasks/TaskDetailContent";
import {
  subscribeToTaskSubmissions,
  createSubmission,
  reviewSubmission,
  deleteSubmission,
} from "../services/submissionService";

const SubmissionStatusBadge = ({ status }) => {
  const map = {
    submitted: { label: "Submitted", className: "bg-blue-100 text-blue-700" },
    reviewed: {
      label: "Approved",
      className: "bg-emerald-100 text-emerald-700",
    },
    revision: {
      label: "Needs Revision",
      className: "bg-amber-100 text-amber-700",
    },
  };
  const s = map[status] || map.submitted;
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${s.className}`}
    >
      {s.label}
    </span>
  );
};

const TaskDetailPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { teams } = useTeamManagement();
  const {
    tasks,
    handleUpdateTask,
    handleUpdateTaskStatus,
    handleDeleteTask,
    canEditTask,
  } = useTaskManagement(teams);
  const toast = useToast();

  const isAdmin = userRole === "super_admin" || userRole === "admin";
  const isUser = userRole === "user";

  const [activeTab, setActiveTab] = useState("detail");
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(true);

  // Submission form state
  const [subContent, setSubContent] = useState("");
  const [subFile, setSubFile] = useState(null);
  const [subLink, setSubLink] = useState("");
  const [submissionType, setSubmissionType] = useState("text");
  const [submitting, setSubmitting] = useState(false);

  // Review state
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewNote, setReviewNote] = useState("");

  // Expand state for compact submission cards
  const [expandedSub, setExpandedSub] = useState(null);

  const task = tasks.find((t) => t.id === taskId);
  const taskWithTeam = task
    ? {
        ...task,
        teamName:
          teams.find((t) => t.id === task.teamId)?.name || "Unknown Team",
      }
    : null;

  const currentTeam = teams.find((t) => t.id === task?.teamId);
  const ownerIds = currentTeam?.ownerId ? [currentTeam.ownerId] : [];

  // Filter submissions: user hanya lihat miliknya, admin lihat semua
  const visibleSubmissions = isAdmin
    ? submissions
    : submissions.filter((s) => s.assignedTo === user?.uid);

  const mySubmissions = submissions
    .filter((s) => s.assignedTo === user?.uid)
    .sort((a, b) => {
      const tA = a.submittedAt?.toDate
        ? a.submittedAt.toDate()
        : new Date(a.submittedAt || 0);
      const tB = b.submittedAt?.toDate
        ? b.submittedAt.toDate()
        : new Date(b.submittedAt || 0);
      return tB - tA; // terbaru di atas
    });
  const mySubmission = mySubmissions[0]; // submission terbaru untuk cek status form

  useEffect(() => {
    if (!taskId) return;
    setLoadingSubs(true);
    const unsub = subscribeToTaskSubmissions(taskId, (snap) => {
      setSubmissions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoadingSubs(false);
    });
    return () => unsub();
  }, [taskId]);

  const handleSubmit = async () => {
    if (!subContent.trim() && !subFile && !subLink.trim()) {
      toast.warning(
        "Isi konten, lampirkan file, atau masukkan link terlebih dahulu.",
      );
      return;
    }
    if (submissionType === "link" && subLink.trim()) {
      try {
        new URL(subLink.trim());
      } catch {
        toast.warning("URL link tidak valid. Pastikan diawali https://");
        return;
      }
    }
    try {
      setSubmitting(true);
      await createSubmission(
        {
          taskId,
          assignedTo: user.uid,
          assignedToName: user.displayName || user.email,
          teamId: task.teamId,
          content: subContent,
          fileUrl: "",
          fileName: subFile?.name || "",
          fileType: subFile?.type || "",
          linkUrl: submissionType === "link" ? subLink.trim() : "",
          submissionType,
        },
        {
          ownerIds,
          taskTitle: task.title,
          teamName: currentTeam?.name || "",
        },
      );
      setSubContent("");
      setSubFile(null);
      setSubLink("");
      setSubmissionType("text");
      toast.success("Submission berhasil dikirim! 🎉");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengirim submission.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (sub, status) => {
    try {
      await reviewSubmission(sub.id, status, reviewNote, {
        reviewedBy: user.uid,
        reviewerName: user.displayName,
        submitterId: sub.assignedTo,
        taskId,
        taskTitle: task.title,
        teamId: task.teamId,
      });
      setReviewingId(null);
      setReviewNote("");
      toast.success(
        status === "reviewed"
          ? "Submission disetujui! ✅"
          : "Revision request dikirim 🔄",
      );
    } catch (err) {
      toast.error("Gagal memperbarui review.");
    }
  };

  const handleDelete = async (subId) => {
    if (!window.confirm("Hapus submission ini?")) return;
    try {
      await deleteSubmission(subId);
      toast.success("Submission dihapus.");
    } catch {
      toast.error("Gagal menghapus submission.");
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!task && tasks.length > 0) {
    return (
      <DashboardLayout title="Task Not Found">
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <AlertCircle size={48} className="mb-4" />
          <p className="text-lg font-medium">Task tidak ditemukan</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-emerald-600 hover:underline text-sm"
          >
            ← Kembali
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={task.title} subtitle={taskWithTeam?.teamName}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 transition-colors mb-6 text-sm font-medium group"
      >
        <ArrowLeft
          size={15}
          className="group-hover:-translate-x-0.5 transition-transform"
        />
        Kembali
      </button>

      {/* Tab Header */}
      <div className="flex gap-1 mb-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("detail")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-all ${
            activeTab === "detail"
              ? "border-emerald-500 text-emerald-600 bg-emerald-50/50"
              : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          } rounded-t-lg`}
        >
          <FileText size={15} />
          Task Detail
        </button>
        <button
          onClick={() => setActiveTab("submission")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-all ${
            activeTab === "submission"
              ? "border-emerald-500 text-emerald-600 bg-emerald-50/50"
              : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          } rounded-t-lg`}
        >
          <Upload size={15} />
          Submission
          {submissions.length > 0 && (
            <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {submissions.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "detail" && taskWithTeam && (
        <div className="w-full">
          <TaskDetailContent
            task={taskWithTeam}
            teams={teams}
            onClose={() => navigate(-1)}
            onUpdate={handleUpdateTask}
            onUpdateStatus={async (tId, newStatus) => {
              await handleUpdateTaskStatus(tId, newStatus, {
                taskTitle: task.title,
                teamId: task.teamId,
                teamName: currentTeam?.name || "",
                assignedTo: task.assignedTo || [],
                ownerIds,
                actorId: user.uid,
                actorName: user.displayName,
              });
            }}
            onDelete={async (tId) => {
              const taskTeam = teams.find((t) => t.id === task.teamId);
              await handleDeleteTask(tId, {
                taskTitle: task.title,
                teamId: task.teamId,
                teamName: taskTeam?.name || "",
                assignedTo: task.assignedTo || [],
                ownerIds,
                actorId: user.uid,
                actorName: user.displayName,
              });
              navigate(-1);
            }}
            canEdit={canEditTask(task)}
            loading={false}
            initialEditMode={false}
          />
        </div>
      )}

      {activeTab === "submission" && (
        <div className="w-full space-y-6">
          {/* ── ADMIN: daftar semua submission ── */}
          {isAdmin && (
            <div className="space-y-2">
              {/* Header tabel */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Submissions ({submissions.length})
                </h3>
              </div>

              {loadingSubs ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-7 h-7 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <Upload size={28} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    Belum ada submission
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Submission dari anggota tim akan muncul di sini
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                  {submissions.map((sub, idx) => {
                    const member = currentTeam?.members?.find(
                      (m) =>
                        m.uid === sub.assignedTo || m.id === sub.assignedTo,
                    );
                    const isExpanded = expandedSub === sub.id;
                    const hasDetail =
                      sub.content ||
                      sub.linkUrl ||
                      sub.fileName ||
                      sub.reviewNote;
                    const canExpand = hasDetail || sub.status === "submitted";

                    return (
                      <div
                        key={sub.id}
                        className={`${idx !== 0 ? "border-t border-slate-100" : ""}`}
                      >
                        {/* ── Compact Row ── */}
                        <div
                          className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                            canExpand ? "cursor-pointer hover:bg-slate-50" : ""
                          }`}
                          onClick={() =>
                            canExpand
                              ? setExpandedSub(isExpanded ? null : sub.id)
                              : null
                          }
                        >
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {(member?.displayName ||
                              sub.assignedToName ||
                              "?")[0].toUpperCase()}
                          </div>

                          {/* Nama */}
                          <p className="text-slate-800 font-semibold text-sm w-36 shrink-0 truncate">
                            {member?.displayName || sub.assignedToName}
                          </p>

                          {/* Preview konten — hanya saat collapsed */}
                          <div className="flex-1 min-w-0 hidden md:flex items-center gap-2">
                            {!isExpanded && sub.content && (
                              <p className="text-slate-400 text-xs truncate">
                                {sub.content}
                              </p>
                            )}
                            {!isExpanded && sub.linkUrl && (
                              <span className="flex items-center gap-1 text-blue-400 text-xs shrink-0">
                                <LinkIcon size={11} /> Link
                              </span>
                            )}
                            {!isExpanded && sub.fileName && (
                              <span className="flex items-center gap-1 text-slate-400 text-xs shrink-0">
                                <Paperclip size={11} />
                                <span className="truncate max-w-30">
                                  {sub.fileName}
                                </span>
                              </span>
                            )}
                          </div>

                          {/* Tanggal */}
                          <p className="text-slate-400 text-xs shrink-0 hidden lg:block w-36 text-right">
                            {formatDate(sub.submittedAt)}
                          </p>

                          {/* Status badge */}
                          <SubmissionStatusBadge status={sub.status} />

                          {/* Chevron */}
                          {canExpand && (
                            <ChevronDown
                              size={15}
                              className={`text-slate-300 shrink-0 transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          )}

                          {/* Delete */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(sub.id);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all shrink-0"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* ── Expanded Detail ── */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3">
                            {sub.content && (
                              <p className="text-slate-600 text-sm leading-relaxed bg-white border border-slate-100 rounded-xl px-4 py-3">
                                {sub.content}
                              </p>
                            )}

                            {sub.linkUrl && (
                              <a
                                href={sub.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl px-4 py-2.5 transition-colors group"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <LinkIcon size={14} className="shrink-0" />
                                <span className="truncate flex-1">
                                  {sub.linkUrl}
                                </span>
                                <ExternalLink
                                  size={13}
                                  className="shrink-0 opacity-60 group-hover:opacity-100"
                                />
                              </a>
                            )}

                            {sub.fileName && (
                              <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-100 rounded-xl px-4 py-2.5">
                                <Paperclip
                                  size={14}
                                  className="text-slate-400 shrink-0"
                                />
                                <span className="truncate">{sub.fileName}</span>
                              </div>
                            )}

                            {sub.reviewNote && (
                              <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                                <AlertCircle
                                  size={14}
                                  className="text-amber-500 mt-0.5 shrink-0"
                                />
                                <div>
                                  <p className="text-xs font-semibold text-amber-600 mb-0.5">
                                    Catatan Review
                                  </p>
                                  <p className="text-amber-700 text-sm">
                                    {sub.reviewNote}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Review actions */}
                            {isAdmin &&
                              sub.status === "submitted" &&
                              (reviewingId === sub.id ? (
                                <div className="space-y-2 pt-1">
                                  <textarea
                                    rows={2}
                                    placeholder="Catatan untuk anggota (opsional)..."
                                    value={reviewNote}
                                    onChange={(e) =>
                                      setReviewNote(e.target.value)
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none bg-white"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleReview(sub, "reviewed");
                                      }}
                                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors"
                                    >
                                      <CheckCircle size={14} /> Approve
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleReview(sub, "revision");
                                      }}
                                      className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors"
                                    >
                                      <RotateCcw size={14} /> Minta Revisi
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setReviewingId(null);
                                        setReviewNote("");
                                      }}
                                      className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReviewingId(sub.id);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium transition-all"
                                >
                                  <CheckCircle size={14} />
                                  Review Submission
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── USER: lihat submission miliknya + form submit baru ── */}
          {isUser && (
            <div className="space-y-5">
              {/* Semua submission milik user — terbaru di atas */}
              {mySubmissions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Submission Kamu ({mySubmissions.length})
                  </h3>
                  <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                    {mySubmissions.map((sub, idx) => {
                      const isExpanded = expandedSub === sub.id;
                      const hasDetail =
                        sub.content ||
                        sub.linkUrl ||
                        sub.fileName ||
                        sub.reviewNote;
                      const isLatest = idx === 0;

                      return (
                        <div
                          key={sub.id}
                          className={
                            idx !== 0 ? "border-t border-slate-100" : ""
                          }
                        >
                          {/* Compact Row */}
                          <div
                            className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                              hasDetail
                                ? "cursor-pointer hover:bg-slate-50"
                                : ""
                            }`}
                            onClick={() =>
                              hasDetail
                                ? setExpandedSub(isExpanded ? null : sub.id)
                                : null
                            }
                          >
                            {/* Icon */}
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                              <Send size={13} className="text-emerald-600" />
                            </div>

                            {/* Label */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-slate-700 font-semibold text-sm">
                                  {isLatest
                                    ? "Terbaru"
                                    : `Pengiriman #${mySubmissions.length - idx}`}
                                </p>
                                {isLatest && (
                                  <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                                    latest
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {formatDate(sub.submittedAt)}
                              </p>
                            </div>

                            {/* Preview */}
                            {!isExpanded && sub.content && (
                              <p className="text-slate-400 text-xs truncate max-w-xs hidden md:block">
                                {sub.content}
                              </p>
                            )}
                            {!isExpanded && sub.linkUrl && (
                              <span className="items-center gap-1 text-blue-400 text-xs hidden md:flex shrink-0">
                                <LinkIcon size={11} /> Link
                              </span>
                            )}
                            {!isExpanded && sub.fileName && (
                              <span className="flex items-center gap-1 text-slate-400 text-xs md:flex shrink-0">
                                <Paperclip size={11} />
                                <span className="truncate max-w-25">
                                  {sub.fileName}
                                </span>
                              </span>
                            )}

                            {/* Status */}
                            <SubmissionStatusBadge status={sub.status} />

                            {/* Chevron */}
                            {hasDetail && (
                              <ChevronDown
                                size={15}
                                className={`text-slate-300 shrink-0 transition-transform duration-200 ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            )}
                          </div>

                          {/* Expanded Detail */}
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3">
                              {sub.content && (
                                <p className="text-slate-600 text-sm leading-relaxed bg-white border border-slate-100 rounded-xl px-4 py-3">
                                  {sub.content}
                                </p>
                              )}
                              {sub.linkUrl && (
                                <a
                                  href={sub.linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl px-4 py-2.5 transition-colors group"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <LinkIcon size={14} className="shrink-0" />
                                  <span className="truncate flex-1">
                                    {sub.linkUrl}
                                  </span>
                                  <ExternalLink
                                    size={13}
                                    className="shrink-0 opacity-60 group-hover:opacity-100"
                                  />
                                </a>
                              )}
                              {sub.fileName && (
                                <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-100 rounded-xl px-4 py-2.5">
                                  <Paperclip
                                    size={14}
                                    className="text-slate-400 shrink-0"
                                  />
                                  <span className="truncate">
                                    {sub.fileName}
                                  </span>
                                </div>
                              )}
                              {sub.reviewNote && (
                                <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                                  <AlertCircle
                                    size={14}
                                    className="text-amber-500 mt-0.5 shrink-0"
                                  />
                                  <div>
                                    <p className="text-xs font-semibold text-amber-600 mb-0.5">
                                      Catatan dari Admin
                                    </p>
                                    <p className="text-amber-700 text-sm">
                                      {sub.reviewNote}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Form submit baru / resubmit */}
              {(!mySubmission || mySubmission.status === "revision") && (
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                      <Upload size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        {mySubmission?.status === "revision"
                          ? "Submit Ulang"
                          : "Kumpulkan Tugas"}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {mySubmission?.status === "revision"
                          ? "Perbaiki dan kirim ulang tugasmu"
                          : "Kirim hasil kerjamu ke admin"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Submission type selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Tipe Submission
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            value: "text",
                            icon: <FileText size={15} />,
                            label: "Teks",
                          },
                          {
                            value: "file",
                            icon: <Paperclip size={15} />,
                            label: "File",
                          },
                          {
                            value: "link",
                            icon: <LinkIcon size={15} />,
                            label: "Link",
                          },
                        ].map((type) => (
                          <button
                            key={type.value}
                            onClick={() => {
                              setSubmissionType(type.value);
                              setSubFile(null);
                              setSubLink("");
                            }}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                              submissionType === type.value
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:text-slate-700"
                            }`}
                          >
                            {type.icon}
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Deskripsi/Catatan — selalu tampil */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Deskripsi / Catatan{" "}
                        {submissionType !== "text" && (
                          <span className="normal-case font-normal">
                            (opsional)
                          </span>
                        )}
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Jelaskan pekerjaan yang sudah kamu selesaikan..."
                        value={subContent}
                        onChange={(e) => setSubContent(e.target.value)}
                        className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none placeholder-slate-400 text-slate-800 bg-slate-50 focus:bg-white transition-colors"
                      />
                    </div>

                    {/* File upload */}
                    {submissionType === "file" && (
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                          File Lampiran
                        </label>
                        {subFile ? (
                          <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                            <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                              <Paperclip
                                size={15}
                                className="text-emerald-600"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-emerald-700 font-medium truncate">
                                {subFile.name}
                              </p>
                              <p className="text-xs text-emerald-500">
                                {(subFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <button
                              onClick={() => setSubFile(null)}
                              className="text-emerald-400 hover:text-red-400 transition-colors"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all group">
                            <div className="w-12 h-12 bg-slate-100 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center transition-colors">
                              <Upload
                                size={22}
                                className="text-slate-400 group-hover:text-emerald-500 transition-colors"
                              />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-slate-500 group-hover:text-emerald-600 transition-colors">
                                Klik untuk memilih file
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                JPG, PNG, PDF, DOC — maks. 5MB
                              </p>
                            </div>
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                              className="hidden"
                              onChange={(e) =>
                                setSubFile(e.target.files?.[0] || null)
                              }
                            />
                          </label>
                        )}
                      </div>
                    )}

                    {/* Link input */}
                    {submissionType === "link" && (
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                          URL / Link
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                            <LinkIcon size={15} className="text-slate-400" />
                          </div>
                          <input
                            type="url"
                            placeholder="https://contoh.com/hasil-tugas"
                            value={subLink}
                            onChange={(e) => setSubLink(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-slate-400 text-slate-800 bg-slate-50 focus:bg-white transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl font-semibold text-sm transition-all shadow-sm shadow-emerald-200 hover:shadow-emerald-300"
                    >
                      <Send size={16} />
                      {submitting ? "Mengirim..." : "Kirim Submission"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default TaskDetailPage;
