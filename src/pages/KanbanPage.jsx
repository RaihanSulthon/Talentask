import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTeamManagement } from "../hooks/useTeamManagement";
import { useTaskManagement } from "../hooks/useTaskManagement";
import DashboardLayout from "../layouts/DashboardLayout";
import KanbanColumn from "../components/kanban/KanbanColumn";
import TeamFilterDropdown from "../components/kanban/TeamFilterDropdown";
import Modal from "../components/Modal";
import { AlertTriangle, AlertCircle, Plus } from "lucide-react";
import CustomSelect from "../components/CustomSelect";
import TaskDetailContent from "../components/tasks/TaskDetailContent";
import { useToast } from "../components/Toast";
import { subscribeToSubmissionsByTaskIds } from "../services/submissionService";
 
const KanbanPage = () => {
  const { user, userRole } = useAuth();
  const { teams, loading: teamsLoading } = useTeamManagement();
  const {
    tasks,
    loading: tasksLoading,
    handleCreateTask,
    handleUpdateTaskStatus,
    handleUpdateTask,
    handleDeleteTask,
    canEditTask,
  } = useTaskManagement(teams);
 
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [draggedTask, setDraggedTask] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const toast = useToast();
  const [taskSubmissionMap, setTaskSubmissionMap] = useState({});
  const taskIdsKey = tasks
    .map((t) => t.id)
    .sort()
    .join(",");
 
  useEffect(() => {
    const ids = tasks.map((t) => t.id);
    if (ids.length === 0) return;
    const unsub = subscribeToSubmissionsByTaskIds(ids, (map) => {
      setTaskSubmissionMap((prev) => ({ ...prev, ...map }));
    });
    return () => unsub();
  }, [taskIdsKey]);
 
  const columns = [
    { id: "todo",       title: "To Do",       status: "todo" },
    { id: "inprogress", title: "In Progress",  status: "inprogress" },
    { id: "inreview",   title: "In Review",    status: "inreview" },
    { id: "done",       title: "Done",         status: "done" },
  ];
 
  const isAdmin = userRole === "super_admin" || userRole === "admin";
  const ownedTeams =
    userRole === "super_admin" ? teams : teams.filter((t) => t.isOwner);
 
  const filteredTasks = (
    selectedTeam ? tasks.filter((task) => task.teamId === selectedTeam) : tasks
  ).map((task) => ({
    ...task,
    teamName: teams.find((t) => t.id === task.teamId)?.name || "Unknown Team",
  }));
 
  const onCreateTask = async (taskData) => {
    try {
      setActionLoading(true);
      await handleCreateTask(taskData.teamId, taskData);
      setShowCreateModal(false);
      toast.success("Task berhasil dibuat! 🎉");
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Gagal membuat task.");
    } finally {
      setActionLoading(false);
    }
  };
 
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    teamId: "",
    assignedTo: [],
    deadline: null,
    deadlineReminder: 3,
  });
 
  const [formErrors, setFormErrors] = useState({});
 
  const validateTaskForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.deadline) errors.deadline = "Deadline is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
 
  const selectedTeamForCreate =
    ownedTeams.find((t) => t.id === formData.teamId) || null;
  const teamOptions = ownedTeams.map((team) => ({
    value: team.id,
    label: team.name,
    icon: team.name.substring(0, 2).toUpperCase(),
    description: `${team.members?.length || 0} members`,
  }));
 
  const toggleAssignee = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(memberId)
        ? prev.assignedTo.filter((id) => id !== memberId)
        : [...prev.assignedTo, memberId],
    }));
  };
 
  const onDragStart = (e, task) => {
    if (!canEditTask(task)) {
      e.preventDefault();
      return;
    }
    setDraggedTask(task);
  };
 
  const onDragOver = (e) => {
    e.preventDefault();
  };
 
  const onDrop = async (e, newStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      if (newStatus === "done" && !isAdmin) {
        toast.warning(
          "Kamu tidak bisa langsung menyelesaikan task. Pindahkan ke 'In Review' terlebih dahulu.",
        );
        setDraggedTask(null);
        return;
      }
 
      if (newStatus === "inreview") {
        if (!taskSubmissionMap[draggedTask.id]) {
          toast.warning(
            "Belum ada submission. Kumpulkan hasil kerja dulu sebelum minta review.",
          );
          setDraggedTask(null);
          return;
        }
        if (!isAdmin) {
          toast.info("Task dikirim untuk direview oleh team owner.");
        }
      }
 
      try {
        const taskTeam = teams.find((t) => t.id === draggedTask.teamId);
        const ownerIds = taskTeam?.ownerId ? [taskTeam.ownerId] : [];
        await handleUpdateTaskStatus(draggedTask.id, newStatus, {
          taskTitle: draggedTask.title,
          teamId: draggedTask.teamId,
          teamName: taskTeam?.name || "",
          assignedTo: draggedTask.assignedTo || [],
          ownerIds,
          actorId: user.uid,
          actorName: user.displayName,
        });
        toast.success(`Task dipindahkan ke "${newStatus}".`);
      } catch (error) {
        console.error("Error updating task status:", error);
        toast.error("Gagal memperbarui status task.");
      }
    }
    setDraggedTask(null);
  };
 
  const [searchParams, setSearchParams] = useSearchParams();
 
  useEffect(() => {
    const taskId = searchParams.get("taskId");
    if (!taskId || tasks.length === 0) return;
    const found = tasks.find((t) => t.id === taskId);
    if (found) {
      setSearchParams({});
      navigate(`/task/${found.id}`);
    }
  }, [tasks, searchParams]);
 
  const onTaskClick = (task) => {
    navigate(`/task/${task.id}`);
  };
 
  const handleEditTask = (task) => {
    navigate(`/task/${task.id}`);
  };
 
  const handleDeleteTaskClick = (task) => {
    setSelectedTask(task);
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };
 
  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      const taskTeam = teams.find((t) => t.id === selectedTask.teamId);
      const ownerIds = taskTeam?.ownerId ? [taskTeam.ownerId] : [];
      await handleDeleteTask(selectedTask.id, {
        taskTitle: selectedTask.title,
        teamId: selectedTask.teamId,
        teamName: taskTeam?.name || "",
        assignedTo: selectedTask.assignedTo || [],
        ownerIds,
        actorId: user.uid,
        actorName: user.displayName,
      });
      setShowDeleteModal(false);
      toast.success("Task berhasil dihapus.");
      setSelectedTask(null);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Gagal menghapus task.");
    } finally {
      setActionLoading(false);
    }
  };
 
  // Summary pill config per status
  const summaryConfig = {
    todo:       { label: "To Do",       pill: "bg-slate-100 text-slate-600 border-slate-200" },
    inprogress: { label: "In Progress", pill: "bg-amber-100 text-amber-700 border-amber-200" },
    inreview:   { label: "In Review",   pill: "bg-blue-100 text-blue-700 border-blue-200" },
    done:       { label: "Done",        pill: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  };
 
  if (teamsLoading || tasksLoading) {
    return (
      <DashboardLayout title="Kanban Board">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Memuat board...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
 
  return (
    <DashboardLayout
      title="Kanban Board"
      subtitle="Visualisasi dan kelola semua task tim kamu"
      actions={
        <div className="flex items-center gap-3">
          <TeamFilterDropdown
            teams={teams}
            selectedTeam={selectedTeam}
            onSelectTeam={setSelectedTeam}
          />
          {isAdmin && ownedTeams.length > 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-violet-200"
            >
              <Plus size={16} />
              Buat Task
            </button>
          )}
        </div>
      }
    >
      {/* ── Summary Bar ── */}
      <div className="flex flex-wrap items-center gap-2 mb-5 px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">
          Overview
        </span>
        <div className="w-px h-4 bg-gray-200 mr-1" />
        {columns.map((col) => {
          const count = filteredTasks.filter(
            (task) => task.status === col.status,
          ).length;
          const cfg = summaryConfig[col.status];
          return (
            <span
              key={col.id}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${cfg.pill}`}
            >
              <span className="font-extrabold text-sm leading-none">{count}</span>
              {cfg.label}
            </span>
          );
        })}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
          <span className="font-semibold text-gray-600">{filteredTasks.length}</span>
          total task{filteredTasks.length !== 1 ? "s" : ""}
          {selectedTeam && (
            <span className="ml-1 text-violet-500 font-medium">
              · {teams.find((t) => t.id === selectedTeam)?.name}
            </span>
          )}
        </div>
      </div>
 
      {/* ── Kanban Board ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {columns.map((column) => {
          const columnTasks = filteredTasks.filter(
            (task) => task.status === column.status,
          );
          return (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onTaskClick={onTaskClick}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTaskClick}
              isDragging={draggedTask !== null}
            />
          );
        })}
      </div>
 
      {/* ── Create Task Modal ── */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({
            title: "",
            description: "",
            teamId: "",
            assignedTo: [],
            deadline: null,
            deadlineReminder: 3,
          });
          setFormErrors({});
        }}
        title="Buat Task Baru"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Judul Task <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (formErrors.title)
                  setFormErrors((prev) => ({ ...prev, title: "" }));
              }}
              className={`w-full px-4 py-2.5 border rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-sm ${
                formErrors.title
                  ? "bg-red-50 border-red-400 focus:ring-red-100"
                  : "bg-gray-50 border-gray-200 focus:ring-violet-200 focus:border-violet-400 focus:bg-white"
              }`}
              placeholder="Contoh: Desain halaman login"
            />
            {formErrors.title && (
              <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
                <AlertCircle size={12} className="shrink-0" />
                {formErrors.title}
              </p>
            )}
          </div>
 
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Deskripsi <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (formErrors.description)
                  setFormErrors((prev) => ({ ...prev, description: "" }));
              }}
              rows={3}
              className={`w-full px-4 py-2.5 border rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none text-sm ${
                formErrors.description
                  ? "bg-red-50 border-red-400 focus:ring-red-100"
                  : "bg-gray-50 border-gray-200 focus:ring-violet-200 focus:border-violet-400 focus:bg-white"
              }`}
              placeholder="Jelaskan task ini secara singkat..."
            />
            {formErrors.description && (
              <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
                <AlertCircle size={12} className="shrink-0" />
                {formErrors.description}
              </p>
            )}
          </div>
 
          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Deadline <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={
                formData.deadline
                  ? new Date(formData.deadline).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => {
                setFormData({
                  ...formData,
                  deadline: e.target.value ? new Date(e.target.value) : null,
                });
                if (formErrors.deadline)
                  setFormErrors((prev) => ({ ...prev, deadline: "" }));
              }}
              min={new Date().toISOString().split("T")[0]}
              className={`w-full px-4 py-2.5 border rounded-xl text-gray-800 focus:outline-none focus:ring-2 transition-all text-sm ${
                formErrors.deadline
                  ? "bg-red-50 border-red-400 focus:ring-red-100"
                  : "bg-gray-50 border-gray-200 focus:ring-violet-200 focus:border-violet-400 focus:bg-white"
              }`}
            />
            {formErrors.deadline && (
              <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
                <AlertCircle size={12} className="shrink-0" />
                {formErrors.deadline}
              </p>
            )}
            {formData.deadline && (
              <div className="mt-2 flex items-center gap-2">
                <label className="text-xs text-gray-500">Ingatkan saya</label>
                <select
                  value={formData.deadlineReminder ?? 3}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deadlineReminder: parseInt(e.target.value),
                    })
                  }
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-violet-300"
                >
                  <option value={1}>1 hari sebelum</option>
                  <option value={2}>2 hari sebelum</option>
                  <option value={3}>3 hari sebelum</option>
                  <option value={5}>5 hari sebelum</option>
                  <option value={7}>7 hari sebelum</option>
                </select>
              </div>
            )}
          </div>
 
          {/* Team */}
          <CustomSelect
            options={teamOptions}
            value={formData.teamId}
            onChange={(value) =>
              setFormData({ ...formData, teamId: value, assignedTo: [] })
            }
            placeholder="Pilih tim"
            label="Tim"
            required
            searchable
          />
 
          {/* Assign To */}
          {selectedTeamForCreate?.members && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Ditugaskan kepada
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2 bg-gray-50">
                {selectedTeamForCreate.members
                  .filter((m) => m.role !== "admin" && m.role !== "super_admin")
                  .map((member) => (
                    <label
                      key={member.uid || member.id}
                      className="flex items-center gap-3 p-2.5 hover:bg-white rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.assignedTo.includes(member.uid || member.id)}
                        onChange={() => toggleAssignee(member.uid || member.id)}
                        className="w-4 h-4 accent-violet-500 rounded"
                      />
                      <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-700 text-xs font-bold shrink-0">
                        {member.displayName?.substring(0, 2).toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-800 font-medium text-sm truncate">
                          {member.displayName}
                        </div>
                        <div className="text-gray-400 text-xs truncate">
                          {member.email}
                        </div>
                      </div>
                    </label>
                  ))}
              </div>
            </div>
          )}
 
          {/* Submit */}
          <button
            onClick={async () => {
              if (!validateTaskForm()) return;
              await onCreateTask(formData);
              setFormData({
                title: "",
                description: "",
                teamId: "",
                assignedTo: [],
                deadline: null,
                deadlineReminder: 3,
              });
              setFormErrors({});
            }}
            disabled={actionLoading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl font-semibold text-sm transition-all shadow-sm shadow-violet-200 flex items-center justify-center gap-2"
          >
            {actionLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Membuat Task...
              </>
            ) : (
              <>
                <Plus size={16} />
                Buat Task
              </>
            )}
          </button>
        </div>
      </Modal>
 
      {/* ── Delete Task Modal ── */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        maxWidth="max-w-md"
        title={
          <>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle className="text-red-500" size={20} />
            </div>
            <span className="text-lg font-semibold text-gray-800">
              Hapus Task
            </span>
          </>
        }
      >
        <div className="mb-6">
          <p className="text-gray-600 text-center">
            Yakin ingin menghapus task{" "}
            <span className="font-semibold text-gray-800">
              "{selectedTask?.title}"
            </span>
            ?
          </p>
          <p className="text-gray-400 text-sm text-center mt-2">
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            disabled={actionLoading}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={confirmDelete}
            disabled={actionLoading}
            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {actionLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menghapus...
              </>
            ) : (
              "Hapus Task"
            )}
          </button>
        </div>
      </Modal>
 
      {/* ── Task Detail Modal (legacy, fallback) ── */}
      <Modal
        isOpen={showDetailModal && !!selectedTask}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTask(null);
          setIsEditMode(false);
        }}
        title="Detail Task"
        maxWidth="max-w-2xl"
      >
        {selectedTask && (
          <TaskDetailContent
            task={selectedTask}
            teams={teams}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedTask(null);
              setIsEditMode(false);
            }}
            onUpdate={handleUpdateTask}
            onUpdateStatus={async (taskId, newStatus) => {
              const taskTeam = teams.find((t) => t.id === selectedTask.teamId);
              const ownerIds = taskTeam?.ownerId ? [taskTeam.ownerId] : [];
              await handleUpdateTaskStatus(taskId, newStatus, {
                taskTitle: selectedTask.title,
                teamId: selectedTask.teamId,
                teamName: taskTeam?.name || "",
                assignedTo: selectedTask.assignedTo || [],
                ownerIds,
                actorId: user.uid,
                actorName: user.displayName,
              });
            }}
            onDelete={handleDeleteTask}
            canEdit={canEditTask(selectedTask)}
            loading={actionLoading}
            initialEditMode={isEditMode}
          />
        )}
      </Modal>
    </DashboardLayout>
  );
};
 
export default KanbanPage;