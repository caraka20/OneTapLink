"use client";

import { useEffect, useState } from "react";
import { api, apiFetch } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EditGroupModal from "@/components/EditGroupModal";
import { showSuccess, showError, showConfirm } from "@/lib/alert";
import { useAuth } from "@/lib/useAuth";
import { Pencil, Trash2, Plus } from "lucide-react";

type Group = {
  id: number;
  nama: string;
  link: string;
  jenis: string;
  status: string;
};

export default function AdminPage() {
  const { loading: authLoading } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [jenisTabs, setJenisTabs] = useState<string[]>([]);
  const [activeJenis, setActiveJenis] = useState("Semua");
  const [loading, setLoading] = useState(true);

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token")!;
      const res = await apiFetch<Group[]>("/groups", {}, token);

      // sort ASC
      const sorted = res.sort((a, b) => a.nama.localeCompare(b.nama));
      setGroups(sorted);

      const jenisUnique = Array.from(new Set(sorted.map((g) => g.jenis))).sort();
      setJenisTabs(["Semua", ...jenisUnique]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchGroups();
  }, [authLoading]);

  if (authLoading) return <p className="text-center text-gray-500">Cek login...</p>;
  if (loading) return <p className="text-center text-gray-500">Loading data...</p>;

  const filteredGroups =
    activeJenis === "Semua"
      ? groups
      : groups.filter((g) => g.jenis === activeJenis).sort((a, b) => a.nama.localeCompare(b.nama));

  return (
    <div className="min-h-screen bg-gradient-to-br p-4 from-slate-100 via-white to-slate-200">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <header className="text-center relative py-6">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-100 rounded-b-3xl"></div>

          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
              <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard Admin Grup UT
              </h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base">
              Kelola & pantau semua grup WhatsApp Mahasiswa UT dengan mudah ✨
            </p>
          </div>

          {/* Statistik ringkas */}
          <div className="mt-5 grid grid-cols-3 gap-3 max-w-md mx-auto text-center">
            <div className="bg-white shadow rounded-lg p-3">
              <p className="font-bold text-indigo-600 text-lg sm:text-xl">{groups.length}</p>
              <p className="text-gray-500 text-xs sm:text-sm">Total Grup</p>
            </div>
            <div className="bg-white shadow rounded-lg p-3">
              <p className="font-bold text-green-600 text-lg sm:text-xl">
                {groups.filter((g) => g.status === "AKTIF").length}
              </p>
              <p className="text-gray-500 text-xs sm:text-sm">Aktif</p>
            </div>
            <div className="bg-white shadow rounded-lg p-3">
              <p className="font-bold text-red-600 text-lg sm:text-xl">
                {groups.filter((g) => g.status === "NONAKTIF").length}
              </p>
              <p className="text-gray-500 text-xs sm:text-sm">Nonaktif</p>
            </div>
          </div>
        </header>

        {/* Floating Button (Tambah Grup) */}
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            size="icon"
            className="rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 h-12 w-12 sm:h-14 sm:w-14"
            onClick={() => {
              setModalMode("create");
              setSelectedGroup(null);
            }}
          >
            <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </Button>
        </div>

        {/* Filter Buttons → 2 kolom */}
        <div className="bg-white shadow rounded-lg">
          <div className="grid grid-cols-2 gap-2 p-2 sm:p-3">
            {jenisTabs.map((j) => (
              <Button
                key={j}
                onClick={() => setActiveJenis(j)}
                className={`w-full px-4 py-3 text-sm sm:text-base rounded-xl font-medium transition-all ${
                  activeJenis === j
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-slate-100 text-gray-700 hover:bg-slate-200"
                }`}
              >
                {j}
                <span className="ml-1 text-xs opacity-70">
                  (
                  {j === "Semua"
                    ? groups.length
                    : groups.filter((g) => g.jenis === j).length}
                  )
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Daftar Grup */}
        <div className="space-y-2 mt-4">
          {filteredGroups.length === 0 ? (
            <p className="text-center text-gray-400 italic text-sm sm:text-base">
              Belum ada grup untuk kategori{" "}
              <span className="font-semibold">{activeJenis}</span>.
            </p>
          ) : (
            filteredGroups.map((g, i) => (
              <Card
                key={g.id}
                className="w-full border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <CardContent className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-gray-400 text-xs sm:text-sm">{i + 1}.</span>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        g.status === "AKTIF" ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <a
                      href={g.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline font-medium text-gray-800 text-sm sm:text-base truncate"
                    >
                      {g.nama}
                    </a>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                      onClick={() => {
                        setModalMode("edit");
                        setSelectedGroup(g);
                      }}
                    >
                      <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                      onClick={async () => {
                        const result = await showConfirm(`Hapus grup "${g.nama}"?`);
                        if (result.isConfirmed) {
                          try {
                            const token = localStorage.getItem("token")!;
                            await api.delete(`/groups/${g.id}`, token);
                            showSuccess("✅ Grup berhasil dihapus");
                            fetchGroups();
                          } catch (err: unknown) {
                            if (err instanceof Error) {
                              showError(err.message || "Gagal menghapus grup");
                            } else {
                              showError("Gagal menghapus grup");
                            }
                          }
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Modal Edit / Tambah */}
        {modalMode && (
          <EditGroupModal
            mode={modalMode}
            group={selectedGroup || undefined}
            onClose={() => {
              setModalMode(null);
              setSelectedGroup(null);
            }}
            onSaved={fetchGroups}
          />
        )}
      </div>
    </div>
  );
}
