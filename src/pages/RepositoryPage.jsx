import { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Link2,
  FileText,
  File,
  Pencil,
  Trash2,
  ExternalLink,
  Search,
  FolderOpen,
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
  },
  document: {
    icon: FileText,
    label: "Document",
    color: "bg-violet-100 text-violet-700",
    badge: "bg-violet-50 border-violet-200",
  },
  file: {
    icon: File,
    label: "File",
    color: "bg-emerald-100 text-emerald-700",
    badge: "bg-emerald-50 border-emerald-200",
  },
};

const EMPTY_FORM = { title: "", type: "link", url: "", description: "" };

const RepositoryPage = () => {
  const { user, userRole } = useAuth();
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedTeamName, setSelectedTeamName] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Modals
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

  // Load teams user belongs to
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

  const FormContent = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Judul *
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Contoh: Design Figma Sprint 3"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Tipe *
        </label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button
                key={key}
                onClick={() => setForm({ ...form, type: key })}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all ${
                  form.type === key
                    ? "border-violet-500 bg-violet-50 text-violet-700"
                    : "border-gray-200 text-gray-500 hover:border-violet-300 hover:bg-violet-50"
                }`}>
                <Icon size={18} />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          URL / Link *
        </label>
        <input
          type="url"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          placeholder="https://..."
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Deskripsi
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Keterangan singkat tentang resource ini..."
          rows={3}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
        />
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <BookOpen size={20} className="text-violet-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Repository</h1>
              <p className="text-sm text-gray-500">
                Kelola resource dan referensi tim
              </p>
            </div>
          </div>
          {canManage && (
            <button
              onClick={() => {
                setForm(EMPTY_FORM);
                setIsAddOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors shadow-sm">
              <Plus size={16} />
              Tambah Resource
            </button>
          )}
        </div>

        {/* Team Selector */}
        {teams.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <FolderOpen size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              Kamu belum bergabung ke tim manapun.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-5">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleTeamChange(team.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    selectedTeamId === team.id
                      ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-violet-400 hover:text-violet-600"
                  }`}>
                  {team.name}
                </button>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari resource..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                />
              </div>
              <div className="flex gap-2">
                {["all", "link", "document", "file"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all capitalize ${
                      filterType === t
                        ? "bg-violet-600 text-white border-violet-600"
                        : "bg-white text-gray-500 border-gray-200 hover:border-violet-300"
                    }`}>
                    {t === "all" ? "Semua" : TYPE_CONFIG[t]?.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Owner info badge */}
            {canManage && (
              <div className="flex items-center gap-2 mb-4 text-xs text-violet-600 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2 w-fit">
                <Pencil size={12} />
                Kamu adalah owner team ini — kamu dapat mengelola repository.
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <FolderOpen size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  {items.length === 0
                    ? "Belum ada resource di repository ini."
                    : "Tidak ada resource yang cocok dengan filter."}
                </p>
                {canManage && items.length === 0 && (
                  <button
                    onClick={() => {
                      setForm(EMPTY_FORM);
                      setIsAddOpen(true);
                    }}
                    className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700">
                    Tambah Resource Pertama
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredItems.map((item) => {
                  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.file;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all p-5 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`p-2 rounded-lg shrink-0 ${cfg.color}`}>
                            <Icon size={15} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">
                              {item.title}
                            </p>
                            <span
                              className={`inline-block text-xs px-2 py-0.5 rounded-full border mt-0.5 ${cfg.badge} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </div>
                        </div>
                        {canManage && (
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => openEdit(item)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors">
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => openDelete(item)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between gap-2">
                        <div className="text-xs text-gray-400 truncate">
                          <span>{item.createdByName}</span>
                          <span className="mx-1">·</span>
                          <span>{formatDate(item.createdAt)}</span>
                        </div>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-800 shrink-0">
                          Buka <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Add */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Tambah Resource">
        <FormContent />
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={() => setIsAddOpen(false)}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
            Batal
          </button>
          <button
            onClick={handleAdd}
            disabled={submitting || !form.title.trim() || !form.url.trim()}
            className="px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </Modal>

      {/* Modal Edit */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Resource">
        <FormContent />
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={() => setIsEditOpen(false)}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
            Batal
          </button>
          <button
            onClick={handleEdit}
            disabled={submitting || !form.title.trim() || !form.url.trim()}
            className="px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? "Menyimpan..." : "Update"}
          </button>
        </div>
      </Modal>

      {/* Modal Delete */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Resource">
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
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setIsDeleteOpen(false)}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50">
            {submitting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default RepositoryPage;
