import { useState, useEffect } from "react";
import {
  subscribeToTeamRepository,
  addRepositoryItem,
  updateRepositoryItem,
  deleteRepositoryItem,
} from "../services/repositoryService";
import { useToast } from "../components/Toast";

export const useRepositoryManagement = (selectedTeamId, selectedTeamName, user, userRole, teams) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!selectedTeamId) {
      setItems([]);
      return;
    }
    setLoading(true);
    const unsub = subscribeToTeamRepository(selectedTeamId, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort by createdAt desc
      data.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return bTime - aTime;
      });
      setItems(data);
      setLoading(false);
    });
    return () => unsub();
  }, [selectedTeamId]);

  const isOwnerOfTeam = (teamId) => {
    const team = teams.find((t) => t.id === teamId);
    return team?.ownerId === user?.uid;
  };

  const canManage = isOwnerOfTeam(selectedTeamId);

  const addItem = async (data) => {
    try {
      await addRepositoryItem(
        selectedTeamId,
        selectedTeamName,
        user.uid,
        user.displayName || user.email,
        data
      );
      showToast("Item berhasil ditambahkan!", "success");
      return true;
    } catch (err) {
      showToast("Gagal menambahkan item.", "error");
      return false;
    }
  };

  const editItem = async (itemId, data) => {
    try {
      await updateRepositoryItem(itemId, data);
      showToast("Item berhasil diupdate!", "success");
      return true;
    } catch (err) {
      showToast("Gagal mengupdate item.", "error");
      return false;
    }
  };

  const removeItem = async (itemId) => {
    try {
      await deleteRepositoryItem(itemId);
      showToast("Item berhasil dihapus.", "success");
      return true;
    } catch (err) {
      showToast("Gagal menghapus item.", "error");
      return false;
    }
  };

  return { items, loading, canManage, addItem, editItem, removeItem };
};