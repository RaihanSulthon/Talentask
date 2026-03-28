import { useState, useEffect } from "react";
import {
  Plus,
  Link2,
  FileText,
  File,
  Pencil,
  Trash2,
  ExternalLink,
  Search,
  FolderOpen,
  BookOpen,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import Modal from "../components/Modal";
import { useAuth } from "../contexts/AuthContext";
import { useRepositoryManagement } from "../hooks/useRepositoryManagement";
import { subscribeToUserTeams } from "../services/teamService";
 
const TYPE_CONFIG = {
  link: {
    icon: Link2,
    label: "Link",
    color: "bg-blue-100 text-blue-700",
    badge: "bg-blue-50 border-blue-200",
    barColor: "bg-blue-400",
  },
  document: {
    icon: FileText,
    label: "Dokumen",
    color: "bg-violet-100 text-violet-700",
    badge: "bg-violet-50 border-violet-200",
    barColor: "bg-violet-400",
  },
  file: {
    icon: File,
    label: "File",
    color: "bg-emerald-100 text-emerald-700",
    badge: "bg-emerald-50 border-emerald-200",
    barColor: "bg-emerald-400",
  },
};
 
// Team color palette (cycling)
const TEAM_COLORS = [
  { active: "bg-violet-600", soft: "bg-violet-50", text: "text-violet-700", border: "border-violet-300", count: "bg-violet-500" },
  { active: "bg-blue-600",   soft: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-300",   count: "bg-blue-500" },
  { active: "bg-emerald-600",soft: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-300",count: "bg-emerald-500" },
  { active: "bg-amber-600",  soft: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-300",  count: "bg-amber-500" },
  { active: "bg-pink-600",   soft: "bg-pink-50",   text: "text-pink-700",   border: "border-pink-300",   count: "bg-pink-500" },
];
 
const EMPTY_FORM = { title: "", type: "link", url: "", description: "" };
 
const RepositoryPage = () => {
  const { user, userRole } = useAuth();
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedTeamName, setSelectedTeamName] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
 
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
 
  const { items, loading, canManage, addItem, editItem, removeItem } =
    useRepositoryManagement(
      selectedTeamId,
      selectedTeamName,
      user,
      userRole,
      teams,
    );
 
  // Load teams
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserTeams(user.uid, userRole, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTeams(data);
      if (data.length > 0 && !selectedTeamId) {
        setSelectedTeamId(data[0].id);
        setSelectedTeamName(data[0].name);
      }
    });
    return () => unsub();
  }, [user, userRole]);
 
  const handleTeamChange = (teamId) => {
    const team = teams.find((t) => t.id === teamId);
    setSelectedTeamId(teamId);
    setSelectedTeamName(team?.name || "");
    setSearch("");
    setFilterType("all");
  };
 
  const filteredItems = items.filter((item) => {
    const matchSearch =
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || item.type === filterType;
    return matchSearch && matchType;
  });
 
  // Add
  const handleAdd = async () => {
    if (!form.title.trim() || !form.url.trim()) return;
    setSubmitting(true);
    const ok = await addItem(form);
    setSubmitting(false);
    if (ok) {
      setIsAddOpen(false);
      setForm(EMPTY_FORM);
    }
  };
 
  // Edit
  const openEdit = (item) => {
    setSelectedItem(item);
    setForm({
      title: item.title,
      type: item.type,
      url: item.url,
      description: item.description || "",
    });
    setIsEditOpen(true);
  };
  const handleEdit = async () => {
    if (!form.title.trim() || !form.url.trim()) return;
    setSubmitting(true);
    const ok = await editItem(selectedItem.id, form);
    setSubmitting(false);
    if (ok) {
      setIsEditOpen(false);
      setSelectedItem(null);
    }
  };
 
  // Delete
  const openDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };
  const handleDelete = async () => {
    setSubmitting(true);
    await removeItem(selectedItem.id);
    setSubmitting(false);
    setIsDeleteOpen(false);
    setSelectedItem(null);
  };
 
  const formatDate = (ts) => {
    if (!ts) return "-";
    const date = ts?.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
 
  // Reusable form body
  const FormContent = () => (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Judul <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Contoh: Design Figma Sprint 3"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent focus:bg-white bg-gray-50 transition-all"
        />
      </div>
 
      {/* Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Tipe Resource <span className="text-rose-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button
                key={key}
                onClick={() => setForm({ ...form, type: key })}
                className={`flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                  form.type === key
                    ? "border-violet-500 bg-violet-50 text-violet-700"
                    : "border-gray-200 text-gray-500 hover:border-violet-300 hover:bg-violet-50/50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    form.type === key ? "bg-violet-100" : "bg-gray-100"
                  }`}
                >
                  <Icon size={16} />
                </div>
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>
 
      {/* URL */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          URL / Link <span className="text-rose-400">*</span>
        </label>
        <input
          type="url"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          placeholder="https://..."
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent focus:bg-white bg-gray-50 transition-all"
        />
      </div>
 
      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Deskripsi{" "}
          <span className="text-gray-400 font-normal">(opsional)</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Keterangan singkat tentang resource ini..."
          rows={3}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent focus:bg-white bg-gray-50 transition-all resize-none"
        />
      </div>
    </div>
  );
 
  return (
    <DashboardLayout
      title="Repository"
      subtitle="Kelola resource dan referensi tim kamu"
      actions={
        canManage && selectedTeamId ? (
          <button
            onClick={() => {
              setForm(EMPTY_FORM);
              setIsAddOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-violet-200"
          >
            <Plus size={16} />
            Tambah Resource
          </button>
        ) : null
      }
    >
      {/* ── No teams state ── */}
      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <FolderOpen size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-semibold mb-1">
            Belum ada tim
          </p>
          <p className="text-gray-400 text-sm">
            Kamu belum bergabung ke tim manapun.
          </p>
        </div>
      ) : (
        <>
          {/* ── Team Tabs ── */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
            {teams.map((team, idx) => {
              const palette = TEAM_COLORS[idx % TEAM_COLORS.length];
              const isActive = selectedTeamId === team.id;
              return (
                <button
                  key={team.id}
                  onClick={() => handleTeamChange(team.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0 border ${
                    isActive
                      ? `${palette.active} text-white border-transparent shadow-md`
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {team.name}
                  {isActive && (
                    <span className="bg-white/25 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                      {items.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
 
          {/* ── Owner badge ── */}
          {canManage && (
            <div className="flex items-center gap-2 mb-5 text-xs text-violet-700 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2 w-fit">
              <Pencil size={12} />
              Kamu adalah owner tim ini — kamu dapat mengelola repository.
            </div>
          )}
 
          {/* ── Toolbar: search + filter ── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari resource berdasarkan judul..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition-all"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              {["all", "link", "document", "file"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    filterType === t
                      ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                      : "bg-white text-gray-500 border-gray-200 hover:border-violet-300 hover:bg-violet-50"
                  }`}
                >
                  {t === "all" ? "Semua" : TYPE_CONFIG[t]?.label}
                </button>
              ))}
            </div>
          </div>
 
          {/* ── Content ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-gray-400">Memuat resource...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                <FolderOpen size={28} className="text-gray-300" />
              </div>
              <p className="text-gray-600 font-semibold mb-1">
                {items.length === 0
                  ? "Repository masih kosong"
                  : "Tidak ada resource yang cocok"}
              </p>
              <p className="text-gray-400 text-sm mb-5">
                {items.length === 0
                  ? "Tambahkan resource pertama untuk tim ini."
                  : "Coba ubah kata kunci atau filter tipe."}
              </p>
              {canManage && items.length === 0 && (
                <button
                  onClick={() => {
                    setForm(EMPTY_FORM);
                    setIsAddOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
                >
                  <Plus size={15} />
                  Tambah Resource Pertama
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Item count info */}
              <p className="text-xs text-gray-400 mb-4">
                Menampilkan{" "}
                <span className="font-semibold text-gray-600">
                  {filteredItems.length}
                </span>{" "}
                dari {items.length} resource
              </p>
 
              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredItems.map((item) => {
                  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.file;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={item.id}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200 overflow-hidden flex flex-col"
                    >
                      {/* Color accent bar */}
                      <div className={`h-1 w-full ${cfg.barColor}`} />
 
                      <div className="p-5 flex flex-col gap-3 flex-1">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`p-2 rounded-lg shrink-0 ${cfg.color}`}
                            >
                              <Icon size={15} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-800 text-sm truncate">
                                {item.title}
                              </p>
                              <span
                                className={`inline-block text-xs px-2 py-0.5 rounded-full border mt-0.5 font-medium ${cfg.badge} ${cfg.color}`}
                              >
                                {cfg.label}
                              </span>
                            </div>
                          </div>
 
                          {/* Edit/Delete actions — visible on hover */}
                          {canManage && (
                            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEdit(item)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                                title="Edit resource"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => openDelete(item)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Hapus resource"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </div>
 
                        {/* Description */}
                        {item.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
 
                        {/* Footer */}
                        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
                          <div className="text-xs text-gray-400 truncate">
                            <span className="font-medium text-gray-500">
                              {item.createdByName}
                            </span>
                            <span className="mx-1 text-gray-300">·</span>
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 shrink-0 transition-colors"
                          >
                            Buka
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
 
      {/* ── Modal: Tambah Resource ── */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setForm(EMPTY_FORM);
        }}
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <Plus size={16} className="text-violet-600" />
            </div>
            <span>Tambah Resource</span>
          </div>
        }
      >
        <FormContent />
        <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
          <button
            onClick={() => {
              setIsAddOpen(false);
              setForm(EMPTY_FORM);
            }}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleAdd}
            disabled={submitting || !form.title.trim() || !form.url.trim()}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Menyimpan..." : "Simpan Resource"}
          </button>
        </div>
      </Modal>
 
      {/* ── Modal: Edit Resource ── */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedItem(null);
        }}
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <Pencil size={14} className="text-violet-600" />
            </div>
            <span>Edit Resource</span>
          </div>
        }
      >
        <FormContent />
        <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
          <button
            onClick={() => {
              setIsEditOpen(false);
              setSelectedItem(null);
            }}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleEdit}
            disabled={submitting || !form.title.trim() || !form.url.trim()}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Menyimpan..." : "Update Resource"}
          </button>
        </div>
      </Modal>
 
      {/* ── Modal: Hapus Resource ── */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedItem(null);
        }}
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 size={14} className="text-red-600" />
            </div>
            <span className="text-gray-800">Hapus Resource</span>
          </div>
        }
        maxWidth="max-w-sm"
      >
        <p className="text-sm text-gray-600 mb-1">
          Yakin ingin menghapus{" "}
          <span className="font-semibold text-gray-800">
            "{selectedItem?.title}"
          </span>
          ?
        </p>
        <p className="text-xs text-gray-400 mb-5">
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsDeleteOpen(false);
              setSelectedItem(null);
            }}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
 
export default RepositoryPage;